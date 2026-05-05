'use client'

import { useActionState } from 'react'
import { updateSetting } from '../actions'

interface Props {
  settingKey: string
  currentValue: string
  label: string
  description: string
  unit?: string
}

const initial = { error: null as string | null }

export function SettingsForm({ settingKey, currentValue, label, description, unit }: Props) {
  const [state, action, pending] = useActionState(updateSetting, initial)

  return (
    <form action={action} className="p-6">
      <input type="hidden" name="key" value={settingKey} />
      <div className="flex items-center justify-between gap-8">
        <div className="flex-1">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          {state.error && <p className="text-xs text-red-600 mt-1">{state.error}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="number"
            name="value"
            defaultValue={currentValue}
            className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-right text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={pending}
          />
          {unit && <span className="text-xs text-gray-400">{unit}</span>}
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  )
}
