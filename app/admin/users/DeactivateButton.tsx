'use client'

import { useTransition } from 'react'
import { deactivateUser } from '../actions'

export function DeactivateButton({ userId, name }: { userId: string; name: string }) {
  const [pending, startTransition] = useTransition()

  function handle() {
    if (!confirm(`Ban ${name}? This prevents them from logging in.`)) return
    startTransition(async () => { await deactivateUser(userId) })
  }

  return (
    <button
      onClick={handle}
      disabled={pending}
      className="text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50"
    >
      {pending ? 'Banning…' : 'Ban'}
    </button>
  )
}
