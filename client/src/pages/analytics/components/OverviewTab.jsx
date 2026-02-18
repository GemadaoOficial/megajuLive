import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign, ShoppingCart, Eye, Users, Heart, MessageCircle,
  Share2, UserPlus, MousePointerClick, Megaphone,
  TrendingUp, Zap, Package, Tag, Coins, Video, Target
} from 'lucide-react'

// ─── Formatters ──────────────────────────────────────────────────────────────
const fmt = (num) => {
  if (num == null || isNaN(num)) return '0'
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toLocaleString('pt-BR')
}
const fmtCurrency = (num) =>
  `R$ ${(num || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmtTime = (seconds) => {
  if (!seconds) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h${m.toString().padStart(2, '0')}m`
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}
const fmtPct = (num) => `${(num || 0).toFixed(1)}%`

// ─── Glass Card ──────────────────────────────────────────────────────────────
function Glass({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-2xl ${className}`}
    >
      {children}
    </motion.div>
  )
}

// ─── V-Funnel (single SVG, seamless layers) ──────────────────────────────────
function VFunnel({ funnelSteps }) {
  const [hovered, setHovered] = useState(null)
  const N = funnelSteps.length

  // Layout
  const W       = 600
  const STEP_H  = 60
  const LABEL_W = 128
  const RIGHT_W = 88
  const FUNNEL_W = W - LABEL_W - RIGHT_W
  const CX       = LABEL_W + FUNNEL_W / 2
  const MAX_HW   = FUNNEL_W / 2
  const MIN_HW   = MAX_HW * 0.15
  const TOTAL_H  = N * STEP_H

  const maxVal = funnelSteps[0]?.value || 1
  const hw = (val) => Math.max((val / maxVal) * MAX_HW, MIN_HW)

  // Pre-compute coordinates once
  const layers = funnelSteps.map((step, i) => {
    const y    = i * STEP_H
    const topW = hw(step.value)
    const botW = hw(funnelSteps[i + 1]?.value ?? step.value * 0.65)
    const midY = y + STEP_H / 2
    const x1 = CX - topW, x2 = CX + topW
    const x3 = CX + botW,  x4 = CX - botW
    const trap = `M ${x1} ${y} L ${x2} ${y} L ${x3} ${y + STEP_H} L ${x4} ${y + STEP_H} Z`
    const rate = i > 0 && funnelSteps[i - 1].value > 0
      ? ((step.value / funnelSteps[i - 1].value) * 100).toFixed(1)
      : null
    const dropTo = i < N - 1 && step.value > 0
      ? ((funnelSteps[i + 1].value / step.value) * 100).toFixed(1)
      : null
    return { ...step, y, midY, x1, x2, x3, x4, trap, rate, dropTo }
  })

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${TOTAL_H + 34}`}
        className="w-full overflow-visible"
        style={{ display: 'block' }}
      >
        <defs>
          {layers.map((step, i) => (
            <radialGradient
              key={i}
              id={`vfg-${i}`}
              cx="50%" cy="38%" r="68%"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0%"   stopColor={step.colorEnd || step.color} stopOpacity={hovered === i ? 1 : 0.95} />
              <stop offset="60%"  stopColor={step.color}                   stopOpacity={hovered === i ? 0.9 : 0.75} />
              <stop offset="100%" stopColor={step.color}                   stopOpacity={hovered === i ? 0.55 : 0.38} />
            </radialGradient>
          ))}
          <filter id="vf-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {layers.map((step, i) => {
          const isHov = hovered === i
          const { y, midY, x1, x2, x3, x4, trap, rate, dropTo } = step

          return (
            <g
              key={step.label}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'default' }}
            >
              {/* Glow behind layer on hover */}
              {isHov && (
                <path d={trap} fill={step.color} opacity="0.18" filter="url(#vf-glow)" style={{ pointerEvents: 'none' }} />
              )}

              {/* Main trapezoid */}
              <motion.path
                d={trap}
                fill={`url(#vfg-${i})`}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                style={{ transformOrigin: `${CX}px ${midY}px` }}
                transition={{ delay: 0.1 + i * 0.09, duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
              />

              {/* Top edge highlight */}
              <line
                x1={x1} y1={y} x2={x2} y2={y}
                stroke={isHov ? `${step.color}66` : 'rgba(255,255,255,0.12)'}
                strokeWidth={isHov ? 2 : 1}
              />

              {/* Divider between layers */}
              {i > 0 && (
                <line x1={x1} y1={y} x2={x2} y2={y} stroke="rgba(0,0,0,0.45)" strokeWidth="1.5" />
              )}

              {/* ── Left: label + dashed connector ── */}
              <text
                x={LABEL_W - 14} y={midY}
                textAnchor="end" dominantBaseline="middle"
                fill={isHov ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.38)'}
                fontSize="11.5" fontWeight={isHov ? '600' : '400'}
                style={{ transition: 'fill 0.15s' }}
              >{step.label}</text>

              <line
                x1={LABEL_W - 10} y1={midY} x2={x1 - 5} y2={midY}
                stroke={isHov ? `${step.color}bb` : 'rgba(255,255,255,0.09)'}
                strokeWidth="1.5" strokeDasharray="3,4"
                style={{ transition: 'stroke 0.15s' }}
              />
              <circle
                cx={x1 - 5} cy={midY} r="3"
                fill={isHov ? step.color : 'rgba(255,255,255,0.18)'}
                style={{ transition: 'fill 0.15s' }}
              />

              {/* ── Center: value ── */}
              <motion.text
                x={CX} y={midY}
                textAnchor="middle" dominantBaseline="middle"
                fill="white" fontSize="15" fontWeight="800"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 + i * 0.09 }}
              >{fmt(step.value)}</motion.text>

              {/* ── Right: from-previous rate (top) + drop-to-next (bottom) ── */}
              <motion.text
                x={LABEL_W + FUNNEL_W + 12} y={midY - (dropTo ? 7 : 0)}
                textAnchor="start" dominantBaseline="middle"
                fill={rate ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.7)'}
                fontSize="11.5" fontWeight={rate ? '400' : '700'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.09 }}
              >{rate ? `${rate}%` : '100%'}</motion.text>

              {dropTo && (
                <motion.text
                  x={LABEL_W + FUNNEL_W + 12} y={midY + 8}
                  textAnchor="start" dominantBaseline="middle"
                  fill="rgba(255,255,255,0.18)" fontSize="10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 + i * 0.09 }}
                >↓ {dropTo}%</motion.text>
              )}
            </g>
          )
        })}

        {/* ── Footer: total conversion ── */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}>
          <line
            x1={LABEL_W} y1={TOTAL_H + 8}
            x2={LABEL_W + FUNNEL_W} y2={TOTAL_H + 8}
            stroke="rgba(255,255,255,0.06)" strokeWidth="1"
          />
          <text
            x={CX} y={TOTAL_H + 22}
            textAnchor="middle" dominantBaseline="middle"
            fill="rgba(255,255,255,0.22)" fontSize="10.5"
          >
            {`Conversão total: ${maxVal > 0 ? ((funnelSteps[N - 1]?.value / maxVal) * 100).toFixed(3) : 0}%  ·  ${fmt(funnelSteps[0]?.value)} → ${fmt(funnelSteps[N - 1]?.value)}`}
          </text>
        </motion.g>
      </svg>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function OverviewTab({ summary, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-white/40 text-sm">Carregando dados...</span>
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="text-center py-24 px-4">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-white/[0.05] flex items-center justify-center mb-4">
          <TrendingUp className="w-10 h-10 text-white/20" />
        </div>
        <p className="text-lg font-semibold text-white/50">Nenhum dado encontrado</p>
        <p className="text-sm text-white/30 mt-1">Finalize uma live e preencha o relatorio para ver os dados aqui</p>
      </div>
    )
  }

  const s = summary
  const avgRevenuePerLive = s.livesCount > 0 ? s.totalRevenue / s.livesCount : 0

  // Funnel data
  const funnelSteps = [
    { label: 'Espectadores', value: s.totalViewers,       color: '#8b5cf6', colorEnd: '#a78bfa' },
    { label: 'Engajados',    value: s.engagedViewers,     color: '#3b82f6', colorEnd: '#60a5fa' },
    { label: 'Cliques',      value: s.totalProductClicks, color: '#6366f1', colorEnd: '#818cf8' },
    { label: 'Carrinho',     value: s.totalAddToCart,      color: '#f97316', colorEnd: '#fb923c' },
    { label: 'Pedidos',      value: s.totalOrders,         color: '#10b981', colorEnd: '#34d399' },
  ]

  // KPI cards data
  const kpiCards = [
    {
      icon: Eye, label: 'Espectadores', value: fmt(s.totalViewers),
      sub: `pico: ${fmt(s.peakViewers)}`,
      border: 'border-violet-500', glow: 'hover:shadow-violet-500/20',
    },
    {
      icon: Zap, label: 'Engajados', value: fmt(s.engagedViewers),
      sub: `taxa: ${fmtPct((s.engagedViewers / (s.totalViewers || 1)) * 100)}`,
      border: 'border-blue-500', glow: 'hover:shadow-blue-500/20',
    },
    {
      icon: Package, label: 'Pedidos', value: fmt(s.totalOrders),
      sub: `avg: ${fmtCurrency(s.avgOrderValue)}`,
      border: 'border-orange-500', glow: 'hover:shadow-orange-500/20',
    },
    {
      icon: Video, label: 'Lives', value: s.livesCount,
      sub: `dur. media: ${fmtTime(s.avgLiveDuration)}`,
      border: 'border-white/30', glow: 'hover:shadow-white/10',
    },
  ]

  // Performance metrics
  const perfMetrics = [
    { label: 'Conversao',    value: fmtPct(s.avgConversionRate),    pct: Math.min(s.avgConversionRate || 0, 100),    color: 'bg-emerald-500' },
    { label: 'Tx. Clique',   value: fmtPct(s.avgClickRate),         pct: Math.min(s.avgClickRate || 0, 100),         color: 'bg-blue-500'    },
    { label: 'Clique Prod.', value: fmtPct(s.avgProductClickRate),  pct: Math.min(s.avgProductClickRate || 0, 100),  color: 'bg-indigo-500'  },
    { label: 'GPM',          value: fmtCurrency(s.avgGpm),           pct: Math.min((s.avgGpm / 100) * 100, 100),      color: 'bg-amber-500'   },
    { label: 'Avg/Live',     value: fmtCurrency(avgRevenuePerLive),  pct: 60,                                          color: 'bg-violet-500'  },
  ]

  // Engagement rows
  const engagementRows = [
    { icon: Heart,         label: 'Curtidas',          value: fmt(s.totalLikes),        iconColor: 'text-rose-400',   iconBg: 'bg-rose-500/20'   },
    { icon: MessageCircle, label: 'Comentarios',       value: fmt(s.totalComments),     iconColor: 'text-blue-400',   iconBg: 'bg-blue-500/20',  sub: fmtPct(s.avgCommentRate) + ' taxa' },
    { icon: Share2,        label: 'Compartilhamentos', value: fmt(s.totalShares),       iconColor: 'text-green-400',  iconBg: 'bg-green-500/20'  },
    { icon: UserPlus,      label: 'Novos Seguidores',  value: fmt(s.totalNewFollowers), iconColor: 'text-violet-400', iconBg: 'bg-violet-500/20' },
  ]

  // Revenue sub-stats
  const revenueStats = [
    { icon: Package,     label: 'Pedidos',        value: fmt(s.totalOrders)           },
    { icon: ShoppingCart, label: 'Itens vendidos', value: fmt(s.totalItemsSold)        },
    { icon: Users,        label: 'Compradores',   value: fmt(s.totalBuyers)           },
    { icon: DollarSign,   label: 'Avg/pedido',    value: fmtCurrency(s.avgOrderValue) },
  ]

  return (
    <div className="space-y-5">

      {/* ── SECTION 1: Revenue Hero ──────────────────────────────────────── */}
      <Glass delay={0.05} className="p-5 md:p-6 border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-500/[0.08] to-transparent">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <DollarSign className="w-4.5 h-4.5 text-emerald-400" />
              </div>
              <span className="text-white/50 text-sm font-medium uppercase tracking-wider">Receita Total</span>
            </div>
            <p className="text-4xl md:text-5xl font-extrabold text-white leading-none">
              {fmtCurrency(s.totalRevenue)}
            </p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-white/30 text-xs">avg/comprador</p>
            <p className="text-emerald-400 font-bold text-lg">{fmtCurrency(s.avgRevenuePerBuyer)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {revenueStats.map((st) => (
            <div key={st.label} className="bg-white/[0.05] rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
              <st.icon className="w-4 h-4 text-emerald-400/70 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-white font-bold text-sm leading-tight truncate">{st.value}</p>
                <p className="text-white/35 text-xs truncate">{st.label}</p>
              </div>
            </div>
          ))}
        </div>
      </Glass>

      {/* ── SECTION 2: KPI Grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map((kpi, i) => (
          <Glass
            key={kpi.label}
            delay={0.1 + i * 0.05}
            className={`p-4 border-t-2 ${kpi.border} hover:bg-white/[0.08] ${kpi.glow} hover:shadow-lg transition-all duration-300 cursor-default`}
          >
            <div className="flex items-center gap-2 mb-3">
              <kpi.icon className="w-4 h-4 text-white/50" />
              <span className="text-white/40 text-xs font-medium uppercase tracking-wider">{kpi.label}</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-white leading-none mb-1">{kpi.value}</p>
            <p className="text-white/30 text-xs">{kpi.sub}</p>
          </Glass>
        ))}
      </div>

      {/* ── SECTION 3: Donut Funnel + Performance ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Donut Funnel */}
        <Glass delay={0.25} className="lg:col-span-7 p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-white/[0.08] flex items-center justify-center">
              <MousePointerClick className="w-4 h-4 text-white/60" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Funil de Conversao</h3>
              <p className="text-white/30 text-xs">Jornada do espectador ate a compra</p>
            </div>
          </div>

          <VFunnel funnelSteps={funnelSteps} />
        </Glass>

        {/* Performance Panel */}
        <Glass delay={0.3} className="lg:col-span-5 p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-white/[0.08] flex items-center justify-center">
              <Target className="w-4 h-4 text-white/60" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Performance</h3>
              <p className="text-white/30 text-xs">Taxas e metricas de eficiencia</p>
            </div>
          </div>

          <div className="space-y-4">
            {perfMetrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.06 }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white/50 text-xs font-medium">{m.label}</span>
                  <span className="text-white font-bold text-sm">{m.value}</span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(m.pct, 2)}%` }}
                    transition={{ delay: 0.5 + i * 0.08, duration: 0.6 }}
                    className={`h-full rounded-full ${m.color}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Audience extra stats */}
          <div className="mt-5 pt-4 border-t border-white/[0.06]">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.04] rounded-xl px-3 py-2.5">
                <p className="text-white/30 text-xs">Tempo medio</p>
                <p className="text-white font-bold text-sm">{fmtTime(s.avgWatchTime)}</p>
              </div>
              <div className="bg-white/[0.04] rounded-xl px-3 py-2.5">
                <p className="text-white/30 text-xs">Visualizacoes</p>
                <p className="text-white font-bold text-sm">{fmt(s.totalViews)}</p>
              </div>
            </div>
          </div>
        </Glass>
      </div>

      {/* ── SECTION 4: Engagement + Marketing ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Engagement */}
        <Glass delay={0.35} className="p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
              <Heart className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Engajamento</h3>
              <p className="text-white/30 text-xs">Interacoes da audiencia</p>
            </div>
          </div>

          <div className="space-y-1">
            {engagementRows.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
                </div>
                <span className="text-white/50 text-sm flex-1">{item.label}</span>
                <div className="flex items-center gap-2">
                  {item.sub && (
                    <span className="text-xs text-white/25 bg-white/[0.05] px-1.5 py-0.5 rounded-md">{item.sub}</span>
                  )}
                  <span className="font-bold text-white text-sm">{item.value}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </Glass>

        {/* Marketing */}
        <Glass delay={0.4} className="p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Megaphone className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Marketing</h3>
              <p className="text-white/30 text-xs">Cupons e moedas Shopee</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Cupons */}
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Tag className="w-4.5 h-4.5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Cupons utilizados</p>
                    <p className="text-2xl font-bold text-white leading-tight">{fmt(s.totalCouponsUsed)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Moedas */}
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Coins className="w-4.5 h-4.5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Moedas utilizadas</p>
                    <p className="text-2xl font-bold text-white leading-tight">{fmt(s.totalCoinsUsed)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/25 text-xs">Custo</p>
                  <p className="font-bold text-yellow-400 text-sm">{fmtCurrency(s.totalCoinsCost)}</p>
                </div>
              </div>
              {s.totalCoinsUsed > 0 && (
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden mt-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(((s.totalCoinsCost || 0) / (s.totalRevenue || 1)) * 100, 100)}%` }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-500"
                  />
                </div>
              )}
              {s.totalCoinsUsed > 0 && (
                <p className="text-white/20 text-xs mt-1.5">
                  {(((s.totalCoinsCost || 0) / (s.totalRevenue || 1)) * 100).toFixed(1)}% da receita
                </p>
              )}
            </div>
          </div>
        </Glass>
      </div>

    </div>
  )
}
