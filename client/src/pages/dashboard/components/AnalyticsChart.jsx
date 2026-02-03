import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, Eye, ShoppingCart } from 'lucide-react'

export default function AnalyticsChart() {
  const [chartData, setChartData] = useState([])
  const [period, setPeriod] = useState('7d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChartData()
  }, [period])

  const loadChartData = async () => {
    setLoading(true)
    try {
      // Simulando dados para o gráfico (em produção, viria da API)
      const generateMockData = () => {
        const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
        const data = []
        const today = new Date()

        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)

          data.push({
            date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
            views: Math.floor(Math.random() * 500) + 100,
            sales: Math.floor(Math.random() * 50) + 10,
            revenue: (Math.random() * 2000) + 500,
          })
        }
        return data
      }

      setTimeout(() => {
        setChartData(generateMockData())
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Erro ao carregar dados do gráfico:', error)
      setLoading(false)
    }
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-slate-700 mb-2">{payload[0].payload.date}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-slate-600">
              <span style={{ color: entry.color }}>●</span> {entry.name}: {entry.value.toLocaleString('pt-BR')}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Analytics</h2>
            <p className="text-sm text-slate-500">Visualizações e vendas</p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === p
                  ? 'bg-gradient-to-r from-primary to-orange-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="flex items-center justify-center h-80">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="views"
                name="Visualizações"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#colorViews)"
              />
              <Area
                type="monotone"
                dataKey="sales"
                name="Vendas"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorSales)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Eye className="w-4 h-4 text-violet-500" />
            <p className="text-sm text-slate-500">Total Views</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {chartData.reduce((acc, curr) => acc + curr.views, 0).toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <ShoppingCart className="w-4 h-4 text-emerald-500" />
            <p className="text-sm text-slate-500">Total Sales</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {chartData.reduce((acc, curr) => acc + curr.sales, 0).toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <p className="text-sm text-slate-500">Média/dia</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {Math.round(chartData.reduce((acc, curr) => acc + curr.views, 0) / chartData.length)}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
