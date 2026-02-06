import { useState, useCallback } from 'react'
import { X, Loader2, Sparkles, Image as ImageIcon, AlertTriangle, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { liveReportsAPI, aiAPI } from '../../../services/api'
import ReportForm from '../../live/components/ReportForm'

function DropArea({ onDrop, files, setFiles, label, max, disabled }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: max,
    disabled,
    noClick: false,
    noKeyboard: false,
    onDrop: (accepted) => onDrop(accepted),
  })

  const handlePaste = useCallback((e) => {
    if (disabled) return
    const items = e.clipboardData?.items
    if (!items) return
    const imageFiles = []
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile()
        if (file) imageFiles.push(file)
      }
    }
    if (imageFiles.length > 0) {
      e.preventDefault()
      onDrop(imageFiles)
    }
  }, [disabled, onDrop])

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label} (max {max})</label>
      <div
        {...getRootProps()}
        onPaste={handlePaste}
        tabIndex={0}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-slate-300 hover:border-primary'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <ImageIcon className="mx-auto w-6 h-6 text-slate-400 mb-1" />
        <p className="text-xs text-slate-500">{files.length > 0 ? `${files.length} arquivo(s)` : 'Arraste, clique ou cole (Ctrl+V)'}</p>
      </div>
      {files.length > 0 && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {files.map((f, i) => (
            <div key={i} className="relative w-12 h-12 rounded overflow-hidden border border-slate-200">
              <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={(e) => { e.stopPropagation(); setFiles(prev => prev.filter((_, idx) => idx !== i)) }} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">x</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

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

const emptyReport = {
  liveTitle: '', reportDate: new Date().toISOString().split('T')[0], reportTime: '',
  totalRevenue: 0, totalOrders: 0, totalItemsSold: 0, avgOrderValue: 0, avgRevenuePerBuyer: 0,
  totalViewers: 0, engagedViewers: 0, totalViews: 0, peakViewers: 0, avgWatchTime: 0, liveDuration: 0,
  clickRate: 0, totalBuyers: 0, productClicks: 0, productClickRate: 0, conversionRate: 0, addToCart: 0, gpm: 0,
  totalLikes: 0, totalShares: 0, totalComments: 0, commentRate: 0, newFollowers: 0,
  couponsUsed: 0, coinsUsed: 0, coinsCost: 0, coinRedemptions: 0, auctionRounds: 0,
  productImpressions: 0, orderRate: 0, impressionToOrderRate: 0,
}

export default function CreateReportModal({ onClose, onCreated, editReport }) {
  const isEdit = !!editReport
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
    return { ...emptyReport }
  })
  const [products, setProducts] = useState(() => {
    if (editReport?.liveProducts?.length) return editReport.liveProducts.map(({ id, liveReportId, ...rest }) => rest)
    return []
  })
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

      setAiStep('Preparando imagens...')
      setAiProgress(15)
      statsFiles.forEach(f => formData.append('statsScreenshots', f))
      productFiles.forEach(f => formData.append('productScreenshots', f))
      trafficFiles.forEach(f => formData.append('trafficScreenshots', f))

      setAiStep('Enviando para a IA...')
      setAiProgress(35)

      const progressInterval = setInterval(() => {
        setAiProgress(prev => {
          if (prev >= 75) { clearInterval(progressInterval); return prev }
          return prev + 1
        })
      }, 800)

      setAiStep('IA analisando screenshots...')
      const response = await aiAPI.extractLiveReport(formData)
      clearInterval(progressInterval)

      const result = response.data

      setAiStep('Processando resultados...')
      setAiProgress(85)
      const { products: aiProducts, ...aiStats } = result
      setData(prev => ({ ...prev, ...aiStats }))
      if (aiProducts?.length) setProducts(aiProducts)

      // Detectar campos nao reconhecidos
      const notDetected = []
      const warnings = []
      Object.entries(CORE_FIELDS).forEach(([field, label]) => {
        if (!aiStats[field] || aiStats[field] === 0) {
          notDetected.push(field)
          warnings.push(label)
        }
      })
      setUndetectedFields(notDetected)
      setAiWarnings(warnings)

      setAiStep('Concluido!')
      setAiProgress(100)

      setTimeout(() => {
        setAiStep('')
        setAiProgress(0)
      }, 2000)
    } catch (error) {
      console.error('Erro AI:', error)
      const msg = error.response?.data?.message || error.message || 'Erro desconhecido ao processar imagens'
      setAiError(msg)
      setAiStep('')
      setAiProgress(0)
    } finally {
      setAiLoading(false)
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
        createdManually: !isEdit ? true : undefined,
        aiAnalyzed: statsFiles.length > 0 || productFiles.length > 0 || trafficFiles.length > 0,
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
          className="bg-slate-50 rounded-2xl w-full max-w-5xl my-8 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-white rounded-t-2xl">
            <div>
              <h2 className="text-xl font-bold text-slate-800">{isEdit ? 'Editar Relatorio' : 'Criar Relatorio Manual'}</h2>
              <p className="text-sm text-slate-500">{isEdit ? 'Edite os dados do relatorio da live' : 'Registre dados de uma live retroativa'}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
          </div>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Meta info */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Live *</label>
                  <input
                    type="text"
                    value={data.liveTitle}
                    onChange={(e) => setData(prev => ({ ...prev, liveTitle: e.target.value }))}
                    placeholder="Ex: Super Promo de Quinta"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data da Live *</label>
                  <input
                    type="date"
                    value={data.reportDate}
                    onChange={(e) => setData(prev => ({ ...prev, reportDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Horario de Inicio *</label>
                  <input
                    type="time"
                    value={data.reportTime || ''}
                    onChange={(e) => setData(prev => ({ ...prev, reportTime: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* AI Upload Section */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Preencher com IA (opcional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <DropArea onDrop={onDropStats} files={statsFiles} setFiles={setStatsFiles} label="Estatisticas" max={10} disabled={aiLoading} />
                <DropArea onDrop={onDropProducts} files={productFiles} setFiles={setProductFiles} label="Produtos" max={10} disabled={aiLoading} />
                <DropArea onDrop={onDropTraffic} files={trafficFiles} setFiles={setTrafficFiles} label="Trafego" max={5} disabled={aiLoading} />
              </div>

              {/* Progress bar */}
              {aiLoading && aiProgress > 0 && (
                <div className="mb-3">
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
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {aiStep}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analisar com IA
                  </>
                )}
              </button>
            </div>

            {/* AI Error */}
            {aiError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-700 text-sm">Erro ao processar imagens</p>
                  <p className="text-xs text-red-600 mt-1">{aiError}</p>
                  <button onClick={() => setAiError('')} className="text-xs text-red-500 underline mt-2 hover:text-red-700">Fechar</button>
                </div>
              </div>
            )}

            {/* AI Warnings */}
            {aiWarnings.length > 0 && !aiLoading && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-700 text-sm">{aiWarnings.length} campo(s) nao detectados</p>
                  <p className="text-xs text-amber-600 mt-1">Verifique se estao visiveis nos screenshots ou preencha manualmente.</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {aiWarnings.map((w, i) => (
                      <span key={i} className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">{w}</span>
                    ))}
                  </div>
                  <button onClick={() => setAiWarnings([])} className="text-xs text-amber-500 underline mt-2 hover:text-amber-700">Fechar</button>
                </div>
              </div>
            )}

            {/* Report Form */}
            <ReportForm data={data} onChange={setData} products={products} onProductsChange={setProducts} undetectedFields={undetectedFields} />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-white rounded-b-2xl">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !data.liveTitle || !data.reportDate || !data.reportTime}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : isEdit ? 'Atualizar Relatorio' : 'Salvar Relatorio'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
