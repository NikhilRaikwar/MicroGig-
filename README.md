# MicroGig 🌌 | Stellar Journey to Mastery - Level 1

**MicroGig** is a decentralized nano-task marketplace built on the Stellar Network. This project is a submission for **Level 1 (White Belt)**, focusing on the core fundamentals of Stellar development: wallets, balances, and transactions.

## 🥋 Level 1 Requirements & Implementation

To successfully complete Level 1, this project implements the following core standards:

### 1. Wallet Setup
- [x] **Freighter Wallet**: Integrated the industry-standard browser extension.
- [x] **Stellar Testnet**: Configured to operate exclusively on the Testnet environment.

### 2. Wallet Connection
- [x] **Connect**: Users can securely link their public key.
- [x] **Disconnect**: Full logout functionality to clear the session.

### 3. Balance Handling
- [x] **Live Fetching**: Real-time balance retrieval from the Stellar Horizon API.
- [x] **Clear Display**: Balance is displayed with high precision (7 decimals) to track nano-payments.

### 4. Transaction Flow
- [x] **Send XLM**: Live XLM transactions processed on the Stellar Testnet.
- [x] **User Feedback**: Immediate Success/Failure states shown via a custom results dialog.
- [x] **Proof**: Transaction hashes and direct links to the ledger are provided for every payment.

### 5. Development Standards
- [x] **UI/Logic Setup**: Modern React + Tailwind CSS with glassmorphism design.
- [x] **Error Handling**: Robust try/catch blocks for wallet rejections and network errors.

## 🛠️ Tech Stack
- **Framework**: Vite + React + TypeScript
- **Blockchain**: `@stellar/stellar-sdk` + `@stellar/freighter-api`
- **Styling**: Tailwind CSS + Framer Motion
- **Network**: Stellar Testnet

## ⚙️ Setup & Installation

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Freighter Wallet](https://www.freighter.app/) extension installed in your browser.
- Set Freighter to **Testnet** (Settings -> Network -> Testnet).

### 2. Run Locally
```bash
# Clone the repository and enter the directory
cd microgig-stellar-pay-main

# Install dependencies
npm install

# Start the development server
npm run dev
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## 📸 Screenshots (Submission Proofs)

### 1. Wallet Connected & Balance Displayed
<img width="1920" height="1133" alt="screencapture-localhost-8080-2026-02-10-18_10_04" src="https://github.com/user-attachments/assets/3e329a94-8064-4b21-bddf-19edbf8fd759" />

*Description: The home page with the Freighter wallet connected and the live XLM balance fetched from the Stellar Testnet (showing 7 decimal places).*

### 2. Transaction Result (UI Feedback)
<img width="1920" height="1290" alt="screencapture-localhost-8080-2026-02-10-18_14_30" src="https://github.com/user-attachments/assets/0c6e1636-7d6c-477b-8011-34ca46a900b5" />

*Description: The in-app confirmation modal appearing instantly after a successful on-chain payment.*

### 3. On-Chain Verification (Stellar Expert)
<img width="1920" height="1016" alt="screencapture-stellar-expert-explorer-testnet-tx-c1e599138728e6fe0e72a11bc83aa3b2b98899a81dcdedc46e6a93ff2c2e94d8-2026-02-10-18_14_46" src="https://github.com/user-attachments/assets/17851712-b790-4615-bfa1-c414046e2fe5" />

*Description: Detailed view of the transaction on the Stellar Expert explorer, proving successful settlement on the ledger.*

---

## 📝 Demo Instructions
1.  **Fund Wallet**: Click the **"Fund"** button in the navbar to get 10,000 Testnet XLM.
2.  **Post**: Create a task titles "Design Logo" for 5 XLM.
3.  **Claim**: Click **"Claim Task"** on the card.
4.  **Submit**: Enter a note like "Work link: google.com" and click **"Submit Work"**.
5.  **Pay**: Click **"Pay Worker"** and sign the transaction in Freighter.
6.  **Verify**: Click "View Receipt" to see the transaction on the ledger.

---
Built for the **Stellar Journey to Mastery** • 2026
