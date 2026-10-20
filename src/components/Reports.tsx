import React, { useState } from 'react'
import {
  FileSpreadsheet,
  Download,
  FileText,
  CheckCircle,
  Building2,
  Calendar,
  AlertTriangle,
  Package,
  BadgeDollarSign
} from 'lucide-react'
import { InventoryItem, MarketPriceRecord, UserProfile, SmartSellCalculation } from '../types'
import { exportInventoryToCSV, exportSmartSellReportToCSV, generateFarmerAuditPDF } from '../reportService'
import { calculateSmartSelling } from '../calculationEngine'

interface ReportsProps {
  user: UserProfile
  inventory: InventoryItem[]
  marketPrices: MarketPriceRecord[]
  language: 'en' | 'ta'
}

export const Reports: React.FC<ReportsProps> = ({
  user,
  inventory,
  marketPrices,
  language,
}) => {
  const isTa = language === 'ta'
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  const handleDownloadPDF = () => {
    setDownloadingPdf(true)
    try {
      const smartSellSample = calculateSmartSelling('Tomato', 500, marketPrices, 'LOW')
      generateFarmerAuditPDF(user, inventory, marketPrices, smartSellSample)
    } finally {
      setTimeout(() => setDownloadingPdf(false), 800)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
          {isTa ? 'அறிக்கைகள் மற்றும் தரவு பதிவிறக்கம்' : 'Downloadable Farm Intelligence & Audit Reports'}
        </h1>
        <p className="text-xs text-slate-500">
          {isTa
            ? 'அறுவடை இருப்பு, சேமிப்பு அபாயம் மற்றும் மண்டி விற்பனை ஒப்பீட்டு அறிக்கைகள்'
            : 'Generate verifiable PDF audits & CSV spreadsheets for bank financing, insurance, or logistics planning'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Executive PDF Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">
              {isTa ? 'முழுமையான விவசாய தணிக்கை அறிக்கை (PDF)' : 'Full Farmer Audit & Post-Harvest Summary (PDF)'}
            </h3>
            <p className="text-xs text-slate-500">
              Includes farm metadata, crop varieties, harvest dates, remaining shelf-life days, verified APMC prices, and optimal selling calculations with ICAR disclaimers.
            </p>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPdf}
            className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-950/20 disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-lime-400" />
            {downloadingPdf ? 'Generating PDF...' : 'Download Full PDF Audit'}
          </button>
        </div>

        {/* CSV Inventory Data Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">
              {isTa ? 'அறுவடை சரக்கு இருப்பு அட்டவணை (CSV)' : 'Harvest Inventory Raw Dataset (CSV)'}
            </h3>
            <p className="text-xs text-slate-500">
              Tabular spreadsheet of all {inventory.length} active batches, lot numbers, warehouse storage conditions, temperature readings, and estimated monetary valuation.
            </p>
          </div>

          <button
            onClick={() => exportInventoryToCSV(inventory, user)}
            className="w-full py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Export Inventory CSV
          </button>
        </div>
      </div>
    </div>
  )
}
