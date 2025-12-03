import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'
import { workoutTemplates } from '@/lib/templates'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', session.user.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching workouts:', error)
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { templateId } = await req.json()

  const template = workoutTemplates.find((t) => t.id === templateId)
  if (!template) {
    return NextResponse.json({ error: 'Invalid template' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Create workout
  const { data: workout, error: workoutError } = await supabase
    .from('workouts')
    .insert({
      user_id: session.user.id,
      name: template.name,
      tag: template.tag,
      date: new Date().toISOString().split('T')[0],
    })
    .select()
    .single()

  if (workoutError) {
    console.error('Error creating workout:', workoutError)
    return NextResponse.json({ error: 'Failed to create workout' }, { status: 500 })
  }

  // Create exercises from template
  if (template.exercises.length > 0) {
    const exercisesToInsert = template.exercises.map((exercise, index) => ({
      workout_id: workout.id,
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight,
      order: index,
    }))

    const { error: exercisesError } = await supabase
      .from('exercises')
      .insert(exercisesToInsert)

    if (exercisesError) {
      console.error('Error creating exercises:', exercisesError)
      // Don't fail the whole request, workout was created
    }
  }

  return NextResponse.json(workout)
}
