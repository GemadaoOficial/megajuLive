import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Wand2, ChevronRight, Star, RefreshCw, Type, FileText, Send, AlertTriangle } from 'lucide-react'
import Modal from '../../../components/ui/Modal'
import { aiAPI } from '../../../services/api'

export default function AITitlesModal({
  isOpen,
  onClose,
  onSelectTitle,
  onSelectDescription,
  currentTitle,
}) {
  const [tab, setTab] = useState('title')
  const [prompt, setPrompt] = useState('')
  const [titles, setTitles] = useState([])
  const [descriptions, setDescriptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const generateTitles = async () => {
    setLoading(true)
    setAiError('')
    try {
      const response = await aiAPI.suggestTitle({ prompt: prompt || undefined })
      if (response.data.error) {
        setAiError(response.data.message || 'Erro na IA')
        setTitles(response.data.titles || [])
      } else {
        setTitles(response.data.titles || [])
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Erro desconhecido'
      console.error('Erro ao gerar titulos:', msg)
      setAiError(`Erro da IA: ${msg}`)
      setTitles([])
    } finally {
      setLoading(false)
    }
  }

  const generateDescriptions = async () => {
    setLoading(true)
    setAiError('')
    try {
      const response = await aiAPI.suggestDescription({ prompt: prompt || undefined, title: currentTitle || undefined })
      if (response.data.error) {
        setAiError(response.data.message || 'Erro na IA')
        setDescriptions(response.data.descriptions || [])
      } else {
        setDescriptions(response.data.descriptions || [])
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Erro desconhecido'
      console.error('Erro ao gerar descricoes:', msg)
      setAiError(`Erro da IA: ${msg}`)
      setDescriptions([])
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = () => {
    if (tab === 'title') generateTitles()
    else generateDescriptions()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleGenerate()
    }
  }

  const results = tab === 'title' ? titles : descriptions

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assistente IA - Shopee Live" size="lg">
      {/* Header gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-5 text-white mb-5">
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -left-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="relative flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm"
          >
            <Wand2 className="w-6 h-6" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold">Assistente IA para Shopee Live</h3>
            <p className="text-white/80 text-sm">Descreva sua live e a IA gera titulo e descricao</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('title')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'title'
              ? 'bg-violet-100 text-violet-700 shadow-sm'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Type className="w-4 h-4" />
          Titulo
        </button>
        <button
          onClick={() => setTab('description')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'description'
              ? 'bg-violet-100 text-violet-700 shadow-sm'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          Descricao
        </button>
      </div>

      {/* Prompt input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-600 mb-1.5">
          {tab === 'title' ? 'Sobre o que sera a live?' : 'Descreva o que quer na descricao'}
        </label>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tab === 'title'
              ? 'Ex: promocao de eletronicos com ate 50% off, smartwatch e fones bluetooth...'
              : 'Ex: live de ofertas relampago com cupons de frete gratis e sorteio...'
            }
            rows={2}
            className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="absolute right-2 bottom-2 p-2 rounded-lg bg-violet-500 text-white hover:bg-violet-600 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Pressione Enter ou clique no botao para gerar. Deixe vazio para sugestoes gerais.
        </p>
      </div>

      {/* Error message */}
      {aiError && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-700">Falha na IA</p>
            <p className="text-xs text-red-600 mt-0.5 break-all">{aiError}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 rounded-full border-4 border-violet-200"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-violet-500"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-violet-500" />
            </div>
          </div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="mt-4 text-slate-600 font-medium"
          >
            {tab === 'title' ? 'Gerando titulos...' : 'Gerando descricoes...'}
          </motion.p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2.5">
          {results.map((item, index) => (
            <motion.button
              key={`${tab}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01, x: 3 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                if (tab === 'title') onSelectTitle(item)
                else onSelectDescription(item)
              }}
              className="w-full p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white hover:from-violet-50 hover:to-purple-50 border border-slate-200 hover:border-violet-300 text-left transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 group-hover:from-violet-200 group-hover:to-purple-200 flex items-center justify-center flex-shrink-0 transition-colors">
                  {index === 0 ? (
                    <Star className="w-5 h-5 text-violet-500" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-violet-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {index === 0 && (
                    <span className="text-[10px] font-bold text-violet-500 bg-violet-100 px-2 py-0.5 rounded-full mb-1 inline-block uppercase tracking-wider">
                      Recomendado
                    </span>
                  )}
                  <p className={`font-medium text-slate-800 group-hover:text-violet-700 transition-colors ${tab === 'description' ? 'text-sm leading-relaxed' : ''}`}>
                    {item}
                  </p>
                  {tab === 'description' && (
                    <span className={`text-xs mt-1 inline-block ${item.length > 250 ? 'text-red-500' : 'text-slate-400'}`}>
                      {item.length}/250 caracteres
                    </span>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-violet-500 flex-shrink-0 mt-1 transition-colors" />
              </div>
            </motion.button>
          ))}

          {/* Regenerate */}
          <div className="pt-3 flex items-center justify-between">
            <p className="text-xs text-slate-400">Clique para usar na sua live</p>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-medium text-violet-500 hover:text-violet-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Gerar novamente
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && results.length === 0 && (
        <div className="text-center py-10 text-slate-400">
          <Sparkles className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-500">
            {tab === 'title' ? 'Descreva sua live para gerar titulos' : 'Descreva sua live para gerar descricoes'}
          </p>
          <p className="text-sm mt-1">Ou clique no botao para sugestoes gerais</p>
        </div>
      )}
    </Modal>
  )
}
