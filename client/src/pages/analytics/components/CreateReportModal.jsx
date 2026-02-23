import { useState, useCallback, useRef } from 'react'
import { X, Loader2, Sparkles, AlertTriangle, Info, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { liveReportsAPI, aiAPI } from '../../../services/api'
import ReportForm from '../../live/components/ReportForm'
import ImageDropZone from '../../live/components/ImageDropZone'

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

// Fields that belong to each category - used to filter AI response
const STATS_FIELDS = new Set([
  'liveTitle', 'reportDate', 'reportTime', 'liveDuration',
  'totalRevenue', 'totalOrders', 'totalItemsSold', 'avgOrderValue', 'avgRevenuePerBuyer',
  'totalViewers', 'engagedViewers', 'totalViews', 'peakViewers', 'avgWatchTime',
  'clickRate', 'totalBuyers', 'productClicks', 'productClickRate', 'conversionRate', 'addToCart', 'gpm',
  'totalLikes', 'totalShares', 'totalComments', 'commentRate', 'newFollowers',
  'couponsUsed', 'coinsUsed', 'coinsCost', 'coinRedemptions', 'auctionRounds',
])
const TRAFFIC_FIELDS = new Set([
  'productImpressions', 'funnelClickRate', 'funnelProductClicks', 'orderRate', 'funnelOrders', 'impressionToOrderRate', 'trafficSources',
])

const emptyReport = {
  liveTitle: '', store: 'MADA', reportDate: new Date().toISOString().split('T')[0], reportTime: '',
  totalRevenue: 0, totalOrders: 0, totalItemsSold: 0, avgOrderValue: 0, avgRevenuePerBuyer: 0,
  totalViewers: 0, engagedViewers: 0, totalViews: 0, peakViewers: 0, avgWatchTime: 0, liveDuration: 0,
  clickRate: 0, totalBuyers: 0, productClicks: 0, productClickRate: 0, conversionRate: 0, addToCart: 0, gpm: 0,
  totalLikes: 0, totalShares: 0, totalComments: 0, commentRate: 0, newFollowers: 0,
  couponsUsed: 0, coinsUsed: 0, coinsCost: 0, coinRedemptions: 0, auctionRounds: 0,
  productImpressions: 0, funnelClickRate: 0, funnelProductClicks: 0, orderRate: 0, funnelOrders: 0, impressionToOrderRate: 0,
  trafficSources: [],
}

export default function CreateReportModal({ onClose, onCreated, editReport, prefillData }) {
  const isEdit = !!editReport
  const fromLive = !!prefillData
  const [data, setData] = useState(() => {
    if (editReport) {
      const d = { ...emptyReport }
      Object.keys(emptyReport).forEach(key => {
        if (editReport[key] !== undefined && editReport[key] !== null) d[key] = editReport[key]
      })
      if (editReport.reportDate) {
        const dt = new Date(editReport.reportDate)
        d.reportDate = dt.toISOString().split('T')[0]
        const h = dt.getHours().toString().padStart(2, '0')
        const m = dt.getMinutes().toString().padStart(2, '0')
        d.reportTime = (h !== '00' || m !== '00') ? `${h}:${m}` : ''
      }
      if (editReport.liveTitle) d.liveTitle = editReport.liveTitle
      return d
    }
    if (prefillData) {
      return {
        ...emptyReport,
        liveTitle: prefillData.liveTitle || '',
        reportDate: prefillData.reportDate || new Date().toISOString().split('T')[0],
        reportTime: prefillData.reportTime || '',
        liveDuration: prefillData.liveDuration || 0,
      }
    }
    return { ...emptyReport }
  })
  const [products, setProducts] = useState(() => {
    if (editReport?.liveProducts?.length) return editReport.liveProducts.map(({ id, liveReportId, ...rest }) => rest)
    return []
  })
  const [saving, setSaving] = useState(false)
  const [aiError, setAiError] = useState('')
  const [aiWarnings, setAiWarnings] = useState([])
  const [undetectedFields, setUndetectedFields] = useState([])

  // Per-category state
  const [statsFiles, setStatsFiles] = useState([])
  const [productFiles, setProductFiles] = useState([])
  const [trafficFiles, setTrafficFiles] = useState([])
  const [statsLoading, setStatsLoading] = useState(false)
  const [productsLoading, setProductsLoading] = useState(false)
  const [trafficLoading, setTrafficLoading] = useState(false)
  const [statsProgress, setStatsProgress] = useState(0)
  const [productsProgress, setProductsProgress] = useState(0)
  const [trafficProgress, setTrafficProgress] = useState(0)
  const [statsDone, setStatsDone] = useState(false)
  const [productsDone, setProductsDone] = useState(false)
  const [trafficDone, setTrafficDone] = useState(false)
  const [statsStep, setStatsStep] = useState('')
  const [productsStep, setProductsStep] = useState('')
  const [trafficStep, setTrafficStep] = useState('')
  const progressRefs = useRef({})

  const anyLoading = statsLoading || productsLoading || trafficLoading

  const onDropStats = useCallback((f) => { setStatsFiles(prev => [...prev, ...f].slice(0, 10)); setStatsDone(false) }, [])
  const onDropProducts = useCallback((f) => { setProductFiles(prev => [...prev, ...f].slice(0, 10)); setProductsDone(false) }, [])
  const onDropTraffic = useCallback((f) => { setTrafficFiles(prev => [...prev, ...f].slice(0, 5)); setTrafficDone(false) }, [])

  // Validate AI extraction for suspicious data
  const validateExtraction = (fields) => {
    const warnings = []
    if (fields.totalOrders > fields.addToCart && fields.addToCart > 0)
      warnings.push('Pedidos maior que Add to Cart - verificar')
    if (fields.conversionRate > 100)
      warnings.push('Taxa de conversao acima de 100%')
    if (fields.clickRate > 100)
      warnings.push('Taxa de clique acima de 100%')
    if (fields.totalViewers > 0 && fields.totalOrders > fields.totalViewers)
      warnings.push('Mais pedidos que espectadores')
    if (fields.peakViewers > fields.totalViewers && fields.totalViewers > 0)
      warnings.push('Pico de viewers maior que total de espectadores')
    if (fields.totalBuyers > fields.totalOrders && fields.totalOrders > 0)
      warnings.push('Mais compradores que pedidos')
    if (fields.engagedViewers > fields.totalViewers && fields.totalViewers > 0)
      warnings.push('Engajados maior que espectadores')

    // Detect undetected core fields
    const undetected = []
    Object.entries(CORE_FIELDS).forEach(([key, label]) => {
      if (!fields[key] && fields[key] !== 0) undetected.push(key)
    })

    return { warnings, undetected }
  }

  // Extract a single category
  const handleExtractCategory = async (category) => {
    const files = category === 'stats' ? statsFiles : category === 'products' ? productFiles : trafficFiles
    if (files.length === 0) return

    const setLoading = category === 'stats' ? setStatsLoading : category === 'products' ? setProductsLoading : setTrafficLoading
    const setProgress = category === 'stats' ? setStatsProgress : category === 'products' ? setProductsProgress : setTrafficProgress
    const setDone = category === 'stats' ? setStatsDone : category === 'products' ? setProductsDone : setTrafficDone
    const setStep = category === 'stats' ? setStatsStep : category === 'products' ? setProductsStep : setTrafficStep

    setLoading(true)
    setProgress(0)
    setDone(false)
    setAiError('')

    // Fake progress
    let p = 0
    const refKey = category
    progressRefs.current[refKey] = setInterval(() => {
      p += Math.random() * 8 + 2
      if (p > 85) p = 85
      setProgress(Math.round(p))
    }, 600)

    try {
      const formData = new FormData()
      const fieldName = category === 'stats' ? 'statsScreenshots' : category === 'products' ? 'productScreenshots' : 'trafficScreenshots'
      files.forEach(f => formData.append(fieldName, f))

      setStep('Analisando...')
      const response = await aiAPI.extractLiveReport(formData)
      clearInterval(progressRefs.current[refKey])
      setProgress(100)

      const result = response.data
      const { products: aiProducts, ...aiFields } = result

      if (category === 'stats') {
        // Only apply stats fields
        const merged = { ...data }
        Object.entries(aiFields).forEach(([key, value]) => {
          if (STATS_FIELDS.has(key) && value !== null && value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)) {
            merged[key] = value
          }
        })
        setData(merged)

        // Validate extracted data
        const { warnings, undetected } = validateExtraction(merged)
        if (warnings.length > 0) {
          warnings.forEach(w => toast.warning(w, { duration: 6000 }))
        }
        if (undetected.length > 0) {
          setUndetectedFields(undetected)
        }
        setStep('Concluido!')
      } else if (category === 'products') {
        if (aiProducts?.length) setProducts(aiProducts)
        setStep(`${aiProducts?.length || 0} produtos`)
      } else if (category === 'traffic') {
        // Only apply traffic fields
        setData(prev => {
          const merged = { ...prev }
          Object.entries(aiFields).forEach(([key, value]) => {
            if (TRAFFIC_FIELDS.has(key) && value !== null && value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)) {
              merged[key] = value
            }
          })
          return merged
        })
        setStep('Concluido!')
      }

      setDone(true)
      setTimeout(() => { setStep(''); setProgress(0) }, 2000)
    } catch (error) {
      console.error(`Erro AI ${category}:`, error)
      clearInterval(progressRefs.current[refKey])
      const msg = error.response?.data?.message || error.message || 'Erro ao processar imagens'
      setAiError(msg)
      setStep('')
      setProgress(0)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!data.liveTitle) { toast.error('Informe o nome da live'); return }
    if (!data.reportDate) { toast.error('Informe a data da live'); return }
    if (!data.reportTime) { toast.error('Informe o horario da live'); return }
    setSaving(true)
    try {
      const { reportTime, ...rest } = data
      const reportDate = reportTime ? `${data.reportDate}T${reportTime}:00` : data.reportDate
      const payload = {
        ...rest,
        reportDate,
        products,
        ...(prefillData?.liveId ? { liveId: prefillData.liveId } : {}),
        createdManually: !isEdit && !fromLive ? true : undefined,
        aiAnalyzed: statsDone || productsDone || trafficDone,
      }
      if (isEdit) {
        await liveReportsAPI.update(editReport.id, payload)
        toast.success('Relatorio atualizado com sucesso!')
      } else {
        await liveReportsAPI.create(payload)
        toast.success('Relatorio salvo com sucesso!')
      }
      onCreated()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar relatorio')
    } finally {
      setSaving(false)
    }
  }

  // Category analyze button component
  const CategoryButton = ({ category, files, loading, progress, done, step }) => {
    const labels = { stats: 'Analisar Estatisticas', products: 'Analisar Produtos', traffic: 'Analisar Trafego' }
    const colors = {
      stats: 'from-blue-500 to-indigo-600',
      products: 'from-violet-500 to-purple-600',
      traffic: 'from-emerald-500 to-teal-600',
    }

    return (
      <div className="mt-2 space-y-1.5">
        {loading && progress > 0 && (
          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
              <span>{step}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/6 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-linear-to-r ${colors[category]} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => handleExtractCategory(category)}
          disabled={anyLoading || files.length === 0}
          className={`w-full flex items-center justify-center gap-1.5 py-2 bg-linear-to-r ${colors[category]} text-white text-xs font-semibold rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity`}
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Analisando...
            </>
          ) : done ? (
            <>
              <Check className="w-3.5 h-3.5" />
              {step || 'Extraido'}
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              {labels[category]}
            </>
          )}
        </button>
      </div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-[#0f1117] border border-white/8 rounded-2xl w-full max-w-5xl my-8 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/8 bg-white/3 rounded-t-2xl">
            <div>
              <h2 className="text-xl font-bold text-white">{isEdit ? 'Editar Relatorio' : fromLive ? 'Relatorio da Live' : 'Criar Relatorio Manual'}</h2>
              <p className="text-sm text-slate-400">{isEdit ? 'Edite os dados do relatorio da live' : fromLive ? 'Preencha as estatisticas da live que acabou de encerrar' : 'Registre dados de uma live retroativa'}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/6 rounded-lg text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto relative">
            {/* Sticky AI Loading Bar */}
            {anyLoading && (
              <div className="sticky top-0 z-20 -mx-6 -mt-6 mb-2">
                <div className="bg-white/5 backdrop-blur-xs border-b border-white/8 px-5 py-2.5">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                    <span className="text-xs font-medium text-slate-300">
                      {statsLoading ? 'Analisando estatisticas...' : productsLoading ? 'Analisando produtos...' : 'Analisando trafego...'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Meta info */}
            <div className="bg-white/5 border border-white/8 rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Nome da Live *</label>
                  <input
                    type="text"
                    value={data.liveTitle}
                    onChange={(e) => setData(prev => ({ ...prev, liveTitle: e.target.value }))}
                    placeholder="Ex: Super Promo de Quinta"
                    className="w-full px-3 py-2 rounded-lg border border-white/8 bg-white/5 text-white text-sm focus:outline-hidden focus:border-primary placeholder:text-slate-500"
                  />
                </div>
                {/* Loja */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Loja *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setData(prev => ({ ...prev, store: 'MADA' }))}
                        className={`px-3 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                          data.store === 'MADA'
                            ? 'border-[#EE4D2D] bg-[#EE4D2D]/10 text-[#EE4D2D]'
                            : 'border-white/8 text-slate-400 hover:border-white/12'
                        }`}
                      >
                        Mada
                      </button>
                      <button
                        type="button"
                        onClick={() => setData(prev => ({ ...prev, store: 'STAR_IMPORT' }))}
                        className={`px-3 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                          data.store === 'STAR_IMPORT'
                            ? 'border-[#EE4D2D] bg-[#EE4D2D]/10 text-[#EE4D2D]'
                            : 'border-white/8 text-slate-400 hover:border-white/12'
                        }`}
                      >
                        Star Import
                      </button>
                    </div>
                  </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Data da Live *</label>
                  <input
                    type="date"
                    value={data.reportDate}
                    onChange={(e) => setData(prev => ({ ...prev, reportDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-white/8 bg-white/5 text-white text-sm focus:outline-hidden focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Horario de Inicio *</label>
                  <input
                    type="time"
                    value={data.reportTime || ''}
                    onChange={(e) => setData(prev => ({ ...prev, reportTime: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-white/8 bg-white/5 text-white text-sm focus:outline-hidden focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* AI Upload Section - each category has its own analyze button */}
            <div className="bg-white/5 border border-white/8 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Preencher com IA (opcional)
              </h3>
              <p className="text-xs text-slate-500 mb-4">Suba screenshots de cada categoria separadamente e clique em "Analisar" em cada uma.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <ImageDropZone onDrop={onDropStats} files={statsFiles} setFiles={setStatsFiles} label="Estatisticas" max={10} disabled={anyLoading} category="stats" />
                  <CategoryButton category="stats" files={statsFiles} loading={statsLoading} progress={statsProgress} done={statsDone} step={statsStep} />
                </div>
                <div>
                  <ImageDropZone onDrop={onDropProducts} files={productFiles} setFiles={setProductFiles} label="Produtos" max={10} disabled={anyLoading} category="products" />
                  <CategoryButton category="products" files={productFiles} loading={productsLoading} progress={productsProgress} done={productsDone} step={productsStep} />
                </div>
                <div>
                  <ImageDropZone onDrop={onDropTraffic} files={trafficFiles} setFiles={setTrafficFiles} label="Trafego" max={5} disabled={anyLoading} category="traffic" />
                  <CategoryButton category="traffic" files={trafficFiles} loading={trafficLoading} progress={trafficProgress} done={trafficDone} step={trafficStep} />
                </div>
              </div>
            </div>

            {/* AI Error */}
            {aiError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-400 text-sm">Erro ao processar imagens</p>
                  <p className="text-xs text-red-300 mt-1">{aiError}</p>
                  <button onClick={() => setAiError('')} className="text-xs text-red-400 underline mt-2 hover:text-red-300">Fechar</button>
                </div>
              </div>
            )}

            {/* Report Form */}
            <ReportForm data={data} onChange={setData} products={products} onProductsChange={setProducts} undetectedFields={undetectedFields} />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-white/8 bg-white/3 rounded-b-2xl">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-white/8 text-slate-300 font-medium hover:bg-white/6">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !data.liveTitle || !data.reportDate || !data.reportTime}
              className="px-6 py-2.5 rounded-xl bg-linear-to-r from-primary to-orange-500 text-white font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : isEdit ? 'Atualizar Relatorio' : 'Salvar Relatorio'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
