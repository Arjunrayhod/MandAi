# 🌾 MandAi — Krishi Mandi & Customizable Business Billing Suite

An all-in-one Business Billing, GST Invoicing, Mandi Vyapari Commodity Inventory, Cashbook (रोकड़ बही), Party Khatabook (लेजर), and Multi-Shop SaaS Application.

Built for Krishi Upaj Mandi Merchants, Commission Agents, and Custom Shop Owners with **1:1 pixel-perfect GST Tax Invoice generation matching authentic Indian Mandi trade bills (e.g. Rathore Trading Company, Neemuch Mandi)**.

---

## 🌟 Key Features

### 1. 🧾 1:1 Pixel-Perfect Reference GST Invoicing
- **Header Details**: Complete business branding, contact numbers, email, website, and Mandi License Number.
- **Dynamic Product Grid**: Line items with HSN/SAC codes, Qty in primary units, Rate, Taxable value, CGST (%), SGST (%), IGST (%), and Line Totals.
- **Mandi Trade Surcharges**: Dedicated entries for **Transport Charges** (भाड़ा/परिवहन) and **All other charges / Katoti** (कट्ट/कटौती).
- **Dynamic UPI QR Code**: Live SVG QR Code prefilled with exact invoice payable amount and UPI merchant ID (`upi://pay?...`).
- **Indian Number in Words**: Exact amount formatted as per Indian accounting conventions (*FOUR LAKH NINETY-EIGHT THOUSAND...*).
- **3 Switchable Templates**:
  - *Classic Rathore GST* (1:1 replica of authentic mandi tax invoice)
  - *Modern Mandi Indigo* (Corporate layout with highlighted summaries)
  - *Thermal 80mm POS Slip* (Fast 3-inch counter receipt)

### 2. 🌾 Mandi Sauda Parcha & Tol Parchi Engine (`/sauda`)
- Fast Mandi auction/sauda slip generator for yard trading.
- Automatic weight math: Gross Weight − Tare Weight (बारदान काट) = Net Weight in Quintals.
- Automatic calculation of Katoti (कट्ट) and Hammali/Tulai (हम्माली व तुलाई खर्च).
- **1-Click Conversion**: Convert any raw Sauda Slip directly into a full GST Tax Invoice.

### 3. 👥 Party & Khatabook CRM (`/parties`)
- Customer & Supplier Master with GSTIN, PAN, and Mandi Shop numbers.
- **A4 Printable Party Ledger**: Full date-wise Dr/Cr ledger statement with running balance and opening/closing accounts.
- **1-Click WhatsApp Reminder**: Direct Hindi & English payment reminder text generator with outstanding balance, due date, and UPI ID.

### 4. 📦 Mandi Commodity & Godown Stock (`/inventory`)
- Preloaded with authentic commodities: *Musakadana (मुसकादाना)*, *Isabgol (ईसबगोल)*, *Ashwagandha Nagori (अश्वगंधा)*, *Garlic (लहसुन)*, *Kalonji (कलौंजी)*, *Methi Dana (मेथी)*.
- Dual-unit tracking: **Bags / Bori (कट्टा संख्या)** + **Kg / Quintal (वजन)**.
- Live automatic stock deduction on billing and Inward/Outward stock adjuster.

### 5. 💰 Money Management & Cashbook (`/money`)
- **Cash in Hand (दुकान रोकड़)** tracker.
- Mandi expense categorization: Hammali, Tulai, Freight / Gadi Bhada, Bardan, Refreshments, and Shop Rent.
- Multi-bank accounts (HDFC Bank, SBI) with live balance tracking.

### 6. 🏪 Multi-Industry Shop Customizer (`/settings`)
- Switch instantly between:
  - 🌾 **मंडी व्यापार (Mandi Vyapar)**: Weight + Bori + Katoti + Hammali
  - 🛒 **किराना स्टोर (Kirana Store)**: Barcode + Loose Stock + Khatabook
  - 👕 **कपड़ा स्टोर (Clothing Store)**: Size + Color + Variant
  - 💊 **मेडिकल स्टोर (Medical Store)**: Batch No. + Expiry Date
  - 🔧 **हार्डवेयर (Hardware)**: HSN + Unit conversions

### 7. 💾 Complete Data Backup & Restore (`/settings`)
- 1-Click export of the entire database into a clean JSON backup file (`MandAi_Mandi_Backup_YYYY-MM-DD.json`).
- Instant restore capability from any previously saved JSON backup.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/)
- **State & Storage**: [Zustand](https://github.com/pmndrs/zustand) with persistent local storage
- **QR Code Engine**: `qrcode.react` (SVG scannable UPI QR)
- **Language**: TypeScript 5

---

## 🚀 Getting Started

### 1. Clone Repository
```bash
git clone https://github.com/Arjunrayhod/MandAi.git
cd MandAi
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 📄 License
MIT License © 2026 MandAi / Rathore Trading Company.