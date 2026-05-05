import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'

type Tab = 'pending' | 'approved' | 'rejected'

interface Props {
  searchParams: Promise<{ tab?: string }>
}

export default async function ApplicationsPage({ searchParams }: Props) {
  const { tab } = await searchParams
  const active: Tab = (tab === 'approved' || tab === 'rejected') ? tab : 'pending'

  const admin = createAdminClient()
  const { data: apps } = await admin
    .from('tutor_apps')
    .select('id, applicant_name, applicant_email, subjects, scores_json, created_at, status')
    .order('created_at', { ascending: false })

  const all = apps ?? []
  const counts = {
    pending:  all.filter(a => a.status === 'pending').length,
    approved: all.filter(a => a.status === 'approved').length,
    rejected: all.filter(a => a.status === 'rejected').length,
  }
  const visible = all.filter(a => a.status === active)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tutor Applications</h1>

      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {(['pending', 'approved', 'rejected'] as Tab[]).map(t => (
          <Link
            key={t}
            href={`/admin/applications?tab=${t}`}
            className={`px-4 py-2 text-sm font-medium capitalize rounded-t-lg border-b-2 transition-colors
              ${active === t
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t} <span className="ml-1 text-xs text-gray-400">({counts[t]})</span>
          </Link>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-gray-500 text-sm">No {active} applications.</p>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Name', 'Email', 'Subjects', 'Scores', 'Applied', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visible.map(app => {
                const scores = (app.scores_json as Record<string, { total?: number; composite?: number }>) ?? {}
                const sat = scores.sat?.total
                const act = scores.act?.composite
                return (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{app.applicant_name}</td>
                    <td className="px-4 py-3 text-gray-600">{app.applicant_email}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {(app.subjects ?? []).slice(0, 2).join(', ')}
                      {(app.subjects ?? []).length > 2 && ` +${(app.subjects ?? []).length - 2}`}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {sat ? `SAT ${sat}` : ''}{sat && act ? ' · ' : ''}{act ? `ACT ${act}` : ''}
                      {!sat && !act ? '—' : ''}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/applications/${app.id}`}
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-xs"
                      >
                        Review →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
