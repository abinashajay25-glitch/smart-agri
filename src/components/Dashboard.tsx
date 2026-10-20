import React from 'react'
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Warehouse,
  ScanLine,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  BadgeAlert
} from 'lucide-react'
import { InventoryItem, MarketPriceRecord, UserProfile, CropScanResult } from '../types'

interface DashboardProps {
  user: UserProfile
  inventory: InventoryItem[]
  marketPrices: MarketPriceRecord[]
  recentScans: CropScanResult[]
  onNavigate: (page: string) => void
  language: 'en' | 'ta'
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  inventory,
  marketPrices,
  recentScans,
  onNavigate,
  language,
}) => {
  const isTa = language === 'ta'

  // Summary Metrics
  const totalStockKg = inventory.reduce((acc, i) => acc + i.quantityKg, 0)
  const totalValueINR = inventory.reduce((acc, i) => acc + i.quantityKg * i.estimatedMarketPricePerKg, 0)
  const highRiskItems = inventory.filter(i => i.spoilageRisk === 'HIGH' || i.spoilageRisk === 'CRITICAL')
  const highRiskStockKg = highRiskItems.reduce((acc, i) => acc + i.quantityKg, 0)

  // Top price gainers in verified mandis
  const topMarkets = [...marketPrices].sort((a, b) => b.modalPricePerQuintal - a.modalPricePerQuintal).slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if crops at risk */}
      {highRiskItems.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-transparent border-l-4 border-rose-500 p-4 rounded-xl bg-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-900">
                {isTa
                  ? `கவனம்: ${highRiskItems.length} பயிர் இருப்பு கெட்டுப்போகும் அபாயத்தில் உள்ளது (${highRiskStockKg.toLocaleString('en-IN')} kg)`
                  : `Action Required: ${highRiskItems.length} Crop Batches (${highRiskStockKg.toLocaleString('en-IN')} kg) at Elevated Spoilage Risk!`}
              </h3>
              <p className="text-xs text-rose-700">
                {isTa
                  ? 'கெட்டுப்போகும் முன் உகந்த சந்தைக்கு அனுப்பி அதிகபட்ச விலையைப் பெறுங்கள்.'
                  : 'Expedite dispatch to proximate mandis or adjust warehouse airflow before quality degradation.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('smart-sell')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 flex-shrink-0"
          >
            {isTa ? 'விற்பனை திட்டத்தை காண்க' : 'Optimize Smart Sell'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stock */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isTa ? 'மொத்த அறுவடை இருப்பு' : 'Harvested Produce'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-800">
              {totalStockKg.toLocaleString('en-IN')}{' '}
              <span className="text-sm font-bold text-emerald-600">kg</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>{(totalStockKg / 100).toFixed(1)} {isTa ? 'குவிண்டால்' : 'Quintals'}</span>
              <span>• across {inventory.length} active lots</span>
            </p>
          </div>
        </div>

        {/* Estimated Value */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isTa ? 'மதிப்பிடப்பட்ட சரக்கு மதிப்பு' : 'Estimated Value'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-lime-50 text-emerald-700 flex items-center justify-center">
              <span className="font-black text-lg">₹</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-900">
              ₹ {Math.round(totalValueINR).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-emerald-700 mt-1 font-medium">
              {isTa ? 'நேரடி APMC விலைகளின் அடிப்படையில்' : 'Calculated at current modal APMC rates'}
            </p>
          </div>
        </div>

        {/* Stock at Risk */}
        <div className={`rounded-2xl p-5 border shadow-sm transition-shadow ${
          highRiskItems.length > 0
            ? 'bg-rose-50/70 border-rose-200'
            : 'bg-white border-emerald-100'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              {isTa ? 'அபாயத்தில் உள்ள இருப்பு' : 'Stock At Spoilage Risk'}
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              highRiskItems.length > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-black ${highRiskItems.length > 0 ? 'text-rose-700' : 'text-slate-800'}`}>
              {highRiskStockKg.toLocaleString('en-IN')} <span className="text-sm font-bold">kg</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {highRiskItems.length > 0
                ? `${highRiskItems.length} ${isTa ? 'பயிர்களுக்கு உடனடியாக கவனம் தேவை' : 'batches need fast liquidation'}`
                : isTa ? 'அனைத்து பயிர்களும் பாதுகாப்பான நிலையில் உள்ளன' : 'All storage parameters stable'}
            </p>
          </div>
        </div>

        {/* Quick AI Action Card */}
        <div
          onClick={() => onNavigate('crop-scanner')}
          className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 rounded-2xl p-5 text-white shadow-md cursor-pointer hover:shadow-lg transition-all group relative overflow-hidden"
        >
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-28 h-28 bg-lime-400/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-lime-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-lime-400" />
              NVIDIA NIM Vision
            </span>
            <div className="w-9 h-9 rounded-xl bg-white/10 text-lime-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ScanLine className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-black text-white">
              {isTa ? 'புதிய பயிர் ஸ்கேன் செய்க' : 'Scan Harvest Produce'}
            </div>
            <p className="text-xs text-emerald-200 mt-1 flex items-center gap-1">
              {isTa ? 'தரம், நோய் மற்றும் ஆயுளைக் கண்டறிக' : 'Detect variety, disease & shelf life'}
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Inventory Table & Live Market Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2/3 Width: Active Harvest Lots with Shelf Life Progress */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-emerald-600" />
                {isTa ? 'நடப்பு அறுவடை இருப்பு மற்றும் ஆயுள் நிலை' : 'Active Produce & Shelf-Life Watch'}
              </h2>
              <p className="text-xs text-slate-500">
                {isTa ? 'சேமிப்பு நிபந்தனைகள் மற்றும் கெட்டுப்போகும் கணக்கீடு' : 'Track days remaining, temperature, and spoilage indicators'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              {isTa ? 'அனைத்தையும் காண்க' : 'Manage All'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {inventory.map((item) => {
              const riskColor =
                item.spoilageRisk === 'CRITICAL'
                  ? 'bg-rose-500 text-white'
                  : item.spoilageRisk === 'HIGH'
                  ? 'bg-rose-100 text-rose-700 border-rose-300'
                  : item.spoilageRisk === 'MEDIUM'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'

              const percent = Math.min(
                100,
                Math.round((item.daysRemaining / (item.estimatedShelfLifeDays || 1)) * 100)
              )

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-200/70 hover:border-emerald-300 transition-colors bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-800">{item.cropName}</span>
                      <span className="text-xs text-slate-500">({item.variety || 'Desi'})</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${riskColor}`}>
                        {item.spoilageRisk} RISK
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {item.storageLocation}
                      </span>
                      <span>•</span>
                      <span>Storage: {item.storageCondition.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>Harvest: {item.harvestDate}</span>
                    </div>
                  </div>

                  <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between gap-2">
                    <div>
                      <span className="text-base font-extrabold text-slate-900">
                        {item.quantityKg.toLocaleString('en-IN')} kg
                      </span>
                      <span className="text-xs text-slate-500 block">
                        ≈ ₹{Math.round(item.quantityKg * item.estimatedMarketPricePerKg).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="w-32 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          percent < 30 ? 'bg-rose-500' : percent < 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-600">
                      {item.daysRemaining} days left
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 1/3 Width: Live Mandi Price Highlights */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-lime-600" />
                  {isTa ? 'நேரடி உழவர் சந்தை விலைகள்' : 'Verified APMC Mandi Rates'}
                </h2>
                <p className="text-xs text-slate-500">Agmarknet & e-NAM verified</p>
              </div>
              <button
                onClick={() => onNavigate('market-prices')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                {isTa ? 'சந்தைகள்' : 'Explore'}
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {topMarkets.map((mandi) => (
                <div
                  key={mandi.id}
                  className="p-3 rounded-xl border border-slate-100 bg-emerald-50/30 flex items-center justify-between hover:bg-emerald-50/60 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-800">{mandi.commodity}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                        {mandi.district}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate max-w-[170px] mt-0.5">
                      {mandi.mandiName}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-emerald-800">
                      ₹{mandi.pricePerKg.toFixed(1)} <span className="text-[10px] text-slate-500">/kg</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ₹{mandi.modalPricePerQuintal} / Qtl
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('smart-sell')}
              className="w-full py-2.5 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <BadgeAlert className="w-4 h-4 text-lime-400" />
              {isTa ? 'லாபகரமான சந்தையை கணக்கிடு' : 'Run Net Profit Mandi Calculator'}
            </button>
          </div>
        </div>
      </div>

      {/* Recent AI Scans & Activity Log */}
      {recentScans.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-emerald-600" />
              {isTa ? 'சமீபத்திய பயிர் ஸ்கேன் பகுப்பாய்வுகள்' : 'Recent AI Vision Inspection History'}
            </h2>
            <button
              onClick={() => onNavigate('crop-scanner')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              {isTa ? 'புதிய ஸ்கேன்' : 'New Scan'}
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentScans.slice(0, 3).map((scan) => (
              <div key={scan.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-800">{scan.cropName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {Math.round(scan.confidence * 100)}% Match
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{scan.conditionDetails}</p>
                <div className="text-[11px] text-emerald-700 font-semibold bg-white p-2 rounded-lg border border-slate-100">
                  💡 {scan.recommendedAction}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Engine: {scan.provider}</span>
                  <span>{new Date(scan.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
