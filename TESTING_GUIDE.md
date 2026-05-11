# Testing & Verification Guide

## Pre-Deployment Testing (Local)

Run this checklist BEFORE deploying to Vercel:

### Setup:
```bash
# Terminal 1: Start Backend
cd backend
python app.py
# Should print: "Running on http://127.0.0.1:5000"

# Terminal 2: Start Frontend
cd frontend
npm run dev
# Should print: "ready in 1234 ms"
# Open http://localhost:5175
```

---

## Local Testing Checklist

### 1. Home Page
- [ ] Open http://localhost:5175
- [ ] Page loads without errors
- [ ] Navigation bar shows (Logo, Home, Chatbot, Dashboard, Login, Register)
- [ ] Footer visible at bottom
- [ ] Features section renders correctly

### 2. Registration Flow
```
Click "Register" → Enter data:
  Name: Test User
  Email: test@example.com
  Password: password123
  Confirm: password123
Click "Sign up"
→ Should redirect to Dashboard
→ Should show "Test User" in sidebar
```

**Verification:**
- [ ] No error messages
- [ ] Redirect successful
- [ ] User name displays in Dashboard

### 3. Login Flow
```
Click "Logout" (top right)
→ Now on Home page
Click "Login"
  Email: test@example.com
  Password: password123
Click "Sign in"
→ Should redirect to Dashboard
```

**Verification:**
- [ ] Login successful
- [ ] No blank screens
- [ ] Redirect works

### 4. Chatbot Page
```
Click "Chatbot" in navbar
→ Page loads showing AI chat interface
Click a "Quick Question" button (e.g., "Suggest healthy diet")
→ Your question appears in chat
→ Wait for AI response
→ AI message appears below
```

**Verification:**
- [ ] Chat window renders
- [ ] Messages display correctly
- [ ] Online badge shows (green circle)
- [ ] Can send multiple messages
- [ ] No API errors in console

### 5. Dashboard - Overview Tab
```
Click "Dashboard" in navbar
→ Sidebar shows with user name
→ Overview tab shows 5 stat boxes:
    Sessions: X
    Health records: Y
    BMI History: Z
    Symptom journals: W
```

**Verification:**
- [ ] All stats load (might be 0 if new user)
- [ ] Numbers are integers, not errors
- [ ] No loading spinner stuck on screen

### 6. Dashboard - BMI Calculator Tab
```
Click "BMI Calculator" tab
→ Form shows with Height (cm) and Weight (kg) fields
Enter:
  Height: 170
  Weight: 70
Click "Calculate BMI"
→ Result shows:
    BMI: 24.2
    Category: Normal weight (green)
    Advice: message
```

**Verification:**
- [ ] Form works without errors
- [ ] Result displays correctly
- [ ] No API errors

### 7. Dashboard - Health Tracker Tab
```
Click "Health Tracker" tab
→ Date picker shows (today's date)
→ 4 cards show: Water, Calories, Exercise, Sleep
Enter in Water field: 500
Click "+" button
→ Water intake should now show "500 ml"
→ Entry appears below in "Today's Records"
```

**Verification:**
- [ ] Can add multiple record types
- [ ] Records persist on page
- [ ] No errors in console

### 8. Dashboard - Symptom Checker Tab
```
Click "Symptom Checker" tab
→ Form shows:
    Summary: (text input)
    Details: (textarea)
    Severity: (dropdown)
    Duration: (text input)
Fill form:
  Summary: Headache
  Details: Mild headache behind eyes
  Severity: Mild
  Duration: 2 hours
Click "Save report"
→ Form clears
→ Success message shows
→ Report appears in "Recent symptom logs"
```

**Verification:**
- [ ] Form submits successfully
- [ ] Report displays below
- [ ] Can add multiple reports

### 9. Saved Chats Page
```
Click "Saved Chats" in navbar
→ Page loads
→ Shows list of chat sessions (if any exist)
→ Or shows: "No sessions saved yet"
```

**Verification:**
- [ ] Page loads without errors
- [ ] Can navigate back to home

### 10. Profile Page
```
Click "Profile" in navbar
→ Page loads
→ Shows user information
```

**Verification:**
- [ ] Page loads without errors
- [ ] No blank screens

### 11. Responsive Design
```
Open DevTools (F12)
Click "Toggle device toolbar" (Ctrl+Shift+M)
Set to: iPhone 12
Test all pages on mobile view
```

**Verification:**
- [ ] Navigation works (hamburger menu)
- [ ] Pages responsive (not cut off)
- [ ] Forms usable on mobile
- [ ] No horizontal scrolling

---

## Browser DevTools Verification

### Console Tab (F12 → Console)
After each action, console should show:
- ✅ No red error messages
- ✅ No "404 not found" warnings
- ✅ No "Cannot read properties" errors

**If errors appear:**
```javascript
// Read the error message carefully
// Example: "Cannot read property 'user' of null"
// This means useAuth hook returned null - authentication issue
```

### Network Tab (F12 → Network)
1. Click a page (e.g., Dashboard)
2. Look at network requests (XHR filter)
3. Each request should show:
   - ✅ Request URL: `http://localhost:5000/api/...`
   - ✅ Status: `200` (success)
   - ✅ Response has data

**If errors appear:**
```
Status 500: Server error (check backend logs)
Status 404: Endpoint doesn't exist (check backend routes)
Status 401: Not authenticated (check JWT token)
Status 400: Bad request (check request format)
```

### Application Tab (F12 → Application)
1. Look at "Local Storage"
2. Should have key: `healthai_token`
3. Value should be a long string (JWT token)

**If missing:**
```
Token not set = User not logged in
Happened after login = Auth context issue
```

---

## Local API Testing

Test backend endpoints directly:

```bash
# 1. Test backend is running
curl http://localhost:5000/
# Should return: {"message": "HealthAI Assistant backend is running.", "status": "ok"}

# 2. Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@test.com",
    "password": "test123"
  }'
# Should return: token and user data

# 3. Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "test123"
  }'
# Should return: token and user data

# 4. Test chat (get token from login first)
TOKEN="your-token-from-login-response"
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
# Should return: {"reply": "AI response"}
```

---

## Post-Deployment Testing (Vercel)

Once deployed to Vercel with backend URL set:

### 1. Access Live Site
```
Open: https://your-project.vercel.app
Should load immediately (no blank screen)
```

### 2. Check Status Banner
```
Chatbot page should show status indicator
✅ Green "Online" = Backend connected
❌ Red "Offline" = Backend URL wrong or backend down
```

### 3. Test Full Flow
```
Register → Create account
Login → Use new account
Dashboard → See stats load
Chatbot → Send message → Get response
Health Tracker → Add record → See it persist
Symptom Checker → Log symptom → See in history
```

### 4. Check Network Requests
DevTools → Network → XHR
- All requests should go to `https://your-backend-url.com`
- NOT to `http://localhost:5000`
- NOT to `http://127.0.0.1:5000`

### 5. Console Errors
DevTools → Console
- ❌ No red error messages
- ✅ Only info/debug messages OK

---

## Common Issues & Quick Fixes

| Issue | Symptom | Fix |
|-------|---------|-----|
| Blank Dashboard | Page loads but shows nothing | Check DevTools console for errors, verify backend URL |
| Chatbot doesn't respond | Message sent but no response | Verify GEMINI_API_KEY set on backend |
| Login fails | Error: "Login failed" | Verify backend `/api/auth/login` works with curl |
| "Offline" badge | Status banner shows offline | Check `VITE_BACKEND_URL` env variable, verify backend running |
| 404 on direct URL | Direct link shows 404 page | Verify vercel.json exists with SPA rewrite rule |
| Can't see records | Dashboard shows 0 metrics | Add a record, wait for refresh, check backend logs |

---

## Performance Checklist

After deployment:

- [ ] Home page loads in < 3 seconds
- [ ] No network waterfall (all requests in parallel)
- [ ] Images loaded optimized
- [ ] JavaScript bundle < 500 KB
- [ ] API responses < 1 second
- [ ] No console warnings about performance

**Check with:**
```
DevTools → Lighthouse → Generate report
Should see "Green" scores for Performance, Accessibility
```

---

## Security Verification

- [ ] HTTPS used (not HTTP)
- [ ] JWT token stored in localStorage (not cookies exposed)
- [ ] No credentials in console logs
- [ ] CORS headers present (check Network tab Response)
- [ ] Database not exposed (no raw SQL in responses)

---

## Success Criteria ✅

**All must be true for successful deployment:**

1. ✅ All pages load without blank screens
2. ✅ No red errors in console
3. ✅ API calls visible in Network tab
4. ✅ API calls go to backend URL (not localhost)
5. ✅ Register/login works
6. ✅ Dashboard shows data
7. ✅ Chatbot responds to messages
8. ✅ Health tracker saves records
9. ✅ Symptom checker saves reports
10. ✅ Responsive on mobile

---

## Debug Mode

To get more verbose logging:

**Frontend:**
```javascript
// In frontend/src/services/api.js, add:
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status)
    return response
  }
)
```

**Backend:**
```python
# Already enabled in app.py:
logging.basicConfig(level=logging.DEBUG)
# View logs in Railway/Render dashboard
```

---

**Questions? Check the error messages in browser console - they usually tell you exactly what's wrong!**
