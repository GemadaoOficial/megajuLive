import { useState } from 'react'
import { Calendar } from 'lucide-react'

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
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => handlePresetClick(preset.value)}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              period === preset.value
                ? 'bg-gradient-to-r from-primary to-orange-500 text-white shadow-sm shadow-orange-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {showCustom && (
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={startDate || ''}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white shadow-sm"
            />
          </div>
          <span className="text-slate-400 text-sm font-medium">ate</span>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={endDate || ''}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white shadow-sm"
            />
          </div>
        </div>
      )}
    </div>
  )
}
