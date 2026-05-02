import Link from 'next/link'
import { ApplyForm } from './ApplyForm'

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Minimal nav */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-8">
          <Link href="/" className="text-lg font-bold text-indigo-600 tracking-tight">
            TutorMatch
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">Sign in</Link>
            <Link
              href="/signup"
              className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              Student sign up
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-8 py-14">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Become a Tutor</h1>
          <p className="text-gray-600 leading-relaxed">
            Apply to join TutorMatch as a peer tutor. We&apos;ll review your scores and bio,
            then reach out within a few days. Approved tutors get a full profile and access
            to session requests.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <ApplyForm />
        </div>

      </div>
    </div>
  )
}
