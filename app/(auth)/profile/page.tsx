import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email, role, avatar_url')
    .eq('id', user.id)
    .single()

  // TODO: Step 4/5 — role-appropriate profile edit form

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
      <p className="text-gray-600">Logged in as {profile?.email} ({profile?.role})</p>
    </div>
  )
}
