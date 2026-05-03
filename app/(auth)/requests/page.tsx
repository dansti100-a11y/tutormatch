import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RequestCard, type RequestCardData } from '@/components/session/RequestCard'

export default async function RequestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify the user is a tutor
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'tutor') redirect('/sessions')

  // Use admin client to read student profiles without RLS blocking the join
  const admin = createAdminClient()

  const { data: rawRequests } = await admin
    .from('session_requests')
    .select('*, student:profiles!session_requests_student_id_fkey(id, name)')
    .eq('tutor_id', user.id)
    .in('status', ['pending', 'countered'])
    .order('created_at', { ascending: false })

  const requests: RequestCardData[] = (rawRequests ?? []).map(r => {
    const student = r.student as { id: string; name: string } | null
    return {
      id: r.id,
      studentName: student?.name ?? 'Unknown student',
      subject: r.subject,
      format: r.format,
      note: r.note,
      timeOptions: (r.time_options as string[]) ?? [],
      status: r.status,
      counterTimes: (r.counter_times as string[] | null) ?? null,
      createdAt: r.created_at,
    }
  })

  const pending = requests.filter(r => r.status === 'pending')
  const countered = requests.filter(r => r.status === 'countered')

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Session Requests</h1>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-gray-400">
          <p className="font-medium">No pending requests</p>
          <p className="mt-1 text-sm">New session requests from students will appear here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {pending.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Pending ({pending.length})
              </h2>
              <div className="space-y-4">
                {pending.map(r => <RequestCard key={r.id} request={r} />)}
              </div>
            </section>
          )}
          {countered.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Countered — awaiting student ({countered.length})
              </h2>
              <div className="space-y-4">
                {countered.map(r => <RequestCard key={r.id} request={r} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
