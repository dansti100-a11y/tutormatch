import type { TutorProfile, StudentProfile, AvailabilitySlots } from '@/lib/types/app.types'

/** Weights must sum to 100. */
const WEIGHTS = { subjects: 40, availability: 35, styleTags: 15, rating: 10 } as const

/**
 * Computes a 0–100 compatibility score for Mode B (match stack).
 * Scaffolded in v1; only rendered when tutor pool crosses TUTOR_POOL_THRESHOLD.
 */
export function computeCompatibilityScore(
  tutor: TutorProfile,
  student: StudentProfile
): number {
  let score = 0

  // Subject overlap (0–40)
  const tutorSubjects = tutor.subjects ?? []
  const studentWeakSubjects = student.weak_subjects ?? []
  const overlap = tutorSubjects.filter(s => studentWeakSubjects.includes(s)).length
  const maxOverlap = Math.max(studentWeakSubjects.length, 1)
  score += (overlap / maxOverlap) * WEIGHTS.subjects

  // Availability overlap (0–35)
  const tutorAvail = (tutor.availability as AvailabilitySlots) ?? {}
  const studentAvail = (student.availability as AvailabilitySlots) ?? {}
  let sharedSlots = 0
  const allTutorSlots = Object.values(tutorAvail).flat().length
  const allStudentSlots = Object.values(studentAvail).flat().length

  for (const day of Object.keys(studentAvail) as (keyof AvailabilitySlots)[]) {
    const tSlots = tutorAvail[day] ?? []
    const sSlots = studentAvail[day] ?? []
    sharedSlots += tSlots.filter(t => sSlots.includes(t)).length
  }
  const maxSlots = Math.max(Math.min(allTutorSlots, allStudentSlots), 1)
  score += (Math.min(sharedSlots, maxSlots) / maxSlots) * WEIGHTS.availability

  // Style tags — v1 student profiles don't carry preferred tutor style yet;
  // use a neutral 50% until the field is added in v2.
  score += WEIGHTS.styleTags * 0.5

  // Rating (0–10)
  const rating = tutor.rating_avg ?? 0
  score += (rating / 5) * WEIGHTS.rating

  return Math.round(score)
}
