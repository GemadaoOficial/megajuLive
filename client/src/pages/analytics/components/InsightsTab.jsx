import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Star, AlertTriangle, Trash2, Coins, Trophy, TrendingDown,
  Calendar, ArrowRight, Lightbulb, Target, Filter as FilterIcon,
  ChevronDown, ChevronUp, BarChart3, RefreshCw, Loader2, Brain,
  ShoppingCart, Eye, MousePointerClick, Clock, DollarSign, Users,
  CheckCircle2, XCircle, TrendingUp, Zap, Award, ChevronRight,
  MessageSquare, Save, PenTool
} from 'lucide-react'
import { liveReportsAPI } from '../../../services/api'

// ─── Formatters ──────────────────────────────────────────────────────────────
const fmtBRL = (v) => `R$ ${(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmtNum = (v) => (v || 0).toLocaleString('pt-BR')

// ─── Animated Score Ring ─────────────────────────────────────────────────────
function ScoreRing({ score, size = 120 }) {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(score / 10, 1)
  const color = score >= 8 ? '#22c55e' : score >= 6 ? '#eab308' : '#ef4444'
  const bgColor = score >= 8 ? 'from-emerald-500/20 to-green-500/5' : score >= 6 ? 'from-yellow-500/20 to-amber-500/5' : 'from-red-500/20 to-rose-500/5'

  return (
    <div className={`relative inline-flex items-center justify-center bg-linear-to-br ${bgColor} rounded-full p-1`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - pct) }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-black text-white"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          {score.toFixed(1)}
        </motion.span>
        <span className="text-[10px] text-slate-400 font-medium">/10</span>
      </div>
    </div>
  )
}

// ─── Mini Score Badge ────────────────────────────────────────────────────────
function ScoreBadge({ score }) {
  const color = score >= 8 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    : score >= 6 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      : 'bg-red-500/20 text-red-400 border-red-500/30'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold border ${color}`}>
      {score.toFixed(1)}
    </span>
  )
}

// ─── Glass Card ──────────────────────────────────────────────────────────────
function Glass({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`bg-white/5 backdrop-blur-xl border border-white/8 rounded-2xl ${className}`}
    >
      {children}
    </motion.div>
  )
}

// ─── Section Header ──────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, color, subtitle, badge }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${color} flex items-center justify-center shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          {badge}
        </div>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
    </div>
  )
}

// ─── Expandable List ─────────────────────────────────────────────────────────
function ExpandableList({ items, renderItem, emptyText = 'Nenhum item', initialCount = 3 }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? items : items.slice(0, initialCount)

  if (!items || items.length === 0) {
    return <p className="text-sm text-slate-500 italic">{emptyText}</p>
  }

  return (
    <div>
      <div className="space-y-2">
        {visible.map((item, i) => renderItem(item, i))}
      </div>
      {items.length > initialCount && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Ver menos' : `Ver mais ${items.length - initialCount}`}
        </button>
      )}
    </div>
  )
}

// ─── Daily Live Card ─────────────────────────────────────────────────────────
function DailyLiveCard({ live, index }) {
  const [open, setOpen] = useState(false)
  const scoreColor = live.nota >= 8 ? 'border-emerald-500/30' : live.nota >= 6 ? 'border-yellow-500/30' : 'border-red-500/30'
  const scoreBg = live.nota >= 8 ? 'bg-emerald-500/5' : live.nota >= 6 ? 'bg-yellow-500/5' : 'bg-red-500/5'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`border ${scoreColor} ${scoreBg} rounded-xl overflow-hidden transition-all`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 flex items-center gap-4 text-left hover:bg-white/3 transition-colors"
      >
        {/* Date pill */}
        <div className="text-center shrink-0 w-12">
          <p className="text-lg font-black text-white leading-none">{live.data?.split('/')[0]}</p>
          <p className="text-[10px] text-slate-400 uppercase">
            {live.data?.includes('/') ? `/${live.data.split('/')[1]}` : ''}
          </p>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-white/10 shrink-0" />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{live.titulo}</p>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{live.explicacao}</p>
        </div>

        {/* Score + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <ScoreBadge score={live.nota || 0} />
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              <div className="h-px bg-white/5" />

              {/* Acertos */}
              {live.acertos?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Acertos
                  </p>
                  {live.acertos.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 pl-1">
                      <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <p className="text-xs text-slate-300">{a}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Erros */}
              {live.erros?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] text-red-400 uppercase tracking-wider font-bold flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Erros / Melhorias
                  </p>
                  {live.erros.map((e, i) => (
                    <div key={i} className="flex items-start gap-2 pl-1">
                      <div className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" />
                      <p className="text-xs text-slate-300">{e}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Deep Analysis Rotating Messages ─────────────────────────────────────────
const deepMessages = [
  'A IA está analisando cada live individualmente...',
  'Comparando métricas de engajamento e conversão...',
  'Identificando os produtos com melhor desempenho...',
  'Calculando retorno sobre investimento em moedas...',
  'Analisando padrões de horário e audiência...',
  'Cruzando dados de tráfego com vendas...',
  'Gerando recomendações personalizadas...',
  'Avaliando tendências de crescimento...',
  'Finalizando análise profunda dos dados...',
]

function DeepAnalysisMessage() {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % deepMessages.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={msgIndex}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4 }}
        className="text-xs text-slate-400 mt-1.5 text-center max-w-xs"
      >
        {deepMessages[msgIndex]}
      </motion.p>
    </AnimatePresence>
  )
}

// ─── SVG Loading Animations ──────────────────────────────────────────────────
function InsightsLoadingAnimation({ progress, completed }) {
  const stages = [
    { label: 'Coletando dados', desc: 'Buscando relatórios e métricas das lives...', threshold: 0, color: '#a78bfa' },
    { label: 'Analisando padrões', desc: 'Identificando tendências e padrões de comportamento...', threshold: 30, color: '#60a5fa' },
    { label: 'Calculando métricas', desc: 'Processando indicadores de performance...', threshold: 55, color: '#34d399' },
    { label: 'Gerando insights', desc: 'Criando relatório inteligente personalizado...', threshold: 80, color: '#f59e0b' },
  ]
  const current = stages.filter(s => progress >= s.threshold).length - 1
  const stage = stages[Math.max(0, current)]

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="flex flex-col items-center justify-center py-16 px-4"
      >
        {/* Celebration SVG */}
        <motion.svg
          width="200" height="200" viewBox="0 0 200 200"
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          {/* Glow circle */}
          <motion.circle
            cx="100" cy="100" r="80"
            fill="none" stroke="url(#completedGlow)" strokeWidth="3"
            initial={{ r: 0, opacity: 0 }}
            animate={{ r: 80, opacity: [0, 1, 0.6] }}
            transition={{ duration: 1 }}
          />
          {/* Pulse ring */}
          <motion.circle
            cx="100" cy="100" r="70"
            fill="none" stroke="#a78bfa" strokeWidth="1" opacity="0.3"
            animate={{ r: [70, 95, 70], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {/* Center filled circle */}
          <motion.circle
            cx="100" cy="100" r="55"
            fill="url(#completedFill)"
            initial={{ r: 0 }}
            animate={{ r: 55 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 150 }}
          />
          {/* Checkmark */}
          <motion.path
            d="M 72 100 L 92 118 L 130 78"
            fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          />
          {/* Sparkle particles */}
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2
            const x = 100 + Math.cos(angle) * 90
            const y = 100 + Math.sin(angle) * 90
            return (
              <motion.circle
                key={i} cx={x} cy={y} r="3"
                fill={['#a78bfa', '#f59e0b', '#34d399', '#60a5fa'][i % 4]}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
                transition={{ delay: 0.8 + i * 0.08, duration: 0.6 }}
              />
            )
          })}
          <defs>
            <radialGradient id="completedFill">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#7c3aed" />
            </radialGradient>
            <radialGradient id="completedGlow">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
            </radialGradient>
          </defs>
        </motion.svg>

        <motion.h3
          className="text-2xl font-bold text-white mt-6 bg-gradient-to-r from-violet-400 via-purple-400 to-amber-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          Insights Concluído ✨
        </motion.h3>
        <motion.p
          className="text-sm text-slate-400 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          Aqui está o seu relatório
        </motion.p>
      </motion.div>
    )
  }

  // Active loading SVG animations per stage
  const renderStageSVG = () => {
    const idx = Math.max(0, current)
    return (
      <AnimatePresence mode="wait">
        <motion.svg
          key={idx}
          width="160" height="160" viewBox="0 0 160 160"
          initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.7, rotate: 10 }}
          transition={{ duration: 0.4 }}
        >
          {/* Background glow */}
          <motion.circle
            cx="80" cy="80" r="60"
            fill="none" stroke={stage.color} strokeWidth="1" opacity="0.2"
            animate={{ r: [55, 65, 55], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />

          {idx === 0 && (
            /* Stage 0: Data collection - scanning radar */
            <>
              <motion.circle cx="80" cy="80" r="45" fill="none" stroke={stage.color} strokeWidth="1.5" opacity="0.3" />
              <motion.circle cx="80" cy="80" r="30" fill="none" stroke={stage.color} strokeWidth="1" opacity="0.2" />
              <motion.circle cx="80" cy="80" r="15" fill={stage.color} opacity="0.15" />
              {/* Radar sweep */}
              <motion.line
                x1="80" y1="80" x2="80" y2="35"
                stroke={stage.color} strokeWidth="2" strokeLinecap="round"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: '80px 80px' }}
              />
              {/* Blinking dots (data points) */}
              {[[60, 55], [105, 65], [70, 100], [95, 95], [80, 60]].map(([x, y], i) => (
                <motion.circle
                  key={i} cx={x} cy={y} r="3" fill={stage.color}
                  animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
              {/* Orbiting document icon */}
              <motion.g
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: '80px 80px' }}
              >
                <rect x="115" y="73" width="12" height="14" rx="2" fill={stage.color} opacity="0.6" />
                <line x1="118" y1="78" x2="124" y2="78" stroke="white" strokeWidth="1" opacity="0.5" />
                <line x1="118" y1="81" x2="124" y2="81" stroke="white" strokeWidth="1" opacity="0.5" />
              </motion.g>
            </>
          )}

          {idx === 1 && (
            /* Stage 1: Pattern analysis - brain network */
            <>
              {/* Brain outline */}
              <motion.ellipse
                cx="80" cy="75" rx="32" ry="35"
                fill="none" stroke={stage.color} strokeWidth="2" opacity="0.5"
                animate={{ ry: [35, 37, 35] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {/* Neural connections */}
              {[[65, 60, 80, 50], [80, 50, 95, 60], [60, 75, 80, 70], [80, 70, 100, 75], [65, 90, 80, 85], [80, 85, 95, 90]].map(([x1, y1, x2, y2], i) => (
                <motion.line
                  key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={stage.color} strokeWidth="1.5" strokeLinecap="round"
                  animate={{ opacity: [0.2, 0.8, 0.2] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
              {/* Neural nodes */}
              {[[65, 60], [80, 50], [95, 60], [60, 75], [80, 70], [100, 75], [65, 90], [80, 85], [95, 90]].map(([x, y], i) => (
                <motion.circle
                  key={i} cx={x} cy={y} r="4" fill={stage.color}
                  animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
              {/* Pulse wave across brain */}
              <motion.rect
                x="45" y="65" width="3" height="20" rx="1.5"
                fill={stage.color} opacity="0.4"
                animate={{ x: [45, 115], opacity: [0, 0.6, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </>
          )}

          {idx === 2 && (
            /* Stage 2: Calculating metrics - chart bars animating */
            <>
              {/* Chart baseline */}
              <line x1="45" y1="115" x2="135" y2="115" stroke={stage.color} strokeWidth="1.5" opacity="0.4" />
              <line x1="45" y1="115" x2="45" y2="45" stroke={stage.color} strokeWidth="1.5" opacity="0.4" />
              {/* Animated bars */}
              {[
                { x: 55, h: 50, delay: 0 },
                { x: 72, h: 35, delay: 0.15 },
                { x: 89, h: 60, delay: 0.3 },
                { x: 106, h: 45, delay: 0.45 },
                { x: 123, h: 55, delay: 0.6 },
              ].map((bar, i) => (
                <motion.rect
                  key={i} x={bar.x} width="12" rx="3"
                  fill={stage.color} opacity="0.7"
                  initial={{ y: 115, height: 0 }}
                  animate={{ y: [115, 115 - bar.h, 115, 115 - bar.h * 0.9], height: [0, bar.h, 0, bar.h * 0.9] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: bar.delay }}
                />
              ))}
              {/* Trend line animating */}
              <motion.polyline
                points="60,90 78,100 95,70 112,80 129,60"
                fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                opacity="0.6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: [0, 1, 1, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </>
          )}

          {idx === 3 && (
            /* Stage 3: Generating insights - AI sparkle */
            <>
              {/* Center AI orb */}
              <motion.circle
                cx="80" cy="80" r="20"
                fill="url(#aiOrb)"
                animate={{ r: [18, 22, 18] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              {/* Orbiting sparkles */}
              {[...Array(6)].map((_, i) => {
                const a = (i / 6) * Math.PI * 2
                return (
                  <motion.g
                    key={i}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'linear' }}
                    style={{ transformOrigin: '80px 80px' }}
                  >
                    <motion.path
                      d={`M ${80 + Math.cos(a) * 40} ${80 + Math.sin(a) * 40} l 3 -6 3 6 -6 0 z`}
                      fill={['#f59e0b', '#a78bfa', '#34d399', '#60a5fa', '#f472b6', '#fbbf24'][i]}
                      animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1 + i * 0.2, repeat: Infinity }}
                    />
                  </motion.g>
                )
              })}
              {/* Radiating lines from orb */}
              {[...Array(12)].map((_, i) => {
                const a = (i / 12) * Math.PI * 2
                return (
                  <motion.line
                    key={i}
                    x1={80 + Math.cos(a) * 25} y1={80 + Math.sin(a) * 25}
                    x2={80 + Math.cos(a) * 35} y2={80 + Math.sin(a) * 35}
                    stroke={stage.color} strokeWidth="1.5" strokeLinecap="round"
                    animate={{ opacity: [0, 0.8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.12 }}
                  />
                )
              })}
              <defs>
                <radialGradient id="aiOrb">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.6" />
                </radialGradient>
              </defs>
            </>
          )}
        </motion.svg>
      </AnimatePresence>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center py-12 px-4"
    >
      {renderStageSVG()}

      <motion.h4
        key={current}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg font-bold text-white mt-6"
      >
        {stage.label}
      </motion.h4>
      {/* Deep analysis messages when in slow zone */}
      {progress >= 60 && (
        <DeepAnalysisMessage />
      )}
      {progress < 60 && (
        <motion.p
          key={`desc-${current}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-slate-400 mt-1.5 text-center max-w-xs"
        >
          {stage.desc}
        </motion.p>
      )}

      {/* Progress bar */}
      <div className="w-64 mt-6">
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${stage.color}, ${stages[Math.min(current + 1, 3)].color})` }}
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <p className="text-[10px] text-slate-600 text-center mt-2">{Math.min(Math.round(progress), 99)}% concluído</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mt-5">
        {stages.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <motion.div
              className={`w-2 h-2 rounded-full ${i < current ? 'bg-violet-400' : i === current ? 'bg-white' : 'bg-white/15'}`}
              animate={i === current ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
            {i < stages.length - 1 && (
              <div className={`w-6 h-px ${i < current ? 'bg-violet-400/50' : 'bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────
// ─── Time Ago Formatter ──────────────────────────────────────────────────────
function timeAgo(date) {
  if (!date) return ''
  const now = new Date()
  const d = new Date(date)
  const diffMs = now - d
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'agora mesmo'
  if (mins < 60) return `ha ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `ha ${hours}h`
  const days = Math.floor(hours / 24)
  return `ha ${days}d`
}

// ─── Skeleton Loader ─────────────────────────────────────────────────────────
function InsightsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Score skeleton */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-8">
        <div className="flex items-center gap-6">
          <div className="w-[120px] h-[120px] rounded-full bg-white/10" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-48 bg-white/10 rounded-lg" />
            <div className="h-4 w-full bg-white/10 rounded-lg" />
            <div className="h-4 w-3/4 bg-white/10 rounded-lg" />
          </div>
        </div>
      </div>
      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white/5 border border-white/8 rounded-2xl p-6">
            <div className="h-4 w-32 bg-white/10 rounded-lg mb-4" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-white/10 rounded-lg" />
              <div className="h-3 w-2/3 bg-white/10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function InsightsTab({ period, startDate, endDate, store }) {
  const [insights, setInsights] = useState(null)
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingSaved, setLoadingSaved] = useState(true)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const [generatedAt, setGeneratedAt] = useState(null)
  const progressRef = useRef(null)

  // Custom prompt & monthly goals
  const [customPrompt, setCustomPrompt] = useState('')
  const [monthlyGoals, setMonthlyGoals] = useState('')
  const [showPrompt, setShowPrompt] = useState(false)
  const [showGoals, setShowGoals] = useState(false)
  const [savingGoals, setSavingGoals] = useState(false)
  const [goalsLoaded, setGoalsLoaded] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const saveGoalsTimer = useRef(null)
  const completedTimer = useRef(null)
  const streamingRef = useRef(null)

  // Load saved insights on mount or when filters change
  useEffect(() => {
    let cancelled = false
    const loadSaved = async () => {
      setLoadingSaved(true)
      try {
        const params = { period, ...(store && { store }) }
        const { data } = await liveReportsAPI.getSavedInsights(params)
        if (cancelled) return
        if (data.found) {
          setInsights(data.insights)
          setMeta(data.meta)
          setGeneratedAt(data.generatedAt)
        } else {
          setInsights(null)
          setMeta(null)
          setGeneratedAt(null)
        }
      } catch {
        // Silently fail - user can generate manually
      } finally {
        if (!cancelled) setLoadingSaved(false)
      }
    }
    loadSaved()
    return () => { cancelled = true }
  }, [period, store])

  // Load saved monthly goals from DB
  useEffect(() => {
    let cancelled = false
    const loadGoals = async () => {
      try {
        const params = { ...(store && { store }) }
        const { data } = await liveReportsAPI.getGoalsText(params)
        if (cancelled) return
        if (data.goalsText) {
          setMonthlyGoals(data.goalsText)
          setShowGoals(true)
        }
        setGoalsLoaded(true)
      } catch {
        setGoalsLoaded(true)
      }
    }
    loadGoals()
    return () => { cancelled = true }
  }, [store])

  // Auto-save goals to DB with debounce
  const saveGoalsToDB = useCallback((text) => {
    if (saveGoalsTimer.current) clearTimeout(saveGoalsTimer.current)
    saveGoalsTimer.current = setTimeout(async () => {
      setSavingGoals(true)
      try {
        await liveReportsAPI.saveGoalsText({ goalsText: text, ...(store && { store }) })
      } catch {
        // Silently fail
      } finally {
        setSavingGoals(false)
      }
    }, 1000)
  }, [store])

  const handleGoalsChange = (e) => {
    const text = e.target.value
    setMonthlyGoals(text)
    saveGoalsToDB(text)
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setProgress(0)
    setShowCompleted(false)
    setStreamingText('')

    // Start with a fast initial progress to show something is happening
    let p = 0
    progressRef.current = setInterval(() => {
      if (p < 30) {
        p += Math.random() * 8 + 3
        if (p > 30) p = 30
      }
      setProgress(Math.round(p))
    }, 600)

    try {
      const params = { period, ...(store && { store }) }
      if (period === 'custom') {
        params.startDate = startDate
        params.endDate = endDate
      }
      if (customPrompt.trim()) params.customPrompt = customPrompt.trim()
      if (monthlyGoals.trim()) params.monthlyGoals = monthlyGoals.trim()

      const token = localStorage.getItem('accessToken')
      const apiBase = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${apiBase}/live-reports/ai-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || `Erro ${response.status}`)
      }

      // Stop initial progress, switch to stream-driven progress
      clearInterval(progressRef.current)
      p = 30
      setProgress(30)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let totalChars = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') continue

          try {
            const event = JSON.parse(payload)

            if (event.type === 'chunk') {
              totalChars += event.text.length
              setStreamingText(prev => prev + event.text)
              // Progress driven by actual data (30-95%)
              const streamProgress = Math.min(30 + (totalChars / 80), 95)
              p = streamProgress
              setProgress(Math.round(p))
            }

            if (event.type === 'done') {
              clearInterval(progressRef.current)
              setProgress(100)
              setShowCompleted(true)
              await new Promise(resolve => {
                completedTimer.current = setTimeout(resolve, 2500)
              })
              setShowCompleted(false)
              setStreamingText('')
              setInsights(event.insights)
              setMeta(event.meta)
              setGeneratedAt(event.generatedAt)
            }

            if (event.type === 'error') {
              throw new Error(event.message)
            }
          } catch (parseErr) {
            if (parseErr.message && !parseErr.message.includes('JSON')) {
              throw parseErr
            }
          }
        }
      }
    } catch (err) {
      const msg = err.message || 'Erro ao gerar insights'
      setError(msg)
      setStreamingText('')
    } finally {
      clearInterval(progressRef.current)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Header / Generate Button ── */}
      <Glass className="p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Insights com IA</h2>
              <p className="text-sm text-slate-400">
                {insights
                  ? `${meta?.livesCount || 0} lives analisadas individualmente`
                  : 'Analise completa e individual de cada live com IA'}
              </p>
              {generatedAt && !loading && (
                <p className="text-xs text-slate-500 mt-1">
                  Ultima analise: {timeAgo(generatedAt)} &middot; {new Date(generatedAt).toLocaleDateString('pt-BR')} as {new Date(generatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-violet-500 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Analisando...</>
            ) : insights ? (
              <><RefreshCw className="w-5 h-5" /> Atualizar</>
            ) : (
              <><Sparkles className="w-5 h-5" /> Gerar Insights</>
            )}
          </button>
        </div>

        {/* ── Metas do Mês ── */}
        <div className="mt-4">
          <button
            onClick={() => setShowGoals(!showGoals)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <Target className="w-4 h-4 text-emerald-400" />
            Metas do Mês
            {monthlyGoals.trim() && (
              <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-md border border-emerald-500/30">ATIVAS</span>
            )}
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${showGoals ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showGoals && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 relative">
                  <textarea
                    value={monthlyGoals}
                    onChange={handleGoalsChange}
                    placeholder={`Ex:\n• Ranquear o produto "Creme Facial" no top 10\n• Aumentar pedidos para 50 por live\n• Atingir R$5.000 de receita por live\n• Divulgar o novo kit de maquiagem`}
                    className="w-full h-28 bg-white/3 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 transition-all"
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                    {savingGoals ? (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Salvando...</span>
                    ) : monthlyGoals.trim() && goalsLoaded ? (
                      <span className="text-[10px] text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Salvo</span>
                    ) : null}
                  </div>
                  <p className="text-[10px] text-slate-600 mt-1.5">Defina os objetivos deste mês. A IA avaliará o progresso de cada meta com base nos dados reais.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Prompt Personalizado ── */}
        <div className="mt-3">
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <PenTool className="w-4 h-4 text-amber-400" />
            Prompt Personalizado
            {customPrompt.trim() && (
              <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded-md border border-amber-500/30">COM PROMPT</span>
            )}
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${showPrompt ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showPrompt && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3">
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder={`Ex: "Quero uma análise focada nos produtos que tem mais cliques mas não vendem" ou "Analise se vale a pena continuar investindo moedas acima de 10.000"`}
                    className="w-full h-20 bg-white/3 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40 transition-all"
                  />
                  <p className="text-[10px] text-slate-600 mt-1.5">Escreva o que quer analisar. O relatório completo será mantido + uma seção destacada com sua análise.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SVG Loading Animation */}
        {(loading || showCompleted) && (
          <InsightsLoadingAnimation progress={progress} completed={showCompleted} />
        )}

        {/* Streaming text display */}
        {loading && streamingText && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 overflow-hidden"
          >
            <div className="p-4 bg-slate-900/60 border border-white/5 rounded-xl max-h-48 overflow-y-auto" ref={el => {
              if (el) el.scrollTop = el.scrollHeight
            }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">IA Respondendo em tempo real</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-mono whitespace-pre-wrap">
                {streamingText}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="text-violet-400"
                >|</motion.span>
              </p>
            </div>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
            {error}
          </div>
        )}
      </Glass>

      {/* ── Loading skeleton ── */}
      {loadingSaved && !insights && !loading && <InsightsSkeleton />}

      {/* ── Insights Content ── */}
      <AnimatePresence>
        {insights && !loading && !loadingSaved && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* ── Score + Resumo ── */}
            <Glass delay={0.05} className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {(insights.nota || insights.nota === 0) && (
                  <ScoreRing score={insights.nota} />
                )}
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-bold text-white mb-2">Nota Geral do Periodo</h3>
                  {insights.resumoGeral && (
                    <p className="text-sm text-slate-300 leading-relaxed">{insights.resumoGeral}</p>
                  )}
                  {meta && (
                    <p className="text-xs text-slate-500 mt-3">
                      {meta.livesCount} lives &middot; {meta.totalProducts} produtos &middot; {fmtBRL(meta.totalRevenue)} receita total
                    </p>
                  )}
                </div>
              </div>
            </Glass>

            {/* ── Avaliação de Metas (FIRST SECTION — prominent) ── */}
            {insights.avaliacaoMetas?.length > 0 && (
              <Glass delay={0.08} className="p-0 overflow-hidden border-emerald-500/30">
                {/* Top accent bar */}
                <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white">Avaliação de Metas</h3>
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-500/30 uppercase tracking-wider animate-pulse">Prioridade</span>
                      </div>
                      <p className="text-xs text-slate-400">Progresso em relação às suas metas do mês</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {insights.avaliacaoMetas.map((item, i) => {
                      const statusConfig = {
                        no_caminho: { icon: CheckCircle2, label: 'No caminho', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25', accent: 'from-emerald-500 to-teal-500' },
                        atencao: { icon: AlertTriangle, label: 'Atenção', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/25', accent: 'from-yellow-500 to-amber-500' },
                        atrasado: { icon: XCircle, label: 'Atrasado', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/25', accent: 'from-red-500 to-rose-500' },
                      }
                      const cfg = statusConfig[item.status] || statusConfig.atencao
                      const StatusIcon = cfg.icon

                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * i }}
                          className={`p-4 rounded-xl border ${cfg.bg}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cfg.accent} flex items-center justify-center shrink-0 shadow-md`}>
                              <StatusIcon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-bold text-white">{item.meta}</p>
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${cfg.color} bg-white/5 border border-white/10 uppercase`}>{cfg.label}</span>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed mb-1.5">{item.progresso}</p>
                              {item.recomendacao && (
                                <div className="flex items-start gap-1.5 mt-2 p-2.5 bg-white/3 rounded-lg">
                                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                                  <p className="text-xs text-slate-400">{item.recomendacao}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </Glass>
            )}

            {/* ── Análise Personalizada (TOP - SVG animated) ── */}
            {insights.analisePersonalizada && (
              <Glass delay={0.09} className="p-0 overflow-hidden border-amber-500/30">
                {/* Top accent bar */}
                <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500" />
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-5">
                    {/* Animated SVG sparkle icon */}
                    <div className="relative w-14 h-14 shrink-0">
                      <motion.svg
                        width="56" height="56" viewBox="0 0 56 56"
                        className="absolute inset-0"
                      >
                        {/* Background glow circle */}
                        <motion.circle
                          cx="28" cy="28" r="24"
                          fill="url(#sparkleGlow)"
                          animate={{ r: [22, 26, 22], opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 2.5, repeat: Infinity }}
                        />
                        {/* Center diamond */}
                        <motion.path
                          d="M28 8 L36 28 L28 48 L20 28 Z"
                          fill="url(#sparkleFill)" stroke="#fbbf24" strokeWidth="1"
                          animate={{ scale: [0.9, 1.05, 0.9], rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          style={{ transformOrigin: '28px 28px' }}
                        />
                        {/* Orbiting sparkle dots */}
                        {[0, 1, 2, 3, 4, 5].map(i => {
                          const angle = (i / 6) * Math.PI * 2
                          const x = 28 + Math.cos(angle) * 20
                          const y = 28 + Math.sin(angle) * 20
                          return (
                            <motion.circle
                              key={i} cx={x} cy={y} r="2"
                              fill={['#fbbf24', '#f59e0b', '#d97706', '#fbbf24', '#f59e0b', '#d97706'][i]}
                              animate={{ scale: [0.5, 1.5, 0.5], opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.25 }}
                            />
                          )
                        })}
                        {/* Outer rotating ring */}
                        <motion.circle
                          cx="28" cy="28" r="25" fill="none"
                          stroke="#fbbf24" strokeWidth="0.5" strokeDasharray="4 8" opacity="0.4"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                          style={{ transformOrigin: '28px 28px' }}
                        />
                        <defs>
                          <radialGradient id="sparkleGlow">
                            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                          </radialGradient>
                          <linearGradient id="sparkleFill" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="100%" stopColor="#f59e0b" />
                          </linearGradient>
                        </defs>
                      </motion.svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-white">Análise Personalizada</h3>
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded-lg border border-amber-500/30 uppercase tracking-wider animate-pulse">Solicitada</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Resposta ao seu prompt personalizado</p>
                    </div>
                  </div>
                  <div className="p-5 bg-gradient-to-br from-amber-500/5 to-yellow-500/3 border border-amber-500/15 rounded-xl">
                    <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">{insights.analisePersonalizada}</p>
                  </div>
                </div>
              </Glass>
            )}

            {/* ── Analise Diaria ── */}
            {insights.analiseDiaria?.length > 0 && (
              <Glass delay={0.1} className="p-6">
                <SectionHeader
                  icon={Calendar}
                  title="Analise por Live"
                  color="from-blue-500 to-indigo-600"
                  subtitle={`${insights.analiseDiaria.length} lives analisadas`}
                />
                <div className="space-y-2">
                  <ExpandableList
                    items={insights.analiseDiaria}
                    initialCount={5}
                    renderItem={(live, i) => <DailyLiveCard key={i} live={live} index={i} />}
                    emptyText="Nenhuma live para analisar"
                  />
                </div>
              </Glass>
            )}

            {/* ── Investimento em Moedas ── */}
            {insights.investimento && (
              <Glass delay={0.15} className="p-6">
                <SectionHeader
                  icon={Coins}
                  title="Investimento em Moedas"
                  color="from-amber-500 to-yellow-600"
                  subtitle="ROI do seu investimento real em moedas"
                />
                <div className="space-y-4">
                  {/* Investment vs Return */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 bg-red-500/5 border border-red-500/15 rounded-xl text-center">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Investido</p>
                      <p className="text-xl font-black text-red-400">{insights.investimento.totalInvestido || '-'}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{insights.investimento.totalMoedasUsadas || '0'} moedas</p>
                    </div>
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl text-center">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Receita Gerada</p>
                      <p className="text-xl font-black text-emerald-400">{insights.investimento.receitaGerada || '-'}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{insights.investimento.custoMedio || '-'}</p>
                    </div>
                    <div className="p-4 bg-violet-500/5 border border-violet-500/15 rounded-xl text-center">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">ROI</p>
                      <p className="text-xl font-black text-violet-400">{insights.investimento.roi || '-'}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">retorno sobre investimento</p>
                    </div>
                  </div>

                  {/* ROI visual bar */}
                  {meta?.coinsROI > 0 && (
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>ROI</span>
                        <span>{meta.coinsROI}%</span>
                      </div>
                      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-linear-to-r from-amber-500 to-emerald-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(meta.coinsROI / 20, 100)}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Analysis text */}
                  {insights.investimento.analise && (
                    <p className="text-sm text-slate-300 leading-relaxed">{insights.investimento.analise}</p>
                  )}
                  {insights.investimento.recomendacao && (
                    <div className="flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl">
                      <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-slate-300">{insights.investimento.recomendacao}</p>
                    </div>
                  )}
                </div>
              </Glass>
            )}

            {/* ── Produtos Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Estrela */}
              <Glass delay={0.2} className="p-5">
                <SectionHeader
                  icon={Star}
                  title="Produtos Estrela"
                  color="from-amber-400 to-yellow-500"
                  subtitle="Destaque nas suas lives"
                />
                <ExpandableList
                  items={insights.produtos?.estrelas || []}
                  emptyText="Nenhum produto estrela identificado"
                  renderItem={(item, i) => (
                    <div key={i} className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl">
                      <div className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-white">{item.nome}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{item.motivo}</p>
                          {item.acao && (
                            <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                              <ArrowRight className="w-3 h-3" />{item.acao}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                />
              </Glass>

              {/* Alerta */}
              <Glass delay={0.22} className="p-5">
                <SectionHeader
                  icon={AlertTriangle}
                  title="Produtos Alerta"
                  color="from-orange-500 to-red-500"
                  subtitle="Precisam de atencao"
                />
                <ExpandableList
                  items={insights.produtos?.alerta || []}
                  emptyText="Nenhum alerta"
                  renderItem={(item, i) => (
                    <div key={i} className="p-3 bg-orange-500/5 border border-orange-500/15 rounded-xl">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-white">{item.nome}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{item.problema}</p>
                          {item.acao && (
                            <p className="text-xs text-orange-400 mt-1 flex items-center gap-1">
                              <ArrowRight className="w-3 h-3" />{item.acao}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                />
              </Glass>

              {/* Remover */}
              <Glass delay={0.24} className="p-5">
                <SectionHeader
                  icon={Trash2}
                  title="Considere Remover"
                  color="from-red-500 to-rose-600"
                  subtitle="Nao estao performando"
                />
                <ExpandableList
                  items={insights.produtos?.remover || []}
                  emptyText="Nenhum produto para remover"
                  renderItem={(item, i) => (
                    <div key={i} className="p-3 bg-red-500/5 border border-red-500/15 rounded-xl">
                      <div className="flex items-start gap-2">
                        <Trash2 className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-white">{item.nome}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{item.motivo}</p>
                        </div>
                      </div>
                    </div>
                  )}
                />
              </Glass>
            </div>

            {/* ── Marketing + Funil (2 cols) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Marketing/Moedas */}
              {insights.marketing && (
                <Glass delay={0.26} className="p-5">
                  <SectionHeader
                    icon={Zap}
                    title="Marketing (Moedas)"
                    color="from-emerald-500 to-teal-600"
                    subtitle="ROI e faixa ideal"
                  />
                  <div className="space-y-3">
                    <p className="text-sm text-slate-300">{insights.marketing.resumo}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {insights.marketing.roi && (
                        <div className="p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">ROI Moedas</p>
                          <p className="text-lg font-bold text-emerald-400">{insights.marketing.roi}</p>
                        </div>
                      )}
                      {insights.marketing.faixaIdealMoedas && (
                        <div className="p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Faixa Ideal</p>
                          <p className="text-lg font-bold text-emerald-400">{insights.marketing.faixaIdealMoedas}</p>
                        </div>
                      )}
                    </div>
                    {insights.marketing.dica && (
                      <div className="flex items-start gap-2 p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                        <Lightbulb className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-300">{insights.marketing.dica}</p>
                      </div>
                    )}
                  </div>
                </Glass>
              )}

              {/* Funil */}
              {insights.funil && (
                <Glass delay={0.28} className="p-5">
                  <SectionHeader
                    icon={FilterIcon}
                    title="Funil de Conversao"
                    color="from-indigo-500 to-blue-600"
                    subtitle="Gargalos e oportunidades"
                  />
                  <div className="space-y-3">
                    {insights.funil.maiorGargalo && (
                      <div className="p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-xl">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Maior Gargalo</p>
                        <p className="text-sm font-semibold text-indigo-400">{insights.funil.maiorGargalo}</p>
                      </div>
                    )}
                    {insights.funil.taxaConversao && (
                      <div className="p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-xl">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Taxa de Conversao</p>
                        <p className="text-sm font-semibold text-white">{insights.funil.taxaConversao}</p>
                      </div>
                    )}
                    {insights.funil.dica && (
                      <div className="flex items-start gap-2 p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-xl">
                        <Lightbulb className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-300">{insights.funil.dica}</p>
                      </div>
                    )}
                  </div>
                </Glass>
              )}
            </div>

            {/* ── Audiencia + Carrinho (2 cols) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Qualidade do Publico */}
              {insights.audiencia && (
                <Glass delay={0.3} className="p-5">
                  <SectionHeader
                    icon={Users}
                    title="Qualidade do Publico"
                    color="from-cyan-500 to-blue-500"
                    subtitle="Retencao e perfil da audiencia"
                  />
                  <div className="space-y-3">
                    {insights.audiencia.qualidade && (
                      <div className="p-3 bg-cyan-500/5 border border-cyan-500/15 rounded-xl">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Qualidade</p>
                        <p className="text-sm font-semibold text-cyan-400">{insights.audiencia.qualidade}</p>
                      </div>
                    )}
                    {insights.audiencia.retencao && (
                      <div className="p-3 bg-cyan-500/5 border border-cyan-500/15 rounded-xl">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Retencao</p>
                        <p className="text-sm font-semibold text-white">{insights.audiencia.retencao}</p>
                      </div>
                    )}
                    {insights.audiencia.dicas?.length > 0 && (
                      <div className="space-y-1.5">
                        {insights.audiencia.dicas.map((dica, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Lightbulb className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-slate-300">{dica}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Glass>
              )}

              {/* Abandono de Carrinho */}
              {insights.carrinho && (
                <Glass delay={0.32} className="p-5">
                  <SectionHeader
                    icon={ShoppingCart}
                    title="Abandono de Carrinho"
                    color="from-amber-500 to-orange-500"
                    subtitle="Produtos com alta taxa de abandono"
                  />
                  <div className="space-y-3">
                    <ExpandableList
                      items={insights.carrinho.abandonoAlto || []}
                      emptyText="Nenhum abandono significativo"
                      renderItem={(item, i) => (
                        <div key={i} className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl">
                          <p className="text-sm font-semibold text-white mb-1.5">{item.nome}</p>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <p className="text-[10px] text-slate-500 uppercase">Add Cart</p>
                              <p className="text-xs font-bold text-amber-400">{fmtNum(item.addToCart)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500 uppercase">Pedidos</p>
                              <p className="text-xs font-bold text-amber-400">{fmtNum(item.orders)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500 uppercase">Taxa</p>
                              <p className="text-xs font-bold text-amber-400">{item.taxa}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    />
                    {insights.carrinho.dica && (
                      <div className="flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl">
                        <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-300">{insights.carrinho.dica}</p>
                      </div>
                    )}
                  </div>
                </Glass>
              )}
            </div>

            {/* ── Performance Lives + Engagement (2 cols) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Lives */}
              {insights.lives && (
                <Glass delay={0.34} className="p-5">
                  <SectionHeader
                    icon={Trophy}
                    title="Performance de Lives"
                    color="from-yellow-500 to-orange-500"
                    subtitle="Melhores e piores"
                  />
                  <div className="space-y-3">
                    {insights.lives.melhor && (
                      <div className="p-3 bg-yellow-500/5 border border-yellow-500/15 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy className="w-4 h-4 text-yellow-400" />
                          <span className="text-xs font-bold text-yellow-400 uppercase">Melhor Live</span>
                        </div>
                        <p className="text-sm font-semibold text-white">{insights.lives.melhor.titulo}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{insights.lives.melhor.motivo}</p>
                      </div>
                    )}
                    {insights.lives.pior && (
                      <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingDown className="w-4 h-4 text-red-400" />
                          <span className="text-xs font-bold text-red-400 uppercase">Pior Live</span>
                        </div>
                        <p className="text-sm font-semibold text-white">{insights.lives.pior.titulo}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{insights.lives.pior.motivo}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      {insights.lives.melhorDia && (
                        <div className="p-3 bg-green-500/5 border border-green-500/15 rounded-xl">
                          <div className="flex items-center gap-1 mb-1">
                            <Calendar className="w-3 h-3 text-green-400" />
                            <span className="text-[10px] text-slate-500 uppercase">Melhor Dia</span>
                          </div>
                          <p className="text-sm font-bold text-green-400">{insights.lives.melhorDia}</p>
                        </div>
                      )}
                      {insights.lives.piorDia && (
                        <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-xl">
                          <div className="flex items-center gap-1 mb-1">
                            <Calendar className="w-3 h-3 text-red-400" />
                            <span className="text-[10px] text-slate-500 uppercase">Pior Dia</span>
                          </div>
                          <p className="text-sm font-bold text-red-400">{insights.lives.piorDia}</p>
                        </div>
                      )}
                    </div>
                    {insights.lives.duracaoIdeal && (
                      <div className="flex items-start gap-2 p-3 bg-blue-500/5 border border-blue-500/15 rounded-xl">
                        <Clock className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase">Duracao Ideal</p>
                          <p className="text-xs text-slate-300">{insights.lives.duracaoIdeal}</p>
                        </div>
                      </div>
                    )}
                    {insights.lives.dicas?.length > 0 && (
                      <div className="space-y-1.5">
                        {insights.lives.dicas.map((dica, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Lightbulb className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-slate-300">{dica}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Glass>
              )}

              {/* Engagement + Precificacao */}
              <div className="space-y-4">
                {insights.engagement && (
                  <Glass delay={0.36} className="p-5">
                    <SectionHeader
                      icon={Eye}
                      title="Engajamento"
                      color="from-pink-500 to-rose-500"
                      subtitle="Interacao e trafego"
                    />
                    <div className="space-y-3">
                      <p className="text-sm text-slate-300">{insights.engagement.resumo}</p>
                      {insights.engagement.trafegoEficiente && (
                        <div className="flex items-start gap-2 p-3 bg-pink-500/5 border border-pink-500/15 rounded-xl">
                          <MousePointerClick className="w-4 h-4 text-pink-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase">Trafego Mais Eficiente</p>
                            <p className="text-xs text-slate-300">{insights.engagement.trafegoEficiente}</p>
                          </div>
                        </div>
                      )}
                      {insights.engagement.dicas?.length > 0 && (
                        <div className="space-y-1.5">
                          {insights.engagement.dicas.map((dica, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <Lightbulb className="w-3.5 h-3.5 text-pink-400 mt-0.5 shrink-0" />
                              <p className="text-xs text-slate-300">{dica}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Glass>
                )}

                {insights.precificacao && (
                  <Glass delay={0.38} className="p-5">
                    <SectionHeader
                      icon={DollarSign}
                      title="Precificacao"
                      color="from-emerald-500 to-teal-500"
                      subtitle="Ticket medio e analise de precos"
                    />
                    <div className="space-y-3">
                      {insights.precificacao.ticketMedio && (
                        <div className="p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Ticket Medio</p>
                          <p className="text-lg font-bold text-emerald-400">{insights.precificacao.ticketMedio}</p>
                        </div>
                      )}
                      {insights.precificacao.analise && (
                        <p className="text-sm text-slate-300 leading-relaxed">{insights.precificacao.analise}</p>
                      )}
                      {insights.precificacao.dica && (
                        <div className="flex items-start gap-2 p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                          <Lightbulb className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                          <p className="text-xs text-slate-300">{insights.precificacao.dica}</p>
                        </div>
                      )}
                    </div>
                  </Glass>
                )}
              </div>
            </div>

            {/* ── Proximos Passos ── */}
            {insights.proximosPassos?.length > 0 && (
              <Glass delay={0.4} className="p-6">
                <SectionHeader
                  icon={Target}
                  title="Proximos Passos"
                  color="from-violet-500 to-purple-600"
                  subtitle="Acoes recomendadas pela IA"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {insights.proximosPassos.map((passo, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-violet-500/5 border border-violet-500/15 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
                        <span className="text-sm font-black text-white">{i + 1}</span>
                      </div>
                      <p className="text-sm text-slate-300 pt-1">{passo}</p>
                    </div>
                  ))}
                </div>
              </Glass>
            )}





            {/* ── Token meta footer ── */}
            {meta && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-xs text-slate-600"
              >
                Analise individual de {meta.livesCount} lives e {meta.totalProducts} produtos ({meta.tokensUsed?.toLocaleString('pt-BR') || meta.tokensUsed} tokens)
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
