import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: settings } = await supabase.from('app_settings').select('*')

  const settingsMap = Object.fromEntries((settings ?? []).map(s => [s.key, s.value]))

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-gray-600 mb-8">Configure platform constants. Changes take effect immediately.</p>

      <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Discover feed threshold</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Switch from Mode A (grid) to Mode B (match stack) when active tutor count reaches this number.
              </p>
            </div>
            <div className="ml-8">
              <span className="text-2xl font-bold text-indigo-600">
                {String(settingsMap['tutor_pool_threshold'] ?? 8)}
              </span>
              <p className="text-xs text-gray-400 text-right">tutors</p>
            </div>
          </div>
          {/* TODO: Step 11 — inline edit form for each setting */}
        </div>
      </div>
    </div>
  )
}
