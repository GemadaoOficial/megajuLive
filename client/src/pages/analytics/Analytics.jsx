import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Video, Package, Plus, TrendingUp, Brain, FileSpreadsheet, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { liveReportsAPI, goalsAPI } from '../../services/api'
import PremiumPageHeader from '../../components/ui/PremiumPageHeader'
import DateRangePicker from './components/DateRangePicker'
import OverviewTab from './components/OverviewTab'
import LivesListTab from './components/LivesListTab'
import ProductsListTab from './components/ProductsListTab'
import InsightsTab from './components/InsightsTab'
import CreateReportModal from './components/CreateReportModal'

const TABS = [
  { id: 'overview', label: 'Visao Geral', icon: BarChart3 },
  { id: 'lives', label: 'Lista de Lives', icon: Video },
  { id: 'products', label: 'Lista de Produtos', icon: Package },
  { id: 'insights', label: 'Insights IA', icon: Brain },
]

const STORE_FILTERS = [
  { value: '',            label: 'Todas as Lojas' },
  { value: 'MADA',        label: 'Mada'           },
  { value: 'STAR_IMPORT', label: 'Star Import'    },
]

export default function Analytics() {
  const location = useLocation()
  const nav = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [period, setPeriod] = useState('30d')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [store, setStore] = useState('')
  const [summary, setSummary] = useState(null)
  const [comparison, setComparison] = useState(null)
  const [goals, setGoals] = useState([])
  const [topProducts, setTopProducts] = useState(null)
  const [trafficSources, setTrafficSources] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingReport, setEditingReport] = useState(null)
  const [livesListKey, setLivesListKey] = useState(0)
  const [prefillData, setPrefillData] = useState(null)
  const [exporting, setExporting] = useState(false)

  // Auto-open report modal when coming from a finished live
  useEffect(() => {
    if (location.state?.fromLive) {
      const { liveId, liveTitle, liveDuration } = location.state
      const now = new Date()
      const h = now.getHours().toString().padStart(2, '0')
      const m = now.getMinutes().toString().padStart(2, '0')
      setPrefillData({
        liveId,
        liveTitle: liveTitle || '',
        reportDate: now.toISOString().split('T')[0],
        reportTime: `${h}:${m}`,
        liveDuration: liveDuration || 0,
      })
      setShowCreateModal(true)
      nav(location.pathname, { replace: true })
    }
  }, [location.state])

  useEffect(() => {
    if (activeTab === 'overview') {
      loadSummary()
    }
  }, [period, startDate, endDate, store, activeTab])

  const loadSummary = async () => {
    setLoading(true)
    try {
      const params = { period, ...(store && { store }) }
      if (period === 'custom') {
        params.startDate = startDate
        params.endDate = endDate
      }
      const [summaryRes, goalsRes, topRes] = await Promise.allSettled([
        liveReportsAPI.getSummary(params),
        goalsAPI.getAll({ month: new Date().getMonth() + 1, year: new Date().getFullYear() }),
        liveReportsAPI.getTopProducts(params),
      ])

      if (summaryRes.status === 'fulfilled') {
        setSummary(summaryRes.value.data.summary)
        setTrafficSources(summaryRes.value.data.trafficSources || [])
        setComparison(summaryRes.value.data.comparison || null)
      } else {
        setSummary(null)
      }
      if (goalsRes.status === 'fulfilled') {
        setGoals(goalsRes.value.data.goals || [])
      }
      if (topRes.status === 'fulfilled') {
        setTopProducts(topRes.value.data)
      }
    } catch (error) {
      console.error('Erro ao carregar resumo:', error)
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }

  const handleReportCreated = () => {
    setShowCreateModal(false)
    setEditingReport(null)
    setPrefillData(null)
    setLivesListKey(k => k + 1)
    if (activeTab === 'overview') loadSummary()
  }

  const handleEditReport = (report) => {
    setEditingReport(report)
    setShowCreateModal(true)
  }

  const handleGoalSaved = () => {
    loadSummary()
  }

  const handleExportExcel = async () => {
    setExporting(true)
    try {
      const params = { period, ...(store && { store }) }
      if (period === 'custom') {
        params.startDate = startDate
        params.endDate = endDate
      }
      const response = await liveReportsAPI.exportExcel(params)
      const url = URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-lives-${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Excel exportado com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar Excel:', error)
      toast.error('Erro ao exportar Excel. Verifique se ha dados no periodo.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Premium Header */}
      <PremiumPageHeader
        title="Analytics"
        subtitle="Analise completa de performance das suas lives na Shopee"
        icon={TrendingUp}
        variant="purple"
        rightContent={
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-linear-to-r from-primary to-orange-500 text-white font-bold rounded-2xl hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/20"
            >
              <Plus className="w-5 h-5" />
              Criar Relatorio Manual
            </button>
            <button
              onClick={handleExportExcel}
              disabled={exporting}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-linear-to-r from-emerald-600 to-teal-500 text-white font-bold rounded-2xl hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20 disabled:opacity-60"
            >
              {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
              {exporting ? 'Exportando...' : 'Exportar Excel'}
            </button>
          </div>
        }
      />

      {/* Tabs + Date Picker */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-1 bg-white/5 border border-white/8 rounded-2xl p-1.5 overflow-x-auto">
          {TABS.map((tab) => {
            const TabIcon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-linear-to-r from-primary to-orange-500 text-white shadow-md shadow-orange-200'
                    : 'text-slate-400 hover:text-white hover:bg-white/6'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <DateRangePicker
          period={period}
          onPeriodChange={setPeriod}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </div>

      {/* Store Filter */}
      <div className="flex gap-2 flex-wrap">
        {STORE_FILTERS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStore(opt.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              store === opt.value
                ? opt.value === 'MADA'
                  ? 'bg-orange-500 text-white border-orange-500 shadow-xs shadow-orange-200'
                  : opt.value === 'STAR_IMPORT'
                  ? 'bg-violet-600 text-white border-violet-600 shadow-xs shadow-violet-200'
                  : 'bg-white/15 text-white border-white/15'
                : 'bg-white/5 text-slate-400 border-white/8 hover:border-white/12 hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <OverviewTab
              summary={summary}
              loading={loading}
              trafficSources={trafficSources}
              comparison={comparison}
              goals={goals}
              topProducts={topProducts}
              onGoalSaved={handleGoalSaved}
            />
          </motion.div>
        )}
        {activeTab === 'lives' && (
          <motion.div key="lives" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <LivesListTab key={livesListKey} period={period} startDate={startDate} endDate={endDate} store={store} onEdit={handleEditReport} />
          </motion.div>
        )}
        {activeTab === 'products' && (
          <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <ProductsListTab period={period} startDate={startDate} endDate={endDate} store={store} />
          </motion.div>
        )}
        {activeTab === 'insights' && (
          <motion.div key="insights" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <InsightsTab period={period} startDate={startDate} endDate={endDate} store={store} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Report Modal */}
      {showCreateModal && (
        <CreateReportModal
          editReport={editingReport}
          prefillData={prefillData}
          onClose={() => { setShowCreateModal(false); setEditingReport(null); setPrefillData(null) }}
          onCreated={handleReportCreated}
        />
      )}
    </div>
  )
}
