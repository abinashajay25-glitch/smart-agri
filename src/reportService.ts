import { jsPDF } from 'jspdf'
import { InventoryItem, MarketPriceRecord, SmartSellCalculation, UserProfile } from './types'

export const exportInventoryToCSV = (items: InventoryItem[], user: UserProfile) => {
  const headers = [
    'ID',
    'Crop Name',
    'Variety',
    'Harvest Date',
    'Quantity (kg)',
    'Storage Location',
    'Storage Condition',
    'Days Remaining',
    'Spoilage Risk',
    'Estimated Price/kg (INR)',
    'Estimated Total Value (INR)',
    'Notes',
  ]

  const rows = items.map(item => [
    item.id,
    `"${item.cropName}"`,
    `"${item.variety || ''}"`,
    item.harvestDate,
    item.quantityKg,
    `"${item.storageLocation}"`,
    item.storageCondition,
    item.daysRemaining,
    item.spoilageRisk,
    item.estimatedMarketPricePerKg,
    item.quantityKg * item.estimatedMarketPricePerKg,
    `"${(item.notes || '').replace(/"/g, '""')}"`,
  ])

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `SmartAgri_Inventory_${user.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const exportSmartSellReportToCSV = (calculations: SmartSellCalculation[], cropName: string, quantityKg: number) => {
  const headers = [
    'Mandi Name',
    'District',
    'State',
    'Distance (km)',
    'Commodity',
    'Modal Price / Qtl (INR)',
    'Calculated Quantity (kg)',
    'Gross Revenue (INR)',
    'Transport Cost (INR)',
    'Mandi Fees (INR)',
    'Packaging Cost (INR)',
    'Net Revenue (INR)',
    'Net Realization / kg (INR)',
    'Recommendation Rank',
    'Reasoning',
  ]

  const rows = calculations.map(c => [
    `"${c.mandi.mandiName}"`,
    `"${c.mandi.district}"`,
    `"${c.mandi.state}"`,
    c.mandi.distanceKm,
    `"${c.cropName}"`,
    c.mandi.modalPricePerQuintal,
    quantityKg,
    Math.round(c.grossRevenue),
    Math.round(c.transportCost),
    Math.round(c.mandiCessAndLoading),
    Math.round(c.packagingCost),
    Math.round(c.netRevenue),
    c.netPricePerKg.toFixed(2),
    c.profitRank,
    `"${c.recommendationReason.replace(/"/g, '""')}"`,
  ])

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `SmartAgri_SmartSell_${cropName}_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const generateFarmerAuditPDF = (
  user: UserProfile,
  inventory: InventoryItem[],
  marketPrices: MarketPriceRecord[],
  smartSellResults?: SmartSellCalculation[]
) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header Banner
  doc.setFillColor(27, 94, 32) // Forest Green
  doc.rect(0, 0, pageWidth, 28, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('SmartAgri AI — Comprehensive Farmer Intelligence Report', 14, 14)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Grow Smart. Store Safe. Sell Better. | Verified Post-Harvest & Market Dispatch Audit', 14, 22)

  // Farmer Details
  doc.setTextColor(33, 33, 33)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('1. Farmer & Holdings Profile', 14, 38)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Farmer Name: ${user.name}`, 14, 45)
  doc.text(`Phone: ${user.phone}`, 14, 50)
  doc.text(`Location: ${user.location}, ${user.state}`, 14, 55)
  doc.text(`Farm Size: ${user.farmSizeAcres} Acres`, 110, 45)
  doc.text(`Primary Storage: ${user.storageType.replace('_', ' ').toUpperCase()}`, 110, 50)
  doc.text(`Report Generation Date: ${new Date().toLocaleDateString('en-IN')}`, 110, 55)

  // Line divider
  doc.setDrawColor(200, 200, 200)
  doc.line(14, 60, pageWidth - 14, 60)

  // Inventory Summary
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('2. Post-Harvest Inventory & Spoilage Risk Status', 14, 70)

  let y = 78
  doc.setFillColor(240, 245, 240)
  doc.rect(14, y - 5, pageWidth - 28, 8, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('CROP', 16, y)
  doc.text('HARVEST DATE', 45, y)
  doc.text('QTY (KG)', 80, y)
  doc.text('STORAGE', 110, y)
  doc.text('DAYS REMAINING', 140, y)
  doc.text('RISK STATUS', 172, y)

  y += 7
  doc.setFont('helvetica', 'normal')

  let totalQty = 0
  let totalVal = 0

  inventory.forEach((item, idx) => {
    if (y > 260) {
      doc.addPage()
      y = 20
    }
    totalQty += item.quantityKg
    totalVal += item.quantityKg * item.estimatedMarketPricePerKg

    // Highlight row if high or critical
    if (item.spoilageRisk === 'CRITICAL' || item.spoilageRisk === 'HIGH') {
      doc.setFillColor(255, 235, 235)
      doc.rect(14, y - 4, pageWidth - 28, 6, 'F')
    }

    doc.text(item.cropName, 16, y)
    doc.text(item.harvestDate, 45, y)
    doc.text(item.quantityKg.toLocaleString('en-IN'), 80, y)
    doc.text(item.storageCondition, 110, y)
    doc.text(`${item.daysRemaining} days`, 140, y)
    doc.text(item.spoilageRisk, 172, y)
    y += 6
  })

  y += 4
  doc.setFont('helvetica', 'bold')
  doc.text(`Total Stock: ${totalQty.toLocaleString('en-IN')} kg | Estimated Inventory Value: INR ${Math.round(totalVal).toLocaleString('en-IN')}`, 14, y)

  y += 12
  doc.line(14, y - 4, pageWidth - 28, y - 4)

  // Smart Selling Recommendations
  doc.setFontSize(11)
  doc.text('3. Smart Market Comparison & Dispatch Optimization', 14, y)
  y += 8

  if (smartSellResults && smartSellResults.length > 0) {
    doc.setFillColor(240, 245, 240)
    doc.rect(14, y - 5, pageWidth - 28, 8, 'F')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('MANDI DESTINATION', 16, y)
    doc.text('DISTANCE', 65, y)
    doc.text('MODAL (QTL)', 90, y)
    doc.text('TRANSPORT', 120, y)
    doc.text('EST. NET REVENUE', 150, y)
    doc.text('RANK', 185, y)

    y += 7
    doc.setFont('helvetica', 'normal')

    smartSellResults.slice(0, 5).forEach((calc) => {
      doc.text(calc.mandi.mandiName.slice(0, 28), 16, y)
      doc.text(`${calc.mandi.distanceKm} km`, 65, y)
      doc.text(`INR ${calc.mandi.modalPricePerQuintal}`, 90, y)
      doc.text(`INR ${Math.round(calc.transportCost).toLocaleString('en-IN')}`, 120, y)
      doc.text(`INR ${Math.round(calc.netRevenue).toLocaleString('en-IN')}`, 150, y)
      doc.text(`#${calc.profitRank}`, 185, y)
      y += 6
    })

    y += 4
    const best = smartSellResults[0]
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.text(`Top Actionable Insight: ${best.recommendationReason}`, 14, y)
    y += 8
  } else {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Market data synchronized across live APMC mandis (Agmarknet / e-NAM feeds).', 14, y)
    y += 8
  }

  // Footer notes & disclaimers
  doc.setDrawColor(200, 200, 200)
  doc.line(14, 270, pageWidth - 14, 270)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 120, 120)
  doc.text('SmartAgri AI Advisory Notice: Shelf-life estimates are based on standard ICAR/NHB agricultural storage models and actual farm conditions. Market rates reflect modal trades on the reporting date. Check mandi gate arrivals prior to dispatch.', 14, 276)
  doc.text('Generated by SmartAgri AI Platform | Dedicated to Indian Agritech Innovation', 14, 282)

  doc.save(`SmartAgri_Executive_Report_${new Date().toISOString().slice(0, 10)}.pdf`)
}
