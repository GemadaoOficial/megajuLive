import { useState } from 'react'
import { X, Loader2, Target, DollarSign, ShoppingCart, Eye, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { goalsAPI } from '../../../services/api'

const METRICS = [
  { key: 'totalRevenue', label: 'Meta de Receita', icon: DollarSign, color: 'emerald', prefix: 'R$ ', placeholder: '50000' },
  { key: 'totalOrders', label: 'Meta de Pedidos', icon: ShoppingCart, color: 'orange', prefix: '', placeholder: '500' },
  { key: 'totalViewers', label: 'Meta de Espectadores', icon: Eye, color: 'violet', prefix: '', placeholder: '10000' },
  { key: 'conversionRate', label: 'Meta de Conversao (%)', icon: TrendingUp, color: 'blue', prefix: '', placeholder: '5' },
]

export default function GoalModal({ goals = [], onClose, onSaved }) {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const [values, setValues] = useState(() => {
    const initial = {}
    METRICS.forEach(m => {
      const existing = goals.find(g => g.metric === m.key)
      initial[m.key] = existing ? String(existing.target) : ''
    })
    return initial
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const promises = METRICS
        .filter(m => values[m.key] && parseFloat(values[m.key]) > 0)
        .map(m => goalsAPI.upsert({
          metric: m.key,
          target: parseFloat(values[m.key]),
          month,
          year,
        }))

      if (promises.length === 0) {
        toast.error('Defina pelo menos uma meta')
        setSaving(false)
        return
      }

      await Promise.all(promises)
      toast.success('Metas salvas com sucesso!')
      onSaved()
    } catch (error) {
      console.error('Erro ao salvar metas:', error)
      toast.error('Erro ao salvar metas')
    } finally {
      setSaving(false)
    }
  }

  const monthNames = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

  const colorMap = {
    emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'focus:border-emerald-500' },
    orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'focus:border-orange-500' },
    violet: { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'focus:border-violet-500' },
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'focus:border-blue-500' },
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-[#0f1117] border border-white/8 rounded-2xl w-full max-w-md shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Target className="w-4.5 h-4.5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Metas Mensais</h2>
                <p className="text-xs text-slate-400">{monthNames[month - 1]} {year}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/6 rounded-lg text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {METRICS.map((m) => {
              const colors = colorMap[m.color]
              const Icon = m.icon
              return (
                <div key={m.key}>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-1.5">
                    <div className={`w-6 h-6 rounded-md ${colors.bg} flex items-center justify-center`}>
                      <Icon className={`w-3.5 h-3.5 ${colors.text}`} />
                    </div>
                    {m.label}
                  </label>
                  <div className="relative">
                    {m.prefix && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">{m.prefix}</span>
                    )}
                    <input
                      type="number"
                      value={values[m.key]}
                      onChange={(e) => setValues(prev => ({ ...prev, [m.key]: e.target.value }))}
                      placeholder={m.placeholder}
                      className={`w-full ${m.prefix ? 'pl-10' : 'pl-3'} pr-3 py-2.5 rounded-xl border border-white/8 bg-white/5 text-white text-sm focus:outline-hidden ${colors.border} placeholder:text-slate-600 transition-colors`}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-5 border-t border-white/8">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-white/8 text-slate-300 font-medium hover:bg-white/6 text-sm">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-linear-to-r from-violet-500 to-purple-600 text-white font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 text-sm"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Salvar Metas'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
