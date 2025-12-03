'use client'

import { useEffect, useState, useRef } from 'react'
import { FitnessMetrics } from '@/types/database'

interface FitnessChartProps {
  metrics: FitnessMetrics | null
  loading?: boolean
}

export function FitnessChart({ metrics, loading }: FitnessChartProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const [animatedBars, setAnimatedBars] = useState<number[]>([])
  const chartRef = useRef<HTMLDivElement>(null)

  // Animate the score counter
  useEffect(() => {
    if (!metrics) return

    const duration = 1500
    const steps = 60
    const increment = metrics.currentScore / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current = Math.min(increment * step, metrics.currentScore)
      setAnimatedScore(Math.round(current))

      if (step >= steps) {
        clearInterval(timer)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [metrics])

  // Calculate bar heights (no animation state - use CSS instead)
  useEffect(() => {
    if (!metrics?.weeklyData) return

    const maxScore = Math.max(...metrics.weeklyData.map((d) => d.score), 1)
    const targetHeights = metrics.weeklyData.map((d) => (d.score / maxScore) * 100)

    // Small delay to trigger CSS animation after mount
    const timer = setTimeout(() => {
      setAnimatedBars(targetHeights)
    }, 50)

    return () => clearTimeout(timer)
  }, [metrics])

  if (loading) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 w-32 bg-dark-hover rounded mb-4" />
          <div className="h-32 bg-dark-hover rounded" />
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="bg-gradient-to-br from-dark-card to-dark-bg border border-dark-border rounded-2xl p-6 mb-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-hover flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">Start Your Fitness Journey</h3>
          <p className="text-gray-500 text-sm">Complete workouts to see your progress here</p>
        </div>
      </div>
    )
  }

  const trendIcon = {
    up: (
      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    down: (
      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
      </svg>
    ),
    stable: (
      <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    ),
  }

  const trendColor = {
    up: 'text-green-400',
    down: 'text-red-400',
    stable: 'text-yellow-400',
  }

  const scoreDiff = metrics.currentScore - metrics.previousScore
  const percentChange = metrics.previousScore > 0
    ? Math.round((scoreDiff / metrics.previousScore) * 100)
    : 0

  return (
    <div
      ref={chartRef}
      className="bg-gradient-to-br from-dark-card via-dark-card to-blue-950/20 border border-dark-border rounded-2xl p-6 mb-6 overflow-hidden relative"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Fitness Score</h2>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl font-bold text-white">{animatedScore}</span>
              <div className={`flex items-center gap-1 ${trendColor[metrics.trend]}`}>
                {trendIcon[metrics.trend]}
                <span className="text-sm font-medium">
                  {scoreDiff >= 0 ? '+' : ''}{percentChange}%
                </span>
              </div>
            </div>
          </div>

          {/* Stats pills */}
          <div className="flex gap-2 shrink-0">
            <div className="bg-dark-bg/50 backdrop-blur-sm border border-dark-border rounded-full px-2 sm:px-3 py-1.5 flex items-center whitespace-nowrap">
              <span className="text-xs text-gray-400 hidden sm:inline">Streak</span>
              <span className="text-sm font-semibold text-orange-400 flex items-center gap-1">
                <span className="sm:ml-2">{metrics.streak}</span>
                <span className="text-xs sm:text-sm">🔥</span>
              </span>
            </div>
            <div className="bg-dark-bg/50 backdrop-blur-sm border border-dark-border rounded-full px-2 sm:px-3 py-1.5 flex items-center whitespace-nowrap">
              <span className="text-xs text-gray-400 hidden sm:inline">This week</span>
              <span className="sm:ml-2 text-sm font-semibold text-blue-400">{metrics.weeklyWorkouts}</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="flex items-end justify-between gap-1 sm:gap-2 h-24 mt-4">
          {metrics.weeklyData.map((day, index) => {
            const isToday = index === metrics.weeklyData.length - 1
            const height = animatedBars[index] || 0
            const dayLabel = new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })

            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                <div className="relative w-full h-20 flex items-end justify-center">
                  {/* Bar container - fixed height to prevent layout shift */}
                  <div className="w-full max-w-[40px] h-full flex items-end justify-center">
                    <div
                      className={`w-full rounded-t-lg ${
                        isToday
                          ? 'bg-gradient-to-t from-blue-600 to-blue-400'
                          : day.workouts > 0
                          ? 'bg-gradient-to-t from-blue-600/60 to-blue-400/60'
                          : 'bg-dark-hover'
                      }`}
                      style={{
                        height: `${Math.max(height, 8)}%`,
                        boxShadow: isToday ? '0 0 20px rgba(59, 130, 246, 0.3)' : 'none',
                        transition: 'height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transitionDelay: `${index * 80}ms`,
                        willChange: 'height'
                      }}
                    />
                  </div>
                  {/* Workout count indicator */}
                  {day.workouts > 0 && (
                    <div
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold text-white shadow-lg"
                      style={{
                        opacity: height > 0 ? 1 : 0,
                        transition: 'opacity 0.3s ease-out',
                        transitionDelay: `${index * 80 + 400}ms`
                      }}
                    >
                      {day.workouts}
                    </div>
                  )}
                </div>
                {/* Day label */}
                <span className={`text-xs ${isToday ? 'text-blue-400 font-medium' : 'text-gray-500'}`}>
                  {isToday ? 'Today' : dayLabel}
                </span>
              </div>
            )
          })}
        </div>

        {/* Bottom stats */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-dark-border/50">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-gray-500">Total Volume</p>
              <p className="text-lg font-semibold text-white">
                {metrics.totalVolume.toLocaleString()} <span className="text-xs text-gray-400">lbs</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">vs. last week</p>
            <p className={`text-sm font-medium ${trendColor[metrics.trend]}`}>
              {metrics.trend === 'up' ? 'Improving!' : metrics.trend === 'down' ? 'Keep pushing!' : 'Maintaining'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
