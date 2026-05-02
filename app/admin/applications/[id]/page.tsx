interface Props {
  params: Promise<{ id: string }>
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { id } = await params
  // TODO: Step 5 — full application review, approve / reject actions, signed screenshot URL

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Application {id}</h1>
      <p className="text-gray-500">Full review UI coming soon.</p>
    </div>
  )
}
