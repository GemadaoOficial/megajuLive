import { motion } from 'framer-motion'
import {
  Play,
  Pause,
  Square,
  Radio,
  StopCircle,
  Zap,
} from 'lucide-react'

export default function LiveControls({
  isRunning,
  hasLive,
  onStart,
  onPause,
  onStop,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center gap-6 mt-8"
    >
      {!isRunning ? (
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 20px 40px -10px rgba(238, 77, 45, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="relative group px-12 py-5 bg-linear-to-r from-primary via-orange-500 to-amber-500 text-white font-bold text-lg rounded-2xl flex items-center gap-3 shadow-xl overflow-hidden"
        >
          {/* Animated background */}
          <motion.div
            className="absolute inset-0 bg-linear-to-r from-amber-500 via-primary to-orange-500"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            style={{ opacity: 0.3 }}
          />

          {/* Glow effect */}
          <div className="absolute inset-0 bg-linear-to-t from-transparent to-white/20" />

          {/* Content */}
          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              {hasLive ? (
                <Radio className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </div>
            <div className="text-left">
              <span className="block">{hasLive ? 'Continuar Live' : 'Iniciar Live'}</span>
              <span className="text-xs text-white/70">Clique para comecar</span>
            </div>
          </div>

          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-white/30"
            animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.button>
      ) : (
        <>
          {/* Pause Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPause}
            className="group relative px-8 py-4 bg-white/5 text-white font-semibold rounded-2xl flex items-center gap-3 shadow-lg border-2 border-white/8 overflow-hidden"
          >
            <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                <Pause className="w-5 h-5 text-amber-400" />
              </div>
              <span>Pausar</span>
            </div>
          </motion.button>

          {/* Stop Button */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 10px 30px -5px rgba(239, 68, 68, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={onStop}
            className="group relative px-8 py-4 bg-linear-to-br from-red-500 to-rose-600 text-white font-semibold rounded-2xl flex items-center gap-3 shadow-lg overflow-hidden"
          >
            {/* Animated stripes */}
            <motion.div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
              }}
              animate={{ x: [0, 20] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />

            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <StopCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block">Encerrar</span>
                <span className="text-xs text-white/70">Finalizar live</span>
              </div>
            </div>
          </motion.button>
        </>
      )}

      {/* Running indicator */}
      {isRunning && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full shadow-xl"
        >
          <motion.div
            className="w-2 h-2 rounded-full bg-white"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-sm font-semibold">AO VIVO</span>
        </motion.div>
      )}
    </motion.div>
  )
}
