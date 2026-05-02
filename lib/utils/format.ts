/** Format a datetime string as "Mon, May 12 at 4:00 PM" */
export function formatSessionDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/** Format a score badge label, e.g. { test: 'ACT', section: 'Math', score: 36 } → "ACT 36 Math" */
export function formatScoreBadge(test: string, section: string, score: number): string {
  return `${test} ${score} ${section}`
}

/** Relative time, e.g. "3 days ago", "in 2 hours" */
export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const abs = Math.abs(diff)
  const future = diff < 0
  const prefix = future ? 'in ' : ''
  const suffix = future ? '' : ' ago'

  if (abs < 60_000) return 'just now'
  if (abs < 3_600_000) return `${prefix}${Math.floor(abs / 60_000)}m${suffix}`
  if (abs < 86_400_000) return `${prefix}${Math.floor(abs / 3_600_000)}h${suffix}`
  return `${prefix}${Math.floor(abs / 86_400_000)}d${suffix}`
}
