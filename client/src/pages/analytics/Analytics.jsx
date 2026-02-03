import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  ShoppingCart,
  Users,
  BarChart3,
  Download,
  Heart,
  MessageCircle,
  Share2,
  UserPlus,
  Clock,
  Zap,
  RefreshCw,
  ArrowLeftRight,
  Database,
  CalendarDays,
} from 'lucide-react'
import { analyticsHistoryAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

export default function Analytics() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [period, setPeriod] = useState('30')
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [stats, setStats] = useState(null)
  const [availableDates, setAvailableDates] = useState([])

  // Comparison state
  const [compareDate1, setCompareDate1] = useState('')
  const [compareDate2, setCompareDate2] = useState('')
  const [comparisonData, setComparisonData] = useState(null)
  const [comparing, setComparing] = useState(false)

  useEffect(() => {
    loadAnalytics()
    loadAvailableDates()
  }, [period])

  const loadAvailableDates = async () => {
    try {
      const response = await analyticsHistoryAPI.getAvailableDates()
      setAvailableDates(response.data.dates || [])
    } catch (error) {
      console.error('Erro ao carregar datas:', error)
    }
  }

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const response = await analyticsHistoryAPI.getSummary(period)
      setStats(response.data.summary)
    } catch (error) {
      console.error('Erro ao carregar analytics:', error)
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSeedData = async () => {
    if (!confirm('Isso irá criar dados históricos de exemplo para os últimos 90 dias. Continuar?')) return
    setSeeding(true)
    try {
      await analyticsHistoryAPI.seedData(90)
      await loadAnalytics()
      await loadAvailableDates()
      alert('Dados históricos criados com sucesso!')
    } catch (error) {
      console.error('Erro ao criar dados:', error)
      alert('Erro ao criar dados históricos')
    } finally {
      setSeeding(false)
    }
  }

  const handleCompare = async () => {
    if (!compareDate1 || !compareDate2) {
      alert('Selecione duas datas para comparar')
      return
    }
    setComparing(true)
    try {
      const response = await analyticsHistoryAPI.compare(compareDate1, compareDate2)
      setComparisonData(response.data.comparison)
    } catch (error) {
      console.error('Erro ao comparar:', error)
      alert('Erro ao comparar datas. Verifique se existem dados para ambas as datas.')
    } finally {
      setComparing(false)
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num?.toFixed(0) || '0'
  }

  const formatCurrency = (num) => `R$ ${formatNumber(num)}`

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-slate-700 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-slate-600">
              <span style={{ color: entry.color }}>●</span> {entry.name}:{' '}
              {entry.name.includes('Receita') || entry.name.includes('revenue')
                ? `R$ ${entry.value.toLocaleString('pt-BR')}`
                : entry.value.toLocaleString('pt-BR')}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Empty state
  if (!loading && (!stats || stats.dataPoints === 0)) {
    return (
      <div className="space-y-8 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Relatórios e Analytics</h1>
            <p className="text-slate-500 mt-1">Análise completa de performance e métricas</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl p-12 shadow-sm text-center"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <Database className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Sem Dados Históricos</h2>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Ainda não há dados de analytics salvos. Os dados são salvos automaticamente diariamente,
            ou você pode criar dados de exemplo para demonstração.
          </p>

          {user?.role === 'ADMIN' && (
            <button
              onClick={handleSeedData}
              disabled={seeding}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-orange-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {seeding ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Criando dados...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5" />
                  Criar Dados de Exemplo (90 dias)
                </>
              )}
            </button>
          )}
        </motion.div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Relatórios e Analytics</h1>
          <p className="text-slate-500 mt-1">
            Análise completa • {stats?.dataPoints || 0} dias de dados históricos
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Tab Selector */}
          <div className="flex gap-2 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'overview' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'compare' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              Comparar Datas
            </button>
          </div>

          {/* Period Selector */}
          {activeTab === 'overview' && (
            <div className="flex gap-2">
              {[
                { value: '7', label: '7 dias' },
                { value: '30', label: '30 dias' },
                { value: '90', label: '90 dias' },
                { value: '365', label: '1 ano' },
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    period === p.value
                      ? 'bg-gradient-to-r from-primary to-orange-500 text-white shadow-md'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Compare Tab */}
      {activeTab === 'compare' && (
        <CompareSection
          availableDates={availableDates}
          compareDate1={compareDate1}
          setCompareDate1={setCompareDate1}
          compareDate2={compareDate2}
          setCompareDate2={setCompareDate2}
          handleCompare={handleCompare}
          comparing={comparing}
          comparisonData={comparisonData}
          formatNumber={formatNumber}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <>
          {/* Engajamento Stats */}
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-violet-500" />
              Métricas de Engajamento
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard icon={Eye} label="Visualizações" value={formatNumber(stats.totalViews)} subLabel={`${formatNumber(stats.avgViewsPerDay)}/dia`} gradient="from-violet-400 to-purple-500" />
              <StatCard icon={UserPlus} label="Seguidores" value={formatNumber(stats.totalFollowers)} subLabel={`+${formatNumber(stats.followersGained)}`} gradient="from-pink-400 to-rose-500" />
              <StatCard icon={Heart} label="Curtidas" value={formatNumber(stats.totalLikes)} gradient="from-red-400 to-pink-500" />
              <StatCard icon={MessageCircle} label="Comentários" value={formatNumber(stats.totalComments)} gradient="from-blue-400 to-indigo-500" />
              <StatCard icon={Share2} label="Shares" value={formatNumber(stats.totalShares)} gradient="from-green-400 to-emerald-500" />
              <StatCard icon={Zap} label="Engajamento" value={`${stats.avgEngagementRate?.toFixed(1)}%`} gradient="from-amber-400 to-orange-500" />
            </div>
          </div>

          {/* Vendas Stats */}
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Métricas de Vendas
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={DollarSign} label="Receita Total" value={formatCurrency(stats.totalRevenue)} subLabel={`${formatCurrency(stats.avgRevenuePerDay)}/dia`} gradient="from-emerald-400 to-teal-500" large />
              <StatCard icon={ShoppingCart} label="Vendas" value={formatNumber(stats.totalSales)} subLabel={`${stats.avgSalesPerDay?.toFixed(1)}/dia`} gradient="from-blue-400 to-cyan-500" large />
              <StatCard icon={Clock} label="Tempo Médio" value={formatTime(stats.avgWatchTime || 0)} gradient="from-purple-400 to-violet-500" large />
              <StatCard icon={TrendingUp} label="Conversão" value={`${((stats.totalSales / stats.totalViews) * 100 || 0).toFixed(2)}%`} gradient="from-orange-400 to-amber-500" large />
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Engajamento" subtitle="Curtidas, comentários e shares" icon={Zap} gradient="from-pink-500 to-rose-500">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '11px' }} />
                  <YAxis stroke="#94a3b8" style={{ fontSize: '11px' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="likes" name="Curtidas" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="comments" name="Comentários" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="shares" name="Shares" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Crescimento de Seguidores" subtitle="Evolução ao longo do tempo" icon={Users} gradient="from-purple-500 to-indigo-500">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.chartData}>
                  <defs>
                    <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '11px' }} />
                  <YAxis stroke="#94a3b8" style={{ fontSize: '11px' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="followers" name="Seguidores" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorFollowers)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Revenue Chart */}
          <ChartCard title="Receita e Vendas" subtitle="Performance financeira" icon={BarChart3} gradient="from-emerald-500 to-teal-500">
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '11px' }} />
                <YAxis yAxisId="left" stroke="#94a3b8" style={{ fontSize: '11px' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" style={{ fontSize: '11px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area yAxisId="left" type="monotone" dataKey="revenue" name="Receita" stroke="#10b981" strokeWidth={2} fill="url(#colorRevenue)" />
                <Bar yAxisId="right" dataKey="sales" name="Vendas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Views and Engagement Rate */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Visualizações" subtitle="Total de views por dia" icon={Eye} gradient="from-violet-500 to-purple-500">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '10px' }} />
                  <YAxis stroke="#94a3b8" style={{ fontSize: '11px' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="views" name="Views" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Taxa de Engajamento" subtitle="Percentual diário" icon={Zap} gradient="from-amber-500 to-orange-500">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '10px' }} />
                  <YAxis stroke="#94a3b8" style={{ fontSize: '11px' }} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="engagementRate" name="Taxa %" stroke="#f59e0b" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  )
}

function CompareSection({ availableDates, compareDate1, setCompareDate1, compareDate2, setCompareDate2, handleCompare, comparing, comparisonData, formatNumber, formatCurrency }) {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Comparação Histórica</h2>
            <p className="text-sm text-slate-500">Compare qualquer data, mesmo que tenha passado anos!</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Data 1</label>
            <select value={compareDate1} onChange={(e) => setCompareDate1(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-primary">
              <option value="">Selecione uma data</option>
              {availableDates.map((date) => (
                <option key={date} value={date}>{new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Data 2</label>
            <select value={compareDate2} onChange={(e) => setCompareDate2(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-primary">
              <option value="">Selecione uma data</option>
              {availableDates.map((date) => (
                <option key={date} value={date}>{new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</option>
              ))}
            </select>
          </div>

          <button onClick={handleCompare} disabled={comparing || !compareDate1 || !compareDate2} className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-orange-500 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50">
            {comparing ? <><RefreshCw className="w-5 h-5 animate-spin" />Comparando...</> : <><ArrowLeftRight className="w-5 h-5" />Comparar</>}
          </button>
        </div>
      </motion.div>

      {comparisonData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-600 font-medium">Data 1</p>
              <p className="text-lg font-bold text-blue-800">{new Date(comparisonData.date1.date).toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="flex items-center justify-center">
              <ArrowLeftRight className="w-8 h-8 text-slate-400" />
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
              <p className="text-sm text-purple-600 font-medium">Data 2</p>
              <p className="text-lg font-bold text-purple-800">{new Date(comparisonData.date2.date).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <CompareCard label="Visualizações" value1={comparisonData.date1.data.totalViews} value2={comparisonData.date2.data.totalViews} diff={comparisonData.differences.views} formatValue={formatNumber} icon={Eye} />
            <CompareCard label="Seguidores" value1={comparisonData.date1.data.totalFollowers} value2={comparisonData.date2.data.totalFollowers} diff={comparisonData.differences.followers} formatValue={formatNumber} icon={Users} />
            <CompareCard label="Curtidas" value1={comparisonData.date1.data.totalLikes} value2={comparisonData.date2.data.totalLikes} diff={comparisonData.differences.likes} formatValue={formatNumber} icon={Heart} />
            <CompareCard label="Comentários" value1={comparisonData.date1.data.totalComments} value2={comparisonData.date2.data.totalComments} diff={comparisonData.differences.comments} formatValue={formatNumber} icon={MessageCircle} />
            <CompareCard label="Shares" value1={comparisonData.date1.data.totalShares} value2={comparisonData.date2.data.totalShares} diff={comparisonData.differences.shares} formatValue={formatNumber} icon={Share2} />
            <CompareCard label="Vendas" value1={comparisonData.date1.data.totalSales} value2={comparisonData.date2.data.totalSales} diff={comparisonData.differences.sales} formatValue={formatNumber} icon={ShoppingCart} />
            <CompareCard label="Receita" value1={comparisonData.date1.data.totalRevenue} value2={comparisonData.date2.data.totalRevenue} diff={comparisonData.differences.revenue} formatValue={formatCurrency} icon={DollarSign} />
            <CompareCard label="Engajamento" value1={comparisonData.date1.data.engagementRate} value2={comparisonData.date2.data.engagementRate} diff={comparisonData.differences.engagementRate} formatValue={(v) => `${v?.toFixed(1)}%`} icon={Zap} />
          </div>
        </motion.div>
      )}

      {!comparisonData && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center">
          <CalendarDays className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <p className="text-slate-500">Selecione duas datas acima e clique em "Comparar" para ver as diferenças</p>
        </div>
      )}
    </div>
  )
}

function CompareCard({ label, value1, value2, diff, formatValue, icon: Icon }) {
  const isPositive = diff?.percentage >= 0

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="text-center">
          <p className="text-xs text-blue-600">Data 1</p>
          <p className="text-lg font-bold text-slate-800">{formatValue(value1)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-purple-600">Data 2</p>
          <p className="text-lg font-bold text-slate-800">{formatValue(value2)}</p>
        </div>
      </div>

      <div className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg ${isPositive ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        <span className="text-sm font-semibold">{isPositive ? '+' : ''}{diff?.percentage?.toFixed(1)}%</span>
      </div>
    </div>
  )
}

function ChartCard({ title, subtitle, icon: Icon, gradient, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </motion.div>
  )
}

function StatCard({ icon: Icon, label, value, subLabel, gradient, large }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`bg-white border border-slate-200 rounded-xl ${large ? 'p-5' : 'p-4'} shadow-sm`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`${large ? 'w-10 h-10' : 'w-8 h-8'} rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center`}>
          <Icon className={`${large ? 'w-5 h-5' : 'w-4 h-4'} text-white`} />
        </div>
        <span className="text-sm text-slate-500">{label}</span>
      </div>
      <p className={`${large ? 'text-2xl' : 'text-xl'} font-bold text-slate-800`}>{value}</p>
      {subLabel && <p className="text-xs text-slate-400 mt-1">{subLabel}</p>}
    </motion.div>
  )
}
