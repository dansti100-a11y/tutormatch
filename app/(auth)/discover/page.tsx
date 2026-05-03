import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DiscoverModeA } from '@/components/discover/DiscoverModeA'
import type { TutorCardData } from '@/components/tutor/TutorCard'

export default async function DiscoverPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [tutorsResult, settingsResult] = await Promise.all([
    supabase
      .from('tutor_profiles')
      .select('user_id, subjects, bio_prompt, scores_json, rating_avg, sessions_count, profiles(id, name, avatar_url)')
      .order('rating_avg', { ascending: false }),
    supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'tutor_pool_threshold')
      .single(),
  ])

  const rawTutors = tutorsResult.data ?? []
  // threshold unused until Mode B is activated; kept for the mode check in v2
  void settingsResult

  const tutors: TutorCardData[] = rawTutors
    .filter(t => t.profiles !== null)
    .map(t => {
      const profile = t.profiles as { id: string; name: string; avatar_url: string | null }
      const scores = (t.scores_json as Record<string, { total?: number; composite?: number }>) ?? {}
      return {
        userId: t.user_id,
        name: profile.name,
        avatarUrl: profile.avatar_url,
        subjects: t.subjects ?? [],
        scores: {
          sat: scores.sat?.total,
          act: scores.act?.composite,
        },
        ratingAvg: t.rating_avg ?? 0,
        sessionsCount: t.sessions_count ?? 0,
        bioPrompt: t.bio_prompt ?? '',
      }
    })

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find a Tutor</h1>
          <p className="mt-1 text-sm text-gray-500">
            {tutors.length === 0
              ? 'No tutors yet.'
              : `${tutors.length} tutor${tutors.length === 1 ? '' : 's'} available`}
          </p>
        </div>
      </div>
      <DiscoverModeA tutors={tutors} />
    </div>
  )
}
