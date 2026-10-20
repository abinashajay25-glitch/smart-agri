import { InventoryItem, MarketPriceRecord, SmartSellCalculation, PriceForecastPoint, WeatherData } from './types'
import { CROP_SHELF_LIFE_RULES } from './mockAgriData'

/**
 * Calculates remaining shelf life and spoilage risk based on crop, harvest date, and storage condition
 */
export const calculateShelfLife = (
  cropName: string,
  harvestDateStr: string,
  storageCondition: 'ambient' | 'ventilated' | 'cold_storage' | 'dry_shed'
): {
  totalShelfLifeDays: number
  daysRemaining: number
  daysElapsed: number
  spoilageRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  riskPercentage: number
  advisory: string
} => {
  const rules = CROP_SHELF_LIFE_RULES[cropName] || {
    ambientDays: 7,
    ventilatedDays: 14,
    coldStorageDays: 30,
    dryShedDays: 12,
    tempOptimal: '15°C - 20°C',
    humidityOptimal: '75%',
    spoilageSigns: 'Softening, loss of color, mold',
  }

  let totalShelfLifeDays = rules.ambientDays
  if (storageCondition === 'ventilated') totalShelfLifeDays = rules.ventilatedDays
  if (storageCondition === 'cold_storage') totalShelfLifeDays = rules.coldStorageDays
  if (storageCondition === 'dry_shed') totalShelfLifeDays = rules.dryShedDays

  const harvestTime = new Date(harvestDateStr).getTime()
  const now = Date.now()
  const daysElapsed = Math.max(0, Math.floor((now - harvestTime) / (1000 * 60 * 60 * 24)))
  const daysRemaining = Math.max(0, totalShelfLifeDays - daysElapsed)

  const remainingRatio = totalShelfLifeDays > 0 ? daysRemaining / totalShelfLifeDays : 0
  let spoilageRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW'
  let riskPercentage = 0

  if (daysRemaining <= 1) {
    spoilageRisk = 'CRITICAL'
    riskPercentage = 95
  } else if (remainingRatio <= 0.3) {
    spoilageRisk = 'HIGH'
    riskPercentage = 75
  } else if (remainingRatio <= 0.6) {
    spoilageRisk = 'MEDIUM'
    riskPercentage = 45
  } else {
    spoilageRisk = 'LOW'
    riskPercentage = 15
  }

  let advisory = `Stored in ${storageCondition.replace('_', ' ')}. Maintain ${rules.tempOptimal} & ${rules.humidityOptimal}.`
  if (spoilageRisk === 'CRITICAL' || spoilageRisk === 'HIGH') {
    advisory = `Immediate liquidation recommended! Watch out for: ${rules.spoilageSigns}.`
  }

  return {
    totalShelfLifeDays,
    daysRemaining,
    daysElapsed,
    spoilageRisk,
    riskPercentage,
    advisory,
  }
}

/**
 * Calculates net revenue, transport costs, and ranks market destinations
 */
export const calculateSmartSelling = (
  cropName: string,
  quantityKg: number,
  markets: MarketPriceRecord[],
  spoilageRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW',
  customDieselRate = 94.5
): SmartSellCalculation[] => {
  const filtered = markets.filter(m => m.commodity.toLowerCase().includes(cropName.toLowerCase()))
  const candidates = filtered.length > 0 ? filtered : markets.slice(0, 4)

  const calculations: SmartSellCalculation[] = candidates.map(mandi => {
    // 1 quintal = 100 kg
    const quintals = quantityKg / 100
    const grossRevenue = quintals * mandi.modalPricePerQuintal

    // Estimated transport: (Distance * base fuel factor + handling per quintal)
    const transportPerQuintal = mandi.estimatedTransportCostPerQuintal || Math.max(50, mandi.distanceKm * 0.85)
    const transportCost = quintals * transportPerQuintal

    // Mandi market cess (usually 1.0% to 1.5% in APMC) + weighing & porterage
    const mandiCessAndLoading = grossRevenue * 0.015 + quintals * 25
    const packagingCost = quintals * 20 // standard gunny bags/crates

    const netRevenue = Math.max(0, grossRevenue - (transportCost + mandiCessAndLoading + packagingCost))
    const netPricePerKg = quantityKg > 0 ? netRevenue / quantityKg : 0

    // Urgency adjustment: If crop is at high spoilage risk, penalize distant mandis
    let distancePenalty = 0
    if (spoilageRisk === 'CRITICAL' && mandi.distanceKm > 50) {
      distancePenalty = 40
    } else if (spoilageRisk === 'HIGH' && mandi.distanceKm > 100) {
      distancePenalty = 25
    }

    // Recommendation Score: 0 - 100 based on net price and logistics feasibility
    let recommendationScore = Math.min(100, Math.round((netPricePerKg / (mandi.pricePerKg || 1)) * 100 - distancePenalty))
    if (recommendationScore < 20) recommendationScore = 20

    let recommendationReason = `Strong net realization ₹${netPricePerKg.toFixed(1)}/kg after ₹${Math.round(transportCost).toLocaleString('en-IN')} freight.`
    if (distancePenalty > 0) {
      recommendationReason = `High distance (${mandi.distanceKm} km) carries transit decay risk for high-urgency stock.`
    }

    return {
      mandi,
      cropName,
      quantityKg,
      grossRevenue,
      transportCost,
      mandiCessAndLoading,
      packagingCost,
      netRevenue,
      netPricePerKg,
      profitRank: 1,
      recommendationScore,
      urgencyFactor: spoilageRisk,
      recommendationReason,
    }
  })

  // Rank by highest net revenue
  calculations.sort((a, b) => b.netRevenue - a.netRevenue)
  calculations.forEach((c, idx) => {
    c.profitRank = idx + 1
  })

  return calculations
}

/**
 * Generates historical and 7-day predictive pricing curve using seasonal baseline
 */
export const generatePriceForecast = (cropName: string, basePriceQuintal = 3200): PriceForecastPoint[] => {
  const points: PriceForecastPoint[] = []
  const today = new Date()

  // 7 days historical
  for (let i = 7; i >= 1; i--) {
    const d = new Date(today.getTime() - i * 24 * 3600 * 1000)
    const variance = Math.sin(i * 0.8) * 120 + (i % 2 === 0 ? 40 : -30)
    const price = Math.round(basePriceQuintal + variance)
    points.push({
      date: d.toISOString().slice(5, 10), // MM-DD
      historicalActual: price,
      predictedPrice: price,
      confidenceLower: price - 80,
      confidenceUpper: price + 80,
      trend: variance > 0 ? 'UPWARD' : 'STABLE',
    })
  }

  // Today
  points.push({
    date: 'Today',
    historicalActual: basePriceQuintal,
    predictedPrice: basePriceQuintal,
    confidenceLower: basePriceQuintal - 60,
    confidenceUpper: basePriceQuintal + 60,
    trend: 'STABLE',
  })

  // Next 7 days forecast
  let running = basePriceQuintal
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today.getTime() + i * 24 * 3600 * 1000)
    // slight upward or seasonal curve
    running += Math.round((Math.sin(i * 0.6) * 50) + 15)
    const uncertainty = i * 45 // uncertainty expands with forecast horizon
    points.push({
      date: d.toISOString().slice(5, 10),
      predictedPrice: running,
      confidenceLower: running - uncertainty,
      confidenceUpper: running + uncertainty,
      trend: running > basePriceQuintal ? 'UPWARD' : 'DOWNWARD',
    })
  }

  return points
}

/**
 * Fetch simulated / real regional weather data with agricultural advisory
 */
export const getAgriculturalWeather = (location = 'Tamil Nadu / Nashik'): WeatherData => {
  return {
    city: location,
    temperature: 31,
    feelsLike: 34,
    humidity: 71,
    condition: 'Partly Cloudy with Scattered Showers',
    forecast: [
      { day: 'Mon', temp: 31, condition: 'Partly Cloudy', rainProb: 20, advisory: 'Safe for open field harvest' },
      { day: 'Tue', temp: 32, condition: 'Sunny', rainProb: 10, advisory: 'Optimal for sun drying grains' },
      { day: 'Wed', temp: 29, condition: 'Scattered Rain', rainProb: 65, advisory: 'Cover open crop stock; high humidity risk' },
      { day: 'Thu', temp: 28, condition: 'Light Rain', rainProb: 45, advisory: 'Inspect warehouse ventilation' },
      { day: 'Fri', temp: 30, condition: 'Partly Cloudy', rainProb: 30, advisory: 'Good transport conditions to mandis' },
      { day: 'Sat', temp: 32, condition: 'Sunny & Warm', rainProb: 15, advisory: 'Favorable wholesale trading conditions' },
    ],
    agriAdvisory: 'Mid-week rains predicted in southern belt. Farmers holding perishable produce like tomatoes or chillies in open sheds should expedite market transport or seal tarpaulins to prevent fungal decay.',
    storageRiskAlert: 'Elevated relative humidity (> 75%) expected Wednesday. Ensure mechanical ventilation in onion and grain godowns is active during non-rain intervals.',
  }
}
