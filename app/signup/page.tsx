'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/browser'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type View = 'form' | 'confirm-email'

export default function SignupPage() {
  const router = useRouter()

  const [view, setView] = useState<View>('form')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/api/auth/callback?redirectTo=/onboarding`,
      },
    })

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    // If the session exists the user was auto-confirmed (email confirmation disabled in Supabase).
    // Otherwise show the "check your email" screen.
    if (data.session) {
      router.push('/onboarding')
      router.refresh()
    } else {
      setView('confirm-email')
    }
  }

  if (view === 'confirm-email') {
    return (
      <AuthShell>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h2>
          <p className="text-sm text-gray-500">
            We sent a confirmation link to{' '}
            <strong className="text-gray-700">{email}</strong>.
            Click it to finish creating your account.
          </p>
          <p className="mt-4 text-xs text-gray-400">
            Already confirmed?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700">
              Sign in
            </Link>
          </p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="mt-1 text-sm text-gray-500">
          Sign up as a student to find a tutor.
        </p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        <Input
          label="Full name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Alex Johnson"
          required
          autoFocus
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Min. 8 characters"
          hint="At least 8 characters"
          required
        />
        <Input
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <div className="mt-6 space-y-2 text-center text-sm text-gray-500">
        <p>
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 font-medium hover:text-indigo-700">
            Sign in
          </Link>
        </p>
        <p>
          Want to tutor?{' '}
          <Link href="/apply" className="text-indigo-600 font-medium hover:text-indigo-700">
            Apply here
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <Link href="/" className="mb-8 text-2xl font-bold text-indigo-600 tracking-tight">
        TutorMatch
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        {children}
      </div>
    </div>
  )
}
