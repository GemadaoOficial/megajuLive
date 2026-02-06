import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, Eye, ShoppingCart, DollarSign } from 'lucide-react'
import { liveReportsAPI } from '../../../services/api'

export default function AnalyticsChart() {
  const [chartData, setChartData] = useState([])
  const [period, setPeriod] = useState('30d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChartData()
  }, [period])

  const loadChartData = async () => {
    setLoading(true)
    try {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
      const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0]
      const endDate = new Date().toISOString().split('T')[0]

      const response = await liveReportsAPI.getAll({
        period: 'custom',
        startDate,
        endDate,
        limit: 200,
      })
      const reports = response.data.data || []

      // Group reports by date
      const byDate = {}
      const today = new Date()
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        const key = d.toISOString().split('T')[0]
        byDate[key] = { date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }), viewers: 0, orders: 0, revenue: 0 }
      }

      reports.forEach(r => {
        const key = new Date(r.reportDate).toISOString().split('T')[0]
        if (byDate[key]) {
          byDate[key].viewers += r.totalViewers || 0
          byDate[key].orders += r.totalOrders || 0
          byDate[key].revenue += r.totalRevenue || 0
        }
      })

      setChartData(Object.values(byDate))
    } catch (error) {
      console.error('Erro ao carregar dados do grafico:', error)
      setChartData([])
    } finally {
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
              <span style={{ color: entry.color }}>●</span> {entry.name}: {entry.name === 'Receita' ? `R$ ${entry.value.toFixed(2)}` : entry.value.toLocaleString('pt-BR')}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const totals = chartData.reduce((acc, d) => ({
    viewers: acc.viewers + d.viewers,
    orders: acc.orders + d.orders,
    revenue: acc.revenue + d.revenue,
  }), { viewers: 0, orders: 0, revenue: 0 })

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
            <p className="text-sm text-slate-500">Espectadores e pedidos por dia</p>
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
      ) : chartData.some(d => d.viewers > 0 || d.orders > 0) ? (
        <div className="h-80" style={{ minWidth: 0, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorViewers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} iconType="circle" />
              <Area type="monotone" dataKey="viewers" name="Espectadores" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorViewers)" />
              <Area type="monotone" dataKey="orders" name="Pedidos" stroke="#10b981" strokeWidth={2} fill="url(#colorOrders)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex items-center justify-center h-80 text-slate-400">
          Nenhum dado disponivel para o periodo selecionado
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Eye className="w-4 h-4 text-violet-500" />
            <p className="text-sm text-slate-500">Espectadores</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {totals.viewers.toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <ShoppingCart className="w-4 h-4 text-emerald-500" />
            <p className="text-sm text-slate-500">Pedidos</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {totals.orders.toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <p className="text-sm text-slate-500">Receita</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            R$ {totals.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
