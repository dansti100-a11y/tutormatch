import { Resend } from 'resend'

const FROM = 'TutorMatch <noreply@tutormatch.app>'

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[email] RESEND_API_KEY not set — skipping send to', to, '|', subject)
    return
  }
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({ from: FROM, to, subject, html })
  if (error) console.error('[email] send error:', error)
}
