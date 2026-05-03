'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { submitReview, type ReviewState } from '@/app/(auth)/sessions/actions'

interface Props {
  sessionId: string
  tutorId: string
  onSuccess?: () => void
}

const initial: ReviewState = { status: 'idle' }

export function ReviewForm({ sessionId, tutorId, onSuccess }: Props) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [state, formAction, pending] = useActionState(submitReview, initial)

  if (state.status === 'success') {
    return (
      <p className="text-sm text-green-700 font-medium">Review submitted — thank you!</p>
    )
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="session_id" value={sessionId} />
      <input type="hidden" name="tutor_id" value={tutorId} />
      <input type="hidden" name="rating" value={rating} />

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            className="text-2xl transition-colors leading-none"
          >
            <span className={(hovered || rating) >= i ? 'text-yellow-400' : 'text-gray-200'}>★</span>
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-gray-500">{['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}</span>
        )}
      </div>

      <Textarea
        name="text"
        rows={2}
        placeholder="Share your experience (optional)…"
      />

      {state.status === 'error' && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <Button type="submit" size="sm" disabled={pending || rating === 0}>
        {pending ? 'Submitting…' : 'Submit Review'}
      </Button>
    </form>
  )
}
