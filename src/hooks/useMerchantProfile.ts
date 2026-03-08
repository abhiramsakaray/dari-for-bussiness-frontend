import { useState, useEffect } from 'react';
import { chainpeService, MerchantProfile } from '../services/chainpe';

export const useMerchantProfile = () => {
  const [profile, setProfile] = useState<MerchantProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await chainpeService.getMerchantProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch merchant profile');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<MerchantProfile>) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await chainpeService.updateMerchantProfile(updates);
      setProfile(data);
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to update merchant profile';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we have a token
    const token = localStorage.getItem('merchant_token');
    if (token && !token.startsWith('mock_')) {
      fetchProfile();
    }
  }, []);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
};
