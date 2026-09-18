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
