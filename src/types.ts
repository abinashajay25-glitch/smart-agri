export interface UserProfile {
  id: string
  name: string
  phone: string
  email: string
  location: string // e.g. "Nashik, Maharashtra" or "Coimbatore, Tamil Nadu"
  state: string
  district?: string
  preferredLanguage: 'en' | 'ta' | 'hi'
  farmSizeAcres: number
  primaryCrops: string[]
  storageType: 'traditional_shed' | 'ventilated_warehouse' | 'cold_storage' | 'silo'
  farmerCategory?: 'Marginal (< 2.5 acres)' | 'Small (2.5 - 5 acres)' | 'Medium (5 - 10 acres)' | 'Large (> 10 acres)'
  socialCategory?: 'General' | 'OBC' | 'SC' | 'ST'
  gender?: 'Male' | 'Female' | 'Other'
}

export interface InventoryItem {
  id: string
  cropName: string
  variety?: string
  harvestDate: string // YYYY-MM-DD
  quantityKg: number
  storageLocation: string
  storageCondition: 'ambient' | 'ventilated' | 'cold_storage' | 'dry_shed'
  temperatureC?: number
  humidityPercent?: number
  estimatedShelfLifeDays: number
  daysRemaining: number
  spoilageRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  estimatedMarketPricePerKg: number
  notes?: string
  lastCheckedDate: string
}

export interface CropScanResult {
  id: string
  timestamp: string
  cropName: string
  variety?: string
  confidence: number // 0 - 1
  healthCondition: 'HEALTHY' | 'PEST_INFESTED' | 'FUNGAL_DISEASE' | 'DEFICIENT' | 'DAMAGED' | 'ROTTEN' | 'SPROUTED'
  conditionDetails: string
  recommendedAction: string
  urgencyLevel: 'LOW' | 'MODERATE' | 'URGENT' | 'CRITICAL'
  storageGuidance: string
  shelfLifeEstimateDays: number
  marketRecommendation: string
  imageUrl?: string
  provider: string
}

export interface MarketPriceRecord {
  id: string
  mandiName: string
  district: string
  state: string
  commodity: string
  variety: string
  grade: string
  minPricePerQuintal: number
  maxPricePerQuintal: number
  modalPricePerQuintal: number // 1 quintal = 100 kg
  pricePerKg: number
  arrivalQuantityTonnes: number
  date: string
  isVerified: boolean
  source: string // e.g., "e-NAM / Agmarknet Live"
  distanceKm: number
  estimatedTransportCostPerQuintal: number
}

export interface PriceForecastPoint {
  date: string
  historicalActual?: number // ₹ per quintal
  predictedPrice: number // ₹ per quintal
  confidenceLower: number
  confidenceUpper: number
  trend: 'UPWARD' | 'STABLE' | 'DOWNWARD'
}

export interface SmartSellCalculation {
  mandi: MarketPriceRecord
  cropName: string
  quantityKg: number
  grossRevenue: number
  transportCost: number
  mandiCessAndLoading: number
  packagingCost: number
  netRevenue: number
  netPricePerKg: number
  profitRank: number
  recommendationScore: number // 0 - 100
  urgencyFactor: string
  recommendationReason: string
}

export interface WeatherData {
  city: string
  temperature: number
  feelsLike: number
  humidity: number
  condition: string
  forecast: {
    day: string
    temp: number
    condition: string
    rainProb: number
    advisory: string
  }[]
  agriAdvisory: string
  storageRiskAlert: string
}

export interface NotificationItem {
  id: string
  title: string
  titleTa?: string
  message: string
  messageTa?: string
  type: 'WARNING' | 'ALERT' | 'INFO' | 'SUCCESS'
  date: string
  read: boolean
  linkTarget?: string
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  text: string
  audioUrl?: string
  timestamp: string
  language: 'en' | 'ta'
}

// -------------------------------------------------------------
// MODULE 1: COMMUNITY
// -------------------------------------------------------------
export interface CommunityComment {
  id: string
  authorId: string
  authorName: string
  authorDistrict: string
  text: string
  createdAt: string
  isExpert?: boolean
  verifiedExpertBadge?: boolean
}

export interface CommunityPost {
  id: string
  authorId: string
  authorName: string
  authorDistrict: string
  authorCrops: string[]
  isVerifiedExpert?: boolean
  expertTitle?: string
  title: string
  content: string
  category: 'Crop Tips' | 'Seed & Equipment' | 'Group Selling' | 'Market Discussion' | 'Pest & Health' | 'General Q&A'
  language: 'en' | 'ta'
  likes: string[] // user IDs
  comments: CommunityComment[]
  reports: string[] // user IDs who reported
  createdAt: string
  updatedAt?: string
  imageUrl?: string
}

// -------------------------------------------------------------
// MODULE 2: GOVERNMENT SCHEMES
// -------------------------------------------------------------
export interface GovtScheme {
  id: string
  name: string
  nameTa: string
  category: 'Financial Assistance' | 'Crop Insurance' | 'Irrigation & Subsidies' | 'Inputs & Machinery' | 'Storage & Cold Chain'
  scope: 'Central' | 'State'
  stateApplicable: string // 'All India' or specific state e.g., 'Tamil Nadu', 'Maharashtra'
  targetCrops: string[]
  minLandholdingAcres?: number
  maxLandholdingAcres?: number
  benefits: string
  benefitsTa: string
  eligibilityCriteria: string[]
  requiredDocuments: string[]
  applicationSteps: string[]
  applicationDeadline: string // e.g. "Ongoing (Financial Year 2026-27)" or specific date
  officialPortalUrl: string
  portalName: string
  lastVerifiedDate: string
  officialDisclaimer: string
}

// -------------------------------------------------------------
// MODULE 3: CROP INSURANCE & DAMAGE CLAIMS
// -------------------------------------------------------------
export interface InsurancePolicy {
  id: string
  userId: string
  schemeName: string // e.g. "PM Fasal Bima Yojana (PMFBY)" or "State Crop Insurance"
  policyNumber: string
  insurerName: string
  cropName: string
  insuredAreaAcres: number
  sumInsuredINR: number
  premiumPaidINR: number
  season: 'Kharif' | 'Rabi' | 'Zaid' | 'Annual Commercial'
  year: number
  coverageStartDate: string
  coverageEndDate: string
  intimationDeadlineHours: number // usually 72 hours under PMFBY
  status: 'ACTIVE' | 'EXPIRED' | 'CLAIMED'
}

export interface DamageClaim {
  id: string
  userId: string
  policyId?: string
  cropName: string
  damageDate: string
  affectedAreaAcres: number
  causeOfDamage: 'Hailstorm' | 'Inundation/Flood' | 'Post-Harvest Rains' | 'Pest/Disease Outbreak' | 'Drought' | 'Landslide' | 'Cyclone'
  description: string
  photoUrls?: string[]
  claimStatus: 'INTIMATED' | 'SURVEY_SCHEDULED' | 'ASSESSMENT_COMPLETED' | 'SETTLEMENT_APPROVED' | 'DISBURSED' | 'REJECTED'
  claimStatusNotes?: string
  surveyDateScheduled?: string
  claimReferenceNumber: string
  requiredChecklist: { document: string; completed: boolean }[]
  createdAt: string
  lastUpdated: string
}

// -------------------------------------------------------------
// MODULE 4: EXPENSE SCANNER & FARM FINANCIALS
// -------------------------------------------------------------
export type ExpenseCategory = 'Seeds' | 'Fertilizers & Pesticides' | 'Labor & Wages' | 'Machinery & Fuel' | 'Irrigation & Electricity' | 'Transport & Mandi Freight' | 'Storage & Bags' | 'Other'

export interface ExpenseItemLine {
  description: string
  quantity?: number
  unit?: string
  rate?: number
  total: number
}

export interface FarmExpense {
  id: string
  userId: string
  vendorName: string
  invoiceNumber?: string
  date: string // YYYY-MM-DD
  category: ExpenseCategory
  cropAssociated: string // e.g. 'Tomato', 'Onion', 'General Farm'
  season: 'Kharif 2026' | 'Rabi 2026-27' | 'Summer 2026' | 'All Year'
  amountINR: number
  lineItems: ExpenseItemLine[]
  receiptImageUrl?: string
  ocrConfidence?: number
  isManuallyVerified: boolean
  notes?: string
  createdAt: string
}

// -------------------------------------------------------------
// MODULE 5: FARM BUSINESS PLANNER & COPILOT
// -------------------------------------------------------------
export interface FarmingTask {
  id: string
  title: string
  titleTa: string
  dueDate: string
  category: 'Irrigation' | 'Nutrient Management' | 'Harvesting' | 'Storage Check' | 'Market Dispatch'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  completed: boolean
  cropName: string
}

export interface CropBudgetPlan {
  cropName: string
  targetYieldQuintals: number
  estimatedSalePriceQuintal: number
  conservativePriceQuintal: number
  optimisticPriceQuintal: number
  budgetedExpenses: {
    seeds: number
    fertilizers: number
    labor: number
    irrigation: number
    machinery: number
    transport: number
  }
}
