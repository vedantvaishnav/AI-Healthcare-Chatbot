# Deployment Fix Guide - Vercel & Backend URL Setup

## Problem Summary
Your React/Vite frontend on Vercel shows blank pages after clicking login, chatbot, dashboard, or symptom checker because:
1. ❌ API calls hardcoded to `localhost:5000` (not accessible from Vercel)
2. ❌ No fallback UI for API errors
3. ❌ Component crashes not caught
4. ❌ Missing 404 route handling
5. ❌ No backend connection status indicator

## Solution Overview

### Files Modified/Created:

| File | Change | Purpose |
|------|--------|---------|
| `frontend/src/services/api.js` | ✅ Updated | Reads backend URL from env variable with fallback |
| `frontend/src/App.jsx` | ✅ Updated | Added ErrorBoundary, BackendStatusBanner, NotFound route |
| `frontend/src/pages/Dashboard.jsx` | ✅ Updated | Added loading/error states |
| `frontend/src/pages/Chatbot.jsx` | ✅ Updated | Added backend connection status indicator |
| `frontend/src/components/ProtectedRoute.jsx` | ✅ Updated | Better loading UI |
| `frontend/src/components/ErrorBoundary.jsx` | ✨ New | Catches component crashes |
| `frontend/src/components/BackendStatusBanner.jsx` | ✨ New | Shows backend availability |
| `frontend/src/components/NotFound.jsx` | ✨ New | Fallback for 404 routes |
| `frontend/.env.example` | ✨ New | Template for env variables |
| `vercel.json` | ✨ New | Vercel SPA routing config |

---

## CRITICAL: Backend URL Setup

### Option A: Self-Hosted Backend (Recommended for Production)

Deploy your Flask backend to:
- **Railway** (free tier available): https://railway.app
- **Render**: https://render.com
- **Fly.io**: https://fly.io
- **AWS/Azure/GCP**: Your choice

Once deployed, your backend URL will be:
```
https://your-backend-name.railway.app
https://your-backend-name.onrender.com
https://your-backend.fly.dev
```

### Option B: Local Backend (Development Only)

For local development:
```
VITE_BACKEND_URL=http://localhost:5000
```

---

## Step 1: Set Environment Variable on Vercel

### Via Vercel Dashboard:
1. Go to **Vercel Dashboard** → Your Project → **Settings**
2. Click **Environment Variables**
3. Add new variable:
   - **Name**: `VITE_BACKEND_URL`
   - **Value**: `https://your-deployed-backend-url.com` (without trailing slash)
   - **Environments**: Select `Production`, `Preview`, `Development`
4. Click **Save**
5. **Redeploy**: Go to **Deployments** → Click **...** → **Redeploy**

### Via Vercel CLI:
```bash
vercel env add VITE_BACKEND_URL
# When prompted, enter: https://your-deployed-backend-url.com
vercel redeploy
```

### Via Vercel Config File (Optional):
Create or update `vercel.json` in root:
```json
{
  "env": {
    "VITE_BACKEND_URL": "@vite-backend-url"
  },
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Then set the secret in Vercel CLI:
```bash
vercel secret add vite-backend-url https://your-backend-url.com
vercel redeploy
```

---

## Step 2: Deploy Backend (Choose One)

### Deploy to Railway (Easiest):

1. Push code to GitHub
2. Go to https://railway.app → Click **New Project**
3. Click **Deploy from GitHub repo** → Select your repository
4. Railway automatically detects `requirements.txt` and deploys Flask
5. In **Settings** → **Domains**, enable public domain
6. Your backend URL: `https://<project>-production.up.railway.app`
7. Add Environment Variables:
   - `GEMINI_API_KEY`: Your API key
   - `JWT_SECRET`: Your secret (32+ characters)

### Deploy to Render (Free Tier):

1. Go to https://render.com → Click **New +** → **Web Service**
2. Connect GitHub account
3. Select your repository
4. Settings:
   - **Name**: `healthai-backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
5. Add environment variables in **Environment** tab
6. Your backend URL: `https://healthai-backend.onrender.com`

---

## Step 3: Update Frontend .env

Create `frontend/.env.production`:
```env
VITE_BACKEND_URL=https://your-deployed-backend-url.com
```

For local development, create `frontend/.env`:
```env
VITE_BACKEND_URL=http://localhost:5000
```

---

## Step 4: Test Locally Before Deploying

```bash
# Terminal 1: Start backend
cd backend
python app.py
# Backend runs on http://localhost:5000

# Terminal 2: Start frontend
cd frontend
npm run dev
# Frontend runs on http://localhost:5175

# Terminal 3: Test in browser
open http://localhost:5175
```

Test these flows:
- ✅ Click **Register** → Create account
- ✅ Click **Login** → Sign in with new account
- ✅ Click **Dashboard** → See user data
- ✅ Click **Chatbot** → Send message → Get AI response
- ✅ Click **Dashboard** → **BMI Calculator** → Enter height/weight → Calculate
- ✅ Click **Dashboard** → **Health Tracker** → Add water/calories/exercise/sleep
- ✅ Click **Dashboard** → **Symptom Checker** → Log symptoms → View history
- ✅ Open **Browser DevTools** → **Network tab** → Verify API calls go to correct URL

---

## Step 5: Deploy to Vercel

### Option 1: Via Vercel Dashboard UI
1. Go to https://vercel.com/import
2. Select your GitHub repository
3. Click **Import**
4. In **Environment Variables**, add:
   - `VITE_BACKEND_URL`: `https://your-backend-url.com`
5. Click **Deploy**
6. Wait 2-3 minutes for deployment

### Option 2: Via Vercel CLI
```bash
cd frontend
npm install -g vercel
vercel --prod
# Follow prompts, set VITE_BACKEND_URL when asked
```

---

## Step 6: Verify Deployment

After Vercel deployment:

1. **Check Frontend**: Visit `https://your-vercel-domain.vercel.app`
2. **Check Status Banner**: Should show green "Online" status if backend is running
3. **Test Login Flow**:
   ```
   Register → Login → Dashboard → See stats populated
   ```
4. **Check Browser DevTools**:
   - Open **Console** → Should have no errors
   - Open **Network tab** → API calls should go to `https://your-backend-url.com/api/...`
   - Click **XHR** filter → Verify all requests succeed (status 200, 201, etc.)

---

## Troubleshooting

### Issue: "Backend unavailable" Banner Shows

**Cause**: Frontend can't reach backend URL

**Fix**:
1. Verify backend is running and accessible:
   ```bash
   curl https://your-backend-url.com/
   # Should return: {"message": "HealthAI Assistant backend is running.", "status": "ok"}
   ```
2. Check Vercel env variable:
   - Verify `VITE_BACKEND_URL` is set correctly
   - No trailing slash (✅ `https://url.com` ❌ `https://url.com/`)
   - Redeploy after changing env variables

### Issue: Login Page Blank

**Cause**: Component crash or auth error

**Fix**:
1. Open **DevTools** → **Console** → Check for error messages
2. Verify backend `/api/auth/login` endpoint is working:
   ```bash
   curl -X POST https://your-backend-url.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"test123"}'
   ```

### Issue: Dashboard Shows "0" for All Metrics

**Cause**: User has no data yet, OR API call failed silently

**Fix**:
1. Try adding health records:
   - Click **Health Tracker** tab
   - Add water intake → Should see "1" in summary
2. If still shows 0, check backend logs:
   ```bash
   # SSH into backend server or check logs in deployment dashboard
   # Look for database errors
   ```

### Issue: "Something went wrong" Error Boundary

**Cause**: A component crashed

**Fix**:
1. Open **DevTools** → **Console** → Find the error message
2. Check `frontend/src/components/ErrorBoundary.jsx` for full error
3. If error mentions `api`, check:
   - Backend URL is correct
   - Backend is running
   - CORS is enabled on backend

### Issue: Chatbot Says "Unable to Reach AI Assistant"

**Cause**: 
- Backend `/api/chat` endpoint failed
- GEMINI_API_KEY not set

**Fix**:
1. Check backend environment variables are set:
   ```bash
   # In Render/Railway dashboard, verify these are set:
   GEMINI_API_KEY=<your-key>
   JWT_SECRET=<random-32-char-string>
   ```
2. Test endpoint directly:
   ```bash
   curl -X POST https://your-backend-url.com/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message":"Hello"}'
   ```

---

## Important Notes

### CORS Configuration
Backend already has CORS enabled for all origins:
```python
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
```
No changes needed.

### Database
- **Local**: Uses SQLite at `backend/healthai.db`
- **Deployed**: Should use PostgreSQL or managed database
- For Railway/Render: Create a **PostgreSQL add-on**
- Update `SQLALCHEMY_DATABASE_URI` in backend `.env`

### Environment Variables Checklist

**Frontend (Vercel):**
- ✅ `VITE_BACKEND_URL` = Backend URL

**Backend (Railway/Render):**
- ✅ `GEMINI_API_KEY` = Your Google API key
- ✅ `JWT_SECRET` = Random 32+ character string
- ✅ `DATABASE_URL` = PostgreSQL connection string (if not using SQLite)

---

## Quick Reference

```bash
# Local development
VITE_BACKEND_URL=http://localhost:5000

# Production
VITE_BACKEND_URL=https://your-backend-url.com

# Backend must respond to GET /
# Should return: {"message": "HealthAI Assistant backend is running.", "status": "ok"}

# Check Vercel env variables
vercel env list

# Redeploy after changing env
vercel redeploy

# View live deployment
vercel open
```

---

## Success Checklist

- [ ] Backend deployed to Railway/Render/similar
- [ ] Backend URL accessible and responds to GET /
- [ ] VITE_BACKEND_URL set in Vercel environment variables
- [ ] Frontend redeployed after setting env variable
- [ ] No errors in browser console on frontend
- [ ] "Online" status badge shows in Chatbot page
- [ ] Login works and redirects to Dashboard
- [ ] Dashboard shows metrics (Sessions, Records, etc.)
- [ ] Chatbot sends message and receives response
- [ ] All 5 pages render without blank screens
- [ ] Network tab shows API calls to deployed backend (not localhost)

---

**Questions?** Check the browser console (DevTools → Console) for error messages!
