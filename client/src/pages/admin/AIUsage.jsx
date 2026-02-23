import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { adminAPI } from '../../services/api'
import {
  Brain,
  Zap,
  DollarSign,
  Hash,
  BarChart3,
  ArrowLeft,
  Users,
  RefreshCw,
} from 'lucide-react'

const FEATURE_LABELS = {
  'suggest-title': 'Sugerir Titulos',
  'suggest-description': 'Sugerir Descricoes',
  'extract-stats': 'Extracao Estatisticas',
  'extract-products': 'Extracao Produtos',
  'extract-traffic': 'Extracao Trafego',
  'ai-dedup': 'Dedup Produtos',
  'ai-insights': 'Insights IA',
}

const FEATURE_COLORS = {
  'ai-insights': 'bg-violet-500',
  'extract-stats': 'bg-sky-500',
  'extract-products': 'bg-emerald-500',
  'extract-traffic': 'bg-amber-500',
  'ai-dedup': 'bg-rose-500',
  'suggest-title': 'bg-primary',
  'suggest-description': 'bg-teal-500',
}

function formatTokens(n) {
  if (!n) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString('pt-BR')
}

function formatCost(n) {
  if (!n) return '$0.00'
  return `$${n.toFixed(4)}`
}

export default function AIUsage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    loadData()
  }, [days])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await adminAPI.getAiUsage(days)
      setData(res.data)
    } catch (err) {
      console.error('Erro ao carregar uso de IA:', err)
    } finally {
      setLoading(false)
    }
  }

  const maxTokens = data?.byFeature?.length
    ? Math.max(...data.byFeature.map((f) => f.tokens))
    : 0

  const maxDailyTokens = data?.dailyUsage?.length
    ? Math.max(...data.dailyUsage.map((d) => d.tokens))
    : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin"
            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-500/20">
                <Brain className="w-6 h-6 text-violet-400" />
              </div>
              <h1 className="text-3xl font-bold text-white">Uso de IA</h1>
            </div>
            <p className="text-slate-400 mt-1 ml-14">
              Monitoramento de tokens e custos do GPT-4.1-mini
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-white/5 border border-white/8 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50"
          >
            <option value={7}>7 dias</option>
            <option value={30}>30 dias</option>
            <option value={90}>90 dias</option>
            <option value={365}>1 ano</option>
          </select>
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !data ? (
        <div className="text-center py-20 text-slate-400">Erro ao carregar dados</div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Tokens',
                value: formatTokens(data.summary.totalTokens),
                icon: Zap,
                gradient: 'from-violet-500 to-purple-500',
                bg: 'bg-violet-500/20',
              },
              {
                label: 'Custo Total',
                value: formatCost(data.summary.totalCost),
                icon: DollarSign,
                gradient: 'from-emerald-500 to-teal-500',
                bg: 'bg-emerald-500/20',
              },
              {
                label: 'Requisicoes',
                value: data.summary.totalRequests.toLocaleString('pt-BR'),
                icon: Hash,
                gradient: 'from-sky-500 to-blue-500',
                bg: 'bg-sky-500/20',
              },
              {
                label: 'Media/Requisicao',
                value: `${formatTokens(data.summary.avgTokensPerRequest)} tokens`,
                icon: BarChart3,
                gradient: 'from-amber-500 to-orange-500',
                bg: 'bg-amber-500/20',
              },
            ].map((card) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/8 rounded-2xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">{card.label}</p>
                    <p
                      className={`text-2xl font-bold mt-2 bg-linear-to-r ${card.gradient} bg-clip-text text-transparent`}
                    >
                      {card.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${card.bg}`}>
                    <card.icon className="w-5 h-5 text-white/70" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* By Feature */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 border border-white/8 rounded-2xl p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-5">
              Uso por Funcionalidade
            </h2>
            {data.byFeature.length === 0 ? (
              <p className="text-slate-400 text-sm">Nenhum uso registrado no periodo</p>
            ) : (
              <div className="space-y-4">
                {data.byFeature.map((f) => {
                  const pct = maxTokens > 0 ? (f.tokens / maxTokens) * 100 : 0
                  const color = FEATURE_COLORS[f.feature] || 'bg-slate-500'
                  return (
                    <div key={f.feature}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-slate-200">
                          {FEATURE_LABELS[f.feature] || f.feature}
                        </span>
                        <span className="text-sm text-slate-400">
                          {formatTokens(f.tokens)} tokens ({formatCost(f.cost)}) &middot;{' '}
                          {f.requests} req
                        </span>
                      </div>
                      <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className={`h-full rounded-full ${color}`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>

          {/* Daily Usage Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/8 rounded-2xl p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-5">
              Uso Diario ({days} dias)
            </h2>
            {data.dailyUsage.length === 0 ? (
              <p className="text-slate-400 text-sm">Nenhum uso registrado no periodo</p>
            ) : (
              <div className="flex items-end gap-1 h-32">
                {data.dailyUsage.map((d) => {
                  const pct = maxDailyTokens > 0 ? (d.tokens / maxDailyTokens) * 100 : 0
                  const date = new Date(d.date + 'T12:00:00')
                  return (
                    <div
                      key={d.date}
                      className="flex-1 group relative"
                      title={`${date.toLocaleDateString('pt-BR')}: ${formatTokens(d.tokens)} tokens (${formatCost(d.cost)})`}
                    >
                      <div
                        className="bg-violet-500/80 hover:bg-violet-400 rounded-sm transition-colors mx-px"
                        style={{ height: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                  )
                })}
              </div>
            )}
            {data.dailyUsage.length > 0 && (
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>
                  {new Date(data.dailyUsage[0].date + 'T12:00:00').toLocaleDateString(
                    'pt-BR',
                    { day: '2-digit', month: 'short' }
                  )}
                </span>
                <span>
                  {new Date(
                    data.dailyUsage[data.dailyUsage.length - 1].date + 'T12:00:00'
                  ).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            )}
          </motion.div>

          {/* By User */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 border border-white/8 rounded-2xl p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-400" />
              Por Usuario
            </h2>
            {data.byUser.length === 0 ? (
              <p className="text-slate-400 text-sm">Nenhum uso registrado no periodo</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-slate-400 border-b border-white/5">
                      <th className="pb-3 font-medium">#</th>
                      <th className="pb-3 font-medium">Nome</th>
                      <th className="pb-3 font-medium text-right">Requisicoes</th>
                      <th className="pb-3 font-medium text-right">Tokens</th>
                      <th className="pb-3 font-medium text-right">Custo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byUser.map((u, i) => (
                      <tr
                        key={u.userId}
                        className="border-b border-white/3 hover:bg-white/3 transition-colors"
                      >
                        <td className="py-3 text-slate-500 text-sm">{i + 1}</td>
                        <td className="py-3 text-slate-200">{u.userName}</td>
                        <td className="py-3 text-slate-300 text-right">{u.requests}</td>
                        <td className="py-3 text-slate-300 text-right">
                          {formatTokens(u.tokens)}
                        </td>
                        <td className="py-3 text-emerald-400 text-right font-medium">
                          {formatCost(u.cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Model Info */}
          <div className="text-center text-sm text-slate-500">
            Modelo: gpt-4.1-mini &middot; Input: $0.40/1M tokens &middot; Output:
            $1.60/1M tokens
          </div>
        </motion.div>
      )}
    </div>
  )
}
