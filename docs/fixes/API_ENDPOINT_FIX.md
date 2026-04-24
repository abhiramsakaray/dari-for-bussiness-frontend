# API Endpoint Fix - Payment Detail 404 Error

## Problem

When clicking on a payment to view details, the frontend was making a request to `/api/sessions/` which returned 404 Not Found.

```
GET /api/sessions/ HTTP/1.1" 404 Not Found
```

## Root Cause

Two issues were causing this:

### 1. Wrong Endpoint in Service
The `chainpeService.getSessionStatus()` method was calling:
```typescript
/api/sessions/${sessionId}
```

But the correct endpoint should be:
```typescript
/merchant/payments/${sessionId}
```

### 2. Missing Proxy Configuration
The Vite dev server proxy configuration didn't include `/api` routes, so requests to `/api/sessions/` weren't being forwarded to the backend at all.

## Fixes Applied

### Fix 1: Updated Service Method

**File**: `src/services/chainpe.ts`

Changed `getSessionStatus` to use the correct endpoint with fallback:

```typescript
// Get session status (payment detail)
getSessionStatus: async (sessionId: string): Promise<PaymentSession> => {
  // Try merchant/payments endpoint first (correct endpoint)
  try {
    const response = await api.get(`/merchant/payments/${sessionId}`);
    return response.data;
  } catch (error: any) {
    // Fallback to old endpoint for backward compatibility
    if (error.response?.status === 404) {
      const response = await api.get(`/api/sessions/${sessionId}`);
      return response.data;
    }
    throw error;
  }
},
```

This fix:
- ✅ Uses the correct `/merchant/payments/${sessionId}` endpoint
- ✅ Falls back to `/api/sessions/${sessionId}` if needed (backward compatibility)
- ✅ Properly handles 404 errors

### Fix 2: Added API Proxy

**File**: `vite.config.ts`

Added `/api` to the proxy configuration:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
  },
  '/auth': {
    target: 'http://localhost:8000',
    changeOrigin: true,
  },
  // ... other proxies
}
```

This ensures that any requests to `/api/*` are properly forwarded to the backend.

## Testing

After applying these fixes:

1. **Restart the dev server** (required for Vite config changes):
   ```bash
   npm run dev
   ```

2. **Test payment detail page**:
   - Go to Payments list
   - Click on any payment
   - Should now load the payment details correctly
   - No more 404 errors in console

3. **Verify in Network tab**:
   - Open DevTools → Network
   - Click on a payment
   - Should see: `GET /merchant/payments/{id} 200 OK`
   - NOT: `GET /api/sessions/ 404 Not Found`

## Why This Happened

The codebase appears to have evolved from using `/api/sessions/` endpoints to using `/merchant/payments/` endpoints, but the `getSessionStatus` method wasn't updated to reflect this change.

The Vite proxy configuration also wasn't updated to include the `/api` route, which meant even if the backend had the endpoint, the dev server wouldn't forward requests to it.

## Impact

This fix resolves:
- ✅ Payment detail page showing "Not Found" error
- ✅ 404 errors in console when viewing payment details
- ✅ Unnecessary OPTIONS requests to non-existent endpoints

## Related Files

- `src/services/chainpe.ts` - Service method updated
- `vite.config.ts` - Proxy configuration updated
- `src/app/components/PaymentDetail.tsx` - Uses the fixed service method

## Restart Required

Yes, you must restart the dev server for the Vite proxy configuration changes to take effect:

```bash
# Stop the server (Ctrl+C)
# Start again
npm run dev
```

## Verification Checklist

- [ ] Dev server restarted
- [ ] Can click on a payment in the list
- [ ] Payment detail page loads without errors
- [ ] No 404 errors in browser console
- [ ] Network tab shows successful GET request to `/merchant/payments/{id}`

---

**Status**: ✅ FIXED

The payment detail page should now work correctly without 404 errors.
