'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Workout } from '@/types/database'
import { WorkoutCard } from '@/components/WorkoutCard'
import { NewWorkoutModal } from '@/components/NewWorkoutModal'
import Image from 'next/image'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewWorkoutModal, setShowNewWorkoutModal] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchWorkouts()
    }
  }, [session])

  const fetchWorkouts = async () => {
    try {
      const res = await fetch('/api/workouts')
      if (res.ok) {
        const data = await res.json()
        setWorkouts(data)
      }
    } catch (error) {
      console.error('Error fetching workouts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWorkoutCreated = (workout: Workout) => {
    router.push(`/workout/${workout.id}`)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-dark-bg/80 backdrop-blur-sm border-b border-dark-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">My Workouts</h1>
          <div className="flex items-center gap-3">
            {session.user?.image && (
              <Image
                src={session.user.image}
                alt="Profile"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full"
              />
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* New Workout Button */}
        <button
          onClick={() => setShowNewWorkoutModal(true)}
          className="w-full mb-6 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Workout
        </button>

        {/* Workout List */}
        {workouts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-dark-card rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">No workouts yet</h3>
            <p className="text-gray-500">Create your first workout to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onClick={() => router.push(`/workout/${workout.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      {/* New Workout Modal */}
      {showNewWorkoutModal && (
        <NewWorkoutModal
          onClose={() => setShowNewWorkoutModal(false)}
          onWorkoutCreated={handleWorkoutCreated}
        />
      )}
    </div>
  )
}
