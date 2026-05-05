'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export async function resolveReport(reportId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')

  await supabase.from('reports').update({ status: 'resolved' }).eq('id', reportId)
  revalidatePath('/admin/reports')
}

const settingSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
})

export async function updateSetting(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Forbidden' }

  const parsed = settingSchema.safeParse({
    key: formData.get('key'),
    value: formData.get('value'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const numVal = Number(parsed.data.value)
  const jsonVal = isNaN(numVal) ? parsed.data.value : numVal

  const { error } = await supabase
    .from('app_settings')
    .upsert({ key: parsed.data.key, value: jsonVal })

  if (error) return { error: error.message }

  revalidatePath('/admin/settings')
  return { error: null }
}

export async function deactivateUser(userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')

  // Ban the user via Supabase Auth admin API
  const admin = createAdminClient()
  await admin.auth.admin.updateUserById(userId, { ban_duration: '876000h' })

  revalidatePath('/admin/users')
}
