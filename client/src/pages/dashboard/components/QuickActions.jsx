import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Video, Calendar, Sparkles, Zap } from 'lucide-react'

export default function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Acoes Rapidas</h2>
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
              <p className="font-semibold text-slate-800 group-hover:text-primary transition-colors">
                Iniciar Nova Live
              </p>
              <p className="text-xs text-slate-500">Comece a transmitir agora</p>
            </div>
          </Link>

          <Link
            to="/calendar"
            className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                Agendar Live
              </p>
              <p className="text-xs text-slate-500">Planeje suas transmissoes</p>
            </div>
          </Link>

          <Link
            to="/tutorials"
            className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                Ver Tutoriais
              </p>
              <p className="text-xs text-slate-500">Aprenda novas tecnicas</p>
            </div>
          </Link>
        </div>

        {/* Mini Stats */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-xl bg-emerald-50">
              <p className="text-2xl font-bold text-emerald-600">98%</p>
              <p className="text-xs text-slate-500 mt-1">Satisfacao</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-blue-50">
              <p className="text-2xl font-bold text-blue-600">#12</p>
              <p className="text-xs text-slate-500 mt-1">Ranking</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
