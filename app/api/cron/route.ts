import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

// Called by Vercel Cron every hour.
// Vercel cron config lives in vercel.json.
export async function GET(request: Request) {
  // Lazy-init so missing env var doesn't crash at build time
  const resend = new Resend(process.env.RESEND_API_KEY)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000)

  // ── 1. 24-hour session reminders ────────────────────────────────────────
  const { data: upcoming } = await supabase
    .from('sessions')
    .select('id, scheduled_at, subject, format, location_or_link, student:student_id(name, email), tutor:tutor_id(name, email)')
    .eq('status', 'confirmed')
    .eq('reminder_sent', false)
    .gte('scheduled_at', in24h.toISOString())
    .lte('scheduled_at', in25h.toISOString())

  for (const session of upcoming ?? []) {
    const student = Array.isArray(session.student) ? session.student[0] : session.student
    const tutor = Array.isArray(session.tutor) ? session.tutor[0] : session.tutor
    if (!student?.email || !tutor?.email) continue

    await resend.emails.send({
      from: 'TutorMatch <noreply@tutormatch.app>',
      to: [student.email, tutor.email],
      subject: `Reminder: ${session.subject} session tomorrow`,
      text: `Your ${session.subject} session is scheduled for tomorrow.\nFormat: ${session.format}\n${session.location_or_link ? `Location/Link: ${session.location_or_link}` : ''}`,
    })

    await supabase.from('sessions').update({ reminder_sent: true }).eq('id', session.id)
  }

  // ── 2. Post-session review prompts ──────────────────────────────────────
  const { data: completed } = await supabase
    .from('sessions')
    .select('id, subject, student:student_id(name, email), tutor:tutor_id(name)')
    .eq('status', 'confirmed')
    .eq('review_prompted', false)
    .lt('scheduled_at', now.toISOString())

  for (const session of completed ?? []) {
    const student = Array.isArray(session.student) ? session.student[0] : session.student
    const tutor = Array.isArray(session.tutor) ? session.tutor[0] : session.tutor
    if (!student?.email) continue

    await resend.emails.send({
      from: 'TutorMatch <noreply@tutormatch.app>',
      to: student.email,
      subject: `How was your session with ${tutor?.name}?`,
      text: `We hope your ${session.subject} session went well! Leave a review at tutormatch.app/sessions`,
    })

    await supabase
      .from('sessions')
      .update({ status: 'completed', review_prompted: true })
      .eq('id', session.id)
  }

  // ── 3. Expire stale session requests ────────────────────────────────────
  await supabase.rpc('expire_stale_requests')

  return NextResponse.json({ ok: true })
}
