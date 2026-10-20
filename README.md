# SmartAgri AI — Grow Smart. Store Safe. Sell Better. 🌾

> **Tagline:** Grow Smart. Store Safe. Sell Better.  
> **Mission:** Help farmers identify crops, manage harvested produce, prevent avoidable post-harvest waste, compare agricultural markets, and make better selling decisions through AI and data-driven insights.

---

## 🌟 Architecture & Key Features

SmartAgri AI is a full-stack agritech web platform engineered specifically for Indian farmers, agricultural marketing cooperatives, and post-harvest warehousing.

### 1. AI Vision Crop Identification & Quality Inspection
- **NVIDIA Vision NIM Integration:** Uses `meta/llama-3.2-11b-vision-instruct` to visually recognize harvested crops (Tomatoes, Onions, Potatoes, Chillies, Rice/Paddy, Cotton, etc.).
- **Defect & Disease Detection:** Detects mechanical bruising, fungal pathogens (Early Blight, Anthracnose, Purple Blotch), and physiological disorders (neck sprouting, solanine greening).
- **Embedded Agronomic Fallback:** Resilient offline engine provides ICAR-calibrated assessments if external connectivity is interrupted.

### 2. Shelf-Life Estimation & Spoilage Monitor
- Estimates remaining shelf-life days dynamically based on:
  - Specific crop respiration rate and ethylene sensitivity.
  - Storage facility type (`ventilated_warehouse`, `ambient_shed`, `cold_storage`, `dry_shed`).
  - Observed ambient temperature and relative humidity.
- Categorizes inventory lots into **LOW**, **MEDIUM**, **HIGH**, and **CRITICAL** spoilage urgency.

### 3. Smart Sell Market Optimizer
- **APMC & e-NAM Mandi Matrix:** Incorporates live modal price feeds across key Indian markets (Dindigul, Lasalgaon, Koyambedu, Pimpalgaon, Guntur, Kolar, Karnal).
- **Net Margin Algorithm:**
  $$\text{Net Revenue} = (\text{Quantity} \times \text{Modal Price}) - \text{Transport Freight} - \text{APMC Cess} - \text{Packaging Costs}$$
- **Spoilage Urgency Weighting:** Automatically penalizes long-distance transit when perishable stocks have fewer than 3 days of shelf life remaining.

### 4. Bilingual AI Agronomist ("SmartAgri Mitra") with Voice
- Seamless English and Tamil (தமிழ்) chat assistant.
- **ElevenLabs Speech Synthesis:** Provides spoken audio playback for farmers with limited literacy.

### 5. Verified Audit Reporting
- One-click **PDF Audit Reports** for institutional financing, crop insurance claims, and logistics dispatch.
- **CSV Data Export** for detailed spreadsheet analysis.

---

## 🚀 Quickstart & Setup

### Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm or yarn

### Configuration (.env)
The application automatically reads the backend environment file:
```env
PORT=5173
NVIDIA_API_KEY=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
NVIDIA_MODEL=meta/llama-3.2-11b-vision-instruct
ELEVENLABS_API_KEY=sk_9abcefe9f23fd782c1d3444a292c370698a7307f2dbc8b00
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

### Running the Application
```bash
# 1. Install dependencies
npm install

# 2. Compile frontend bundle
npm run build

# 3. Start full-stack server
node server.mjs
```
The application will be live at: **`http://localhost:5173`**

---

## 🌾 Demonstration Farmer Journey (Evaluation Walkthrough)

1. **Landing Page:** Open `http://localhost:5173` and click **"Launch Farmer Platform"** or **"Explore Tomato Sample Journey"**.
2. **Dashboard:** Review the personalized KPI cards (Total Stock, INR Inventory Value, Stock at Risk, and Mandi Highlights).
3. **AI Crop Scanner:**
   - Click **"Load Demo Tomato Sample"** (or upload any farm image).
   - Click **"Analyze Crop Image"** to trigger the NVIDIA Vision inspection.
   - Click **"Record into My Harvest Inventory"**.
4. **My Inventory:** Edit quantities, view remaining days countdown, and export CSV.
5. **Storage Monitor:** Check temperature and relative humidity tolerances for each produce batch.
6. **Smart Sell:** Adjust dispatch quantity (e.g. 500 kg) and diesel price to see real-time net realization rankings.
7. **AI Mitra Assistant:** Switch to Tamil (`தமிழ்`) or English to ask voice-enabled post-harvest questions.
8. **Reports:** Click **"Download Full PDF Audit"** to generate the executive report with charts and disclaimers.