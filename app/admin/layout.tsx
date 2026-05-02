import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TopNav } from '@/components/nav/TopNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role, avatar_url')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav role="admin" userName={profile.name} avatarUrl={profile.avatar_url} />
      <main className="mx-auto max-w-7xl px-8 pt-24 pb-12">
        {children}
      </main>
    </div>
  )
}
