# Currency Symbol Fix - Action Required

## Current Status
The currency symbol fix has been applied to the codebase, but you're still seeing `?` instead of `₹` in the payments list.

## Why You're Still Seeing the Issue

The changes have been made to the source code, but your development server needs to be restarted to pick up the new axios configuration changes.

## Steps to Fix

### 1. Stop the Development Server
Press `Ctrl+C` in the terminal where your dev server is running, or kill the node processes:

```bash
# On Windows (PowerShell)
Get-Process node | Stop-Process -Force

# Or find and kill specific processes
taskkill /F /IM node.exe
```

### 2. Clear Browser Cache
- Open DevTools (F12)
- Right-click the refresh button
- Select "Empty Cache and Hard Reload"

Or:
- Press `Ctrl+Shift+Delete`
- Clear cached images and files
- Clear for "All time"

### 3. Restart Development Server
```bash
npm run dev
```

### 4. Verify the Fix
After restarting, check these pages:
- ✅ MRR/ARR page (you mentioned this is already working)
- ✅ Payments list page (should now show ₹ instead of ?)
- ✅ Dashboard overview
- ✅ Payment details page

## What Was Changed

### 1. Axios Configuration (All API Clients)
Added explicit UTF-8 encoding support:
```typescript
{
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8',
  },
  responseType: 'json',
  responseEncoding: 'utf8',
}
```

Files updated:
- `src/services/api.ts`
- `src/lib/api-client.ts`
- `src/services/teamAuth.service.ts`

### 2. Express Server
Added UTF-8 charset header:
```javascript
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  next();
});
```

### 3. MRRARRCard Component
Fixed to use pre-formatted `display_local` field instead of manual formatting.

### 4. Debug Logging
Added temporary debug logging to PaymentsList to help diagnose any remaining issues.

## Debugging

If the issue persists after restarting, open the browser console and look for logs like:
```
Payment data: {
  id: "pay_xxx",
  amount_fiat_local: {...},
  display_local: "₹8,867.99",  // Should show ₹ not ?
  local_symbol: "₹",
  dual_primary: "₹8,867.99"
}
```

If you see `?` in the console logs, the issue is in the backend response encoding.
If you see `₹` in the console but `?` in the UI, the issue is in the React rendering.

## Backend Verification

If the issue persists, verify the backend is sending proper UTF-8:

1. Check backend response headers:
```bash
curl -I http://localhost:8000/merchant/payments
```

Should include:
```
Content-Type: application/json; charset=utf-8
```

2. Check raw response data:
```bash
curl http://localhost:8000/merchant/payments | grep -o "local_symbol.*"
```

Should show:
```json
"local_symbol": "₹"
```

## Common Issues

### Issue 1: Browser Cache
**Symptom**: Still seeing `?` after restart
**Solution**: Hard refresh (Ctrl+Shift+R) or clear cache completely

### Issue 2: Multiple Node Processes
**Symptom**: Changes not taking effect
**Solution**: Kill all node processes and restart

### Issue 3: Backend Not Sending UTF-8
**Symptom**: Console logs show `?` in the data
**Solution**: Backend needs to set proper Content-Type header with charset=utf-8

### Issue 4: Database Encoding
**Symptom**: Backend logs show `?` when reading from database
**Solution**: Database connection needs UTF-8 charset configuration

## Expected Result

After applying the fix and restarting:

**Before:**
```
Amount: ?8,867.99
Discount: -?8,867.99
Paid: ?0.00
```

**After:**
```
Amount: ₹8,867.99
Discount: -₹8,867.99
Paid: ₹0.00
```

## Need Help?

If the issue persists after following these steps:

1. Check the browser console for the debug logs
2. Check the network tab to see the raw API response
3. Verify the backend is running and accessible
4. Check if other special characters (€, £, ¥) also show as `?`

The fact that MRR/ARR pages are working correctly suggests the fix is working, and you just need to restart the dev server for the payments list to pick up the changes.
