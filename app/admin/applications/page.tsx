import { createClient } from '@/lib/supabase/server'

export default async function ApplicationsPage() {
  const supabase = await createClient()
  const { data: apps } = await supabase
    .from('tutor_apps')
    .select('*')
    .order('created_at', { ascending: false })

  const pending = apps?.filter(a => a.status === 'pending') ?? []

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tutor Applications</h1>
      {pending.length === 0 ? (
        <p className="text-gray-500">No pending applications.</p>
      ) : (
        <p className="text-gray-600">{pending.length} pending — detailed view coming in Step 5.</p>
      )}
    </div>
  )
}
