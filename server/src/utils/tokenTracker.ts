import prisma from './prisma.js'

const COSTS: Record<string, { input: number; output: number }> = {
  'gpt-4.1-mini': { input: 0.40 / 1_000_000, output: 1.60 / 1_000_000 },
}

export async function trackTokenUsage(
  userId: string,
  feature: string,
  usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | undefined,
  model = 'gpt-4.1-mini'
): Promise<void> {
  if (!usage) return
  const rates = COSTS[model] || COSTS['gpt-4.1-mini']
  const cost = (usage.prompt_tokens || 0) * rates.input + (usage.completion_tokens || 0) * rates.output

  await prisma.aITokenUsage.create({
    data: {
      userId,
      feature,
      promptTokens: usage.prompt_tokens || 0,
      completionTokens: usage.completion_tokens || 0,
      totalTokens: usage.total_tokens || 0,
      estimatedCost: Math.round(cost * 1_000_000) / 1_000_000,
      model,
    },
  }).catch((err: any) => console.error('[TokenTracker] Error:', err))
}
