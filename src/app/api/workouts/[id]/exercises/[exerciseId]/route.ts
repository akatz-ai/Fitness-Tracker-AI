import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; exerciseId: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: workoutId, exerciseId } = await params
  const updates = await req.json()
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

  // Only allow updating certain fields
  const allowedFields = ['name', 'sets', 'reps', 'weight', 'order']
  const sanitizedUpdates: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (field in updates) {
      sanitizedUpdates[field] = updates[field]
    }
  }

  const { data, error } = await supabase
    .from('exercises')
    .update(sanitizedUpdates)
    .eq('id', exerciseId)
    .eq('workout_id', workoutId)
    .select()
    .single()

  if (error) {
    console.error('Error updating exercise:', error)
    return NextResponse.json({ error: 'Failed to update exercise' }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; exerciseId: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: workoutId, exerciseId } = await params
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

  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', exerciseId)
    .eq('workout_id', workoutId)

  if (error) {
    console.error('Error deleting exercise:', error)
    return NextResponse.json({ error: 'Failed to delete exercise' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
