'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatSessionDate } from '@/lib/utils/format'
import { acceptRequest, declineRequest, counterRequest } from '@/app/(auth)/requests/actions'

export interface RequestCardData {
  id: string
  studentName: string
  subject: string
  format: 'in-person' | 'virtual'
  note: string | null
  timeOptions: string[]
  status: 'pending' | 'accepted' | 'declined' | 'countered' | 'expired'
  counterTimes: string[] | null
  createdAt: string
}

interface Props {
  request: RequestCardData
}

type Panel = 'idle' | 'accept' | 'counter'

export function RequestCard({ request }: Props) {
  const [panel, setPanel] = useState<Panel>('idle')
  const [selectedTime, setSelectedTime] = useState(request.timeOptions[0] ?? '')
  const [counterInputs, setCounterInputs] = useState(['', '', ''])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleAccept() {
    setError(null)
    startTransition(async () => {
      const result = await acceptRequest(request.id, selectedTime)
      if (result?.error) setError(result.error)
    })
  }

  function handleDecline() {
    setError(null)
    startTransition(async () => {
      const result = await declineRequest(request.id)
      if (result?.error) setError(result.error)
    })
  }

  function handleCounter() {
    setError(null)
    const times = counterInputs
      .filter(t => t.length > 0)
      .map(t => new Date(t).toISOString())
    startTransition(async () => {
      const result = await counterRequest(request.id, times)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-gray-900">{request.studentName}</p>
          <p className="text-sm text-gray-500">
            {request.subject} · <span className="capitalize">{request.format}</span>
          </p>
        </div>
        <span className="text-xs text-gray-400">{new Date(request.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Student's proposed times */}
      {request.timeOptions.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Proposed times</p>
          <div className="space-y-1">
            {request.timeOptions.map((t, i) => (
              <p key={i} className="text-sm text-gray-700">{formatSessionDate(t)}</p>
            ))}
          </div>
        </div>
      )}

      {/* Note */}
      {request.note && (
        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{request.note}</p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Action area */}
      {request.status === 'pending' && (
        <>
          {panel === 'idle' && (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setPanel('accept')} disabled={isPending} className="flex-1">
                Accept
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setPanel('counter')} disabled={isPending} className="flex-1">
                Counter
              </Button>
              <Button size="sm" variant="danger" onClick={handleDecline} disabled={isPending} className="flex-1">
                Decline
              </Button>
            </div>
          )}

          {panel === 'accept' && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Select a time to confirm:</p>
              {request.timeOptions.map((t, i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`time-${request.id}`}
                    value={t}
                    checked={selectedTime === t}
                    onChange={() => setSelectedTime(t)}
                    className="h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{formatSessionDate(t)}</span>
                </label>
              ))}
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAccept} disabled={isPending || !selectedTime}>
                  {isPending ? 'Confirming…' : 'Confirm'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setPanel('idle')}>Back</Button>
              </div>
            </div>
          )}

          {panel === 'counter' && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Propose alternative times (up to 3):</p>
              {counterInputs.map((val, i) => (
                <Input
                  key={i}
                  type="datetime-local"
                  value={val}
                  onChange={e => {
                    const updated = [...counterInputs]
                    updated[i] = e.target.value
                    setCounterInputs(updated)
                  }}
                  required={i === 0}
                />
              ))}
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCounter} disabled={isPending || !counterInputs[0]}>
                  {isPending ? 'Sending…' : 'Send Counter'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setPanel('idle')}>Back</Button>
              </div>
            </div>
          )}
        </>
      )}

      {request.status === 'countered' && (
        <p className="text-sm text-indigo-600 font-medium">
          Counter sent — awaiting student response
        </p>
      )}
    </div>
  )
}
