'use server'

import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/types/database.types'

const SUBJECTS = ['SAT Math', 'SAT Reading & Writing', 'ACT Math', 'ACT English', 'ACT Reading', 'ACT Science'] as const

const ApplySchema = z.object({
  applicant_name:  z.string().min(2, 'Name is required'),
  applicant_email: z.string().email('Enter a valid email'),
  bio:             z.string().min(20, 'Please write at least 20 characters'),
  subjects:        z.array(z.string()).min(1, 'Select at least one subject'),
  sat_total:       z.coerce.number().int().min(400).max(1600).optional(),
  act_composite:   z.coerce.number().int().min(1).max(36).optional(),
  availability:    z.record(z.string(), z.array(z.string())).optional(),
})

export type ApplyState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; errors: Record<string, string[]> | null; message?: string }

export async function submitApplication(
  _prevState: ApplyState,
  formData: FormData
): Promise<ApplyState> {
  // Parse multi-value fields
  const subjects = formData.getAll('subjects') as string[]
  const availabilityRaw: Record<string, string[]> = {}
  for (const [key, val] of formData.entries()) {
    if (key.startsWith('avail_') && val === 'on') {
      const [, day, slot] = key.split('_')
      if (!availabilityRaw[day]) availabilityRaw[day] = []
      availabilityRaw[day].push(slot)
    }
  }

  const parsed = ApplySchema.safeParse({
    applicant_name:  formData.get('applicant_name'),
    applicant_email: formData.get('applicant_email'),
    bio:             formData.get('bio'),
    subjects,
    sat_total:       formData.get('sat_total') || undefined,
    act_composite:   formData.get('act_composite') || undefined,
    availability:    availabilityRaw,
  })

  if (!parsed.success) {
    return { status: 'error', errors: parsed.error.flatten().fieldErrors }
  }

  const { applicant_name, applicant_email, bio, subjects: validSubjects, sat_total, act_composite, availability } = parsed.data

  const scores_json: Record<string, { total?: number; composite?: number }> = {}
  if (sat_total)     scores_json.sat = { total: sat_total }
  if (act_composite) scores_json.act = { composite: act_composite }

  // Handle optional screenshot upload
  const supabase = createAdminClient()
  let screenshot_path: string | null = null

  const screenshot = formData.get('screenshot') as File | null
  if (screenshot && screenshot.size > 0) {
    if (screenshot.size > 5 * 1024 * 1024) {
      return { status: 'error', errors: null, message: 'Screenshot must be under 5 MB.' }
    }
    const ext = screenshot.name.split('.').pop() ?? 'png'
    const filename = `${crypto.randomUUID()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('score-screenshots')
      .upload(filename, screenshot, { contentType: screenshot.type, upsert: false })
    if (uploadError) {
      return { status: 'error', errors: null, message: 'Screenshot upload failed. Try again.' }
    }
    screenshot_path = filename
  }

  const { error: insertError } = await supabase.from('tutor_apps').insert({
    applicant_name,
    applicant_email,
    bio,
    subjects: validSubjects,
    scores_json: scores_json as Json,
    availability: (availability ?? {}) as Json,
    screenshot_path,
  })

  if (insertError) {
    return { status: 'error', errors: null, message: 'Something went wrong. Please try again.' }
  }

  return { status: 'success' }
}
