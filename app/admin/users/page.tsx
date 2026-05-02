import { createClient } from '@/lib/supabase/server'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: users, count } = await supabase
    .from('profiles')
    .select('id, name, email, role, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users ({count ?? 0})</h1>
      {/* TODO: Step 11 — paginated table with remove-account action */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Name', 'Email', 'Role', 'Joined'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(users ?? []).map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${u.role === 'admin' ? 'bg-purple-100 text-purple-700'
                      : u.role === 'tutor' ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
