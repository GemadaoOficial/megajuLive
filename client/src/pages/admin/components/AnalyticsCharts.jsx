import { useState } from 'react'
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

export default function AnalyticsCharts({ data }) {
  const [period, setPeriod] = useState('30d')

  // Generate sample data based on period
  const getDaysCount = () => {
    switch (period) {
      case '7d': return 7
      case '30d': return 30
      case '90d': return 90
      default: return 30
    }
  }

  const generateLabels = () => {
    const days = getDaysCount()
    const labels = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      labels.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }))
    }
    return labels
  }

  const generateData = (base, variance) => {
    const days = getDaysCount()
    return Array.from({ length: days }, () =>
      Math.floor(base + Math.random() * variance - variance / 2)
    )
  }

  const labels = generateLabels()

  const salesData = {
    labels,
    datasets: [
      {
        label: 'Vendas (R$)',
        data: generateData(1500, 1000),
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
        label: 'Visualizacoes',
        data: generateData(500, 300),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const livesPerDayData = {
    labels: labels.slice(-7),
    datasets: [
      {
        label: 'Lives Realizadas',
        data: generateData(5, 4).slice(-7),
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

  const statusData = {
    labels: ['Finalizadas', 'Agendadas', 'Canceladas'],
    datasets: [
      {
        data: [65, 25, 10],
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
      legend: {
        display: false,
      },
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
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 7,
          color: '#94A3B8',
        },
      },
      y: {
        grid: {
          color: '#E2E8F0',
        },
        ticks: {
          color: '#94A3B8',
        },
      },
    },
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94A3B8',
        },
      },
      y: {
        grid: {
          color: '#E2E8F0',
        },
        ticks: {
          color: '#94A3B8',
          stepSize: 1,
        },
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          color: '#64748B',
        },
      },
    },
    cutout: '70%',
  }

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

      {/* Charts Grid */}
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
              <h3 className="font-semibold text-slate-800">Visualizacoes</h3>
              <p className="text-sm text-slate-500">Total de views</p>
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
              <p className="text-sm text-slate-500">Distribuicao</p>
            </div>
          </div>
          <div className="h-64">
            <Doughnut data={statusData} options={doughnutOptions} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
