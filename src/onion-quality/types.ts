export type OnionCondition = 'HEALTHY' | 'DAMAGED' | 'ROTTEN' | 'SPROUTED'

export type OnionSizeCategory = 'UNDERSIZED' | 'MEDIUM' | 'LARGE'

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW'

export interface BoundingBox {
  ymin: number // 0-100 percentage
  xmin: number // 0-100 percentage
  ymax: number // 0-100 percentage
  xmax: number // 0-100 percentage
}

export interface OnionItem {
  id: string
  boundingBox: BoundingBox
  condition: OnionCondition
  sizeCategory: OnionSizeCategory
  estimatedDiameterMm: number
  confidence: number // 0.0 - 1.0
  confidenceLevel: ConfidenceLevel
  qualityStatus: 'GRADE_A' | 'URS' | 'REJECTED'
  defectReason?: string
}

export interface OnionSampleForm {
  procurementCentre: string
  sampleId: string
  inspectorName: string
  inspectorId: string
  dateTime: string
  onionVariety: string
  location: string
  sampleWeightKg: number
  sampleQuantityEst: number
  batchNumber?: string
  notes?: string
}

export interface OnionGradingRules {
  gradeAMinDiameterMm: number // Default: 45mm
  gradeAMaxDefectPercent: number // Default: 5.0%
  ursMaxRottenPercent: number // Default: 2.0%
  ursMaxSproutedPercent: number // Default: 5.0%
  ursMaxDamagedPercent: number // Default: 10.0%
  ruleVersion: string
}

export interface OnionGradingSummary {
  totalCount: number
  healthyCount: number
  damagedCount: number
  rottenCount: number
  sproutedCount: number
  undersizedCount: number
  
  gradeACount: number
  ursCount: number
  rejectedCount: number
  
  gradeAPercent: number
  ursPercent: number
  rejectedPercent: number
  rottenPercent: number
  sproutedPercent: number
  damagedPercent: number
  undersizedPercent: number
  
  overallStatus: 'GRADE_A_ACCEPTED' | 'URS_ACCEPTED' | 'BATCH_REJECTED' | 'MANUAL_VERIFICATION_REQUIRED'
  qualityScore: number // 0-100
  verdictMessage: string
}

export interface ImageQualityValidation {
  isValid: boolean
  brightnessScore: number // 0-100
  sharpnessScore: number // 0-100
  isBlurry: boolean
  hasOverlappingOnions: boolean
  isLightingPoor: boolean
  warnings: string[]
}

export interface OnionAnalysisResult {
  reportId: string
  timestamp: string
  provider: string
  modelVersion: string
  rulesVersion: string
  imageValidation: ImageQualityValidation
  sampleInfo: OnionSampleForm
  items: OnionItem[]
  gradingSummary: OnionGradingSummary
  gradingRules: OnionGradingRules
  averageConfidence: number
  lowConfidenceFlag: boolean
  overallConfidenceLevel: ConfidenceLevel
  findings: string[]
  recommendedActions: string[]
}

export interface OnionAnalyticsRecord {
  id: string
  reportId: string
  timestamp: string
  procurementCentre: string
  onionVariety: string
  totalOnions: number
  gradeAPercent: number
  ursPercent: number
  rottenPercent: number
  sproutedPercent: number
  damagedPercent: number
  undersizedPercent: number
  overallStatus: string
}
