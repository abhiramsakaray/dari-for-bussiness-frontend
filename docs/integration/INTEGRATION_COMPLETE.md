# ChainPe Frontend - Backend Integration Complete! 🎉

## ✅ What's Been Done

All mock data has been removed and replaced with real backend API integration:

### 1. **Service Layer Created** ✓
- `src/services/api.ts` - Axios instance with interceptors for auth and error handling
- `src/services/chainpe.ts` - All ChainPe API methods with TypeScript types

### 2. **Custom React Hooks Created** ✓
- `src/hooks/useChainPe.ts` - Payment creation logic
- `src/hooks/usePaymentStatus.ts` - Real-time payment status polling
- `src/hooks/usePaymentHistory.ts` - Fetch payment history
- `src/hooks/useMerchantProfile.ts` - Merchant profile management

### 3. **Components Updated** ✓
- **Login.tsx** - Real authentication with backend
- **Register.tsx** - Real merchant registration
- **Dashboard.tsx** - Live payment data with metrics
- **PaymentsList.tsx** - Real payment history with search
- **CreatePayment.tsx** - Backend payment session creation
- **Settings.tsx** - Real merchant profile editing

### 4. **Environment Variables** ✓
- `.env` file created with backend URL configuration

---

## 🚀 Setup Instructions

### Step 1: Install Missing Dependencies

The integration uses `axios` for API calls. Install it:

```bash
cd d:\Hackthon\frontend
npm install axios
```

### Step 2: Configure Environment Variables

Update the `.env` file with your backend URL and API key:

```bash
VITE_API_URL=http://localhost:8000
VITE_CHAINPE_API_KEY=your_actual_api_key_here
```

**Important:** After registering/logging in, you'll get an API key from your merchant dashboard. Update `VITE_CHAINPE_API_KEY` with that value.

### Step 3: Start Backend Services

Make sure your backend is running:

```bash
# Terminal 1: Start backend API
cd path/to/backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Start Stellar payment listener
python -m app.services.stellar_listener
```

### Step 4: Start Frontend

```bash
cd d:\Hackthon\frontend
npm run dev
```

Your frontend will be available at: `http://localhost:5173` (or the port Vite assigns)

---

## 🔄 How It Works Now

### Authentication Flow
1. User registers via Register component → Backend creates merchant account
2. Backend returns JWT token → Stored in localStorage
3. All API requests include JWT in Authorization header
4. Expired tokens automatically redirect to login

### Payment Flow
1. Merchant creates payment in CreatePayment → Backend creates session
2. Backend returns checkout URL with session ID
3. Customer completes payment → Stellar listener detects transaction
4. Dashboard updates automatically via polling every 3 seconds

### Data Flow
- **Dashboard**: Fetches real payment history on mount, calculates metrics
- **PaymentsList**: Displays all payments with search/filter
- **Settings**: Loads merchant profile, allows updates to Stellar address and webhook URL

---

## 🔧 API Integration Details

### Endpoints Used

| Component | Endpoint | Method | Purpose |
|-----------|----------|--------|---------|
| Login | `/auth/login` | POST | Authenticate merchant |
| Register | `/auth/register` | POST | Create merchant account |
| Dashboard | `/merchant/payments` | GET | Fetch payment history |
| CreatePayment | `/api/sessions/create` | POST | Create payment session |
| Settings | `/merchant/profile` | GET/PUT | Get/update profile |
| PaymentStatus | `/api/sessions/{id}` | GET | Check payment status |

### Authentication

All authenticated requests include:
```javascript
Authorization: Bearer {jwt_token}
```

Public endpoints (create session) use:
```javascript
X-API-Key: {merchant_api_key}
```

---

## 🐛 Troubleshooting

### Issue: "Network Error" or CORS Error

**Solution:** Make sure backend CORS is configured:
```bash
# In backend .env file
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Issue: "401 Unauthorized"

**Solutions:**
1. Check if JWT token exists: `localStorage.getItem('merchant_token')`
2. Try logging out and logging in again
3. Verify backend is running

### Issue: API Key Not Working

**Solution:**
1. Login to dashboard
2. Go to Settings page
3. Copy your API Key
4. Update `.env` file: `VITE_CHAINPE_API_KEY=your_actual_key`
5. Restart dev server

### Issue: Payments Not Showing

**Solutions:**
1. Ensure Stellar listener is running
2. Check backend logs for errors
3. Verify merchant is authenticated
4. Check browser console for errors

---

## 📊 Testing the Integration

### 1. Test Registration
```
1. Go to http://localhost:5173/#/register
2. Fill in the form
3. Submit → Should redirect to dashboard
4. Check localStorage for 'merchant_token'
```

### 2. Test Login
```
1. Go to http://localhost:5173/#/login
2. Use registered credentials
3. Submit → Should redirect to dashboard
```

### 3. Test Payment Creation
```
1. Go to Dashboard → Create Payment
2. Enter amount (e.g., 50.00)
3. Enter URLs
4. Submit → Should create session and show checkout URL
```

### 4. Test Dashboard
```
1. Create a few payment sessions
2. Dashboard should show:
   - Total volume
   - Payment count
   - Success rate
   - Recent payments list
```

### 5. Test Settings
```
1. Go to Settings
2. Update Stellar Address
3. Update Webhook URL
4. Save → Should persist changes
```

---

## 🔐 Security Notes

1. **Environment Variables**: Never commit `.env` file to git
2. **API Keys**: Keep them secret, rotate regularly
3. **JWT Tokens**: Stored in localStorage (consider httpOnly cookies for production)
4. **HTTPS**: Use HTTPS in production

---

## 📝 Next Steps

### Optional Enhancements

1. **Add Loading States**: Show spinners during API calls
2. **Error Boundaries**: Catch and display errors gracefully
3. **Pagination**: Add pagination to payment lists
4. **Filtering**: Add date range filters for payments
5. **Webhooks**: Implement webhook testing UI
6. **Analytics**: Add charts for payment trends

### Production Deployment

1. Update `.env` with production API URL
2. Set `STELLAR_NETWORK=public` in backend
3. Use real Stellar addresses
4. Enable HTTPS
5. Use proper secret management

---

## 🆘 Need Help?

Check these files if you need to understand the integration:
- `src/services/chainpe.ts` - All API methods
- `src/hooks/useChainPe.ts` - Payment creation hook
- `src/hooks/usePaymentHistory.ts` - Payment fetching hook

---

## ✨ Summary

Your frontend is now fully integrated with the ChainPe backend! 

**What Changed:**
- ❌ No more mock data
- ✅ Real API calls
- ✅ Real authentication
- ✅ Real payment sessions
- ✅ Live payment status updates
- ✅ Real merchant profiles

**Ready to test!** 🚀
