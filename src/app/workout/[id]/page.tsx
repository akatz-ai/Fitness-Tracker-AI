'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Workout, Exercise } from '@/types/database'
import { ExerciseTable } from '@/components/ExerciseTable'
import { ChatBar } from '@/components/ChatBar'
import { WorkoutHeader } from '@/components/WorkoutHeader'

export default function WorkoutDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const workoutId = params.id as string

  const [workout, setWorkout] = useState<Workout | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const fetchWorkoutData = useCallback(async () => {
    try {
      const [workoutRes, exercisesRes] = await Promise.all([
        fetch(`/api/workouts/${workoutId}`),
        fetch(`/api/workouts/${workoutId}/exercises`),
      ])

      if (workoutRes.ok && exercisesRes.ok) {
        const workoutData = await workoutRes.json()
        const exercisesData = await exercisesRes.json()
        setWorkout(workoutData)
        setExercises(exercisesData)
      } else if (workoutRes.status === 404) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching workout:', error)
    } finally {
      setLoading(false)
    }
  }, [workoutId, router])

  useEffect(() => {
    if (session?.user?.id && workoutId) {
      fetchWorkoutData()
    }
  }, [session, workoutId, fetchWorkoutData])

  const handleWorkoutUpdate = async (updates: Partial<Workout>) => {
    if (!workout) return

    try {
      const res = await fetch(`/api/workouts/${workoutId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (res.ok) {
        const updatedWorkout = await res.json()
        setWorkout(updatedWorkout)
      }
    } catch (error) {
      console.error('Error updating workout:', error)
    }
  }

  const handleExerciseAdd = async (exercise: Omit<Exercise, 'id' | 'workout_id' | 'created_at'>) => {
    try {
      const res = await fetch(`/api/workouts/${workoutId}/exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exercise),
      })

      if (res.ok) {
        const newExercise = await res.json()
        setExercises((prev) => [...prev, newExercise])
      }
    } catch (error) {
      console.error('Error adding exercise:', error)
    }
  }

  const handleExerciseUpdate = async (exerciseId: string, updates: Partial<Exercise>) => {
    try {
      const res = await fetch(`/api/workouts/${workoutId}/exercises/${exerciseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (res.ok) {
        const updatedExercise = await res.json()
        setExercises((prev) =>
          prev.map((e) => (e.id === exerciseId ? updatedExercise : e))
        )
      }
    } catch (error) {
      console.error('Error updating exercise:', error)
    }
  }

  const handleExerciseDelete = async (exerciseId: string) => {
    try {
      const res = await fetch(`/api/workouts/${workoutId}/exercises/${exerciseId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setExercises((prev) => prev.filter((e) => e.id !== exerciseId))
      }
    } catch (error) {
      console.error('Error deleting exercise:', error)
    }
  }

  const handleWorkoutDelete = async () => {
    if (!confirm('Are you sure you want to delete this workout?')) return

    try {
      const res = await fetch(`/api/workouts/${workoutId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error deleting workout:', error)
    }
  }

  const handleAIUpdate = (updatedExercises: Exercise[], updatedWorkout?: Workout) => {
    setExercises(updatedExercises)
    if (updatedWorkout) {
      setWorkout(updatedWorkout)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!session || !workout) {
    return null
  }

  return (
    <div className="min-h-screen bg-dark-bg pb-24">
      {/* Header */}
      <WorkoutHeader
        workout={workout}
        onUpdate={handleWorkoutUpdate}
        onDelete={handleWorkoutDelete}
        onBack={() => router.push('/dashboard')}
      />

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Exercise Table */}
        <ExerciseTable
          exercises={exercises}
          onAdd={handleExerciseAdd}
          onUpdate={handleExerciseUpdate}
          onDelete={handleExerciseDelete}
        />

        {/* Notes Section */}
        {workout.notes && (
          <div className="mt-6 p-4 bg-dark-card border border-dark-border rounded-xl">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Notes</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{workout.notes}</p>
          </div>
        )}
      </main>

      {/* AI Chat Bar */}
      <ChatBar
        workoutId={workoutId}
        exercises={exercises}
        workout={workout}
        onUpdate={handleAIUpdate}
      />
    </div>
  )
}
