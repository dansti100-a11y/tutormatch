import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // TODO: Step 8 — fetch upcoming + past sessions for the current user (student or tutor)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Sessions</h1>
      <p className="text-gray-500">No sessions yet.</p>
    </div>
  )
}
