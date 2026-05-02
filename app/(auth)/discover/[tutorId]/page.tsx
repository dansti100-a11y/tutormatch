interface Props {
  params: Promise<{ tutorId: string }>
}

export default async function TutorProfilePage({ params }: Props) {
  const { tutorId } = await params

  // TODO: Step 6 — fetch tutor profile, render full profile + "Request a Session" button

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tutor Profile</h1>
      <p className="text-gray-500">Profile for {tutorId} coming soon.</p>
    </div>
  )
}
