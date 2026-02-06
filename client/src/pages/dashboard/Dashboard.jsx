import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { livesAPI, liveReportsAPI } from '../../services/api'
import { Flame, Play, Calendar, DollarSign, Video } from 'lucide-react'
import PremiumPageHeader from '../../components/ui/PremiumPageHeader'
import StatsGrid from './components/StatsGrid'
import RecentLives from './components/RecentLives'
import QuickActions from './components/QuickActions'
import AnalyticsChart from './components/AnalyticsChart'
import UpcomingLives from './components/UpcomingLives'
import RecentActivity from './components/RecentActivity'

const fmtCurrency = (v) => {
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(1)}K`
  return `R$ ${(v || 0).toFixed(0)}`
}

export default function Dashboard() {
  const { user } = useAuth()
  const [recentLives, setRecentLives] = useState([])
  const [loading, setLoading] = useState(true)
  const [headerStats, setHeaderStats] = useState({ revenue: 0, lives: 0 })

  useEffect(() => {
    loadRecentLives()
    loadHeaderStats()
  }, [])

  const loadRecentLives = async () => {
    try {
      const response = await livesAPI.getAll()
      const lives = response.data.data || response.data.lives || []
      setRecentLives(lives.slice(0, 5))
    } catch (error) {
      console.error('Erro ao carregar lives:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadHeaderStats = async () => {
    try {
      const response = await liveReportsAPI.getSummary({ period: '30d' })
      const s = response.data.summary
      setHeaderStats({
        revenue: s?.totalRevenue || 0,
        lives: response.data.count || 0,
      })
    } catch (e) {
      // Non-critical
    }
  }

  const userName = user?.name?.split(' ')[0] || 'Usuario'

  return (
    <div className="space-y-8 pb-8">
      {/* Premium Header */}
      <PremiumPageHeader
        icon={Flame}
        title={`Ola, ${userName}!`}
        subtitle="Pronto para mais uma live incrivel? Acompanhe seus resultados e gerencie suas transmissoes."
        rightContent={
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Receita (30 dias)</p>
                <p className="text-lg font-bold text-white">{fmtCurrency(headerStats.revenue)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Video className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Lives no periodo</p>
                <p className="text-lg font-bold text-white">{headerStats.lives}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Link
                to="/live"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-900 font-semibold rounded-xl hover:bg-white/90 transition-all text-sm"
              >
                <Play className="w-4 h-4" />
                Iniciar Live
              </Link>
              <Link
                to="/calendar"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-all text-sm border border-white/10"
              >
                <Calendar className="w-4 h-4" />
              </Link>
            </div>
          </div>
        }
      />

      {/* Stats Grid */}
      <StatsGrid />

      {/* Analytics Chart - Full Width */}
      <AnalyticsChart />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingLives />
        <RecentActivity />
      </div>

      {/* Recent Lives and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentLives lives={recentLives} loading={loading} />
        <QuickActions />
      </div>
    </div>
  )
}
