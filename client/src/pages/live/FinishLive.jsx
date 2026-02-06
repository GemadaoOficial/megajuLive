import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Loader2, CheckCircle, ArrowLeft, AlertTriangle, Info } from 'lucide-react'
import { liveService } from '../../services/liveService'
import { liveReportsAPI, aiAPI } from '../../services/api'
import { toast } from 'sonner'
import ReportForm from './components/ReportForm'
import ImageDropZone from './components/ImageDropZone'

// Campos que sempre aparecem no relatorio da Shopee (usados para avisos de nao-deteccao)
const CORE_FIELDS = {
  totalRevenue: 'Vendas (R$)',
  totalOrders: 'Pedidos',
  totalItemsSold: 'Itens Vendidos',
  totalViewers: 'Espectadores',
  engagedViewers: 'Engajados',
  totalViews: 'Visualizações',
  peakViewers: 'Pico Simultâneo',
  avgWatchTime: 'Tempo Médio',
  totalLikes: 'Curtidas',
  totalComments: 'Comentários',
  newFollowers: 'Novos Seguidores',
}

const AI_STEPS = [
  { key: 'prepare', label: 'Preparando imagens...', progress: 15 },
  { key: 'upload', label: 'Enviando para a IA...', progress: 35 },
  { key: 'analyze', label: 'IA analisando screenshots...', progress: 60 },
  { key: 'process', label: 'Processando resultados...', progress: 85 },
  { key: 'done', label: 'Concluido!', progress: 100 },
]

const emptyReport = {
  liveTitle: '', reportDate: new Date().toISOString().split('T')[0], reportTime: '',
  totalRevenue: 0, totalOrders: 0, totalItemsSold: 0, avgOrderValue: 0, avgRevenuePerBuyer: 0,
  totalViewers: 0, engagedViewers: 0, totalViews: 0, peakViewers: 0, avgWatchTime: 0, liveDuration: 0,
  clickRate: 0, totalBuyers: 0, productClicks: 0, productClickRate: 0, conversionRate: 0, addToCart: 0, gpm: 0,
  totalLikes: 0, totalShares: 0, totalComments: 0, commentRate: 0, newFollowers: 0,
  couponsUsed: 0, coinsUsed: 0, coinsCost: 0, coinRedemptions: 0, auctionRounds: 0,
  productImpressions: 0, orderRate: 0, impressionToOrderRate: 0,
}

export default function FinishLive() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [live, setLive] = useState(null)
  const [data, setData] = useState({ ...emptyReport })
  const [products, setProducts] = useState([])
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiStep, setAiStep] = useState('')
  const [aiProgress, setAiProgress] = useState(0)
  const [aiError, setAiError] = useState('')
  const [aiWarnings, setAiWarnings] = useState([])
  const [undetectedFields, setUndetectedFields] = useState([])
  const [statsFiles, setStatsFiles] = useState([])
  const [productFiles, setProductFiles] = useState([])
  const [trafficFiles, setTrafficFiles] = useState([])

  useEffect(() => {
    if (id) loadLive()
  }, [id])

  const loadLive = async () => {
    try {
      const response = await liveService.getDetails(id)
      const l = response.live || response
      setLive(l)
      setData(prev => ({
        ...prev,
        liveTitle: l.title || '',
        reportDate: new Date().toISOString().split('T')[0],
      }))
    } catch (error) {
      console.error('Erro ao carregar live:', error)
    }
  }

  const onDropStats = useCallback((f) => setStatsFiles(prev => [...prev, ...f].slice(0, 10)), [])
  const onDropProducts = useCallback((f) => setProductFiles(prev => [...prev, ...f].slice(0, 10)), [])
  const onDropTraffic = useCallback((f) => setTrafficFiles(prev => [...prev, ...f].slice(0, 5)), [])

  const handleAiExtract = async () => {
    if (statsFiles.length === 0 && productFiles.length === 0 && trafficFiles.length === 0) return
    setAiLoading(true)
    setAiProgress(0)
    setAiError('')
    setAiWarnings([])
    setUndetectedFields([])
    try {
      const formData = new FormData()

      setAiStep(AI_STEPS[0].label)
      setAiProgress(AI_STEPS[0].progress)
      statsFiles.forEach(f => formData.append('statsScreenshots', f))
      productFiles.forEach(f => formData.append('productScreenshots', f))
      trafficFiles.forEach(f => formData.append('trafficScreenshots', f))

      setAiStep(AI_STEPS[1].label)
      setAiProgress(AI_STEPS[1].progress)

      // Simular progresso durante a espera da API
      const progressInterval = setInterval(() => {
        setAiProgress(prev => {
          if (prev >= 75) { clearInterval(progressInterval); return prev }
          return prev + 1
        })
      }, 800)

      setAiStep(AI_STEPS[2].label)
      const response = await aiAPI.extractLiveReport(formData)
      clearInterval(progressInterval)

      const result = response.data

      setAiStep(AI_STEPS[3].label)
      setAiProgress(AI_STEPS[3].progress)
      const { products: aiProducts, ...aiStats } = result
      // So sobrescreve campos que a IA realmente detectou (valor != 0, != null, != '')
      setData(prev => {
        const merged = { ...prev }
        Object.entries(aiStats).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '' && value !== 0) {
            merged[key] = value
          }
        })
        return merged
      })
      // So atualiza produtos se screenshots de produtos foram enviados explicitamente
      if (productFiles.length > 0 && aiProducts?.length) setProducts(aiProducts)

      // Detectar campos nao reconhecidos (verifica estado final, nao so a IA)
      const notDetected = []
      const warnings = []
      setData(current => {
        Object.entries(CORE_FIELDS).forEach(([field, label]) => {
          if (!current[field] || current[field] === 0) {
            notDetected.push(field)
            warnings.push(label)
          }
        })
        return current
      })
      setUndetectedFields(notDetected)
      setAiWarnings(warnings)

      setAiStep(AI_STEPS[4].label)
      setAiProgress(AI_STEPS[4].progress)

      if (warnings.length > 0) {
        toast.info(`${warnings.length} campo(s) nao detectados pela IA`)
      } else {
        toast.success('Todos os campos extraidos com sucesso!')
      }

      setTimeout(() => {
        setAiStep('')
        setAiProgress(0)
      }, 2000)
    } catch (error) {
      console.error('Erro AI:', error)
      const msg = error.response?.data?.message || error.message || 'Erro desconhecido ao processar imagens'
      setAiError(msg)
      toast.error('Falha ao processar imagens pela IA')
      setAiStep('')
      setAiProgress(0)
    } finally {
      setAiLoading(false)
    }
  }

  const handleSave = async () => {
    if (!data.liveTitle) { toast.error('Informe o nome da live'); return }
    if (!data.reportTime) { toast.error('Informe o horario da live'); return }
    setSaving(true)
    try {
      const { reportTime, ...rest } = data
      const reportDate = reportTime ? `${data.reportDate}T${reportTime}:00` : data.reportDate
      await liveReportsAPI.create({
        ...rest,
        reportDate,
        liveId: id || undefined,
        products,
        aiAnalyzed: statsFiles.length > 0 || productFiles.length > 0 || trafficFiles.length > 0,
      })

      // Also finish the live if we have an id
      if (id) {
        try {
          const formData = new FormData()
          formData.append('followersEnd', data.newFollowers || 0)
          formData.append('coinsEnd', data.coinsUsed || 0)
          await liveService.finishLive(id, formData)
        } catch (e) {
          // Non-critical if this fails
          console.warn('Aviso: nao foi possivel finalizar a live:', e)
        }
      }

      toast.success('Relatorio salvo com sucesso!')
      navigate('/analytics')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar relatorio')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Fixed AI Loading Bar - stays at bottom when scrolling */}
      {aiLoading && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className="bg-white/95 backdrop-blur-sm border-t border-slate-200 px-6 py-3 shadow-lg">
            <div className="max-w-5xl mx-auto flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-indigo-500 animate-spin flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-700 truncate">{aiStep}</span>
                  <span className="text-xs font-bold text-indigo-600 ml-2">{aiProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${aiProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Finalizar Live e Gerar Relatorio</h1>
          <p className="text-sm text-slate-500">
            {live ? `Live: ${live.title}` : 'Preencha os dados do relatorio da live'}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Meta info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Live *</label>
              <input
                type="text"
                value={data.liveTitle}
                onChange={(e) => setData(prev => ({ ...prev, liveTitle: e.target.value }))}
                placeholder="Ex: Super Promo de Quinta"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data da Live *</label>
              <input
                type="date"
                value={data.reportDate}
                onChange={(e) => setData(prev => ({ ...prev, reportDate: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Horario de Inicio *</label>
              <input
                type="time"
                value={data.reportTime || ''}
                onChange={(e) => setData(prev => ({ ...prev, reportTime: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>
        </motion.div>

        {/* AI Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
        >
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Preencher com IA (opcional)
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Envie screenshots do relatorio da Shopee e a IA preenchera automaticamente todos os campos.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <ImageDropZone onDrop={onDropStats} files={statsFiles} setFiles={setStatsFiles} label="Estatisticas" max={10} disabled={aiLoading} category="stats" />
            <ImageDropZone onDrop={onDropProducts} files={productFiles} setFiles={setProductFiles} label="Produtos" max={10} disabled={aiLoading} category="products" />
            <ImageDropZone onDrop={onDropTraffic} files={trafficFiles} setFiles={setTrafficFiles} label="Trafego" max={5} disabled={aiLoading} category="traffic" />
          </div>

          {/* AI Progress */}
          {aiLoading && aiProgress > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>{aiStep}</span>
                <span>{aiProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${aiProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleAiExtract}
            disabled={aiLoading || (statsFiles.length === 0 && productFiles.length === 0 && trafficFiles.length === 0)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
          >
            {aiLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {aiStep}
              </>
            ) : aiProgress === 100 ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Dados extraidos! Clique para re-analisar
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analisar com IA
              </>
            )}
          </button>
        </motion.div>

        {/* AI Error */}
        {aiError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-700 text-sm">Erro ao processar imagens</p>
              <p className="text-xs text-red-600 mt-1">{aiError}</p>
              <button
                onClick={() => setAiError('')}
                className="text-xs text-red-500 underline mt-2 hover:text-red-700"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        )}

        {/* AI Warnings - Campos nao detectados */}
        {aiWarnings.length > 0 && !aiLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3"
          >
            <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-700 text-sm">
                {aiWarnings.length} campo(s) nao detectados pela IA
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Os campos abaixo ficaram vazios. Verifique se estao visiveis nos screenshots ou preencha manualmente.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {aiWarnings.map((w, i) => (
                  <span key={i} className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                    {w}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setAiWarnings([])}
                className="text-xs text-amber-500 underline mt-2 hover:text-amber-700"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        )}

        {/* Report Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ReportForm data={data} onChange={setData} products={products} onProductsChange={setProducts} undetectedFields={undetectedFields} />
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-4"
        >
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !data.liveTitle}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Salvando Relatorio...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Finalizar e Salvar Relatorio
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  )
}
