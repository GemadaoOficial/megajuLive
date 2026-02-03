import { Router, Request, Response } from 'express'
import OpenAI from 'openai'
import { authenticate } from '../middlewares/auth.js'
import '../types/index.js'

const router = Router()

router.use(authenticate)

// Suggest live titles using GPT
router.post('/suggest-title', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, niche } = req.body

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      // Return mock titles if no API key
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

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Voce e um especialista em marketing para lives de vendas na Shopee. Gere titulos atrativos e clicaveis para lives de vendas.',
        },
        {
          role: 'user',
          content: `Gere 5 titulos atrativos para uma live de vendas na categoria "${category || 'Geral'}" e nicho "${niche || 'E-commerce'}". Os titulos devem ser curtos, impactantes e chamar atencao. Retorne apenas os titulos, um por linha, sem numeracao.`,
        },
      ],
      max_tokens: 200,
      temperature: 0.8,
    })

    const titles = completion.choices[0].message.content
      ?.split('\n')
      .filter((line) => line.trim())
      .slice(0, 5) || []

    res.json({ titles })
  } catch (error) {
    console.error('AI suggest error:', error)
    // Return fallback titles on error
    res.json({
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

export default router
