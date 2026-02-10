import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wand2,
  Radio,
  Sparkles,
  Calendar,
  ChevronRight,
  Video,
  Users,
  TrendingUp,
} from 'lucide-react'
import { livesAPI, aiAPI } from '../../services/api'
import Button from '../../components/ui/Button'
import { useLiveTimer } from './hooks/useLiveTimer'
import { useProductTimer } from './hooks/useProductTimer'
import LiveTimer from './components/LiveTimer'
import LiveControls from './components/LiveControls'
import ProductPanel from './components/ProductPanel'
import CreateLiveModal from './components/CreateLiveModal'
import AITitlesModal from './components/AITitlesModal'

export default function LiveExecutor() {
  const { id } = useParams()
  const navigate = useNavigate()

  // State
  const [live, setLive] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(!!id)
  const [modalOpen, setModalOpen] = useState(false)
  const [titleModalOpen, setTitleModalOpen] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '' })

  // Live Stats (calculated when live ends via report)
  const stats = { views: '-', sales: '-', revenue: '-' }

  // Custom hooks
  const { elapsedTime, isRunning, start: startTimer, pause: pauseTimer, stop: stopTimer } = useLiveTimer()
  const { currentProductIndex, productTime, startProductTimer, stopProductTimer, currentProduct } = useProductTimer(products)

  useEffect(() => {
    if (id) loadLive()
  }, [id])

  const loadLive = async () => {
    try {
      const response = await livesAPI.getById(id)
      setLive(response.data.live)
      setProducts(response.data.live.products || [])
    } catch (error) {
      console.error('Erro ao carregar live:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartLive = async () => {
    if (!live && !formData.title) {
      setModalOpen(true)
      return
    }

    try {
      if (!live) {
        const response = await livesAPI.create({
          title: formData.title,
          description: formData.description,
          scheduledAt: new Date().toISOString(),
          status: 'LIVE',
        })
        setLive(response.data.live)
      } else {
        await livesAPI.start(live.id)
        setLive({ ...live, status: 'LIVE' })
      }
      startTimer()
    } catch (error) {
      console.error('Erro ao iniciar live:', error)
    }
  }

  const handlePauseLive = () => {
    pauseTimer()
    stopProductTimer()
  }

  const handleStopLive = async () => {
    if (!confirm('Tem certeza que deseja encerrar a live?')) return

    try {
      if (live) await livesAPI.end(live.id)
      stopTimer()
      stopProductTimer()
      navigate('/analytics')
    } catch (error) {
      console.error('Erro ao encerrar live:', error)
    }
  }

  const handleAddProduct = (product) => {
    setProducts([...products, product])
  }

  const handleRemoveProduct = (productId) => {
    setProducts(products.filter((p) => p.id !== productId))
    if (currentProductIndex >= products.length - 1) {
      stopProductTimer()
    }
  }

  const handleSelectTitle = (title) => {
    setFormData({ ...formData, title })
    setTitleModalOpen(false)
    setModalOpen(true)
  }

  const handleSelectDescription = (description) => {
    setFormData({ ...formData, description })
    setTitleModalOpen(false)
    setModalOpen(true)
  }

  const handleCreateLive = () => {
    setModalOpen(false)
    handleStartLive()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isRunning
                ? 'bg-gradient-to-br from-red-500 to-rose-600'
                : 'bg-gradient-to-br from-primary to-orange-500'
            }`}>
              {isRunning ? (
                <Radio className="w-6 h-6 text-white" />
              ) : (
                <Video className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                {live ? live.title : 'Nova Live'}
              </h1>
              <p className="text-slate-500">
                {isRunning ? 'Transmissao ao vivo' : 'Prepare sua transmissao'}
              </p>
            </div>
          </div>
        </div>

        {!isRunning && !live && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <Button onClick={() => setTitleModalOpen(true)} variant="ghost" className="gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              Gerar Titulo com IA
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Quick Actions - Only when not live */}
      <AnimatePresence>
        {!isRunning && !live && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => setModalOpen(true)}
              className="p-6 bg-gradient-to-br from-primary/10 to-orange-500/10 rounded-2xl border-2 border-primary/20 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center mb-4">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800">Live Rapida</h3>
                  <p className="text-sm text-slate-500">Comece agora mesmo</p>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => navigate('/calendar')}
              className="p-6 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl border-2 border-violet-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800">Agendar Live</h3>
                  <p className="text-sm text-slate-500">Planeje com antecedencia</p>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-violet-500 transition-colors" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => setTitleModalOpen(true)}
              className="p-6 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-2xl border-2 border-amber-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center mb-4">
                    <Wand2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800">Assistente IA</h3>
                  <p className="text-sm text-slate-500">Gere titulos criativos</p>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-amber-500 transition-colors" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <LiveTimer
            elapsedTime={elapsedTime}
            isRunning={isRunning}
            currentProduct={currentProduct}
            productTime={productTime}
            stats={stats}
          />
          <LiveControls
            isRunning={isRunning}
            hasLive={!!live}
            onStart={handleStartLive}
            onPause={handlePauseLive}
            onStop={handleStopLive}
          />
        </motion.div>

        {/* Products Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ProductPanel
            products={products}
            setProducts={setProducts}
            currentProductIndex={currentProductIndex}
            isRunning={isRunning}
            onAddProduct={handleAddProduct}
            onRemoveProduct={handleRemoveProduct}
            onSelectProduct={startProductTimer}
          />
        </motion.div>
      </div>

      {/* Tips Section - Only when not live */}
      <AnimatePresence>
        {!isRunning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 text-white"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold">Dicas para uma Live de Sucesso</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-3xl mb-2">1.</div>
                <h4 className="font-semibold mb-1">Prepare seus produtos</h4>
                <p className="text-sm text-slate-400">
                  Adicione todos os produtos antes de iniciar a live para uma transicao suave.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-3xl mb-2">2.</div>
                <h4 className="font-semibold mb-1">Engaje sua audiencia</h4>
                <p className="text-sm text-slate-400">
                  Responda perguntas e interaja com os espectadores durante a transmissao.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-3xl mb-2">3.</div>
                <h4 className="font-semibold mb-1">Crie urgencia</h4>
                <p className="text-sm text-slate-400">
                  Use ofertas por tempo limitado para incentivar compras rapidas.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <CreateLiveModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCreateLive}
      />

      <AITitlesModal
        isOpen={titleModalOpen}
        onClose={() => setTitleModalOpen(false)}
        onSelectTitle={handleSelectTitle}
        onSelectDescription={handleSelectDescription}
        currentTitle={formData.title}
      />
    </div>
  )
}
