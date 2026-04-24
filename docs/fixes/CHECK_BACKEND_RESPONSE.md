# Check Backend Response - Diagnostic Steps

## The Issue

Backend team has implemented UTF-8 fixes, but you're still seeing `?` symbols. This could mean:

1. **Old data in database** - Data was stored as `?` before the fix
2. **Backend not restarted** - Changes haven't taken effect yet
3. **Database encoding issue** - Database itself has corrupted data
4. **Browser cache** - Frontend is showing cached data

## Step 1: Check Raw Backend Response

Open browser DevTools (F12) → Console tab, then run:

```javascript
// Fetch a payment directly and check the raw response
fetch('/merchant/payments?limit=1', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('merchant_token')
  }
})
.then(r => r.text())
.then(text => {
  console.log('Raw response text:', text);
  console.log('Contains ₹?', text.includes('₹'));
  console.log('Contains ?', text.includes('"local_symbol":"?"'));
  console.log('Contains \\u20b9?', text.includes('\\u20b9'));
  
  // Parse and check
  const data = JSON.parse(text);
  if (data.payments && data.payments[0]) {
    const payment = data.payments[0];
    console.log('First payment local_symbol:', payment.amount_fiat_local?.local_symbol);
    console.log('Char code:', payment.amount_fiat_local?.local_symbol?.charCodeAt(0));
    console.log('Expected char code for ₹:', '₹'.charCodeAt(0)); // Should be 8377
  }
});
```

### What to Look For:

**If backend is working correctly:**
```javascript
Raw response text: {"payments":[{"local_symbol":"₹",...}]}
Contains ₹? true
Contains ? false
First payment local_symbol: ₹
Char code: 8377
```

**If backend is still broken:**
```javascript
Raw response text: {"payments":[{"local_symbol":"?",...}]}
Contains ₹? false
Contains ? true
First payment local_symbol: ?
Char code: 63
```

**If backend is escaping Unicode:**
```javascript
Raw response text: {"payments":[{"local_symbol":"\u20b9",...}]}
Contains \u20b9? true
```

## Step 2: Check Response Headers

In DevTools → Network tab:
1. Reload the page
2. Click on the `/merchant/payments` request
3. Check Headers tab → Response Headers

Should show:
```
Content-Type: application/json; charset=utf-8
```

## Step 3: Check Database

The backend team needs to check if the database has corrupted data:

```sql
-- PostgreSQL
SELECT 
  id,
  local_symbol,
  octet_length(local_symbol) as byte_length,
  length(local_symbol) as char_length,
  ascii(local_symbol) as first_char_code
FROM payment_sessions
WHERE local_symbol IS NOT NULL
LIMIT 5;
```

**Expected for ₹:**
- `byte_length`: 3 (₹ is 3 bytes in UTF-8)
- `char_length`: 1
- `first_char_code`: 8377 (or shows as 226 if reading first byte)

**If corrupted:**
- `byte_length`: 1
- `char_length`: 1
- `first_char_code`: 63 (ASCII for ?)

## Step 4: Test New Payment

Create a brand new payment after the backend fix:

1. Go to Create Payment page
2. Enter amount: 100
3. Select currency: INR
4. Create payment
5. Check if it shows ₹ in the list

**If new payment shows ₹ correctly:**
- Backend fix is working
- Old data in database is corrupted
- Need to run data migration

**If new payment still shows ?:**
- Backend fix is not working
- Need to verify backend changes

## Step 5: Verify Backend Changes

Ask backend team to confirm:

### 1. Check if UTF8JSONResponse is being used:
```python
# In app/main.py
print(app.default_response_class)
# Should print: <class 'app.core.json_response.UTF8JSONResponse'>
```

### 2. Check if middleware is active:
```python
# In app/main.py
print(app.middleware)
# Should include add_utf8_charset middleware
```

### 3. Test currency service directly:
```python
# In Python shell
from app.services.currency_service import COUNTRY_CURRENCY_MAP

symbol = COUNTRY_CURRENCY_MAP["India"][1]
print(f"Symbol: {symbol}")
print(f"Char code: {ord(symbol)}")
print(f"Bytes: {symbol.encode('utf-8')}")

# Should print:
# Symbol: ₹
# Char code: 8377
# Bytes: b'\xe2\x82\xb9'
```

## Step 6: Clear Everything and Test

1. **Backend**: Restart FastAPI server
   ```bash
   # Stop server (Ctrl+C)
   # Start again
   python -m uvicorn app.main:app --reload
   ```

2. **Frontend**: Restart dev server
   ```bash
   # Stop (Ctrl+C)
   npm run dev
   ```

3. **Browser**: Hard refresh
   - Press `Ctrl+Shift+R`
   - Or clear cache completely

4. **Create new payment** and check if it shows ₹

## Solution: Data Migration

If the backend fix is working but old data is corrupted, you need to run a data migration:

```python
# migration script: fix_currency_symbols.py

from app.core.database import get_db
from app.services.currency_service import COUNTRY_CURRENCY_MAP

async def fix_currency_symbols():
    """Fix corrupted currency symbols in database"""
    db = next(get_db())
    
    # Get all payments with corrupted symbols
    payments = db.query(PaymentSession).filter(
        PaymentSession.local_symbol == '?'
    ).all()
    
    print(f"Found {len(payments)} payments with corrupted symbols")
    
    for payment in payments:
        # Get correct symbol based on currency
        currency = payment.fiat_currency or payment.local_currency
        
        # Find symbol from currency map
        for country, (curr_code, symbol, name) in COUNTRY_CURRENCY_MAP.items():
            if curr_code == currency:
                payment.local_symbol = symbol
                print(f"Fixed payment {payment.id}: {currency} → {symbol}")
                break
    
    db.commit()
    print("Migration complete!")

# Run it
import asyncio
asyncio.run(fix_currency_symbols())
```

## Quick Test Command

Run this in browser console to see exactly what's happening:

```javascript
window.diagnoseCurrency.test()
```

This will show if your browser can display currency symbols correctly.

## Summary

The issue is likely one of these:

1. ✅ **Backend fix works, old data corrupted** → Run data migration
2. ❌ **Backend fix not applied** → Verify backend changes
3. ❌ **Backend not restarted** → Restart FastAPI server
4. ❌ **Database encoding wrong** → Fix database connection string
5. ❌ **Browser cache** → Hard refresh

Most likely it's #1 - the backend fix is working for new data, but old data in the database is already corrupted and needs to be fixed with a migration script.
