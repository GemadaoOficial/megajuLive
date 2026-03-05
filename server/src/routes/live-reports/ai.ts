import { Router, Request, Response } from 'express'
import prisma from '../../utils/prisma.js'
import OpenAI from 'openai'
import { getConfig } from '../../utils/config.js'
import { trackTokenUsage } from '../../utils/tokenTracker.js'
import { aiLimiter } from '../../utils/rateLimiters.js'
import { getDateRange, buildReportWhere } from '../../utils/reportHelpers.js'
import '../../types/index.js'

const router = Router()

// GET /ai-insights/goals-text - Load saved monthly goals text
router.get('/ai-insights/goals-text', async (req: Request, res: Response): Promise<void> => {
  try {
    const store = (req.query.store as string) || null

    const saved = await prisma.aIInsight.findFirst({
      where: {
        userId: req.user.id,
        period: 'goals-text',
        store,
      },
      orderBy: { updatedAt: 'desc' },
    })

    res.json({
      goalsText: saved ? (saved.insightsContent as any)?.goalsText || '' : '',
    })
  } catch (error) {
    console.error('Get goals text error:', error)
    res.status(500).json({ message: 'Erro ao buscar metas' })
  }
})

// PUT /ai-insights/goals-text - Save monthly goals text
router.put('/ai-insights/goals-text', async (req: Request, res: Response): Promise<void> => {
  try {
    const { goalsText, store } = req.body
    const storeVal = store || null

    const existing = await prisma.aIInsight.findFirst({
      where: { userId: req.user.id, period: 'goals-text', store: storeVal },
    })

    const saveData = {
      insightsContent: { goalsText: goalsText || '' },
      meta: {},
      livesAnalyzed: 0,
      tokensUsed: 0,
    }

    if (existing) {
      await prisma.aIInsight.update({ where: { id: existing.id }, data: saveData })
    } else {
      await prisma.aIInsight.create({
        data: { ...saveData, userId: req.user.id, period: 'goals-text', store: storeVal },
      })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Save goals text error:', error)
    res.status(500).json({ message: 'Erro ao salvar metas' })
  }
})

// GET /ai-insights - Load saved insights from cache
router.get('/ai-insights', async (req: Request, res: Response): Promise<void> => {
  try {
    const { period, store } = req.query as Record<string, string>

    const saved = await prisma.aIInsight.findFirst({
      where: {
        userId: req.user.id,
        period: period || '30d',
        store: store || null,
      },
      orderBy: { updatedAt: 'desc' },
    })

    if (!saved) {
      res.json({ found: false })
      return
    }

    res.json({
      found: true,
      insights: saved.insightsContent,
      meta: saved.meta,
      generatedAt: saved.updatedAt,
    })
  } catch (error) {
    console.error('Get saved insights error:', error)
    res.status(500).json({ message: 'Erro ao buscar insights salvos' })
  }
})

// POST /ai-insights - AI-powered analytics insights
router.post('/ai-insights', aiLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { period, startDate, endDate, store, monthlyGoals } = req.body
    // Sanitize customPrompt: limit length and strip control characters
    const customPrompt = req.body.customPrompt
      ? String(req.body.customPrompt).slice(0, 500).replace(/[\x00-\x1f]/g, '')
      : ''
    const { start, end } = getDateRange({ period, startDate, endDate } as Record<string, string>)

    const reportWhere = buildReportWhere(req.user.id, start, end, store)

    // Fetch all reports with products
    const reports = await prisma.liveReport.findMany({
      where: reportWhere,
      include: { liveProducts: true },
      orderBy: { reportDate: 'asc' },
    })

    if (reports.length < 2) {
      res.status(400).json({ message: 'Precisa de pelo menos 2 lives para gerar insights' })
      return
    }

    const apiKey = getConfig('OPENAI_API_KEY')
    if (!apiKey || apiKey === 'your-openai-api-key-here') {
      res.status(400).json({ message: 'OPENAI_API_KEY nao configurada' })
      return
    }

    // ---- PRE-CALCULATE METRICS ----
    const totalRevenue = reports.reduce((s, r) => s + r.totalRevenue, 0)
    const totalOrders = reports.reduce((s, r) => s + r.totalOrders, 0)
    const totalViewers = reports.reduce((s, r) => s + r.totalViewers, 0)
    const livesCount = reports.length

    // Aggregate products across all reports
    const productMap = new Map<string, {
      name: string; clicks: number; addToCart: number; orders: number
      itemsSold: number; revenue: number; appearances: number
    }>()
    for (const report of reports) {
      for (const p of report.liveProducts) {
        const key = (p.canonicalName || p.name).toLowerCase().trim()
        const existing = productMap.get(key)
        if (existing) {
          existing.clicks += p.productClicks
          existing.addToCart += p.addToCart
          existing.orders += p.orders
          existing.itemsSold += p.itemsSold
          existing.revenue += p.revenue
          existing.appearances++
        } else {
          productMap.set(key, {
            name: p.canonicalName || p.name,
            clicks: p.productClicks,
            addToCart: p.addToCart,
            orders: p.orders,
            itemsSold: p.itemsSold,
            revenue: p.revenue,
            appearances: 1,
          })
        }
      }
    }
    const products = Array.from(productMap.values())

    // Top 5 by revenue
    const topByRevenue = [...products].sort((a, b) => b.revenue - a.revenue).slice(0, 5)
    // Top 5 by orders
    const topByOrders = [...products].sort((a, b) => b.orders - a.orders).slice(0, 5)
    // Bottom: high clicks, low orders (clicked but not bought)
    const clickedNotBought = products
      .filter(p => p.clicks >= 5 && p.orders === 0)
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)
    // Many appearances, zero sales
    const neverSold = products
      .filter(p => p.appearances >= 2 && p.orders === 0)
      .sort((a, b) => b.appearances - a.appearances)
      .slice(0, 5)

    // Coins/Marketing analysis
    const livesWithCoins = reports.filter(r => r.coinsUsed > 0)
    const livesWithoutCoins = reports.filter(r => r.coinsUsed === 0)
    const avgRevenueWithCoins = livesWithCoins.length > 0
      ? livesWithCoins.reduce((s, r) => s + r.totalRevenue, 0) / livesWithCoins.length : 0
    const avgRevenueWithoutCoins = livesWithoutCoins.length > 0
      ? livesWithoutCoins.reduce((s, r) => s + r.totalRevenue, 0) / livesWithoutCoins.length : 0
    const totalCoinsCost = reports.reduce((s, r) => s + r.coinsCost, 0)
    const totalCoinsUsed = reports.reduce((s, r) => s + r.coinsUsed, 0)
    const coinsRevenue = livesWithCoins.reduce((s, r) => s + r.totalRevenue, 0)
    const coinsROI = totalCoinsCost > 0 ? ((coinsRevenue - totalCoinsCost) / totalCoinsCost * 100) : 0

    // Find best coins range by grouping lives into coin ranges
    const coinRanges = [
      { label: '0', min: 0, max: 0, lives: [] as typeof reports },
      { label: '1-5.000', min: 1, max: 5000, lives: [] as typeof reports },
      { label: '5.001-15.000', min: 5001, max: 15000, lives: [] as typeof reports },
      { label: '15.001-30.000', min: 15001, max: 30000, lives: [] as typeof reports },
      { label: '30.001+', min: 30001, max: Infinity, lives: [] as typeof reports },
    ]
    for (const r of reports) {
      const range = coinRanges.find(cr => r.coinsUsed >= cr.min && r.coinsUsed <= cr.max)
      if (range) range.lives.push(r)
    }
    const coinRangeStats = coinRanges
      .filter(cr => cr.lives.length > 0)
      .map(cr => ({
        range: cr.label,
        lives: cr.lives.length,
        avgRevenue: cr.lives.reduce((s, r) => s + r.totalRevenue, 0) / cr.lives.length,
      }))

    // Day of week analysis
    const dayNames = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado']
    const dayStats = dayNames.map((name, i) => {
      const dayLives = reports.filter(r => new Date(r.reportDate).getDay() === i)
      return {
        dia: name,
        lives: dayLives.length,
        avgRevenue: dayLives.length > 0 ? dayLives.reduce((s, r) => s + r.totalRevenue, 0) / dayLives.length : 0,
        avgViewers: dayLives.length > 0 ? dayLives.reduce((s, r) => s + r.totalViewers, 0) / dayLives.length : 0,
      }
    }).filter(d => d.lives > 0)

    // Best/worst lives
    const sortedByRevenue = [...reports].sort((a, b) => b.totalRevenue - a.totalRevenue)
    const top3Lives = sortedByRevenue.slice(0, 3).map(r => ({
      titulo: r.liveTitle || 'Sem titulo',
      data: new Date(r.reportDate).toLocaleDateString('pt-BR'),
      revenue: r.totalRevenue,
      viewers: r.totalViewers,
      orders: r.totalOrders,
      coins: r.coinsUsed,
      duracao: r.liveDuration,
    }))
    const worst3Lives = sortedByRevenue.slice(-3).reverse().map(r => ({
      titulo: r.liveTitle || 'Sem titulo',
      data: new Date(r.reportDate).toLocaleDateString('pt-BR'),
      revenue: r.totalRevenue,
      viewers: r.totalViewers,
      orders: r.totalOrders,
      coins: r.coinsUsed,
      duracao: r.liveDuration,
    }))

    // Duration vs revenue correlation
    const avgDuration = reports.reduce((s, r) => s + r.liveDuration, 0) / livesCount
    const shortLives = reports.filter(r => r.liveDuration < avgDuration)
    const longLives = reports.filter(r => r.liveDuration >= avgDuration)
    const avgRevenueShort = shortLives.length > 0 ? shortLives.reduce((s, r) => s + r.totalRevenue, 0) / shortLives.length : 0
    const avgRevenueLong = longLives.length > 0 ? longLives.reduce((s, r) => s + r.totalRevenue, 0) / longLives.length : 0

    // Engagement averages
    const avgLikes = reports.reduce((s, r) => s + r.totalLikes, 0) / livesCount
    const avgComments = reports.reduce((s, r) => s + r.totalComments, 0) / livesCount
    const avgShares = reports.reduce((s, r) => s + r.totalShares, 0) / livesCount
    const avgNewFollowers = reports.reduce((s, r) => s + r.newFollowers, 0) / livesCount

    // Audience quality
    const avgEngagedRate = totalViewers > 0
      ? (reports.reduce((s, r) => s + r.engagedViewers, 0) / totalViewers * 100) : 0
    const maxPeakViewers = Math.max(...reports.map(r => r.peakViewers))
    const avgWatchTimeSecs = reports.reduce((s, r) => s + r.avgWatchTime, 0) / livesCount
    const avgCommentRate = reports.reduce((s, r) => s + r.commentRate, 0) / livesCount

    // Ticket & pricing
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const avgRevenuePerBuyer = reports.reduce((s, r) => s + r.totalBuyers, 0) > 0
      ? totalRevenue / reports.reduce((s, r) => s + r.totalBuyers, 0) : 0

    // Cart abandonment: high addToCart but low orders
    const highCartLowOrders = products
      .filter(p => p.addToCart >= 3 && (p.orders === 0 || (p.addToCart / Math.max(p.orders, 1)) > 3))
      .sort((a, b) => b.addToCart - a.addToCart)
      .slice(0, 5)
    const avgCartToOrderRate = products.filter(p => p.addToCart > 0).length > 0
      ? products.filter(p => p.addToCart > 0).reduce((s, p) => s + (p.orders / p.addToCart * 100), 0) / products.filter(p => p.addToCart > 0).length
      : 0

    // Auctions & redemptions
    const totalAuctionRounds = reports.reduce((s, r) => s + r.auctionRounds, 0)
    const totalCoinRedemptions = reports.reduce((s, r) => s + r.coinRedemptions, 0)

    // Funnel
    const totalImpressions = reports.reduce((s, r) => s + r.productImpressions, 0)
    const totalClicks = reports.reduce((s, r) => s + r.productClicks, 0)
    const impressionToClickRate = totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0
    const clickToOrderRate = totalClicks > 0 ? (totalOrders / totalClicks * 100) : 0
    const overallConversion = totalImpressions > 0 ? (totalOrders / totalImpressions * 100) : 0

    // Traffic sources aggregated
    const sourceMap = new Map<string, { pageViews: number; count: number }>()
    for (const r of reports) {
      const sources = Array.isArray(r.trafficSources) ? (r.trafficSources as any[]) : []
      for (const s of sources) {
        const key = (s.source || '').trim()
        if (!key) continue
        const ex = sourceMap.get(key) || { pageViews: 0, count: 0 }
        ex.pageViews += s.pageViews || 0
        ex.count++
        sourceMap.set(key, ex)
      }
    }
    const topSources = Array.from(sourceMap.entries())
      .map(([source, data]) => ({ source, pageViews: data.pageViews }))
      .sort((a, b) => b.pageViews - a.pageViews)
      .slice(0, 5)

    // ---- BUILD PROMPT ----
    const formatBRL = (v: number) => `R$${v.toFixed(2).replace('.', ',')}`
    const formatMin = (secs: number) => `${Math.round(secs / 60)} min`

    // Per-live detailed breakdown (max 20 lives to keep prompt manageable)
    const livesForPrompt = reports.slice(0, 20)
    const perLiveBreakdown = livesForPrompt.map((r, i) => {
      const conv = r.totalViewers > 0 ? (r.totalOrders / r.totalViewers * 100).toFixed(1) : '0'
      const engRate = r.totalViewers > 0 ? (r.engagedViewers / r.totalViewers * 100).toFixed(1) : '0'
      return `${i + 1}. "${r.liveTitle || 'Sem titulo'}" (${new Date(r.reportDate).toLocaleDateString('pt-BR')}) - ${formatBRL(r.totalRevenue)}, ${r.totalOrders} pedidos, ${r.totalViewers} viewers, ${r.coinsUsed.toLocaleString('pt-BR')} moedas (${formatBRL(r.coinsCost)}), ${formatMin(r.liveDuration)}\n   Conversao: ${conv}%, Engajamento: ${engRate}%, Cliques: ${r.productClicks}, AddCart: ${r.addToCart}, Likes: ${r.totalLikes}, Comentarios: ${r.totalComments}, Seguidores: ${r.newFollowers}`
    }).join('\n')

    // Coin investment summary
    const avgCoinsCostPerLive = livesWithCoins.length > 0 ? totalCoinsCost / livesWithCoins.length : 0

    const prompt = `Voce e um consultor senior de e-commerce BRUTALMENTE HONESTO. Sua analise deve ser SINCERA, DIRETA e BASEADA EXCLUSIVAMENTE nos numeros reais fornecidos.

REGRAS OBRIGATORIAS:
1. NUNCA amenize resultados ruins. Se um produto e ruim, diga que e ruim e EXPLIQUE POR QUE com numeros concretos.
2. SEMPRE justifique opinoes com dados: "O produto X teve ${'{'}clicks{'}'} cliques mas 0 vendas, taxa de conversao de 0% - isso indica problema de preco ou descricao."
3. Se um produto nao vende, AINDA ASSIM de solucoes praticas (pode ter estoque parado que precisa ser vendido): desconto agressivo, combo com produto estrela, flash sale, posicionar diferente na live, etc.
4. Compare produtos entre si: "O produto A vende 5x mais que B com metade dos cliques, mostrando que B tem problema de conversao."
5. Use percentuais, comparacoes e tendencias. Nao fale "bom" ou "ruim" sem numeros.
6. Trate o lojista como parceiro de negocios que precisa da VERDADE para tomar decisoes, nao elogios vazios.
7. Na nota geral, seja justo: abaixo de 5 se ta ruim, 5-7 mediocre, 7-8 bom, acima de 8 so se realmente excelente.

Analise os dados de performance da Shopee Live abaixo. Analise CADA LIVE e CADA PRODUTO individualmente.

RESUMO DO PERIODO (${store || 'Todas as lojas'}):
- ${livesCount} lives realizadas
- Revenue total: ${formatBRL(totalRevenue)} (media ${formatBRL(totalRevenue / livesCount)}/live)
- Total de pedidos: ${totalOrders}
- Total de viewers: ${totalViewers.toLocaleString('pt-BR')}

DETALHAMENTO POR LIVE (analise cada uma individualmente):
${perLiveBreakdown}

INVESTIMENTO EM MOEDAS (DINHEIRO REAL):
- Total investido em moedas: ${formatBRL(totalCoinsCost)} (comprou ${totalCoinsUsed.toLocaleString('pt-BR')} moedas)
- Custo medio por live com moedas: ${formatBRL(avgCoinsCostPerLive)}
- Receita total das lives com moedas: ${formatBRL(coinsRevenue)}
- ROI do investimento: ${coinsROI.toFixed(0)}% (cada R$1 investido retornou R$${totalCoinsCost > 0 ? (coinsRevenue / totalCoinsCost).toFixed(2) : '0'})
- Receita media COM moedas: ${formatBRL(avgRevenueWithCoins)}/live
- Receita media SEM moedas: ${formatBRL(avgRevenueWithoutCoins)}/live
- Diferenca: ${avgRevenueWithCoins > avgRevenueWithoutCoins ? '+' : ''}${formatBRL(avgRevenueWithCoins - avgRevenueWithoutCoins)}/live com moedas

TICKET MEDIO E PRECO:
- Ticket medio (avgOrderValue): ${formatBRL(avgOrderValue)}
- Receita media por comprador: ${formatBRL(avgRevenuePerBuyer)}

TOP 5 PRODUTOS POR REVENUE:
${topByRevenue.map((p, i) => `${i + 1}. ${p.name} - ${formatBRL(p.revenue)}, ${p.orders} pedidos, ${p.clicks} cliques, ${p.addToCart} add-to-cart, ${p.appearances} lives`).join('\n')}

TOP 5 PRODUTOS POR PEDIDOS:
${topByOrders.map((p, i) => `${i + 1}. ${p.name} - ${p.orders} pedidos, ${formatBRL(p.revenue)}, ${p.clicks} cliques`).join('\n')}

PRODUTOS COM CLIQUES MAS SEM VENDAS (interesse sem conversao):
${clickedNotBought.length > 0 ? clickedNotBought.map(p => `- ${p.name}: ${p.clicks} cliques, 0 pedidos, ${p.addToCart} add-to-cart, ${p.appearances} lives`).join('\n') : 'Nenhum'}

PRODUTOS PRESENTES EM VARIAS LIVES SEM VENDER:
${neverSold.length > 0 ? neverSold.map(p => `- ${p.name}: ${p.appearances} lives, 0 pedidos, ${p.clicks} cliques`).join('\n') : 'Nenhum'}

CARRINHO (ADD-TO-CART):
- Produtos com alto add-to-cart mas poucas vendas:
${highCartLowOrders.length > 0 ? highCartLowOrders.map(p => `- ${p.name}: ${p.addToCart} add-to-cart, ${p.orders} pedidos (taxa: ${p.addToCart > 0 ? (p.orders / p.addToCart * 100).toFixed(0) : 0}%)`).join('\n') : 'Nenhum'}
- Taxa media add-to-cart → pedido: ${avgCartToOrderRate.toFixed(1)}%

QUALIDADE DO PUBLICO:
- Taxa de engajamento media: ${avgEngagedRate.toFixed(1)}% (engagedViewers/totalViewers)
- Pico maximo de viewers: ${maxPeakViewers.toLocaleString('pt-BR')}
- Tempo medio de visualizacao: ${formatMin(avgWatchTimeSecs)}
- Compartilhamentos medios: ${Math.round(avgShares)}/live
- Taxa de comentarios media: ${avgCommentRate.toFixed(1)}%

MOEDAS/MARKETING:
- Faixas de moedas:
${coinRangeStats.map(cr => `  ${cr.range} moedas: ${cr.lives} lives, media ${formatBRL(cr.avgRevenue)}/live`).join('\n')}
- Rodadas de moedas: ${totalAuctionRounds}
- Resgates de moedas (usuarios unicos): ${totalCoinRedemptions}

DIAS DA SEMANA:
${dayStats.map(d => `- ${d.dia}: ${d.lives} lives, media ${formatBRL(d.avgRevenue)}/live, media ${Math.round(d.avgViewers)} viewers`).join('\n')}

DURACAO:
- Media de duracao: ${Math.round(avgDuration / 60)} minutos
- Lives curtas (<media): media ${formatBRL(avgRevenueShort)}/live
- Lives longas (>=media): media ${formatBRL(avgRevenueLong)}/live

ENGAJAMENTO (medias por live):
- Curtidas: ${Math.round(avgLikes)}
- Comentarios: ${Math.round(avgComments)}
- Compartilhamentos: ${Math.round(avgShares)}
- Novos seguidores: ${Math.round(avgNewFollowers)}

FUNIL:
- Impressoes → Cliques: ${impressionToClickRate.toFixed(1)}%
- Cliques → Pedidos: ${clickToOrderRate.toFixed(1)}%
- Conversao geral (impressoes → pedidos): ${overallConversion.toFixed(2)}%

FONTES DE TRAFEGO:
${topSources.map(s => `- ${s.source}: ${s.pageViews.toLocaleString('pt-BR')} views`).join('\n')}
${monthlyGoals ? `

METAS DO MES (definidas pelo lojista):
${monthlyGoals}

Avalie o progresso em relacao a CADA meta acima. Para cada meta, diga se esta no caminho certo, se vale a pena continuar com a estrategia atual, e de recomendacoes CONCRETAS baseadas nos dados reais. Se a meta for ranquear um produto, avalie a performance dele. Se for aumentar pedidos, analise a tendencia. Se for aumentar vendas, compare com o objetivo.` : ''}
${customPrompt ? `

ANALISE PERSONALIZADA SOLICITADA PELO LOJISTA:
"${customPrompt}"

IMPORTANTE: Alem do relatorio padrao completo (TODAS as secoes obrigatorias), inclua uma secao "analisePersonalizada" com analise DETALHADA e em formato de RELATORIO ANALITICO sobre o que foi pedido acima. Use dados concretos e numeros reais. NUNCA de uma resposta direta curta - sempre elabore como um consultor profissional com insights acionaveis, graficos mentais de tendencias, e recomendacoes especificas. A analise personalizada deve ser BEM DESTACADA e completa.` : ''}

Retorne APENAS um JSON valido (sem markdown, sem \`\`\`) com esta estrutura exata:
{
  "nota": 7.5,
  "analiseDiaria": [
    {"titulo": "...", "data": "DD/MM", "nota": 8, "acertos": ["ponto positivo 1"], "erros": ["problema 1"], "explicacao": "resumo da live"}
  ],
  "investimento": {
    "totalInvestido": "R$...",
    "totalMoedasUsadas": "...",
    "receitaGerada": "R$...",
    "roi": "...%",
    "custoMedio": "R$... por live",
    "analise": "texto explicando se o investimento esta valendo a pena",
    "recomendacao": "sugestao concreta de quanto investir"
  },
  "produtos": {
    "estrelas": [{"nome": "...", "motivo": "...", "acao": "..."}],
    "alerta": [{"nome": "...", "problema": "EXPLIQUE com numeros porque esta ruim (ex: 50 cliques e 0 vendas = conversao 0%)", "acao": "Solucao PRATICA mesmo que tenha estoque: desconto, combo, reposicionar, flash sale etc"}],
    "remover": [{"nome": "...", "motivo": "Por que nao compensa manter. Se houver estoque, sugira como liquidar: desconto agressivo, kit combo, brinde em compras acima de X etc"}]
  },
  "marketing": {
    "resumo": "...",
    "faixaIdealMoedas": "...",
    "roi": "...",
    "dica": "..."
  },
  "lives": {
    "melhor": {"titulo": "...", "motivo": "..."},
    "pior": {"titulo": "...", "motivo": "..."},
    "melhorDia": "...",
    "piorDia": "...",
    "duracaoIdeal": "...",
    "dicas": ["...", "..."]
  },
  "engagement": {
    "resumo": "...",
    "trafegoEficiente": "...",
    "dicas": ["...", "..."]
  },
  "funil": {
    "maiorGargalo": "...",
    "taxaConversao": "...",
    "dica": "..."
  },
  "precificacao": {
    "ticketMedio": "...",
    "analise": "...",
    "dica": "..."
  },
  "audiencia": {
    "qualidade": "...",
    "retencao": "...",
    "dicas": ["...", "..."]
  },
  "carrinho": {
    "abandonoAlto": [{"nome": "...", "addToCart": 0, "orders": 0, "taxa": "..."}],
    "dica": "..."
  },
  "resumoGeral": "Avaliacao SINCERA do periodo: o que ta bom com numeros, o que ta ruim com numeros, e qual o caminho pra melhorar. Sem florear.",
  "proximosPassos": ["...", "...", "..."]${customPrompt ? `,
  "analisePersonalizada": "texto DETALHADO respondendo ao prompt personalizado do lojista em formato de relatorio analitico profissional com insights acionaveis e dados concretos (NUNCA resposta direta simples)"` : ''}${monthlyGoals ? `,
  "avaliacaoMetas": [
    {"meta": "descricao da meta", "status": "no_caminho | atencao | atrasado", "progresso": "descricao do progresso atual com numeros reais", "recomendacao": "o que fazer para atingir ou manter a meta"}
  ]` : ''}
}`

    const openai = new OpenAI({ apiKey, timeout: 180_000, maxRetries: 1 })

    // ---- SSE STREAMING ----
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')
    res.flushHeaders()

    const stream = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: 'Voce e um consultor senior especialista em Shopee Live Brasil com experiencia em e-commerce e growth hacking. Seu papel e analisar dados de performance e fornecer insights ACIONAVEIS e ESPECIFICOS (nunca genericos). Use numeros concretos dos dados fornecidos nas suas recomendacoes. Analise CADA live individualmente, identificando onde o lojista acertou e onde errou - se uma live teve queda, explique por que.\n\nIMPORTANTE sobre MOEDAS SHOPEE: 1 moeda = R$0,01. O lojista COMPRA moedas investindo dinheiro real. Exemplo: investir R$500 = comprar 50.000 moedas para distribuir nas lives do mes. O campo coinsCost ja representa o custo em reais. Ao analisar moedas, sempre calcule o ROI real: (receita gerada - custo moedas) / custo moedas. Se gastou R$200 em moedas e faturou R$3.000, o ROI = 1400%.\n\nDe uma nota geral de 0 a 10 para o desempenho no periodo. E de uma nota de 0 a 10 para CADA live individual.\n\nResponda em portugues brasileiro. Retorne APENAS JSON valido, sem markdown.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 10000,
      temperature: 0.3,
      stream: true,
      stream_options: { include_usage: true },
    })

    let fullText = ''
    let usage: any = null

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content
      if (delta) {
        fullText += delta
        // Send chunk to client
        res.write(`data: ${JSON.stringify({ type: 'chunk', text: delta })}\n\n`)
      }
      // Capture usage from the final chunk
      if (chunk.usage) {
        usage = chunk.usage
      }
    }

    trackTokenUsage(req.user.id, 'ai-insights', usage)

    console.log(`[AI Insights] Stream complete, response length: ${fullText.length}`)
    console.log(`[AI Insights] Tokens: ${usage?.prompt_tokens} in, ${usage?.completion_tokens} out, ${usage?.total_tokens} total`)

    // Parse JSON from streamed text
    let jsonStr = fullText
    jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '')
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
    let insights: any = {}
    try {
      insights = JSON.parse(jsonMatch ? jsonMatch[0] : jsonStr)
    } catch {
      // Try to fix truncated JSON
      if (jsonMatch) {
        let fixedJson = jsonMatch[0]
        const opens = (fixedJson.match(/\{/g) || []).length
        const closes = (fixedJson.match(/\}/g) || []).length
        const openBrackets = (fixedJson.match(/\[/g) || []).length
        const closeBrackets = (fixedJson.match(/\]/g) || []).length
        fixedJson = fixedJson.replace(/,\s*$/, '')
        fixedJson = fixedJson.replace(/,\s*"[^"]*":\s*"?[^"}\]]*$/, '')
        for (let i = 0; i < openBrackets - closeBrackets; i++) fixedJson += ']'
        for (let i = 0; i < opens - closes; i++) fixedJson += '}'
        try {
          insights = JSON.parse(fixedJson)
          console.log('[AI Insights] Successfully recovered truncated JSON')
        } catch {
          console.error('[AI Insights] Failed to recover JSON. First 500 chars:', fullText.slice(0, 500))
          res.write(`data: ${JSON.stringify({ type: 'error', message: 'Resposta da IA foi cortada. Tente novamente.' })}\n\n`)
          res.write('data: [DONE]\n\n')
          res.end()
          return
        }
      } else {
        console.error('[AI Insights] Invalid JSON. First 500 chars:', fullText.slice(0, 500))
        res.write(`data: ${JSON.stringify({ type: 'error', message: 'Resposta da IA invalida. Tente novamente.' })}\n\n`)
        res.write('data: [DONE]\n\n')
        res.end()
        return
      }
    }

    const metaData = {
      livesCount,
      totalRevenue,
      totalProducts: products.length,
      totalCoinsCost,
      coinsROI: Math.round(coinsROI),
      tokensUsed: usage?.total_tokens || 0,
    }

    // Save/replace insights in database
    const storeVal = store || null
    const periodVal = period || '30d'
    const existing = await prisma.aIInsight.findFirst({
      where: { userId: req.user.id, period: periodVal, store: storeVal },
    })

    const saveData = {
      insightsContent: insights,
      meta: metaData,
      livesAnalyzed: livesCount,
      tokensUsed: usage?.total_tokens || 0,
      startDate: start || null,
      endDate: end || null,
    }

    const savedInsight = existing
      ? await prisma.aIInsight.update({ where: { id: existing.id }, data: saveData })
      : await prisma.aIInsight.create({
        data: { ...saveData, userId: req.user.id, period: periodVal, store: storeVal },
      })

    // Send final structured data
    res.write(`data: ${JSON.stringify({
      type: 'done',
      insights,
      meta: metaData,
      generatedAt: savedInsight.updatedAt,
    })}\n\n`)
    res.write('data: [DONE]\n\n')
    res.end()

  } catch (error: any) {
    const errMsg = error?.message || String(error)
    const errStatus = error?.status || error?.statusCode
    console.error(`[AI Insights] Error (status=${errStatus}):`, errMsg)

    // Check if headers already sent (SSE started)
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: errMsg.slice(0, 200) })}\n\n`)
      res.write('data: [DONE]\n\n')
      res.end()
    } else {
      if (errStatus === 429) {
        res.status(429).json({ message: 'Limite de requisicoes da IA atingido. Aguarde 1 minuto e tente novamente.' })
      } else if (errMsg.includes('maximum context length')) {
        res.status(400).json({ message: 'Prompt muito grande. Selecione um periodo menor ou uma loja especifica.' })
      } else if (errMsg.includes('timeout') || errMsg.includes('timed out') || error?.code === 'ETIMEDOUT') {
        res.status(504).json({ message: 'A IA demorou demais para responder. Tente novamente.' })
      } else {
        res.status(errStatus || 500).json({ message: `Erro da IA: ${errMsg.slice(0, 200)}` })
      }
    }
  }
})

export default router
