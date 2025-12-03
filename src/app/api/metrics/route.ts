import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'
import { FitnessMetrics } from '@/types/database'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()

  // Get workouts from the last 14 days
  const twoWeeksAgo = new Date()
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
  const twoWeeksAgoStr = twoWeeksAgo.toISOString().split('T')[0]

  const { data: workouts, error: workoutsError } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', session.user.id)
    .gte('date', twoWeeksAgoStr)
    .order('date', { ascending: true })

  if (workoutsError) {
    console.error('Error fetching workouts:', workoutsError)
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }

  if (!workouts || workouts.length === 0) {
    return NextResponse.json(null)
  }

  // Get all exercises for these workouts
  const workoutIds = workouts.map((w) => w.id)
  const { data: exercises, error: exercisesError } = await supabase
    .from('exercises')
    .select('*')
    .in('workout_id', workoutIds)

  if (exercisesError) {
    console.error('Error fetching exercises:', exercisesError)
  }

  const exercisesByWorkout = (exercises || []).reduce((acc, ex) => {
    if (!acc[ex.workout_id]) acc[ex.workout_id] = []
    acc[ex.workout_id].push(ex)
    return acc
  }, {} as Record<string, typeof exercises>)

  // Calculate metrics
  const today = new Date()
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  // Split workouts into this week and last week
  const thisWeekWorkouts = workouts.filter((w) => new Date(w.date) >= oneWeekAgo)
  const lastWeekWorkouts = workouts.filter(
    (w) => new Date(w.date) < oneWeekAgo && new Date(w.date) >= twoWeeksAgo
  )

  // Calculate volume (sets × reps × weight) for each period
  const calculateVolume = (workoutList: typeof workouts) => {
    let volume = 0
    for (const workout of workoutList) {
      const exs = exercisesByWorkout[workout.id] || []
      for (const ex of exs) {
        // Only count weight-based exercises
        if (ex.weight && ex.sets && ex.reps && (!ex.unit || ex.unit === 'lbs' || ex.unit === 'kg')) {
          const weightInLbs = ex.unit === 'kg' ? ex.weight * 2.2 : ex.weight
          volume += ex.sets * ex.reps * weightInLbs
        }
      }
    }
    return Math.round(volume)
  }

  const thisWeekVolume = calculateVolume(thisWeekWorkouts)
  const lastWeekVolume = calculateVolume(lastWeekWorkouts)

  // Calculate scores (composite of consistency + volume progress)
  const calculateScore = (workoutCount: number, volume: number, maxVolume: number) => {
    // Consistency score (0-50): based on workouts per week (target: 4-5)
    const consistencyScore = Math.min(workoutCount * 12.5, 50)

    // Volume score (0-50): based on relative volume
    const volumeScore = maxVolume > 0 ? (volume / maxVolume) * 50 : 0

    return Math.round(consistencyScore + volumeScore)
  }

  const maxVolume = Math.max(thisWeekVolume, lastWeekVolume, 1)
  const currentScore = calculateScore(thisWeekWorkouts.length, thisWeekVolume, maxVolume)
  const previousScore = calculateScore(lastWeekWorkouts.length, lastWeekVolume, maxVolume)

  // Calculate streak
  let streak = 0
  const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (sortedWorkouts.length > 0) {
    const todayStr = today.toISOString().split('T')[0]
    const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().split('T')[0]

    // Check if most recent workout is today or yesterday
    const mostRecentDate = sortedWorkouts[0].date
    if (mostRecentDate === todayStr || mostRecentDate === yesterdayStr) {
      // Count consecutive days with workouts
      const workoutDates = new Set(sortedWorkouts.map((w) => w.date))
      let checkDate = new Date(mostRecentDate)

      while (workoutDates.has(checkDate.toISOString().split('T')[0])) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      }
    }
  }

  // Build weekly data (last 7 days)
  const weeklyData: FitnessMetrics['weeklyData'] = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    const dayWorkouts = workouts.filter((w) => w.date === dateStr)
    let dayVolume = 0

    for (const workout of dayWorkouts) {
      const exs = exercisesByWorkout[workout.id] || []
      for (const ex of exs) {
        if (ex.weight && ex.sets && ex.reps && (!ex.unit || ex.unit === 'lbs' || ex.unit === 'kg')) {
          const weightInLbs = ex.unit === 'kg' ? ex.weight * 2.2 : ex.weight
          dayVolume += ex.sets * ex.reps * weightInLbs
        }
      }
    }

    // Calculate day score based on activity
    const dayScore = dayWorkouts.length > 0
      ? Math.min(30 + dayVolume / 100, 100)
      : 0

    weeklyData.push({
      date: dateStr,
      score: Math.round(dayScore),
      workouts: dayWorkouts.length,
    })
  }

  // Determine trend
  let trend: 'up' | 'down' | 'stable' = 'stable'
  if (currentScore > previousScore + 5) {
    trend = 'up'
  } else if (currentScore < previousScore - 5) {
    trend = 'down'
  }

  const metrics: FitnessMetrics = {
    currentScore,
    previousScore,
    weeklyWorkouts: thisWeekWorkouts.length,
    streak,
    totalVolume: thisWeekVolume,
    trend,
    weeklyData,
  }

  return NextResponse.json(metrics)
}
