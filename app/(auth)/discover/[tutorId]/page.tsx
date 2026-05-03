import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { ScoreBadge } from '@/components/tutor/ScoreBadge'
import { RequestSessionModal } from './RequestSessionModal'

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
const SLOTS = ['morning', 'afternoon', 'evening'] as const
const DAY_LABEL: Record<string, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' }
const SLOT_LABEL: Record<string, string> = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' }

interface Props {
  params: Promise<{ tutorId: string }>
}

export default async function TutorProfilePage({ params }: Props) {
  const { tutorId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [tutorResult, profileResult, reviewsResult, pendingResult] = await Promise.all([
    supabase
      .from('tutor_profiles')
      .select('*')
      .eq('user_id', tutorId)
      .single(),
    supabase
      .from('profiles')
      .select('id, name, avatar_url, role')
      .eq('id', tutorId)
      .single(),
    supabase
      .from('reviews')
      .select('id, rating, text, created_at, reviewer_id')
      .eq('tutor_id', tutorId)
      .order('created_at', { ascending: false }),
    // Check if the current student has a pending/countered request to this tutor
    user
      ? supabase
          .from('session_requests')
          .select('id')
          .eq('student_id', user.id)
          .eq('tutor_id', tutorId)
          .in('status', ['pending', 'countered'])
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  if (tutorResult.error || !tutorResult.data) notFound()
  if (profileResult.error || !profileResult.data) notFound()

  const tutor = tutorResult.data
  const profile = profileResult.data
  const rawReviews = reviewsResult.data ?? []
  const hasPendingRequest = !!pendingResult.data

  // Fetch reviewer names separately (reviewer_id FK not in hand-written types)
  const reviewerIds = [...new Set(rawReviews.map(r => r.reviewer_id))]
  const reviewerNames = new Map<string, string>()
  if (reviewerIds.length > 0) {
    const { data: reviewers } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', reviewerIds)
    for (const p of reviewers ?? []) reviewerNames.set(p.id, p.name)
  }
  const reviews = rawReviews.map(r => ({ ...r, reviewerName: reviewerNames.get(r.reviewer_id) ?? 'Student' }))

  const scores = (tutor.scores_json as Record<string, { total?: number; composite?: number }>) ?? {}
  const availability = (tutor.availability as Record<string, string[]>) ?? {}

  // Determine if current user is a student (only students can request sessions)
  let isStudent = false
  if (user) {
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isStudent = currentProfile?.role === 'student'
  }

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null

  const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="max-w-3xl">
      <Link href="/discover" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block">
        ← Back to Discover
      </Link>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-6 mb-8">
        <div className="shrink-0">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="h-20 w-20 rounded-full object-cover ring-2 ring-gray-200"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700">
              {initials}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
          {avgRating !== null && (
            <p className="mt-1 text-sm text-gray-500">
              ★ {avgRating.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              {tutor.sessions_count > 0 && ` · ${tutor.sessions_count} sessions`}
            </p>
          )}
          <div className="mt-2 flex gap-2 flex-wrap">
            {scores.sat?.total && <ScoreBadge test="SAT" score={scores.sat.total} />}
            {scores.act?.composite && <ScoreBadge test="ACT" score={scores.act.composite} />}
          </div>
        </div>
        {isStudent && (
          <div className="shrink-0 w-52">
            <RequestSessionModal
              tutorId={tutorId}
              subjects={tutor.subjects ?? []}
              hasPendingRequest={hasPendingRequest}
            />
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* ── Bio ─────────────────────────────────────────────────────── */}
        {tutor.bio_prompt && (
          <Card title="Approach">
            <p className="text-sm text-gray-500 italic mb-2">&ldquo;My approach to tutoring is…&rdquo;</p>
            <p className="text-gray-700 leading-relaxed">{tutor.bio_prompt}</p>
          </Card>
        )}

        {/* ── Subjects ────────────────────────────────────────────────── */}
        <Card title="Subjects">
          <div className="flex flex-wrap gap-2">
            {(tutor.subjects ?? []).map((s: string) => (
              <Badge key={s} variant="blue">{s}</Badge>
            ))}
          </div>
        </Card>

        {/* ── Availability ────────────────────────────────────────────── */}
        <Card title="Availability">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="w-28" />
                {DAYS.map(d => (
                  <th key={d} className="text-center py-1.5 px-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {DAY_LABEL[d]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SLOTS.map(slot => (
                <tr key={slot} className="border-t border-gray-100">
                  <td className="py-2 pr-3 text-sm font-medium text-gray-600">{SLOT_LABEL[slot]}</td>
                  {DAYS.map(d => {
                    const checked = (availability[d] ?? []).includes(slot)
                    return (
                      <td key={d} className="text-center py-2 px-2">
                        {checked
                          ? <span className="inline-block h-5 w-5 rounded bg-indigo-100 text-indigo-600 text-xs leading-5">✓</span>
                          : <span className="inline-block h-5 w-5 rounded bg-gray-50 text-gray-300 text-xs leading-5">–</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* ── Reviews ─────────────────────────────────────────────────── */}
        <Card title={`Reviews (${reviews.length})`}>
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-400">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="border-t border-gray-100 pt-4 first:border-0 first:pt-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{r.reviewerName}</span>
                    <StarRating rating={r.rating} />
                  </div>
                  {r.text && <p className="text-sm text-gray-600 leading-relaxed">{r.text}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">{title}</h2>
      {children}
    </div>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
      ))}
    </div>
  )
}
