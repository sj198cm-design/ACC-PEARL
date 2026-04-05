# solid-inventory-management-system
A 5-sheet Google Sheets inventory management system  for small businesses, connected to a mobile web app  built with HTML, CSS and JavaScript via Google Apps Script.
#  Solid Inventory — Small Business Inventory Management System

A full-stack inventory management system built specifically 
for small businesses that lack proper financial records.
Combines a Google Sheets accounting engine with a 
mobile-first web app for data entry.

---

##  Problem Statement

Millions of small businesses across Nigeria operate without 
proper inventory records — no stock tracking, no receivables 
management, no visibility into gross profit. 
This project addresses that gap with a simple, accessible, 
zero-cost solution.

---

##  System Architecture
Mobile Web App (HTML/CSS/JS)
↓
Google Apps Script (Backend)
↓
Google Sheets (Database + Calculation Engine)
↓
Financial Dashboard (Auto-generated Reports)

---

## 📊 The 5-Sheet Engine

| Sheet | Purpose |
|---|---|
| **Master_Data** | Central product database — IDs, prices, units, categories |
| **Opening_Inventory** | Daily opening stock position and new stock received |
| **Transactions** | Live recording of all sales and purchases |
| **Closing_Inventory** | Auto-calculated end-of-day stock balance |
| **Financial_Dashboard** | Revenue, COGS, Gross Profit, Receivables, Working Capital |

---

## 📱 Web App Features

Built with HTML, CSS and JavaScript — deployed via 
Google Apps Script as a mobile-first progressive web app.

### 4 Input Forms:
-  **Product Entry** — Add new products to Master Data
-  **Opening Stock** — Record daily opening position
-  **Daily Activity** — Record Cash Sales, Credit Sales 
  and Stock Purchases
-  **Payment Collection** — Reduce outstanding 
  credit balances

### Home Dashboard:
Pulls live figures directly from the Financial_Dashboard 
sheet:
- Revenue Summary (Cash, Credit, Total)
- COGS and Gross Profit
- Inventory Movement
- Working Capital and Receivables

---

##  Key Financial Logic

### COGS Formula
COGS = Opening Stock Value
+ Stock Purchases During Day
− Closing Stock Value
All values calculated at **cost price** for accuracy.

### Closing Balance
Closing Balance = Total Available − Total Sold +
Stock Purchased During Day

### Working Capital
Net Working Capital = (Closing Stock Value +
Outstanding Receivables)
− Opening Stock Value

---

##  Technical Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (ES6) |
| Backend | Google Apps Script |
| Database | Google Sheets |
| Deployment | Google Apps Script Web App |
| Formulas | VLOOKUP, SUMIFS, INDEX/MATCH, SUMPRODUCT |

---

##  Key Design Decisions

**1. Spreadsheet is the brain — app is input only**
All calculations, totals and financial summaries live 
entirely in the spreadsheet. The web app writes only 
raw input fields — date, product ID, quantity, 
transaction type. This keeps the system auditable 
and reliable.

**2. Static date stamping**
Traditional `=TODAY()` formulas change daily, corrupting 
historical records. The web app stamps a permanent static 
date at the exact moment of submission — preserving every 
transaction's true date forever.

**3. Smart row detection**
Google Apps Script's `getLastRow()` counts formatted rows 
not just data rows. A custom `findNextEmptyRow()` function 
scans for truly empty cells, ensuring entries always land 
in the correct position.

**4. Formula-driven auto-population**
Entering a Product ID in any sheet automatically triggers 
VLOOKUP formulas to pull the product name, unit, cost price 
and selling price from Master_Data — eliminating duplicate 
entry and human error.

---

##  System Metrics

- **5** interconnected sheets
- **1,700+** live formulas
- **4** web app input forms
- **13** financial metrics on dashboard
- **Zero** software installation required
- Works on **any mobile browser**

---

##  How to Use

### Step 1 — Set Up the Spreadsheet
1. Make a copy of the Google Sheet template
2. Add your products to Master_Data (Sheet 1)
3. Note your Spreadsheet ID from the URL

### Step 2 — Deploy the Web App
1. Open Google Apps Script (Extensions → Apps Script)
2. Paste Code.gs and Index.html
3. Replace SPREADSHEET_ID with your sheet ID
4. Deploy as Web App → Anyone can access
5. Copy the web app URL

### Step 3 — Start Recording
1. Open the web app on your phone
2. Add your opening stock each morning
3. Record every transaction during the day
4. View your Financial Dashboard at end of day

---

## 📁 File Structure
├── Code.gs          # Google Apps Script backend
├── Index.html       # Web app (HTML + CSS + JavaScript)
└── README.md        # This file

---

## 🔮 Planned Improvements

- [ ] Multi-day historical tracking with automatic 
      carry-forward of closing balances
- [ ] Aged debtors analysis report
- [ ] Low stock automated alerts via email
- [ ] Barcode scanning for product entry
- [ ] Export to PDF for daily reports
- [ ] Multi-user access with role permissions

---

## 👤 Author

@wannabeweb3guy - **M.A Ogunbanjo** 
Penultimate Accounting Student — University of Ilorin,Kwara state, Nigeria.

Built at the intersection of accounting knowledge 
and technology to solve a real problem for real businesses.

email- [adewaleogunbanjo6@gmail.com ]
LinkedIn [www.linkedin.com/in/MAOgunbanjo1104]

---

## 📄 License

MIT License — free to use, modify and distribute.
