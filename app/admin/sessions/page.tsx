import { createClient } from '@/lib/supabase/server'
import { formatSessionDate } from '@/lib/utils/format'

export default async function AdminSessionsPage() {
  const supabase = await createClient()
  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, subject, scheduled_at, format, status, student:student_id(name), tutor:tutor_id(name)')
    .order('scheduled_at', { ascending: false })
    .limit(100)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">All Sessions</h1>
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Student', 'Tutor', 'Subject', 'Date', 'Format', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(sessions ?? []).map(s => {
              const student = Array.isArray(s.student) ? s.student[0] : s.student
              const tutor = Array.isArray(s.tutor) ? s.tutor[0] : s.tutor
              return (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{student?.name}</td>
                  <td className="px-4 py-3 text-gray-900">{tutor?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.subject}</td>
                  <td className="px-4 py-3 text-gray-600">{formatSessionDate(s.scheduled_at)}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{s.format}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium
                      ${s.status === 'confirmed' ? 'bg-blue-100 text-blue-700'
                        : s.status === 'completed' ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
