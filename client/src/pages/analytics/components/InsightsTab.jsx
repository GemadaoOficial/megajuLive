import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Star, AlertTriangle, Trash2, Coins, Trophy, TrendingDown,
  Calendar, ArrowRight, Lightbulb, Target, Filter as FilterIcon,
  ChevronDown, ChevronUp, BarChart3, RefreshCw, Loader2, Brain,
  ShoppingCart, Eye, MousePointerClick, Clock, DollarSign, Users
} from 'lucide-react'
import { liveReportsAPI } from '../../../services/api'

// ─── Formatters ──────────────────────────────────────────────────────────────
const fmtBRL = (v) => `R$ ${(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmtNum = (v) => (v || 0).toLocaleString('pt-BR')

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
function SectionHeader({ icon: Icon, title, color, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${color} flex items-center justify-center shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
    </div>
  )
}

// ─── Expandable Card ────────────────────────────────────────────────────────
function ExpandableList({ items, renderItem, emptyText = 'Nenhum item' }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? items : items.slice(0, 3)

  if (!items || items.length === 0) {
    return <p className="text-sm text-slate-500 italic">{emptyText}</p>
  }

  return (
    <div>
      <div className="space-y-2">
        {visible.map((item, i) => renderItem(item, i))}
      </div>
      {items.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Ver menos' : `Ver mais ${items.length - 3}`}
        </button>
      )}
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

    // Fake progress animation
    let p = 0
    progressRef.current = setInterval(() => {
      p += Math.random() * 12 + 3
      if (p > 90) p = 90
      setProgress(Math.round(p))
    }, 500)

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

  // Reset when filters change
  const filterKey = `${period}-${startDate}-${endDate}-${store}`

  return (
    <div className="space-y-6">
      {/* Generate Button / Header */}
      <Glass className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Insights com IA</h2>
              <p className="text-sm text-slate-400">
                {insights
                  ? `Analise de ${meta?.livesCount || 0} lives, ${meta?.totalProducts || 0} produtos`
                  : 'Analise completa das suas lives com inteligencia artificial'}
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-violet-500 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analisando...
              </>
            ) : insights ? (
              <>
                <RefreshCw className="w-5 h-5" />
                Atualizar
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Gerar Insights
              </>
            )}
          </button>
        </div>

        {/* Progress bar */}
        {loading && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Processando dados e consultando IA...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-linear-to-r from-violet-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
            {error}
          </div>
        )}
      </Glass>

      {/* Insights Content */}
      <AnimatePresence>
        {insights && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Resumo Geral */}
            {insights.resumoGeral && (
              <Glass delay={0.05} className="p-6">
                <SectionHeader icon={Target} title="Resumo Geral" color="from-blue-500 to-cyan-500" />
                <p className="text-sm text-slate-300 leading-relaxed">{insights.resumoGeral}</p>
              </Glass>
            )}

            {/* Produtos Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Produtos Estrela */}
              <Glass delay={0.1} className="p-5">
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
                              <ArrowRight className="w-3 h-3" />
                              {item.acao}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                />
              </Glass>

              {/* Produtos Alerta */}
              <Glass delay={0.15} className="p-5">
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
                              <ArrowRight className="w-3 h-3" />
                              {item.acao}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                />
              </Glass>

              {/* Produtos para Remover */}
              <Glass delay={0.2} className="p-5">
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

            {/* Marketing + Lives Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Marketing/Moedas */}
              {insights.marketing && (
                <Glass delay={0.25} className="p-5">
                  <SectionHeader
                    icon={Coins}
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

              {/* Melhores/Piores Lives */}
              {insights.lives && (
                <Glass delay={0.3} className="p-5">
                  <SectionHeader
                    icon={Trophy}
                    title="Performance de Lives"
                    color="from-yellow-500 to-orange-500"
                    subtitle="Melhores e piores"
                  />
                  <div className="space-y-3">
                    {/* Best live */}
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

                    {/* Worst live */}
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

                    {/* Day analysis */}
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

                    {/* Duration */}
                    {insights.lives.duracaoIdeal && (
                      <div className="flex items-start gap-2 p-3 bg-blue-500/5 border border-blue-500/15 rounded-xl">
                        <Clock className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase">Duracao Ideal</p>
                          <p className="text-xs text-slate-300">{insights.lives.duracaoIdeal}</p>
                        </div>
                      </div>
                    )}

                    {/* Tips */}
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
            </div>

            {/* Precificacao + Qualidade do Publico + Abandono de Carrinho Row */}
            {(insights.precificacao || insights.audiencia || insights.carrinho) && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Precificacao */}
                {insights.precificacao && (
                  <Glass delay={0.27} className="p-5">
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

                {/* Qualidade do Publico */}
                {insights.audiencia && (
                  <Glass delay={0.29} className="p-5">
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
                  <Glass delay={0.31} className="p-5">
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
            )}

            {/* Engagement + Funnel Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Engagement */}
              {insights.engagement && (
                <Glass delay={0.35} className="p-5">
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

              {/* Funnel */}
              {insights.funil && (
                <Glass delay={0.4} className="p-5">
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

            {/* Proximos Passos */}
            {insights.proximosPassos?.length > 0 && (
              <Glass delay={0.45} className="p-6">
                <SectionHeader
                  icon={Lightbulb}
                  title="Proximos Passos"
                  color="from-violet-500 to-purple-600"
                  subtitle="Acoes recomendadas pela IA"
                />
                <div className="space-y-3">
                  {insights.proximosPassos.map((passo, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-violet-500/5 border border-violet-500/15 rounded-xl">
                      <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-violet-400">{i + 1}</span>
                      </div>
                      <p className="text-sm text-slate-300">{passo}</p>
                    </div>
                  ))}
                </div>
              </Glass>
            )}

            {/* Token cost info */}
            {meta && (
              <p className="text-center text-xs text-slate-600">
                Analise baseada em {meta.livesCount} lives e {meta.totalProducts} produtos ({meta.tokensUsed} tokens)
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
