import type { AvailabilitySlots } from '@/lib/types/app.types'

export const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
export type Day = (typeof DAYS)[number]

export const DAY_LABELS: Record<Day, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
}

export const TIME_SLOTS = [
  '7am', '8am', '9am', '10am', '11am', '12pm',
  '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm',
]

/** Returns a human-readable snippet of the first available windows, e.g. "Mon 4pm, Tue 3pm" */
export function availabilitySnippet(availability: AvailabilitySlots, maxSlots = 3): string {
  const slots: string[] = []
  for (const day of DAYS) {
    const times = availability[day] ?? []
    for (const time of times) {
      slots.push(`${DAY_LABELS[day].slice(0, 3)} ${time}`)
      if (slots.length >= maxSlots) return slots.join(', ')
    }
  }
  return slots.length ? slots.join(', ') : 'Availability not set'
}

/** Returns true if the two availability maps share at least one slot. */
export function hasOverlap(a: AvailabilitySlots, b: AvailabilitySlots): boolean {
  for (const day of DAYS) {
    const aSlots = a[day] ?? []
    const bSlots = b[day] ?? []
    if (aSlots.some(t => bSlots.includes(t))) return true
  }
  return false
}
