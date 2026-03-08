# 🚀 Quick Start Commands

Copy and paste these commands to get started immediately.

---

## Step 1: Install Dependencies

```bash
cd d:\Hackthon\frontend
npm install
```

This installs axios and all other required packages.

---

## Step 2: Start Backend Services

Open **TWO** separate terminals:

### Terminal 1: Backend API
```bash
# Navigate to your backend directory
cd path/to/your/backend

# Start the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2: Stellar Listener
```bash
# Same backend directory
cd path/to/your/backend

# Start the payment listener
python -m app.services.stellar_listener
```

---

## Step 3: Start Frontend

Open a **THIRD** terminal:

```bash
cd d:\Hackthon\frontend
npm run dev
```

---

## Step 4: Open in Browser

The frontend will be available at:
```
http://localhost:5173
```

Or whatever port Vite assigns (check the terminal output).

---

## Step 5: First Time Setup

1. **Register a Merchant Account**
   - Go to: `http://localhost:5173/#/register`
   - Fill in the form
   - Submit

2. **Get Your API Key**
   - After registration, you'll be redirected to dashboard
   - Go to Settings page
   - Copy your API Key
   - Update `.env` file:
     ```bash
     VITE_CHAINPE_API_KEY=your_api_key_here
     ```
   - Restart frontend: Press `Ctrl+C` and run `npm run dev` again

3. **Test Payment Creation**
   - Go to Dashboard → Create Payment
   - Enter amount: `50.00`
   - Submit
   - Copy the checkout URL
   - Test the payment flow

---

## Troubleshooting Commands

### Check if Backend is Running
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "network": "testnet"
}
```

### Check Environment Variables
```bash
# Windows PowerShell
cat .env

# Windows CMD
type .env
```

### Clear Cache and Restart
```bash
# Stop dev server (Ctrl+C)
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules
npm install

# Restart
npm run dev
```

### Check Installed Packages
```bash
npm list axios
```

Should show:
```
└── axios@1.7.9
```

---

## Common Port Conflicts

### Frontend Port Already in Use
```bash
# Kill process on port 5173 (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- --port 3000
```

### Backend Port Already in Use
```bash
# Kill process on port 8000 (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

---

## Quick Testing Commands

### Test Login API
```bash
curl -X POST http://localhost:8000/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

### Test Create Payment
```bash
curl -X POST http://localhost:8000/api/sessions/create ^
  -H "Content-Type: application/json" ^
  -H "X-API-Key: your_api_key" ^
  -d "{\"amount_usdc\":50.00,\"success_url\":\"http://localhost:5173\",\"cancel_url\":\"http://localhost:5173\"}"
```

---

## Development Workflow

**Recommended order for daily development:**

1. Start Backend API (Terminal 1)
2. Start Stellar Listener (Terminal 2)
3. Start Frontend (Terminal 3)
4. Open browser to `http://localhost:5173`
5. Start coding!

**To stop everything:**
- Press `Ctrl+C` in each terminal
- Close terminals

---

## Environment Variables Checklist

Make sure your `.env` file contains:
```bash
VITE_API_URL=http://localhost:8000
VITE_CHAINPE_API_KEY=your_api_key_here
```

**Note:** After changing `.env`, always restart the dev server!

---

## File Locations Reference

```
d:\Hackthon\frontend\
├── .env                          # Environment variables
├── package.json                   # Dependencies (axios added)
├── src/
│   ├── services/
│   │   ├── api.ts                # Axios instance
│   │   └── chainpe.ts            # API methods
│   ├── hooks/
│   │   ├── useChainPe.ts         # Payment creation
│   │   ├── usePaymentStatus.ts   # Status polling
│   │   ├── usePaymentHistory.ts  # Payment list
│   │   └── useMerchantProfile.ts # Profile management
│   └── app/
│       └── components/
│           ├── Login.tsx          # Updated
│           ├── Register.tsx       # Updated
│           ├── Dashboard.tsx      # Updated
│           ├── PaymentsList.tsx   # Updated
│           ├── CreatePayment.tsx  # Updated
│           └── Settings.tsx       # Updated
└── Documentation/
    ├── INTEGRATION_COMPLETE.md
    ├── BACKEND_INTEGRATION_GUIDE.md
    ├── TESTING_CHECKLIST.md
    └── README_INTEGRATION.md
```

---

## Ready to Go! 🎉

Run these three commands in order:

```bash
# 1. Install dependencies
npm install

# 2. Check .env file exists and is configured
cat .env

# 3. Start the dev server
npm run dev
```

Then visit `http://localhost:5173` in your browser!

---

**Questions?** Check the documentation files or the troubleshooting section above.
