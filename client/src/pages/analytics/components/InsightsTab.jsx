import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Star, AlertTriangle, Trash2, Coins, Trophy, TrendingDown,
  Calendar, ArrowRight, Lightbulb, Target, Filter as FilterIcon,
  ChevronDown, ChevronUp, BarChart3, RefreshCw, Loader2, Brain,
  ShoppingCart, Eye, MousePointerClick, Clock, DollarSign, Users,
  CheckCircle2, XCircle, TrendingUp, Zap, Award, ChevronRight
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

// ─── Progress Steps ──────────────────────────────────────────────────────────
function ProgressSteps({ progress }) {
  const steps = [
    { label: 'Coletando dados', threshold: 0 },
    { label: 'Analisando padroes', threshold: 30 },
    { label: 'Calculando metricas', threshold: 55 },
    { label: 'Gerando insights', threshold: 80 },
  ]
  const current = steps.filter(s => progress >= s.threshold).length - 1

  return (
    <div className="flex items-center gap-2 mt-4">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            i <= current
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
              : 'bg-white/3 text-slate-500 border border-white/5'
          }`}>
            {i < current ? (
              <CheckCircle2 className="w-3 h-3 text-violet-400" />
            ) : i === current ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <div className="w-3 h-3 rounded-full border border-slate-600" />
            )}
            <span className="hidden sm:inline">{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight className={`w-3 h-3 ${i < current ? 'text-violet-400' : 'text-slate-600'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function InsightsTab({ period, startDate, endDate, store }) {
  const [insights, setInsights] = useState(null)
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const progressRef = useRef(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setProgress(0)

    let p = 0
    progressRef.current = setInterval(() => {
      p += Math.random() * 8 + 2
      if (p > 92) p = 92
      setProgress(Math.round(p))
    }, 600)

    try {
      const params = { period, ...(store && { store }) }
      if (period === 'custom') {
        params.startDate = startDate
        params.endDate = endDate
      }
      const { data } = await liveReportsAPI.getAiInsights(params)
      setInsights(data.insights)
      setMeta(data.meta)
      setProgress(100)
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao gerar insights'
      setError(msg)
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

        {/* Progress steps */}
        {loading && <ProgressSteps progress={progress} />}

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
            {error}
          </div>
        )}
      </Glass>

      {/* ── Insights Content ── */}
      <AnimatePresence>
        {insights && !loading && (
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
