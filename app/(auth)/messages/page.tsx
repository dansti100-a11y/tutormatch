import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { relativeTime } from '@/lib/utils/format'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  // Fetch confirmed sessions the user is part of
  const { data: rawSessions } = await admin
    .from('sessions')
    .select(`
      id, subject, student_id, tutor_id,
      student:profiles!sessions_student_id_fkey(id, name, avatar_url),
      tutor:profiles!sessions_tutor_id_fkey(id, name, avatar_url)
    `)
    .or(`student_id.eq.${user.id},tutor_id.eq.${user.id}`)
    .eq('status', 'confirmed')

  const sessionIds = (rawSessions ?? []).map(s => s.id)

  // Fetch latest message per session
  const { data: allMessages } = sessionIds.length > 0
    ? await admin
        .from('messages')
        .select('session_id, content, created_at, sender_id')
        .in('session_id', sessionIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  // Index: session_id → latest message
  const latestMsg = new Map<string, { content: string; created_at: string; sender_id: string }>()
  for (const m of (allMessages ?? [])) {
    if (!latestMsg.has(m.session_id)) {
      latestMsg.set(m.session_id, m)
    }
  }

  const threads = (rawSessions ?? [])
    .map(s => {
      const student = s.student as { id: string; name: string; avatar_url: string | null } | null
      const tutor   = s.tutor   as { id: string; name: string; avatar_url: string | null } | null
      const isStudent = s.student_id === user.id
      const other = isStudent ? tutor : student
      const msg = latestMsg.get(s.id)
      return {
        sessionId:     s.id,
        subject:       s.subject,
        otherName:     other?.name ?? 'Unknown',
        otherAvatar:   other?.avatar_url ?? null,
        lastMessage:   msg?.content ?? null,
        lastMessageAt: msg?.created_at ?? null,
      }
    })
    .sort((a, b) => {
      if (!a.lastMessageAt) return 1
      if (!b.lastMessageAt) return -1
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    })

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      {threads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-gray-400">
          <p className="font-medium">No message threads yet</p>
          <p className="mt-1 text-sm">Threads open automatically when a session is confirmed.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {threads.map(t => {
            const initials = t.otherName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
            return (
              <Link
                key={t.sessionId}
                href={`/messages/${t.sessionId}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                {t.otherAvatar ? (
                  <img
                    src={t.otherAvatar}
                    alt={t.otherName}
                    className="h-10 w-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-medium text-gray-900 truncate">{t.otherName}</p>
                    {t.lastMessageAt && (
                      <span className="text-xs text-gray-400 shrink-0">
                        {relativeTime(t.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {t.lastMessage ?? <span className="italic">No messages yet</span>}
                  </p>
                  <p className="text-xs text-gray-400">{t.subject}</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
