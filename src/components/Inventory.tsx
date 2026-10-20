import React, { useState } from 'react'
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  Download,
  Calendar,
  Warehouse,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  BadgeAlert
} from 'lucide-react'
import { InventoryItem, UserProfile } from '../types'
import { calculateShelfLife } from '../calculationEngine'
import { exportInventoryToCSV } from '../reportService'

interface InventoryProps {
  inventory: InventoryItem[]
  setInventory: (items: InventoryItem[]) => void
  user: UserProfile
  language: 'en' | 'ta'
  initialAddModalOpen?: boolean
  initialCropName?: string
  initialShelfLife?: number
  initialVariety?: string
  onNavigateToSmartSell?: (cropName: string, quantityKg: number) => void
}

export const Inventory: React.FC<InventoryProps> = ({
  inventory,
  setInventory,
  user,
  language,
  initialAddModalOpen = false,
  initialCropName = '',
  initialShelfLife,
  initialVariety = '',
  onNavigateToSmartSell,
}) => {
  const isTa = language === 'ta'
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRisk, setFilterRisk] = useState<string>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(initialAddModalOpen)

  // Form State
  const [cropName, setCropName] = useState(initialCropName || 'Tomato')
  const [variety, setVariety] = useState(initialVariety || 'Hybrid')
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().slice(0, 10))
  const [quantityKg, setQuantityKg] = useState<number>(100)
  const [storageLocation, setStorageLocation] = useState('Farm Warehouse Bay 1')
  const [storageCondition, setStorageCondition] = useState<'ambient' | 'ventilated' | 'cold_storage' | 'dry_shed'>('ventilated')
  const [pricePerKg, setPricePerKg] = useState<number>(34)
  const [notes, setNotes] = useState('Harvested at breaker stage')

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault()

    const shelfLifeCalc = calculateShelfLife(cropName, harvestDate, storageCondition)

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      cropName,
      variety,
      harvestDate,
      quantityKg: Number(quantityKg) || 100,
      storageLocation,
      storageCondition,
      temperatureC: storageCondition === 'cold_storage' ? 4 : storageCondition === 'ventilated' ? 24 : 29,
      humidityPercent: storageCondition === 'cold_storage' ? 90 : 70,
      estimatedShelfLifeDays: shelfLifeCalc.totalShelfLifeDays,
      daysRemaining: shelfLifeCalc.daysRemaining,
      spoilageRisk: shelfLifeCalc.spoilageRisk,
      estimatedMarketPricePerKg: Number(pricePerKg) || 30,
      notes,
      lastCheckedDate: new Date().toISOString().slice(0, 10),
    }

    const updated = [newItem, ...inventory]
    setInventory(updated)
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm(isTa ? 'இந்த அறுவடை இருப்பை நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this inventory record?')) {
      const updated = inventory.filter(i => i.id !== id)
      setInventory(updated)
    }
  }

  // Filter & Search
  const filteredItems = inventory.filter(item => {
    const matchSearch =
      item.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.variety || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.storageLocation.toLowerCase().includes(searchTerm.toLowerCase())
    const matchRisk = filterRisk === 'ALL' || item.spoilageRisk === filterRisk
    return matchSearch && matchRisk
  })

  const totalValue = inventory.reduce((acc, i) => acc + i.quantityKg * i.estimatedMarketPricePerKg, 0)
  const totalWeight = inventory.reduce((acc, i) => acc + i.quantityKg, 0)

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" />
            {isTa ? 'எனது அறுவடை சரக்கு இருப்பு' : 'My Harvest Inventory & Warehousing'}
          </h1>
          <p className="text-xs text-slate-500">
            {isTa
              ? 'அறுவடை தேதிகள், சேமிப்பு இருப்பு, கெட்டுப்போகும் மதிப்பீடு மற்றும் சந்தை விலை'
              : `Tracking ${inventory.length} lots • Total ${totalWeight.toLocaleString('en-IN')} kg • Est. ₹${Math.round(totalValue).toLocaleString('en-IN')}`}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => exportInventoryToCSV(inventory, user)}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            {isTa ? 'CSV பதிவிறக்கம்' : 'Export CSV'}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-950/20"
          >
            <Plus className="w-4 h-4 text-lime-400" />
            {isTa ? 'இருப்பு சேர்க்க' : 'Add Harvest Batch'}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isTa ? 'பயிர் பெயர் அல்லது இருப்பிடத்தை தேடுக...' : 'Search crop, variety, or warehouse...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Risk:
          </span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((risk) => (
            <button
              key={risk}
              onClick={() => setFilterRisk(risk)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                filterRisk === risk
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {risk}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const riskBadge =
            item.spoilageRisk === 'CRITICAL'
              ? 'bg-rose-500 text-white'
              : item.spoilageRisk === 'HIGH'
              ? 'bg-rose-100 text-rose-800 border-rose-300'
              : item.spoilageRisk === 'MEDIUM'
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : 'bg-emerald-100 text-emerald-800 border-emerald-300'

          const totalItemValue = item.quantityKg * item.estimatedMarketPricePerKg

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{item.cropName}</h3>
                    <p className="text-xs text-slate-500">{item.variety || 'Standard Local'}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${riskBadge}`}>
                    {item.spoilageRisk} RISK
                  </span>
                </div>

                <div className="mt-3 p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Quantity:</span>
                    <span className="font-extrabold text-slate-900">
                      {item.quantityKg.toLocaleString('en-IN')} kg ({(item.quantityKg / 100).toFixed(1)} Qtl)
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Est. Market Value:</span>
                    <span className="font-bold text-emerald-800">
                      ₹{Math.round(totalItemValue).toLocaleString('en-IN')} (@ ₹{item.estimatedMarketPricePerKg}/kg)
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Storage Condition:</span>
                    <span className="font-semibold text-slate-800 capitalize">
                      {item.storageCondition.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Harvest Date:</span>
                    <span className="font-semibold text-slate-800">{item.harvestDate}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shelf Life Left:</span>
                    <span className="font-black text-rose-600">{item.daysRemaining} days</span>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-xs text-slate-500 italic mt-2 line-clamp-2">
                    "{item.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onNavigateToSmartSell?.(item.cropName, item.quantityKg)}
                  className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <BadgeAlert className="w-3.5 h-3.5 text-emerald-700" />
                  {isTa ? 'விற்பனை வாய்ப்பு' : 'Smart Sell'}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Delete batch"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-3">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">
            {isTa ? 'பொருந்தும் இருப்பு எதுவும் கிடைக்கவில்லை' : 'No Harvest Records Matching Criteria'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {isTa
              ? 'புதிய பயிர்களை சேர்க்கவும் அல்லது தேடல் சொல்லை மாற்றவும்.'
              : 'Add a new crop lot from your fields or scan via AI crop scanner to populate your storage database.'}
          </p>
        </div>
      )}

      {/* Add / Edit Inventory Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                {isTa ? 'அறுவடை பயிர் இருப்பு பதிவு' : 'Record New Harvest Batch'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Crop Type</label>
                  <select
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Tomato">Tomato (தக்காளி)</option>
                    <option value="Onion">Onion (வெங்காயம்)</option>
                    <option value="Chilli (Green)">Chilli Green (பச்சை மிளகாய்)</option>
                    <option value="Potato">Potato (உருளைக்கிழங்கு)</option>
                    <option value="Paddy / Rice">Paddy / Rice (நெல்)</option>
                    <option value="Cotton">Cotton (பருத்தி)</option>
                    <option value="Wheat">Wheat (கோதுமை)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Variety / Grade</label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder="e.g. Shivam Hybrid, Red Nashik"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quantity (Kilograms)</label>
                  <input
                    type="number"
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(Number(e.target.value))}
                    min={1}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    = {(Number(quantityKg) / 100).toFixed(1)} Quintals
                  </span>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Harvest Date</label>
                  <input
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Storage Condition</label>
                  <select
                    value={storageCondition}
                    onChange={(e) => setStorageCondition(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="ventilated">Ventilated Warehouse (காற்றோட்டம்)</option>
                    <option value="ambient">Ambient Open Shed (இயற்கை வெப்பநிலை)</option>
                    <option value="cold_storage">Cold Storage (குளிர்பதன கிடங்கு)</option>
                    <option value="dry_shed">Dry Hermetic Shed (உலர் கிடங்கு)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Est. Price/kg (INR)</label>
                  <input
                    type="number"
                    value={pricePerKg}
                    onChange={(e) => setPricePerKg(Number(e.target.value))}
                    min={1}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Storage Location Name</label>
                <input
                  type="text"
                  value={storageLocation}
                  onChange={(e) => setStorageLocation(e.target.value)}
                  placeholder="e.g. Primary Farm Shed, Bay 2"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Observations / Curing Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Notes on firmness, humidity, color maturity..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold transition-colors shadow-md shadow-emerald-950/20"
                >
                  Save Harvest Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
