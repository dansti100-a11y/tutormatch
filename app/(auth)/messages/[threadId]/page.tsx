import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { ThreadView, type MessageData } from '@/components/messages/ThreadView'

interface Props {
  params: Promise<{ threadId: string }>
}

export default async function MessageThreadPage({ params }: Props) {
  const { threadId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  // Fetch the session and verify the current user is a participant
  const { data: session, error: sessionError } = await admin
    .from('sessions')
    .select(`
      id, subject, status, student_id, tutor_id,
      student:profiles!sessions_student_id_fkey(id, name),
      tutor:profiles!sessions_tutor_id_fkey(id, name)
    `)
    .eq('id', threadId)
    .single()

  if (sessionError || !session) notFound()

  const isParticipant = session.student_id === user.id || session.tutor_id === user.id
  if (!isParticipant) notFound()

  if (session.status !== 'confirmed') {
    redirect('/messages')
  }

  const student = session.student as { id: string; name: string } | null
  const tutor   = session.tutor   as { id: string; name: string } | null
  const isStudent = session.student_id === user.id
  const otherName = isStudent ? (tutor?.name ?? 'Tutor') : (student?.name ?? 'Student')

  // Fetch message history
  const { data: rawMessages } = await admin
    .from('messages')
    .select('id, content, created_at, sender_id')
    .eq('session_id', threadId)
    .order('created_at', { ascending: true })

  const messages: MessageData[] = (rawMessages ?? []).map(m => ({
    id:         m.id,
    content:    m.content,
    createdAt:  m.created_at,
    senderId:   m.sender_id,
    senderName: m.sender_id === user.id ? 'You' : otherName,
  }))

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link href="/messages" className="text-sm text-gray-500 hover:text-gray-700">
          ← Messages
        </Link>
        <span className="text-gray-300">·</span>
        <div>
          <span className="font-semibold text-gray-900">{otherName}</span>
          <span className="ml-2 text-sm text-gray-400">{session.subject}</span>
        </div>
      </div>

      <ThreadView
        sessionId={threadId}
        currentUserId={user.id}
        initialMessages={messages}
        otherPartyName={otherName}
      />
    </div>
  )
}
