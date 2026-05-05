'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { TutorCardData } from '@/components/tutor/TutorCard'
import { ScoreBadge } from '@/components/tutor/ScoreBadge'

interface Props {
  tutors: (TutorCardData & { compatibilityScore: number })[]
}

export function DiscoverModeB({ tutors }: Props) {
  const [index, setIndex] = useState(0)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const stack = tutors.filter(t => !dismissed.has(t.userId))
  const current = stack[index] ?? null

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center text-gray-400">
        <p className="text-lg font-medium">You've seen everyone!</p>
        <p className="mt-1 text-sm">Check back as new tutors join.</p>
      </div>
    )
  }

  const initials = current.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  function skip() {
    setDismissed(prev => new Set([...prev, current!.userId]))
    setIndex(0)
  }

  return (
    <div className="flex justify-center">
      <div className="w-[480px]">
        {/* Progress indicator */}
        <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
          <span>{stack.length} tutor{stack.length !== 1 ? 's' : ''} left</span>
          <span className="text-xs text-gray-400">
            {index + 1} / {stack.length}
          </span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          {/* Avatar + match score banner */}
          <div className="relative bg-indigo-600 px-8 pt-10 pb-8 flex flex-col items-center">
            <div className="absolute top-4 right-4 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
              {current.compatibilityScore}% match
            </div>

            {current.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.avatarUrl}
                alt={current.name}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-white"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center ring-4 ring-white">
                <span className="text-3xl font-bold text-white">{initials}</span>
              </div>
            )}

            <h2 className="mt-4 text-2xl font-bold text-white">{current.name}</h2>

            <div className="mt-2 flex gap-2">
              {current.scores.sat && <ScoreBadge test="SAT" score={current.scores.sat} />}
              {current.scores.act && <ScoreBadge test="ACT" score={current.scores.act} />}
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-6">
            {/* Subjects */}
            <div className="flex flex-wrap gap-2 mb-4">
              {current.subjects.map(s => (
                <span key={s} className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  {s}
                </span>
              ))}
            </div>

            {/* Bio */}
            <p className="text-sm text-gray-600 line-clamp-3">{current.bioPrompt}</p>

            {/* Stats */}
            <div className="mt-4 flex gap-6 text-center">
              {current.ratingAvg > 0 && (
                <div>
                  <p className="text-lg font-bold text-gray-900">{current.ratingAvg.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
              )}
              {current.sessionsCount > 0 && (
                <div>
                  <p className="text-lg font-bold text-gray-900">{current.sessionsCount}</p>
                  <p className="text-xs text-gray-500">Sessions</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="px-8 pb-8 flex gap-3">
            <button
              onClick={skip}
              className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Skip
            </button>
            <Link
              href={`/discover/${current.userId}`}
              className="flex-1 rounded-xl bg-indigo-600 py-3 text-center text-sm font-semibold text-white hover:bg-indigo-700"
            >
              View profile →
            </Link>
          </div>
        </div>

        {/* Peek at next card */}
        {stack.length > 1 && (
          <div className="-mt-3 mx-4 h-3 rounded-b-2xl border border-t-0 border-gray-200 bg-white opacity-60" />
        )}
      </div>
    </div>
  )
}
