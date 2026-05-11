# Backend URL Reference Card

## Which Backend URL Should You Use?

### For Production (Vercel Deployment)

**Choose ONE from below:**

| Platform | Free Tier | Setup Time | URL Format | Command |
|----------|-----------|-----------|-----------|---------|
| **Railway** ⭐ Recommended | Yes | 5 min | `https://<project>-production.up.railway.app` | See below |
| Render | Yes | 10 min | `https://<project>.onrender.com` | See Render docs |
| Fly.io | Yes | 15 min | `https://<project>.fly.dev` | See Fly docs |

---

## Railway Deployment (Step-by-Step)

### Prerequisites:
- GitHub account (code already pushed)
- Railway account (free at https://railway.app)

### Steps:

1. **Sign up/Login to Railway**
   ```
   https://railway.app → Click "Start New Project"
   ```

2. **Connect GitHub**
   ```
   Click "Deploy from GitHub repo"
   → Select your repository
   → Authorize Railway to access GitHub
   ```

3. **Railway Auto-Deploys**
   ```
   - Detects requirements.txt
   - Installs dependencies
   - Starts Flask app
   - Generates domain automatically
   ```

4. **Find Your Backend URL**
   ```
   Railway Dashboard
   → Click your project
   → Click "Deployments" tab
   → Copy the domain from "Service URL" or "Public URL"
   
   Example: https://healthai-backend-production.up.railway.app
   ```

5. **Add Environment Variables (Railway)**
   ```
   In Railway Dashboard:
   → Click your project
   → Click "Variables" tab
   → Add:
      GEMINI_API_KEY = your-api-key-here
      JWT_SECRET = some-random-32-character-string
   ```

6. **Copy Backend URL**
   ```
   Your backend URL is now:
   https://healthai-backend-production.up.railway.app
   
   (Remove trailing slash!)
   ```

---

## Use This Backend URL on Vercel

### On Vercel Dashboard:

1. **Go to Project Settings**
   ```
   Vercel Dashboard
   → Select your project
   → Settings
   ```

2. **Add Environment Variable**
   ```
   Environment Variables
   → Click "Add New"
   → Name: VITE_BACKEND_URL
   → Value: https://your-backend-url.com (from Railway above)
   → Environments: ✓ Production ✓ Preview ✓ Development
   → Click "Save"
   ```

3. **Redeploy**
   ```
   Deployments tab
   → Click "..." on latest deployment
   → "Redeploy"
   → Wait 2-3 minutes
   ```

---

## Local Development (.env)

For testing locally before deploying:

**File**: `frontend/.env`
```
VITE_BACKEND_URL=http://localhost:5000
```

**File**: `backend/.env`
```
GEMINI_API_KEY=your-api-key
JWT_SECRET=local-secret-32-chars
```

---

## Test Your Backend URL

### Quick Test:
```bash
curl https://your-backend-url.com/

# Should return:
{"message": "HealthAI Assistant backend is running.", "status": "ok"}
```

### Full Test:
```bash
# Test registration endpoint
curl -X POST https://your-backend-url.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Should return user data and token
```

---

## Common Backend URLs

### Production Examples:
- ✅ `https://healthai-backend-production.up.railway.app`
- ✅ `https://my-backend-api.onrender.com`
- ✅ `https://health-app.fly.dev`
- ✅ `https://api.healthai-project.com`

### Invalid Examples (Don't Use):
- ❌ `http://localhost:5000` (won't work on Vercel)
- ❌ `http://127.0.0.1:5000` (only local)
- ❌ `https://backend-url.com/` (trailing slash)
- ❌ `backend-url.com` (missing https://)

---

## If You Already Have a Backend URL

You can skip Railway and just use your existing backend!

**Just set this on Vercel:**
```
VITE_BACKEND_URL=https://your-existing-backend-url.com
```

Then redeploy.

---

## Complete Example

Let's say Railway gives you:
```
https://ai-healthcare-backend-production.up.railway.app
```

**You would set on Vercel:**
```
VITE_BACKEND_URL=https://ai-healthcare-backend-production.up.railway.app
```

**Then in browser, API calls would go to:**
```
https://ai-healthcare-backend-production.up.railway.app/api/auth/login
https://ai-healthcare-backend-production.up.railway.app/api/chat
https://ai-healthcare-backend-production.up.railway.app/api/dashboard/summary
```

---

## Verify It Works

After deployment:

1. Open https://your-frontend.vercel.app
2. Look for status badge in Chatbot page
3. Should show green "Online" (not red "Offline")
4. Open DevTools → Network tab
5. Click on API request
6. Check "Request URL" starts with your backend domain (not localhost)

---

**That's it! Your backend is now accessible from Vercel! 🚀**
