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
      <div className="flex items-center gap-1 bg-white/5 border border-white/8 rounded-2xl p-1.5">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => handlePresetClick(preset.value)}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              period === preset.value
                ? 'bg-linear-to-r from-primary to-orange-500 text-white shadow-xs shadow-orange-200'
                : 'text-slate-400 hover:text-white hover:bg-white/6'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {showCustom && (
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="date"
              value={startDate || ''}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl border border-white/8 text-sm font-medium focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white/5 text-white"
            />
          </div>
          <span className="text-slate-500 text-sm font-medium">ate</span>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="date"
              value={endDate || ''}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl border border-white/8 text-sm font-medium focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white/5 text-white"
            />
          </div>
        </div>
      )}
    </div>
  )
}
