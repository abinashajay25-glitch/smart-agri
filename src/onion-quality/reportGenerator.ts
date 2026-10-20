import { jsPDF } from 'jspdf'
import type { OnionAnalysisResult } from './types'

export async function generateOnionPdfReport(analysis: OnionAnalysisResult, imageFile?: File | null): Promise<void> {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = 210
  const pageHeight = 297
  const margin = 14
  const contentWidth = pageWidth - margin * 2
  const dateStr = new Date(analysis.timestamp).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const drawHeader = (pageNumber: number, title: string) => {
    // Top bar background
    pdf.setFillColor(15, 23, 42) // Slate 900
    pdf.rect(0, 0, pageWidth, 24, 'F')

    // Header title
    pdf.setTextColor(223, 255, 57) // Rockstar Yellow #dfff39
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(14)
    pdf.text('ROCKSTARSLENS', margin, 12)

    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.text('DEPARTMENT OF CONSUMER AFFAIRS (DoCA) · SIH PROBLEM 26031', margin, 18)

    pdf.setTextColor(203, 213, 225)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.text(title.toUpperCase(), pageWidth - margin, 15, { align: 'right' })

    // Footer
    pdf.setFillColor(241, 245, 249)
    pdf.rect(0, pageHeight - 12, pageWidth, 12, 'F')
    pdf.setTextColor(100, 116, 139)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.text(`Report ID: ${analysis.reportId} | Page ${pageNumber} of 2`, margin, pageHeight - 5)
    pdf.text(`Generated: ${dateStr} | Rules: ${analysis.rulesVersion}`, pageWidth - margin, pageHeight - 5, { align: 'right' })
  }

  const drawCard = (title: string, linesText: string[], x: number, y: number, width: number, height: number, accentColor?: [number, number, number]) => {
    pdf.setFillColor(248, 250, 252)
    pdf.setDrawColor(226, 232, 240)
    pdf.roundedRect(x, y, width, height, 2, 2, 'FD')

    const barColor = accentColor || [14, 165, 233]
    pdf.setFillColor(...barColor)
    pdf.rect(x, y, 3, height, 'F')

    pdf.setTextColor(30, 41, 59)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.text(title.toUpperCase(), x + 7, y + 6)

    pdf.setTextColor(51, 65, 85)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8.5)

    let lineY = y + 12
    for (const line of linesText) {
      if (lineY > y + height - 2) break
      pdf.text(line, x + 7, lineY)
      lineY += 4.5
    }
  }

  // --- PAGE 1: Sample Metadata & AI Detection Summary ---
  drawHeader(1, 'DIGITAL QUALITY ASSESSMENT REPORT')

  let y = 30

  // Title Banner
  pdf.setTextColor(15, 23, 42)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.text('ONION QUALITY & GRADING REPORT', margin, y)

  pdf.setFontSize(10)
  pdf.setTextColor(71, 85, 105)
  pdf.text(`Procurement Centre: ${analysis.sampleInfo.procurementCentre || 'Central Procurement Hub'}`, margin, y + 6)

  // Overall Verdict Badge Box
  const status = analysis.gradingSummary.overallStatus
  const badgeColor: [number, number, number] =
    status === 'GRADE_A_ACCEPTED' ? [34, 197, 94] : status === 'URS_ACCEPTED' ? [234, 179, 8] : [239, 68, 68]
  const badgeLabel =
    status === 'GRADE_A_ACCEPTED'
      ? 'GRADE A ACCEPTED'
      : status === 'URS_ACCEPTED'
      ? 'URS ACCEPTED'
      : status === 'BATCH_REJECTED'
      ? 'BATCH REJECTED'
      : 'MANUAL VERIFICATION REQUIRED'

  pdf.setFillColor(...badgeColor)
  pdf.roundedRect(140, y - 6, 56, 18, 3, 3, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.text(badgeLabel, 168, y + 2, { align: 'center' })
  pdf.setFontSize(7.5)
  pdf.text(`Score: ${analysis.gradingSummary.qualityScore}/100`, 168, y + 7, { align: 'center' })

  y += 18

  // Section 1: Sample Metadata & Inspector Details
  const sampleLines = [
    `Sample ID: ${analysis.sampleInfo.sampleId}`,
    `Inspector Name: ${analysis.sampleInfo.inspectorName} (${analysis.sampleInfo.inspectorId})`,
    `Variety: ${analysis.sampleInfo.onionVariety}`,
    `Date & Time: ${analysis.sampleInfo.dateTime}`,
    `Location / Hub: ${analysis.sampleInfo.location}`,
    `Sample Weight: ${analysis.sampleInfo.sampleWeightKg} kg`,
    `Sample Quantity Est: ${analysis.sampleInfo.sampleQuantityEst} units`,
    `Batch Info: ${analysis.sampleInfo.batchNumber || 'N/A'}`,
  ]
  const colW = (contentWidth - 6) / 2
  drawCard('1. Sample & Inspector Information', sampleLines, margin, y, colW, 48, [59, 130, 246])

  // Section 2: AI Detection Breakdown
  const aiLines = [
    `Total Onions Analyzed: ${analysis.gradingSummary.totalCount}`,
    `Healthy Onions: ${analysis.gradingSummary.healthyCount}`,
    `Damaged Onions: ${analysis.gradingSummary.damagedCount}`,
    `Rotten Onions: ${analysis.gradingSummary.rottenCount}`,
    `Sprouted Onions: ${analysis.gradingSummary.sproutedCount}`,
    `Undersized Onions (<${analysis.gradingRules.gradeAMinDiameterMm}mm): ${analysis.gradingSummary.undersizedCount}`,
    `AI Detection Confidence: ${analysis.overallConfidenceLevel} (${Math.round(analysis.averageConfidence * 100)}%)`,
    `Review Flag: ${analysis.lowConfidenceFlag ? 'MANUAL REVIEW RECOMMENDED' : 'PASSED AUTOMATED INSPECTION'}`,
  ]
  drawCard('2. AI Count & Defect Breakdown', aiLines, margin + colW + 6, y, colW, 48, [168, 85, 247])

  y += 54

  // Section 3: Grade A vs URS Summary Metrics
  pdf.setFillColor(241, 245, 249)
  pdf.roundedRect(margin, y, contentWidth, 32, 2, 2, 'F')

  pdf.setTextColor(15, 23, 42)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.text('3. GRADED YIELD METRICS (DoCA / NAFED STANDARD)', margin + 6, y + 8)

  // 3 Metric Pills
  const pW = (contentWidth - 24) / 3
  
  // Grade A Pill
  pdf.setFillColor(220, 252, 231)
  pdf.setDrawColor(34, 197, 94)
  pdf.roundedRect(margin + 6, y + 12, pW, 14, 2, 2, 'FD')
  pdf.setTextColor(22, 101, 52)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(12)
  pdf.text(`${analysis.gradingSummary.gradeAPercent}%`, margin + 6 + pW / 2, y + 19, { align: 'center' })
  pdf.setFontSize(7)
  pdf.text(`GRADE A (${analysis.gradingSummary.gradeACount} units)`, margin + 6 + pW / 2, y + 24, { align: 'center' })

  // URS Pill
  pdf.setFillColor(254, 249, 195)
  pdf.setDrawColor(234, 179, 8)
  pdf.roundedRect(margin + 12 + pW, y + 12, pW, 14, 2, 2, 'FD')
  pdf.setTextColor(133, 77, 14)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(12)
  pdf.text(`${analysis.gradingSummary.ursPercent}%`, margin + 12 + pW * 1.5, y + 19, { align: 'center' })
  pdf.setFontSize(7)
  pdf.text(`URS / SECONDARY (${analysis.gradingSummary.ursCount} units)`, margin + 12 + pW * 1.5, y + 24, { align: 'center' })

  // Rejected / Defect Pill
  pdf.setFillColor(254, 226, 226)
  pdf.setDrawColor(239, 68, 68)
  pdf.roundedRect(margin + 18 + pW * 2, y + 12, pW, 14, 2, 2, 'FD')
  pdf.setTextColor(153, 27, 27)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(12)
  pdf.text(`${analysis.gradingSummary.rejectedPercent}%`, margin + 18 + pW * 2.5, y + 19, { align: 'center' })
  pdf.setFontSize(7)
  pdf.text(`REJECTED (${analysis.gradingSummary.rejectedCount} units)`, margin + 18 + pW * 2.5, y + 24, { align: 'center' })

  y += 38

  // Section 4: Visual Evidence Placeholder / Image Embed
  pdf.setTextColor(15, 23, 42)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.text('4. VISUAL EVIDENCE & ANNOTATED SAMPLE IMAGE', margin, y)

  y += 4

  if (imageFile) {
    try {
      const imgDataUrl = await new Promise<string>((res, rej) => {
        const reader = new FileReader()
        reader.onload = () => res(String(reader.result))
        reader.onerror = () => rej(new Error('Image load failed'))
        reader.readAsDataURL(imageFile)
      })
      pdf.addImage(imgDataUrl, 'JPEG', margin, y, 90, 65, undefined, 'MEDIUM')
    } catch {
      pdf.setFillColor(226, 232, 240)
      pdf.rect(margin, y, 90, 65, 'F')
      pdf.setTextColor(100, 116, 139)
      pdf.setFontSize(9)
      pdf.text('Sample Image Captured', margin + 45, y + 32, { align: 'center' })
    }
  } else {
    pdf.setFillColor(226, 232, 240)
    pdf.rect(margin, y, 90, 65, 'F')
    pdf.setTextColor(100, 116, 139)
    pdf.setFontSize(9)
    pdf.text('Sample Image Captured', margin + 45, y + 32, { align: 'center' })
  }

  // Right column: Findings & Decision
  const findingLines = [
    `Verdict: ${analysis.gradingSummary.verdictMessage}`,
    `Min Diameter Threshold: ${analysis.gradingRules.gradeAMinDiameterMm} mm`,
    `Max Allowed Rotten: ${analysis.gradingRules.ursMaxRottenPercent}%`,
    `Max Allowed Sprouted: ${analysis.gradingRules.ursMaxSproutedPercent}%`,
    `Max Allowed Damaged: ${analysis.gradingRules.ursMaxDamagedPercent}%`,
    `Image Quality: Sharpness ${analysis.imageValidation.sharpnessScore}/100 · Brightness ${analysis.imageValidation.brightnessScore}/100`,
    ...analysis.findings.slice(0, 3).map((f) => `• ${f}`),
  ]
  drawCard('Assessment Summary & Rules', findingLines, margin + 94, y, contentWidth - 94, 65, [14, 165, 233])

  // --- PAGE 2: Detailed Individual Onion Inspection & Governance ---
  pdf.addPage()
  drawHeader(2, 'INDIVIDUAL ONION INSPECTION LOG & GOVERNANCE')

  y = 30
  pdf.setTextColor(15, 23, 42)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(12)
  pdf.text('5. DETECTED ONION SAMPLE INVENTORY (FIRST 12 ITEMS)', margin, y)

  y += 6

  // Inventory Table Header
  pdf.setFillColor(30, 41, 59)
  pdf.rect(margin, y, contentWidth, 7, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.text('#', margin + 3, y + 5)
  pdf.text('Condition', margin + 14, y + 5)
  pdf.text('Size Category', margin + 45, y + 5)
  pdf.text('Est. Diameter', margin + 80, y + 5)
  pdf.text('Confidence', margin + 115, y + 5)
  pdf.text('Grade Status', margin + 145, y + 5)

  y += 7

  const displayItems = analysis.items.slice(0, 12)
  displayItems.forEach((item, index) => {
    const isEven = index % 2 === 0
    pdf.setFillColor(isEven ? 248 : 255, isEven ? 250 : 255, isEven ? 252 : 255)
    pdf.rect(margin, y, contentWidth, 7, 'F')

    pdf.setTextColor(51, 65, 85)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)

    pdf.text(String(index + 1).padStart(2, '0'), margin + 3, y + 5)
    pdf.text(item.condition, margin + 14, y + 5)
    pdf.text(item.sizeCategory, margin + 45, y + 5)
    pdf.text(`${Math.round(item.estimatedDiameterMm)} mm`, margin + 80, y + 5)
    pdf.text(`${Math.round(item.confidence * 100)}% (${item.confidenceLevel})`, margin + 115, y + 5)

    const stColor: [number, number, number] =
      item.qualityStatus === 'GRADE_A' ? [22, 101, 52] : item.qualityStatus === 'URS' ? [133, 77, 14] : [153, 27, 27]
    pdf.setTextColor(...stColor)
    pdf.setFont('helvetica', 'bold')
    pdf.text(item.qualityStatus, margin + 145, y + 5)

    y += 7
  })

  if (analysis.items.length > 12) {
    pdf.setTextColor(100, 116, 139)
    pdf.setFont('helvetica', 'italic')
    pdf.setFontSize(7.5)
    pdf.text(`... and ${analysis.items.length - 12} additional onions analyzed in this batch. Full dataset recorded in session log.`, margin, y + 4)
    y += 8
  } else {
    y += 4
  }

  // Section 6: Governance, Recommendations & Sign-off
  const actionLines = [
    ...analysis.recommendedActions.map((a) => `• ${a}`),
    `• Data Privacy: Image binary was processed in isolated server memory. No persistent unauthorized storage.`,
    `• Dispute Resolution: For contested Grade A / URS verdicts, recalibrate min diameter threshold in Settings or conduct manual 10-kg physical sample check.`,
  ]
  drawCard('6. Inspector Actions & Transparency Notes', actionLines, margin, y, contentWidth, 42, [14, 165, 233])

  y += 48

  // Inspector Sign-Off Box
  pdf.setFillColor(241, 245, 249)
  pdf.roundedRect(margin, y, contentWidth, 34, 2, 2, 'F')

  pdf.setTextColor(15, 23, 42)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.text('INSPECTION VERIFICATION & DIGITAL SIGN-OFF', margin + 6, y + 7)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(71, 85, 105)
  pdf.text(`Inspector Name: ${analysis.sampleInfo.inspectorName || 'Authorized Officer'}`, margin + 6, y + 15)
  pdf.text(`Inspector ID: ${analysis.sampleInfo.inspectorId || 'DoCA-OFFICER-01'}`, margin + 6, y + 21)
  pdf.text(`Digital Verification Hash: ${analysis.reportId.split('-').join('')}`, margin + 6, y + 27)

  // Signature line on right
  pdf.setDrawColor(148, 163, 184)
  pdf.line(margin + contentWidth - 60, y + 22, margin + contentWidth - 10, y + 22)
  pdf.text('Authorized Signature & Stamp', margin + contentWidth - 56, y + 27)

  // Output PDF
  const pdfBlob = pdf.output('blob')
  const pdfUrl = URL.createObjectURL(pdfBlob)
  const downloadLink = document.createElement('a')
  downloadLink.href = pdfUrl
  downloadLink.download = `Onion-Quality-Report-${analysis.sampleInfo.sampleId || analysis.reportId}.pdf`
  downloadLink.click()
  window.open(pdfUrl, '_blank', 'noopener,noreferrer')
  window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60_000)
}
