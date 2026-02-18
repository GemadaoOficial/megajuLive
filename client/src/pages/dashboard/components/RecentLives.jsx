import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Video, Calendar, Sparkles } from 'lucide-react'

function LiveItem({ live, index }) {
  const statusStyles = {
    COMPLETED: 'bg-emerald-500/20 text-emerald-400',
    LIVE: 'bg-red-500/20 text-red-400 animate-pulse',
    SCHEDULED: 'bg-blue-500/20 text-blue-400',
    CANCELLED: 'bg-amber-500/20 text-amber-400',
  }

  const statusLabels = {
    COMPLETED: '✓ Finalizada',
    LIVE: '● AO VIVO',
    SCHEDULED: '◷ Agendada',
    CANCELLED: '✕ Cancelada',
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 + index * 0.1 }}
      className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all cursor-pointer group"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
        <Video className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white group-hover:text-primary transition-colors truncate">
          {live.title}
        </p>
        <p className="text-sm text-slate-400 mt-0.5">
          {new Date(live.scheduledAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
      <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${statusStyles[live.status]}`}>
        {statusLabels[live.status]}
      </span>
    </motion.div>
  )
}

export default function RecentLives({ lives, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="lg:col-span-2"
    >
      <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-orange-500 flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Lives Recentes</h2>
          </div>
          <Link
            to="/calendar"
            className="text-primary text-sm font-medium hover:text-orange-400 transition-colors"
          >
            Ver todas →
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : lives.length > 0 ? (
          <div className="space-y-3">
            {lives.map((live, index) => (
              <LiveItem key={live.id} live={live} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-full bg-white/[0.05] flex items-center justify-center mb-4">
              <Calendar className="w-10 h-10 text-slate-500" />
            </div>
            <p className="text-slate-400 text-lg">Nenhuma live encontrada</p>
            <Link
              to="/live"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-gradient-to-r from-primary to-orange-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              Criar primeira live
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  )
}
