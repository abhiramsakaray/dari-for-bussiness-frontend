import { useState } from 'react';
import { chainpeService, PaymentSessionData, PaymentSession } from '../services/chainpe';

export const useChainPe = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = async (paymentData: PaymentSessionData): Promise<PaymentSession | null> => {
    setLoading(true);
    setError(null);

    try {
      const session = await chainpeService.createSession(paymentData);
      return session;
    } catch (err: any) {
      // Handle validation errors (422) or general errors
      let errorMessage = 'Failed to create payment';
      
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        // If detail is an array (validation errors), format them
        if (Array.isArray(detail)) {
          errorMessage = detail.map((e: any) => 
            `${e.loc?.join('.') || 'Field'}: ${e.msg}`
          ).join(', ');
        } else if (typeof detail === 'string') {
          errorMessage = detail;
        }
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createPayment,
    loading,
    error,
  };
};
