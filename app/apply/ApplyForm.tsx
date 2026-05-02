'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { submitApplication, type ApplyState } from './actions'

const SUBJECTS = [
  'SAT Math',
  'SAT Reading & Writing',
  'ACT Math',
  'ACT English',
  'ACT Reading',
  'ACT Science',
] as const

const DAYS = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
] as const

const TIME_BLOCKS = [
  { key: 'morning',   label: 'Morning',   sub: '7am – 12pm' },
  { key: 'afternoon', label: 'Afternoon', sub: '12pm – 5pm'  },
  { key: 'evening',   label: 'Evening',   sub: '5pm – 9pm'   },
] as const

const initialState: ApplyState = { status: 'idle' }

export function ApplyForm() {
  const [state, formAction, pending] = useActionState(submitApplication, initialState)
  const [tests, setTests] = useState<{ sat: boolean; act: boolean }>({ sat: false, act: false })

  if (state.status === 'success') {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Application submitted!</h2>
        <p className="text-gray-600 max-w-sm mx-auto">
          Thanks for applying. We&apos;ll review your application and reach out to you by email within a few days.
        </p>
      </div>
    )
  }

  const fieldError = (state.status === 'error' && state.errors) ? state.errors : {}
  const globalError = state.status === 'error' ? state.message : undefined

  return (
    <form action={formAction} className="space-y-10">

      {/* ── Personal info ─────────────────────────────────────────────── */}
      <Section title="Personal info">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Full name"
            name="applicant_name"
            placeholder="Alex Johnson"
            required
            error={fieldError.applicant_name?.[0]}
          />
          <Input
            label="Email"
            name="applicant_email"
            type="email"
            placeholder="you@example.com"
            required
            error={fieldError.applicant_email?.[0]}
          />
        </div>
      </Section>

      {/* ── Test scores ───────────────────────────────────────────────── */}
      <Section title="Your scores" subtitle="Select the tests you've taken and enter your scores.">
        <div className="flex gap-6 mb-5">
          <Checkbox
            id="test-sat"
            label="I took the SAT"
            checked={tests.sat}
            onChange={v => setTests(t => ({ ...t, sat: v }))}
          />
          <Checkbox
            id="test-act"
            label="I took the ACT"
            checked={tests.act}
            onChange={v => setTests(t => ({ ...t, act: v }))}
          />
        </div>

        {tests.sat && (
          <div className="mt-3 grid grid-cols-2 gap-4 pl-1">
            <Input
              label="SAT Total (400–1600)"
              name="sat_total"
              type="number"
              min={400}
              max={1600}
              placeholder="1450"
              error={fieldError.sat_total?.[0]}
            />
          </div>
        )}
        {tests.act && (
          <div className="mt-3 grid grid-cols-2 gap-4 pl-1">
            <Input
              label="ACT Composite (1–36)"
              name="act_composite"
              type="number"
              min={1}
              max={36}
              placeholder="34"
              error={fieldError.act_composite?.[0]}
            />
          </div>
        )}

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Score screenshot <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            name="screenshot"
            type="file"
            accept="image/*,.pdf"
            className="block w-full text-sm text-gray-500
              file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50
              file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700
              hover:file:bg-indigo-100 transition-colors cursor-pointer"
          />
          <p className="mt-1 text-xs text-gray-400">PNG, JPG, or PDF · max 5 MB · visible only to the admin</p>
        </div>
      </Section>

      {/* ── Subjects ──────────────────────────────────────────────────── */}
      <Section
        title="Subjects you can teach"
        subtitle="Select all that apply."
        error={fieldError.subjects?.[0]}
      >
        <div className="grid grid-cols-3 gap-3">
          {SUBJECTS.map(subject => (
            <label key={subject} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                name="subjects"
                value={subject}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{subject}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* ── Availability ──────────────────────────────────────────────── */}
      <Section title="Your availability" subtitle="Check the blocks when you're generally free to tutor.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="w-32" />
                {DAYS.map(d => (
                  <th key={d.key} className="text-center py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_BLOCKS.map(block => (
                <tr key={block.key} className="border-t border-gray-100">
                  <td className="py-3 pr-4">
                    <span className="text-sm font-medium text-gray-700">{block.label}</span>
                    <span className="block text-xs text-gray-400">{block.sub}</span>
                  </td>
                  {DAYS.map(d => (
                    <td key={d.key} className="text-center py-3 px-3">
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
        </div>
      </Section>

      {/* ── Bio prompt ────────────────────────────────────────────────── */}
      <Section
        title="About your approach"
        subtitle='Complete the prompt below. Students will see this on your profile.'
        error={fieldError.bio?.[0]}
      >
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 italic">
            &ldquo;My approach to tutoring is…&rdquo;
          </p>
          <Textarea
            name="bio"
            rows={4}
            placeholder="...focused on understanding the why, not just the how. I like to start each session by finding where my student is stuck, then work backwards to fill in the gaps."
            error={fieldError.bio?.[0]}
          />
        </div>
      </Section>

      {globalError && (
        <p className="text-sm text-red-600 text-center">{globalError}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? 'Submitting…' : 'Submit application'}
      </Button>

      <p className="text-center text-xs text-gray-400">
        Already approved?{' '}
        <a href="/login" className="text-indigo-600 hover:text-indigo-700">Sign in</a>
      </p>
    </form>
  )
}

// ── Small helpers ────────────────────────────────────────────────────────────

function Section({
  title,
  subtitle,
  error,
  children,
}: {
  title: string
  subtitle?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>
      {children}
    </div>
  )
}

function Checkbox({
  id,
  label,
  checked,
  onChange,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-2.5 cursor-pointer">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}
