'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/browser'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type View = 'sign-in' | 'forgot-password' | 'reset-sent'

export function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? ''

  const [view, setView] = useState<View>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    const destination = redirectTo || roleDashboard(profile?.role)
    router.push(destination)
    router.refresh()
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?redirectTo=/reset-password`,
    })

    setLoading(false)
    if (resetError) {
      setError(resetError.message)
      return
    }
    setView('reset-sent')
  }

  if (view === 'reset-sent') {
    return (
      <AuthShell>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h2>
          <p className="text-sm text-gray-500 mb-6">
            We sent a password reset link to <strong>{email}</strong>.
          </p>
          <button
            onClick={() => setView('sign-in')}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← Back to sign in
          </button>
        </div>
      </AuthShell>
    )
  }

  if (view === 'forgot-password') {
    return (
      <AuthShell>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
          <p className="mt-1 text-sm text-gray-500">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoFocus
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
        <button
          onClick={() => { setView('sign-in'); setError('') }}
          className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to sign in
        </button>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back to TutorMatch.</p>
      </div>

      <form onSubmit={handleSignIn} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoFocus
        />
        <div>
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => { setView('forgot-password'); setError('') }}
            className="mt-1.5 text-xs text-indigo-600 hover:text-indigo-700"
          >
            Forgot password?
          </button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div className="mt-6 space-y-2 text-center text-sm text-gray-500">
        <p>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-indigo-600 font-medium hover:text-indigo-700">
            Sign up
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

function roleDashboard(role?: string | null): string {
  if (role === 'admin') return '/admin'
  if (role === 'tutor') return '/requests'
  return '/discover'
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
