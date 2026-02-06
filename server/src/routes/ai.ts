import { Router, Request, Response } from 'express'
import OpenAI from 'openai'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { authenticate } from '../middlewares/auth.js'
import '../types/index.js'

const router = Router()

// Test endpoint (no auth required) to diagnose OpenAI connection
router.get('/test', async (req: Request, res: Response): Promise<void> => {
  try {
    const key = process.env.OPENAI_API_KEY
    if (!key || key === 'your-openai-api-key-here') {
      res.json({ status: 'no_key', message: 'OPENAI_API_KEY nao configurada' })
      return
    }

    const openai = new OpenAI({ apiKey: key })
    const completion = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [{ role: 'user', content: 'Diga apenas: OK' }],
    })

    res.json({
      status: 'ok',
      model: completion.model,
      response: completion.choices[0].message.content,
      keyConfigured: true,
    })
  } catch (error: any) {
    res.json({
      status: 'error',
      message: error?.message || 'Erro desconhecido',
      code: error?.code,
      type: error?.type,
      statusCode: error?.status,
    })
  }
})

router.use(authenticate)

// Multer config for screenshot uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'screenshots')
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Apenas imagens são aceitas'))
    }
  },
})

// Suggest live titles using GPT
router.post('/suggest-title', async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, category, niche } = req.body

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      res.json({
        titles: [
          `Super Promocao ${category || 'Especial'}!`,
          `Ofertas Imperdveis - ${niche || 'Produtos Exclusivos'}`,
          `Liquidacao Relampago Ao Vivo`,
          `Descontos Exclusivos Shopee Live`,
          `Mega Sale - Precos Incriveis!`,
        ],
      })
      return
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const userPrompt = prompt
      ? `O usuario quer uma live sobre: "${prompt}". Gere 5 titulos atrativos para essa live na Shopee. Os titulos devem ser curtos (max 60 caracteres), impactantes, usar emojis quando apropriado, e respeitar os termos da Shopee (sem palavras proibidas como "gratis total", "garantido", enganosas). Retorne apenas os titulos, um por linha, sem numeracao.`
      : `Gere 5 titulos atrativos para uma live de vendas na Shopee na categoria "${category || 'Geral'}" e nicho "${niche || 'E-commerce'}". Os titulos devem ser curtos (max 60 caracteres), impactantes e chamar atencao. Retorne apenas os titulos, um por linha, sem numeracao.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content: 'Voce e um especialista em marketing para lives de vendas na Shopee Brasil. Gere titulos atrativos, clicaveis e dentro dos termos de uso da Shopee. Nunca use promessas enganosas. Foque em urgencia, beneficios reais e emocao. Use emojis com moderacao.',
        },
        { role: 'user', content: userPrompt },
      ],
    })

    const titles = completion.choices[0].message.content
      ?.split('\n')
      .map((line) => line.replace(/^\d+[\.\)\-]\s*/, '').trim())
      .filter((line) => line.length > 0)
      .slice(0, 5) || []

    res.json({ titles })
  } catch (error: any) {
    console.error('AI suggest title error:', error?.message || error)
    res.status(500).json({
      error: true,
      message: error?.message || 'Erro desconhecido na IA',
      titles: [
        'Super Promocao Especial!',
        'Ofertas Imperdveis Ao Vivo',
        'Liquidacao Relampago',
        'Descontos Exclusivos Shopee',
        'Mega Sale - Precos Incriveis!',
      ],
    })
  }
})

// Suggest live description using GPT
router.post('/suggest-description', async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, title } = req.body

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      res.json({
        descriptions: [
          'Venha conferir as melhores ofertas ao vivo! Descontos exclusivos, frete gratis e cupons especiais esperando por voce. Nao perca!',
          'Live especial com precos arrasadores! Produtos selecionados com ate 70% de desconto. Corre que e por tempo limitado!',
          'Aproveite ofertas exclusivas da Shopee Live! Interaja, ganhe cupons e garanta os melhores precos. Te espero la!',
        ],
      })
      return
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const userPrompt = prompt
      ? `Crie 3 descricoes para uma live da Shopee sobre: "${prompt}"${title ? `. Titulo da live: "${title}"` : ''}. Cada descricao deve ter NO MAXIMO 250 caracteres, ser persuasiva, usar emojis com moderacao, e respeitar os termos da Shopee (sem promessas enganosas). Retorne cada descricao em uma linha separada, sem numeracao.`
      : `Crie 3 descricoes para uma live de vendas da Shopee${title ? ` com o titulo "${title}"` : ''}. Cada descricao deve ter NO MAXIMO 250 caracteres, ser persuasiva e engajante. Retorne cada descricao em uma linha separada, sem numeracao.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content: 'Voce e um copywriter especialista em Shopee Lives no Brasil. Crie descricoes curtas (max 250 caracteres cada), persuasivas e dentro dos termos da Shopee. Use emojis com moderacao. Foque em criar urgencia e destacar beneficios reais. Nunca use promessas falsas ou enganosas.',
        },
        { role: 'user', content: userPrompt },
      ],
    })

    const descriptions = completion.choices[0].message.content
      ?.split('\n')
      .map((line) => line.replace(/^\d+[\.\)\-]\s*/, '').trim())
      .filter((line) => line.length > 0)
      .map((desc) => desc.slice(0, 250))
      .slice(0, 3) || []

    res.json({ descriptions })
  } catch (error: any) {
    console.error('AI suggest description error:', error?.message || error)
    res.status(500).json({
      error: true,
      message: error?.message || 'Erro desconhecido na IA',
      descriptions: [
        'Venha conferir as melhores ofertas ao vivo! Descontos exclusivos esperando por voce.',
        'Live especial com precos arrasadores! Produtos com ate 70% de desconto.',
        'Ofertas exclusivas da Shopee Live! Interaja, ganhe cupons e garanta os melhores precos.',
      ],
    })
  }
})

// Extract live report data from screenshots using GPT Vision
router.post(
  '/extract-live-report',
  upload.fields([
    { name: 'statsScreenshots', maxCount: 10 },
    { name: 'productScreenshots', maxCount: 10 },
    { name: 'trafficScreenshots', maxCount: 5 },
  ]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined

      if (!files || Object.keys(files).length === 0) {
        res.status(400).json({ message: 'Nenhuma imagem enviada' })
        return
      }

      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
        const mockData = getMockExtractedData()
        cleanupFiles(files)
        res.json(mockData)
        return
      }

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

      const result: any = { stats: {}, products: [], traffic: {} }

      // Collect all images for smart routing
      const allImages = [
        ...(files.statsScreenshots || []),
        ...(files.productScreenshots || []),
        ...(files.trafficScreenshots || []),
      ]

      // Count how many dropzones have images
      const usedDropzones = [
        (files.statsScreenshots?.length || 0) > 0,
        (files.productScreenshots?.length || 0) > 0,
        (files.trafficScreenshots?.length || 0) > 0,
      ].filter(Boolean).length

      // Stats and traffic share overlapping fields, so fallback makes sense for them
      // Products NEVER fallback - only extract from explicit product screenshots to avoid overwriting existing products
      const fallbackToAll = usedDropzones <= 1

      const statsImages = files.statsScreenshots?.length ? files.statsScreenshots : (fallbackToAll ? allImages : [])
      const productImages = files.productScreenshots?.length ? files.productScreenshots : []
      const trafficImages = files.trafficScreenshots?.length ? files.trafficScreenshots : (fallbackToAll ? allImages : [])

      // Run all extractions in PARALLEL for speed (GPT-5-nano is slow)
      const [statsRes, productsRes, trafficRes] = await Promise.allSettled([
        statsImages.length ? extractFromImages(openai, statsImages, STATS_PROMPT) : Promise.resolve({}),
        productImages.length ? extractFromImages(openai, productImages, PRODUCTS_PROMPT) : Promise.resolve({ products: [] }),
        trafficImages.length ? extractFromImages(openai, trafficImages, TRAFFIC_PROMPT) : Promise.resolve({}),
      ])

      result.stats = statsRes.status === 'fulfilled' ? statsRes.value : {}
      result.products = productsRes.status === 'fulfilled' ? (productsRes.value.products || []) : []
      result.traffic = trafficRes.status === 'fulfilled' ? trafficRes.value : {}

      const reportData: any = {
        ...(result.stats.liveTitle ? { liveTitle: result.stats.liveTitle } : {}),
        ...(result.stats.startDate ? { reportDate: result.stats.startDate } : {}),
        ...(result.stats.startTime ? { reportTime: result.stats.startTime } : {}),
        totalRevenue: result.stats.totalRevenue || 0,
        totalOrders: result.stats.totalOrders || 0,
        totalItemsSold: result.stats.totalItemsSold || 0,
        avgOrderValue: result.stats.avgOrderValue || 0,
        avgRevenuePerBuyer: result.stats.avgRevenuePerBuyer || 0,
        totalViewers: result.stats.totalViewers || 0,
        engagedViewers: result.stats.engagedViewers || 0,
        totalViews: result.stats.totalViews || 0,
        peakViewers: result.stats.peakViewers || 0,
        avgWatchTime: result.stats.avgWatchTime || 0,
        liveDuration: result.stats.liveDuration || 0,
        clickRate: result.stats.clickRate || result.traffic.clickRate || 0,
        totalBuyers: result.stats.totalBuyers || 0,
        productClicks: result.stats.productClicks || result.traffic.productClicks || 0,
        productClickRate: result.stats.productClickRate || result.traffic.productClickRate || 0,
        conversionRate: result.stats.conversionRate || 0,
        addToCart: result.stats.addToCart || 0,
        gpm: result.stats.gpm || 0,
        totalLikes: result.stats.totalLikes || 0,
        totalShares: result.stats.totalShares || 0,
        totalComments: result.stats.totalComments || 0,
        commentRate: result.stats.commentRate || 0,
        newFollowers: result.stats.newFollowers || 0,
        couponsUsed: result.stats.couponsUsed || 0,
        coinsUsed: result.stats.coinsUsed || 0,
        coinsCost: (result.stats.coinsUsed || 0) * 0.01,
        coinRedemptions: result.stats.coinRedemptions || 0,
        auctionRounds: result.stats.auctionRounds || 0,
        productImpressions: result.traffic.productImpressions || 0,
        orderRate: result.traffic.orderRate || 0,
        impressionToOrderRate: result.traffic.impressionToOrderRate || 0,
        products: result.products,
      }

      cleanupFiles(files)
      res.json(reportData)
    } catch (error) {
      console.error('AI extract-live-report error:', error)
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined
      if (files) cleanupFiles(files)
      res.status(500).json({ message: 'Erro ao processar imagens' })
    }
  }
)

// Legacy endpoint for backward compatibility
router.post(
  '/extract-screenshot',
  upload.array('screenshots', 10),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[]
      if (!files?.length) {
        res.status(400).json({ message: 'Nenhuma imagem enviada' })
        return
      }

      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
        files.forEach(f => fs.unlink(f.path, () => {}))
        res.json({
          likes: 30699, comments: 246, shares: 9,
          totalViews: 14136, totalOrders: 6, totalRevenue: '155.98', engagementRate: '2.3',
        })
        return
      }

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const result = await extractFromImages(openai, files, STATS_PROMPT)
      files.forEach(f => fs.unlink(f.path, () => {}))
      res.json(result)
    } catch (error) {
      console.error('AI extract error:', error)
      const files = req.files as Express.Multer.File[]
      if (files) files.forEach(f => fs.unlink(f.path, () => {}))
      res.status(500).json({ message: 'Erro ao processar imagens' })
    }
  }
)

// --- Helpers ---

function cleanupFiles(files: { [fieldname: string]: Express.Multer.File[] }) {
  Object.values(files).flat().forEach(f => fs.unlink(f.path, () => {}))
}

async function extractFromImages(openai: OpenAI, files: Express.Multer.File[], systemPrompt: string) {
  const imageContents = files.map(file => {
    const base64 = fs.readFileSync(file.path).toString('base64')
    return {
      type: 'image_url' as const,
      image_url: { url: `data:${file.mimetype || 'image/png'};base64,${base64}`, detail: 'high' as const },
    }
  })

  const completion = await openai.chat.completions.create({
    model: 'gpt-5-nano',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analise as imagens e extraia todos os dados visíveis. Retorne APENAS um JSON válido, sem markdown, sem explicação.' },
          ...imageContents,
        ],
      },
    ],
  })

  const text = completion.choices[0].message.content || '{}'
  const jsonMatch = text.match(/\{[\s\S]*\}/) || text.match(/\[[\s\S]*\]/)
  try {
    return JSON.parse(jsonMatch ? jsonMatch[0] : text)
  } catch {
    console.error('Failed to parse AI response:', text)
    return {}
  }
}

function getMockExtractedData() {
  return {
    totalRevenue: 155.98, totalOrders: 6, totalItemsSold: 6,
    avgOrderValue: 26.0, avgRevenuePerBuyer: 26.0,
    totalViewers: 10882, engagedViewers: 1964, totalViews: 14136,
    peakViewers: 607, avgWatchTime: 69, liveDuration: 3600,
    clickRate: 3.9, totalBuyers: 6, productClicks: 556,
    productClickRate: 2.0, conversionRate: 1.1, addToCart: 175, gpm: 11.03,
    totalLikes: 30699, totalShares: 9, totalComments: 246,
    commentRate: 2.3, newFollowers: 151,
    couponsUsed: 0, coinsUsed: 0, coinRedemptions: 0, auctionRounds: 0,
    productImpressions: 9935, impressionToOrderRate: 0.06,
    products: [
      { name: 'Smartwatch Positivo Watch Essential 1.83"', price: 119.11, productClicks: 288, clickRate: 2.0, orders: 4, itemsSold: 4, orderClickRate: 1.4, addToCart: 98, revenue: 63.60, shopeeItemId: '40478428325' },
      { name: 'Sanduicheira 3 em 1 220V', price: 149.69, productClicks: 150, clickRate: 2.0, orders: 1, itemsSold: 1, orderClickRate: 0.7, addToCart: 40, revenue: 49.69 },
      { name: 'TV Stick Android TV 4K com Chromecast', price: 148.69, productClicks: 46, clickRate: 6.0, orders: 1, itemsSold: 1, orderClickRate: 2.2, addToCart: 21, revenue: 42.69 },
    ],
  }
}

const STATS_PROMPT = `Você é um especialista em extrair dados de relatórios de lives da Shopee Brasil. Analise as imagens e extraia TODOS os valores numéricos visíveis.

Mapeamento dos campos da Shopee para o JSON:
METADADOS (cabeçalho do relatório - geralmente aparece no topo da página):
- Nome/título da live (texto grande no topo, ex: "Lançamento POSITIVO") → liveTitle (string, copie o texto exato)
- "Horário de início" (formato DD/MM/YYYY HH:MM) → startDate (converter para formato YYYY-MM-DD, ex: "02/02/2026 13:06" → "2026-02-02") e startTime (formato HH:MM, ex: "02/02/2026 13:06" → "13:06")
- "Duração" (formato HH:MM:SS no cabeçalho) → liveDuration (converter para segundos, ex: "01:14:40" → 4480)

TRANSAÇÃO:
- "Vendas" (R$) → totalRevenue
- "Pedidos" → totalOrders
- "Item vendido" / "Itens vendidos" → totalItemsSold
- "Vendas por pedido" (R$) → avgOrderValue
- "Vendas por Comprador" / "Vendas por comprador" (R$) → avgRevenuePerBuyer

TRÁFEGO:
- "Espectadores" → totalViewers
- "Visualizadores engajados" → engagedViewers
- "Visualizações" → totalViews
- "Pico de usuários simultâneos" / "Pico simultâneo" → peakViewers
- "Tempo médio de visualização" (formato HH:MM:SS) → avgWatchTime (converter para segundos)
- "Duração da live" / "Duração da transmissão" / "Duração" (formato HH:MM:SS) → liveDuration (converter para segundos)

CONVERSÃO:
- "Taxa de cliques" (%) → clickRate
- "Compradores" → totalBuyers
- "Cliques do produto" / "Cliques no produto" → productClicks
- "Taxa de cliques no produto" (%) → productClickRate
- "Taxa de conversão" (%) → conversionRate
- "Adicionar ao carrinho" → addToCart
- "GPM" → gpm

ENGAJAMENTO:
- "Gostei" / "Curtidas" → totalLikes
- "Compartilhamentos" → totalShares
- "Comentários" → totalComments
- "Taxa de comentários" (%) → commentRate
- "Novos Seguidores" / "Novos seguidores" → newFollowers

PROMOÇÃO:
- "Cupons usados" → couponsUsed
- "Moedas usadas" / "Moedas Shopee" → coinsUsed
- "Resgates" / "Quantidade de resgates" → coinRedemptions
- "Rodada de leilão" → auctionRounds

Retorne um JSON com estes campos (use 0 para números não encontrados, "" para strings não encontradas):
{
  "liveTitle": string, "startDate": string (YYYY-MM-DD), "startTime": string (HH:MM), "liveDuration": number,
  "totalRevenue": number, "totalOrders": number, "totalItemsSold": number,
  "avgOrderValue": number, "avgRevenuePerBuyer": number,
  "totalViewers": number, "engagedViewers": number, "totalViews": number,
  "peakViewers": number, "avgWatchTime": number,
  "clickRate": number, "totalBuyers": number, "productClicks": number,
  "productClickRate": number, "conversionRate": number, "addToCart": number, "gpm": number,
  "totalLikes": number, "totalShares": number, "totalComments": number,
  "commentRate": number, "newFollowers": number,
  "couponsUsed": number, "coinsUsed": number, "coinRedemptions": number, "auctionRounds": number
}

Regras de conversão:
- Valores monetários (R$1.213,62) → número (1213.62). Atenção: ponto é separador de milhar, vírgula é decimal no Brasil.
- Tempos (00:01:24) → segundos (84)
- Porcentagens: mantenha o número SEM dividir por 100. Exemplos: 1,3% → 1.3 / 2,7% → 2.7 / 3,9% → 3.9 / 0,06% → 0.06. NÃO converta para fração (1,3% NÃO é 0.013).
- Números com ponto como milhar (18.920) → número inteiro (18920)`

const PRODUCTS_PROMPT = `Você é um especialista em extrair dados de relatórios da Shopee Brasil. Analise a imagem de lista de produtos e extraia os dados de CADA produto.

Mapeamento dos campos da Shopee:
- Nome do produto → name
- Preço (R$) → price
- "Cliques do produto" → productClicks
- "Taxa de cliques" (%) → clickRate
- "Pedidos" → orders
- "Itens vendidos" / "Vendido" → itemsSold
- "CO" / "Taxa de clique para pedido" (%) → orderClickRate
- "Adicionar ao carrinho" → addToCart
- "GMV" / "Vendas" (R$) → revenue
- ID do item Shopee (se visível) → shopeeItemId

Retorne um JSON:
{
  "products": [
    { "name": "Nome", "price": 0, "productClicks": 0, "clickRate": 0, "orders": 0, "itemsSold": 0, "orderClickRate": 0, "addToCart": 0, "revenue": 0, "shopeeItemId": "" }
  ]
}

Extraia TODOS os produtos visíveis. Regras de conversão:
- Valores monetários (R$1.213,62) → número (1213.62). Ponto é milhar, vírgula é decimal.
- Números com ponto como milhar (18.920) → inteiro (18920)
- Porcentagens: mantenha o número SEM dividir por 100. Exemplos: 1,0% → 1.0 / 2,7% → 2.7. NÃO converta para fração.`

const TRAFFIC_PROMPT = `Você é um especialista em extrair dados de análise de tráfego de lives da Shopee Brasil. Analise a imagem e extraia os dados do funil de conversão.

O funil da Shopee segue o fluxo: Impressão do Produto → Taxa de Cliques → Cliques de Produto → Taxa de Pedido → Pedido confirmado

Mapeamento dos campos da Shopee:
- "Impressão do produto" / "Impressões" (número grande no topo do funil) → productImpressions
- "Taxa de Cliques" / "Taxa de cliques" (% entre impressões e cliques, geralmente a primeira seta) → clickRate
- "Cliques do produto" / "Cliques de Produto" (número no meio do funil) → productClicks
- "Taxa de Pedido" / "Taxa de pedido" (% entre cliques e pedidos, geralmente a segunda seta) → orderRate
- "Pedido confirmado" / "Pedidos" (número final do funil) → totalOrders
- Taxa geral no topo da página (% em destaque, ex: "0,06%", taxa de impressão para pedido) → impressionToOrderRate

Retorne um JSON:
{
  "productImpressions": number, "clickRate": number, "productClicks": number,
  "orderRate": number, "totalOrders": number, "impressionToOrderRate": number
}

Regras: Ponto é milhar no Brasil (18.920 = 18920). Porcentagens: mantenha o número SEM dividir por 100. Exemplos: 2,41% → 2.41 / 2,51% → 2.51 / 0,06% → 0.06. NÃO converta para fração.`

export default router
