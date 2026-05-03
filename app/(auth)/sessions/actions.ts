'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function markSessionCompleted(sessionId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { error } = await supabase
    .from('sessions')
    .update({ status: 'completed' })
    .eq('id', sessionId)
    .or(`student_id.eq.${user.id},tutor_id.eq.${user.id}`)

  if (error) return { error: 'Failed to update session.' }

  revalidatePath('/sessions')
  return {}
}

const ReviewSchema = z.object({
  session_id: z.string().uuid(),
  tutor_id:   z.string().uuid(),
  rating:     z.coerce.number().int().min(1).max(5),
  text:       z.string().max(1000).optional(),
})

export type ReviewState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message: string }

export async function submitReview(
  _prev: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { status: 'error', message: 'Not authenticated.' }

  const parsed = ReviewSchema.safeParse({
    session_id: formData.get('session_id'),
    tutor_id:   formData.get('tutor_id'),
    rating:     formData.get('rating'),
    text:       formData.get('text') || undefined,
  })

  if (!parsed.success) {
    return { status: 'error', message: 'Invalid review data.' }
  }

  const { session_id, tutor_id, rating, text } = parsed.data

  // Verify this is the student's completed session
  const { data: session } = await supabase
    .from('sessions')
    .select('id')
    .eq('id', session_id)
    .eq('student_id', user.id)
    .eq('status', 'completed')
    .single()

  if (!session) return { status: 'error', message: 'Session not found or not completed.' }

  const { error } = await supabase.from('reviews').insert({
    session_id,
    reviewer_id: user.id,
    tutor_id,
    rating,
    text: text ?? null,
  })

  if (error) {
    if (error.code === '23505') return { status: 'error', message: 'You already reviewed this session.' }
    return { status: 'error', message: 'Failed to submit review.' }
  }

  revalidatePath('/sessions')
  return { status: 'success' }
}
