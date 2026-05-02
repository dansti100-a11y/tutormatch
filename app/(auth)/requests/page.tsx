import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function RequestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // TODO: Step 7 — fetch pending session_requests for this tutor

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Session Requests</h1>
      <p className="text-gray-500">No pending requests.</p>
    </div>
  )
}
