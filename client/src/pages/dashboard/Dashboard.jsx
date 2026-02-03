import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { livesAPI } from '../../services/api'
import WelcomeHeader from './components/WelcomeHeader'
import StatsGrid from './components/StatsGrid'
import RecentLives from './components/RecentLives'
import QuickActions from './components/QuickActions'
import AnalyticsChart from './components/AnalyticsChart'
import UpcomingLives from './components/UpcomingLives'
import RecentActivity from './components/RecentActivity'

export default function Dashboard() {
  const { user } = useAuth()
  const [recentLives, setRecentLives] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecentLives()
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

  const userName = user?.name?.split(' ')[0] || 'Usuario'

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Header */}
      <WelcomeHeader userName={userName} />

      {/* Stats Grid */}
      <StatsGrid />

      {/* Analytics Chart - Full Width */}
      <AnalyticsChart />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Lives */}
        <UpcomingLives />

        {/* Recent Activity */}
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
