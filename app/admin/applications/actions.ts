'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send'
import { approvalEmailHtml, rejectionEmailHtml } from '@/lib/email/templates'
import { redirect } from 'next/navigation'

export async function approveApplication(appId: string, adminNote: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const admin = createAdminClient()

  const { data: app, error: fetchErr } = await admin
    .from('tutor_apps')
    .select('applicant_email, applicant_name, subjects, scores_json, bio, availability')
    .eq('id', appId)
    .single()
  if (fetchErr || !app) throw new Error('Application not found')

  // Invite creates an auth.users row; handle_new_user trigger creates profiles row with role='student'
  const { data: invite, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(app.applicant_email)
  if (inviteErr) throw new Error(inviteErr.message)

  const uid = invite.user.id

  // Promote to tutor and set name
  await admin.from('profiles').update({ role: 'tutor', name: app.applicant_name }).eq('id', uid)

  // Create tutor_profiles row
  await admin.from('tutor_profiles').upsert({
    user_id: uid,
    subjects: app.subjects,
    scores_json: app.scores_json,
    bio_prompt: app.bio,
    availability: app.availability,
  })

  // Mark approved
  await admin
    .from('tutor_apps')
    .update({ status: 'approved', admin_note: adminNote || null })
    .eq('id', appId)

  await sendEmail({
    to: app.applicant_email,
    subject: "You're approved as a TutorMatch tutor!",
    html: approvalEmailHtml(app.applicant_name),
  })

  redirect('/admin/applications')
}

export async function rejectApplication(appId: string, adminNote: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const admin = createAdminClient()

  const { data: app } = await admin
    .from('tutor_apps')
    .select('applicant_email, applicant_name')
    .eq('id', appId)
    .single()
  if (!app) throw new Error('Application not found')

  await admin
    .from('tutor_apps')
    .update({ status: 'rejected', admin_note: adminNote || null })
    .eq('id', appId)

  await sendEmail({
    to: app.applicant_email,
    subject: 'Your TutorMatch application',
    html: rejectionEmailHtml(app.applicant_name, adminNote || undefined),
  })

  redirect('/admin/applications')
}
