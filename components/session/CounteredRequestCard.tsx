'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { formatSessionDate } from '@/lib/utils/format'
import { acceptCounter } from '@/app/(auth)/requests/actions'

export interface CounteredRequestData {
  id: string
  tutorName: string
  subject: string
  format: 'in-person' | 'virtual'
  counterTimes: string[]
}

interface Props {
  request: CounteredRequestData
}

export function CounteredRequestCard({ request }: Props) {
  const [selected, setSelected] = useState(request.counterTimes[0] ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleAccept() {
    setError(null)
    startTransition(async () => {
      const result = await acceptCounter(request.id, selected)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5 space-y-3">
      <div>
        <p className="font-semibold text-gray-900">{request.subject}</p>
        <p className="text-sm text-gray-500">
          {request.tutorName} proposed alternative times
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Their suggested times</p>
        {request.counterTimes.map((t, i) => (
          <label key={i} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`counter-${request.id}`}
              value={t}
              checked={selected === t}
              onChange={() => setSelected(t)}
              className="h-4 w-4 text-indigo-600"
            />
            <span className="text-sm text-gray-700">{formatSessionDate(t)}</span>
          </label>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button size="sm" onClick={handleAccept} disabled={isPending || !selected}>
        {isPending ? 'Confirming…' : 'Accept this time'}
      </Button>
    </div>
  )
}
