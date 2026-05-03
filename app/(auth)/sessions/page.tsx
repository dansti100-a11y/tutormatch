import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SessionCard, type SessionCardData } from '@/components/session/SessionCard'
import { CounteredRequestCard, type CounteredRequestData } from '@/components/session/CounteredRequestCard'

export default async function SessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = (profile?.role ?? 'student') as 'student' | 'tutor' | 'admin'
  const admin = createAdminClient()

  // Fetch sessions with participant names
  const { data: rawSessions } = await admin
    .from('sessions')
    .select(`
      id, subject, scheduled_at, format, status, location_or_link,
      student_id, tutor_id,
      student:profiles!sessions_student_id_fkey(id, name),
      tutor:profiles!sessions_tutor_id_fkey(id, name)
    `)
    .or(`student_id.eq.${user.id},tutor_id.eq.${user.id}`)
    .neq('status', 'cancelled')
    .order('scheduled_at', { ascending: true })

  // Fetch which sessions already have reviews from this student
  const sessionIds = (rawSessions ?? []).map(s => s.id)
  const { data: reviews } = sessionIds.length > 0
    ? await supabase
        .from('reviews')
        .select('session_id')
        .eq('reviewer_id', user.id)
        .in('session_id', sessionIds)
    : { data: [] }

  const reviewedIds = new Set((reviews ?? []).map(r => r.session_id))

  const sessions: SessionCardData[] = (rawSessions ?? []).map(s => {
    const student = s.student as { id: string; name: string } | null
    const tutor   = s.tutor   as { id: string; name: string } | null
    const isStudent = s.student_id === user.id
    return {
      id:            s.id,
      subject:       s.subject,
      scheduledAt:   s.scheduled_at,
      format:        s.format,
      status:        s.status,
      locationOrLink: s.location_or_link,
      otherPartyName: isStudent ? (tutor?.name ?? 'Tutor') : (student?.name ?? 'Student'),
      otherPartyRole: isStudent ? 'tutor' : 'student',
      tutorId:       s.tutor_id,
      hasReview:     reviewedIds.has(s.id),
      viewerRole:    role,
    }
  })

  const now = new Date()
  const upcoming = sessions.filter(s => s.status === 'confirmed' && new Date(s.scheduledAt) >= now)
  const past     = sessions.filter(s => s.status === 'completed' || (s.status === 'confirmed' && new Date(s.scheduledAt) < now))

  // For students: also fetch their countered requests so they can respond
  let counteredRequests: CounteredRequestData[] = []
  if (role === 'student') {
    const { data: countered } = await admin
      .from('session_requests')
      .select('id, subject, format, counter_times, tutor:profiles!session_requests_tutor_id_fkey(id, name)')
      .eq('student_id', user.id)
      .eq('status', 'countered')

    counteredRequests = (countered ?? []).map(r => {
      const tutor = r.tutor as { id: string; name: string } | null
      return {
        id:          r.id,
        tutorName:   tutor?.name ?? 'Tutor',
        subject:     r.subject,
        format:      r.format,
        counterTimes: (r.counter_times as string[]) ?? [],
      }
    })
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Sessions</h1>

      {counteredRequests.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Needs your response
          </h2>
          <div className="space-y-4">
            {counteredRequests.map(r => (
              <CounteredRequestCard key={r.id} request={r} />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Upcoming
          </h2>
          <div className="space-y-4">
            {upcoming.map(s => <SessionCard key={s.id} session={s} />)}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Past
          </h2>
          <div className="space-y-4">
            {[...past].reverse().map(s => <SessionCard key={s.id} session={s} />)}
          </div>
        </section>
      )}

      {sessions.length === 0 && counteredRequests.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-gray-400">
          <p className="font-medium">No sessions yet</p>
          <p className="mt-1 text-sm">
            {role === 'student'
              ? 'Find a tutor and request your first session.'
              : 'Sessions will appear here once students book with you.'}
          </p>
        </div>
      )}
    </div>
  )
}
