import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: workoutId } = await params
  const supabase = createServerClient()

  // First verify the workout belongs to the user
  const { data: workout } = await supabase
    .from('workouts')
    .select('id')
    .eq('id', workoutId)
    .eq('user_id', session.user.id)
    .single()

  if (!workout) {
    return NextResponse.json({ error: 'Workout not found' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('workout_id', workoutId)
    .order('order', { ascending: true })

  if (error) {
    console.error('Error fetching exercises:', error)
    return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: workoutId } = await params
  const { name, sets, reps, weight, order } = await req.json()
  const supabase = createServerClient()

  // First verify the workout belongs to the user
  const { data: workout } = await supabase
    .from('workouts')
    .select('id')
    .eq('id', workoutId)
    .eq('user_id', session.user.id)
    .single()

  if (!workout) {
    return NextResponse.json({ error: 'Workout not found' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('exercises')
    .insert({
      workout_id: workoutId,
      name,
      sets,
      reps,
      weight,
      order: order ?? 0,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating exercise:', error)
    return NextResponse.json({ error: 'Failed to create exercise' }, { status: 500 })
  }

  return NextResponse.json(data)
}
