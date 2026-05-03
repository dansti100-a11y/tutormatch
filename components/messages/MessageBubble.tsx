interface Props {
  content: string
  senderName: string
  createdAt: string
  isOwn: boolean
}

export function MessageBubble({ content, senderName, createdAt, isOwn }: Props) {
  const time = new Date(createdAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return (
    <div className={`flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
      <span className="text-xs text-gray-400">{isOwn ? 'You' : senderName}</span>
      <div
        className={`max-w-md rounded-2xl px-4 py-2.5 text-sm leading-relaxed
          ${isOwn
            ? 'bg-indigo-600 text-white rounded-br-sm'
            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
          }`}
      >
        {content}
      </div>
      <span className="text-xs text-gray-300">{time}</span>
    </div>
  )
}
