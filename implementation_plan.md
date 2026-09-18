# Plan: Remove All Mock Data & Transition to 100% Real Data

Purge all hardcoded mock baselines, fake offline tokens, and static demo missions across the **Backend**, **Frontend**, and **Mobile App**, connecting every screen directly to live MongoDB database records.

---

## User Review Required

> [!IMPORTANT]
> **Live Data Dependency**: With all mock baselines removed, initial stats (impact hours, volunteers count, missions count) will start at **0** until real users register and real missions are published.
>
> If the database is currently empty:
> - The Landing Page and Browse screens will show clean **Empty States** (*"Aucune mission active pour le moment — Soyez le premier à publier une initiative"*).
> - The Mobile App will display real missions fetched from your MongoDB database rather than hardcoded cards.
> - Authentication on Mobile and Web will require real registered accounts in MongoDB (no fake offline bypass).

---

## Identified Mock Data Locations

### 1. Backend (`Backend/`)
- **[`Backend/src/routes/stats.ts`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/Backend/src/routes/stats.ts)**:
  - `treesPlanted: 1420 + ...` &rarr; Hardcoded baseline.
  - `totalImpactHours: 8650 + dbHours` &rarr; Hardcoded baseline of 8650 hours.
  - `volunteersMobilized: Math.max(128, totalVolunteers)` &rarr; Hardcoded minimum of 128 volunteers.
  - `activeMissionsCount: Math.max(4, totalMissions)` &rarr; Hardcoded minimum of 4 missions.
  - `fillRatePercentage: 94` &rarr; Hardcoded 94%.
- **[`Backend/src/routes/admin.ts`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/Backend/src/routes/admin.ts)**:
  - `totalImpactHours: 8650, avgReliability: 96, cities: [...]` &rarr; Hardcoded fallback in telemetry.
  - `totalSlotsNeeded: 24, totalSlotsFilled: 22` &rarr; Hardcoded fallback.
- **[`Backend/src/config/pusher.ts`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/Backend/src/config/pusher.ts)**:
  - Mock Pusher credential fallbacks.

### 2. Frontend (`Frontend/`)
- **[`Frontend/src/app/page.tsx`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/Frontend/src/app/page.tsx)**:
  - `useState<ImpactStats>({ treesPlanted: 1420, totalImpactHours: 8650, ... })` &rarr; Hardcoded initial values.
- **[`Frontend/src/app/demo/page.tsx`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/Frontend/src/app/demo/page.tsx)**:
  - `totalHours: 8650`, hardcoded `2/3 (66%)` staffing.
- **[`Frontend/src/lib/i18nData.ts`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/Frontend/src/lib/i18nData.ts)**:
  - Contains overrides keyed to hardcoded names (`bouchaoui`, `blida`, `baraki`). Needs to default directly to the real user's database values (`mission.title`, `mission.description`, `mission.venueName`) without forcing static text.

### 3. Mobile Application (`application/`)
- **[`application/src/components/AuthScreen.tsx`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/application/src/components/AuthScreen.tsx)**:
  - `mock_ahmed_id` and `mock_token_for_ahmed` fallback when offline or on error.
- **[`application/App.tsx`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/application/App.tsx)**:
  - `t('match.campaignTitle')`, `hasJoined ? '3/3' : '2/3'`, `hasJoined ? '100%' : '66%'` &rarr; Static strings instead of rendering real missions from `GET /missions`.
  - `Authorization: Bearer ${authToken || 'mock_token_for_ahmed'}` &rarr; Mock token fallback.

---

## Proposed Changes

### Component 1: Backend (`Backend/`)

#### [MODIFY] [`Backend/src/routes/stats.ts`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/Backend/src/routes/stats.ts)
- Compute 100% real database aggregates:
  - `totalVolunteers`: `await User.countDocuments({ role: 'volunteer' })`
  - `activeMissionsCount`: `await Mission.countDocuments({ status: { $in: ['active', 'in_progress'] } })`
  - `totalImpactHours`: real sum of `User.impactHours`
  - `treesPlanted`: real sum from environmental missions or `0`
  - `fillRatePercentage`: `totalSlotsFilled / totalSlotsNeeded * 100` (or `0` if no slots)

#### [MODIFY] [`Backend/src/routes/admin.ts`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/Backend/src/routes/admin.ts)
- Remove `8650`, `96`, `['Algiers', 'Blida', 'Oran']`, `24`, `22` fallbacks.
- Default to actual zeroes (`0`) when no data exists.

---

### Component 2: Frontend (`Frontend/`)

#### [MODIFY] [`Frontend/src/app/page.tsx`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/Frontend/src/app/page.tsx)
- Initialize stats to `0` with smooth loading skeletons.
- Render real mission cards from `/api/missions`. If empty, show a clean empty state with "+ Publier la Première Mission".

#### [MODIFY] [`Frontend/src/lib/i18nData.ts`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/Frontend/src/lib/i18nData.ts)
- Ensure all missions dynamically display their real title, venue, and descriptions directly from MongoDB, using dictionary lookups only for categories and urgency badges.

---

### Component 3: Mobile Application (`application/`)

#### [MODIFY] [`application/src/components/AuthScreen.tsx`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/application/src/components/AuthScreen.tsx)
- Remove `mock_ahmed_id` and `mock_token_for_ahmed`.
- When logging in or registering, send actual API requests. If authentication fails, display the real server error message in an Alert.

#### [MODIFY] [`application/App.tsx`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/application/App.tsx)
- Add real state: `missions: Mission[]`, `loadingMissions: boolean`.
- Fetch real missions from `GET ${BACKEND_URL}/missions`.
- Render real mission cards dynamically with live titles, venues, need roles, and real progress bars (`${mission.totalSlotsFilled}/${mission.totalSlotsNeeded}`).
- Authenticated 1-Tap RSVP joins the specific real mission in MongoDB.
- Display clean empty state if no missions are published yet.

---

## Database Wipe (Optional Clean Slate)

If you want to completely clear out old seed data (Ahmed, Bouchaoui, etc.) so your database starts 100% empty:
- We can provide a command or endpoint to wipe all collections (`User.deleteMany({})`, `Mission.deleteMany({})`, etc.) so you can register your own real accounts from scratch.

---

## Verification Plan

### Automated Verification
1. `Backend`: Run `npx tsc --noEmit` & `npm run build` &rarr; Verify 0 errors.
2. `Frontend`: Run `npx tsc --noEmit` & `npm run build` &rarr; Verify 0 errors.
3. `application`: Run `npx tsc --noEmit` &rarr; Verify 0 errors.

### Functional Verification
1. Inspect `http://localhost:5000/api/stats/impact-wall` &rarr; Verify numbers match the actual count of documents in MongoDB.
2. Open the mobile app &rarr; Verify it loads real missions from MongoDB instead of static text.
3. Register a new real volunteer on the mobile app &rarr; Verify the record is created in MongoDB Atlas.
