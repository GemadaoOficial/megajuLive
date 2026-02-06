import { motion } from 'framer-motion'
import {
  DollarSign, ShoppingCart, Eye, Users, Heart, MessageCircle,
  Share2, UserPlus, MousePointerClick, Timer, Target, Megaphone,
  TrendingUp, Zap, Clock, Package, ArrowUpRight, BarChart3
} from 'lucide-react'

function HighlightCard({ icon: Icon, label, value, gradient, iconBg, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative group"
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-25 transition-opacity duration-300`} />
      <div className="relative bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-lg transition-all shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">{label}</p>
            <p className={`text-3xl font-bold mt-2 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
              {value}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function StatCard({ icon: Icon, label, value, subLabel, gradient, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.03, transition: { duration: 0.15 } }}
      className="bg-white border border-slate-100 rounded-xl p-4 hover:shadow-md hover:border-slate-200 transition-all group cursor-default"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-9 h-9 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-xl font-bold text-slate-800">{value}</p>
      {subLabel && <p className="text-xs text-slate-400 mt-1">{subLabel}</p>}
    </motion.div>
  )
}

function SectionCard({ icon: Icon, title, subtitle, gradient, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>
      <div className="p-5">
        {children}
      </div>
    </motion.div>
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
        <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <TrendingUp className="w-10 h-10 text-slate-300" />
        </div>
        <p className="text-lg font-semibold text-slate-500">Nenhum dado encontrado</p>
        <p className="text-sm text-slate-400 mt-1">Finalize uma live e preencha o relatorio para ver os dados aqui</p>
      </div>
    )
  }

  const s = summary

  return (
    <div className="space-y-6">
      {/* Top KPI Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <HighlightCard icon={DollarSign} label="Receita Total" value={fmtCurrency(s.totalRevenue)} gradient="from-emerald-400 to-teal-500" iconBg="bg-emerald-500" delay={0.05} />
        <HighlightCard icon={ShoppingCart} label="Total de Pedidos" value={fmt(s.totalOrders)} gradient="from-blue-400 to-cyan-500" iconBg="bg-blue-500" delay={0.1} />
        <HighlightCard icon={Eye} label="Espectadores" value={fmt(s.totalViewers)} gradient="from-violet-400 to-purple-500" iconBg="bg-violet-500" delay={0.15} />
        <HighlightCard icon={TrendingUp} label="Taxa de Conversao" value={fmtPct(s.avgConversionRate)} gradient="from-orange-400 to-amber-500" iconBg="bg-orange-500" delay={0.2} />
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transacao */}
        <SectionCard icon={DollarSign} title="Transacao" subtitle="Vendas e pedidos" gradient="from-emerald-400 to-teal-500" delay={0.1}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard icon={DollarSign} label="Vendas" value={fmtCurrency(s.totalRevenue)} gradient="from-emerald-400 to-teal-500" delay={0.15} />
            <StatCard icon={ShoppingCart} label="Pedidos" value={fmt(s.totalOrders)} gradient="from-blue-400 to-cyan-500" delay={0.17} />
            <StatCard icon={Package} label="Itens Vendidos" value={fmt(s.totalItemsSold)} gradient="from-indigo-400 to-violet-500" delay={0.19} />
            <StatCard icon={DollarSign} label="Vendas/Pedido" value={fmtCurrency(s.avgOrderValue)} gradient="from-teal-400 to-emerald-500" delay={0.21} />
            <StatCard icon={DollarSign} label="Vendas/Comprador" value={fmtCurrency(s.avgRevenuePerBuyer)} gradient="from-cyan-400 to-blue-500" delay={0.23} />
          </div>
        </SectionCard>

        {/* Trafego */}
        <SectionCard icon={Eye} title="Trafego" subtitle="Audiencia e visualizacoes" gradient="from-violet-400 to-purple-500" delay={0.15}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard icon={Users} label="Espectadores" value={fmt(s.totalViewers)} gradient="from-violet-400 to-purple-500" delay={0.2} />
            <StatCard icon={UserPlus} label="Engajados" value={fmt(s.engagedViewers)} gradient="from-pink-400 to-rose-500" delay={0.22} />
            <StatCard icon={Eye} label="Visualizacoes" value={fmt(s.totalViews)} gradient="from-blue-400 to-indigo-500" delay={0.24} />
            <StatCard icon={TrendingUp} label="Pico Simultaneo" value={fmt(s.peakViewers)} gradient="from-amber-400 to-orange-500" delay={0.26} />
            <StatCard icon={Clock} label="Tempo Medio" value={fmtTime(s.avgWatchTime)} gradient="from-purple-400 to-violet-500" delay={0.28} />
            <StatCard icon={Timer} label="Duracao da Live" value={fmtTime(s.totalLiveDuration)} gradient="from-rose-400 to-pink-500" delay={0.3} />
          </div>
        </SectionCard>

        {/* Conversao */}
        <SectionCard icon={Target} title="Conversao" subtitle="Funil de vendas" gradient="from-blue-400 to-indigo-500" delay={0.2}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard icon={MousePointerClick} label="Taxa Cliques" value={fmtPct(s.avgClickRate)} gradient="from-blue-400 to-indigo-500" delay={0.25} />
            <StatCard icon={Users} label="Compradores" value={fmt(s.totalBuyers)} gradient="from-emerald-400 to-teal-500" delay={0.27} />
            <StatCard icon={MousePointerClick} label="Cliques Produto" value={fmt(s.totalProductClicks)} gradient="from-cyan-400 to-blue-500" delay={0.29} />
            <StatCard icon={Target} label="Taxa Clique Prod." value={fmtPct(s.avgProductClickRate)} gradient="from-indigo-400 to-violet-500" delay={0.31} />
            <StatCard icon={TrendingUp} label="Taxa Conversao" value={fmtPct(s.avgConversionRate)} gradient="from-orange-400 to-amber-500" delay={0.33} />
            <StatCard icon={ShoppingCart} label="Add Carrinho" value={fmt(s.totalAddToCart)} gradient="from-violet-400 to-purple-500" delay={0.35} />
            <StatCard icon={DollarSign} label="GPM" value={fmtCurrency(s.avgGpm)} gradient="from-teal-400 to-emerald-500" delay={0.37} />
          </div>
        </SectionCard>

        {/* Engajamento */}
        <SectionCard icon={Heart} title="Engajamento" subtitle="Interacoes da audiencia" gradient="from-pink-400 to-rose-500" delay={0.25}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard icon={Heart} label="Curtidas" value={fmt(s.totalLikes)} gradient="from-red-400 to-pink-500" delay={0.3} />
            <StatCard icon={Share2} label="Compartilhamentos" value={fmt(s.totalShares)} gradient="from-green-400 to-emerald-500" delay={0.32} />
            <StatCard icon={MessageCircle} label="Comentarios" value={fmt(s.totalComments)} gradient="from-blue-400 to-indigo-500" delay={0.34} />
            <StatCard icon={Zap} label="Taxa Comentarios" value={fmtPct(s.avgCommentRate)} gradient="from-amber-400 to-orange-500" delay={0.36} />
            <StatCard icon={UserPlus} label="Novos Seguidores" value={fmt(s.totalNewFollowers)} gradient="from-pink-400 to-rose-500" delay={0.38} />
          </div>
        </SectionCard>
      </div>

      {/* Marketing */}
      <SectionCard icon={Megaphone} title="Marketing" subtitle="Cupons e moedas" gradient="from-amber-400 to-orange-500" delay={0.3}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Megaphone} label="Cupons Usados" value={fmt(s.totalCouponsUsed)} gradient="from-amber-400 to-orange-500" delay={0.35} />
          <StatCard icon={DollarSign} label="Moedas Usadas" value={fmt(s.totalCoinsUsed)} subLabel={`Custo: ${fmtCurrency(s.totalCoinsCost)}`} gradient="from-yellow-400 to-amber-500" delay={0.37} />
        </div>
      </SectionCard>

      {/* Summary Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-white font-semibold">
              {s.livesCount} live{s.livesCount !== 1 ? 's' : ''} no periodo
            </p>
            <p className="text-slate-400 text-sm">Dados agregados de todas as lives selecionadas</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/10">
          <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-bold text-emerald-400">{fmtCurrency(s.totalRevenue)}</span>
        </div>
      </motion.div>
    </div>
  )
}
