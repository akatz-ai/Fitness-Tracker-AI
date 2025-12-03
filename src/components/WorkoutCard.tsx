'use client'

import { Workout } from '@/types/database'

interface WorkoutCardProps {
  workout: Workout
  onClick: () => void
}

const tagColors: Record<string, string> = {
  Lifting: 'bg-blue-500/20 text-blue-400',
  Cardio: 'bg-green-500/20 text-green-400',
  HIIT: 'bg-orange-500/20 text-orange-400',
  Stretching: 'bg-purple-500/20 text-purple-400',
  Sports: 'bg-yellow-500/20 text-yellow-400',
}

export function WorkoutCard({ workout, onClick }: WorkoutCardProps) {
  // Parse date without timezone conversion (date string is YYYY-MM-DD)
  const [year, month, day] = workout.date.split('-').map(Number)
  const formattedDate = new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-dark-card hover:bg-dark-hover border border-dark-border rounded-xl p-4 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white truncate">{workout.name}</h3>
          <p className="text-sm text-gray-400 mt-1">{formattedDate}</p>
        </div>
        <span
          className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-full ${
            tagColors[workout.tag] || 'bg-gray-500/20 text-gray-400'
          }`}
        >
          {workout.tag}
        </span>
      </div>
    </button>
  )
}
