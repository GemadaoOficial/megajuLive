import { Router, Request, Response } from 'express'
import { Prisma } from '../../generated/prisma/client.js'
import prisma from '../../utils/prisma.js'
import {
  getDateRange,
  buildReportWhere,
  calculateSummary,
  aggregateTrafficSources,
  getPreviousPeriodRange,
  calculateComparison,
} from '../../utils/reportHelpers.js'
import '../../types/index.js'

const router = Router()

// GET /summary - Aggregated overview with period comparison
router.get('/summary', async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end } = getDateRange(req.query as Record<string, string>)
    const store = (req.query as any).store as string | undefined

    const where = buildReportWhere(req.user.id, start, end, store)

    const reports = await prisma.liveReport.findMany({
      where,
      include: { liveProducts: true },
    })

    const count = reports.length
    if (count === 0) {
      res.json({ summary: null, count: 0 })
      return
    }

    const summary = calculateSummary(reports)
    const trafficSources = aggregateTrafficSources(reports)

    // Fetch previous period data for comparison
    const { prevStart, prevEnd } = getPreviousPeriodRange(start, end)
    let comparison = null

    if (prevStart && prevEnd) {
      const prevWhere = buildReportWhere(req.user.id, prevStart, prevEnd, store)
      const prevReports = await prisma.liveReport.findMany({
        where: prevWhere,
        include: { liveProducts: true },
      })

      const prevSummary = calculateSummary(prevReports)
      comparison = calculateComparison(summary, prevSummary)
    }

    res.json({ summary, count, trafficSources, comparison })
  } catch (error) {
    console.error('Get report summary error:', error)
    res.status(500).json({ message: 'Erro ao buscar resumo' })
  }
})

// GET /export-excel - Export all data as Excel
router.get('/export-excel', async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end } = getDateRange(req.query as Record<string, string>)
    const store = (req.query as any).store as string | undefined

    const where = buildReportWhere(req.user.id, start, end, store)

    const reports = await prisma.liveReport.findMany({
      where,
      include: { liveProducts: true },
      orderBy: { reportDate: 'desc' },
    })

    if (reports.length === 0) {
      res.status(404).json({ message: 'Nenhum relatorio encontrado no periodo' })
      return
    }

    const summary = calculateSummary(reports)
    if (!summary) {
      res.status(404).json({ message: 'Nenhum relatorio encontrado no periodo' })
      return
    }
    const count = reports.length

    // --- Build Excel workbook ---
    const ExcelJS = await import('exceljs')
    const workbook = new ExcelJS.default.Workbook()
    workbook.creator = 'MegaJu Live'
    workbook.created = new Date()

    const headerFill: any = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B5E20' } }
    const headerFont: any = { size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
    const sectionFill = (color: string): any => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: color } })
    const pct = (v: number) => (v || 0) / 100  // DB stores 12.5 -> Excel needs 0.125
    const timeVal = (seconds: number) => (seconds || 0) / 86400 // seconds -> Excel time fraction

    // Helper: format period string
    const periodLabel = (() => {
      if (start && end) return `${start.toLocaleDateString('pt-BR')} - ${end.toLocaleDateString('pt-BR')}`
      if (start) return `A partir de ${start.toLocaleDateString('pt-BR')}`
      return 'Todo o periodo'
    })()
    const storeLabel = store === 'MADA' ? 'Mada' : store === 'STAR_IMPORT' ? 'Star Import' : 'Todas as Lojas'

    // ===================== ABA 1: RESUMO =====================
    const wsResumo = workbook.addWorksheet('Resumo')
    wsResumo.getColumn(1).width = 35
    wsResumo.getColumn(2).width = 25

    const addResumoRow = (label: string, value: any, numFmt?: string) => {
      const row = wsResumo.addRow([label, value])
      row.getCell(1).font = { size: 11, color: { argb: 'FF424242' } }
      row.getCell(2).font = { size: 11, bold: true }
      if (numFmt) row.getCell(2).numFmt = numFmt
      return row
    }
    const addSection = (title: string, color: string) => {
      wsResumo.addRow([])
      const row = wsResumo.addRow([title])
      row.getCell(1).font = { size: 12, bold: true, color: { argb: 'FFFFFFFF' } }
      row.getCell(1).fill = sectionFill(color)
      row.getCell(2).fill = sectionFill(color)
    }

    // Title
    const titleRow = wsResumo.addRow(['Relatorio de Lives - Shopee'])
    titleRow.getCell(1).font = { size: 16, bold: true, color: { argb: 'FF1B5E20' } }
    wsResumo.mergeCells(1, 1, 1, 2)
    addResumoRow('Periodo', periodLabel)
    addResumoRow('Loja', storeLabel)
    addResumoRow('Gerado em', new Date(new Date().getTime() - 3 * 60 * 60 * 1000), 'dd/mm/yyyy hh:mm')

    addSection('TRANSACAO', 'FF2E7D32')
    addResumoRow('Receita Total', summary.totalRevenue, '"R$" #,##0.00')
    addResumoRow('Total de Pedidos', summary.totalOrders, '#,##0')
    addResumoRow('Total de Itens Vendidos', summary.totalItemsSold, '#,##0')
    addResumoRow('Ticket Medio', summary.avgOrderValue, '"R$" #,##0.00')
    addResumoRow('Receita Media por Comprador', summary.avgRevenuePerBuyer, '"R$" #,##0.00')

    addSection('TRAFEGO', 'FF7B1FA2')
    addResumoRow('Total de Espectadores', summary.totalViewers, '#,##0')
    addResumoRow('Espectadores Engajados', summary.engagedViewers, '#,##0')
    addResumoRow('Total de Visualizacoes', summary.totalViews, '#,##0')
    addResumoRow('Pico de Espectadores', summary.peakViewers, '#,##0')
    addResumoRow('Tempo Medio de Visualizacao', timeVal(summary.avgWatchTime), '[h]:mm:ss')
    addResumoRow('Duracao Total das Lives', timeVal(summary.totalLiveDuration), '[h]:mm:ss')
    addResumoRow('Duracao Media por Live', timeVal(summary.avgLiveDuration), '[h]:mm:ss')

    addSection('CONVERSAO', 'FF1565C0')
    addResumoRow('Taxa de Clique Media', pct(summary.avgClickRate), '0.0%')
    addResumoRow('Total de Compradores', summary.totalBuyers, '#,##0')
    addResumoRow('Total Cliques em Produtos', summary.totalProductClicks, '#,##0')
    addResumoRow('Taxa Clique em Produto Media', pct(summary.avgProductClickRate), '0.0%')
    addResumoRow('Taxa de Conversao Media', pct(summary.avgConversionRate), '0.0%')
    addResumoRow('Total Add to Cart', summary.totalAddToCart, '#,##0')
    addResumoRow('GPM Medio', summary.avgGpm, '"R$" #,##0.00')

    addSection('ENGAJAMENTO', 'FFC62828')
    addResumoRow('Total de Curtidas', summary.totalLikes, '#,##0')
    addResumoRow('Total de Compartilhamentos', summary.totalShares, '#,##0')
    addResumoRow('Total de Comentarios', summary.totalComments, '#,##0')
    addResumoRow('Taxa de Comentarios Media', pct(summary.avgCommentRate), '0.0%')
    addResumoRow('Novos Seguidores', summary.totalNewFollowers, '#,##0')

    addSection('MARKETING', 'FFEF6C00')
    addResumoRow('Moedas Utilizadas', summary.totalCoinsUsed, '#,##0')
    addResumoRow('Custo Total Moedas', summary.totalCoinsCost, '"R$" #,##0.00')
    addResumoRow('Resgates de Moedas', summary.totalCoinRedemptions, '#,##0')
    addResumoRow('Rodadas de Moedas', summary.totalAuctionRounds, '#,##0')

    addSection('META', 'FF546E7A')
    addResumoRow('Total de Lives', summary.livesCount, '#,##0')

    // ===================== ABA 2: LIVES =====================
    const wsLives = workbook.addWorksheet('Lives')

    // Column definitions: [header, field-getter, width, numFmt?]
    type ColDef = { h: string; get: (r: any) => any; w: number; fmt?: string }
    const liveCols: ColDef[] = [
      { h: 'Titulo', get: r => r.liveTitle, w: 30 },
      { h: 'Loja', get: r => r.store, w: 14 },
      { h: 'Data', get: r => r.reportDate, w: 14, fmt: 'dd/mm/yyyy' },
      { h: 'Duracao', get: r => timeVal(r.liveDuration), w: 12, fmt: '[h]:mm:ss' },
      { h: 'Receita Total', get: r => r.totalRevenue, w: 18, fmt: '"R$" #,##0.00' },
      { h: 'Pedidos', get: r => r.totalOrders, w: 12, fmt: '#,##0' },
      { h: 'Itens Vendidos', get: r => r.totalItemsSold, w: 14, fmt: '#,##0' },
      { h: 'Ticket Medio', get: r => r.avgOrderValue, w: 16, fmt: '"R$" #,##0.00' },
      { h: 'Receita/Comprador', get: r => r.avgRevenuePerBuyer, w: 18, fmt: '"R$" #,##0.00' },
      { h: 'Espectadores', get: r => r.totalViewers, w: 14, fmt: '#,##0' },
      { h: 'Engajados', get: r => r.engagedViewers, w: 12, fmt: '#,##0' },
      { h: 'Visualizacoes', get: r => r.totalViews, w: 14, fmt: '#,##0' },
      { h: 'Pico Viewers', get: r => r.peakViewers, w: 14, fmt: '#,##0' },
      { h: 'Tempo Medio', get: r => timeVal(r.avgWatchTime), w: 14, fmt: '[h]:mm:ss' },
      { h: 'Taxa de Clique', get: r => pct(r.clickRate), w: 14, fmt: '0.0%' },
      { h: 'Compradores', get: r => r.totalBuyers, w: 14, fmt: '#,##0' },
      { h: 'Cliques Produto', get: r => r.productClicks, w: 16, fmt: '#,##0' },
      { h: 'Taxa Clique Prod.', get: r => pct(r.productClickRate), w: 16, fmt: '0.0%' },
      { h: 'Conversao', get: r => pct(r.conversionRate), w: 14, fmt: '0.0%' },
      { h: 'Add to Cart', get: r => r.addToCart, w: 12, fmt: '#,##0' },
      { h: 'GPM', get: r => r.gpm, w: 14, fmt: '"R$" #,##0.00' },
      { h: 'Curtidas', get: r => r.totalLikes, w: 12, fmt: '#,##0' },
      { h: 'Compartilhamentos', get: r => r.totalShares, w: 18, fmt: '#,##0' },
      { h: 'Comentarios', get: r => r.totalComments, w: 14, fmt: '#,##0' },
      { h: 'Taxa Comentarios', get: r => pct(r.commentRate), w: 16, fmt: '0.0%' },
      { h: 'Novos Seguidores', get: r => r.newFollowers, w: 16, fmt: '#,##0' },
      { h: 'Moedas Usadas', get: r => r.coinsUsed, w: 14, fmt: '#,##0' },
      { h: 'Custo Moedas', get: r => r.coinsCost, w: 16, fmt: '"R$" #,##0.00' },
      { h: 'Resgates Moedas', get: r => r.coinRedemptions, w: 16, fmt: '#,##0' },
      { h: 'Rodadas Moedas', get: r => r.auctionRounds, w: 16, fmt: '#,##0' },
      { h: 'Impressoes Produto', get: r => r.productImpressions, w: 18, fmt: '#,##0' },
      { h: 'Taxa Clique Funil', get: r => pct(r.funnelClickRate), w: 16, fmt: '0.0%' },
      { h: 'Cliques Funil', get: r => r.funnelProductClicks, w: 14, fmt: '#,##0' },
      { h: 'Taxa de Pedido', get: r => pct(r.orderRate), w: 14, fmt: '0.0%' },
      { h: 'Pedidos Funil', get: r => r.funnelOrders, w: 14, fmt: '#,##0' },
      { h: 'Impressao>Pedido', get: r => pct(r.impressionToOrderRate), w: 16, fmt: '0.0%' },
      { h: 'Qtd Produtos', get: r => r.liveProducts?.length || 0, w: 14, fmt: '#,##0' },
    ]

    // Set column widths
    liveCols.forEach((col, i) => { wsLives.getColumn(i + 1).width = col.w })

    // Header row
    const liveHeaderRow = wsLives.addRow(liveCols.map(c => c.h))
    liveHeaderRow.eachCell((cell) => {
      cell.font = headerFont
      cell.fill = headerFill
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
    })
    wsLives.views = [{ state: 'frozen' as const, ySplit: 1 }]
    wsLives.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: liveCols.length } }

    // Data rows
    for (const report of reports) {
      const row = wsLives.addRow(liveCols.map(c => c.get(report)))
      liveCols.forEach((col, i) => {
        if (col.fmt) row.getCell(i + 1).numFmt = col.fmt
      })
    }

    // Totals row
    const dataStartRow = 2
    const dataEndRow = reports.length + 1
    const totalsRow = wsLives.addRow([])
    totalsRow.getCell(1).value = 'TOTAIS'
    totalsRow.getCell(1).font = { bold: true }

    liveCols.forEach((col, i) => {
      const colIdx = i + 1
      if (i === 0) return // Skip title col (already set "TOTAIS")
      if (!col.fmt || col.fmt === 'dd/mm/yyyy' || col.fmt === '[h]:mm:ss') return
      const colLetter = wsLives.getColumn(colIdx).letter
      if (col.fmt === '0.0%') {
        totalsRow.getCell(colIdx).value = { formula: `AVERAGE(${colLetter}${dataStartRow}:${colLetter}${dataEndRow})` }
      } else {
        totalsRow.getCell(colIdx).value = { formula: `SUM(${colLetter}${dataStartRow}:${colLetter}${dataEndRow})` }
      }
      totalsRow.getCell(colIdx).numFmt = col.fmt
      totalsRow.getCell(colIdx).font = { bold: true }
    })
    totalsRow.eachCell((cell) => {
      cell.border = { top: { style: 'medium', color: { argb: 'FF000000' } } }
    })

    // ===================== ABA 3: PRODUTOS =====================
    const wsProd = workbook.addWorksheet('Produtos')

    const prodCols: ColDef[] = [
      { h: 'Nome do Produto', get: (p: any) => p.name, w: 35 },
      { h: 'Nome Canonico', get: (p: any) => p.canonicalName || '', w: 35 },
      { h: 'Live', get: (p: any) => p._liveTitle, w: 30 },
      { h: 'Data da Live', get: (p: any) => p._reportDate, w: 14, fmt: 'dd/mm/yyyy' },
      { h: 'Loja', get: (p: any) => p._store, w: 14 },
      { h: 'Preco', get: (p: any) => p.price, w: 16, fmt: '"R$" #,##0.00' },
      { h: 'Cliques', get: (p: any) => p.productClicks, w: 12, fmt: '#,##0' },
      { h: 'Taxa Clique', get: (p: any) => pct(p.clickRate), w: 14, fmt: '0.0%' },
      { h: 'Pedidos', get: (p: any) => p.orders, w: 12, fmt: '#,##0' },
      { h: 'Itens Vendidos', get: (p: any) => p.itemsSold, w: 14, fmt: '#,##0' },
      { h: 'Taxa Pedido/Clique', get: (p: any) => pct(p.orderClickRate), w: 18, fmt: '0.0%' },
      { h: 'Add to Cart', get: (p: any) => p.addToCart, w: 12, fmt: '#,##0' },
      { h: 'Receita', get: (p: any) => p.revenue, w: 18, fmt: '"R$" #,##0.00' },
      { h: 'Shopee Item ID', get: (p: any) => p.shopeeItemId || '', w: 18 },
    ]

    prodCols.forEach((col, i) => { wsProd.getColumn(i + 1).width = col.w })

    const prodHeaderRow = wsProd.addRow(prodCols.map(c => c.h))
    prodHeaderRow.eachCell((cell) => {
      cell.font = headerFont
      cell.fill = headerFill
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
    })
    wsProd.views = [{ state: 'frozen' as const, ySplit: 1 }]
    wsProd.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: prodCols.length } }

    // Flatten products with parent report info
    const allProducts: any[] = []
    for (const report of reports) {
      for (const prod of report.liveProducts) {
        allProducts.push({
          ...prod,
          _liveTitle: report.liveTitle,
          _reportDate: report.reportDate,
          _store: report.store,
        })
      }
    }

    let prodRowCount = 0
    for (const product of allProducts) {
      const row = wsProd.addRow(prodCols.map(c => c.get(product)))
      prodCols.forEach((col, i) => {
        if (col.fmt) row.getCell(i + 1).numFmt = col.fmt
      })
      prodRowCount++
    }

    // Products totals row
    if (prodRowCount > 0) {
      const pTotals = wsProd.addRow([])
      pTotals.getCell(1).value = 'TOTAIS'
      pTotals.getCell(1).font = { bold: true }
      const pStart = 2
      const pEnd = prodRowCount + 1
      prodCols.forEach((col, i) => {
        const colIdx = i + 1
        if (i === 0 || !col.fmt || col.fmt === 'dd/mm/yyyy' || col.fmt === '0.0%') return
        if (col.fmt.includes('#,##0') || col.fmt.includes('R$')) {
          const letter = wsProd.getColumn(colIdx).letter
          pTotals.getCell(colIdx).value = { formula: `SUM(${letter}${pStart}:${letter}${pEnd})` }
          pTotals.getCell(colIdx).numFmt = col.fmt
          pTotals.getCell(colIdx).font = { bold: true }
        }
      })
      pTotals.eachCell((cell) => {
        cell.border = { top: { style: 'medium', color: { argb: 'FF000000' } } }
      })
    }

    // ===================== ABA 4: FONTES DE TRAFEGO =====================
    const wsTraffic = workbook.addWorksheet('Fontes de Trafego')

    const trafficCols: ColDef[] = [
      { h: 'Live', get: (t: any) => t.liveTitle, w: 30 },
      { h: 'Data da Live', get: (t: any) => t.reportDate, w: 14, fmt: 'dd/mm/yyyy' },
      { h: 'Loja', get: (t: any) => t.store, w: 14 },
      { h: 'Fonte de Trafego', get: (t: any) => t.source, w: 25 },
      { h: 'Taxa de Trafego', get: (t: any) => pct(t.trafficRate), w: 16, fmt: '0.0%' },
      { h: 'Visualizacoes', get: (t: any) => t.pageViews, w: 16, fmt: '#,##0' },
    ]

    trafficCols.forEach((col, i) => { wsTraffic.getColumn(i + 1).width = col.w })

    const trafficHeaderRow = wsTraffic.addRow(trafficCols.map(c => c.h))
    trafficHeaderRow.eachCell((cell) => {
      cell.font = headerFont
      cell.fill = headerFill
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
    })
    wsTraffic.views = [{ state: 'frozen' as const, ySplit: 1 }]
    wsTraffic.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: trafficCols.length } }

    // Flatten traffic sources
    for (const report of reports) {
      const sources = Array.isArray(report.trafficSources) ? (report.trafficSources as any[]) : []
      for (const src of sources) {
        const item = {
          liveTitle: report.liveTitle,
          reportDate: report.reportDate,
          store: report.store,
          source: src.source || '',
          trafficRate: src.trafficRate || 0,
          pageViews: src.pageViews || 0,
        }
        const row = wsTraffic.addRow(trafficCols.map(c => c.get(item)))
        trafficCols.forEach((col, i) => {
          if (col.fmt) row.getCell(i + 1).numFmt = col.fmt
        })
      }
    }

    // --- Stream response ---
    const dateStr = new Date().toISOString().slice(0, 10)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="relatorio-lives-${dateStr}.xlsx"`)
    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    console.error('Excel export error:', error)
    res.status(500).json({ message: 'Erro ao exportar Excel' })
  }
})

export default router
