import { MarketPriceRecord, InventoryItem, UserProfile } from './types'

export const DEFAULT_USER: UserProfile = {
  id: 'farmer_tn_01',
  name: 'Muthuvel Karunanidhi / Ramesh Patel',
  phone: '+91 98421 78940',
  email: 'ramesh.farmer@smartagri.org',
  location: 'Dindigul / Nashik Region',
  state: 'Tamil Nadu & Maharashtra Belt',
  preferredLanguage: 'en',
  farmSizeAcres: 6.5,
  primaryCrops: ['Tomato', 'Onion', 'Paddy / Rice', 'Cotton', 'Chilli'],
  storageType: 'ventilated_warehouse',
}

export const CROP_SHELF_LIFE_RULES: Record<string, {
  ambientDays: number
  ventilatedDays: number
  coldStorageDays: number
  dryShedDays: number
  tempOptimal: string
  humidityOptimal: string
  spoilageSigns: string
}> = {
  'Tomato': {
    ambientDays: 5,
    ventilatedDays: 9,
    coldStorageDays: 24,
    dryShedDays: 7,
    tempOptimal: '12°C - 15°C',
    humidityOptimal: '85% - 90%',
    spoilageSigns: 'Softening at stem end, watery lesions, mold spots, sour odor',
  },
  'Onion': {
    ambientDays: 25,
    ventilatedDays: 65,
    coldStorageDays: 140,
    dryShedDays: 45,
    tempOptimal: '25°C - 30°C (ventilated) or 0°C - 2°C (cold storage)',
    humidityOptimal: '65% - 70%',
    spoilageSigns: 'Neck sprouting, soft neck rot, black mold spores under wrapper',
  },
  'Potato': {
    ambientDays: 20,
    ventilatedDays: 50,
    coldStorageDays: 160,
    dryShedDays: 35,
    tempOptimal: '7°C - 10°C',
    humidityOptimal: '90% - 95%',
    spoilageSigns: 'Greening (solanine), sprouting buds, wet rot, bacterial slime',
  },
  'Paddy / Rice': {
    ambientDays: 180,
    ventilatedDays: 300,
    coldStorageDays: 450,
    dryShedDays: 240,
    tempOptimal: '20°C - 25°C',
    humidityOptimal: '< 13% grain moisture',
    spoilageSigns: 'Musty mildew odor, grain weevil presence, discoloration',
  },
  'Cotton': {
    ambientDays: 120,
    ventilatedDays: 210,
    coldStorageDays: 360,
    dryShedDays: 180,
    tempOptimal: '18°C - 24°C',
    humidityOptimal: '< 8% lint moisture',
    spoilageSigns: 'Yellowing, fiber weakness, bacterial stain, mildew clumps',
  },
  'Chilli (Green)': {
    ambientDays: 4,
    ventilatedDays: 8,
    coldStorageDays: 18,
    dryShedDays: 6,
    tempOptimal: '8°C - 10°C',
    humidityOptimal: '90% - 95%',
    spoilageSigns: 'Shrinking, wrinkling calyx, anthracnose sunken dark lesions',
  },
  'Wheat': {
    ambientDays: 210,
    ventilatedDays: 360,
    coldStorageDays: 540,
    dryShedDays: 300,
    tempOptimal: '18°C - 22°C',
    humidityOptimal: '< 12% moisture',
    spoilageSigns: 'Weevil powder, heated kernel clumps, fungus odor',
  },
}

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-01',
    cropName: 'Tomato',
    variety: 'Shivam Hybrid',
    harvestDate: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    quantityKg: 850,
    storageLocation: 'Primary Farm Crates',
    storageCondition: 'ventilated',
    temperatureC: 22,
    humidityPercent: 82,
    estimatedShelfLifeDays: 9,
    daysRemaining: 6,
    spoilageRisk: 'MEDIUM',
    estimatedMarketPricePerKg: 34,
    notes: 'Pick harvested at breaker stage; needs sale before weekend',
    lastCheckedDate: new Date().toISOString().slice(0, 10),
  },
  {
    id: 'inv-02',
    cropName: 'Onion',
    variety: 'Nashik Red / Bellary',
    harvestDate: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    quantityKg: 4200,
    storageLocation: 'Kanda Chawl Warehouse #2',
    storageCondition: 'ventilated',
    temperatureC: 26,
    humidityPercent: 68,
    estimatedShelfLifeDays: 65,
    daysRemaining: 47,
    spoilageRisk: 'LOW',
    estimatedMarketPricePerKg: 28,
    notes: 'Well cured, zero sprouting observed during weekly grading check',
    lastCheckedDate: new Date().toISOString().slice(0, 10),
  },
  {
    id: 'inv-03',
    cropName: 'Chilli (Green)',
    variety: 'G4 Hot Pepper',
    harvestDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    quantityKg: 320,
    storageLocation: 'Packhouse Bay 1',
    storageCondition: 'ambient',
    temperatureC: 29,
    humidityPercent: 74,
    estimatedShelfLifeDays: 4,
    daysRemaining: 2,
    spoilageRisk: 'HIGH',
    estimatedMarketPricePerKg: 62,
    notes: 'Ambient storage causing rapid moisture loss. Critical to dispatch today.',
    lastCheckedDate: new Date().toISOString().slice(0, 10),
  },
  {
    id: 'inv-04',
    cropName: 'Paddy / Rice',
    variety: 'IR-64 Super Fine',
    harvestDate: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    quantityKg: 6500,
    storageLocation: 'Grain Bin Central',
    storageCondition: 'dry_shed',
    temperatureC: 24,
    humidityPercent: 12,
    estimatedShelfLifeDays: 240,
    daysRemaining: 200,
    spoilageRisk: 'LOW',
    estimatedMarketPricePerKg: 24.5,
    notes: 'Moisture content tested at 12.1%. Safe for extended hold.',
    lastCheckedDate: new Date().toISOString().slice(0, 10),
  },
]

export const VERIFIED_MARKET_PRICES: MarketPriceRecord[] = [
  // Tomatoes
  {
    id: 'mkt-tom-01',
    mandiName: 'Dindigul APMC Regulated Market',
    district: 'Dindigul',
    state: 'Tamil Nadu',
    commodity: 'Tomato',
    variety: 'Hybrid Local',
    grade: 'Grade A',
    minPricePerQuintal: 3100,
    maxPricePerQuintal: 3800,
    modalPricePerQuintal: 3500,
    pricePerKg: 35.0,
    arrivalQuantityTonnes: 45,
    date: new Date().toISOString().slice(0, 10),
    isVerified: true,
    source: 'e-NAM / Agmarknet Live Portal',
    distanceKm: 18,
    estimatedTransportCostPerQuintal: 110,
  },
  {
    id: 'mkt-tom-02',
    mandiName: 'Koyambedu Wholesale Terminal',
    district: 'Chennai',
    state: 'Tamil Nadu',
    commodity: 'Tomato',
    variety: 'Desi / Hybrid Mix',
    grade: 'Grade A+',
    minPricePerQuintal: 3700,
    maxPricePerQuintal: 4300,
    modalPricePerQuintal: 4100,
    pricePerKg: 41.0,
    arrivalQuantityTonnes: 180,
    date: new Date().toISOString().slice(0, 10),
    isVerified: true,
    source: 'e-NAM / Agmarknet Live Portal',
    distanceKm: 340,
    estimatedTransportCostPerQuintal: 320,
  },
  {
    id: 'mkt-tom-03',
    mandiName: 'Oddanchatram Vegetable Market',
    district: 'Dindigul',
    state: 'Tamil Nadu',
    commodity: 'Tomato',
    variety: 'Hybrid Special',
    grade: 'Grade A',
    minPricePerQuintal: 3300,
    maxPricePerQuintal: 3900,
    modalPricePerQuintal: 3650,
    pricePerKg: 36.5,
    arrivalQuantityTonnes: 95,
    date: new Date().toISOString().slice(0, 10),
    isVerified: true,
    source: 'State Agricultural Marketing Board',
    distanceKm: 42,
    estimatedTransportCostPerQuintal: 140,
  },
  {
    id: 'mkt-tom-04',
    mandiName: 'Kolar APMC Yard',
    district: 'Kolar',
    state: 'Karnataka',
    commodity: 'Tomato',
    variety: 'Hybrid Heavy',
    grade: 'Grade A',
    minPricePerQuintal: 2900,
    maxPricePerQuintal: 3600,
    modalPricePerQuintal: 3200,
    pricePerKg: 32.0,
    arrivalQuantityTonnes: 420,
    date: new Date().toISOString().slice(0, 10),
    isVerified: true,
    source: 'e-NAM Live',
    distanceKm: 260,
    estimatedTransportCostPerQuintal: 280,
  },
  // Onions
  {
    id: 'mkt-oni-01',
    mandiName: 'Lasalgaon APMC (Asia’s Largest)',
    district: 'Nashik',
    state: 'Maharashtra',
    commodity: 'Onion',
    variety: 'Red Medium (Pol)',
    grade: 'Grade A (55mm+)',
    minPricePerQuintal: 2400,
    maxPricePerQuintal: 3100,
    modalPricePerQuintal: 2850,
    pricePerKg: 28.5,
    arrivalQuantityTonnes: 1250,
    date: new Date().toISOString().slice(0, 10),
    isVerified: true,
    source: 'e-NAM / Lasalgaon APMC Board',
    distanceKm: 85,
    estimatedTransportCostPerQuintal: 130,
  },
  {
    id: 'mkt-oni-02',
    mandiName: 'Pimpalgaon Baswant APMC',
    district: 'Nashik',
    state: 'Maharashtra',
    commodity: 'Onion',
    variety: 'Red Bold',
    grade: 'Super Grade',
    minPricePerQuintal: 2550,
    maxPricePerQuintal: 3250,
    modalPricePerQuintal: 2980,
    pricePerKg: 29.8,
    arrivalQuantityTonnes: 920,
    date: new Date().toISOString().slice(0, 10),
    isVerified: true,
    source: 'e-NAM Live Feeds',
    distanceKm: 45,
    estimatedTransportCostPerQuintal: 95,
  },
  {
    id: 'mkt-oni-03',
    mandiName: 'Vashi Wholesale Market (APMC)',
    district: 'Navi Mumbai',
    state: 'Maharashtra',
    commodity: 'Onion',
    variety: 'Red Dry',
    grade: 'Grade A',
    minPricePerQuintal: 3100,
    maxPricePerQuintal: 3700,
    modalPricePerQuintal: 3450,
    pricePerKg: 34.5,
    arrivalQuantityTonnes: 610,
    date: new Date().toISOString().slice(0, 10),
    isVerified: true,
    source: 'MSAMB / Agmarknet',
    distanceKm: 195,
    estimatedTransportCostPerQuintal: 240,
  },
  // Chillies
  {
    id: 'mkt-chi-01',
    mandiName: 'Guntur Mirchi Yard',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    commodity: 'Chilli (Green)',
    variety: 'Teja / G4 Premium',
    grade: 'Export Grade',
    minPricePerQuintal: 5800,
    maxPricePerQuintal: 6800,
    modalPricePerQuintal: 6400,
    pricePerKg: 64.0,
    arrivalQuantityTonnes: 310,
    date: new Date().toISOString().slice(0, 10),
    isVerified: true,
    source: 'Guntur Agricultural Market Committee',
    distanceKm: 310,
    estimatedTransportCostPerQuintal: 290,
  },
  {
    id: 'mkt-chi-02',
    mandiName: 'Coimbatore Thyagi Kumaran Market',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    commodity: 'Chilli (Green)',
    variety: 'Samba Green',
    grade: 'Grade A Fresh',
    minPricePerQuintal: 5600,
    maxPricePerQuintal: 6400,
    modalPricePerQuintal: 6100,
    pricePerKg: 61.0,
    arrivalQuantityTonnes: 65,
    date: new Date().toISOString().slice(0, 10),
    isVerified: true,
    source: 'TN Agmarknet',
    distanceKm: 120,
    estimatedTransportCostPerQuintal: 160,
  },
  // Paddy
  {
    id: 'mkt-pad-01',
    mandiName: 'Karnal Grain Market',
    district: 'Karnal',
    state: 'Haryana',
    commodity: 'Paddy / Rice',
    variety: '1121 / Fine',
    grade: 'Grade A Clean',
    minPricePerQuintal: 2450,
    maxPricePerQuintal: 2850,
    modalPricePerQuintal: 2650,
    pricePerKg: 26.5,
    arrivalQuantityTonnes: 1400,
    date: new Date().toISOString().slice(0, 10),
    isVerified: true,
    source: 'Haryana Mandi Board e-Kharid',
    distanceKm: 420,
    estimatedTransportCostPerQuintal: 350,
  },
  {
    id: 'mkt-pad-02',
    mandiName: 'Thanjavur Direct Purchase Centre',
    district: 'Thanjavur',
    state: 'Tamil Nadu',
    commodity: 'Paddy / Rice',
    variety: 'ADT 45 / CR 1009',
    grade: 'Common Variety MSP',
    minPricePerQuintal: 2320,
    maxPricePerQuintal: 2450,
    modalPricePerQuintal: 2380,
    pricePerKg: 23.8,
    arrivalQuantityTonnes: 850,
    date: new Date().toISOString().slice(0, 10),
    isVerified: true,
    source: 'TNCSC Procurement Centre',
    distanceKm: 65,
    estimatedTransportCostPerQuintal: 80,
  },
]


// -------------------------------------------------------------
// MODULE 1: COMMUNITY MOCK POSTS
// -------------------------------------------------------------
import { CommunityPost, GovtScheme, InsurancePolicy, DamageClaim, FarmExpense, FarmingTask } from './types'

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    authorId: 'farmer_palanisamy',
    authorName: 'Palanisamy Gounder',
    authorDistrict: 'Dindigul',
    authorCrops: ['Tomato', 'Small Onion'],
    isVerifiedExpert: false,
    title: 'Group Selling: 4 Tons Shivam Hybrid Tomato to Chennai Koyambedu on Thursday',
    content: 'Fellow farmers in Dindigul / Reddiarchatram belt! We have aggregated around 4 tons of grade A Shivam tomatoes. We have arranged a 10-ton Eicher truck leaving Thursday evening. Sharing freight reduces transport from ₹140/qtl to ₹85/qtl. Looking for 2-3 more farmers to fill remaining 2 tons. Post below or join our group!',
    category: 'Group Selling',
    language: 'en',
    likes: ['farmer_tn_01', 'farmer_selvam', 'farmer_karthik'],
    comments: [
      {
        id: 'c-1',
        authorId: 'farmer_tn_01',
        authorName: 'Muthuvel Karunanidhi / Ramesh Patel',
        authorDistrict: 'Dindigul / Nashik',
        text: 'I have 600 kg ready in crates at breaker stage. Would like to join the shipment if crate unloading is handled at Koyambedu gate 4.',
        createdAt: '2026-10-18T14:20:00Z',
      },
      {
        id: 'c-2',
        authorId: 'farmer_palanisamy',
        authorName: 'Palanisamy Gounder',
        authorDistrict: 'Dindigul',
        text: 'Yes brother! Gate 4 commission agent handles crate offloading directly. Let us coordinate loading at 4 PM.',
        createdAt: '2026-10-18T15:10:00Z',
      }
    ],
    reports: [],
    createdAt: '2026-10-18T11:00:00Z'
  },
  {
    id: 'post-2',
    authorId: 'expert_dr_subramanian',
    authorName: 'Dr. R. Subramanian (TNAU Agronomist)',
    authorDistrict: 'Coimbatore',
    authorCrops: ['Horticulture', 'Vegetables'],
    isVerifiedExpert: true,
    expertTitle: 'Retd. Senior Scientist, ICAR-TNAU Extension Center (Verified Credential ID #TNAU-AGR-8842)',
    title: 'Expert Advisory: Early Leaf Curl Management during Sudden Humidity Swings',
    content: 'Recent atmospheric depressions have created sudden micro-climate humidity peaks (>80%) across Western Tamil Nadu and Karnataka borders. For young tomato and chilli saplings, whitefly vectors multiply rapidly. Spray Neem Oil 10,000 ppm @ 3ml/litre mixed with mild surfactant in late afternoon. Avoid excessive urea which causes succulent leaves that invite borer pests.',
    category: 'Pest & Health',
    language: 'en',
    likes: ['farmer_tn_01', 'farmer_arun', 'farmer_vijay', 'farmer_palanisamy'],
    comments: [
      {
        id: 'c-3',
        authorId: 'farmer_tn_01',
        authorName: 'Muthuvel Karunanidhi / Ramesh Patel',
        authorDistrict: 'Dindigul / Nashik',
        text: 'Thank you doctor. Can we mix sticky traps along with this application?',
        createdAt: '2026-10-19T08:30:00Z',
      },
      {
        id: 'c-4',
        authorId: 'expert_dr_subramanian',
        authorName: 'Dr. R. Subramanian (TNAU Agronomist)',
        authorDistrict: 'Coimbatore',
        isExpert: true,
        verifiedExpertBadge: true,
        text: 'Absolutely! Erect 15 yellow sticky traps per acre at crop canopy level. That catches adults before they lay eggs.',
        createdAt: '2026-10-19T09:15:00Z',
      }
    ],
    reports: [],
    createdAt: '2026-10-19T06:45:00Z'
  },
  {
    id: 'post-3',
    authorId: 'farmer_murugan',
    authorName: 'Murugan Thangaraj',
    authorDistrict: 'Thanjavur',
    authorCrops: ['Paddy / Rice'],
    isVerifiedExpert: false,
    title: 'நெல் அறுவடைக்கு பின் வைக்கோல் மேலாண்மை அனுபவங்கள் (Paddy Straw Management)',
    content: 'நண்பர்களே, இம்முறை நெல் அறுவடைக்கு பின் வைக்கோலை எரிக்காமல் ரோட்டாவேட்டர் மூலம் மண்ணில் மக்க வைத்தேன். கூடவே ட்ரைக்கோடெர்மா விரிடி சேர்த்ததால் நிலத்தின் ஈரப்பதம் அருமையாக உள்ளது. அடுத்த பயிருக்கு அடி உரம் தேவை கணிசமாக குறைந்துள்ளது. உங்கள் பகுதியில் இதற்கான உபகரணங்கள் வாடகைக்கு கிடைக்கிறதா?',
    category: 'Crop Tips',
    language: 'ta',
    likes: ['farmer_tn_01', 'farmer_kanagaraj'],
    comments: [
      {
        id: 'c-5',
        authorId: 'farmer_kanagaraj',
        authorName: 'Kanagaraj Velusamy',
        authorDistrict: 'Thanjavur',
        text: 'சி.எச்.சி (Custom Hiring Centre) மூலமாக மானிய வாடகையில் மல்ச்சர் மெஷின் கிடைக்கிறது தோழரே!',
        createdAt: '2026-10-19T10:00:00Z',
      }
    ],
    reports: [],
    createdAt: '2026-10-19T09:30:00Z'
  }
]

// -------------------------------------------------------------
// MODULE 2: VERIFIED GOVERNMENT SCHEMES
// -------------------------------------------------------------
export const VERIFIED_GOVT_SCHEMES: GovtScheme[] = [
  {
    id: 'scheme-pmkisan',
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    nameTa: 'பிரதம மந்திரி கிசான் சம்மான் நிதி (PM-KISAN)',
    category: 'Financial Assistance',
    scope: 'Central',
    stateApplicable: 'All India',
    targetCrops: ['All Crops'],
    minLandholdingAcres: 0.1,
    benefits: '₹6,000 per year direct income support in three equal 4-monthly instalments of ₹2,000 directly transferred to farmer Aadhaar-seeded bank account.',
    benefitsTa: 'ஆண்டுக்கு ₹6,000 நேரடி உதவித்தொகை (தலா ₹2,000 வீதம் 3 தவணைகளில் வங்கி கணக்கில் செலுத்தப்படுகிறது).',
    eligibilityCriteria: [
      'Small and marginal farmer families with cultivable landholding in their name.',
      'Active Aadhaar number linked with land title (ROR / Patta Chitta).',
      'Excludes institutional landholders, income-tax payers, and government employees.'
    ],
    requiredDocuments: [
      'Aadhaar Card (Mandatory biometric e-KYC)',
      'Landholding Proof (Patta / Chitta / 7/12 extract / Khatauni)',
      'Aadhaar-seeded Active Bank Account passbook copy',
      'Valid Mobile number for OTP verification'
    ],
    applicationSteps: [
      'Visit official pmkisan.gov.in portal or nearby CSC (Common Service Centre).',
      'Click on "Farmers Corner" -> "New Farmer Registration".',
      'Enter Aadhaar number, state, district, and land survey details.',
      'Complete Aadhaar e-KYC via OTP or biometric authentication.',
      'Submit application and note Registration Reference Number.'
    ],
    applicationDeadline: 'Continuous & Open (Applications accepted year-round for new eligible landowners)',
    officialPortalUrl: 'https://pmkisan.gov.in',
    portalName: 'PM-KISAN National Portal',
    lastVerifiedDate: '2026-10-15',
    officialDisclaimer: 'Official Source: Ministry of Agriculture & Farmers Welfare, Govt of India. Approval and DBT transfer depend on State Revenue Department land record verification.'
  },
  {
    id: 'scheme-pmfby',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    nameTa: 'பிரதம மந்திரி பயிர் காப்பீட்டு திட்டம் (PMFBY)',
    category: 'Crop Insurance',
    scope: 'Central',
    stateApplicable: 'All India',
    targetCrops: ['Paddy / Rice', 'Tomato', 'Onion', 'Cotton', 'Chilli', 'Wheat', 'Pulses', 'Oilseeds'],
    benefits: 'Comprehensive crop risk cover from pre-sowing to post-harvest. Farmer premium share is heavily subsidized: 2% for Kharif food grains, 1.5% for Rabi crops, and 5% for annual commercial/horticultural crops.',
    benefitsTa: 'விதைப்பு முதல் அறுவடை வரை விரிவான இழப்பீட்டு பாதுகாப்பு. காரீப் பயிர்களுக்கு 2%, ரபி பயிர்களுக்கு 1.5%, தோட்டக்கலை பயிர்களுக்கு 5% குறைந்த பிரீமியம்.',
    eligibilityCriteria: [
      'All farmers growing notified crops in notified insurance units/blocks (both loanee and non-loanee).',
      'Sharecroppers and tenant farmers with valid cultivation declarations are eligible.',
      'Must intimate localized calamities (flood, hailstorm, landslide) within 72 hours of damage.'
    ],
    requiredDocuments: [
      'Land Record Document (Patta / Chitta / Revenue Record / Adangal / Pahani)',
      'Sowing / Crop Cultivation Certificate issued by Village Administrative Officer (VAO) or Gram Sevak',
      'Bank Account Passbook showing IFSC and Account Number',
      'Aadhaar Card copy'
    ],
    applicationSteps: [
      'Access the national PMFBY portal (pmfby.gov.in) or visit nearest Primary Agricultural Credit Society (PACS) / Bank branch.',
      'Select State, Season (Kharif/Rabi), Year, and Notified Crop.',
      'Fill survey number and insured acreage details.',
      'Pay subsidized farmer premium and collect Insurance Policy Receipt / Application ID.',
      'Note the 72-hour toll-free intimation number (1800-180-1551) in case of crop disaster.'
    ],
    applicationDeadline: 'Kharif Cut-off: 31st July | Rabi Cut-off: 31st December (State dates vary slightly)',
    officialPortalUrl: 'https://pmfby.gov.in',
    portalName: 'PMFBY National Crop Insurance Portal',
    lastVerifiedDate: '2026-10-16',
    officialDisclaimer: 'Official Source: Ministry of Agriculture & Farmers Welfare. Claims are settled based on automated Crop Cutting Experiments (CCEs) and localized damage surveys by designated insurance companies.'
  },
  {
    id: 'scheme-pmksy',
    name: 'Per Drop More Crop - PM Krishi Sinchayee Yojana (Micro Irrigation Subsidy)',
    nameTa: 'சொட்டு நீர் மற்றும் தெளிப்பு நீர் பாசன மானிய திட்டம் (PMKSY)',
    category: 'Irrigation & Subsidies',
    scope: 'Central',
    stateApplicable: 'All India',
    targetCrops: ['Tomato', 'Onion', 'Chilli', 'Cotton', 'Horticulture & Orchard Crops'],
    minLandholdingAcres: 0.5,
    benefits: '55% to 100% financial subsidy on installation of Drip and Sprinkler irrigation systems (Up to 100% for Small & Marginal farmers in states like Tamil Nadu; 55% Central norms for other categories).',
    benefitsTa: 'சிறு மற்றும் குறு விவசாயிகளுக்கு சொட்டு நீர் பாசன உபகரணங்களுக்கு 100% வரை அரசு மானியம்.',
    eligibilityCriteria: [
      'Cultivable land with an assured irrigation water source (well, borewell, or farm pond).',
      'Open to all categories of farmers; priority given to Small/Marginal, Women, and SC/ST farmers.',
      'Previous micro-irrigation subsidy must not have been availed on the same land parcel in last 7 years.'
    ],
    requiredDocuments: [
      'Land Title Deeds / Chitta & Adangal',
      'Field Map (FMB Sketch)',
      'Soil & Water test suitability report from approved laboratory',
      'Aadhaar and Passport size photograph',
      'Quotation from empanelled Micro Irrigation manufacturer'
    ],
    applicationSteps: [
      'Apply online through State Agriculture/Horticulture portal (e.g. TN Horticulture or MahaDBT).',
      'Horticulture Officer conducts physical field inspection to verify water source and acreage.',
      'Administrative sanction generated for registered manufacturer installation.',
      'Installation completed and GPS-tagged photos uploaded for subsidy release.'
    ],
    applicationDeadline: 'Subject to annual block target allocation (First-Come, First-Served basis)',
    officialPortalUrl: 'https://pmksy.gov.in',
    portalName: 'PMKSY Official Portal',
    lastVerifiedDate: '2026-10-12',
    officialDisclaimer: 'Official Source: Department of Agriculture & Farmers Welfare. Exact subsidy percentage varies between 55% and 100% based on State top-up provisions and farmer category.'
  },
  {
    id: 'scheme-smam',
    name: 'Sub-Mission on Agricultural Mechanization (SMAM - Farm Machinery Subsidy)',
    nameTa: 'வேளாண் இயந்திரமயமாக்கல் துணை இயக்கம் (SMAM)',
    category: 'Inputs & Machinery',
    scope: 'Central',
    stateApplicable: 'All India',
    targetCrops: ['All Crops'],
    benefits: '40% to 50% subsidy on procurement of Tractors, Power Tillers, Multi-crop Seed Drills, Rotavators, Harvesters, and Solar Sprayers.',
    benefitsTa: 'டிராக்டர், பவர் டில்லர், ரோட்டாவேட்டர் மற்றும் உழவு இயந்திரங்கள் வாங்க 40% முதல் 50% வரை மானியம்.',
    eligibilityCriteria: [
      'Farmer holding cultivable land with valid Patta/Ownership title.',
      'Must not have availed subsidy for the same category machine in past 5 years.'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Land records (RoR/Patta)',
      'Bank passbook copy',
      'Caste certificate (if claiming SC/ST differential subsidy)'
    ],
    applicationSteps: [
      'Register on agrimachinery.nic.in portal with mobile OTP.',
      'Select machine type and manufacturer dealer from empanelled directory.',
      'Upload required documents and submit for Assistant Executive Engineer (Agrl. Engg.) scrutiny.',
      'Procure equipment on issue of purchase order and submit serial number invoice.'
    ],
    applicationDeadline: 'Quarterly portal enrollment windows depending on State Budgetary sanctions',
    officialPortalUrl: 'https://agrimachinery.nic.in',
    portalName: 'Direct Benefit Transfer in Agricultural Mechanization',
    lastVerifiedDate: '2026-10-10',
    officialDisclaimer: 'Official Source: Ministry of Agriculture & Farmers Welfare. Allocation is transparently queued via computer lottery or seniority in respective district engineering offices.'
  },
  {
    id: 'scheme-aif',
    name: 'Agriculture Infrastructure Fund (AIF - Post-Harvest Godown & Cold Storage)',
    nameTa: 'வேளாண் உள்கட்டமைப்பு நிதி திட்டம் (AIF - சேமிப்பு கிடங்கு & குளிர்பதனம்)',
    category: 'Storage & Cold Chain',
    scope: 'Central',
    stateApplicable: 'All India',
    targetCrops: ['Tomato', 'Onion', 'Paddy', 'Potato', 'Fruits & Vegetables'],
    benefits: '3% per annum interest subvention on medium-long term debt financing up to ₹2 Crore for constructing godowns, cold stores, sorting/grading units, and primary processing lines. Credit guarantee coverage under CGTMSE for loans up to ₹2 Crore.',
    benefitsTa: 'கிடங்குகள் மற்றும் குளிர்பதன சேமிப்பகம் அமைக்க ரூ.2 கோடி வரை கடனுக்கு 3% வட்டி மானியம்.',
    eligibilityCriteria: [
      'Individual Farmers, Farmer Producer Organizations (FPOs), Primary Agricultural Credit Societies (PACS), and Agri-entrepreneurs.',
      'Project must involve post-harvest management infrastructure or community farming assets.'
    ],
    requiredDocuments: [
      'Detailed Project Report (DPR) of proposed warehouse/cold storage',
      'Land title / Registered long-term lease deed (minimum 15 years)',
      'KYC of applicant and Bank Loan In-Principle Sanction Letter',
      'Local Panchayat / Building Plan approvals'
    ],
    applicationSteps: [
      'Register entity on agriinfra.dac.gov.in portal.',
      'Fill project details, cost outlay, and upload DPR along with land documents.',
      'Select participating commercial bank or cooperative for credit appraisal.',
      'Project vetted by Ministry PMU; on disbursement, 3% interest relief credited directly to loan account.'
    ],
    applicationDeadline: 'Operational till FY 2032-33',
    officialPortalUrl: 'https://agriinfra.dac.gov.in',
    portalName: 'National Agriculture Infrastructure Portal',
    lastVerifiedDate: '2026-10-14',
    officialDisclaimer: 'Official Source: Department of Agriculture & Farmers Welfare. Loan sanction is at commercial discretion of lending bank; interest subvention is guaranteed for eligible infrastructure up to 7 years.'
  }
]

// -------------------------------------------------------------
// MODULE 3: INITIAL INSURANCE POLICIES & CLAIMS
// -------------------------------------------------------------
export const INITIAL_INSURANCE_POLICIES: InsurancePolicy[] = [
  {
    id: 'pol-01',
    userId: 'farmer_tn_01',
    schemeName: 'PM Fasal Bima Yojana (PMFBY)',
    policyNumber: 'PMFBY-2026-TN-984210',
    insurerName: 'Agriculture Insurance Company of India (AIC)',
    cropName: 'Tomato',
    insuredAreaAcres: 3.5,
    sumInsuredINR: 175000,
    premiumPaidINR: 3500,
    season: 'Kharif',
    year: 2026,
    coverageStartDate: '2026-06-15',
    coverageEndDate: '2026-11-30',
    intimationDeadlineHours: 72,
    status: 'ACTIVE'
  },
  {
    id: 'pol-02',
    userId: 'farmer_tn_01',
    schemeName: 'Restructured Weather Based Crop Insurance Scheme (RWBCIS)',
    policyNumber: 'RWBCIS-MH-2026-55412',
    insurerName: 'HDFC ERGO General Insurance Co.',
    cropName: 'Onion',
    insuredAreaAcres: 3.0,
    sumInsuredINR: 150000,
    premiumPaidINR: 7500,
    season: 'Rabi',
    year: 2026,
    coverageStartDate: '2026-10-01',
    coverageEndDate: '2027-03-31',
    intimationDeadlineHours: 72,
    status: 'ACTIVE'
  }
]

export const INITIAL_DAMAGE_CLAIMS: DamageClaim[] = [
  {
    id: 'claim-01',
    userId: 'farmer_tn_01',
    policyId: 'pol-01',
    cropName: 'Tomato',
    damageDate: '2026-10-15',
    affectedAreaAcres: 1.2,
    causeOfDamage: 'Inundation/Flood',
    description: 'Sudden cloudburst and flash inundation caused waterlogging in block 2 field. Breaker-stage tomato vines submerged for 36 hours leading to fruit drop and collar rot.',
    claimStatus: 'SURVEY_SCHEDULED',
    claimStatusNotes: 'Claim intimation logged within 24 hours. Village Agricultural Officer and AIC Insurance loss assessor scheduled field inspection for 22-Oct-2026.',
    surveyDateScheduled: '2026-10-22',
    claimReferenceNumber: 'PMFBY-CLM-2026-TN-4482',
    requiredChecklist: [
      { document: 'Copy of Insurance Policy Certificate (PMFBY e-receipt)', completed: true },
      { document: 'Land Record (Patta / Chitta / 7/12 copy)', completed: true },
      { document: 'Aadhaar Card & Bank Passbook with IFSC', completed: true },
      { document: 'Sowing Certificate from Village Administrative Officer (VAO)', completed: true },
      { document: 'Geo-tagged field photographs showing flood inundation', completed: true },
      { document: 'Loss Intimation Form signed by Loss Assessor during survey', completed: false }
    ],
    createdAt: '2026-10-16T08:30:00Z',
    lastUpdated: '2026-10-18T12:00:00Z'
  }
]

// -------------------------------------------------------------
// MODULE 4: INITIAL FARM EXPENSES
// -------------------------------------------------------------
export const INITIAL_FARM_EXPENSES: FarmExpense[] = [
  {
    id: 'exp-01',
    userId: 'farmer_tn_01',
    vendorName: 'Sri Amman Agro Chemicals & Seeds',
    invoiceNumber: 'INV-2026-8841',
    date: '2026-10-02',
    category: 'Seeds',
    cropAssociated: 'Tomato',
    season: 'Kharif 2026',
    amountINR: 4800,
    lineItems: [
      { description: 'Shivam Hybrid F1 Tomato Seed Packets (50g)', quantity: 4, unit: 'packet', rate: 1200, total: 4800 }
    ],
    ocrConfidence: 0.95,
    isManuallyVerified: true,
    notes: 'Purchased for block 2 second plantation. Batch test tag verified.',
    createdAt: '2026-10-02T16:30:00Z'
  },
  {
    id: 'exp-02',
    userId: 'farmer_tn_01',
    vendorName: 'Kisan Seva Kendra Fertilizer Depot',
    invoiceNumber: 'KSK-09214',
    date: '2026-10-08',
    category: 'Fertilizers & Pesticides',
    cropAssociated: 'Onion',
    season: 'Rabi 2026-27',
    amountINR: 8750,
    lineItems: [
      { description: 'Neem Coated Urea (45kg bag)', quantity: 4, unit: 'bag', rate: 268, total: 1072 },
      { description: 'Di-Ammonium Phosphate (DAP 50kg)', quantity: 3, unit: 'bag', rate: 1350, total: 4050 },
      { description: 'Muriate of Potash (MOP 50kg)', quantity: 2, unit: 'bag', rate: 1700, total: 3400 },
      { description: 'Micronutrient Soil Application mixture', quantity: 1, unit: 'can', rate: 228, total: 228 }
    ],
    ocrConfidence: 0.92,
    isManuallyVerified: true,
    notes: 'Basal fertilizer application prior to onion bed preparation.',
    createdAt: '2026-10-08T18:00:00Z'
  },
  {
    id: 'exp-03',
    userId: 'farmer_tn_01',
    vendorName: 'Local Field Harvesters Crew',
    invoiceNumber: 'WAGE-WK-41',
    date: '2026-10-14',
    category: 'Labor & Wages',
    cropAssociated: 'Tomato',
    season: 'Kharif 2026',
    amountINR: 6400,
    lineItems: [
      { description: 'Manual harvest picking & sorting in field (8 workers x ₹400)', quantity: 8, unit: 'mandays', rate: 400, total: 3200 },
      { description: 'Crate loading and farm dispatch packing (8 workers x ₹400)', quantity: 8, unit: 'mandays', rate: 400, total: 3200 }
    ],
    ocrConfidence: 0.88,
    isManuallyVerified: true,
    notes: 'Payment made via UPI to labor maistry Raju for weekly pickings.',
    createdAt: '2026-10-14T20:15:00Z'
  },
  {
    id: 'exp-04',
    userId: 'farmer_tn_01',
    vendorName: 'Dindigul Rural Transport Logistics',
    invoiceNumber: 'TRN-5510',
    date: '2026-10-16',
    category: 'Transport & Mandi Freight',
    cropAssociated: 'Tomato',
    season: 'Kharif 2026',
    amountINR: 2850,
    lineItems: [
      { description: 'Mini Truck freight (Mahindra Bolero Pickup to Dindigul APMC)', quantity: 1, unit: 'trip', rate: 2850, total: 2850 }
    ],
    ocrConfidence: 0.94,
    isManuallyVerified: true,
    notes: 'Transported 850 kg harvested tomatoes to market gate.',
    createdAt: '2026-10-16T19:30:00Z'
  }
]

// -------------------------------------------------------------
// MODULE 5: FARMING TASKS FOR COPILOT
// -------------------------------------------------------------
export const INITIAL_FARM_TASKS: FarmingTask[] = [
  {
    id: 'task-1',
    title: 'Monitor Relative Humidity in Onion Warehouse',
    titleTa: 'வெங்காய கிடங்கில் ஈரப்பதத்தை கண்காணிக்கவும்',
    dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10),
    category: 'Storage Check',
    priority: 'HIGH',
    completed: false,
    cropName: 'Onion'
  },
  {
    id: 'task-2',
    title: 'Foliar spray with Trichoderma / Neem Oil for tomato breaker stage',
    titleTa: 'தக்காளிக்கு வேப்ப எண்ணெய் மற்றும் நுண்ணுயிர் தெளிப்பு',
    dueDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    category: 'Nutrient Management',
    priority: 'MEDIUM',
    completed: false,
    cropName: 'Tomato'
  },
  {
    id: 'task-3',
    title: 'Review PMFBY Insurance Claim field survey documents with VAO',
    titleTa: 'பயிர் காப்பீட்டு கணக்கெடுப்பு ஆவணங்களை கிராம அலுவலருடன் சரிபார்க்கவும்',
    dueDate: '2026-10-22',
    category: 'Market Dispatch',
    priority: 'HIGH',
    completed: false,
    cropName: 'Tomato'
  },
  {
    id: 'task-4',
    title: 'Basal dose application of Potash before onion transplanting',
    titleTa: 'வெங்காயம் நடுவதற்கு முன் பொட்டாஷ் உரம் இடுதல்',
    dueDate: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    category: 'Nutrient Management',
    priority: 'MEDIUM',
    completed: true,
    cropName: 'Onion'
  }
]
