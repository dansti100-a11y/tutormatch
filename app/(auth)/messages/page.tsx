import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // TODO: Step 9 — fetch all sessions with messages for this user, ordered by last message

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
      <p className="text-gray-500">No message threads yet.</p>
    </div>
  )
}
