function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const base = (content: string) => `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#374151">
  ${content}
  <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb"/>
  <p style="font-size:12px;color:#9ca3af">TutorMatch — SAT &amp; ACT prep, locally matched.</p>
</div>`

const btn = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">${label}</a>`

export function approvalEmailHtml(name: string): string {
  return base(`
    <h2 style="color:#4f46e5;margin-top:0">You're approved as a TutorMatch tutor!</h2>
    <p>Hi ${esc(name)},</p>
    <p>Congratulations — your application has been approved. Students can now discover your profile and book sessions.</p>
    <p>Log in to set your availability and get your first booking.</p>
    ${btn('https://tutormatch.app/login', 'Go to TutorMatch')}
  `)
}

export function rejectionEmailHtml(name: string, note?: string): string {
  return base(`
    <h2 style="margin-top:0">Your TutorMatch application</h2>
    <p>Hi ${esc(name)},</p>
    <p>Thank you for applying. Unfortunately we're unable to approve your application at this time.</p>
    ${note ? `<p><strong>Note from our team:</strong> ${esc(note)}</p>` : ''}
    <p>If you have questions please reply to this email.</p>
  `)
}

export function sessionConfirmedEmailHtml(opts: {
  name: string
  subject: string
  scheduledAt: string
  format: string
  locationOrLink?: string | null
}): string {
  return base(`
    <h2 style="color:#4f46e5;margin-top:0">Session confirmed!</h2>
    <p>Hi ${esc(opts.name)},</p>
    <p>Your <strong>${esc(opts.subject)}</strong> session is confirmed.</p>
    <ul>
      <li><strong>When:</strong> ${esc(new Date(opts.scheduledAt).toLocaleString())}</li>
      <li><strong>Format:</strong> ${esc(opts.format)}</li>
      ${opts.locationOrLink ? `<li><strong>Location/Link:</strong> ${esc(opts.locationOrLink)}</li>` : ''}
    </ul>
    ${btn('https://tutormatch.app/sessions', 'View sessions')}
  `)
}

export function sessionReminderEmailHtml(opts: {
  name: string
  subject: string
  scheduledAt: string
  format: string
  locationOrLink?: string | null
}): string {
  return base(`
    <h2 style="color:#4f46e5;margin-top:0">Session reminder — tomorrow</h2>
    <p>Hi ${esc(opts.name)},</p>
    <p>Just a reminder: your <strong>${esc(opts.subject)}</strong> session is tomorrow.</p>
    <ul>
      <li><strong>When:</strong> ${esc(new Date(opts.scheduledAt).toLocaleString())}</li>
      <li><strong>Format:</strong> ${esc(opts.format)}</li>
      ${opts.locationOrLink ? `<li><strong>Location/Link:</strong> ${esc(opts.locationOrLink)}</li>` : ''}
    </ul>
    ${btn('https://tutormatch.app/sessions', 'View sessions')}
  `)
}

export function reviewPromptEmailHtml(name: string, tutorName: string, subject: string): string {
  return base(`
    <h2 style="color:#4f46e5;margin-top:0">How was your session?</h2>
    <p>Hi ${esc(name)},</p>
    <p>We hope your <strong>${esc(subject)}</strong> session with <strong>${esc(tutorName)}</strong> went well!</p>
    <p>A quick rating helps other students find the right tutor.</p>
    ${btn('https://tutormatch.app/sessions', 'Leave a review')}
  `)
}
