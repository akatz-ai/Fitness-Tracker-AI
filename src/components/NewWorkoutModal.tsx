'use client'

import { useState } from 'react'
import { workoutTemplates } from '@/lib/templates'
import { Workout } from '@/types/database'

interface NewWorkoutModalProps {
  onClose: () => void
  onWorkoutCreated: (workout: Workout) => void
}

export function NewWorkoutModal({ onClose, onWorkoutCreated }: NewWorkoutModalProps) {
  const [loading, setLoading] = useState(false)

  const handleSelectTemplate = async (templateId: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId }),
      })

      if (res.ok) {
        const workout = await res.json()
        onWorkoutCreated(workout)
      }
    } catch (error) {
      console.error('Error creating workout:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-dark-card border border-dark-border rounded-t-2xl sm:rounded-2xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">New Workout</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-4">Choose a template to get started:</p>

        <div className="space-y-2">
          {workoutTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleSelectTemplate(template.id)}
              disabled={loading}
              className="w-full text-left p-4 bg-dark-bg hover:bg-dark-hover border border-dark-border rounded-xl transition-colors disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">{template.name}</h3>
                  {template.exercises.length > 0 ? (
                    <p className="text-sm text-gray-500 mt-1">
                      {template.exercises.map((e) => e.name).join(', ')}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">Start with an empty workout</p>
                  )}
                </div>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}
