import { apiClient } from '@/lib/api-client';

export type Web3Chain = 'polygon';
export type Web3Interval = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface MandateSigningDataRequest {
  subscriber: string;
  merchant_id: string;
  token_address: string;
  amount: string;
  interval: number;
  max_payments: number;
  chain: Web3Chain;
  chain_id: number;
}

export interface MandateSigningDataResponse {
  domain: Record<string, unknown>;
  types: Record<string, unknown>;
  primaryType: string;
  message: Record<string, unknown>;
  nonce: string;
  [key: string]: unknown;
}

export interface AuthorizeWeb3SubscriptionRequest {
  signature: string;
  subscriber_address: string;
  nonce: string;
  merchant_id?: string;
  plan_id?: string;
  token_address: string;
  token_symbol: string;
  amount?: number;
  interval: Web3Interval;
  chain: Web3Chain;
  chain_id: number;
  max_payments?: number;
  customer_email?: string;
  customer_name?: string;
}

export interface Web3Subscription {
  id: string;
  subscription_id?: string;
  next_payment_date?: string;
  chain?: string;
  token_symbol?: string;
  amount?: number;
  status?: string;
  [key: string]: unknown;
}

export class Web3SubscriptionsService {
  async getPlan(planId: string) {
    return apiClient.get<any>(`/subscriptions/plans/${planId}`);
  }

  async getMandateSigningData(payload: MandateSigningDataRequest) {
    return apiClient.post<MandateSigningDataResponse>('/web3-subscriptions/mandate/signing-data', payload);
  }

  async authorize(payload: AuthorizeWeb3SubscriptionRequest) {
    return apiClient.post<Web3Subscription>('/web3-subscriptions/authorize', payload);
  }

  async getUserSubscriptions(walletAddress: string) {
    return apiClient.get<Web3Subscription[]>(`/web3-subscriptions/user/${walletAddress}`);
  }

  async cancelUserSubscription(payload: { subscription_id: string; subscriber_address: string }) {
    return apiClient.post('/web3-subscriptions/user/cancel', payload);
  }
}

export const web3SubscriptionsService = new Web3SubscriptionsService();
