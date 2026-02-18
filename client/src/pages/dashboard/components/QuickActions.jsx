import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Video, Calendar, Sparkles, Zap, BarChart3 } from 'lucide-react'

export default function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Acoes Rapidas</h2>
        </div>

        <div className="space-y-3">
          <Link
            to="/live"
            className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-orange-500/10 border border-primary/30 hover:border-primary/50 transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-primary to-orange-500 flex items-center justify-center shadow-lg shadow-primary/30">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white group-hover:text-primary transition-colors">
                Iniciar Nova Live
              </p>
              <p className="text-xs text-slate-400">Comece a transmitir agora</p>
            </div>
          </Link>

          <Link
            to="/calendar"
            className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.12] hover:bg-white/[0.06] transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                Agendar Live
              </p>
              <p className="text-xs text-slate-400">Planeje suas transmissoes</p>
            </div>
          </Link>

          <Link
            to="/analytics"
            className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.12] hover:bg-white/[0.06] transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                Ver Relatorios
              </p>
              <p className="text-xs text-slate-400">Analise detalhada das lives</p>
            </div>
          </Link>

          <Link
            to="/tutorials"
            className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.12] hover:bg-white/[0.06] transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                Ver Tutoriais
              </p>
              <p className="text-xs text-slate-400">Aprenda novas tecnicas</p>
            </div>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
