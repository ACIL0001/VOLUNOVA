# Plan: Resolve Render Deployment Error (`ENOENT: no such file or directory, open '/opt/render/project/src/package.json'`)

Analyze and fix the Render deployment failure where npm cannot locate `package.json` in `/opt/render/project/src/`.

---

## 🔍 Root Cause Analysis

### 1. What the Logs Show
```log
2026-09-18T16:56:45.561926441Z ==> Running build command 'yarn'...
2026-09-18T16:56:45.831320861Z info No lockfile found.
2026-09-18T16:56:45.844159025Z Done in 0.03s.
...
2026-09-18T16:56:55.253885127Z ==> Running 'npm start'
2026-09-18T16:56:56.361520314Z npm error enoent Could not read package.json: Error: ENOENT: no such file or directory, open '/opt/render/project/src/package.json'
```

### 2. The Core Problem
1. **Monorepo Directory Structure**:
   Your repository is organized as a monorepo with multiple subprojects:
   ```
   VOLUNOVA/               <-- Render looks HERE by default (/opt/render/project/src)
   ├── 📁 Backend/         <-- Backend package.json is here!
   ├── 📁 Frontend/        <-- Frontend package.json is here!
   └── 📁 application/     <-- Mobile package.json is here!
   ```
   There is **no `package.json` at the repository root**.
2. **Render Default Settings**:
   - When creating a Web Service on Render, the default **Root Directory** is `.` (the repository root).
   - Render ran `yarn` at the root &rarr; found no `package.json`, completed in 0.03s without installing dependencies or compiling TypeScript.
   - Render then ran `npm start` at the root &rarr; failed with `ENOENT: no such file or directory, open '/opt/render/project/src/package.json'`.

---

## 🛠️ Step-by-Step Fix on Render Dashboard

Depending on whether this Render service is intended for the **Backend API** or the **Frontend Portal**, follow the respective settings below:

### Option A: If Deploying the Backend API (`Backend/`)
1. In the **Render Dashboard**, go to your Web Service &rarr; **Settings**.
2. Update the following fields:
   - **Root Directory**: `Backend` *(⚠️ Case-sensitive: Capital `B`)*
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. In **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` *(or leave blank; Render provides this automatically)*
   - `MONGODB_URI`: `mongodb+srv://...` *(Must be a live cloud MongoDB like MongoDB Atlas; local `127.0.0.1` will not work on Render)*
   - `JWT_SECRET`: `<your secret>`
   - `GEMINI_API_KEY`: `<your Gemini key>`
4. Click **Save Changes** and trigger **Manual Deploy &rarr; Deploy latest commit**.

---

### Option B: If Deploying the Frontend Next.js Portal (`Frontend/`)
1. In the **Render Dashboard**, go to your Web Service &rarr; **Settings**.
2. Update the following fields:
   - **Root Directory**: `Frontend` *(⚠️ Case-sensitive: Capital `F`)*
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. In **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `NEXT_PUBLIC_API_URL`: `https://<your-backend-service>.onrender.com/api`
4. Click **Save Changes** and trigger **Manual Deploy**.

---

## 🚀 Optional Repository Improvement: Render Blueprint (`render.yaml`)

To avoid manual configuration in the future, we can add a `render.yaml` blueprint at the root of the repository so Render automatically configures both services:

```yaml
services:
  # 1. VOLUNOVA Backend API
  - type: web
    name: volunova-backend
    env: node
    rootDir: Backend
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production

  # 2. VOLUNOVA Frontend Portal
  - type: web
    name: volunova-frontend
    env: node
    rootDir: Frontend
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

---

## Verification Plan

### Automated Verification
1. Verify `Backend/package.json` builds cleanly:
   - Run `npm run build` inside `Backend` &rarr; ensure `dist/server.js` is generated.
2. Verify `Frontend/package.json` builds cleanly:
   - Run `npm run build` inside `Frontend` &rarr; ensure `.next` production build passes.

### Manual Verification
- Once the Render **Root Directory** is set to `Backend`, monitor the Render deployment logs to ensure `npm install` installs all packages, `tsc` builds the code, and `node dist/server.js` starts successfully.
