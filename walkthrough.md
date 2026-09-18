# VOLUNOVA (تكاتف الذكي) — Complete Ecosystem Walkthrough

## Summary of Completed Work

The **VOLUNOVA (تكاتف الذكي)** platform has been expanded into a **4-tier decoupled enterprise architecture**:
1. **`backend/` (Port 5000)** — Central Node.js / Express 5 API with MongoDB, Gemini AI, Nodemailer/Resend automated transactional emails, and Admin supervision routes.
2. **`frontend/` (Port 3000)** — Next.js 16 NGO Portal, AI Smart Mission Studio, Live Operations Room, and Hackathon Dual-Screen Pitch Demo.
3. **`application/` (Port 8081)** — Expo SDK 57 Volunteer Mobile App with real Login/Signup, interactive Skill Picker, Digital Impact Passport, and 1-Tap RSVP.
4. **`admin/` (Port 3001)** — Dedicated standalone Next.js 16 Admin Dashboard for national impact analytics, NGO verification queues, mission moderation, volunteer directory, and Zero-Trust audit logs.

---

## 📱 1. Volunteer Authentication & Skill Selection (`application/`)

### Key Capabilities Implemented:
- **Authentication Screen ([AuthScreen.tsx](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/application/src/components/AuthScreen.tsx))**:
  - **Login & Register Modes**: Switch between existing account login and new volunteer onboarding.
  - **1-Tap Demo Volunteer Login**: Pre-fills credentials for **Ahmed Benali** (`ahmed@volunova.dz`) with instant authentication.
  - **Field Validation**: Name, Email, Password, City/Wilaya, and customized skill tags.
  - **Persistent Storage**: Uses `@react-native-async-storage/async-storage` to remember active sessions and tokens across app restarts.
  - **Logout Flow**: Allows volunteers to sign out and switch accounts or re-configure profile.
- **Interactive Skill Picker ([SkillPickerModal.tsx](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/application/src/components/SkillPickerModal.tsx))**:
  - Multi-select modal allowing volunteers to choose from **10 specialized civic skill tags**:
    - `🎨 Graphic Design`
    - `🎥 Drone Videography`
    - `📸 Photography`
    - `🩺 First Aid & CPR`
    - `📦 Logistics & Fleet`
    - `🗣️ Translation`
    - `💻 Web Development`
    - `📣 Social Media`
    - `🌱 Environmental Planting`
    - `🍳 Community Food Prep`
  - Selected skills dynamically display as pill badges in the user's header profile.
- **Authenticated 1-Tap RSVP & Headers**:
  - When joining a mission, requests include `Authorization: Bearer ${token}`.
  - Profile header dynamically renders the authenticated volunteer's name, initials avatar, certified hours, and personalized skill chips.
- **Tri-Lingual Localization**:
  - Auth titles, placeholders, skill labels, and buttons are translated into Arabic, French, and English in [fr.ts](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/application/src/locales/fr.ts), [en.ts](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/application/src/locales/en.ts), and [ar.ts](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/application/src/locales/ar.ts).

---

## 📧 2. Automated Mission Acceptance Email Dispatch (`backend/`)

### Dual-Engine Delivery Architecture ([emailService.ts](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/backend/src/services/emailService.ts)):
- **Nodemailer SMTP Transporter**:
  - Configurable via `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS`.
- **Resend API Integration**:
  - Fallback engine configurable via `RESEND_API_KEY`.
- **Zero-Config Ethereal Preview**:
  - If SMTP/Resend credentials are not configured in `.env`, the service automatically initializes a mock **Ethereal Test Account** and outputs a **one-click clickable preview URL** in the backend console (e.g., `https://ethereal.email/message/...`).
- **High-End Responsive Email Template**:
  - Gradient branded header with VOLUNOVA logo wordmark.
  - **Civic Digital Pass QR simulation** with applicant reference token.
  - Structured mission metadata: Mission Title, Assigned Role, Host NGO, Venue location, Date/Time, and Certified Impact Hours badge.
  - Operational instructions: arrival notice, equipment requirements, coordinator check-in pass.
- **Atomic Trigger on RSVP**:
  - Integrated into `POST /api/missions/:id/join` in [missions.ts](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/backend/src/routes/missions.ts). Once the concurrency-safe slot lock succeeds, the acceptance email is asynchronously dispatched and logged in the Zero-Trust audit log.

---

## 🛡️ 3. Dedicated Admin Dashboard (`admin/` - Port 3001)

A brand new, completely separate **Next.js 16.3.5** application with React 19, Tailwind CSS v4, Lucide React, and typed REST client connecting to `http://localhost:5000/api`.

### Core Admin Modules:
1. **National Impact Telemetry ([page.tsx](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/admin/src/app/page.tsx))**:
   - Aggregate KPIs: Total Registered Volunteers, Active Field Missions, Total Certified Hours, Active Wilayas, and Overall Slot Fulfillment Rate.
   - Category distribution cards (Environmental, Health, Humanitarian, Education).
   - Quick Action bar for instant NGO verification and campaign supervision.
2. **NGO Verification Queue ([organizations/page.tsx](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/admin/src/app/organizations/page.tsx))**:
   - Manage civic organizations with status filters (`Tous`, `En attente`, `Vérifié`, `Rejeté`).
   - One-tap approval (`Vérifier`) or rejection (`Rejeter`) with immediate status badge update.
   - Organization legal credentials, contact info, total published missions, and mobilized volunteers.
3. **Missions Control ([missions/page.tsx](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/admin/src/app/missions/page.tsx))**:
   - Real-time catalog of all national missions across NGOs.
   - Staffing progress tracking (`X/Y postes pourvus`).
   - Moderator action to cancel missions violating community guidelines.
4. **Volunteer Directory ([volunteers/page.tsx](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/admin/src/app/volunteers/page.tsx))**:
   - Complete list of volunteers with search and city filters.
   - Profile badges, reliability scores, certified volunteer hours, and skill tags.
5. **Zero-Trust Audit Log ([audit/page.tsx](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/admin/src/app/audit/page.tsx))**:
   - Real-time immutable record of authentication events (`user.login`), RSVPs (`mission.join`), NGO reviews, and cancellations.
   - Action filtering (`Auth`, `Missions`, `ONG`) and interactive JSON payload inspector.

### Backend Admin API ([routes/admin.ts](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/backend/src/routes/admin.ts)):
- `GET /api/admin/stats` &mdash; Aggregated platform metrics and category distribution.
- `GET /api/admin/organizations` &mdash; Organizations listing with user contact details.
- `PATCH /api/admin/organizations/:id/verify` &mdash; Approve or reject an organization.
- `GET /api/admin/missions` &mdash; Supervise all missions.
- `DELETE /api/admin/missions/:id` &mdash; Moderate/cancel a mission.
- `GET /api/admin/volunteers` &mdash; Volunteer registry.
- `GET /api/admin/audit-logs` &mdash; Security audit logs.

---

## 🎨 4. Design Aesthetics & Consistency

- **Color Harmony**: Deep midnight navy background (`#060B18`, `#0A132C`) accented with vibrant electric blue (`#2563EB`, `#38BDF8`) and pure white.
- **Strict Green Reservation Rule**:
  - Green (`#10B981` / Emerald) is strictly reserved for **Accept Confirmation Boxes** and **Staffing Progress Indicators**. All other actions, badges, and headers utilize the Volunova blue/indigo palette.
- **Layout & Structure**: Consistent sidebar navigation with badge counters, sticky top header with quick stats, search, and responsive cards across all resolutions.

---

## 🧪 5. Verification Results

All 4 components compile with **0 errors**:
- **`backend/`**: `npx tsc --noEmit` &rarr; **0 errors**.
- **`frontend/`**: `npx tsc --noEmit` &rarr; **0 errors**.
- **`application/`**: `npx tsc --noEmit` &rarr; **0 errors**.
- **`admin/`**: `npx tsc --noEmit` &rarr; **0 errors**; `npm run build` &rarr; **Successfully built 5 static routes**.

---

## 🚀 6. How to Run the Entire Ecosystem

Open 4 separate terminal tabs:

```bash
# Terminal 1: Central Backend API (Port 5000)
cd backend
npm run dev

# Terminal 2: Organization Web Portal & AI Studio (Port 3000)
cd frontend
npm run dev

# Terminal 3: Dedicated Admin Dashboard (Port 3001)
cd admin
npm run dev

# Terminal 4: Volunteer Mobile App (Port 8081)
cd application
npm start
```

### Access Points:
- **NGO Web Portal & AI Studio**: [http://localhost:3000](http://localhost:3000)
- **Live Matchmaking Room**: [http://localhost:3000/missions/665000000000000000000001](http://localhost:3000/missions/665000000000000000000001)
- **Interactive Dual-Screen Demo**: [http://localhost:3000/demo](http://localhost:3000/demo)
- **Admin Dashboard**: [http://localhost:3001](http://localhost:3001)
- **Mobile App**: Scan Expo QR code with Expo Go on Android/iOS, or press `a` for Android emulator / `w` for web preview.
