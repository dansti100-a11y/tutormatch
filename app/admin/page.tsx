import { createAdminClient } from '@/lib/supabase/server'
import { relativeTime } from '@/lib/utils/format'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const admin = createAdminClient()

  const [
    { count: studentCount },
    { count: tutorCount },
    { count: pendingApps },
    { count: openReports },
    { data: recentSessions },
    { data: recentApps },
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    admin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'tutor'),
    admin.from('tutor_apps').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    admin
      .from('sessions')
      .select('id, subject, scheduled_at, status, student:student_id(name), tutor:tutor_id(name)')
      .order('created_at', { ascending: false })
      .limit(5),
    admin
      .from('tutor_apps')
      .select('id, applicant_name, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const stats = [
    { label: 'Students',             value: studentCount ?? 0, href: '/admin/users' },
    { label: 'Active Tutors',        value: tutorCount ?? 0,   href: '/admin/users' },
    { label: 'Pending Applications', value: pendingApps ?? 0,  href: '/admin/applications' },
    { label: 'Open Reports',         value: openReports ?? 0,  href: '/admin/reports' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-4 gap-6 mb-10">
        {stats.map(({ label, value, href }) => (
          <Link key={label} href={href} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:border-indigo-300 transition-colors">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent sessions */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Sessions</h2>
            <Link href="/admin/sessions" className="text-xs text-indigo-600 hover:text-indigo-800">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(recentSessions ?? []).length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-400">No sessions yet.</p>
            ) : (recentSessions ?? []).map(s => {
              const student = Array.isArray(s.student) ? s.student[0] : s.student
              const tutor = Array.isArray(s.tutor) ? s.tutor[0] : s.tutor
              return (
                <div key={s.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.subject}</p>
                    <p className="text-xs text-gray-500">{student?.name} ↔ {tutor?.name}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium
                      ${s.status === 'confirmed' ? 'bg-blue-100 text-blue-700'
                        : s.status === 'completed' ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'}`}>
                      {s.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">{relativeTime(s.scheduled_at)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent applications */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Applications</h2>
            <Link href="/admin/applications" className="text-xs text-indigo-600 hover:text-indigo-800">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(recentApps ?? []).length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-400">No applications yet.</p>
            ) : (recentApps ?? []).map(a => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">{a.applicant_name}</p>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium
                    ${a.status === 'pending' ? 'bg-yellow-100 text-yellow-700'
                      : a.status === 'approved' ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'}`}>
                    {a.status}
                  </span>
                  <Link href={`/admin/applications/${a.id}`} className="text-xs text-indigo-600 hover:text-indigo-800">
                    Review →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
