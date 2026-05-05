'use client'

import { useTransition, useState } from 'react'
import { approveApplication, rejectApplication } from '../actions'

interface Props {
  appId: string
}

export function ApprovalForm({ appId }: Props) {
  const [pending, startTransition] = useTransition()
  const [note, setNote] = useState('')

  function approve() {
    startTransition(async () => { await approveApplication(appId, note) })
  }

  function reject() {
    startTransition(async () => { await rejectApplication(appId, note) })
  }

  return (
    <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Review decision</h2>

      <label className="block text-sm font-medium text-gray-700 mb-1">
        Admin note <span className="text-gray-400">(optional)</span>
      </label>
      <textarea
        rows={3}
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Visible to applicant on rejection…"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        disabled={pending}
      />

      <div className="mt-4 flex gap-3">
        <button
          onClick={approve}
          disabled={pending}
          className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {pending ? 'Processing…' : '✓ Approve'}
        </button>
        <button
          onClick={reject}
          disabled={pending}
          className="flex-1 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {pending ? 'Processing…' : '✗ Reject'}
        </button>
      </div>
    </div>
  )
}
