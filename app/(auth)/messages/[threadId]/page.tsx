interface Props {
  params: Promise<{ threadId: string }>
}

export default async function MessageThreadPage({ params }: Props) {
  const { threadId } = await params

  // TODO: Step 9 — load session messages, subscribe to Supabase Realtime

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Thread {threadId}</h1>
      <p className="text-gray-500">Message thread coming soon.</p>
    </div>
  )
}
