'use client'

import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-2">Fitness Tracker AI</h1>
        <p className="text-gray-400 mb-8">
          Log your workouts with natural language. Just tell the AI what you did.
        </p>

        {/* Features */}
        <div className="text-left bg-dark-card rounded-xl p-6 mb-8 border border-dark-border">
          <h2 className="text-sm font-semibold text-gray-400 uppercase mb-4">Features</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-green-500 mt-0.5">✓</span>
              <span className="text-gray-300">Natural language workout logging</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 mt-0.5">✓</span>
              <span className="text-gray-300">Pre-built workout templates</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 mt-0.5">✓</span>
              <span className="text-gray-300">Track sets, reps, and weights</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 mt-0.5">✓</span>
              <span className="text-gray-300">Mobile-friendly design</span>
            </li>
          </ul>
        </div>

        {/* Sign In Button */}
        <button
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-medium py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </button>

        <p className="text-gray-500 text-sm mt-6">
          Your data is private and secure
        </p>
      </div>
    </div>
  )
}
