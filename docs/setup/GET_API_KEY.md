# 🔑 Getting Your API Key - Quick Guide

## The Problem

You're seeing these errors:
```
POST http://localhost:8000/api/sessions/create 401 (Unauthorized)
GET http://localhost:8000/merchant/payments?limit=50 403 (Forbidden)
```

This happens because you haven't set up your API key yet.

---

## Solution: Get Your API Key

### Step 1: Login to Dashboard

You've already registered and logged in ✅

### Step 2: Get Your Profile to See API Key

There are two ways:

#### Option A: Via Settings Page (Easiest)

1. Go to Settings page in dashboard
2. Scroll to "API Keys" section
3. Copy your API Key (click the eye icon to reveal it)

#### Option B: Via Browser Console (Quick)

1. Open browser DevTools (F12)
2. Go to Console tab
3. Run this command:
```javascript
fetch('http://localhost:8000/merchant/profile', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('merchant_token')
  }
})
.then(r => r.json())
.then(data => {
  console.log('Your API Key:', data.api_key);
  console.log('Copy this key to your .env file');
});
```

### Step 3: Update .env File

1. Open `d:\Hackthon\frontend\.env`
2. Replace the API key line:
```bash
VITE_CHAINPE_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with your real API key.

### Step 4: Restart Dev Server

**Important:** Vite requires restart after .env changes!

```bash
# In your frontend terminal, press Ctrl+C
# Then restart:
npm run dev
```

### Step 5: Test Payment Creation

1. Refresh browser (Ctrl+R)
2. Go to Dashboard → Create Payment
3. Enter amount and submit
4. Should work now! ✅

---

## Why This Happens

The ChainPe API has two types of endpoints:

| Endpoint | Auth Type | Header |
|----------|-----------|--------|
| `/api/sessions/create` | API Key | `X-API-Key: pk_live_xxx` |
| `/merchant/payments` | JWT Token | `Authorization: Bearer eyJ...` |
| `/merchant/profile` | JWT Token | `Authorization: Bearer eyJ...` |

- **API Key** = Used to create payment sessions (public-ish endpoint)
- **JWT Token** = Used to access your merchant data (private endpoints)

You have the JWT token (from login), but need to set the API key for payment creation.

---

## Quick Fix Commands

Run these in order:

### 1. Get your API key (Browser Console):
```javascript
localStorage.getItem('merchant_token') && 
fetch('http://localhost:8000/merchant/profile', {
  headers: {'Authorization': 'Bearer ' + localStorage.getItem('merchant_token')}
})
.then(r => r.json())
.then(d => console.log('API Key:', d.api_key));
```

### 2. Update .env:
```bash
# Replace with your actual key
VITE_CHAINPE_API_KEY=pk_live_your_key_here
```

### 3. Restart:
```bash
# Ctrl+C then:
npm run dev
```

---

## Troubleshooting

### "403 Forbidden on merchant/profile"

Your JWT token might be invalid. Try:
1. Logout
2. Login again
3. Retry getting API key

### "Still getting 401 on create payment"

Check:
1. API key is correctly copied (no extra spaces)
2. Dev server was restarted
3. Browser was refreshed

### "Cannot read api_key"

Your merchant account might not have an API key yet. Contact backend admin or check backend logs.

---

## Expected Flow After Fix

✅ Login → Get JWT Token
✅ Access Settings → See API Key
✅ Update .env → Set API Key
✅ Restart Server → Load new env
✅ Create Payment → Works!
✅ View Payments → Works!

---

## Alternative: Hardcode Temporarily (Dev Only)

**For testing only**, you can hardcode the API key:

1. Open `src/services/api.ts`
2. Find the interceptor
3. Temporarily hardcode:
```typescript
if (apiKey && apiKey !== 'your_merchant_api_key_here') {
  config.headers['X-API-Key'] = apiKey;
} else {
  // TEMPORARY - Replace with your actual key
  config.headers['X-API-Key'] = 'your_actual_key_here';
}
```

**Remember to remove this before committing!**
