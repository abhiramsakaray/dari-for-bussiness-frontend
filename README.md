# Dari Payments Frontend - Merchant Dashboard

A modern, React-based merchant dashboard for Dari Payments. Provides a complete interface for managing crypto payments across multiple blockchains with a Stripe-inspired UX.

## 🌟 Overview

This is the merchant-facing dashboard that allows businesses to:
- Register and authenticate merchant accounts
- Create and manage payment sessions
- Monitor real-time payment status
- View payment analytics and history
- Configure merchant settings and webhooks
- Access API keys for integration

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173`

**Default Admin Credentials**:
- Email: `admin@daripay.xyz`
- Password: (set in backend .env)

## ⚙️ Configuration

Create a `.env` file:
```env
VITE_API_URL=http://localhost:8000
# For production: VITE_API_URL=https://api.daripay.xyz
```

**Note:** API key is no longer needed in `.env` - it's automatically provided after login!

## 🔐 Authentication Flow

1. **Register/Login** → Backend returns `{ access_token, api_key }`
2. **Auto-stored** → Both saved to localStorage
3. **Auto-authenticated** → All requests include both headers automatically

No manual configuration needed! 🎉

## ✨ Features

### Authentication
- ✅ Merchant registration with email validation
- ✅ Secure login with JWT tokens
- ✅ Automatic token refresh and session management
- ✅ API key auto-configuration post-login

### Dashboard
- ✅ Real-time payment analytics
- ✅ Revenue charts and metrics
- ✅ Recent payment activity feed
- ✅ Quick stats overvilibrary
- **TypeScript 5** - Type safety
- **Vite 6** - Build tool and dev server
- **Radix UI** - Accessible component primitives
- **Tailwind CSS 4** - Utility-first styling
- **Axios** - HTTP client with interceptors
- **React Router** - Client-side routing (hash mode)
- **Sonner** - Toast notifications
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **QRCode.react** - QR code generation
daripayments-frontend/
├── src/
│   ├── app/
│   │   ├── App.tsx                    # Main app component & routing
│   │   └── components/
│   │       ├── Login.tsx              # Authentication
│   │       ├── Register.tsx           # Merchant registration
│   │       ├── Dashboard.tsx          # Main dashboard
│   │       ├── CreatePayment.tsx      # Payment session creator
│   │       ├── PaymentHistory.tsx     # Transaction history
│   │       ├── Settings.tsx           # Merchant settings
│   │       ├── Admin.tsx              # Admin panel
│   │       ├── Checkout.tsx           # Hosted checkout page
│   │       └── ui/                    # Reusable UI components
│   │           ├── Button.tsx
│   │           ├── Card.tsx
│   │           ├── Input.tsx
│   │           └── ...
│   ├── services/ at `VITE_API_URL`.

### API Service (`services/api.ts`)

```typescript
// Authentication
await api.post('/auth/register', { email, password, businessName });
await api.post('/auth/login', { email, password });

// Payment Sessions
const session = await api.post('/api/sessions/create', {
  amount: "100.00",
  description: "Product purchase",
  success_url: "https://merchant.com/success",
  cancel_url: "https://merchant.com/cancel"
});

// Merchant Operations
const profile = await api.get('/merchant/profile');
await api.patch('/merchant/profile', { business_name: "New Name" });
const payments = await api.get('/merchant/payments');

// Payment Status
const status = await api.get(`/api/sessions/${sessionId}`);
```

### Auto-Authentication

All API calls automatically include:
- `Authorization: Bearer {access_token}` (from localStorage)
- `X-API-Key: {api_key}` (from localStorage)

Tokens are stored after login and cleared on logout.

### Axios Interceptors

Request interceptor adds authentication headers:
```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  const apiKey = localStorage.getItem('api_key');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (apiKey) config.headers['X-API-Key'] = apiKey;
  return config;
### Color Palette
- **Primary**: Deep Purple (`#6D28D9`)
- **Background**: Dark Grey (`#0A0A0A`)
- **Surface**: Charcoal (`#1A1A1A`)
- **�️ Routes

The app uses hash-based routing for compatibility:

- **Landing**: `#/` - Welcome page
- **Login**: `#/login` - Merchant authentication
- **Register**: `#/register` - New merchant signup
- **Dashboard**: `#/dashboard` - Main merchant dashboard
- **Create Payment**: `#/dashboard/create` - New payment session
- **Payment History**: `#/dashboard/payments` - Transaction list
- **Settings**: `#/dashboard/settings` - Merchant configuration
- **Checkout**: `#/checkout/:sessionId` - Hosted payment page
- **Admin**: `#/admin` - Admin panel (requires admin role)

## 🌐 Deployment

### Build for Production

```bash
npm run build
```

Output: `dist/` folder

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy to Netlify

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Set environment variable: `VITE_API_URL`

### Environment Variables

Production `.env`:
```env
VITE_API_URL=https://api.daripay.xyz
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Registration flow
- [ ] Login/logout
- [ ] Create payment session
- [ ] View payment history
- [ ] Update merchant settings
- [ ] Admin panel access (if admin)

See [TESTING_CHECKLIST.md](docs/development/TESTING_CHECKLIST.md) for complete test plan.

## 🐛 Troubleshooting

### API Connection Issues
- Verify `VITE_API_URL` is correct
- Check backend is running
- Inspect browser console for CORS errors

### Authentication Failures
- Clear localStorage and try again
- Check backend logs for error details
- Verify API key is set after login

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📦 Scripts

```bash
npm run dev          # Start dev server (Vite)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add NewFeature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open Pull Request

## 📚 Documentation

All documentation lives in the [`docs/`](docs/) folder:

| Category | Contents |
|----------|----------|
| [docs/setup/](docs/setup/) | Quick start, API key setup, CORS fixes |
| [docs/integration/](docs/integration/) | Backend integration guide & status |
| [docs/features/](docs/features/) | Enterprise features, subscription plans |
| [docs/troubleshooting/](docs/troubleshooting/) | Data display issues & fixes |
| [docs/development/](docs/development/) | Testing checklist, security notes |

## 📝 License

MIT License - See [LICENSE](../LICENSE) file for details

## 🔗 Related Projects

- **Backend API**: https://api.daripay.xyz
- **Documentation**: https://docs.daripay.xyz
- **Dashboard**: https://dashboard.daripay.xyz
- **Checkout**: https://pay.daripay.xyz

---

**Built by Dari Payments** | [Documentation](https://docs.daripay.xyz)
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   └── ...
├── services/
│   ├── api.ts            # Axios configuration
│   └── chainpe.ts        # API service methods
├── hooks/                # Custom React hooks
├── styles/               # Global styles
└── main.tsx             # Entry point
```

## 🔗 Backend Integration

This frontend connects to the Dari Payments API at `https://api.daripay.xyz`:
- **Auth**: `/auth/register`, `/auth/login`
- **Payments**: `/api/sessions/create`, `/api/sessions/{id}`
- **Merchant**: `/merchant/profile`, `/merchant/payments`

All API calls automatically include:
- `Authorization: Bearer {token}`
- `X-API-Key: {api_key}`

## 🎨 Design System

- **Colors**: Deep Purple (#6D28D9), Black, Dark Grey
- **Fonts**: Inter (body), Space Grotesk (headings)
- **Style**: Modern, crypto-native, clean UI

## 📝 License

MIT
- Landing: `#/`
- Login: `#/login`
- Register: `#/register`
- Dashboard: `#/dashboard`
- Create Payment: `#/dashboard/create`
- Checkout Demo: `#/checkout/demo_session`
- Admin: `#/admin`

## 💾 Mock Data

All payment data and API calls are mocked for demonstration purposes:
- Session IDs: `pay_xxx`
- Transaction hashes: `ABC123XYZ`
- Mock Stellar address: `GCXX...XX12`

## 🛠️ Tech Stack

- React 18
- Tailwind CSS 4
- Lucide React (icons)
- Recharts (charts)
- Sonner (toasts)
- TypeScript

## 🎨 Design Principles

1. **Flat Design**: No gradients or glassmorphism
2. **2D Graphics**: Line-art and flat vector illustrations
3. **Crypto-Native**: Web3/infrastructure SaaS aesthetic
4. **Developer-Friendly**: Clean, minimal, professional
5. **Stripe-like UX**: Familiar payment flow for merchants

## 📱 Responsive

Fully responsive design works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔗 Integration Flow

1. Merchant creates payment session via API
2. Customer redirected to hosted checkout page at `https://pay.daripay.xyz`
3. Customer connects wallet and completes payment
4. Dari Payments detects payment on blockchain
5. Webhook notification sent to merchant
6. Customer redirected to success URL

## 📝 Notes

- This is a frontend-only demo with mock data
- No real blockchain integration
- No actual payment processing
- All data is simulated for demonstration

---

**Built with ❤️ for multi-chain crypto payments**
