'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ReviewForm } from './ReviewForm'
import { markSessionCompleted } from '@/app/(auth)/sessions/actions'
import { formatSessionDate } from '@/lib/utils/format'

export interface SessionCardData {
  id: string
  subject: string
  scheduledAt: string
  format: 'in-person' | 'virtual'
  status: 'confirmed' | 'completed' | 'cancelled'
  locationOrLink: string | null
  otherPartyName: string
  otherPartyRole: 'student' | 'tutor'
  tutorId: string
  hasReview: boolean
  viewerRole: 'student' | 'tutor' | 'admin'
}

interface Props {
  session: SessionCardData
}

export function SessionCard({ session }: Props) {
  const [showReview, setShowReview] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isPast = new Date(session.scheduledAt) < new Date()
  const canMarkComplete =
    session.status === 'confirmed' && isPast &&
    (session.viewerRole === 'tutor' || session.viewerRole === 'admin')
  const canReview =
    session.status === 'completed' &&
    session.viewerRole === 'student' &&
    !session.hasReview

  function handleMarkComplete() {
    setError(null)
    startTransition(async () => {
      const result = await markSessionCompleted(session.id)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-gray-900">{session.subject}</p>
          <p className="text-sm text-gray-500">
            with {session.otherPartyName}
          </p>
        </div>
        <StatusBadge status={session.status} />
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>📅 {formatSessionDate(session.scheduledAt)}</span>
        <span className="capitalize">{session.format}</span>
        {session.locationOrLink && (
          <span className="text-gray-400 truncate max-w-xs">{session.locationOrLink}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={`/messages/${session.id}`}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Messages →
        </Link>
      </div>

      {canMarkComplete && (
        <div>
          <Button size="sm" variant="secondary" onClick={handleMarkComplete} disabled={isPending}>
            {isPending ? 'Updating…' : 'Mark as Completed'}
          </Button>
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
      )}

      {canReview && !showReview && (
        <Button size="sm" onClick={() => setShowReview(true)}>
          Leave a Review
        </Button>
      )}

      {canReview && showReview && (
        <div className="pt-2 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-2">Rate this session</p>
          <ReviewForm
            sessionId={session.id}
            tutorId={session.tutorId}
            onSuccess={() => setShowReview(false)}
          />
        </div>
      )}

      {session.status === 'completed' && session.viewerRole === 'student' && session.hasReview && (
        <p className="text-xs text-gray-400">✓ Reviewed</p>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'confirmed')  return <Badge variant="blue">Confirmed</Badge>
  if (status === 'completed')  return <Badge variant="success">Completed</Badge>
  if (status === 'cancelled')  return <Badge variant="danger">Cancelled</Badge>
  return <Badge variant="default">{status}</Badge>
}
