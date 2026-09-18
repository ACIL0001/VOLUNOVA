# Plan: Publish VOLUNOVA to GitHub (`ACIL0001/VOLUNOVA`)

Push the entire 4-tier **VOLUNOVA (تكاتف الذكي)** ecosystem to the remote GitHub repository at `https://github.com/ACIL0001/VOLUNOVA` with complete cybersecurity precautions, environment secret shielding, and clean git history.

---

## User Review Required

> [!IMPORTANT]
> **Secret Protection Guard**: The file [`backend/.env`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/backend/.env) contains a live `GEMINI_API_KEY`, `JWT_SECRET`, and email configurations. We will create a comprehensive root `.gitignore` and a sanitized [`backend/.env.example`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/backend/.env.example) to ensure private keys are **never pushed** to public or private remote repositories.

> [!WARNING]
> **Nested Git Directory Cleanup**: The subfolder [`application/`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/application) currently contains an internal `.git` folder (created by Expo CLI). If left intact, Git would treat `application/` as an empty submodule pointer on GitHub. We will safely remove `application/.git` so that the entire mobile codebase is properly tracked within the main repository.

---

## Proposed Changes

### 1. Root & Environment Configuration

#### [NEW] [`.gitignore`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/.gitignore)
Create an enterprise-grade root `.gitignore` ensuring neither build artifacts nor secrets are committed:
- `node_modules/` across all projects (`backend`, `frontend`, `application`, `admin`)
- `.env`, `.env*.local`, `*/.env*` (except `.env.example`)
- Next.js build artifacts (`.next/`, `out/`)
- Expo mobile artifacts (`.expo/`, `web-build/`)
- OS files (`.DS_Store`, `Thumbs.db`)
- Logs (`*.log`, `npm-debug.log*`)

#### [NEW] [`backend/.env.example`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/backend/.env.example)
Provide an environment template with placeholder values for collaborators:
- `PORT=5000`
- `NODE_ENV=development`
- `MONGODB_URI=mongodb://127.0.0.1:27017/volunova`
- `JWT_SECRET=your_jwt_secret_here`
- `GEMINI_API_KEY=your_gemini_api_key_here`
- `SMTP_HOST=`, `SMTP_PORT=587`, `SMTP_USER=`, `SMTP_PASS=`
- `RESEND_API_KEY=`

#### [MODIFY] [`README.md`](file:///c:/Users/MY%20PC/Desktop/VOLUNOVA/README.md)
Update the root README to showcase the complete **4-Project Architecture**:
- 📁 `backend/` (Port 5000) — REST API + Nodemailer/Resend + Gemini AI + Admin routes
- 📁 `frontend/` (Port 3000) — NGO Portal + AI Studio + Operations Center + 180s Pitch Demo
- 📁 `admin/` (Port 3001) — Dedicated Next.js 16 Admin Control Center & Zero-Trust Audit Log
- 📁 `application/` (Port 8081) — Expo Mobile App with Auth & Skill Selection

---

### 2. Git Initialization & Repository Setup

1. **Remove Nested `.git`**:
   - Delete `application/.git` so the mobile code is tracked cleanly as part of the monorepo.
2. **Initialize Git at Root**:
   - Run `git init -b main` in `c:\Users\MY PC\Desktop\VOLUNOVA`.
3. **Configure Remote**:
   - Run `git remote add origin https://github.com/ACIL0001/VOLUNOVA.git`.
4. **Pre-Commit Verification**:
   - Run `git status` to verify:
     - No `.env` files are staged.
     - No `node_modules` are staged.
     - All 4 directories (`backend`, `frontend`, `application`, `admin`) and root docs are included.
5. **Commit & Push**:
   - Run `git add .`
   - Run `git commit -m "feat: initial release of VOLUNOVA 4-tier volunteer operating system"`
   - Run `git push -u origin main`

---

## Verification Plan

### Automated Verification
1. `git status`: Confirm clean staging with 0 ignored files leaking through.
2. `git check-ignore backend/.env`: Confirm it returns `backend/.env` (proving secret protection is working).
3. `git ls-files | Select-String "node_modules"`: Confirm 0 matches.
4. `git push -u origin main`: Verify successful handshake and branch update on GitHub.

### Manual Verification
- Verify the repository on GitHub at `https://github.com/ACIL0001/VOLUNOVA` displays all 4 folders with clean README badges and no leaked credentials.
