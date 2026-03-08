import { useState, useEffect } from 'react';
import { chainpeService, PaymentSession } from '../services/chainpe';

interface UsePaymentStatusOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

export const usePaymentStatus = (
  sessionId: string | null,
  options: UsePaymentStatusOptions = {}
) => {
  const [data, setData] = useState<PaymentSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { enabled = true, refetchInterval = 3000 } = options;

  useEffect(() => {
    if (!sessionId || !enabled) return;

    let intervalId: NodeJS.Timeout | null = null;
    let isMounted = true;

    const fetchStatus = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      try {
        const payment = await chainpeService.getSessionStatus(sessionId);
        if (isMounted) {
          setData(payment);
          setError(null);

          // Stop polling if payment is completed or expired
          if (payment.status === 'paid' || payment.status === 'expired') {
            if (intervalId) {
              clearInterval(intervalId);
            }
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.response?.data?.detail || 'Failed to fetch payment status');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Initial fetch
    fetchStatus();

    // Set up polling
    if (refetchInterval > 0) {
      intervalId = setInterval(fetchStatus, refetchInterval);
    }

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [sessionId, enabled, refetchInterval]);

  return {
    data,
    isLoading,
    error,
  };
};
