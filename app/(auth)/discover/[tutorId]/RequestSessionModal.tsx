'use client'

import { useState, useActionState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { createSessionRequest, type RequestState } from './actions'

interface Props {
  tutorId: string
  subjects: string[]
  hasPendingRequest: boolean
}

const initial: RequestState = { status: 'idle' }

export function RequestSessionModal({ tutorId, subjects, hasPendingRequest }: Props) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(createSessionRequest, initial)

  if (hasPendingRequest) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
        You already have a pending request with this tutor.
      </div>
    )
  }

  return (
    <>
      <Button size="lg" className="w-full" onClick={() => setOpen(true)}>
        Request a Session
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Request a Session" width="md">
        {state.status === 'success' ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-medium text-gray-900">Request sent!</p>
            <p className="mt-1 text-sm text-gray-500">
              The tutor will be in touch to confirm a time.
            </p>
            <Button className="mt-4" variant="secondary" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="tutor_id" value={tutorId} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                name="subject"
                required
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                  focus:outline-none focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select a subject…</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <div className="flex gap-4">
                {['in-person', 'virtual'].map(f => (
                  <label key={f} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value={f}
                      defaultChecked={f === 'in-person'}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{f}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Proposed times <span className="font-normal text-gray-400">(up to 3)</span>
              </label>
              {[1, 2, 3].map(i => (
                <Input
                  key={i}
                  name={`time_${i}`}
                  type="datetime-local"
                  required={i === 1}
                />
              ))}
            </div>

            <Textarea
              label="Note (optional)"
              name="note"
              rows={2}
              placeholder="Anything you'd like the tutor to know…"
            />

            {state.status === 'error' && (
              <p className="text-sm text-red-600">{state.message}</p>
            )}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Sending…' : 'Send Request'}
            </Button>
          </form>
        )}
      </Modal>
    </>
  )
}
