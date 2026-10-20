import React, { useState } from 'react'
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  PieChart,
  BarChart3,
  DollarSign,
  AlertTriangle,
  Receipt,
  Info
} from 'lucide-react'
import { UserProfile, FarmExpense, InventoryItem, FarmingTask } from '../types'
import { getStoredFarmTasks, saveStoredFarmTasks } from '../storageService'

interface BusinessPlannerProps {
  user: UserProfile
  expenses: FarmExpense[]
  inventory: InventoryItem[]
  language: 'en' | 'ta'
  onNavigateToExpenseScanner: () => void
}

export const FarmBusinessPlanner: React.FC<BusinessPlannerProps> = ({
  user,
  expenses,
  inventory,
  language,
  onNavigateToExpenseScanner,
}) => {
  const isTa = language === 'ta'
  const [selectedCrop, setSelectedCrop] = useState('Tomato')
  const [targetAcreage, setTargetAcreage] = useState(2.5)

  // Farming Tasks state for Copilot
  const [tasks, setTasks] = useState<FarmingTask[]>(() => getStoredFarmTasks(user.id))

  const toggleTask = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    setTasks(updated)
    saveStoredFarmTasks(user.id, updated)
  }

  // Calculate actual expenses for the selected crop from the Expense Scanner
  const actualCropExpenses = expenses
    .filter(e => e.cropAssociated.toLowerCase() === selectedCrop.toLowerCase())
    .reduce((acc, e) => acc + e.amountINR, 0)

  // Baseline standard costs per acre for selected crop (ICAR agronomic estimates)
  const costPerAcreBaselines: Record<string, { seeds: number; fertilizers: number; labor: number; irrigation: number; machinery: number; expectedYieldQtl: number; modalPriceQtl: number }> = {
    'Tomato': { seeds: 4500, fertilizers: 9500, labor: 14000, irrigation: 3500, machinery: 4000, expectedYieldQtl: 140, modalPriceQtl: 3500 },
    'Onion': { seeds: 6000, fertilizers: 8500, labor: 11000, irrigation: 3000, machinery: 4500, expectedYieldQtl: 95, modalPriceQtl: 2850 },
    'Chilli (Green)': { seeds: 5000, fertilizers: 11000, labor: 16000, irrigation: 4000, machinery: 3500, expectedYieldQtl: 65, modalPriceQtl: 6200 },
    'Paddy / Rice': { seeds: 2500, fertilizers: 6500, labor: 8000, irrigation: 2500, machinery: 4500, expectedYieldQtl: 30, modalPriceQtl: 2450 },
  }

  const baseline = costPerAcreBaselines[selectedCrop] || costPerAcreBaselines['Tomato']
  const budgetedCost = (baseline.seeds + baseline.fertilizers + baseline.labor + baseline.irrigation + baseline.machinery) * targetAcreage

  // Expected Production
  const totalExpectedYieldQuintals = baseline.expectedYieldQtl * targetAcreage

  // Financial Scenarios: Conservative (-20% price), Moderate (modal price), Optimistic (+25% price)
  const conservativePrice = baseline.modalPriceQtl * 0.8
  const moderatePrice = baseline.modalPriceQtl
  const optimisticPrice = baseline.modalPriceQtl * 1.25

  const conservativeGross = totalExpectedYieldQuintals * conservativePrice
  const moderateGross = totalExpectedYieldQuintals * moderatePrice
  const optimisticGross = totalExpectedYieldQuintals * optimisticPrice

  const effectiveCost = actualCropExpenses > 0 ? actualCropExpenses : budgetedCost

  const conservativeNet = conservativeGross - effectiveCost
  const moderateNet = moderateGross - effectiveCost
  const optimisticNet = optimisticGross - effectiveCost

  // Break-even yield per acre
  const breakEvenPricePerQuintal = totalExpectedYieldQuintals > 0 ? effectiveCost / totalExpectedYieldQuintals : 0

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-emerald-600" />
            {isTa ? 'AI பண்ணை வணிக திட்டம் & லாபக் கணக்கீடு' : 'AI Farm Business Planner & Crop Budgeting'}
          </h1>
          <p className="text-xs text-slate-500">
            {isTa
              ? 'வரவு செலவு சமநிலை (Break-Even), நடைமுறை செலவுகள் மற்றும் 3 நிதி சூழ்நிலைகள்'
              : 'Integrated with your actual scanned expenses to project realistic cash flows and market scenarios'}
          </p>
        </div>

        <button
          onClick={onNavigateToExpenseScanner}
          className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Receipt className="w-4 h-4 text-emerald-700" />
          <span>View Scanned Expenses (₹{actualCropExpenses.toLocaleString('en-IN')})</span>
        </button>
      </div>

      {/* Control Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Crop:</span>
          {['Tomato', 'Onion', 'Chilli (Green)', 'Paddy / Rice'].map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCrop === crop
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Target Acreage:</span>
          <input
            type="number"
            value={targetAcreage}
            onChange={(e) => setTargetAcreage(Math.max(0.5, Number(e.target.value)))}
            step={0.5}
            min={0.5}
            className="w-24 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-black text-slate-800 focus:outline-none"
          />
          <span className="text-xs text-slate-500">Acres</span>
        </div>
      </div>

      {/* Integrated Expenses Callout */}
      {actualCropExpenses > 0 ? (
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Live Receipt Scanner Link Active: Using ₹{actualCropExpenses.toLocaleString('en-IN')} actual recorded expenses for {selectedCrop}.
          </span>
          <span className="font-extrabold text-emerald-800">Verified From Invoices</span>
        </div>
      ) : (
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <Info className="w-4 h-4 text-amber-600" />
            No live receipt entries found for {selectedCrop}. Using benchmark ICAR agronomic budget of ₹{budgetedCost.toLocaleString('en-IN')}.
          </span>
          <button
            onClick={onNavigateToExpenseScanner}
            className="font-bold underline text-amber-800 hover:text-amber-950"
          >
            Scan Invoices Now
          </button>
        </div>
      )}

      {/* 3 Financial Scenarios Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Conservative */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              Conservative Scenario (-20%)
            </span>
            <TrendingDown className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Selling Price: ₹{conservativePrice}/Qtl</div>
            <div className={`text-2xl font-black mt-1 ${conservativeNet >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
              ₹{Math.round(conservativeNet).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Est. Net Margin (Adverse gluts)</p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Gross Sales:</span>
              <span className="font-bold text-slate-700">₹{Math.round(conservativeGross).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Costs:</span>
              <span className="font-bold text-slate-700">₹{Math.round(effectiveCost).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Moderate / Baseline */}
        <div className="bg-emerald-50/50 rounded-2xl p-5 border-2 border-emerald-400 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/60 px-2.5 py-0.5 rounded-full">
              ⭐ Expected / Modal Market
            </span>
            <Sparkles className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="text-xs text-emerald-700 font-semibold">Current Modal: ₹{moderatePrice}/Qtl</div>
            <div className="text-2xl font-black text-emerald-900 mt-1">
              ₹{Math.round(moderateNet).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Projected Net Realization</p>
          </div>
          <div className="pt-2 border-t border-emerald-200 text-[11px] text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Gross Sales:</span>
              <span className="font-bold text-slate-900">₹{Math.round(moderateGross).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Costs:</span>
              <span className="font-bold text-slate-900">₹{Math.round(effectiveCost).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Optimistic */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-lime-700 bg-lime-100 px-2 py-0.5 rounded-full">
              Optimistic Scenario (+25%)
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs text-lime-700 font-semibold">Peak Demand: ₹{optimisticPrice}/Qtl</div>
            <div className="text-2xl font-black text-emerald-800 mt-1">
              ₹{Math.round(optimisticNet).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Peak Supply Crunch Return</p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Gross Sales:</span>
              <span className="font-bold text-slate-700">₹{Math.round(optimisticGross).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Costs:</span>
              <span className="font-bold text-slate-700">₹{Math.round(effectiveCost).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Break-Even & Yield Insights */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <span className="text-slate-400 font-bold block uppercase">Break-Even Modal Threshold</span>
          <div className="text-xl font-black text-slate-900 mt-0.5">
            ₹{Math.round(breakEvenPricePerQuintal)} / Quintal
          </div>
          <p className="text-[11px] text-slate-500">Minimum gate rate needed to recover all input costs</p>
        </div>

        <div>
          <span className="text-slate-400 font-bold block uppercase">Projected Total Harvest</span>
          <div className="text-xl font-black text-emerald-800 mt-0.5">
            {totalExpectedYieldQuintals} Quintals ({(totalExpectedYieldQuintals * 100).toLocaleString('en-IN')} kg)
          </div>
          <p className="text-[11px] text-slate-500">Calculated on {targetAcreage} acres @ {baseline.expectedYieldQtl} Qtl/Acre</p>
        </div>

        <div>
          <span className="text-slate-400 font-bold block uppercase">Cost of Cultivation</span>
          <div className="text-xl font-black text-slate-900 mt-0.5">
            ₹{Math.round(effectiveCost / targetAcreage).toLocaleString('en-IN')} / Acre
          </div>
          <p className="text-[11px] text-slate-500">Including labor, fertilizers, seeds, and irrigation</p>
        </div>
      </div>

      {/* AI Farming Copilot: Daily Actionable Tasks */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-extrabold text-slate-900">
              {isTa ? 'AI விவசாய துணைவர்: தினசரி பண்ணை பணிகள்' : 'AI Farming Copilot: Actionable Field Schedule'}
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            {tasks.filter(t => t.completed).length} / {tasks.length} Completed
          </span>
        </div>

        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                task.completed ? 'bg-slate-50/70 border-slate-200' : 'bg-white border-slate-200/90 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-500"
                />
                <div>
                  <h4 className={`text-xs font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {isTa ? task.titleTa : task.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span>Due: {task.dueDate}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">{task.cropName}</span>
                    <span>•</span>
                    <span>{task.category}</span>
                  </div>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                task.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {task.priority}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
