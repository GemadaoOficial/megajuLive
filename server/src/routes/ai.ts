import { Router, Request, Response } from 'express'
import OpenAI from 'openai'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { authenticate } from '../middlewares/auth.js'
import { getConfig } from '../utils/config.js'
import '../types/index.js'

const router = Router()

// ─── OpenAI singleton (reuse HTTP/2 connection + explicit timeout) ───────────
let _openai: OpenAI | null = null
function getOpenAI(): OpenAI {
  const key = getConfig('OPENAI_API_KEY')
  if (!_openai || (_openai as any)._apiKey !== key) {
    _openai = new OpenAI({
      apiKey: key,
      timeout: 60_000,   // 60s max per request (fail fast instead of hanging)
      maxRetries: 1,      // 1 retry instead of default 2 (saves time on failures)
    })
    ;(_openai as any)._apiKey = key // track key for hot-reload detection
  }
  return _openai
}

// Test endpoint (no auth required) to diagnose OpenAI connection
router.get('/test', async (req: Request, res: Response): Promise<void> => {
  try {
    const key = getConfig('OPENAI_API_KEY')
    if (!key || key === 'your-openai-api-key-here') {
      res.json({ status: 'no_key', message: 'OPENAI_API_KEY nao configurada' })
      return
    }

    const openai = getOpenAI()
    const completion = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [{ role: 'user', content: 'Diga apenas: OK' }],
      max_tokens: 10,
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

    if (!getConfig('OPENAI_API_KEY') || getConfig('OPENAI_API_KEY') === 'your-openai-api-key-here') {
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

    const openai = getOpenAI()

    const userPrompt = prompt
      ? `Live sobre: "${prompt}". Gere 5 titulos (max 60 chars cada), um por linha, sem numeracao.`
      : `Live na categoria "${category || 'Geral'}", nicho "${niche || 'E-commerce'}". Gere 5 titulos (max 60 chars cada), um por linha, sem numeracao.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content: 'Especialista em marketing Shopee Brasil. Gere titulos atrativos, curtos, com emojis moderados. Sem promessas enganosas. Foque em urgencia e beneficios reais.',
        },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
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

    if (!getConfig('OPENAI_API_KEY') || getConfig('OPENAI_API_KEY') === 'your-openai-api-key-here') {
      res.json({
        descriptions: [
          'Venha conferir as melhores ofertas ao vivo! Descontos exclusivos, frete gratis e cupons especiais esperando por voce. Nao perca!',
          'Live especial com precos arrasadores! Produtos selecionados com ate 70% de desconto. Corre que e por tempo limitado!',
          'Aproveite ofertas exclusivas da Shopee Live! Interaja, ganhe cupons e garanta os melhores precos. Te espero la!',
        ],
      })
      return
    }

    const openai = getOpenAI()

    const userPrompt = prompt
      ? `Live sobre: "${prompt}"${title ? `. Titulo: "${title}"` : ''}. Crie 3 descricoes (max 250 chars cada), uma por linha, sem numeracao.`
      : `Live Shopee${title ? ` "${title}"` : ''}. Crie 3 descricoes (max 250 chars cada), uma por linha, sem numeracao.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content: 'Copywriter Shopee Brasil. Descricoes curtas (max 250 chars), persuasivas, com emojis moderados. Sem promessas falsas. Foque em urgencia e beneficios reais.',
        },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
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

      if (!getConfig('OPENAI_API_KEY') || getConfig('OPENAI_API_KEY') === 'your-openai-api-key-here') {
        const mockData = getMockExtractedData()
        cleanupFiles(files)
        res.json(mockData)
        return
      }

      const openai = getOpenAI()

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

      if (!getConfig('OPENAI_API_KEY') || getConfig('OPENAI_API_KEY') === 'your-openai-api-key-here') {
        files.forEach(f => fs.unlink(f.path, () => {}))
        res.json({
          likes: 30699, comments: 246, shares: 9,
          totalViews: 14136, totalOrders: 6, totalRevenue: '155.98', engagementRate: '2.3',
        })
        return
      }

      const openai = getOpenAI()
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
  // Async file I/O (non-blocking) + detail: 'high' (needed for accurate text/number extraction from screenshots)
  const imageContents = await Promise.all(files.map(async (file) => {
    const buffer = await fs.promises.readFile(file.path)
    return {
      type: 'image_url' as const,
      image_url: { url: `data:${file.mimetype || 'image/png'};base64,${buffer.toString('base64')}`, detail: 'high' as const },
    }
  }))

  const completion = await openai.chat.completions.create({
    model: 'gpt-5-nano',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Extraia os dados das imagens. Retorne APENAS JSON válido.' },
          ...imageContents,
        ],
      },
    ],
    max_tokens: 2000,
    temperature: 0.1,
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

const STATS_PROMPT = `Extraia dados do relatório Shopee Live Brasil. Retorne JSON com campos abaixo (0 se ausente, "" se string ausente).

Campos Shopee → JSON:
liveTitle: título da live | startDate: "Horário de início" DD/MM/YYYY→YYYY-MM-DD | startTime: HH:MM | liveDuration: "Duração" HH:MM:SS→segundos
totalRevenue: "Vendas" R$ | totalOrders: "Pedidos" | totalItemsSold: "Itens vendidos" | avgOrderValue: "Vendas por pedido" R$ | avgRevenuePerBuyer: "Vendas por Comprador" R$
totalViewers: "Espectadores" | engagedViewers: "Visualizadores engajados" | totalViews: "Visualizações" | peakViewers: "Pico simultâneo" | avgWatchTime: HH:MM:SS→segundos
clickRate: "Taxa de cliques" % | totalBuyers: "Compradores" | productClicks: "Cliques do produto" | productClickRate: "Taxa de cliques no produto" % | conversionRate: "Taxa de conversão" % | addToCart: "Adicionar ao carrinho" | gpm: "GPM"
totalLikes: "Curtidas" | totalShares: "Compartilhamentos" | totalComments: "Comentários" | commentRate: "Taxa de comentários" % | newFollowers: "Novos Seguidores"
couponsUsed: "Cupons usados" | coinsUsed: "Moedas usadas" | coinRedemptions: "Resgates" | auctionRounds: "Rodada de leilão"

Conversões BR: R$1.213,62→1213.62 (ponto=milhar, vírgula=decimal) | HH:MM:SS→segundos | 1,3%→1.3 (NÃO dividir por 100) | 18.920→18920`

const PRODUCTS_PROMPT = `Extraia TODOS os produtos da lista Shopee. Retorne JSON: {"products":[{campos abaixo}]}

Campos: name, price (R$), productClicks, clickRate (%), orders, itemsSold, orderClickRate (%), addToCart, revenue (R$), shopeeItemId (se visível)

Conversões BR: R$1.213,62→1213.62 (ponto=milhar, vírgula=decimal) | 1,0%→1.0 (NÃO dividir por 100) | 18.920→18920`

const TRAFFIC_PROMPT = `Extraia dados do funil de tráfego Shopee Live. Retorne JSON com: productImpressions, clickRate (%), productClicks, orderRate (%), totalOrders, impressionToOrderRate (%)

Funil: Impressão→Cliques→Pedido. Conversões BR: 18.920→18920 (ponto=milhar) | 2,41%→2.41 (NÃO dividir por 100)`

export default router
