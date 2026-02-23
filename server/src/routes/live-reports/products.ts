import { Router, Request, Response } from 'express'
import { Prisma } from '../../generated/prisma/client.js'
import prisma from '../../utils/prisma.js'
import OpenAI from 'openai'
import { parsePaginationParams, buildPaginatedResponse } from '../../utils/pagination.js'
import { getConfig } from '../../utils/config.js'
import { trackTokenUsage } from '../../utils/tokenTracker.js'
import { getDateRange, buildReportWhere } from '../../utils/reportHelpers.js'
import '../../types/index.js'

const router = Router()

// GET /products - Aggregated product list with smart dedup
router.get('/products', async (req: Request, res: Response): Promise<void> => {
  try {
    const params = parsePaginationParams(req.query as Record<string, unknown>)
    const { page, limit } = params
    const { start, end } = getDateRange(req.query as Record<string, string>)

    const store = req.query.store as string | undefined

    const reportWhere = buildReportWhere(req.user.id, start, end, store)

    // Get all products from reports in range
    const allProducts = await prisma.liveProduct.findMany({
      where: {
        liveReport: reportWhere,
      },
      orderBy: { revenue: 'desc' },
    })

    // Smart product dedup: shopeeItemId > prefix matching > Dice similarity
    const normalizeName = (name: string) =>
      name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')

    // Dice coefficient (bigram similarity) - 0 to 1
    const diceSimilarity = (a: string, b: string): number => {
      if (a === b) return 1
      if (a.length < 2 || b.length < 2) return 0
      const bigramsA = new Map<string, number>()
      for (let i = 0; i < a.length - 1; i++) {
        const bg = a.substring(i, i + 2)
        bigramsA.set(bg, (bigramsA.get(bg) || 0) + 1)
      }
      let matches = 0
      for (let i = 0; i < b.length - 1; i++) {
        const bg = b.substring(i, i + 2)
        const count = bigramsA.get(bg)
        if (count && count > 0) { matches++; bigramsA.set(bg, count - 1) }
      }
      return (2 * matches) / ((a.length - 1) + (b.length - 1))
    }

    type AggProduct = {
      name: string; norm: string; shopeeItemId: string | null
      productClicks: number; addToCart: number; orders: number
      itemsSold: number; revenue: number; appearances: number
    }

    const groups: AggProduct[] = []

    for (const p of allProducts) {
      // Use canonicalName for grouping when available
      const displayName = p.canonicalName || p.name
      const norm = normalizeName(displayName)
      let matched = false

      // 1. Try matching by shopeeItemId first
      if (p.shopeeItemId) {
        const byId = groups.find(g => g.shopeeItemId === p.shopeeItemId)
        if (byId) {
          byId.productClicks += p.productClicks; byId.addToCart += p.addToCart
          byId.orders += p.orders; byId.itemsSold += p.itemsSold
          byId.revenue += p.revenue; byId.appearances++
          if (norm.length < byId.norm.length) { byId.name = displayName; byId.norm = norm }
          matched = true
        }
      }

      // 2. Try prefix matching + Dice similarity
      if (!matched) {
        for (const g of groups) {
          const shorter = norm.length <= g.norm.length ? norm : g.norm
          const longer = norm.length > g.norm.length ? norm : g.norm
          const isPrefix = shorter.length >= 20 && longer.startsWith(shorter)
          const isSimilar = diceSimilarity(norm, g.norm) > 0.90

          if (isPrefix || isSimilar) {
            g.productClicks += p.productClicks; g.addToCart += p.addToCart
            g.orders += p.orders; g.itemsSold += p.itemsSold
            g.revenue += p.revenue; g.appearances++
            // Keep shorter name (more readable)
            if (norm.length < g.norm.length) { g.name = displayName; g.norm = norm }
            if (p.shopeeItemId && !g.shopeeItemId) g.shopeeItemId = p.shopeeItemId
            matched = true
            break
          }
        }
      }

      if (!matched) {
        groups.push({
          name: displayName, norm, shopeeItemId: p.shopeeItemId,
          productClicks: p.productClicks, addToCart: p.addToCart,
          orders: p.orders, itemsSold: p.itemsSold,
          revenue: p.revenue, appearances: 1,
        })
      }
    }

    let aggregated = groups.map(({ norm, ...rest }) => rest)

    // Search filter
    const search = (req.query.search as string || '').trim().toLowerCase()
    if (search) {
      aggregated = aggregated.filter(p => p.name.toLowerCase().includes(search))
    }

    // Dynamic sorting
    const sortBy = req.query.sortBy as string || 'revenue'
    const sortDir = req.query.sortDir as string || 'desc'
    const validSortFields = ['name', 'productClicks', 'addToCart', 'orders', 'itemsSold', 'revenue', 'appearances']
    if (validSortFields.includes(sortBy)) {
      aggregated.sort((a: any, b: any) => {
        const av = a[sortBy], bv = b[sortBy]
        if (sortBy === 'name') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
        return sortDir === 'asc' ? av - bv : bv - av
      })
    }

    const total = aggregated.length
    const paginated = aggregated.slice((page - 1) * limit, page * limit)

    res.json(buildPaginatedResponse(paginated, total, params))
  } catch (error) {
    console.error('Get report products error:', error)
    res.status(500).json({ message: 'Erro ao buscar produtos' })
  }
})

// GET /products/top - Top products cross-live
router.get('/products/top', async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end } = getDateRange(req.query as Record<string, string>)
    const store = (req.query as any).store as string | undefined
    const where = buildReportWhere(req.user.id, start, end, store)

    const allProducts = await prisma.liveProduct.findMany({
      where: { liveReport: where },
      orderBy: { revenue: 'desc' },
    })

    // Same dedup logic as /products but simplified (no pagination)
    // Use canonicalName || name as key, aggregate clicks/addToCart/orders/itemsSold/revenue/appearances
    const productMap = new Map<string, { name: string; clicks: number; addToCart: number; orders: number; itemsSold: number; revenue: number; appearances: number }>()
    for (const p of allProducts) {
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

    const products = Array.from(productMap.values())
    const topByRevenue = [...products].sort((a, b) => b.revenue - a.revenue).slice(0, 10)
    const topByOrders = [...products].sort((a, b) => b.orders - a.orders).slice(0, 10)

    res.json({ topByRevenue, topByOrders })
  } catch (error) {
    console.error('Get top products error:', error)
    res.status(500).json({ message: 'Erro ao buscar top produtos' })
  }
})

// POST /products/ai-dedup - AI-powered product deduplication
// Fetches ALL products from DB, groups with AI, saves canonicalName permanently
router.post('/products/ai-dedup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { period, startDate, endDate, store } = req.body
    const { start, end } = getDateRange({ period, startDate, endDate } as Record<string, string>)

    const reportWhere = buildReportWhere(req.user.id, start, end, store)

    // Fetch ALL products from matching reports
    const allProducts = await prisma.liveProduct.findMany({
      where: { liveReport: reportWhere },
      select: { id: true, name: true, price: true, shopeeItemId: true, canonicalName: true },
    })

    if (allProducts.length === 0) {
      res.status(400).json({ message: 'Nenhum produto encontrado no periodo' })
      return
    }

    // Deduplicate by name to get unique product entries for AI
    const uniqueMap = new Map<string, { name: string; price: number; shopeeItemId: string | null; ids: string[] }>()
    for (const p of allProducts) {
      const key = p.name
      const existing = uniqueMap.get(key)
      if (existing) {
        existing.ids.push(p.id)
      } else {
        uniqueMap.set(key, { name: p.name, price: p.price, shopeeItemId: p.shopeeItemId, ids: [p.id] })
      }
    }
    const uniqueProducts = Array.from(uniqueMap.values())
    console.log(`[AI Dedup] ${allProducts.length} total records → ${uniqueProducts.length} unique names`)

    if (uniqueProducts.length <= 1) {
      res.json({ success: true, totalOriginal: uniqueProducts.length, totalGroups: uniqueProducts.length, message: 'Apenas 1 produto, nada para agrupar' })
      return
    }

    const apiKey = getConfig('OPENAI_API_KEY')
    if (!apiKey || apiKey === 'your-openai-api-key-here') {
      res.status(400).json({ message: 'OPENAI_API_KEY nao configurada' })
      return
    }

    const openai = new OpenAI({ apiKey, timeout: 30_000, maxRetries: 1 })

    // Build product list for AI with name, price and shopeeItemId for context
    const nameList = uniqueProducts.map((p, i) => {
      const parts = [`${i}: ${p.name}`]
      if (p.price) parts.push(`R$${p.price}`)
      if (p.shopeeItemId) parts.push(`ID:${p.shopeeItemId}`)
      return parts.join(' | ')
    }).join('\n')

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em produtos de e-commerce. Agrupe APENAS produtos que são EXATAMENTE o mesmo item (mesmo modelo, mesma marca) - apenas variações de nome/typos.

REGRAS RIGOROSAS:
- Mesmo shopeeItemId = MESMO produto (agrupar)
- ShopeeItemIds DIFERENTES = produtos DIFERENTES (NUNCA agrupar)
- Preços muito diferentes (>30% diferença) = produtos DIFERENTES (NUNCA agrupar)
- Marcas diferentes = produtos DIFERENTES (ex: "Philips 1300W" ≠ "1200mAh 10W")
- Modelos/especificações diferentes = produtos DIFERENTES (ex: "10W" ≠ "1300W", "1.83 polegadas" ≠ "2.0 polegadas")
- Na dúvida, NÃO agrupe. É melhor ter duplicatas do que agrupar produtos errados.

EXEMPLOS:
- "Luminária Repolho Silicone Fofo Luz LED USB Recarrável" e "Luminária Repolho Silicone LED USB" → MESMO produto (nome curto vs longo)
- "Caixa Som Bluetooth 1200mAh 10W" e "Caixa Som Bluetooth Philips 1300W" → DIFERENTES (marca e potência diferentes)
- "Smartwatch Positivo Essential 1.83" e "Smartwatch Positivo Essential 1.83 IP68" → MESMO (detalhes extras)

Retorne APENAS JSON: {"groups": [[0,3,7], [1,5], [2]]}
Cada array = índices do MESMO produto. Produtos únicos ficam sozinhos: [2].`,
        },
        {
          role: 'user',
          content: `Agrupe os produtos iguais (na dúvida, NÃO agrupe):\n${nameList}`,
        },
      ],
      max_tokens: 2000,
      temperature: 0.1,
    })

    trackTokenUsage(req.user.id, 'ai-dedup', completion.usage)

    const text = completion.choices[0].message.content || '{}'
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    let groups: number[][] = []
    try {
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text)
      groups = parsed.groups || []
    } catch {
      console.error('AI dedup: failed to parse response:', text)
      res.status(500).json({ message: 'Erro ao processar resposta da IA' })
      return
    }

    // Save canonicalName to database for each group + build details for frontend
    let updatedCount = 0
    const mergedGroups: { canonicalName: string; mergedNames: string[]; count: number }[] = []

    for (const group of groups) {
      const items = group.map(i => uniqueProducts[i]).filter(Boolean)
      if (items.length <= 1) continue // Single product, no merging needed

      // Use shortest name as canonical
      const canonical = items.reduce((a, b) => a.name.length <= b.name.length ? a : b)
      const allIds = items.flatMap(item => item.ids)

      await prisma.liveProduct.updateMany({
        where: { id: { in: allIds } },
        data: { canonicalName: canonical.name },
      })
      updatedCount += allIds.length
      mergedGroups.push({
        canonicalName: canonical.name,
        mergedNames: items.map(item => item.name),
        count: items.length,
      })
    }

    console.log(`[AI Dedup] ${groups.length} groups, ${mergedGroups.length} merged, ${updatedCount} records updated`)

    res.json({
      success: true,
      totalOriginal: uniqueProducts.length,
      totalGroups: groups.length,
      updatedRecords: updatedCount,
      mergedGroups,
    })
  } catch (error) {
    console.error('AI dedup error:', error)
    res.status(500).json({ message: 'Erro ao agrupar produtos com IA' })
  }
})

// POST /products/undo-dedup - Undo AI deduplication (clear canonicalName)
router.post('/products/undo-dedup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { period, startDate, endDate, store } = req.body
    const { start, end } = getDateRange({ period, startDate, endDate } as Record<string, string>)

    const reportWhere = buildReportWhere(req.user.id, start, end, store)

    // Get all product IDs matching the filters that have a canonicalName
    const products = await prisma.liveProduct.findMany({
      where: { liveReport: reportWhere, canonicalName: { not: null } },
      select: { id: true },
    })

    if (products.length === 0) {
      res.json({ success: true, updatedRecords: 0 })
      return
    }

    const result = await prisma.liveProduct.updateMany({
      where: { id: { in: products.map(p => p.id) } },
      data: { canonicalName: null },
    })

    console.log(`[AI Dedup] Undo: cleared canonicalName on ${result.count} records`)
    res.json({ success: true, updatedRecords: result.count })
  } catch (error) {
    console.error('Undo dedup error:', error)
    res.status(500).json({ message: 'Erro ao desfazer agrupamento' })
  }
})

export default router
