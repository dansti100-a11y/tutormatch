'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const RequestSchema = z.object({
  tutor_id:     z.string().uuid(),
  subject:      z.string().min(1),
  format:       z.enum(['in-person', 'virtual']),
  note:         z.string().optional(),
  time_options: z.array(z.string().datetime()).min(1).max(3),
})

export type RequestState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message: string }

export async function createSessionRequest(
  _prev: RequestState,
  formData: FormData
): Promise<RequestState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { status: 'error', message: 'Not authenticated.' }

  const times = [1, 2, 3]
    .map(i => formData.get(`time_${i}`) as string | null)
    .filter((t): t is string => !!t && t.length > 0)
    .map(t => new Date(t).toISOString())

  const parsed = RequestSchema.safeParse({
    tutor_id:     formData.get('tutor_id'),
    subject:      formData.get('subject'),
    format:       formData.get('format'),
    note:         formData.get('note') || undefined,
    time_options: times,
  })

  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0]
    return { status: 'error', message: first ?? 'Invalid input.' }
  }

  const { tutor_id, subject, format, note, time_options } = parsed.data

  // Check for an existing pending/countered request to this tutor
  const { data: existing } = await supabase
    .from('session_requests')
    .select('id')
    .eq('student_id', user.id)
    .eq('tutor_id', tutor_id)
    .in('status', ['pending', 'countered'])
    .maybeSingle()

  if (existing) {
    return { status: 'error', message: 'You already have a pending request with this tutor.' }
  }

  const { error } = await supabase.from('session_requests').insert({
    student_id:   user.id,
    tutor_id,
    subject,
    format,
    note:         note ?? null,
    time_options: time_options as unknown as import('@/lib/types/database.types').Json,
  })

  if (error) return { status: 'error', message: 'Failed to submit request. Try again.' }

  revalidatePath(`/discover/${tutor_id}`)
  return { status: 'success' }
}
