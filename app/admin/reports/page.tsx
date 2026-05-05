import { createAdminClient } from '@/lib/supabase/server'
import { relativeTime } from '@/lib/utils/format'
import { ResolveButton } from './ResolveButton'

export default async function ReportsPage() {
  const supabase = createAdminClient()
  const { data: reports } = await supabase
    .from('reports')
    .select('id, reason, status, created_at, reporter:reporter_id(name), reported:reported_id(name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports</h1>
      {(reports ?? []).length === 0 ? (
        <p className="text-gray-500">No reports filed.</p>
      ) : (
        <div className="space-y-3">
          {reports!.map(r => {
            const reporter = Array.isArray(r.reporter) ? r.reporter[0] : r.reporter
            const reported = Array.isArray(r.reported) ? r.reported[0] : r.reported
            return (
              <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      <span className="text-red-600">{reported?.name}</span>
                      {' '}reported by {reporter?.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">{r.reason}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium
                      ${r.status === 'open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {r.status}
                    </span>
                    <span className="text-xs text-gray-400">{relativeTime(r.created_at)}</span>
                    {r.status === 'open' && <ResolveButton reportId={r.id} />}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
