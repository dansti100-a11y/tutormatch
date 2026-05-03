'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function sendMessage(sessionId: string, content: string): Promise<{ error?: string }> {
  const parsed = z.string().min(1).max(4000).safeParse(content)
  if (!parsed.success) return { error: 'Message cannot be empty.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { error } = await supabase.from('messages').insert({
    session_id: sessionId,
    sender_id:  user.id,
    content:    parsed.data,
  })

  if (error) return { error: 'Failed to send message.' }

  revalidatePath(`/messages/${sessionId}`)
  return {}
}
