# Plan: Web Authentication System & User/NGO Navbar Menu

Implement a complete, production-ready **Authentication System for the Web Portal (`Frontend/`)**, matching the VOLUNOVA civic design system (`--navy: #0b1f3a`, `--teal: #0d7a6f`), with dedicated `/login` and `/register` pages and an interactive **User/NGO Profile Dropdown** in the Navbar.

---

## User Review Required

> [!IMPORTANT]
> **Persistent Client Session**: The web portal will store JWT tokens in `localStorage` (`volunova_token`), automatically restoring the session upon page refresh, attaching `Authorization: Bearer <token>` to all API requests, and synchronizing user state across pages via an `AuthContext`.
>
> **Role-Aware Navigation**:
> - **Organizations / Admins**: Gain fast access to "Créer une Mission" and "Salle des Opérations".
> - **Volunteers**: Can view their applied missions and verified impact hours.
> - **Admins**: Direct link to the national `/admin` telemetry dashboard.

---

## Proposed Changes

### 1. State Management & API Client

#### [MODIFY] [`Frontend/src/lib/api.ts`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/Frontend/src/lib/api.ts)
- Add `api.signup({ name, email, password, role, city, skills })` to connect to `POST /api/auth/signup`.
- Add `api.logout()` helper that removes stored tokens and clears user state.

#### [NEW] [`Frontend/src/context/AuthContext.tsx`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/Frontend/src/context/AuthContext.tsx)
Create a global React Context provider `AuthProvider`:
- State: `user: User | null`, `token: string | null`, `loading: boolean`.
- Functions: `login(email, password)`, `signup(payload)`, `logout()`.
- Auto-restores the active user session on startup by calling `GET /api/auth/me`.

#### [MODIFY] [`Frontend/src/app/layout.tsx`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/Frontend/src/app/layout.tsx)
- Wrap application children inside `<AuthProvider>` alongside `<LanguageProvider>`.

---

### 2. Navigation Bar Profile Menu

#### [MODIFY] [`Frontend/src/components/layout/Navbar.tsx`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/Frontend/src/components/layout/Navbar.tsx)
- When **Logged Out**:
  - Display a clean, prominent **"Se Connecter" / "Connexion"** button linking to `/login`.
- When **Logged In**:
  - Display an interactive **Avatar Pill Menu**:
    - User/Org initials circle with civic badge.
    - User's first name / Organization name.
    - Role pill badge: `🟢 Organisation`, `🔵 Bénévole`, or `🟣 Admin`.
  - Dropdown menu upon click:
    - User full name & email.
    - Quick link to **"Créer une Mission"** (for organizations).
    - Quick link to **"Tableau de Bord Admin"** (if admin).
    - **"Déconnexion" (Logout)** button with door icon (`🚪`) that signs out and redirects to `/`.

---

### 3. Dedicated Auth Pages

#### [NEW] [`Frontend/src/app/login/page.tsx`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/Frontend/src/app/login/page.tsx)
Civic-themed login screen matching VOLUNOVA design tokens:
- Clean card with subtle grid background (`bg-civic-grid`).
- Email & password inputs with modern focus states.
- **Fast 1-Tap Demo Logins**:
  - `🏢 Démo Organisation` (`org@volunova.dz` / `password123`)
  - `🤝 Démo Bénévole` (`ahmed@volunova.dz` / `password123`)
- Real-time error alert banners.
- Link: *"Pas encore de compte ? Créer un compte"*.

#### [NEW] [`Frontend/src/app/register/page.tsx`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/Frontend/src/app/register/page.tsx)
Registration screen with role onboarding:
- **Role Selector Tabs**:
  - `🏛️ Association / Organisation` (hosts missions, manages ops room).
  - `🤝 Bénévole Citoyen` (joins missions, earns impact hours).
- Fields: Full Name / Org Name, Email, Password, City/Wilaya (Algiers, Blida, Oran, Constantine, etc.).
- Direct integration with `POST /api/auth/signup`.
- Link: *"Déjà un compte ? Se connecter"*.

---

### 4. Tri-Lingual Localization

#### [MODIFY] [`Frontend/src/locales/fr.ts`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/Frontend/src/locales/fr.ts), [`en.ts`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/Frontend/src/locales/en.ts), [`ar.ts`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/Frontend/src/locales/ar.ts)
- Add complete `auth` dictionary:
  - Titles, labels, placeholders, role toggles, demo buttons, and error messages translated in French, English, and Arabic.

---

## Verification Plan

### Automated Verification
1. `Frontend/`: Run `npx tsc --noEmit` &rarr; Ensure 0 type errors.
2. `Frontend/`: Run `npm run build` &rarr; Ensure `/login` and `/register` prerender cleanly into static/dynamic Next.js routes.

### Manual Verification
1. Navigate to `http://localhost:3000/login` &rarr; Verify visual layout and fast demo login.
2. Sign in as `org@volunova.dz` &rarr; Verify Navbar switches to Organization Avatar menu with role badge.
3. Click "Déconnexion" &rarr; Verify session is cleared and Navbar reverts to "Se Connecter".
4. Navigate to `http://localhost:3000/register` &rarr; Register a new volunteer or organization with real credentials &rarr; Verify successful signup and immediate redirect.
