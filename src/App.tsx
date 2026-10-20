import React, { useState, useEffect } from 'react'
import { LandingPage } from './components/LandingPage'
import { Navigation } from './components/Navigation'
import { Dashboard } from './components/Dashboard'
import { CropScanner } from './components/CropScanner'
import { CropHealth } from './components/CropHealth'
import { Inventory } from './components/Inventory'
import { StorageMonitor } from './components/StorageMonitor'
import { MarketPrices } from './components/MarketPrices'
import { PriceForecast } from './components/PriceForecast'
import { SmartSell } from './components/SmartSell'
import { Assistant } from './components/Assistant'
import { WeatherAdvisory } from './components/WeatherAdvisory'
import { Reports } from './components/Reports'
import { Notifications } from './components/Notifications'
import { SettingsPage } from './components/SettingsPage'
import { AuthModal } from './components/AuthModal'

// NEW MODULES
import { FarmerCommunity } from './components/FarmerCommunity'
import { SchemeFinder } from './components/SchemeFinder'
import { CropInsurance } from './components/CropInsurance'
import { ExpenseScanner } from './components/ExpenseScanner'
import { FarmBusinessPlanner } from './components/FarmBusinessPlanner'

import {
  getStoredUser,
  saveStoredUser,
  getStoredAuth,
  saveStoredAuth,
  getStoredInventory,
  saveStoredInventory,
  getStoredScans,
  saveCropScan,
  getStoredNotifications,
  saveNotifications,
  getStoredMarketPrices,
  getStoredCommunityPosts,
  saveStoredCommunityPosts,
  getStoredFarmExpenses,
  saveStoredFarmExpenses
} from './storageService'
import {
  UserProfile,
  InventoryItem,
  CropScanResult,
  NotificationItem,
  MarketPriceRecord,
  CommunityPost,
  FarmExpense
} from './types'

export function App() {
  const [auth, setAuth] = useState(getStoredAuth)
  const [user, setUser] = useState<UserProfile>(getStoredUser)
  const [currentPage, setCurrentPage] = useState<string>('landing')
  const [inventory, setInventory] = useState<InventoryItem[]>(() => getStoredInventory(user.id))
  const [scans, setScans] = useState<CropScanResult[]>(getStoredScans)
  const [notifications, setNotificationsState] = useState<NotificationItem[]>(getStoredNotifications)
  const [markets] = useState<MarketPriceRecord[]>(getStoredMarketPrices)
  const [language, setLanguage] = useState<'en' | 'ta'>(user.preferredLanguage === 'ta' ? 'ta' : 'en')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Community Posts
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(getStoredCommunityPosts)

  // Farm Expenses
  const [expenses, setExpenses] = useState<FarmExpense[]>(() => getStoredFarmExpenses(user.id))

  // Smart sell navigation preset states
  const [smartSellPresetCrop, setSmartSellPresetCrop] = useState<string | undefined>()
  const [smartSellPresetQty, setSmartSellPresetQty] = useState<number | undefined>()

  // Inventory modal navigation preset
  const [inventoryAddOpen, setInventoryAddOpen] = useState(false)
  const [inventoryPresetCrop, setInventoryPresetCrop] = useState<string | undefined>()
  const [inventoryPresetShelfLife, setInventoryPresetShelfLife] = useState<number | undefined>()
  const [inventoryPresetVariety, setInventoryPresetVariety] = useState<string | undefined>()

  // Keep storage synchronized
  useEffect(() => {
    saveStoredUser(user)
  }, [user])

  useEffect(() => {
    saveStoredAuth(auth)
  }, [auth])

  useEffect(() => {
    saveStoredInventory(inventory)
  }, [inventory])

  useEffect(() => {
    saveNotifications(notifications)
  }, [notifications])

  useEffect(() => {
    saveStoredCommunityPosts(communityPosts)
  }, [communityPosts])

  useEffect(() => {
    saveStoredFarmExpenses(user.id, expenses)
  }, [expenses, user.id])

  const handleScanComplete = (scan: CropScanResult) => {
    const updated = saveCropScan(scan)
    setScans(updated)
  }

  const handleAddScannedToInventory = (cropName: string, shelfLifeDays: number, variety?: string) => {
    setInventoryPresetCrop(cropName)
    setInventoryPresetShelfLife(shelfLifeDays)
    setInventoryPresetVariety(variety)
    setInventoryAddOpen(true)
    setCurrentPage('inventory')
  }

  const handleNavigateToSmartSell = (cropName: string, quantityKg: number) => {
    setSmartSellPresetCrop(cropName)
    setSmartSellPresetQty(quantityKg)
    setCurrentPage('smart-sell')
  }

  const handleLogout = () => {
    setAuth({ isAuthenticated: false })
    setCurrentPage('landing')
  }

  // Render view router
  const renderCurrentView = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            user={user}
            inventory={inventory}
            marketPrices={markets}
            recentScans={scans}
            onNavigate={(page) => setCurrentPage(page)}
            language={language}
          />
        )
      case 'crop-scanner':
        return (
          <CropScanner
            onScanComplete={handleScanComplete}
            onAddToInventory={handleAddScannedToInventory}
            language={language}
          />
        )
      case 'crop-health':
        return <CropHealth language={language} />
      case 'inventory':
        return (
          <Inventory
            inventory={inventory}
            setInventory={setInventory}
            user={user}
            language={language}
            initialAddModalOpen={inventoryAddOpen}
            initialCropName={inventoryPresetCrop}
            initialShelfLife={inventoryPresetShelfLife}
            initialVariety={inventoryPresetVariety}
            onNavigateToSmartSell={handleNavigateToSmartSell}
          />
        )
      case 'storage-monitor':
        return (
          <StorageMonitor
            inventory={inventory}
            onNavigateToSmartSell={handleNavigateToSmartSell}
            language={language}
          />
        )
      case 'market-prices':
        return (
          <MarketPrices
            markets={markets}
            language={language}
            onSelectMandiForSelling={(mandi) => {
              setSmartSellPresetCrop(mandi.commodity)
              setCurrentPage('smart-sell')
            }}
          />
        )
      case 'price-forecast':
        return <PriceForecast language={language} />
      case 'smart-sell':
        return (
          <SmartSell
            markets={markets}
            inventory={inventory}
            language={language}
            presetCrop={smartSellPresetCrop}
            presetQuantity={smartSellPresetQty}
          />
        )

      // -------------------------------------------------------------
      // NEW MODULE VIEWS
      // -------------------------------------------------------------
      case 'community':
        return (
          <FarmerCommunity
            user={user}
            posts={communityPosts}
            setPosts={setCommunityPosts}
            language={language}
          />
        )
      case 'schemes':
        return <SchemeFinder user={user} language={language} />
      case 'crop-insurance':
        return <CropInsurance user={user} language={language} />
      case 'expense-scanner':
        return (
          <ExpenseScanner
            user={user}
            expenses={expenses}
            setExpenses={setExpenses}
            language={language}
            onNavigateToBusinessPlanner={() => setCurrentPage('business-planner')}
          />
        )
      case 'business-planner':
        return (
          <FarmBusinessPlanner
            user={user}
            expenses={expenses}
            inventory={inventory}
            language={language}
            onNavigateToExpenseScanner={() => setCurrentPage('expense-scanner')}
          />
        )

      // PRESERVED ASSISTANT, WEATHER, REPORTS, NOTIFICATIONS, SETTINGS
      case 'assistant':
        return <Assistant user={user} language={language} setLanguage={setLanguage} />
      case 'weather':
        return <WeatherAdvisory language={language} location={user.location} />
      case 'reports':
        return (
          <Reports
            user={user}
            inventory={inventory}
            marketPrices={markets}
            language={language}
          />
        )
      case 'notifications':
        return (
          <Notifications
            notifications={notifications}
            setNotifications={setNotificationsState}
            onNavigate={(page) => setCurrentPage(page)}
            language={language}
          />
        )
      case 'settings':
        return (
          <SettingsPage
            user={user}
            setUser={setUser}
            language={language}
            setLanguage={setLanguage}
          />
        )
      default:
        return (
          <Dashboard
            user={user}
            inventory={inventory}
            marketPrices={markets}
            recentScans={scans}
            onNavigate={(page) => setCurrentPage(page)}
            language={language}
          />
        )
    }
  }

  // If user visits landing page
  if (currentPage === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => {
          if (auth.isAuthenticated) {
            setCurrentPage('dashboard')
          } else {
            setCurrentPage('auth')
          }
        }}
        onExploreDemo={() => {
          setAuth({ isAuthenticated: true, user })
          setCurrentPage('dashboard')
        }}
        language={language}
      />
    )
  }

  // If auth required
  if (currentPage === 'auth' || !auth.isAuthenticated) {
    return (
      <AuthModal
        onLoginSuccess={(loggedUser) => {
          setUser(loggedUser)
          setAuth({ isAuthenticated: true, user: loggedUser })
          setCurrentPage('dashboard')
        }}
        onExploreDemo={() => {
          setAuth({ isAuthenticated: true, user })
          setCurrentPage('dashboard')
        }}
        language={language}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      <Navigation
        currentPage={currentPage}
        setCurrentPage={(page) => {
          setInventoryAddOpen(false)
          setCurrentPage(page)
        }}
        user={user}
        notifications={notifications}
        language={language}
        setLanguage={setLanguage}
        onLogout={handleLogout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <main className="lg:pl-72 flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {renderCurrentView()}
      </main>
    </div>
  )
}

export default App
