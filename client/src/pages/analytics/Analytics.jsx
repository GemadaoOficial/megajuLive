import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Video, Package, Plus, TrendingUp } from 'lucide-react'
import { liveReportsAPI } from '../../services/api'
import PremiumPageHeader from '../../components/ui/PremiumPageHeader'
import DateRangePicker from './components/DateRangePicker'
import OverviewTab from './components/OverviewTab'
import LivesListTab from './components/LivesListTab'
import ProductsListTab from './components/ProductsListTab'
import CreateReportModal from './components/CreateReportModal'

const TABS = [
  { id: 'overview', label: 'Visao Geral', icon: BarChart3 },
  { id: 'lives', label: 'Lista de Lives', icon: Video },
  { id: 'products', label: 'Lista de Produtos', icon: Package },
]

const STORE_FILTERS = [
  { value: '',            label: 'Todas as Lojas' },
  { value: 'MADA',        label: 'Mada'           },
  { value: 'STAR_IMPORT', label: 'Star Import'    },
]

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('overview')
  const [period, setPeriod] = useState('30d')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [store, setStore] = useState('')
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingReport, setEditingReport] = useState(null)
  const [livesListKey, setLivesListKey] = useState(0)

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
      const response = await liveReportsAPI.getSummary(params)
      setSummary(response.data.summary)
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
    setLivesListKey(k => k + 1)
    if (activeTab === 'overview') loadSummary()
  }

  const handleEditReport = (report) => {
    setEditingReport(report)
    setShowCreateModal(true)
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
              className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-orange-500 text-white font-bold rounded-2xl hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/20"
            >
              <Plus className="w-5 h-5" />
              Criar Relatorio Manual
            </button>
          </div>
        }
      />

      {/* Tabs + Date Picker */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-1 bg-white/[0.05] border border-white/[0.08] rounded-2xl p-1.5">
          {TABS.map((tab) => {
            const TabIcon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary to-orange-500 text-white shadow-md shadow-orange-200'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
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
      <div className="flex gap-2">
        {STORE_FILTERS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStore(opt.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              store === opt.value
                ? opt.value === 'MADA'
                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-200'
                  : opt.value === 'STAR_IMPORT'
                  ? 'bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-200'
                  : 'bg-white/[0.15] text-white border-white/[0.15]'
                : 'bg-white/[0.05] text-slate-400 border-white/[0.08] hover:border-white/[0.12] hover:text-white'
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
            <OverviewTab summary={summary} loading={loading} />
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
      </AnimatePresence>

      {/* Create Report Modal */}
      {showCreateModal && (
        <CreateReportModal
          editReport={editingReport}
          onClose={() => { setShowCreateModal(false); setEditingReport(null) }}
          onCreated={handleReportCreated}
        />
      )}
    </div>
  )
}
