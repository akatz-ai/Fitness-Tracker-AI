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

  const { id } = await params
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 })
    }
    console.error('Error fetching workout:', error)
    return NextResponse.json({ error: 'Failed to fetch workout' }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const updates = await req.json()
  const supabase = createServerClient()

  // Only allow updating certain fields
  const allowedFields = ['name', 'tag', 'date', 'notes']
  const sanitizedUpdates: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (field in updates) {
      sanitizedUpdates[field] = updates[field]
    }
  }

  const { data, error } = await supabase
    .from('workouts')
    .update(sanitizedUpdates)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating workout:', error)
    return NextResponse.json({ error: 'Failed to update workout' }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = createServerClient()

  // Delete exercises first (cascade not automatic in Supabase by default)
  await supabase.from('exercises').delete().eq('workout_id', id)

  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id)

  if (error) {
    console.error('Error deleting workout:', error)
    return NextResponse.json({ error: 'Failed to delete workout' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
