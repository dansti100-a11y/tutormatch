import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { ScoreBadge } from './ScoreBadge'

export interface TutorCardData {
  userId: string
  name: string
  avatarUrl: string | null
  subjects: string[]
  scores: { sat?: number; act?: number }
  ratingAvg: number
  sessionsCount: number
  bioPrompt: string
}

interface Props {
  tutor: TutorCardData
}

export function TutorCard({ tutor }: Props) {
  const initials = tutor.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const bioSnippet = tutor.bioPrompt.length > 100
    ? tutor.bioPrompt.slice(0, 100).trimEnd() + '…'
    : tutor.bioPrompt

  return (
    <Link
      href={`/discover/${tutor.userId}`}
      className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5
        hover:border-indigo-300 hover:shadow-md transition-all"
    >
      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        {tutor.avatarUrl ? (
          <img
            src={tutor.avatarUrl}
            alt={tutor.name}
            className="h-12 w-12 rounded-full object-cover ring-1 ring-gray-200 shrink-0"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{tutor.name}</p>
          {tutor.ratingAvg > 0 && (
            <p className="text-xs text-gray-500">
              ★ {tutor.ratingAvg.toFixed(1)}
              <span className="ml-1 text-gray-400">({tutor.sessionsCount} sessions)</span>
            </p>
          )}
        </div>
      </div>

      {/* Scores */}
      {(tutor.scores.sat || tutor.scores.act) && (
        <div className="flex gap-2">
          {tutor.scores.sat && <ScoreBadge test="SAT" score={tutor.scores.sat} />}
          {tutor.scores.act && <ScoreBadge test="ACT" score={tutor.scores.act} />}
        </div>
      )}

      {/* Subjects */}
      <div className="flex flex-wrap gap-1.5">
        {tutor.subjects.slice(0, 4).map(s => (
          <Badge key={s} variant="default">{s}</Badge>
        ))}
        {tutor.subjects.length > 4 && (
          <Badge variant="default">+{tutor.subjects.length - 4} more</Badge>
        )}
      </div>

      {/* Bio snippet */}
      {bioSnippet && (
        <p className="text-sm text-gray-500 leading-relaxed">{bioSnippet}</p>
      )}
    </Link>
  )
}
