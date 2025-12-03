import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'
import { Exercise, Workout, ExerciseUnit } from '@/types/database'

export const dynamic = 'force-dynamic'

interface AIAction {
  type: 'add' | 'update' | 'delete' | 'note' | 'rename' | 'set_workout'
  exercise?: string
  sets?: number | null
  reps?: number | null
  weight?: number | null
  unit?: ExerciseUnit
  content?: string
  newName?: string
  workoutName?: string
  workoutTag?: string
}

interface AIResponse {
  actions: AIAction[]
  response: string
}

const SYSTEM_PROMPT = `You are a fitness tracking assistant. Your job is to parse natural language workout commands and convert them into structured actions.

The user is logging their workout. They will tell you what exercises they did, including weight training (sets, reps, weight) and cardio (duration, distance).

You must respond with valid JSON in this exact format:
{
  "actions": [
    {"type": "set_workout", "workoutName": "Morning Run", "workoutTag": "Cardio"},
    {"type": "add", "exercise": "Bench Press", "sets": 3, "reps": 8, "weight": 135, "unit": "lbs"},
    {"type": "add", "exercise": "Walking", "weight": 20, "unit": "min", "sets": null, "reps": null},
    {"type": "add", "exercise": "Running", "weight": 2.5, "unit": "miles", "sets": null, "reps": null},
    {"type": "update", "exercise": "Rows", "sets": 4},
    {"type": "delete", "exercise": "Dumbbell curls"},
    {"type": "note", "content": "Felt strong today"}
  ],
  "response": "A brief, friendly confirmation of what you did"
}

Action types:
- "set_workout": Set the workout name and/or tag. Use this FIRST when the workout name is "Custom" and no exercises exist yet. Infer an appropriate name and tag from what the user is logging.
- "add": Add a new exercise. For weight training: include sets, reps, weight, unit (lbs/kg). For cardio: include weight (the value), unit (min/sec/miles/km/cal), sets and reps should be null.
- "update": Update an existing exercise (only include fields that are changing)
- "delete": Remove an exercise from the workout
- "note": Add a note to the workout

Units available:
- Weight training: "lbs" (pounds), "kg" (kilograms), "bodyweight" (for exercises like pull-ups)
- Cardio/Duration: "min" (minutes), "sec" (seconds)
- Distance: "miles", "km" (kilometers)
- Calories: "cal"

Tags available: "Lifting", "Cardio", "HIIT", "Yoga", "Sports", "Other"

IMPORTANT - Custom Workout Handling:
When the workout name is "Custom" AND there are no exercises yet, you MUST:
1. Include a "set_workout" action FIRST to give it an appropriate name and tag
2. Infer the workout type from what the user says:
   - Running/walking/cycling/swimming → name like "Morning Run", "Cardio Session", tag: "Cardio"
   - Weights/lifting → name like "Upper Body", "Leg Day", "Full Body", tag: "Lifting"
   - Mixed activities → name like "Mixed Training", appropriate tag
3. Then add the exercises as normal

Rules:
1. Parse common workout notation like "3x8" (3 sets of 8 reps), "3 sets of 8", etc.
2. For cardio activities (walking, running, cycling, swimming, etc.), use appropriate units:
   - "walked 20 min" → weight: 20, unit: "min", sets: null, reps: null
   - "ran 2 miles" → weight: 2, unit: "miles", sets: null, reps: null
   - "ran 2.5 miles" → weight: 2.5, unit: "miles", sets: null, reps: null
   - "biked for 30 minutes" → weight: 30, unit: "min", sets: null, reps: null
3. Default to "lbs" for weight training if no unit specified
4. For updates, match the exercise name flexibly (e.g., "bench" should match "Bench press")
5. If user says they "skipped" an exercise, delete it
6. Keep responses brief and gym-friendly
7. If you can't understand the request, still return valid JSON with an empty actions array and helpful response
8. Always maintain proper JSON format with double quotes

Current workout info and exercises will be provided for context.`

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'AI service not configured. Please add ANTHROPIC_API_KEY.' },
      { status: 500 }
    )
  }

  try {
    const { message, workoutId, exercises, workout } = await req.json()

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    // Build context about current exercises
    const formatExercise = (e: Exercise) => {
      const unit = e.unit || 'lbs'
      const isCardio = ['min', 'sec', 'miles', 'km', 'cal'].includes(unit)

      if (isCardio) {
        return `- ${e.name}: ${e.weight ?? '-'} ${unit}`
      }
      return `- ${e.name}: ${e.sets ?? '-'} sets x ${e.reps ?? '-'} reps${e.weight ? ` @ ${e.weight} ${unit}` : ''}`
    }

    const exerciseContext =
      exercises.length > 0
        ? `Current exercises in this workout:\n${exercises.map(formatExercise).join('\n')}`
        : 'No exercises in this workout yet.'

    const isCustomEmpty = workout.name === 'Custom' && exercises.length === 0
    const workoutContext = `Workout name: "${workout.name}" | Tag: "${workout.tag}"${isCustomEmpty ? '\n\n⚠️ This is a new Custom workout with no exercises. You MUST use set_workout action to give it a proper name and tag based on what the user is logging.' : ''}`

    // Call Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `${workoutContext}\n\n${exerciseContext}\n\nUser says: "${message}"`,
        },
      ],
    })

    // Extract the text response
    const textContent = response.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ error: 'Invalid AI response' }, { status: 500 })
    }

    // Parse the JSON response
    let aiResponse: AIResponse
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      aiResponse = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('Error parsing AI response:', textContent.text)
      return NextResponse.json({
        response: "I had trouble understanding that. Could you rephrase it?",
        exercises,
        workout,
      })
    }

    // Apply actions to the database
    const supabase = createServerClient()
    let updatedExercises = [...exercises]
    let updatedWorkout = workout

    for (const action of aiResponse.actions) {
      if (action.type === 'add' && action.exercise) {
        // Determine if cardio based on unit
        const unit = action.unit || 'lbs'
        const isCardio = ['min', 'sec', 'miles', 'km', 'cal'].includes(unit)

        // Add new exercise
        const { data, error } = await supabase
          .from('exercises')
          .insert({
            workout_id: workoutId,
            name: action.exercise,
            sets: isCardio ? null : (action.sets ?? 3),
            reps: isCardio ? null : (action.reps ?? 8),
            weight: action.weight ?? null,
            unit: unit,
            order: updatedExercises.length,
          })
          .select()
          .single()

        if (error) {
          console.error('Error adding exercise:', error, { action })
        } else if (data) {
          updatedExercises.push(data)
        }
      } else if (action.type === 'update' && action.exercise) {
        // Find matching exercise (flexible matching)
        const searchName = action.exercise.toLowerCase()
        const matchingExercise = updatedExercises.find((e) =>
          e.name.toLowerCase().includes(searchName) ||
          searchName.includes(e.name.toLowerCase())
        )

        if (matchingExercise) {
          const updates: Partial<Exercise> = {}
          if (action.sets !== undefined) updates.sets = action.sets
          if (action.reps !== undefined) updates.reps = action.reps
          if (action.weight !== undefined) updates.weight = action.weight
          if (action.unit !== undefined) updates.unit = action.unit

          const { data, error } = await supabase
            .from('exercises')
            .update(updates)
            .eq('id', matchingExercise.id)
            .select()
            .single()

          if (!error && data) {
            updatedExercises = updatedExercises.map((e) =>
              e.id === matchingExercise.id ? data : e
            )
          }
        }
      } else if (action.type === 'delete' && action.exercise) {
        // Find matching exercise (flexible matching)
        const searchName = action.exercise.toLowerCase()
        const matchingExercise = updatedExercises.find((e) =>
          e.name.toLowerCase().includes(searchName) ||
          searchName.includes(e.name.toLowerCase())
        )

        if (matchingExercise) {
          await supabase.from('exercises').delete().eq('id', matchingExercise.id)
          updatedExercises = updatedExercises.filter((e) => e.id !== matchingExercise.id)
        }
      } else if (action.type === 'note' && action.content) {
        // Add note to workout
        const newNotes = workout.notes
          ? `${workout.notes}\n${action.content}`
          : action.content

        const { data, error } = await supabase
          .from('workouts')
          .update({ notes: newNotes })
          .eq('id', workoutId)
          .select()
          .single()

        if (!error && data) {
          updatedWorkout = data
        }
      } else if (action.type === 'rename' && action.newName) {
        // Rename the workout
        const { data, error } = await supabase
          .from('workouts')
          .update({ name: action.newName })
          .eq('id', workoutId)
          .select()
          .single()

        if (!error && data) {
          updatedWorkout = data
        }
      } else if (action.type === 'set_workout') {
        // Set workout name and/or tag
        const updates: Partial<Workout> = {}
        if (action.workoutName) updates.name = action.workoutName
        if (action.workoutTag) updates.tag = action.workoutTag

        if (Object.keys(updates).length > 0) {
          const { data, error } = await supabase
            .from('workouts')
            .update(updates)
            .eq('id', workoutId)
            .select()
            .single()

          if (!error && data) {
            updatedWorkout = data
          }
        }
      }
    }

    return NextResponse.json({
      response: aiResponse.response,
      exercises: updatedExercises,
      workout: updatedWorkout,
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Failed to process your message' },
      { status: 500 }
    )
  }
}
