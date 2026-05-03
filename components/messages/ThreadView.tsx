'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { MessageBubble } from './MessageBubble'
import { sendMessage } from '@/app/(auth)/messages/actions'

export interface MessageData {
  id: string
  content: string
  createdAt: string
  senderId: string
  senderName: string
}

interface Props {
  sessionId: string
  currentUserId: string
  initialMessages: MessageData[]
  otherPartyName: string
}

export function ThreadView({ sessionId, currentUserId, initialMessages, otherPartyName }: Props) {
  const [messages, setMessages] = useState<MessageData[]>(initialMessages)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Subscribe to real-time new messages
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `session_id=eq.${sessionId}`,
        },
        payload => {
          const row = payload.new as {
            id: string
            content: string
            created_at: string
            sender_id: string
          }
          // Don't duplicate messages the current user just sent
          setMessages(prev => {
            if (prev.some(m => m.id === row.id)) return prev
            return [
              ...prev,
              {
                id:         row.id,
                content:    row.content,
                createdAt:  row.created_at,
                senderId:   row.sender_id,
                senderName: row.sender_id === currentUserId ? 'You' : otherPartyName,
              },
            ]
          })
        }
      )
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [sessionId, currentUserId, otherPartyName, supabase])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    const text = draft.trim()
    if (!text) return
    setDraft('')
    setError(null)

    // Optimistically append
    const tempId = `temp-${Date.now()}`
    setMessages(prev => [
      ...prev,
      { id: tempId, content: text, createdAt: new Date().toISOString(), senderId: currentUserId, senderName: 'You' },
    ])

    startTransition(async () => {
      const result = await sendMessage(sessionId, text)
      if (result?.error) {
        setError(result.error)
        // Roll back the optimistic message
        setMessages(prev => prev.filter(m => m.id !== tempId))
      }
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 px-1">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">
            No messages yet. Say hello!
          </p>
        )}
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            content={msg.content}
            senderName={msg.senderName}
            createdAt={msg.createdAt}
            isOwn={msg.senderId === currentUserId}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 pt-4">
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <div className="flex gap-3">
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
            disabled={isPending}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm
              focus:outline-none focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500
              disabled:bg-gray-50 disabled:text-gray-500 placeholder:text-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={isPending || !draft.trim()}
            className="self-end rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white
              hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
