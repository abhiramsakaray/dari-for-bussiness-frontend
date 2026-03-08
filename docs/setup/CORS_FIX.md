# 🔧 CORS Error Fix

## Problem
You're seeing this error:
```
Access to XMLHttpRequest at 'http://localhost:8000/auth/register' from origin 'http://localhost:5173' has been blocked by CORS policy
```

## Solution

### Option 1: Update Backend CORS Configuration (Recommended)

1. Open your backend `.env` file
2. Update the `CORS_ORIGINS` to include your frontend URL:

```bash
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

3. Restart your backend server:
```bash
# Press Ctrl+C to stop
# Then restart
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Option 2: Check Backend CORS Middleware

If updating `.env` doesn't work, check your backend `main.py` or `app/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Option 3: Temporary Development Fix

For development only, you can allow all origins:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ Development only!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Warning:** Never use `allow_origins=["*"]` in production!

---

## Verification

After updating CORS:

1. Restart backend server
2. Refresh frontend (Ctrl+R or F5)
3. Try registering again
4. Check browser console - CORS error should be gone

---

## Still Having Issues?

### Check Backend is Running
```bash
curl http://localhost:8000/health
```

### Check Backend Logs
Look for CORS-related messages in your backend terminal

### Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Try registering
4. Look for the `/auth/register` request
5. Check the Response Headers for `Access-Control-Allow-Origin`

---

## Expected Headers

When CORS is configured correctly, you should see these headers in the response:

```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: *
Access-Control-Allow-Headers: *
```

---

## Quick Test

Run this command to test if CORS is working:

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"test123"}' \
  -v
```

Look for `Access-Control-Allow-Origin` in the response headers.
