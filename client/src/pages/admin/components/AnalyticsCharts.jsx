import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { motion } from 'framer-motion'
import { TrendingUp, BarChart3, PieChart } from 'lucide-react'
import { liveReportsAPI } from '../../../services/api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const periods = [
  { label: '7 dias', value: '7d' },
  { label: '30 dias', value: '30d' },
  { label: '90 dias', value: '90d' },
]

export default function AnalyticsCharts() {
  const [period, setPeriod] = useState('30d')
  const [chartData, setChartData] = useState({ byDate: {}, statusCounts: { FINISHED: 0, SCHEDULED: 0, LIVE: 0 } })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [period])

  const loadData = async () => {
    setLoading(true)
    try {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
      const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0]
      const endDate = new Date().toISOString().split('T')[0]

      const response = await liveReportsAPI.getAll({
        period: 'custom',
        startDate,
        endDate,
        limit: 500,
      })
      const reports = response.data.data || []

      // Group by date
      const byDate = {}
      const today = new Date()
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        const key = d.toISOString().split('T')[0]
        byDate[key] = {
          label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
          revenue: 0,
          viewers: 0,
          lives: 0,
        }
      }

      reports.forEach(r => {
        const key = new Date(r.reportDate).toISOString().split('T')[0]
        if (byDate[key]) {
          byDate[key].revenue += r.totalRevenue || 0
          byDate[key].viewers += r.totalViewers || 0
          byDate[key].lives += 1
        }
      })

      // Status counts (from all reports - use createdManually as proxy)
      const statusCounts = {
        FINISHED: reports.length,
        SCHEDULED: 0,
        LIVE: 0,
      }

      setChartData({ byDate, statusCounts })
    } catch (error) {
      console.error('Erro ao carregar dados dos graficos:', error)
    } finally {
      setLoading(false)
    }
  }

  const dates = Object.values(chartData.byDate)
  const labels = dates.map(d => d.label)

  const salesData = {
    labels,
    datasets: [
      {
        label: 'Vendas (R$)',
        data: dates.map(d => d.revenue),
        borderColor: '#EE4D2D',
        backgroundColor: 'rgba(238, 77, 45, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const viewsData = {
    labels,
    datasets: [
      {
        label: 'Espectadores',
        data: dates.map(d => d.viewers),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const last7 = dates.slice(-7)
  const livesPerDayData = {
    labels: last7.map(d => d.label),
    datasets: [
      {
        label: 'Lives Realizadas',
        data: last7.map(d => d.lives),
        backgroundColor: [
          'rgba(238, 77, 45, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(99, 102, 241, 0.8)',
        ],
        borderRadius: 8,
      },
    ],
  }

  const { statusCounts } = chartData
  const totalStatus = statusCounts.FINISHED + statusCounts.SCHEDULED + statusCounts.LIVE
  const statusData = {
    labels: ['Finalizadas', 'Agendadas', 'Ao Vivo'],
    datasets: [
      {
        data: [statusCounts.FINISHED, statusCounts.SCHEDULED, statusCounts.LIVE],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1E293B',
        titleColor: '#F8FAFC',
        bodyColor: '#F8FAFC',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxTicksLimit: 7, color: '#94A3B8' },
      },
      y: {
        grid: { color: '#E2E8F0' },
        ticks: { color: '#94A3B8' },
      },
    },
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94A3B8' },
      },
      y: {
        grid: { color: '#E2E8F0' },
        ticks: { color: '#94A3B8', stepSize: 1 },
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 20, color: '#64748B' },
      },
    },
    cutout: '70%',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const hasData = dates.some(d => d.revenue > 0 || d.viewers > 0 || d.lives > 0)

  return (
    <div className="space-y-6">
      {/* Period Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Analytics</h2>
        <div className="flex gap-2">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p.value
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
          Nenhum dado disponivel para o periodo selecionado
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Vendas</h3>
                <p className="text-sm text-slate-500">Receita por periodo</p>
              </div>
            </div>
            <div className="h-64">
              <Line data={salesData} options={lineOptions} />
            </div>
          </motion.div>

          {/* Views Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Espectadores</h3>
                <p className="text-sm text-slate-500">Total de viewers</p>
              </div>
            </div>
            <div className="h-64">
              <Line data={viewsData} options={lineOptions} />
            </div>
          </motion.div>

          {/* Lives per Day */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Lives por Dia</h3>
                <p className="text-sm text-slate-500">Ultimos 7 dias</p>
              </div>
            </div>
            <div className="h-64">
              <Bar data={livesPerDayData} options={barOptions} />
            </div>
          </motion.div>

          {/* Status Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Status das Lives</h3>
                <p className="text-sm text-slate-500">Distribuicao ({totalStatus} lives)</p>
              </div>
            </div>
            <div className="h-64">
              <Doughnut data={statusData} options={doughnutOptions} />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
