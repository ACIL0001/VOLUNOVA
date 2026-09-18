# VOLUNOVA (تكاتف الذكي) — Volunteer Operating System

> **An AI-First Volunteer Management Operating System with Zero-Trust Security Architecture**
> Built with modern web and mobile frameworks, decoupled into four standalone projects for maximum scalability, security, and independent deployment.

---

## 🏗️ Project Architecture (The 4 Core Projects)

```
VOLUNOVA/
│
├── 📁 backend/        # Centralized REST & Realtime API (Port 5000)
│                      # Node.js, Express 5, TypeScript, MongoDB, Gemini AI, Nodemailer, Resend
│
├── 📁 frontend/       # Organization & NGO Command Portal (Port 3000)
│                      # Next.js 16, React 19, Tailwind CSS v4, Lucide, Dual-Screen Pitch Demo
│
├── 📁 admin/          # Dedicated Admin Dashboard (Port 3001)
│                      # Next.js 16, React 19, Telemetry KPIs, NGO Verification Queue, Zero-Trust Audit Logs
│
└── 📁 application/    # Volunteer Mobile Application (Port 8081)
                       # React Native, Expo SDK 57, Login/Signup, Skill Picker, Digital Impact Passport
```

---

## 🚀 Quick Start (Running Locally)

### Prerequisites
- **Node.js**: v20+ or v24
- **MongoDB**: Local running instance (`mongodb://127.0.0.1:27017/volunova`)

---

### 1. Start the Backend API (Port 5000)
```bash
cd backend
npm install
npm run dev
```
* **API Health Check**: `http://localhost:5000/api/health`
* **1-Click Demo Seed**: `POST http://localhost:5000/api/seed`
* **Automated Emails**: Uses Nodemailer SMTP / Resend. If no credentials are set, automatically generates an Ethereal test account with instant browser preview URLs.

---

### 2. Start the NGO Web Portal (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
* **Landing & Impact Wall**: [http://localhost:3000](http://localhost:3000)
* **AI Smart Mission Studio**: [http://localhost:3000/missions/create](http://localhost:3000/missions/create)
* **Explore Missions**: [http://localhost:3000/missions/browse](http://localhost:3000/missions/browse)
* **⚡ 180s Hackathon Dual-Screen Demo**: [http://localhost:3000/demo](http://localhost:3000/demo)

---

### 3. Start the Dedicated Admin Dashboard (Port 3001)
```bash
cd admin
npm install
npm run dev
```
* **National Impact Telemetry**: [http://localhost:3001](http://localhost:3001)
* **NGO Verification Queue**: [http://localhost:3001/organizations](http://localhost:3001/organizations)
* **Missions Moderation**: [http://localhost:3001/missions](http://localhost:3001/missions)
* **Volunteer Directory**: [http://localhost:3001/volunteers](http://localhost:3001/volunteers)
* **Zero-Trust Audit Log**: [http://localhost:3001/audit](http://localhost:3001/audit)

---

### 4. Start the Volunteer Mobile App (Port 8081)
```bash
cd application
npm install
npm start
```
* Press `w` to open in web browser.
* Or scan the QR code with **Expo Go** on Android or iOS.
* Features: Register/Login, 1-Tap Demo Volunteer Login as Ahmed Benali, Interactive 10-skill tag selector, Digital Passport with QR simulation.

---

## ⚡ The 180-Second Winning Demo Flow
1. Open [http://localhost:3000/demo](http://localhost:3000/demo) in your browser.
2. Notice the **Left Screen** (Organization Live Ops Center) and **Right Screen** (Volunteer Ahmed's Phone).
3. The AI has matched Ahmed (`98% Match`) to the **Graphic Designer** slot.
4. Click **"انضم للمهمة الآن (1-Tap RSVP)"** on the mobile screen:
   - Phone triggers a confetti explosion!
   - Graphic Designer slot on the left screen jumps from `0/1 (0%)` to `1/1 (100%)` in real time.
   - Total impact hours jump by 4 hours.
   - An automated acceptance email with QR check-in pass is dispatched to the volunteer!

---

## 🔒 Enterprise Cybersecurity & Compliance
- **BOLA/BFLA Protection**: Strict object ownership checks and role guards on every endpoint.
- **CVE-2025-29927 Mitigation**: In-handler session authorization independent of middleware.
- **NoSQL Injection Neutralization**: Strict Zod DTO schema parsing on 100% of routes.
- **PII Privacy & Geo-Fuzzing (Algerian Law 18-07 / GDPR)**: 500m Gaussian jitter coordinate obfuscation on public reads.
- **Atomic Concurrency Locks**: Database-level `$expr: { $lt: ['$quantityFulfilled', '$quantityNeeded'] }` locks preventing slot overbooking.
- **Zero-Trust Audit Trail**: SHA-256 signed event logging for all auth attempts, mission RSVPs, and administrative approvals.
