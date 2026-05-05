import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from './SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: settings } = await supabase.from('app_settings').select('*')

  const settingsMap = Object.fromEntries((settings ?? []).map(s => [s.key, String(s.value)]))

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-gray-600 mb-8">Configure platform constants. Changes take effect immediately.</p>

      <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
        <SettingsForm
          settingKey="tutor_pool_threshold"
          currentValue={settingsMap['tutor_pool_threshold'] ?? '8'}
          label="Discover feed threshold"
          description="Switch from Mode A (grid) to Mode B (match stack) when active tutor count reaches this number."
          unit="tutors"
        />
      </div>
    </div>
  )
}
