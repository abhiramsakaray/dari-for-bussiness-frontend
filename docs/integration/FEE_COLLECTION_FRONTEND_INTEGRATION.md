# Fee Collection - Frontend Integration Complete

## Overview
The fee collection system frontend is fully integrated with admin dashboard components for monitoring and managing platform transaction fees.

## Components Created

### 1. Services
- **`fee-collection.service.ts`** - API service for all fee collection endpoints
  - `getPlatformWallets()` - Get platform wallet addresses
  - `getFeeStats(days)` - Get fee statistics for period
  - `getMerchantFeeReport(merchantId, startDate, endDate)` - Get detailed merchant report
  - `collectFees(merchantId, date)` - Manually collect fees for merchant
  - `collectAllFees(date)` - Collect fees for all merchants
  - Helper functions for date formatting and ranges

### 2. Hooks
- **`useFeeCollection.ts`** - React Query hooks
  - `usePlatformWallets()` - Fetch platform wallets
  - `useFeeStats(days)` - Fetch fee statistics
  - `useMerchantFeeReport(merchantId, startDate, endDate)` - Fetch merchant report
  - `useCollectFees()` - Mutation for manual fee collection
  - `useCollectAllFees()` - Mutation for collecting all fees

### 3. Admin Components
- **`FeeCollectionDashboard.tsx`** - Main dashboard showing:
  - Total volume and fees collected
  - Platform wallet addresses
  - Fee statistics by chain/token
  - Manual "Collect All Fees" button
  - Period selector (7/30/90 days)

- **`MerchantFeeReport.tsx`** - Detailed merchant report:
  - Search by merchant ID and date range
  - Fee breakdown by chain/token
  - Transaction details table
  - CSV export functionality
  - Manual fee collection button

- **`AdminFees.tsx`** - Tabbed interface combining both components

### 4. Routes
- `/admin/fees` - Main admin fee collection page

## Features

### Dashboard Features
✅ **Summary Cards**
- Total volume processed
- Total fees collected
- Platform wallets configured

✅ **Platform Wallets Display**
- Shows all configured blockchain addresses
- Copy to clipboard functionality
- Chain badges for easy identification

✅ **Fee Statistics Table**
- Breakdown by chain and token
- Transaction counts
- Volume and fees per chain
- Totals row

✅ **Period Selection**
- Last 7 days
- Last 30 days
- Last 90 days

✅ **Manual Collection**
- "Collect All Fees" button
- Confirmation dialog
- Success/error notifications

### Merchant Report Features
✅ **Search & Filter**
- Merchant ID input
- Custom date range picker
- Search button

✅ **Merchant Summary**
- Merchant name and ID
- Fee percentage
- Total transactions
- Total fees collected

✅ **Fees by Chain Table**
- Chain and token breakdown
- Transaction counts
- Volume and fees

✅ **Transaction Details**
- Individual transaction list
- Payment IDs
- Amounts and fees
- Timestamps
- Scrollable table

✅ **Export & Actions**
- CSV export functionality
- Manual fee collection button
- Real-time data refresh

## API Endpoints Used

### GET /admin/fees/platform-wallets
Returns platform wallet addresses for all chains.

### GET /admin/fees/stats?days=30
Returns fee statistics for specified period.

### GET /admin/fees/report/{merchant_id}?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
Returns detailed fee report for specific merchant.

### POST /admin/fees/collect
Manually collect fees for a merchant.
```json
{
  "merchant_id": "abc-123",
  "date": "2026-04-30"
}
```

### POST /admin/fees/collect-all?date=YYYY-MM-DD
Collect fees for all merchants on specified date.

## Usage Examples

### Accessing Fee Collection Dashboard
1. Navigate to `/admin/fees`
2. View dashboard tab for overview
3. Switch to merchant report tab for detailed analysis

### Viewing Fee Statistics
```typescript
// Automatically loads on dashboard
const { data: stats } = useFeeStats(30); // Last 30 days

// Access data
stats.total_volume
stats.total_estimated_fees
stats.average_fee_percent
stats.stats_by_chain
```

### Searching Merchant Report
1. Enter merchant ID
2. Select date range
3. Click "Search"
4. View detailed breakdown
5. Export to CSV if needed

### Manual Fee Collection
```typescript
// Single merchant
const collectMutation = useCollectFees();
collectMutation.mutate({
  merchantId: 'abc-123',
  date: '2026-04-30'
});

// All merchants
const collectAllMutation = useCollectAllFees();
collectAllMutation.mutate('2026-04-30');
```

## Fee Rates by Plan

| Plan | Transaction Fee |
|------|----------------|
| Free | 1.5% |
| Growth | 0.8-1.0% |
| Business | 0.5-0.8% |
| Enterprise | 0.2-0.5% |

## Platform Wallets

Fees are collected to these relayer wallet addresses:

- **Stellar**: `GB4FPLPBVTODAWJPSPAQ5ETY767XYI5SA3PKS45UMTOXREL735UXVEMR`
- **Polygon/Ethereum**: `0x8C3a1296668f63A6d4A62432Ab7acD0301Deb708d6`
- **Tron**: `TCkLfcrzEiunAFPn9D5V58nYitm9rJxPK6`
- **Solana**: `J17ccLLQHSb1V3XkX95UXNE4gGnpkNtoe3UK3cEhgRFF`

## Error Handling

All components include proper error handling:

```typescript
// 401 Unauthorized - Redirect to login
if (response.status === 401) {
  window.location.href = '/login';
}

// 403 Forbidden - Not admin
if (response.status === 403) {
  alert('Admin access required');
}

// Other errors
catch (error) {
  console.error('Error:', error);
  // Show error to user
}
```

## Security

- All endpoints require admin authentication
- Bearer token sent in Authorization header
- Admin role verification on backend
- Sensitive operations require confirmation dialogs

## Daily Automated Collection

The system automatically:
1. Runs daily at 1 AM UTC
2. Calculates fees based on merchant plan
3. Transfers fees to platform wallets
4. Sends settlement email to merchants
5. Logs all transactions with blockchain hashes

## Merchant Settlement Email

Merchants receive daily emails showing:
- Total volume processed
- Transaction fees deducted
- Net settlement amount
- Breakdown by chain and token
- Transaction counts

## Testing Checklist

- [ ] Dashboard loads with correct data
- [ ] Period selector changes data
- [ ] Platform wallets display correctly
- [ ] Fee statistics table shows all chains
- [ ] Merchant search works
- [ ] Date range picker functions
- [ ] Transaction details load
- [ ] CSV export downloads
- [ ] Manual collection button works
- [ ] Collect all fees button works
- [ ] Error states display properly
- [ ] Loading states show
- [ ] Admin authentication required

## Next Steps

1. ✅ Frontend components created
2. ✅ API integration complete
3. ✅ Routes configured
4. ⏳ Add to admin navigation menu
5. ⏳ Test with real data
6. ⏳ Add role-based access control
7. ⏳ Implement audit logging

## Support

For issues or questions:
- Email: support@daripay.xyz
- Docs: https://docs.daripay.xyz
- Admin dashboard: `/admin/fees`
