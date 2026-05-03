interface Props {
  test: 'SAT' | 'ACT'
  score: number
}

export function ScoreBadge({ test, score }: Props) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
      <span className="font-normal text-indigo-400">{test}</span>
      {score}
    </span>
  )
}
