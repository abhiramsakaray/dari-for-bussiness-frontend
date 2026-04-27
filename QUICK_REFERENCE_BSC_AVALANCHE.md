# Quick Reference: BSC & Avalanche Support

## TL;DR

✅ BSC and Avalanche are now fully supported across the Dari platform.
✅ All frontend chain lists have been updated.
✅ Merchants now have 7 wallets (was 5).
✅ No breaking changes - fully backward compatible.

---

## Chain Information

| Chain | Name | Icon | Tokens | Decimals | Explorer |
|-------|------|------|--------|----------|----------|
| `bsc` | BNB Smart Chain | 🔶 | USDC, USDT, BNB | **18** (USDC/USDT) | bscscan.com |
| `avalanche` | Avalanche | 🔺 | USDC, USDT, AVAX | 6 | snowtrace.io |

---

## Updated Files

1. ✅ `src/services/wallets.service.ts` - Chain metadata and explorers
2. ✅ `src/app/components/onboarding/WalletSetup.tsx` - Onboarding flow
3. ✅ `src/app/components/payment-links/CreatePaymentLinkForm.tsx` - Payment links
4. ✅ `src/app/components/invoices/CreateInvoiceForm.tsx` - Invoices
5. ✅ `src/app/components/Wallets.tsx` - Already dynamic (no changes needed)
6. ✅ `src/app/components/subscriptions/SubscriptionsDashboard.tsx` - Already includes both

---

## Code Snippets

### Import Chain Info
```typescript
import { CHAIN_INFO, type ChainType } from '@/services/wallets.service';

// Get chain metadata
const bscInfo = CHAIN_INFO['bsc'];
// { name: 'BNB Smart Chain', color: 'yellow', icon: '🔶', tokens: ['USDC', 'USDT', 'BNB'] }
```

### Chain List for Forms
```typescript
const AVAILABLE_CHAINS = [
  'stellar', 
  'ethereum', 
  'polygon', 
  'base', 
  'bsc',        // ← Added
  'avalanche',  // ← Added
  'tron'
];
```

### Get Explorer URL
```typescript
import { getExplorerTxUrl } from '@/services/wallets.service';

const url = getExplorerTxUrl('bsc', '0x123...');
// Returns: https://bscscan.com/tx/0x123... (mainnet)
// or https://testnet.bscscan.com/tx/0x123... (testnet)
```

---

## Important: BSC Decimals

⚠️ **BSC uses 18 decimals for USDC and USDT** (not 6 like other chains)

**Current Status:**
- ✅ Backend handles all decimal conversions
- ✅ Frontend only displays pre-formatted amounts
- ✅ No frontend changes needed

**If you add Web3 functionality for BSC:**
```typescript
function getTokenDecimals(chain: string, token: string): number {
  if (chain === 'bsc' && (token === 'USDC' || token === 'USDT')) {
    return 18;  // ← BSC exception
  }
  return 6;  // ← Standard for all other chains
}
```

---

## Testing Commands

```bash
# Check for hardcoded chain lists
grep -r "stellar.*ethereum.*polygon" src/

# Check for hardcoded wallet counts
grep -r "wallets.length.*5" src/

# Check for decimal handling
grep -r "10\^6\|1000000\|toWei" src/
```

---

## API Examples

### Create Payment with BSC
```typescript
POST /payments/sessions
{
  "amount": 100,
  "currency": "USD",
  "accepted_chains": ["bsc", "avalanche"]
}
```

### Get Wallets (Returns 7)
```typescript
GET /merchant/wallets

Response:
{
  "wallets": [
    { "chain": "stellar", "wallet_address": "G..." },
    { "chain": "ethereum", "wallet_address": "0x..." },
    { "chain": "polygon", "wallet_address": "0x..." },
    { "chain": "base", "wallet_address": "0x..." },
    { "chain": "bsc", "wallet_address": "0x..." },      // ← New
    { "chain": "avalanche", "wallet_address": "0x..." }, // ← New
    { "chain": "tron", "wallet_address": "T..." }
  ]
}
```

---

## Common Issues

### Issue: BSC/Avalanche not showing in dropdown
**Solution:** Check if component uses hardcoded chain list. Update to include both chains.

### Issue: Wallet count still shows 5
**Solution:** Clear browser cache. Backend returns 7 wallets now.

### Issue: Explorer link broken for BSC/Avalanche
**Solution:** Verify `getExplorerTxUrl()` is being used (not hardcoded URLs).

---

## Checklist for New Features

When adding a new feature that involves chains:

- [ ] Use `CHAIN_INFO` from `wallets.service.ts` (don't hardcode)
- [ ] Include BSC and Avalanche in chain selectors
- [ ] Don't hardcode wallet count (use dynamic rendering)
- [ ] If handling decimals, use 18 for BSC USDC/USDT
- [ ] Test with both mainnet and testnet explorers

---

## Resources

- **BSC Docs:** https://docs.bnbchain.org/
- **Avalanche Docs:** https://docs.avax.network/
- **BSC Explorer:** https://bscscan.com
- **Avalanche Explorer:** https://snowtrace.io
- **Backend Integration Guide:** See `BACKEND_API_QUICK_REFERENCE.md`

---

**Quick Links:**
- Full Integration Doc: `BSC_AVALANCHE_INTEGRATION_COMPLETE.md`
- Backend Guide: Provided by backend team
- Chain Metadata: `src/services/wallets.service.ts`
