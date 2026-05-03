'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { saveOnboarding, type OnboardingState } from './actions'

// ── Constants ────────────────────────────────────────────────────────────────

const GRADES = [
  { value: 9,  label: 'Grade 9'   },
  { value: 10, label: 'Grade 10'  },
  { value: 11, label: 'Grade 11'  },
  { value: 12, label: 'Grade 12'  },
  { value: 13, label: 'Graduated' },
]

const SUBJECTS_BY_TEST: Record<string, string[]> = {
  SAT:  ['SAT Math', 'SAT Reading & Writing'],
  ACT:  ['ACT Math', 'ACT English', 'ACT Reading', 'ACT Science'],
  both: ['SAT Math', 'SAT Reading & Writing', 'ACT Math', 'ACT English', 'ACT Reading', 'ACT Science'],
}

const FORMATS = [
  { value: 'in-person', label: 'In-person' },
  { value: 'virtual',   label: 'Virtual'   },
  { value: 'either',    label: 'Either'    },
]

const STYLE_TAGS = [
  { value: 'visual',           label: 'Visual learner'      },
  { value: 'drill-heavy',      label: 'Drill-heavy practice' },
  { value: 'conceptual',       label: 'Conceptual deep-dives' },
  { value: 'strategy-focused', label: 'Test strategy'        },
]

const DAYS = [
  { key: 'mon', label: 'Mon' }, { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' }, { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' }, { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
] as const

const TIME_BLOCKS = [
  { key: 'morning',   label: 'Morning',   sub: '7am – 12pm' },
  { key: 'afternoon', label: 'Afternoon', sub: '12pm – 5pm'  },
  { key: 'evening',   label: 'Evening',   sub: '5pm – 9pm'   },
] as const

const TOTAL_STEPS = 4

// ── Component ─────────────────────────────────────────────────────────────────

interface Props { name: string }

export function OnboardingForm({ name }: Props) {
  const [state, formAction, pending] = useActionState<OnboardingState, FormData>(
    saveOnboarding,
    { status: 'idle' }
  )
  const [step, setStep]             = useState(1)
  const [targetTest, setTargetTest] = useState<'SAT' | 'ACT' | 'both'>('SAT')
  const [grade, setGrade]           = useState<number>(11)

  const fieldError = (state.status === 'error' && state.errors) ? state.errors : {}
  const globalError = state.status === 'error' ? state.message : undefined

  return (
    <form action={formAction}>
      {/* Hidden fields carry data from earlier steps */}
      <input type="hidden" name="grade"       value={grade}      />
      <input type="hidden" name="target_test" value={targetTest} />

      {/* ── Progress bar ───────────────────────────────────────────── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">Step {step} of {TOTAL_STEPS}</span>
          <span className="text-sm text-gray-400">{Math.round((step / TOTAL_STEPS) * 100)}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-200">
          <div
            className="h-1.5 rounded-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Step 1: About you ──────────────────────────────────────── */}
      {step === 1 && (
        <StepShell
          title={`Welcome, ${name.split(' ')[0]}!`}
          subtitle="Let's get a few basics so we can find the right tutor for you."
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">What grade are you in?</label>
              <div className="flex flex-wrap gap-2">
                {GRADES.map(g => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGrade(g.value)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors
                      ${grade === g.value
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'}`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Which test are you preparing for?</label>
              <div className="flex gap-3">
                {(['SAT', 'ACT', 'both'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTargetTest(t)}
                    className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-colors
                      ${targetTest === t
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
                  >
                    {t === 'both' ? 'Both' : t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </StepShell>
      )}

      {/* ── Step 2: Goals ──────────────────────────────────────────── */}
      {step === 2 && (
        <StepShell
          title="Your goals"
          subtitle="Where are you starting from, and where do you want to get to?"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Which subjects do you most want help with?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SUBJECTS_BY_TEST[targetTest].map(s => (
                  <label key={s} className="flex items-center gap-2.5 rounded-lg border border-gray-200 px-3 py-2.5 cursor-pointer hover:border-gray-300 transition-colors">
                    <input
                      type="checkbox"
                      name="weak_subjects"
                      value={s}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{s}</span>
                  </label>
                ))}
              </div>
              {fieldError.weak_subjects && (
                <p className="mt-1 text-xs text-red-600">{fieldError.weak_subjects[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={targetTest === 'ACT' ? 'Current ACT score (optional)' : 'Current SAT score (optional)'}
                name="current_score"
                type="number"
                placeholder={targetTest === 'ACT' ? '28' : '1200'}
                min={targetTest === 'ACT' ? 1 : 400}
                max={targetTest === 'ACT' ? 36 : 1600}
              />
              <Input
                label={targetTest === 'ACT' ? 'Goal ACT score' : 'Goal SAT score'}
                name="goal_score"
                type="number"
                placeholder={targetTest === 'ACT' ? '34' : '1450'}
                min={targetTest === 'ACT' ? 1 : 400}
                max={targetTest === 'ACT' ? 36 : 1600}
              />
            </div>
          </div>
        </StepShell>
      )}

      {/* ── Step 3: Availability ───────────────────────────────────── */}
      {step === 3 && (
        <StepShell
          title="Your availability"
          subtitle="Check the blocks when you're generally free. Tutors will use this to propose times."
        >
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="w-28" />
                {DAYS.map(d => (
                  <th key={d.key} className="text-center py-2 px-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_BLOCKS.map(block => (
                <tr key={block.key} className="border-t border-gray-100">
                  <td className="py-3 pr-3">
                    <span className="text-sm font-medium text-gray-700">{block.label}</span>
                    <span className="block text-xs text-gray-400">{block.sub}</span>
                  </td>
                  {DAYS.map(d => (
                    <td key={d.key} className="text-center py-3 px-2">
                      <input
                        type="checkbox"
                        name={`avail_${d.key}_${block.key}`}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </StepShell>
      )}

      {/* ── Step 4: Preferences ────────────────────────────────────── */}
      {step === 4 && (
        <StepShell
          title="Your preferences"
          subtitle="Help tutors understand how you learn best."
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred session format</label>
              <div className="flex gap-3">
                {FORMATS.map(f => (
                  <label
                    key={f.value}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors
                      has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50 has-[:checked]:text-indigo-700
                      border-gray-200 text-gray-700 hover:border-gray-300"
                  >
                    <input
                      type="radio"
                      name="preferred_format"
                      value={f.value}
                      defaultChecked={f.value === 'either'}
                      className="sr-only"
                    />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning style <span className="font-normal text-gray-400">(optional — pick any that fit)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STYLE_TAGS.map(tag => (
                  <label key={tag.value} className="flex items-center gap-2.5 rounded-lg border border-gray-200 px-3 py-2.5 cursor-pointer hover:border-gray-300 transition-colors">
                    <input
                      type="checkbox"
                      name="style_tags"
                      value={tag.value}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{tag.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </StepShell>
      )}

      {/* ── Navigation ─────────────────────────────────────────────── */}
      {globalError && <p className="mb-4 text-sm text-red-600 text-center">{globalError}</p>}

      <div className="flex items-center justify-between mt-8">
        {step > 1 ? (
          <Button type="button" variant="ghost" onClick={() => setStep(s => s - 1)}>
            ← Back
          </Button>
        ) : (
          <div />
        )}

        {step < TOTAL_STEPS ? (
          <Button type="button" onClick={() => setStep(s => s + 1)}>
            Continue →
          </Button>
        ) : (
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : 'Find my tutor →'}
          </Button>
        )}
      </div>
    </form>
  )
}

function StepShell({ title, subtitle, children }: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}
