'use client'

import { useRef, useState } from 'react'
import { Workout } from '@/types/database'

interface WorkoutCardProps {
  workout: Workout
  onClick: () => void
  onDelete?: (workout: Workout) => void
}

const tagColors: Record<string, string> = {
  Lifting: 'bg-blue-500/20 text-blue-400',
  Cardio: 'bg-green-500/20 text-green-400',
  HIIT: 'bg-orange-500/20 text-orange-400',
  Stretching: 'bg-purple-500/20 text-purple-400',
  Sports: 'bg-yellow-500/20 text-yellow-400',
}

const ACTION_WIDTH = 80 // Width of the delete button area

export function WorkoutCard({ workout, onClick, onDelete }: WorkoutCardProps) {
  const [offsetX, setOffsetX] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const isDragging = useRef(false)
  const isScrolling = useRef<boolean | null>(null)

  // Parse date without timezone conversion (date string is YYYY-MM-DD)
  const [year, month, day] = workout.date.split('-').map(Number)
  const formattedDate = new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    isDragging.current = true
    isScrolling.current = null
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return

    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const diffX = currentX - startX.current
    const diffY = currentY - startY.current

    // Determine if scrolling vertically or swiping horizontally
    if (isScrolling.current === null) {
      isScrolling.current = Math.abs(diffY) > Math.abs(diffX)
    }

    // If scrolling vertically, don't interfere
    if (isScrolling.current) return

    // Prevent vertical scroll when swiping horizontally
    e.preventDefault()

    // Calculate new offset
    let newOffset = isOpen ? diffX - ACTION_WIDTH : diffX

    // Limit the swipe range
    newOffset = Math.max(-ACTION_WIDTH, Math.min(0, newOffset))

    setOffsetX(newOffset)
  }

  const handleTouchEnd = () => {
    isDragging.current = false
    isScrolling.current = null

    // Snap to open or closed position
    if (offsetX < -ACTION_WIDTH / 2) {
      setOffsetX(-ACTION_WIDTH)
      setIsOpen(true)
    } else {
      setOffsetX(0)
      setIsOpen(false)
    }
  }

  const handleClick = () => {
    if (isOpen) {
      // Close if open
      setOffsetX(0)
      setIsOpen(false)
    } else if (Math.abs(offsetX) < 5) {
      // Only trigger click if not swiping
      onClick()
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(workout)
    }
  }

  const closeSwipe = () => {
    setOffsetX(0)
    setIsOpen(false)
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Action buttons underneath */}
      <div className="absolute inset-y-0 right-0 flex items-stretch">
        <button
          onClick={handleDelete}
          className="w-20 bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"
          aria-label="Delete workout"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Swipeable card */}
      <div
        className="relative bg-dark-card border border-dark-border rounded-xl transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          onClick={handleClick}
          className="w-full text-left p-4 transition-colors hover:bg-dark-hover"
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
      </div>
    </div>
  )
}
