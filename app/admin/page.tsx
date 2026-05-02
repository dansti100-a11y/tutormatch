import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: studentCount },
    { count: tutorCount },
    { count: pendingApps },
    { count: openReports },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'tutor'),
    supabase.from('tutor_apps').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'open'),
  ])

  const stats = [
    { label: 'Students',            value: studentCount ?? 0 },
    { label: 'Active Tutors',       value: tutorCount ?? 0  },
    { label: 'Pending Applications',value: pendingApps ?? 0  },
    { label: 'Open Reports',        value: openReports ?? 0  },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-4 gap-6">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>
      {/* TODO: Step 11 — recent activity feed */}
    </div>
  )
}
