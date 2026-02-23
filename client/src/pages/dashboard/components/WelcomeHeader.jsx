import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Flame, Play, Calendar } from 'lucide-react'

export default function WelcomeHeader({ userName }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary via-orange-500 to-amber-500 p-8">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Ola, {userName}!</h1>
            <p className="text-white/80 mt-1">Pronto para mais uma live incrivel?</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 flex flex-wrap gap-3"
        >
          <Link
            to="/live"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 transition-all shadow-lg"
          >
            <Play className="w-5 h-5" />
            Iniciar Live Agora
          </Link>
          <Link
            to="/calendar"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 text-white font-medium rounded-xl hover:bg-white/30 transition-all backdrop-blur-xs"
          >
            <Calendar className="w-5 h-5" />
            Ver Agenda
          </Link>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -right-5 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
    </div>
  )
}
