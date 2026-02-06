import { useState, useEffect } from 'react'
import { BarChart3, Video, Package, Plus } from 'lucide-react'
import { liveReportsAPI } from '../../services/api'
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

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('overview')
  const [period, setPeriod] = useState('30d')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingReport, setEditingReport] = useState(null)
  const [livesListKey, setLivesListKey] = useState(0)

  useEffect(() => {
    if (activeTab === 'overview') {
      loadSummary()
    }
  }, [period, startDate, endDate, activeTab])

  const loadSummary = async () => {
    setLoading(true)
    try {
      const params = { period }
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
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Relatorios e Analytics</h1>
          <p className="text-slate-500 mt-1">Analise completa de performance das suas lives</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-orange-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Criar Relatorio Manual
        </button>
      </div>

      {/* Tabs + Date Picker */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {TABS.map((tab) => {
            const TabIcon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
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

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab summary={summary} loading={loading} />
      )}
      {activeTab === 'lives' && (
        <LivesListTab key={livesListKey} period={period} startDate={startDate} endDate={endDate} onEdit={handleEditReport} />
      )}
      {activeTab === 'products' && (
        <ProductsListTab period={period} startDate={startDate} endDate={endDate} />
      )}

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
