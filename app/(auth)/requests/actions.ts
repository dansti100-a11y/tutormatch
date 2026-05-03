'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/types/database.types'

export async function acceptRequest(requestId: string, scheduledAt: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { data: req, error: fetchError } = await supabase
    .from('session_requests')
    .select('*')
    .eq('id', requestId)
    .eq('tutor_id', user.id)
    .single()

  if (fetchError || !req) return { error: 'Request not found.' }
  if (req.status !== 'pending' && req.status !== 'countered') {
    return { error: 'Request is no longer actionable.' }
  }

  // Create the confirmed session
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .insert({
      request_id:  requestId,
      student_id:  req.student_id,
      tutor_id:    req.tutor_id,
      subject:     req.subject,
      scheduled_at: scheduledAt,
      format:      req.format,
    })
    .select('id')
    .single()

  if (sessionError || !session) return { error: 'Failed to create session.' }

  await supabase
    .from('session_requests')
    .update({ status: 'accepted' })
    .eq('id', requestId)

  revalidatePath('/requests')
  revalidatePath('/sessions')
  redirect(`/sessions`)
}

export async function declineRequest(requestId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { error } = await supabase
    .from('session_requests')
    .update({ status: 'declined' })
    .eq('id', requestId)
    .eq('tutor_id', user.id)

  if (error) return { error: 'Failed to decline request.' }

  revalidatePath('/requests')
  return {}
}

export async function counterRequest(
  requestId: string,
  counterTimes: string[]
): Promise<{ error?: string }> {
  const parsed = z.array(z.string().datetime()).min(1).max(3).safeParse(counterTimes)
  if (!parsed.success) return { error: 'Provide 1–3 valid date/times.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { error } = await supabase
    .from('session_requests')
    .update({ status: 'countered', counter_times: parsed.data as unknown as Json })
    .eq('id', requestId)
    .eq('tutor_id', user.id)
    .eq('status', 'pending')

  if (error) return { error: 'Failed to counter request.' }

  revalidatePath('/requests')
  return {}
}

// Student accepts the tutor's counter proposal
export async function acceptCounter(requestId: string, scheduledAt: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { data: req, error: fetchError } = await supabase
    .from('session_requests')
    .select('*')
    .eq('id', requestId)
    .eq('student_id', user.id)
    .eq('status', 'countered')
    .single()

  if (fetchError || !req) return { error: 'Request not found.' }

  const counterTimes = (req.counter_times as string[] | null) ?? []
  if (!counterTimes.includes(scheduledAt)) {
    return { error: 'Invalid time selection.' }
  }

  const { error: sessionError } = await supabase.from('sessions').insert({
    request_id:   requestId,
    student_id:   req.student_id,
    tutor_id:     req.tutor_id,
    subject:      req.subject,
    scheduled_at: scheduledAt,
    format:       req.format,
  })

  if (sessionError) return { error: 'Failed to create session.' }

  await supabase
    .from('session_requests')
    .update({ status: 'accepted' })
    .eq('id', requestId)

  revalidatePath('/sessions')
  redirect('/sessions')
}
