import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send'
import { sessionReminderEmailHtml, reviewPromptEmailHtml } from '@/lib/email/templates'

// Called by Vercel Cron every hour. Cron config lives in vercel.json.
export async function GET(request: Request) {
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

    const opts = {
      subject: session.subject,
      scheduledAt: session.scheduled_at,
      format: session.format,
      locationOrLink: session.location_or_link,
    }

    await Promise.all([
      sendEmail({
        to: student.email,
        subject: `Reminder: ${session.subject} session tomorrow`,
        html: sessionReminderEmailHtml({ name: student.name ?? 'Student', ...opts }),
      }),
      sendEmail({
        to: tutor.email,
        subject: `Reminder: ${session.subject} session tomorrow`,
        html: sessionReminderEmailHtml({ name: tutor.name ?? 'Tutor', ...opts }),
      }),
    ])

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

    await sendEmail({
      to: student.email,
      subject: `How was your session with ${tutor?.name ?? 'your tutor'}?`,
      html: reviewPromptEmailHtml(
        student.name ?? 'Student',
        tutor?.name ?? 'your tutor',
        session.subject,
      ),
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
