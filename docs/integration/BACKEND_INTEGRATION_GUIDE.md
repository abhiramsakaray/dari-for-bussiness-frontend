# Backend Integration - Quick Reference

## 🔄 What Changed: Before vs After

### Login Component
**Before (Mock):**
```typescript
setTimeout(() => {
  const mockToken = "mock_jwt_token_" + Date.now();
  localStorage.setItem('merchant_token', mockToken);
  window.location.href = '#/dashboard';
}, 1000);
```

**After (Real API):**
```typescript
const response = await chainpeService.login({ email, password });
localStorage.setItem('merchant_token', response.access_token);
window.location.href = '#/dashboard';
```

---

### Register Component
**Before (Mock):**
```typescript
setTimeout(() => {
  const mockToken = "mock_jwt_token_" + Date.now();
  localStorage.setItem('merchant_token', mockToken);
}, 1000);
```

**After (Real API):**
```typescript
const response = await chainpeService.register({
  name: formData.name,
  email: formData.email,
  password: formData.password,
  stellar_address: formData.stellarAddress,
  webhook_url: formData.webhookUrl,
});
localStorage.setItem('merchant_token', response.access_token);
```

---

### Dashboard Component
**Before (Mock):**
```typescript
const mockMetrics = {
  totalVolume: "12,430.25",
  paymentsToday: 18,
};

const mockRecentPayments = [
  { id: "pay_abc123", amount: "150.00", status: "paid" },
  // ...hard-coded array
];
```

**After (Real API):**
```typescript
const { payments, isLoading } = usePaymentHistory({ limit: 10 });

// Calculate real metrics
const totalVolume = payments.reduce((sum, p) => 
  sum + parseFloat(p.amount_usdc || '0'), 0
);
const paymentsToday = payments.filter(p => 
  new Date(p.created_at).toDateString() === today
).length;
```

---

### CreatePayment Component
**Before (Mock):**
```typescript
setTimeout(() => {
  const mockSession = {
    session_id: `pay_${Math.random().toString(36).substring(7)}`,
    amount_usdc: formData.amount,
    checkout_url: `${window.location.origin}/checkout/...`,
  };
  setSessionData(mockSession);
}, 1000);
```

**After (Real API):**
```typescript
const { createPayment } = useChainPe();

const session = await createPayment({
  amount_usdc: parseFloat(formData.amount),
  order_id: formData.orderId,
  success_url: formData.successUrl,
  cancel_url: formData.cancelUrl,
});
setSessionData(session);
```

---

### Settings Component
**Before (Mock):**
```typescript
const [formData] = useState({
  name: "My Store",
  email: "merchant@store.com",
  stellarAddress: "GCXXX...",
});

setTimeout(() => {
  toast.success("Settings saved!");
}, 1000);
```

**After (Real API):**
```typescript
const { profile, updateProfile } = useMerchantProfile();

useEffect(() => {
  if (profile) {
    setFormData({
      name: profile.name,
      email: profile.email,
      stellarAddress: profile.stellar_address || "",
    });
  }
}, [profile]);

await updateProfile({
  stellar_address: formData.stellarAddress,
  webhook_url: formData.webhookUrl,
});
```

---

## 📦 New Files Created

### Services
1. **src/services/api.ts**
   - Axios instance with auth interceptors
   - Automatic token injection
   - Error handling

2. **src/services/chainpe.ts**
   - All API methods (login, register, createSession, etc.)
   - TypeScript interfaces for type safety

### Hooks
1. **src/hooks/useChainPe.ts**
   - Payment creation with loading/error states

2. **src/hooks/usePaymentStatus.ts**
   - Real-time polling for payment status
   - Auto-stop when paid/expired

3. **src/hooks/usePaymentHistory.ts**
   - Fetch payment list
   - Refetch capability

4. **src/hooks/useMerchantProfile.ts**
   - Load and update merchant profile

### Configuration
1. **.env**
   - Backend URL configuration
   - API key storage

---

## 🔌 API Endpoints Being Used

| Endpoint | Method | Used In |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/auth/register` | POST | Register component |
| `/auth/login` | POST | Login component |
| `/merchant/profile` | GET | Settings, Dashboard |
| `/merchant/profile` | PUT | Settings |
| `/merchant/payments` | GET | Dashboard, PaymentsList |
| `/api/sessions/create` | POST | CreatePayment |
| `/api/sessions/{id}` | GET | Payment status checks |

---

## 🎯 Key Features Now Working

✅ **Real Authentication**
- JWT-based login/register
- Automatic token refresh
- Secure session management

✅ **Live Payment Data**
- Real-time metrics calculation
- Payment history from backend
- Status polling every 3 seconds

✅ **Payment Creation**
- Backend session generation
- Checkout URL creation
- QR code ready URLs

✅ **Profile Management**
- Load merchant data
- Update Stellar address
- Update webhook URL
- Display real API keys

✅ **Search & Filter**
- Client-side search in PaymentsList
- Filter by session ID, tx hash, order ID

---

## 🧪 How to Test Each Feature

### 1. Authentication
```bash
# Open browser DevTools Console

# After login, check:
localStorage.getItem('merchant_token')
# Should see: "eyJ0eXAiOiJKV1QiLCJhbGc..."

# Check Network tab:
# Should see POST to http://localhost:8000/auth/login
```

### 2. Payment Creation
```bash
# Create a payment in dashboard
# Check Network tab for:
POST http://localhost:8000/api/sessions/create

# Response should contain:
{
  "session_id": "sess_...",
  "checkout_url": "http://localhost:8000/checkout/sess_...",
  "amount_usdc": "50.00"
}
```

### 3. Payment Polling
```bash
# After creating payment, open Network tab
# Filter by "/api/sessions/"
# Should see requests every 3 seconds until status = "paid" or "expired"
```

### 4. Dashboard Metrics
```bash
# Create multiple payments
# Refresh dashboard
# Metrics should update based on real data
```

---

## 🚨 Common Issues & Fixes

### "Failed to fetch"
```
Cause: Backend not running
Fix: Start backend with `uvicorn app.main:app --reload`
```

### "401 Unauthorized"
```
Cause: Invalid or expired token
Fix: Log out and log back in
```

### "CORS policy error"
```
Cause: Frontend URL not in CORS_ORIGINS
Fix: Add http://localhost:5173 to backend CORS_ORIGINS env var
```

### Payments not updating
```
Cause: Stellar listener not running
Fix: Start listener with `python -m app.services.stellar_listener`
```

### ".env variables not loading"
```
Cause: Vite requires restart after .env changes
Fix: Stop dev server (Ctrl+C) and run `npm run dev` again
```

---

## 📱 Environment Variables Reference

```bash
# .env file (Frontend)
VITE_API_URL=http://localhost:8000          # Backend URL
VITE_CHAINPE_API_KEY=pk_live_xxxxxxxxxxxx   # Merchant API key (get from dashboard)
```

```bash
# .env file (Backend - for reference)
DATABASE_URL=postgresql://...
STELLAR_NETWORK=testnet
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
APP_URL=http://localhost:8000
```

---

## 🎨 Code Style Notes

All API calls follow this pattern:

```typescript
// 1. Import service
import { chainpeService } from '../../services/chainpe';

// 2. Use in component
const handleSubmit = async () => {
  try {
    const result = await chainpeService.someMethod(data);
    // Handle success
  } catch (err) {
    // Handle error
  }
};
```

Or with hooks:

```typescript
// 1. Import hook
import { usePaymentHistory } from '../../hooks/usePaymentHistory';

// 2. Use in component
const { payments, isLoading, error } = usePaymentHistory({ limit: 10 });

// 3. Render
if (isLoading) return <Spinner />;
if (error) return <Error message={error} />;
return <PaymentList data={payments} />;
```

---

## ✨ What's Next?

Your frontend is production-ready for backend integration! 

To go live:
1. Deploy backend to production
2. Update `VITE_API_URL` in frontend `.env`
3. Build frontend: `npm run build`
4. Deploy `dist/` folder to hosting (Vercel, Netlify, etc.)

Happy coding! 🚀
