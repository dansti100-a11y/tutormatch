import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ApprovalForm } from './ApprovalForm'
import type { AvailabilitySlots } from '@/lib/types/app.types'

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

interface Props {
  params: Promise<{ id: string }>
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: app } = await admin
    .from('tutor_apps')
    .select('*')
    .eq('id', id)
    .single()

  if (!app) notFound()

  // Generate signed URL for score screenshot
  let screenshotUrl: string | null = null
  if (app.screenshot_path) {
    const { data } = await admin.storage
      .from('tutor-screenshots')
      .createSignedUrl(app.screenshot_path, 60 * 10)
    screenshotUrl = data?.signedUrl ?? null
  }

  const scores = (app.scores_json as Record<string, Record<string, number>>) ?? {}
  const avail = (app.availability as AvailabilitySlots) ?? {}

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{app.applicant_name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{app.applicant_email}</p>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium
          ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-700'
            : app.status === 'approved' ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'}`}>
          {app.status}
        </span>
      </div>

      {/* Scores */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Test scores</h2>
        <div className="flex gap-6 flex-wrap">
          {scores.sat && Object.entries(scores.sat).map(([k, v]) => (
            <div key={k}>
              <p className="text-xs text-gray-400">SAT {k}</p>
              <p className="text-xl font-bold text-gray-900">{v}</p>
            </div>
          ))}
          {scores.act && Object.entries(scores.act).map(([k, v]) => (
            <div key={k}>
              <p className="text-xs text-gray-400">ACT {k}</p>
              <p className="text-xl font-bold text-gray-900">{v}</p>
            </div>
          ))}
          {!scores.sat && !scores.act && <p className="text-sm text-gray-400">No scores submitted</p>}
        </div>

        {screenshotUrl && (
          <div className="mt-4">
            <p className="text-xs text-gray-400 mb-2">Score screenshot</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={screenshotUrl} alt="Score screenshot" className="max-w-full rounded-lg border border-gray-200" />
          </div>
        )}
      </section>

      {/* Subjects */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Subjects</h2>
        <div className="flex flex-wrap gap-2">
          {(app.subjects ?? []).map((s: string) => (
            <span key={s} className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* Bio */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Bio</h2>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{app.bio || '—'}</p>
      </section>

      {/* Availability */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Availability</h2>
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map(day => (
            <div key={day}>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">{day}</p>
              {(avail[day] ?? []).length === 0 ? (
                <p className="text-xs text-gray-300">—</p>
              ) : (
                <div className="space-y-0.5">
                  {(avail[day] ?? []).map((slot: string) => (
                    <p key={slot} className="text-xs text-gray-600">{slot}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Admin note (if already reviewed) */}
      {app.status !== 'pending' && app.admin_note && (
        <section className="rounded-xl border border-gray-200 bg-gray-50 p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Admin note</h2>
          <p className="text-sm text-gray-700">{app.admin_note}</p>
        </section>
      )}

      {app.status === 'pending' && <ApprovalForm appId={app.id} />}
    </div>
  )
}
