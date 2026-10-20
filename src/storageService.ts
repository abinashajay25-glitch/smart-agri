import {
  InventoryItem,
  MarketPriceRecord,
  CropScanResult,
  UserProfile,
  NotificationItem,
  CommunityPost,
  GovtScheme,
  InsurancePolicy,
  DamageClaim,
  FarmExpense,
  FarmingTask
} from './types'
import {
  INITIAL_INVENTORY,
  VERIFIED_MARKET_PRICES,
  DEFAULT_USER,
  INITIAL_COMMUNITY_POSTS,
  VERIFIED_GOVT_SCHEMES,
  INITIAL_INSURANCE_POLICIES,
  INITIAL_DAMAGE_CLAIMS,
  INITIAL_FARM_EXPENSES,
  INITIAL_FARM_TASKS
} from './mockAgriData'

const STORAGE_KEYS = {
  USER: 'smartagri_user',
  AUTH: 'smartagri_auth',
  INVENTORY: 'smartagri_inventory',
  SCANS: 'smartagri_scans',
  MARKET_PRICES: 'smartagri_market_prices',
  NOTIFICATIONS: 'smartagri_notifications',
  COMMUNITY_POSTS: 'smartagri_community_posts',
  SAVED_SCHEMES: 'smartagri_saved_schemes',
  INSURANCE_POLICIES: 'smartagri_insurance_policies',
  DAMAGE_CLAIMS: 'smartagri_damage_claims',
  FARM_EXPENSES: 'smartagri_farm_expenses',
  FARM_TASKS: 'smartagri_farm_tasks',
}

// User Profile
export const getStoredUser = (): UserProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER)
    return raw ? JSON.parse(raw) : DEFAULT_USER
  } catch {
    return DEFAULT_USER
  }
}

export const saveStoredUser = (user: UserProfile) => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
}

// Authentication
export const getStoredAuth = (): { isAuthenticated: boolean; token?: string; user?: UserProfile } => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH)
    return raw ? JSON.parse(raw) : { isAuthenticated: true, user: DEFAULT_USER }
  } catch {
    return { isAuthenticated: true, user: DEFAULT_USER }
  }
}

export const saveStoredAuth = (auth: { isAuthenticated: boolean; token?: string; user?: UserProfile }) => {
  localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(auth))
}

// Inventory
export const getStoredInventory = (userId?: string): InventoryItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVENTORY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY))
      return INITIAL_INVENTORY
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_INVENTORY
  }
}

export const saveStoredInventory = (items: InventoryItem[]) => {
  localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items))
}

// Scans
export const getStoredScans = (): CropScanResult[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCANS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const saveCropScan = (scan: CropScanResult) => {
  const current = getStoredScans()
  const updated = [scan, ...current]
  localStorage.setItem(STORAGE_KEYS.SCANS, JSON.stringify(updated))
  return updated
}

// Notifications
export const getStoredNotifications = (): NotificationItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)
    if (!raw) {
      const initialNotifs: NotificationItem[] = [
        {
          id: 'notif-1',
          title: 'High Spoilage Alert: Green Chillies',
          titleTa: 'அதிக கெட்டுப்போகும் எச்சரிக்கை: பச்சை மிளகாய்',
          message: '320 kg Green Chillies have 2 days shelf life left in ambient storage. Immediate dispatch to Coimbatore or Guntur recommended.',
          messageTa: '320 கிலோ பச்சை மிளகாய் சேமிப்பில் 2 நாட்கள் மட்டுமே எஞ்சியுள்ளது. உடனடியாக விற்கவும்.',
          type: 'ALERT',
          date: new Date().toISOString(),
          read: false,
          linkTarget: 'smart-sell',
        },
        {
          id: 'notif-2',
          title: 'Market Rally: Koyambedu Tomato Prices +12%',
          titleTa: 'சந்தை ஏற்றம்: கோயம்பேடு தக்காளி விலை +12%',
          message: 'Koyambedu wholesale terminal modal price jumped to ₹41/kg today due to decreased southern arrivals.',
          messageTa: 'வரத்து குறைவால் கோயம்பேடு மொத்த சந்தையில் தக்காளி விலை கிலோவிற்கு ₹41 ஆக உயர்ந்துள்ளது.',
          type: 'INFO',
          date: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
          read: false,
          linkTarget: 'market-prices',
        },
        {
          id: 'notif-3',
          title: 'PMFBY Kharif Enrollment Deadline Approaching',
          titleTa: 'பிரதம மந்திரி பயிர் காப்பீட்டுத் திட்டம் பதிவு நினைவூட்டல்',
          message: 'PM Fasal Bima Yojana enrollment window for Kharif tomato & paddy closes in 14 days. Review policy details.',
          messageTa: 'தக்காளி மற்றும் நெல் காரீப் பயிர் காப்பீட்டு பதிவு செய்ய இன்னும் 14 நாட்கள் மட்டுமே உள்ளன.',
          type: 'WARNING',
          date: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
          read: false,
          linkTarget: 'crop-insurance',
        },
        {
          id: 'notif-4',
          title: 'Storage Condition Advisory',
          titleTa: 'சேமிப்பு நிபந்தனை வழிகாட்டல்',
          message: 'Nashik Onion storage warehouse humidity is at 68% (optimal). Keep blowers active between 10 AM and 4 PM.',
          messageTa: 'வெங்காய கிடங்கில் ஈரப்பதம் 68% ஆக உள்ளது. காற்றோட்டம் சீராக இருப்பதை உறுதி செய்யவும்.',
          type: 'SUCCESS',
          date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          read: true,
          linkTarget: 'storage-monitor',
        },
      ]
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifs))
      return initialNotifs
    }
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export const saveNotifications = (notifs: NotificationItem[]) => {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs))
}

export const addNotification = (item: Omit<NotificationItem, 'id' | 'date' | 'read'>) => {
  const current = getStoredNotifications()
  const newNotif: NotificationItem = {
    ...item,
    id: `notif-${Date.now()}`,
    date: new Date().toISOString(),
    read: false,
  }
  const updated = [newNotif, ...current]
  saveNotifications(updated)
  return updated
}

// Market Prices
export const getStoredMarketPrices = (): MarketPriceRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MARKET_PRICES)
    return raw ? JSON.parse(raw) : VERIFIED_MARKET_PRICES
  } catch {
    return VERIFIED_MARKET_PRICES
  }
}

// -------------------------------------------------------------
// COMMUNITY POSTS STORAGE
// -------------------------------------------------------------
export const getStoredCommunityPosts = (): CommunityPost[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMUNITY_POSTS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.COMMUNITY_POSTS, JSON.stringify(INITIAL_COMMUNITY_POSTS))
      return INITIAL_COMMUNITY_POSTS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_COMMUNITY_POSTS
  }
}

export const saveStoredCommunityPosts = (posts: CommunityPost[]) => {
  localStorage.setItem(STORAGE_KEYS.COMMUNITY_POSTS, JSON.stringify(posts))
}

// -------------------------------------------------------------
// GOVERNMENT SCHEMES & SAVED SCHEMES
// -------------------------------------------------------------
export const getStoredGovtSchemes = (): GovtScheme[] => {
  return VERIFIED_GOVT_SCHEMES
}

export const getSavedSchemeIds = (userId: string): string[] => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.SAVED_SCHEMES}_${userId}`)
    return raw ? JSON.parse(raw) : ['scheme-pmkisan', 'scheme-pmfby']
  } catch {
    return ['scheme-pmkisan', 'scheme-pmfby']
  }
}

export const saveSavedSchemeIds = (userId: string, ids: string[]) => {
  localStorage.setItem(`${STORAGE_KEYS.SAVED_SCHEMES}_${userId}`, JSON.stringify(ids))
}

// -------------------------------------------------------------
// CROP INSURANCE & DAMAGE CLAIMS
// -------------------------------------------------------------
export const getStoredInsurancePolicies = (userId: string): InsurancePolicy[] => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.INSURANCE_POLICIES}_${userId}`)
    if (!raw) {
      const userPolicies = INITIAL_INSURANCE_POLICIES.filter(p => p.userId === userId || p.userId === DEFAULT_USER.id)
      localStorage.setItem(`${STORAGE_KEYS.INSURANCE_POLICIES}_${userId}`, JSON.stringify(userPolicies))
      return userPolicies
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_INSURANCE_POLICIES
  }
}

export const saveStoredInsurancePolicies = (userId: string, policies: InsurancePolicy[]) => {
  localStorage.setItem(`${STORAGE_KEYS.INSURANCE_POLICIES}_${userId}`, JSON.stringify(policies))
}

export const getStoredDamageClaims = (userId: string): DamageClaim[] => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.DAMAGE_CLAIMS}_${userId}`)
    if (!raw) {
      const userClaims = INITIAL_DAMAGE_CLAIMS.filter(c => c.userId === userId || c.userId === DEFAULT_USER.id)
      localStorage.setItem(`${STORAGE_KEYS.DAMAGE_CLAIMS}_${userId}`, JSON.stringify(userClaims))
      return userClaims
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_DAMAGE_CLAIMS
  }
}

export const saveStoredDamageClaims = (userId: string, claims: DamageClaim[]) => {
  localStorage.setItem(`${STORAGE_KEYS.DAMAGE_CLAIMS}_${userId}`, JSON.stringify(claims))
}

// -------------------------------------------------------------
// FARM EXPENSES & RECEIPTS
// -------------------------------------------------------------
export const getStoredFarmExpenses = (userId: string): FarmExpense[] => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.FARM_EXPENSES}_${userId}`)
    if (!raw) {
      const userExpenses = INITIAL_FARM_EXPENSES.filter(e => e.userId === userId || e.userId === DEFAULT_USER.id)
      localStorage.setItem(`${STORAGE_KEYS.FARM_EXPENSES}_${userId}`, JSON.stringify(userExpenses))
      return userExpenses
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_FARM_EXPENSES
  }
}

export const saveStoredFarmExpenses = (userId: string, expenses: FarmExpense[]) => {
  localStorage.setItem(`${STORAGE_KEYS.FARM_EXPENSES}_${userId}`, JSON.stringify(expenses))
}

// -------------------------------------------------------------
// FARMING TASKS & COPILOT
// -------------------------------------------------------------
export const getStoredFarmTasks = (userId: string): FarmingTask[] => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.FARM_TASKS}_${userId}`)
    if (!raw) {
      localStorage.setItem(`${STORAGE_KEYS.FARM_TASKS}_${userId}`, JSON.stringify(INITIAL_FARM_TASKS))
      return INITIAL_FARM_TASKS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_FARM_TASKS
  }
}

export const saveStoredFarmTasks = (userId: string, tasks: FarmingTask[]) => {
  localStorage.setItem(`${STORAGE_KEYS.FARM_TASKS}_${userId}`, JSON.stringify(tasks))
}
