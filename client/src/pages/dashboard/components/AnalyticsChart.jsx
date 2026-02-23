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
        <div className="bg-[#0a0a12]/95 backdrop-blur-xs border border-white/8 rounded-xl shadow-xl p-4 min-w-[180px]">
          <p className="text-sm font-bold text-white mb-3 pb-2 border-b border-white/6">{payload[0].payload.date}</p>
          <div className="space-y-2">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs text-slate-400">{entry.name}</span>
                </div>
                <span className="text-sm font-bold text-white">
                  {entry.name === 'Receita' ? `R$ ${entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : entry.value.toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
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

  const hasData = chartData.some(d => d.viewers > 0 || d.orders > 0 || d.revenue > 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Desempenho</h2>
            <p className="text-sm text-slate-400">Espectadores, pedidos e receita por dia</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
          {['7d', '30d', '90d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                period === p
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p === '7d' ? '7d' : p === '30d' ? '30d' : '90d'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 px-6 pt-5 pb-2">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-500/15">
          <div className="w-9 h-9 rounded-lg bg-violet-500 flex items-center justify-center">
            <Eye className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Espectadores</p>
            <p className="text-lg font-bold text-white">{totals.viewers.toLocaleString('pt-BR')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/15">
          <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Pedidos</p>
            <p className="text-lg font-bold text-white">{totals.orders.toLocaleString('pt-BR')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/15">
          <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Receita</p>
            <p className="text-lg font-bold text-emerald-400">R$ {totals.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-6 pb-6">
        {loading ? (
          <div className="flex items-center justify-center h-72">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : hasData ? (
          <div className="h-72" style={{ minWidth: 0, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorViewers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '11px' }} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '11px' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '16px' }} iconType="circle" iconSize={8} />
                <Area type="monotone" dataKey="viewers" name="Espectadores" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#colorViewers)" dot={false} activeDot={{ r: 5, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="orders" name="Pedidos" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorOrders)" dot={false} activeDot={{ r: 5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="revenue" name="Receita" stroke="#10b981" strokeWidth={2.5} fill="url(#colorRevenue)" dot={false} activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-72 text-slate-500">
            <TrendingUp className="w-12 h-12 text-slate-600 mb-3" />
            <p className="font-medium">Nenhum dado disponivel</p>
            <p className="text-sm">Finalize uma live para ver os dados aqui</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
