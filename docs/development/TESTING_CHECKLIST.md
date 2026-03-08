# 🧪 Testing Checklist - ChainPe Backend Integration

Use this checklist to verify all features are working correctly with the backend.

---

## ✅ Pre-Flight Checks

- [ ] Backend server is running (`http://localhost:8000`)
- [ ] Stellar listener is running
- [ ] Frontend dev server is running (`npm run dev`)
- [ ] `.env` file exists with correct `VITE_API_URL`
- [ ] `axios` is installed (`npm list axios`)
- [ ] No console errors on page load

---

## 🔐 Authentication Tests

### Registration
- [ ] Navigate to `/#/register`
- [ ] Fill in all required fields
- [ ] Submit form
- [ ] Check: Redirected to dashboard
- [ ] Check: `localStorage.merchant_token` exists
- [ ] Check: Token is NOT "mock_jwt_token_..."
- [ ] Check: Toast notification shows success

### Login
- [ ] Navigate to `/#/login`
- [ ] Enter registered credentials
- [ ] Submit form
- [ ] Check: Redirected to dashboard
- [ ] Check: `localStorage.merchant_token` updated
- [ ] Check: Toast notification shows success

### Login Error Handling
- [ ] Try login with wrong password
- [ ] Check: Error message displayed
- [ ] Check: No redirect occurs
- [ ] Check: Form remains on screen

---

## 📊 Dashboard Tests

### Initial Load
- [ ] Dashboard loads without errors
- [ ] Metrics cards display (even if 0)
- [ ] "Recent Payments" section visible
- [ ] If no payments: Shows "No payments yet" message
- [ ] Loading state shows briefly

### After Creating Payments
- [ ] Total Volume shows sum of all payments
- [ ] Payments Today shows count
- [ ] Success Rate calculates correctly
- [ ] Recent payments table populates
- [ ] Payment statuses display correctly (paid/created/expired)

### Real-Time Updates
- [ ] Create a payment
- [ ] Wait for Stellar transaction
- [ ] Check: Dashboard updates payment status
- [ ] Check: Metrics recalculate

---

## 💳 Payment Creation Tests

### Basic Payment Creation
- [ ] Navigate to `/#/dashboard/create`
- [ ] Enter amount: `50.00`
- [ ] Enter order ID: `TEST-001`
- [ ] Keep default URLs
- [ ] Submit form
- [ ] Check: Success message appears
- [ ] Check: Payment details screen shows
- [ ] Check: Session ID is NOT `pay_` + random (should be `sess_...`)
- [ ] Check: Checkout URL points to backend
- [ ] Check: Amount displays correctly

### Checkout URL
- [ ] Copy checkout URL
- [ ] Open in new tab
- [ ] Check: Hosted checkout page loads
- [ ] Check: QR codes display
- [ ] Check: Payment amount correct

### Error Handling
- [ ] Try creating payment with empty amount
- [ ] Check: Validation prevents submission
- [ ] Try creating payment with backend down
- [ ] Check: Error message displays

---

## 📋 Payments List Tests

### Display
- [ ] Navigate to `/#/dashboard/payments`
- [ ] Check: All payments display
- [ ] Check: Session IDs are real (not mock data)
- [ ] Check: Order IDs display correctly
- [ ] Check: Tx hashes link to Stellar explorer
- [ ] Check: Created dates are real timestamps

### Search Functionality
- [ ] Type session ID in search box
- [ ] Check: Filters results in real-time
- [ ] Clear search
- [ ] Type partial tx hash
- [ ] Check: Filters correctly
- [ ] Type non-existent term
- [ ] Check: Shows "No payments match your search"

### Status Badges
- [ ] Check: Paid badges are green
- [ ] Check: Created badges are yellow/secondary
- [ ] Check: Expired badges are red

---

## ⚙️ Settings Tests

### Profile Loading
- [ ] Navigate to `/#/dashboard/settings`
- [ ] Check: Business name displays (from backend)
- [ ] Check: Email displays (from backend)
- [ ] Check: Stellar address loads if set
- [ ] Check: Webhook URL loads if set
- [ ] Check: Loading state shows briefly

### Profile Updates
- [ ] Enter new Stellar address
- [ ] Enter webhook URL
- [ ] Click "Save Changes"
- [ ] Check: Success toast appears
- [ ] Refresh page
- [ ] Check: Changes persisted

### API Keys Display
- [ ] Check: Merchant ID displays (UUID format)
- [ ] Check: API Key displays (partially masked)
- [ ] Click eye icon
- [ ] Check: API Key reveals/hides
- [ ] Click copy button on Merchant ID
- [ ] Check: "Copied to clipboard" toast
- [ ] Click copy button on API Key
- [ ] Check: "Copied to clipboard" toast

### Read-Only Fields
- [ ] Try to edit Business Name
- [ ] Check: Field is disabled
- [ ] Try to edit Email
- [ ] Check: Field is disabled

---

## 🔄 Real-Time Features

### Payment Status Polling
- [ ] Create a payment session
- [ ] Open browser DevTools → Network tab
- [ ] Filter by `/api/sessions/`
- [ ] Check: Request every ~3 seconds
- [ ] Complete payment via checkout
- [ ] Check: Polling stops after status = "paid"

### Dashboard Auto-Refresh
- [ ] Keep dashboard open
- [ ] Create payment in another tab
- [ ] Return to dashboard
- [ ] Refresh page
- [ ] Check: New payment appears
- [ ] Check: Metrics update

---

## 🚨 Error Handling Tests

### Network Errors
- [ ] Stop backend server
- [ ] Try to login
- [ ] Check: Error message displays
- [ ] Try to create payment
- [ ] Check: Error message displays
- [ ] Start backend
- [ ] Retry operations
- [ ] Check: Works correctly

### Token Expiration
- [ ] Set expired token in localStorage
- [ ] Refresh dashboard
- [ ] Check: Redirects to login
- [ ] Check: Token cleared from localStorage

### CORS Errors
- [ ] Check browser console for CORS errors
- [ ] If errors: Update backend `CORS_ORIGINS`
- [ ] Restart backend
- [ ] Retry

---

## 🌐 API Integration Verification

### Check Network Requests
Open DevTools → Network tab and verify:

**On Login:**
- [ ] POST to `/auth/login`
- [ ] Status: 200
- [ ] Response contains: `access_token`

**On Register:**
- [ ] POST to `/auth/register`
- [ ] Status: 200
- [ ] Response contains: `access_token`

**On Dashboard Load:**
- [ ] GET to `/merchant/payments?limit=10`
- [ ] Status: 200
- [ ] Response contains array of payments

**On Payment Create:**
- [ ] POST to `/api/sessions/create`
- [ ] Status: 200
- [ ] Response contains: `session_id`, `checkout_url`

**On Settings Load:**
- [ ] GET to `/merchant/profile`
- [ ] Status: 200
- [ ] Response contains merchant data

**On Settings Save:**
- [ ] PUT to `/merchant/profile`
- [ ] Status: 200
- [ ] Response contains updated profile

---

## 📱 Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

---

## 🔒 Security Checks

### Token Storage
- [ ] Open DevTools → Application → Local Storage
- [ ] Check: `merchant_token` is a JWT (starts with eyJ...)
- [ ] Check: Token is NOT visible in URL
- [ ] Logout
- [ ] Check: Token removed from localStorage

### API Key Security
- [ ] Check: API key not exposed in console logs
- [ ] Check: API key masked in UI by default
- [ ] Check: API key only visible when clicking eye icon

---

## 📊 Data Validation

### Payment Amounts
- [ ] Create payment with amount: `100.50`
- [ ] Check: Displays as exactly `$100.50 USDC`
- [ ] Check: No rounding errors in dashboard

### Timestamps
- [ ] Check payment timestamps
- [ ] Verify they're in local timezone
- [ ] Verify format is readable

### Status Transitions
- [ ] Create payment → Status: "created"
- [ ] Pay with Stellar → Status: "paid"
- [ ] Wait 30+ minutes → Status: "expired"

---

## ✨ Final Verification

### Complete User Flow
1. [ ] Register new merchant account
2. [ ] Login with credentials
3. [ ] View empty dashboard
4. [ ] Create first payment
5. [ ] Copy checkout URL
6. [ ] Open checkout in new tab
7. [ ] Scan QR code (or note Stellar address)
8. [ ] Make payment via Stellar wallet
9. [ ] Wait for confirmation (5-10 seconds)
10. [ ] Return to dashboard
11. [ ] Refresh page
12. [ ] Check: Payment status = "paid"
13. [ ] Check: Metrics updated
14. [ ] Go to Payments list
15. [ ] Check: Payment appears with tx_hash
16. [ ] Click tx_hash link
17. [ ] Check: Opens Stellar explorer
18. [ ] Go to Settings
19. [ ] Update Stellar address
20. [ ] Save changes
21. [ ] Refresh
22. [ ] Check: Changes persisted
23. [ ] Logout
24. [ ] Check: Redirected to home
25. [ ] Login again
26. [ ] Check: All data still there

---

## 🎯 Success Criteria

All checks should be ✅ before considering integration complete.

If any checks fail:
1. Check browser console for errors
2. Check backend logs
3. Verify backend is running
4. Verify Stellar listener is running
5. Check CORS configuration
6. Verify .env variables are correct

---

## 📝 Notes Section

Use this space to note any issues found:

```
Issue 1:
- What: _______________
- Where: ______________
- Fix: ________________

Issue 2:
- What: _______________
- Where: ______________
- Fix: ________________
```

---

## 🎉 Completion

When all checks pass:
- [ ] All authentication flows work
- [ ] All dashboard features work
- [ ] All payment operations work
- [ ] All settings operations work
- [ ] No mock data visible anywhere
- [ ] All API calls successful
- [ ] Error handling works correctly

**Status:** ⬜ Not Started | ⬜ In Progress | ✅ Complete

---

**Last Updated:** _______________
**Tested By:** _______________
**Backend Version:** _______________
**Frontend Version:** _______________
