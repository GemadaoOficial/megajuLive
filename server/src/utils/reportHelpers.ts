import { Prisma } from '../generated/prisma/client.js'

// Parse date range from query parameters
export function getDateRange(query: Record<string, string | undefined>) {
  const { period, startDate, endDate } = query
  const now = new Date()
  let start: Date | undefined
  let end: Date | undefined

  switch (period) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
      break
    case 'yesterday': {
      const y = new Date(now)
      y.setDate(y.getDate() - 1)
      start = new Date(y.getFullYear(), y.getMonth(), y.getDate())
      end = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59, 999)
      break
    }
    case '7d':
      start = new Date(now)
      start.setDate(start.getDate() - 7)
      end = now
      break
    case '30d':
      start = new Date(now)
      start.setDate(start.getDate() - 30)
      end = now
      break
    case 'custom':
      if (startDate) start = new Date(startDate)
      if (endDate) end = new Date(endDate)
      break
    default:
      break
  }

  return { start, end }
}

// Get the previous period date range (for comparison)
export function getPreviousPeriodRange(start?: Date, end?: Date) {
  if (!start || !end) return { prevStart: undefined, prevEnd: undefined }
  const duration = end.getTime() - start.getTime()
  const prevEnd = new Date(start.getTime() - 1) // 1ms before current start
  const prevStart = new Date(prevEnd.getTime() - duration)
  return { prevStart, prevEnd }
}

// Build Prisma where clause for LiveReport filtering
export function buildReportWhere(
  userId: string,
  start?: Date,
  end?: Date,
  store?: string
): Prisma.LiveReportWhereInput {
  return {
    userId,
    ...(start || end ? {
      reportDate: {
        ...(start && { gte: start }),
        ...(end && { lte: end }),
      },
    } : {}),
    ...(store && { store }),
  }
}

// Calculate summary from an array of reports
export function calculateSummary(reports: any[]) {
  const count = reports.length
  if (count === 0) return null

  const summary = {
    totalRevenue: reports.reduce((s, r) => s + r.totalRevenue, 0),
    totalOrders: reports.reduce((s, r) => s + r.totalOrders, 0),
    totalItemsSold: reports.reduce((s, r) => s + r.totalItemsSold, 0),
    avgOrderValue: 0,
    avgRevenuePerBuyer: 0,
    totalViewers: reports.reduce((s, r) => s + r.totalViewers, 0),
    engagedViewers: reports.reduce((s, r) => s + r.engagedViewers, 0),
    totalViews: reports.reduce((s, r) => s + r.totalViews, 0),
    peakViewers: Math.max(...reports.map(r => r.peakViewers)),
    avgWatchTime: Math.round(reports.reduce((s, r) => s + r.avgWatchTime, 0) / count),
    totalLiveDuration: reports.reduce((s, r) => s + r.liveDuration, 0),
    avgLiveDuration: Math.round(reports.reduce((s, r) => s + r.liveDuration, 0) / count),
    avgClickRate: reports.reduce((s, r) => s + r.clickRate, 0) / count,
    totalBuyers: reports.reduce((s, r) => s + r.totalBuyers, 0),
    totalProductClicks: reports.reduce((s, r) => s + r.productClicks, 0),
    avgProductClickRate: reports.reduce((s, r) => s + r.productClickRate, 0) / count,
    avgConversionRate: reports.reduce((s, r) => s + r.conversionRate, 0) / count,
    totalAddToCart: reports.reduce((s, r) => s + r.addToCart, 0),
    avgGpm: reports.reduce((s, r) => s + r.gpm, 0) / count,
    totalLikes: reports.reduce((s, r) => s + r.totalLikes, 0),
    totalShares: reports.reduce((s, r) => s + r.totalShares, 0),
    totalComments: reports.reduce((s, r) => s + r.totalComments, 0),
    avgCommentRate: reports.reduce((s, r) => s + r.commentRate, 0) / count,
    totalNewFollowers: reports.reduce((s, r) => s + r.newFollowers, 0),
    totalCoinsUsed: reports.reduce((s, r) => s + r.coinsUsed, 0),
    totalCoinsCost: reports.reduce((s, r) => s + r.coinsCost, 0),
    totalCoinRedemptions: reports.reduce((s, r) => s + r.coinRedemptions, 0),
    totalAuctionRounds: reports.reduce((s, r) => s + r.auctionRounds, 0),
    livesCount: count,
  }

  summary.avgOrderValue = summary.totalOrders > 0
    ? summary.totalRevenue / summary.totalOrders : 0
  summary.avgRevenuePerBuyer = summary.totalBuyers > 0
    ? summary.totalRevenue / summary.totalBuyers : 0

  return summary
}

// Aggregate traffic sources across multiple reports (weighted average)
export function aggregateTrafficSources(reports: any[]) {
  const sourceMap = new Map<string, { totalPageViews: number; weightedRate: number; totalWeight: number }>()
  for (const report of reports) {
    const sources = Array.isArray(report.trafficSources) ? (report.trafficSources as any[]) : []
    const reportTotalViews = sources.reduce((sum: number, s: any) => sum + (s.pageViews || 0), 0)
    for (const s of sources) {
      const key = (s.source || '').trim()
      if (!key) continue
      const existing = sourceMap.get(key) || { totalPageViews: 0, weightedRate: 0, totalWeight: 0 }
      existing.totalPageViews += s.pageViews || 0
      existing.weightedRate += (s.trafficRate || 0) * (reportTotalViews || 1)
      existing.totalWeight += reportTotalViews || 1
      sourceMap.set(key, existing)
    }
  }
  return Array.from(sourceMap.entries())
    .map(([source, data]) => ({
      source,
      pageViews: data.totalPageViews,
      trafficRate: data.totalWeight > 0
        ? Math.round((data.weightedRate / data.totalWeight) * 100) / 100 : 0,
    }))
    .sort((a, b) => b.pageViews - a.pageViews)
}

// Calculate comparison deltas between current and previous summaries
export function calculateComparison(current: any, previous: any) {
  if (!current || !previous) return null
  const metrics = [
    'totalRevenue', 'totalOrders', 'totalViewers', 'totalAddToCart',
    'avgConversionRate', 'avgClickRate', 'totalLikes', 'totalComments',
    'totalNewFollowers', 'totalCoinsUsed', 'livesCount',
  ]
  const comparison: Record<string, { previous: number; change: number }> = {}
  for (const key of metrics) {
    const curr = current[key] || 0
    const prev = previous[key] || 0
    comparison[key] = {
      previous: prev,
      change: prev > 0 ? ((curr - prev) / prev) * 100 : (curr > 0 ? 100 : 0),
    }
  }
  return comparison
}
