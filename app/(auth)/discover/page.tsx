import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DiscoverPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // TODO: Step 6 — fetch tutors + threshold, render DiscoverFeed (Mode A or B)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Find a Tutor</h1>
      <p className="text-gray-500">Tutor cards coming soon.</p>
    </div>
  )
}
