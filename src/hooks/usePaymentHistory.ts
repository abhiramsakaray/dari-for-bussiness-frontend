import { useState, useEffect } from 'react';
import { chainpeService, PaymentHistoryParams, PaymentSession, PaymentStats } from '../services/chainpe';

export const usePaymentHistory = (params: PaymentHistoryParams = {}) => {
  const [payments, setPayments] = useState<PaymentSession[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await chainpeService.getPaymentHistory(params);
      setPayments(response.payments);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch payment history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    payments,
    total,
    isLoading,
    error,
    refetch: fetchPayments,
  };
};

export const usePaymentStats = () => {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await chainpeService.getPaymentStats();
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch payment stats');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, isLoading, error, refetch: fetchStats };
};
