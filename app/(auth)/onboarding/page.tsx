import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingForm } from './OnboardingForm'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single()

  // Already completed — send them to discover
  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('onboarding_done')
    .eq('user_id', user.id)
    .single()

  if (studentProfile?.onboarding_done) redirect('/discover')

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-16 px-4">
      <div className="w-full max-w-xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
          <OnboardingForm name={profile?.name || 'there'} />
        </div>
      </div>
    </div>
  )
}
