import type { OnionGradingRules, OnionGradingSummary, OnionItem } from './types'

export const DEFAULT_GRADING_RULES: OnionGradingRules = {
  gradeAMinDiameterMm: 45,
  gradeAMaxDefectPercent: 5.0,
  ursMaxRottenPercent: 2.0,
  ursMaxSproutedPercent: 5.0,
  ursMaxDamagedPercent: 10.0,
  ruleVersion: 'DoCA-NAFED-Config-2026.1',
}

export function computeGrading(
  items: OnionItem[],
  rules: OnionGradingRules = DEFAULT_GRADING_RULES
): { items: OnionItem[]; summary: OnionGradingSummary } {
  const totalCount = items.length

  if (totalCount === 0) {
    return {
      items: [],
      summary: {
        totalCount: 0,
        healthyCount: 0,
        damagedCount: 0,
        rottenCount: 0,
        sproutedCount: 0,
        undersizedCount: 0,
        gradeACount: 0,
        ursCount: 0,
        rejectedCount: 0,
        gradeAPercent: 0,
        ursPercent: 0,
        rejectedPercent: 0,
        rottenPercent: 0,
        sproutedPercent: 0,
        damagedPercent: 0,
        undersizedPercent: 0,
        overallStatus: 'MANUAL_VERIFICATION_REQUIRED',
        qualityScore: 0,
        verdictMessage: 'No onions were detected in the sample. Please upload a clear image of an onion sample batch.',
      },
    }
  }

  let healthyCount = 0
  let damagedCount = 0
  let rottenCount = 0
  let sproutedCount = 0
  let undersizedCount = 0

  const processedItems: OnionItem[] = items.map((item) => {
    const isUndersized = item.estimatedDiameterMm < rules.gradeAMinDiameterMm || item.sizeCategory === 'UNDERSIZED'
    const isRotten = item.condition === 'ROTTEN'
    const isSprouted = item.condition === 'SPROUTED'
    const isDamaged = item.condition === 'DAMAGED'
    const isHealthy = item.condition === 'HEALTHY' && !isUndersized

    if (isRotten) rottenCount++
    if (isSprouted) sproutedCount++
    if (isDamaged) damagedCount++
    if (isUndersized) undersizedCount++
    if (isHealthy) healthyCount++

    let status: OnionItem['qualityStatus'] = 'GRADE_A'
    let reason = ''

    if (isRotten) {
      status = 'REJECTED'
      reason = 'Rotten: Soft decay patch or fungal discoloration'
    } else if (isSprouted) {
      status = 'URS'
      reason = 'Sprouted: Green shoot emerging from neck'
    } else if (isDamaged) {
      status = 'URS'
      reason = 'Damaged: Physical cut, neck injury, or skin tear'
    } else if (isUndersized) {
      status = 'URS'
      reason = `Undersized: Estimated diameter ${Math.round(item.estimatedDiameterMm)}mm (< ${rules.gradeAMinDiameterMm}mm threshold)`
    } else {
      status = 'GRADE_A'
      reason = `Grade A: Firm onion, diameter ${Math.round(item.estimatedDiameterMm)}mm, healthy outer tunic`
    }

    return {
      ...item,
      sizeCategory: isUndersized ? 'UNDERSIZED' : item.sizeCategory,
      qualityStatus: status,
      defectReason: item.defectReason || reason,
    }
  })

  // Grade A onions = Healthy AND Size >= Min Size
  const gradeACount = processedItems.filter((i) => i.qualityStatus === 'GRADE_A').length
  const ursCount = processedItems.filter((i) => i.qualityStatus === 'URS').length
  const rejectedCount = processedItems.filter((i) => i.qualityStatus === 'REJECTED').length

  const gradeAPercent = Number(((gradeACount / totalCount) * 100).toFixed(1))
  const ursPercent = Number(((ursCount / totalCount) * 100).toFixed(1))
  const rejectedPercent = Number(((rejectedCount / totalCount) * 100).toFixed(1))

  const rottenPercent = Number(((rottenCount / totalCount) * 100).toFixed(1))
  const sproutedPercent = Number(((sproutedCount / totalCount) * 100).toFixed(1))
  const damagedPercent = Number(((damagedCount / totalCount) * 100).toFixed(1))
  const undersizedPercent = Number(((undersizedCount / totalCount) * 100).toFixed(1))

  let overallStatus: OnionGradingSummary['overallStatus'] = 'GRADE_A_ACCEPTED'
  let verdictMessage = ''

  if (rottenPercent > rules.ursMaxRottenPercent) {
    overallStatus = 'BATCH_REJECTED'
    verdictMessage = `Batch rejected due to high rotten count (${rottenPercent}% > ${rules.ursMaxRottenPercent}% limit).`
  } else if (gradeAPercent >= 70 && rejectedPercent <= 3.0) {
    overallStatus = 'GRADE_A_ACCEPTED'
    verdictMessage = `Batch accepted as Grade A (${gradeAPercent}% Grade A, ${ursPercent}% URS).`
  } else if (rejectedPercent <= 5.0) {
    overallStatus = 'URS_ACCEPTED'
    verdictMessage = `Batch accepted as URS (Under-Size / Secondary Procurement) (${gradeAPercent}% Grade A, ${ursPercent}% URS).`
  } else {
    overallStatus = 'BATCH_REJECTED'
    verdictMessage = `Batch rejected due to excessive defects (${rejectedPercent}% rejected/rotten).`
  }

  // Quality score formula: 100 - (rotten% * 5 + sprouted% * 2 + damaged% * 1.5 + undersized% * 0.8)
  const penalty = rottenPercent * 5 + sproutedPercent * 2 + damagedPercent * 1.5 + (undersizedCount / totalCount) * 80
  const qualityScore = Math.max(0, Math.min(100, Math.round(100 - penalty)))

  return {
    items: processedItems,
    summary: {
      totalCount,
      healthyCount,
      damagedCount,
      rottenCount,
      sproutedCount,
      undersizedCount,
      gradeACount,
      ursCount,
      rejectedCount,
      gradeAPercent,
      ursPercent,
      rejectedPercent,
      rottenPercent,
      sproutedPercent,
      damagedPercent,
      undersizedPercent,
      overallStatus,
      qualityScore,
      verdictMessage,
    },
  }
}
