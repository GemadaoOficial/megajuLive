import { motion } from 'framer-motion'
import {
  DollarSign, ShoppingCart, Eye, Users, Heart, MessageCircle,
  Share2, UserPlus, MousePointerClick, Timer, Target, Megaphone,
  TrendingUp, Zap, Clock, Package
} from 'lucide-react'

function StatCard({ icon: Icon, label, value, subLabel, gradient, large }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white border border-slate-200 rounded-xl ${large ? 'p-5' : 'p-4'} shadow-sm`}
    >
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

function SectionHeader({ icon: Icon, label, gradient }) {
  return (
    <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
      <Icon className={`w-5 h-5 ${gradient}`} />
      {label}
    </h3>
  )
}

const fmt = (num) => {
  if (num == null || isNaN(num)) return '0'
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toLocaleString('pt-BR')
}

const fmtCurrency = (num) => `R$ ${(num || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const fmtTime = (seconds) => {
  if (!seconds) return '00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h${m.toString().padStart(2, '0')}m`
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const fmtPct = (num) => `${(num || 0).toFixed(1)}%`

export default function OverviewTab({ summary, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-3">
          <TrendingUp className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-500">Nenhum dado encontrado para o periodo selecionado</p>
        <p className="text-sm text-slate-400 mt-1">Finalize uma live e preencha o relatorio para ver os dados aqui</p>
      </div>
    )
  }

  const s = summary

  return (
    <div className="space-y-8">
      {/* Transacao */}
      <div>
        <SectionHeader icon={DollarSign} label="Transacao" gradient="text-emerald-500" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard icon={DollarSign} label="Vendas" value={fmtCurrency(s.totalRevenue)} gradient="from-emerald-400 to-teal-500" large />
          <StatCard icon={ShoppingCart} label="Pedidos" value={fmt(s.totalOrders)} gradient="from-blue-400 to-cyan-500" large />
          <StatCard icon={Package} label="Itens Vendidos" value={fmt(s.totalItemsSold)} gradient="from-indigo-400 to-violet-500" large />
          <StatCard icon={DollarSign} label="Vendas por Pedido" value={fmtCurrency(s.avgOrderValue)} gradient="from-teal-400 to-emerald-500" />
          <StatCard icon={DollarSign} label="Vendas por Comprador" value={fmtCurrency(s.avgRevenuePerBuyer)} gradient="from-cyan-400 to-blue-500" />
        </div>
      </div>

      {/* Trafego */}
      <div>
        <SectionHeader icon={Eye} label="Trafego" gradient="text-violet-500" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon={Users} label="Espectadores" value={fmt(s.totalViewers)} gradient="from-violet-400 to-purple-500" />
          <StatCard icon={UserPlus} label="Engajados" value={fmt(s.engagedViewers)} gradient="from-pink-400 to-rose-500" />
          <StatCard icon={Eye} label="Visualizacoes" value={fmt(s.totalViews)} gradient="from-blue-400 to-indigo-500" />
          <StatCard icon={TrendingUp} label="Pico Simultaneo" value={fmt(s.peakViewers)} gradient="from-amber-400 to-orange-500" />
          <StatCard icon={Clock} label="Tempo Medio" value={fmtTime(s.avgWatchTime)} gradient="from-purple-400 to-violet-500" />
          <StatCard icon={Timer} label="Duracao da Live" value={fmtTime(s.totalLiveDuration)} gradient="from-rose-400 to-pink-500" />
        </div>
      </div>

      {/* Conversao */}
      <div>
        <SectionHeader icon={Target} label="Conversao" gradient="text-blue-500" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <StatCard icon={MousePointerClick} label="Taxa Cliques" value={fmtPct(s.avgClickRate)} gradient="from-blue-400 to-indigo-500" />
          <StatCard icon={Users} label="Compradores" value={fmt(s.totalBuyers)} gradient="from-emerald-400 to-teal-500" />
          <StatCard icon={MousePointerClick} label="Cliques Produto" value={fmt(s.totalProductClicks)} gradient="from-cyan-400 to-blue-500" />
          <StatCard icon={Target} label="Taxa Clique Prod." value={fmtPct(s.avgProductClickRate)} gradient="from-indigo-400 to-violet-500" />
          <StatCard icon={TrendingUp} label="Taxa Conversao" value={fmtPct(s.avgConversionRate)} gradient="from-orange-400 to-amber-500" />
          <StatCard icon={ShoppingCart} label="Add Carrinho" value={fmt(s.totalAddToCart)} gradient="from-violet-400 to-purple-500" />
          <StatCard icon={DollarSign} label="GPM" value={fmtCurrency(s.avgGpm)} gradient="from-teal-400 to-emerald-500" />
        </div>
      </div>

      {/* Engajamento */}
      <div>
        <SectionHeader icon={Heart} label="Engajamento" gradient="text-pink-500" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard icon={Heart} label="Curtidas" value={fmt(s.totalLikes)} gradient="from-red-400 to-pink-500" />
          <StatCard icon={Share2} label="Compartilhamentos" value={fmt(s.totalShares)} gradient="from-green-400 to-emerald-500" />
          <StatCard icon={MessageCircle} label="Comentarios" value={fmt(s.totalComments)} gradient="from-blue-400 to-indigo-500" />
          <StatCard icon={Zap} label="Taxa Comentarios" value={fmtPct(s.avgCommentRate)} gradient="from-amber-400 to-orange-500" />
          <StatCard icon={UserPlus} label="Novos Seguidores" value={fmt(s.totalNewFollowers)} gradient="from-pink-400 to-rose-500" />
        </div>
      </div>

      {/* Marketing */}
      <div>
        <SectionHeader icon={Megaphone} label="Marketing" gradient="text-orange-500" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Megaphone} label="Cupons Usados" value={fmt(s.totalCouponsUsed)} gradient="from-amber-400 to-orange-500" />
          <StatCard icon={DollarSign} label="Moedas Usadas" value={fmtCurrency(s.totalCoinsUsed)} gradient="from-yellow-400 to-amber-500" />
        </div>
      </div>

      {/* Resumo */}
      <div className="bg-gradient-to-r from-primary/5 to-orange-500/5 border border-primary/20 rounded-xl p-4">
        <p className="text-sm text-slate-600">
          Dados de <span className="font-bold text-primary">{s.livesCount}</span> live{s.livesCount !== 1 ? 's' : ''} no periodo selecionado
        </p>
      </div>
    </div>
  )
}
