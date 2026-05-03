'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/types/database.types'

const OnboardingSchema = z.object({
  grade:            z.coerce.number().int().min(9).max(13),
  target_test:      z.enum(['SAT', 'ACT', 'both']),
  weak_subjects:    z.array(z.string()),
  current_score:    z.coerce.number().int().positive().optional(),
  goal_score:       z.coerce.number().int().positive().optional(),
  availability:     z.record(z.string(), z.array(z.string())).optional(),
  preferred_format: z.enum(['in-person', 'virtual', 'either']),
  style_tags:       z.array(z.string()).optional(),
})

export type OnboardingState =
  | { status: 'idle' }
  | { status: 'error'; errors: Record<string, string[]> | null; message?: string }

export async function saveOnboarding(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { status: 'error', errors: null, message: 'Not authenticated.' }

  const availabilityRaw: Record<string, string[]> = {}
  for (const [key, val] of formData.entries()) {
    if (key.startsWith('avail_') && val === 'on') {
      const [, day, slot] = key.split('_')
      if (!availabilityRaw[day]) availabilityRaw[day] = []
      availabilityRaw[day].push(slot)
    }
  }

  const parsed = OnboardingSchema.safeParse({
    grade:            formData.get('grade'),
    target_test:      formData.get('target_test'),
    weak_subjects:    formData.getAll('weak_subjects'),
    current_score:    formData.get('current_score') || undefined,
    goal_score:       formData.get('goal_score') || undefined,
    availability:     availabilityRaw,
    preferred_format: formData.get('preferred_format'),
    style_tags:       formData.getAll('style_tags'),
  })

  if (!parsed.success) {
    return { status: 'error', errors: parsed.error.flatten().fieldErrors }
  }

  const { grade, target_test, weak_subjects, current_score, goal_score,
          availability, preferred_format, style_tags } = parsed.data

  const { error } = await supabase
    .from('student_profiles')
    .update({
      grade,
      target_test,
      weak_subjects,
      current_score:    current_score ?? null,
      goal_score:       goal_score ?? null,
      availability:     (availability ?? {}) as Json,
      preferred_format,
      style_tags:       style_tags ?? [],
      onboarding_done:  true,
    })
    .eq('user_id', user.id)

  if (error) return { status: 'error', errors: null, message: 'Failed to save profile. Try again.' }

  redirect('/discover')
}
