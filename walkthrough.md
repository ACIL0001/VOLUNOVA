# Render Deployment Fix Walkthrough

## Summary of Completed Work

We diagnosed and resolved the Render build/deploy error:
`ENOENT: no such file or directory, open '/opt/render/project/src/package.json'`

---

## 🔍 Root Cause

In your repository ([`ACIL0001/VOLUNOVA`](https://github.com/ACIL0001/VOLUNOVA)), the codebase is organized as a monorepo:
- `Backend/package.json`
- `Frontend/package.json`
- `application/package.json`

Because there is no `package.json` at the root, Render's default build and start commands (`yarn` and `npm start`) executed in the root directory and failed to find a `package.json`.

---

## 🛠️ How to Fix in Render Dashboard

### For the Backend Web Service:
In your **Render Dashboard** &rarr; Select your Web Service &rarr; **Settings**:
- **Root Directory**: `Backend` *(⚠️ Capital B)*
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `NODE_ENV` = `production`
  - `MONGODB_URI` = `<your MongoDB Atlas connection string>`
  - `JWT_SECRET` = `<your secret>`
  - `GEMINI_API_KEY` = `<your key>`

### For the Frontend Web Service:
In your **Render Dashboard** &rarr; Select your Web Service &rarr; **Settings**:
- **Root Directory**: `Frontend` *(⚠️ Capital F)*
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `NODE_ENV` = `production`
  - `NEXT_PUBLIC_API_URL` = `<your deployed backend URL, e.g. https://volunova-backend.onrender.com/api>`

---

## 📄 Added `render.yaml` Blueprint

We created a [`render.yaml`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/render.yaml) file at the repository root defining both services so Render automatically knows their `rootDir`, `buildCommand`, and `startCommand`.

---

## 🧪 Local Build Verifications
- `Backend/`: Ran `npm run build` &rarr; `tsc` passed with **0 errors**, generated `dist/server.js`.
- `Frontend/`: Ran `npm run build` &rarr; Next.js 16 passed with **0 errors**, generated all 17 static & dynamic routes.
- `application/`: Ran `npx tsc --noEmit` &rarr; Expo mobile app passed with **0 errors**.

---

## 🚀 100% Real Live Data Transition

All hardcoded mock baselines, fake offline bypasses, and static fallback cards have been purged across the platform:

1. **Backend Real Aggregates ([`stats.ts`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/Backend/src/routes/stats.ts) & [`admin.ts`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/Backend/src/routes/admin.ts))**:
   - `totalImpactHours`: Exact sum of `impactHours` of volunteers in MongoDB.
   - `volunteersMobilized`: Exact count of registered volunteers (`User.countDocuments({ role: 'volunteer' })`).
   - `activeMissionsCount`: Real count of active missions in MongoDB.
   - `fillRatePercentage`: Dynamically calculated from real slot quantities (`totalSlotsFilled / totalSlotsNeeded * 100`).
   - `treesPlanted`: Calculated from confirmed slots in environmental campaigns.
   - All fallback numbers (8650, 1420, 128, 94) have been replaced with dynamic calculations and clean zeroes when empty.

2. **Frontend Dynamic Rendering ([`page.tsx`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/Frontend/src/app/page.tsx))**:
   - Impact wall counters start at `0` and update live from the database.
   - Added clean empty states on the Landing Page and Browse catalog when no missions are registered yet (*"Aucune mission enregistrée pour le moment — Soyez le premier à créer une mission"*).

3. **Mobile Application Live Feed ([`App.tsx`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/application/App.tsx) & [`AuthScreen.tsx`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/application/src/components/AuthScreen.tsx))**:
   - Removed fake offline bypass (`mock_ahmed_id` and `mock_token_for_ahmed`).
   - Authentication connects strictly to real user records in MongoDB via `POST /api/auth/login` and `POST /api/auth/signup`.
   - Both **Matched** and **Browse** tabs dynamically fetch and render real missions from `GET /api/missions`.
   - 1-Tap RSVP joins the specific real mission and slot in MongoDB using the authenticated token.
   - Added friendly empty states when no missions are published yet.

