'use client'

import { useTransition } from 'react'
import { resolveReport } from '../actions'

export function ResolveButton({ reportId }: { reportId: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(async () => { await resolveReport(reportId) })}
      disabled={pending}
      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
    >
      {pending ? 'Resolving…' : 'Resolve'}
    </button>
  )
}
