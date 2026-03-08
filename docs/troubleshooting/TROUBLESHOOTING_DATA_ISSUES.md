# Troubleshooting: Data Not Displaying

## Problem
Dashboard pages show "No data" or zeros even though some payments exist in the analytics.

## Quick Diagnosis

### Step 1: Use the API Debugger

1. Navigate to Settings (gear icon in sidebar)
2. Click the "Developer" tab
3. Click "Open API Debugger"
4. Click "Run Tests"

This will test all API endpoints and show you:
- ✅ Which endpoints are working
- 🟨 Which endpoints return empty data
- ❌ Which endpoints are failing with errors

### Step 2: Check Browser Console

Open browser DevTools (F12) and check the Console tab:
- Look for red error messages starting with 🔴
- Check for 401/403 errors (authentication issues)
- Check for 404 errors (endpoint not found)
- Check for 500 errors (backend issues)

## Common Issues & Solutions

### Issue 1: All Endpoints Return Empty Data (🟨)

**Symptom:** API Debugger shows all endpoints working but returning empty arrays/zeros

**Cause:** Backend database has no data yet

**Solution:**
1. Create test data through the UI:
   - Go to "Create Payment" and create a test payment
   - Complete a payment through the checkout flow
   - Create payment links at `/payment-links/new`
   - Create invoices at `/invoices/new`

2. Or seed data through backend:
   ```bash
   # In your backend directory
   python scripts/seed_data.py
   ```

### Issue 2: 401/403 Authentication Errors (❌)

**Symptom:** API Debugger shows "Authentication Error" or 401/403 status codes

**Cause:** Invalid or expired authentication tokens

**Solution:**
1. Logout and login again
2. Check that you completed the onboarding flow
3. Verify tokens exist in localStorage:
   - Open DevTools → Application/Storage → Local Storage
   - Check for: `merchant_token`, `api_key`
   - If missing, login again

### Issue 3: 404 Not Found Errors (❌)

**Symptom:** API Debugger shows 404 for certain endpoints

**Cause:** Backend API endpoints don't exist or routes are incorrect

**Solution:**
1. Verify backend server is running on `localhost:8000`
2. Check backend logs for routing errors
3. Ensure backend has latest code with all endpoints:
   ```bash
   # Backend should have these routes:
   GET  /merchant/wallets
   GET  /merchant/wallets/dashboard
   GET  /merchant/payments
   GET  /analytics/overview
   GET  /billing/info
   GET  /payment-links
   GET  /invoices
   GET  /subscriptions/plans
   ```

### Issue 4: CORS Errors

**Symptom:** Console shows "CORS policy" errors

**Cause:** Backend not configured to accept requests from frontend origin

**Solution:**
1. Check backend CORS configuration
2. Ensure backend allows `http://localhost:5173`
3. See `CORS_FIX.md` for detailed instructions

### Issue 5: Backend Not Running

**Symptom:** All API calls fail with network/connection errors

**Cause:** Backend server is not running

**Solution:**
```bash
# Start the backend server
cd backend
python -m uvicorn main:app --reload --port 8000
```

### Issue 6: Wrong API URL

**Symptom:** All requests go to wrong server or fail silently

**Cause:** `VITE_API_URL` environment variable misconfigured

**Solution:**
1. Check `.env` file in frontend root:
   ```
   VITE_API_URL=
   ```
   **Leave empty** to use Vite proxy (recommended for development)

2. Or explicitly set if using different backend:
   ```
   VITE_API_URL=http://localhost:8000
   ```

3. Restart Vite dev server after changing `.env`:
   ```bash
   # Stop server (Ctrl+C) then restart
   npm run dev
   ```

## Advanced Debugging

### Check Network Requests

1. Open DevTools → Network tab
2. Refresh the page
3. Look for failed requests (red)
4. Click on failed requests to see:
   - Request headers (check Authorization header)
   - Response (check error messages)
   - Status code

### Check Redux/React Query State

Most components use React Query for data fetching. Check the state:

```javascript
// In browser console
// Check what's stored
localStorage.getItem('merchant_token')
localStorage.getItem('api_key')
localStorage.getItem('merchant_email')

// Check API response
fetch('http://localhost:8000/merchant/wallets/dashboard', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('merchant_token'),
    'X-API-Key': localStorage.getItem('api_key')
  }
}).then(r => r.json()).then(console.log)
```

### Enable Verbose Logging

The API clients now log detailed error information. After the recent updates, you'll see:
- 🔴 for errors with full details
- 🔒 for authentication issues
- Request URL, method, status, and response data

## Understanding the Results

### Analytics Shows Data But Other Pages Don't

This is **normal** if:
- You have old payment sessions from testing
- But haven't created payment links, invoices, or subscriptions yet

**Solution:** Create the missing entities through the UI

### Everything Shows "No Data"

This suggests:
- Fresh database with no records
- Or all API calls are failing (check console for errors)

**Solution:** 
1. Check API Debugger results
2. Create test data if backend is working
3. Fix backend/authentication if calls are failing

### Wallets Show ₹0.00

This is **correct** if no payments have been completed yet. Balance updates only after:
- A customer completes a payment
- The blockchain transaction confirms
- The backend processes the settlement

To test with real balance:
1. Create a payment session
2. Complete the checkout with testnet crypto
3. Wait for settlement (usually 3-10 seconds)
4. Refresh wallets page

## Still Having Issues?

1. **Check this checklist:**
   - [ ] Backend server is running on port 8000
   - [ ] Frontend dev server is running on port 5173
   - [ ] Logged in with valid credentials
   - [ ] Completed onboarding flow
   - [ ] API Debugger shows mostly success/empty (not errors)
   - [ ] Browser console has no red error messages
   - [ ] `.env` file exists with correct value

2. **Collect diagnostic info:**
   - Screenshot of API Debugger results
   - Browser console errors (screenshot or copy)
   - Network tab showing failed requests
   - Backend logs (if accessible)

3. **Common fixes to try:**
   - Clear browser cache and localStorage
   - Logout and login again
   - Restart both frontend and backend servers
   - Delete and recreate account (if in development)

## Files Modified for Better Debugging

The following files now include improved error logging:

- `src/lib/api-client.ts` - Logs all API errors with full details
- `src/services/api.ts` - Logs all API errors from legacy client
- `src/app/components/ApiDebugger.tsx` - New diagnostic tool (NEW)
- `src/app/components/Settings.tsx` - Added Developer tab with debugger link
- `src/app/App.tsx` - Added `/debug` route

## Quick Test Script

Run this in browser console to test all major endpoints:

```javascript
const endpoints = [
  '/merchant/wallets/dashboard',
  '/merchant/payments?limit=10',
  '/analytics/overview?period=month',
  '/billing/info',
];

const token = localStorage.getItem('merchant_token');
const apiKey = localStorage.getItem('api_key');

Promise.all(
  endpoints.map(url => 
    fetch('http://localhost:8000' + url, {
      headers: {
        'Authorization': 'Bearer ' + token,
        'X-API-Key': apiKey
      }
    })
    .then(r => r.json())
    .then(data => ({ url, status: 'success', data }))
    .catch(error => ({ url, status: 'error', error: error.message }))
  )
).then(results => {
  console.table(results);
  results.forEach(r => {
    console.log(`\n${r.url}:`, r.data || r.error);
  });
});
```

This will test all endpoints and display results in a table.

---

**Last Updated:** March 6, 2026  
**Author:** ChainPe Team  
**Related Docs:** `BACKEND_INTEGRATION_GUIDE.md`, `CORS_FIX.md`
