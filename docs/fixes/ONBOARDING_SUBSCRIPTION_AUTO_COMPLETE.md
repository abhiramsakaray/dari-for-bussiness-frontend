# Onboarding Subscription Auto-Complete Fix

## Problem
When a merchant subscribed to a paid plan (Growth/Business) during onboarding via Web3 subscription:
1. ✅ Subscription was created successfully
2. ✅ Payment was confirmed (e.g., 29 USDC)
3. ✅ Subscription status → ACTIVE
4. ❌ Merchant remained stuck in onboarding
5. ❌ Merchant tier was not upgraded from Free to Growth/Business
6. ❌ Dashboard showed "Free" plan even after payment

## Root Causes

### Issue 1: Missing Auto-Complete After Payment
The frontend was redirecting users back to the onboarding page with `payment_success=true` and `subscription_id` parameters, but it wasn't automatically calling the `/onboarding/complete` endpoint.

### Issue 2: Login Flow Loses URL Parameters
When a merchant subscribes but isn't logged in:
1. Merchant subscribes → Redirected to `/#/onboarding?payment_success=true&subscription_id=xxx`
2. Merchant is not logged in at that point
3. Merchant logs in → Redirected to `/onboarding` (URL params lost!)
4. OnboardingFlow doesn't see the payment success params

### Issue 3: Backend Not Auto-Detecting Subscriptions
The backend's `/onboarding/status` endpoint should automatically detect and link existing Web3 subscriptions for the merchant's email, but this wasn't happening consistently.

## Solution
Updated `src/app/components/onboarding/OnboardingFlow.tsx` with multiple fallback mechanisms to ensure onboarding completes after subscription payment.

### Changes Made

#### 1. Auto-Complete on Payment Success (Primary Fix)
```typescript
if (paymentSuccess === 'true' && subscriptionId) {
  console.log('Payment successful, completing onboarding...');
  
  try {
    // Get wallet data if available
    const walletData = localStorage.getItem('onboarding_wallet_data');
    let chains = [], tokens = [], auto_generate = false;
    
    if (walletData) {
      const parsed = JSON.parse(walletData);
      chains = parsed.chains || [];
      tokens = parsed.tokens || [];
      auto_generate = parsed.auto_generate || false;
    }
    
    // Call the complete endpoint to upgrade merchant tier
    await onboardingService.completeOnboarding({
      chains,
      tokens,
      auto_generate
    });
    
    // Update localStorage and redirect
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('onboarding_step', '4');
    navigate('/dashboard');
    return;
  } catch (error) {
    console.error('Failed to complete onboarding after payment:', error);
  }
}
```

#### 2. Check Backend Status (Secondary Fix)
```typescript
const status = await onboardingService.getStatus();

// The backend's /onboarding/status should automatically link Web3 subscriptions
console.log('Onboarding status:', status);

if (status.onboarding_completed) {
  console.log('Onboarding already completed, redirecting to dashboard');
  navigate('/dashboard');
  return;
}
```

#### 3. Auto-Complete at Final Step (Fallback Fix)
```typescript
// If we're at step 3+ but onboarding isn't complete, try to complete it
if (status.step >= 3) {
  console.log('At final step but onboarding not complete, attempting to complete...');
  try {
    await onboardingService.completeOnboarding({
      chains: [],
      tokens: [],
      auto_generate: false
    });
    
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/dashboard');
    return;
  } catch (error) {
    console.error('Failed to auto-complete onboarding:', error);
    setStep('plan_selection');
  }
}
```

#### 4. Added Debug Logging
```typescript
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  console.log('OnboardingFlow mounted with params:', {
    payment_success: urlParams.get('payment_success'),
    subscription_id: urlParams.get('subscription_id'),
    status: urlParams.get('status')
  });
  
  checkOnboardingStatus();
}, []);
```

## Flow After Fix

### Scenario A: User Stays Logged In
1. Merchant selects Growth/Business plan during onboarding
2. Redirected to Web3 subscription payment page
3. Merchant completes payment (e.g., 29 USDC)
4. Redirected back to: `/#/onboarding?payment_success=true&subscription_id=xxx`
5. **OnboardingFlow detects payment success** ✅
6. **Automatically calls `/onboarding/complete`** ✅
7. **Backend upgrades merchant tier and links subscription** ✅
8. **Merchant redirected to dashboard** ✅

### Scenario B: User Logs In After Payment
1. Merchant subscribes but session expires
2. Merchant logs in again
3. Redirected to `/onboarding` (without URL params)
4. **OnboardingFlow calls `/onboarding/status`** ✅
5. **Backend detects existing subscription and returns `onboarding_completed: true`** ✅
6. **Merchant redirected to dashboard** ✅

### Scenario C: Stuck at Final Step
1. Merchant is at step 3+ but onboarding not complete
2. **OnboardingFlow attempts auto-complete** ✅
3. **Calls `/onboarding/complete` to trigger backend check** ✅
4. **Backend links subscription and upgrades tier** ✅
5. **Merchant redirected to dashboard** ✅

## Testing

To test this fix:

1. **Test Scenario A:**
   - Create a new merchant account
   - Go through onboarding steps (business details, wallet setup)
   - Select Growth or Business plan
   - Complete Web3 subscription payment
   - Verify you're automatically redirected to dashboard
   - Verify your tier is upgraded in the dashboard

2. **Test Scenario B:**
   - Create a new merchant account
   - Subscribe to Growth plan via Web3
   - Log out and log back in
   - Verify you're redirected to dashboard (not stuck in onboarding)
   - Verify your tier shows as Growth

3. **Test Scenario C:**
   - For existing stuck merchants (like sakarayabhiram@gmail.com)
   - Have them log in
   - They should be automatically redirected to dashboard
   - Their tier should be upgraded

## Backend Requirements

The backend `/onboarding/complete` endpoint must:
- Check for existing Web3 subscriptions for the merchant's email
- Upgrade the merchant's tier based on the subscription plan
- Mark onboarding as completed
- Return success response

The backend `/onboarding/status` endpoint should:
- Check for existing Web3 subscriptions
- Automatically link them to the merchant account
- Return `onboarding_completed: true` if subscription exists

## For Stuck Merchants

If a merchant is currently stuck (showing Free plan despite paying):

1. **Quick Fix:** Have them visit `/onboarding` - the auto-complete logic will trigger
2. **Manual Fix:** Call `/onboarding/complete` endpoint directly
3. **Backend Fix:** Run a script to link existing Web3 subscriptions to merchant accounts

## Related Files
- `src/app/components/onboarding/OnboardingFlow.tsx` - Main fix
- `src/app/components/onboarding/PlanSelection.tsx` - Handles payment redirect
- `src/services/onboarding.service.ts` - API service
- `src/app/components/Billing.tsx` - Displays current plan
- `src/hooks/useBilling.ts` - Fetches billing info
- `src/services/billing.service.ts` - Billing API service
