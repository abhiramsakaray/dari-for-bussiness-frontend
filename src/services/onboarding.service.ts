import api from './api';

export interface BusinessDetailsInput {
  business_name: string;
  business_email?: string;
  country: string;
  merchant_category: string;
}

export interface CompleteOnboardingInput {
  chains: string[];
  tokens: string[];
  auto_generate: boolean;
}

export interface OnboardingStatus {
  step: number;
  onboarding_completed: boolean;
  merchant_id: string;
  name: string;
  email: string;
  merchant_category?: string;
  business_name?: string;
  business_email?: string;
  country?: string;
  has_wallets: boolean;
  wallet_count: number;
}

export interface WalletInfo {
  chain: string;
  wallet_address: string;
  is_active: boolean;
}

export interface CompleteOnboardingResponse {
  message: string;
  merchant_id: string;
  api_key: string;
  onboarding_completed: boolean;
  wallets: WalletInfo[];
}

export const onboardingService = {
  // Submit business details (Step 2)
  submitBusinessDetails: async (input: BusinessDetailsInput) => {
    const response = await api.post<{ message: string; step: number; next_step: string }>(
      '/onboarding/business-details',
      input
    );
    return response.data;
  },

  // Complete onboarding (Step 3)
  completeOnboarding: async (input: CompleteOnboardingInput) => {
    const response = await api.post<CompleteOnboardingResponse>(
      '/onboarding/complete',
      input
    );
    return response.data;
  },

  // Check onboarding status
  getStatus: async () => {
    const response = await api.get<OnboardingStatus>('/onboarding/status');
    return response.data;
  },
};
