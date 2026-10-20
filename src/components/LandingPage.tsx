import React from 'react'
import {
  Leaf,
  ScanLine,
  Warehouse,
  TrendingUp,
  BadgeDollarSign,
  Bot,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  BarChart3,
  MapPin,
  Clock
} from 'lucide-react'

interface LandingProps {
  onGetStarted: () => void
  onExploreDemo: () => void
  language: 'en' | 'ta'
}

export const LandingPage: React.FC<LandingProps> = ({
  onGetStarted,
  onExploreDemo,
  language,
}) => {
  const isTa = language === 'ta'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-emerald-100 px-6 py-4 flex items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-400 to-emerald-700 flex items-center justify-center text-white shadow-md">
            <Leaf className="w-6 h-6 text-emerald-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-emerald-950">SmartAgri</span>
              <span className="text-xs bg-lime-400/30 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded border border-lime-500/40">AI</span>
            </div>
            <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Grow Smart • Store Safe • Sell Better</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onExploreDemo}
            className="px-4 py-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50 rounded-xl transition-colors hidden sm:block"
          >
            {isTa ? 'மாதிரி பயன்முறை' : 'Demo Journey'}
          </button>
          <button
            onClick={onGetStarted}
            className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-950/20 transition-all flex items-center gap-1.5"
          >
            <span>{isTa ? 'தொடங்குக' : 'Enter Dashboard'}</span>
            <ArrowRight className="w-4 h-4 text-lime-400" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 max-w-7xl mx-auto w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-300 text-emerald-900 text-xs font-black shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
          <span>NVIDIA Vision NIM & Indian APMC Mandi Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Eliminate Post-Harvest Losses. <br />
          <span className="bg-gradient-to-r from-emerald-800 via-emerald-600 to-lime-600 bg-clip-text text-transparent">
            Sell at Maximum Realized Profit.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          SmartAgri AI empowers Indian farmers to identify crops, monitor perishable shelf-life, prevent avoidable spoilage, compare verified APMC markets, and maximize net revenue.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-950/25 transition-all text-sm flex items-center justify-center gap-2"
          >
            <span>Launch Farmer Platform</span>
            <ArrowRight className="w-4 h-4 text-lime-400" />
          </button>
          <button
            onClick={onExploreDemo}
            className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-300 rounded-xl transition-colors text-sm shadow-xs"
          >
            Explore Tomato Sample Journey
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <ScanLine className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">AI Crop & Defect Vision</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload produce images to instantly classify crops, estimate maturity stages, identify early fungal rot, and get storage life predictions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-lime-100 text-emerald-900 flex items-center justify-center font-bold">
              <Warehouse className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">Shelf-Life & Spoilage Monitor</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track remaining days based on calibrated storage conditions (Kanda Chawl, cold storage, ambient). Get proactive liquidation warnings.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
              <BadgeDollarSign className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">Smart Sell Mandi Optimizer</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automatically subtracts diesel freight, APMC cess, and transit decay risk across candidate mandis to capture peak net profits.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-6 text-center text-xs text-slate-500">
        <p>© 2026 SmartAgri AI. Built for Indian Farmers & Post-Harvest Resilience.</p>
        <p className="mt-1 text-[11px] text-slate-400">Grow Smart • Store Safe • Sell Better</p>
      </footer>
    </div>
  )
}
