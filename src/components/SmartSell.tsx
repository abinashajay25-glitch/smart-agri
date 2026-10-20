import React, { useState } from 'react'
import {
  BadgeDollarSign,
  TrendingUp,
  Truck,
  Building2,
  Calendar,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Info,
  Compass,
  ArrowRight
} from 'lucide-react'
import { MarketPriceRecord, SmartSellCalculation, InventoryItem } from '../types'
import { calculateSmartSelling } from '../calculationEngine'
import { exportSmartSellReportToCSV } from '../reportService'

interface SmartSellProps {
  markets: MarketPriceRecord[]
  inventory: InventoryItem[]
  language: 'en' | 'ta'
  presetCrop?: string
  presetQuantity?: number
}

export const SmartSell: React.FC<SmartSellProps> = ({
  markets,
  inventory,
  language,
  presetCrop,
  presetQuantity,
}) => {
  const isTa = language === 'ta'

  const [selectedCrop, setSelectedCrop] = useState<string>(presetCrop || 'Tomato')
  const [quantityKg, setQuantityKg] = useState<number>(presetQuantity || 100)
  const [customDieselCost, setCustomDieselCost] = useState<number>(94.5)
  const [urgencyMode, setUrgencyMode] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM')

  // Find if we have active inventory matching this crop
  const matchedInventory = inventory.find(i => i.cropName.toLowerCase() === selectedCrop.toLowerCase())

  // Run calculation
  const calculations: SmartSellCalculation[] = calculateSmartSelling(
    selectedCrop,
    quantityKg,
    markets,
    urgencyMode,
    customDieselCost
  )

  const topChoice = calculations[0]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <BadgeDollarSign className="w-6 h-6 text-emerald-600" />
            {isTa ? 'ஸ்மார்ட் விற்பனை உகப்பாக்கம் & லாபக் கணக்கீடு' : 'Smart Sell Optimizer & Net Profit Calculator'}
          </h1>
          <p className="text-xs text-slate-500">
            {isTa
              ? 'போக்குவரத்து செலவு, மண்டி கட்டணம் மற்றும் மீதமுள்ள ஆயுட்காலத்தை கணக்கில் கொண்டு அதிக லாபமுள்ள சந்தையை கண்டறியவும்'
              : 'Deducts realistic diesel logistics, APMC fees & transit risk to discover your maximum net in-hand payout'}
          </p>
        </div>

        {calculations.length > 0 && (
          <button
            onClick={() => exportSmartSellReportToCSV(calculations, selectedCrop, quantityKg)}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            {isTa ? 'அறிக்கை பதிவிறக்கு (CSV)' : 'Export Sell Report'}
          </button>
        )}
      </div>

      {/* Input Parameter Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Select Crop</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Tomato">Tomato (தக்காளி)</option>
              <option value="Onion">Onion (வெங்காயம்)</option>
              <option value="Chilli (Green)">Chilli (Green) (பச்சை மிளகாய்)</option>
              <option value="Paddy / Rice">Paddy / Rice (நெல்)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Quantity to Dispatch (Kilograms)
            </label>
            <input
              type="number"
              value={quantityKg}
              onChange={(e) => setQuantityKg(Math.max(10, Number(e.target.value)))}
              min={10}
              step={10}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              = {(quantityKg / 100).toFixed(1)} Quintals
            </span>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Diesel Rate (₹/Litre)
            </label>
            <input
              type="number"
              value={customDieselCost}
              onChange={(e) => setCustomDieselCost(Number(e.target.value))}
              step={0.5}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Stock Urgency / Spoilage
            </label>
            <select
              value={urgencyMode}
              onChange={(e) => setUrgencyMode(e.target.value as any)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
            >
              <option value="LOW">Low (Plenty Shelf Life)</option>
              <option value="MEDIUM">Medium (Normal Window)</option>
              <option value="HIGH">High (Perishable Urgent)</option>
              <option value="CRITICAL">Critical (Immediate Transit)</option>
            </select>
          </div>
        </div>

        {matchedInventory && (
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Connected to Inventory: You currently hold {matchedInventory.quantityKg} kg of {matchedInventory.cropName} ({matchedInventory.daysRemaining} days left).
            </span>
            <button
              onClick={() => setQuantityKg(matchedInventory.quantityKg)}
              className="underline text-emerald-700 font-bold hover:text-emerald-950"
            >
              Fill {matchedInventory.quantityKg} kg
            </button>
          </div>
        )}
      </div>

      {/* Top Winner Card */}
      {topChoice && (
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-2xl p-6 text-white shadow-lg border border-emerald-700 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-lime-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400 bg-lime-400/20 px-2.5 py-0.5 rounded-full border border-lime-400/30">
                ⭐ #1 Optimal Selling Destination
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                {topChoice.mandi.mandiName}
              </h2>
              <p className="text-xs text-emerald-200 flex items-center gap-2">
                <span>{topChoice.mandi.district}, {topChoice.mandi.state}</span>
                <span>•</span>
                <span>{topChoice.mandi.distanceKm} km from farm</span>
                <span>•</span>
                <span>Mandi Modal Price: ₹{topChoice.mandi.pricePerKg.toFixed(1)}/kg</span>
              </p>
            </div>

            <div className="text-left md:text-right bg-emerald-800/60 p-4 rounded-xl border border-emerald-700/60">
              <span className="text-[10px] text-emerald-300 font-bold uppercase block">
                Estimated Net Realization
              </span>
              <div className="text-3xl font-black text-lime-300">
                ₹{Math.round(topChoice.netRevenue).toLocaleString('en-IN')}
              </div>
              <span className="text-xs font-bold text-white">
                ₹{topChoice.netPricePerKg.toFixed(2)} / kg net in-hand
              </span>
            </div>
          </div>

          {/* Breakdown bar */}
          <div className="mt-5 pt-4 border-t border-emerald-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-emerald-400 text-[11px] block">Gross Mandi Value</span>
              <span className="font-extrabold text-white text-sm">
                ₹{Math.round(topChoice.grossRevenue).toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-emerald-400 text-[11px] block">Transport Freight</span>
              <span className="font-extrabold text-rose-300 text-sm">
                - ₹{Math.round(topChoice.transportCost).toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-emerald-400 text-[11px] block">APMC Cess & Porterage</span>
              <span className="font-extrabold text-rose-300 text-sm">
                - ₹{Math.round(topChoice.mandiCessAndLoading).toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-emerald-400 text-[11px] block">Packaging & Crates</span>
              <span className="font-extrabold text-rose-300 text-sm">
                - ₹{Math.round(topChoice.packagingCost).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="mt-3 text-xs text-lime-200/90 italic flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 flex-shrink-0 text-lime-400" />
            <span>{topChoice.recommendationReason}</span>
          </div>
        </div>
      )}

      {/* Comparison Grid */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-600" />
          {isTa ? 'அனைத்து சந்தைகளின் ஒப்பீடு' : 'Comparative Mandi Matrix (Sorted by Net Payout)'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {calculations.map((calc) => (
            <div
              key={calc.mandi.id}
              className={`p-5 rounded-2xl border transition-all ${
                calc.profitRank === 1
                  ? 'bg-emerald-50/40 border-emerald-300 shadow-sm ring-1 ring-emerald-300'
                  : 'bg-white border-slate-200/80 shadow-sm hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs text-slate-700">
                      #{calc.profitRank}
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900">{calc.mandi.mandiName}</h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {calc.mandi.district}, {calc.mandi.state} • {calc.mandi.distanceKm} km away
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-base font-black text-emerald-800">
                    ₹{Math.round(calc.netRevenue).toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    ₹{calc.netPricePerKg.toFixed(2)}/kg net
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-[11px] text-slate-600">
                <div>
                  <span className="block text-slate-400">Modal Price</span>
                  <span className="font-bold text-slate-800">₹{calc.mandi.modalPricePerQuintal}/Qtl</span>
                </div>
                <div>
                  <span className="block text-slate-400">Freight Cost</span>
                  <span className="font-bold text-rose-600">₹{Math.round(calc.transportCost)}</span>
                </div>
                <div>
                  <span className="block text-slate-400">Logistics Score</span>
                  <span className="font-bold text-emerald-700">{calc.recommendationScore}/100</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg">
                {calc.recommendationReason}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
