# Final Diagnosis: Currency Symbol Issue

## The Real Problem

**This is a BACKEND encoding issue, not a frontend issue.**

## Evidence

### 1. Payment Creation Page Works ✅
```
CREATED
₹100 INR
$0.01 USDC (converted)
```
The creation page shows ₹ correctly because it's using hardcoded currency symbols from the CURRENCIES array in the frontend.

### 2. Payments List Shows ? ❌
```
Amount: ?99.82
```
The payments list shows `?` because it's displaying data from the backend API, which is sending corrupted UTF-8.

### 3. Amount Mismatch
- You created ₹100 INR → Shows as ₹100 on creation page
- Same payment shows ?99.82 in list
- You created $2 → Shows as $0.02

This suggests the backend is:
1. Not encoding UTF-8 properly (₹ → ?)
2. Converting amounts incorrectly or showing different fields

## Root Cause

The backend `/merchant/payments` endpoint is:
1. **Not setting `Content-Type: application/json; charset=utf-8` header**
2. **Not encoding the response body as UTF-8**
3. **Possibly reading corrupted data from database** (if DB connection isn't UTF-8)

## How to Verify

### Step 1: Open Browser Console (F12)

After restarting your dev server, open the payments list page and look for:

```javascript
🔍 Currency Encoding Diagnostics
  📊 Local Currency Data: {
    currency: "INR",
    symbol: "?",  // ❌ Should be "₹"
    symbolCharCode: 63,  // ❌ Should be 8377 (for ₹)
    displayLocal: "?8,867.99",  // ❌ Should be "₹8,867.99"
  }
```

If you see `symbol: "?"` and `symbolCharCode: 63`, the backend is sending corrupted data.

### Step 2: Check Network Tab

1. Open DevTools → Network tab
2. Reload the payments page
3. Click on the `/merchant/payments` request
4. Check Response Headers:
   ```
   Content-Type: application/json; charset=utf-8  ← Should have charset
   ```
5. Check Response body (raw):
   ```json
   {
     "local_symbol": "₹"  ← Should be ₹ not ? or \u003f
   }
   ```

### Step 3: Use Diagnostic Tools

In the browser console, run:
```javascript
// Test if browser supports UTF-8
window.diagnoseCurrency.test()

// This will show:
// INR (Rupee): ₹ (U+20B9)
// EUR (Euro): € (U+20AC)
// etc.
```

If your browser can display these symbols, the issue is definitely in the backend.

## Backend Fix Required

The backend team needs to add this to FastAPI:

```python
# app/main.py

@app.middleware("http")
async def add_utf8_charset(request, call_next):
    response = await call_next(request)
    if "application/json" in response.headers.get("content-type", ""):
        response.headers["content-type"] = "application/json; charset=utf-8"
    return response

# Also ensure database connection uses UTF-8
# PostgreSQL: ?client_encoding=utf8
# MySQL: ?charset=utf8mb4
```

## Frontend Changes (Already Done)

✅ All axios clients configured with UTF-8
✅ Express server sets UTF-8 headers
✅ Components use correct display logic
✅ Diagnostic tools added

**But frontend can't fix backend encoding issues!**

## What You Should See After Backend Fix

### Before (Current)
```
Amount: ?99.82
Discount: -?8,867.99
Paid: ?0.00
```

### After (Expected)
```
Amount: ₹99.82
Discount: -₹8,867.99
Paid: ₹0.00
```

## Next Steps

1. **Restart your dev server** to load the diagnostic tools:
   ```bash
   npm run dev
   ```

2. **Open browser console** and check the diagnostic output

3. **Share the console output** with the backend team showing:
   - `symbolCharCode: 63` (proves it's receiving ?)
   - Expected: `symbolCharCode: 8377` (for ₹)

4. **Backend team fixes** the UTF-8 encoding

5. **Verify fix** by checking console shows `symbol: "₹"`

## Why MRR Page Works But Payments List Doesn't

Different backend endpoints may have different configurations. The MRR endpoint might be:
- Using a different response serializer
- Reading from a different database table
- Using a different FastAPI route configuration

The payments endpoint specifically needs the UTF-8 fix.

## Summary

| Component | Status | Action Required |
|-----------|--------|-----------------|
| Frontend axios config | ✅ Fixed | None |
| Frontend components | ✅ Fixed | None |
| Diagnostic tools | ✅ Added | Run in console |
| Backend UTF-8 encoding | ❌ Broken | **Backend team must fix** |
| Database encoding | ❓ Unknown | Backend team must verify |

**The ball is in the backend team's court now.**
