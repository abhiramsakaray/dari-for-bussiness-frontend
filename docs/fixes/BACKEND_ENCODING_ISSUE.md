# Backend UTF-8 Encoding Issue - Root Cause Analysis

## Problem Summary

The currency symbol issue (`?` instead of `₹`) is **NOT a frontend problem** - it's a **backend encoding issue**.

## Evidence

### 1. Payment Creation Page Shows Correct Symbol
When you create a payment for ₹100 INR, the creation page shows:
```
₹100 INR
$0.01 USDC (converted)
```

This proves the frontend CAN display ₹ correctly when the data is properly encoded.

### 2. Payments List Shows Question Marks
The same payment in the list shows:
```
?99.82
```

This proves the backend API is sending corrupted UTF-8 data.

### 3. MRR/ARR Pages Work Correctly
You mentioned MRR/ARR pages show ₹ correctly, which means:
- Those endpoints are sending proper UTF-8
- The payments endpoint is NOT sending proper UTF-8

## Root Cause

The backend `/merchant/payments` endpoint is not setting the correct `Content-Type` header with UTF-8 charset, or the database connection is not using UTF-8 encoding.

## Backend Fixes Required

### 1. FastAPI Response Headers

The backend needs to ensure all responses include UTF-8 charset:

```python
# app/main.py or wherever FastAPI app is configured

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add middleware to set UTF-8 charset on all responses
@app.middleware("http")
async def add_charset_header(request, call_next):
    response = await call_next(request)
    if "application/json" in response.headers.get("content-type", ""):
        response.headers["content-type"] = "application/json; charset=utf-8"
    return response
```

### 2. Database Connection

Ensure the database connection uses UTF-8:

```python
# For PostgreSQL
DATABASE_URL = "postgresql://user:pass@localhost/db?client_encoding=utf8"

# For MySQL
DATABASE_URL = "mysql://user:pass@localhost/db?charset=utf8mb4"

# For SQLAlchemy
engine = create_engine(
    DATABASE_URL,
    connect_args={"options": "-c client_encoding=utf8"}
)
```

### 3. JSON Serialization

Ensure JSON responses don't escape Unicode characters:

```python
from fastapi.responses import JSONResponse
import json

class UTF8JSONResponse(JSONResponse):
    def render(self, content) -> bytes:
        return json.dumps(
            content,
            ensure_ascii=False,  # Don't escape Unicode
            allow_nan=False,
            indent=None,
            separators=(",", ":"),
        ).encode("utf-8")

# Use in routes
@app.get("/merchant/payments")
async def get_payments():
    return UTF8JSONResponse(content=payments_data)
```

### 4. Currency Service

Check the currency service is returning proper UTF-8 strings:

```python
# app/services/currency_service.py

COUNTRY_CURRENCY_MAP = {
    "India": ("INR", "₹", "Indian Rupee"),  # Make sure this is UTF-8
    # ...
}

def format_local_amount(amount: float, currency: str, symbol: str) -> str:
    """Format amount with currency symbol"""
    # Ensure the symbol is properly encoded
    formatted = f"{symbol}{amount:,.2f}"
    return formatted  # Should return "₹8,867.99" not "?8,867.99"
```

## Testing Backend Encoding

### Test 1: Check Response Headers
```bash
curl -I http://localhost:8000/merchant/payments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Should show:
```
Content-Type: application/json; charset=utf-8
```

### Test 2: Check Raw Response Data
```bash
curl http://localhost:8000/merchant/payments \
  -H "Authorization: Bearer YOUR_TOKEN" | grep -o "local_symbol.*"
```

Should show:
```json
"local_symbol": "₹"
```

NOT:
```json
"local_symbol": "?"
```

### Test 3: Check Database Encoding
```sql
-- PostgreSQL
SHOW client_encoding;
-- Should return: UTF8

-- MySQL
SHOW VARIABLES LIKE 'character_set%';
-- Should show utf8mb4
```

## Currency Display Issue

You also mentioned:
- Created payment for ₹100 INR → Shows correctly on creation page
- Same payment in list shows ?99.82
- Created payment for $2 → Shows as $0.02

This suggests:
1. **Encoding issue**: ₹ becomes ? (backend not sending UTF-8)
2. **Amount mismatch**: Different amounts shown in different places (possible caching or data sync issue)

### Possible Causes:
1. Backend is converting INR to USDC but not storing/returning the original fiat amount correctly
2. The `amount_fiat` and `amount_fiat_local` fields are not being populated correctly
3. The payments list endpoint returns different data structure than the creation endpoint

## Frontend Changes Already Made

The frontend has been updated to handle UTF-8 properly:

✅ All axios clients configured with UTF-8 encoding
✅ Express server sets UTF-8 charset header
✅ Components use `display_local` field from backend
✅ Debug logging added to see actual data

**But these changes can't fix backend encoding issues.**

## What Needs to Happen

### Backend Team Must:

1. **Add UTF-8 middleware** to FastAPI app
2. **Configure database connection** with UTF-8 charset
3. **Update JSON serialization** to not escape Unicode
4. **Test currency service** to ensure symbols are properly encoded
5. **Verify all payment endpoints** return consistent data structure

### To Verify Fix:

1. Check browser console for debug logs showing:
   ```javascript
   {
     local_symbol: "₹",  // Should be ₹ not ?
     display_local: "₹8,867.99"  // Should be ₹ not ?
   }
   ```

2. Check Network tab in DevTools:
   - Response headers should include `charset=utf-8`
   - Response body should show `₹` not `?` or `\u20b9`

3. All pages should show consistent currency symbols

## Temporary Workaround

If backend can't be fixed immediately, you could add a frontend workaround:

```typescript
// In utils.ts
export function fixCurrencySymbol(text: string, currency: string): string {
  const symbolMap: Record<string, string> = {
    'INR': '₹',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    // ... etc
  };
  
  // Replace ? with correct symbol
  if (text.startsWith('?') && symbolMap[currency]) {
    return text.replace('?', symbolMap[currency]);
  }
  
  return text;
}
```

But this is a **hack** and the real fix must be in the backend.

## Summary

| Issue | Location | Status |
|-------|----------|--------|
| UTF-8 encoding | Backend | ❌ Needs Fix |
| Frontend axios config | Frontend | ✅ Fixed |
| Component display logic | Frontend | ✅ Fixed |
| Amount consistency | Backend | ❌ Needs Investigation |

**Next Step**: Backend team needs to implement proper UTF-8 encoding in the FastAPI application and database connection.
