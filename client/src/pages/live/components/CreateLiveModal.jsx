import { motion } from 'framer-motion'
import { Video, Radio, Sparkles, FileText, Zap } from 'lucide-react'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'

export default function CreateLiveModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Iniciar Nova Live">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
        className="space-y-6"
      >
        {/* Header Visual */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary via-orange-500 to-amber-500 p-6 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

          <div className="relative flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs"
            >
              <Radio className="w-8 h-8" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold">Pronto para comecar?</h3>
              <p className="text-white/80 text-sm">
                Configure sua live e va ao ar em segundos
              </p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Titulo da Live
            </label>
            <div className="relative">
              <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Ex: Super Promocao de Verao"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border-2 border-white/8 text-white placeholder-white/30 focus:outline-hidden focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Descricao (opcional)
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
              <textarea
                placeholder="Descreva o conteudo da sua live..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border-2 border-white/8 text-white placeholder-white/30 focus:outline-hidden focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-400">Dica rapida</p>
              <p className="text-sm text-amber-400/80">
                Titulos com palavras como "Promocao", "Desconto" ou "Oferta" atraem mais espectadores!
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 px-6 bg-linear-to-r from-primary to-orange-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/30 transition-shadow"
          >
            <Video className="w-5 h-5" />
            Iniciar Live
          </motion.button>
        </div>
      </form>
    </Modal>
  )
}
