import { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'

const PRESETS = [
  { label: 'Hoje', value: 'today' },
  { label: 'Ontem', value: 'yesterday' },
  { label: '7 dias', value: '7d' },
  { label: '30 dias', value: '30d' },
  { label: 'Personalizado', value: 'custom' },
]

export default function DateRangePicker({ period, onPeriodChange, startDate, endDate, onStartDateChange, onEndDateChange }) {
  const [showCustom, setShowCustom] = useState(period === 'custom')

  const handlePresetClick = (value) => {
    onPeriodChange(value)
    setShowCustom(value === 'custom')
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => handlePresetClick(preset.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              period === preset.value
                ? 'bg-gradient-to-r from-primary to-orange-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {showCustom && (
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={startDate || ''}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <span className="text-slate-400 text-sm">até</span>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={endDate || ''}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      )}
    </div>
  )
}
