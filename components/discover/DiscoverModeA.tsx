import { TutorCard, type TutorCardData } from '@/components/tutor/TutorCard'

interface Props {
  tutors: TutorCardData[]
}

export function DiscoverModeA({ tutors }: Props) {
  if (tutors.length === 0) {
    return (
      <div className="py-20 text-center text-gray-400">
        <p className="text-lg font-medium">No tutors yet.</p>
        <p className="mt-1 text-sm">Check back soon — new tutors are joining!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-5">
      {tutors.map(tutor => (
        <TutorCard key={tutor.userId} tutor={tutor} />
      ))}
    </div>
  )
}
