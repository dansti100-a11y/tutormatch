'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/browser'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type View = 'form' | 'success' | 'invalid-link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [view, setView] = useState<View>('form')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Supabase sends the recovery token in the URL hash as an access_token.
  // @supabase/ssr processes it automatically on the first render — we just
  // need to verify there's an active session before showing the form.
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) setView('invalid-link')
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
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
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setView('success')
    setTimeout(() => router.push('/login'), 2500)
  }

  if (view === 'invalid-link') {
    return (
      <AuthShell>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Link expired</h2>
          <p className="text-sm text-gray-500 mb-4">
            This reset link has expired or already been used.
          </p>
          <Link href="/login" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Request a new one →
          </Link>
        </div>
      </AuthShell>
    )
  }

  if (view === 'success') {
    return (
      <AuthShell>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Password updated</h2>
          <p className="text-sm text-gray-500">Redirecting you to sign in…</p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Set new password</h1>
        <p className="mt-1 text-sm text-gray-500">Choose a password you haven&apos;t used before.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="New password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Min. 8 characters"
          required
          autoFocus
        />
        <Input
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Saving…' : 'Set new password'}
        </Button>
      </form>
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
