import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Target, Eye, Video } from 'lucide-react'
import StatCard from './StatCard'
import { useAnalyticsData } from '../../../hooks/useAnalytics'

const formatCurrency = (value) => {
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(1)}K`
  }
  return `R$ ${value.toFixed(0)}`
}

const formatNumber = (value) => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}

export default function StatsGrid() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const { fetchDashboardAnalytics } = useAnalyticsData()

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const data = await fetchDashboardAnalytics()
      setAnalytics(data)
    } catch (error) {
      console.error('Erro ao carregar analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    {
      label: 'Receita Total',
      value: loading ? '...' : formatCurrency(analytics?.totals?.totalRevenue || 0),
      change: analytics?.totals?.totalRevenue > 0 ? '+' : '',
      icon: DollarSign,
      gradient: 'from-emerald-400 to-teal-500',
      bg: 'bg-emerald-500/10',
      iconBg: 'bg-emerald-500',
    },
    {
      label: 'Taxa de Conversao',
      value: loading ? '...' : `${analytics?.totals?.avgConversion?.toFixed(1) || 0}%`,
      change: analytics?.totals?.avgConversion > 0 ? '+' : '',
      icon: Target,
      gradient: 'from-blue-400 to-cyan-500',
      bg: 'bg-blue-500/10',
      iconBg: 'bg-blue-500',
    },
    {
      label: 'Visualizacoes',
      value: loading ? '...' : formatNumber(analytics?.totals?.totalViews || 0),
      change: analytics?.totals?.totalViews > 0 ? '+' : '',
      icon: Eye,
      gradient: 'from-violet-400 to-purple-500',
      bg: 'bg-violet-500/10',
      iconBg: 'bg-violet-500',
    },
    {
      label: 'Total de Lives',
      value: loading ? '...' : analytics?.livesCount || 0,
      change: analytics?.livesCount > 0 ? '+' : '',
      icon: Video,
      gradient: 'from-orange-400 to-amber-500',
      bg: 'bg-orange-500/10',
      iconBg: 'bg-orange-500',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
    >
      {stats.map((stat, index) => (
        <StatCard key={stat.label} stat={stat} index={index} />
      ))}
    </motion.div>
  )
}
