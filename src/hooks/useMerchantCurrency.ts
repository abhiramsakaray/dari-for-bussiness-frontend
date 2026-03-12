import { useEffect } from 'react';
import { useMerchantStore } from '../stores/merchant-store';
import { useWalletDashboard } from './useWallets';

/**
 * Returns the merchant's preferred currency and symbol.
 * Syncs from wallet dashboard data when available.
 */
export function useMerchantCurrency() {
  const currency = useMerchantStore((s) => s.currency);
  const currencySymbol = useMerchantStore((s) => s.currencySymbol);
  const setCurrency = useMerchantStore((s) => s.setCurrency);
  const { data: dashboard } = useWalletDashboard();

  useEffect(() => {
    if (dashboard?.local_currency && dashboard?.local_symbol) {
      if (dashboard.local_currency !== currency) {
        setCurrency(dashboard.local_currency, dashboard.local_symbol);
      }
    }
  }, [dashboard?.local_currency, dashboard?.local_symbol]);

  return { currency, currencySymbol };
}
