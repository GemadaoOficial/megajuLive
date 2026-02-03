import { motion } from 'framer-motion'
import { Sparkles, Wand2, ChevronRight, Zap, Star } from 'lucide-react'
import Modal from '../../../components/ui/Modal'

export default function AITitlesModal({
  isOpen,
  onClose,
  titles,
  isLoading,
  onSelectTitle,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sugestoes de Titulo com IA" size="lg">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-6 text-white mb-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -left-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

        <div className="relative flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm"
          >
            <Wand2 className="w-8 h-8" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold">Assistente de Titulos IA</h3>
            <p className="text-white/80 text-sm">
              Titulos criativos gerados especialmente para voce
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          {/* Animated loading */}
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 rounded-full border-4 border-violet-200"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-violet-500"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-violet-500" />
            </div>
          </div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="mt-6 text-slate-600 font-medium"
          >
            Gerando titulos criativos...
          </motion.p>
          <p className="text-sm text-slate-400 mt-1">Nossa IA esta trabalhando</p>
        </div>
      ) : (
        <div className="space-y-3">
          {titles.map((title, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectTitle(title)}
              className="w-full p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-white hover:from-violet-50 hover:to-purple-50 border-2 border-slate-200 hover:border-violet-300 text-left transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 group-hover:from-violet-200 group-hover:to-purple-200 flex items-center justify-center transition-colors">
                  {index === 0 ? (
                    <Star className="w-6 h-6 text-violet-500" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-violet-500" />
                  )}
                </div>
                <div className="flex-1">
                  {index === 0 && (
                    <span className="text-xs font-semibold text-violet-500 bg-violet-100 px-2 py-0.5 rounded-full mb-1 inline-block">
                      RECOMENDADO
                    </span>
                  )}
                  <p className="font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">
                    {title}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-violet-500 transition-colors" />
              </div>
            </motion.button>
          ))}

          {/* Regenerate hint */}
          <div className="pt-4 text-center">
            <p className="text-sm text-slate-400 flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              Clique em um titulo para usar na sua live
            </p>
          </div>
        </div>
      )}
    </Modal>
  )
}
