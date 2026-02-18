import { motion, AnimatePresence } from 'framer-motion'
import { Package, Clock, Zap, Radio, TrendingUp, Users, DollarSign, Eye } from 'lucide-react'
import { formatTime } from '../utils'

export default function LiveTimer({
  elapsedTime,
  isRunning,
  currentProduct,
  productTime,
  stats = { views: 0, sales: 0, revenue: 0 },
}) {
  const progressPercent = currentProduct
    ? Math.min((productTime / (currentProduct.timeSlot || 1)) * 100, 100)
    : 0

  const isProductEnding = currentProduct && productTime >= (currentProduct.timeSlot || 60) * 0.8

  return (
    <div className="relative overflow-hidden">
      {/* Main Timer Card */}
      <div className={`relative rounded-3xl p-8 shadow-xl border-2 transition-all duration-500 ${
        isRunning
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-red-500/50'
          : 'bg-gradient-to-br from-white/[0.05] to-white/[0.02] border-white/[0.08]'
      }`}>
        {/* Animated Background Effects */}
        {isRunning && (
          <>
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-primary/20 to-transparent rotate-12 animate-pulse" />
              <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-orange-500/20 to-transparent -rotate-12 animate-pulse" />
            </div>
            {/* Floating particles */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-primary/30 rounded-full"
                initial={{ x: Math.random() * 100, y: 100, opacity: 0 }}
                animate={{
                  x: Math.random() * 100,
                  y: -20,
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            ))}
          </>
        )}

        {/* Live Indicator */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative flex items-center justify-center gap-3 mb-8"
            >
              <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-red-500/20 backdrop-blur-sm border border-red-500/30">
                <motion.div
                  className="w-3 h-3 rounded-full bg-red-500"
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <Radio className="w-5 h-5 text-red-500" />
                <span className="text-red-400 font-bold tracking-wider">AO VIVO</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timer Display */}
        <div className="relative text-center mb-8">
          <motion.div
            className={`text-8xl font-mono font-black tracking-wider ${
              isRunning ? 'text-white' : 'text-white'
            }`}
            animate={isRunning ? { textShadow: ['0 0 20px rgba(238,77,45,0.5)', '0 0 40px rgba(238,77,45,0.3)', '0 0 20px rgba(238,77,45,0.5)'] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {formatTime(elapsedTime)}
          </motion.div>
          <p className={`mt-2 flex items-center justify-center gap-2 ${
            isRunning ? 'text-slate-400' : 'text-slate-400'
          }`}>
            <Clock className="w-4 h-4" />
            Tempo de transmissao
          </p>
        </div>

        {/* Live Stats */}
        {isRunning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4 text-blue-400" />
                <span className="text-slate-400 text-xs">Visualizacoes</span>
              </div>
              <motion.p
                className="text-2xl font-bold text-white"
                key={stats.views}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                {stats.views.toLocaleString()}
              </motion.p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-400 text-xs">Vendas</span>
              </div>
              <motion.p
                className="text-2xl font-bold text-white"
                key={stats.sales}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                {stats.sales}
              </motion.p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span className="text-slate-400 text-xs">Receita</span>
              </div>
              <motion.p
                className="text-2xl font-bold text-white"
                key={stats.revenue}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                R$ {stats.revenue.toLocaleString()}
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* Current Product Display */}
        <AnimatePresence>
          {currentProduct && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`relative p-6 rounded-2xl border-2 transition-all ${
                isProductEnding
                  ? 'bg-gradient-to-r from-amber-500/20 to-red-500/20 border-amber-500/50'
                  : 'bg-gradient-to-r from-primary/20 to-orange-500/20 border-primary/30'
              }`}
            >
              {/* Product ending warning */}
              {isProductEnding && (
                <motion.div
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <div className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    TEMPO ACABANDO
                  </div>
                </motion.div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    isProductEnding
                      ? 'bg-amber-500'
                      : 'bg-gradient-to-br from-primary to-orange-500'
                  }`}>
                    <Package className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{currentProduct.name}</h3>
                    <p className="text-emerald-400 font-semibold">
                      R$ {currentProduct.price?.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <motion.div
                    className={`text-4xl font-mono font-bold ${
                      isProductEnding ? 'text-amber-400' : 'text-primary'
                    }`}
                    animate={isProductEnding ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    {formatTime(productTime)}
                  </motion.div>
                  <p className="text-slate-400 text-sm">
                    de {formatTime(currentProduct.timeSlot || 0)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-4 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    isProductEnding
                      ? 'bg-gradient-to-r from-amber-500 to-red-500'
                      : 'bg-gradient-to-r from-primary to-orange-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
                {/* Glow effect */}
                <motion.div
                  className="absolute top-0 h-full w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: [-80, 400] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Idle State */}
        {!isRunning && !currentProduct && (
          <div className="text-center py-4">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/[0.05] flex items-center justify-center">
              <Radio className="w-10 h-10 text-slate-500" />
            </div>
            <p className="text-slate-400">Clique em "Iniciar Live" para comecar</p>
          </div>
        )}
      </div>
    </div>
  )
}
