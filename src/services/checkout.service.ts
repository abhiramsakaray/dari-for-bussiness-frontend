import { apiClient } from '@/lib/api-client';
import {
  PayerDataCollect,
  PayerDataResponse,
  TokenizeCheckoutResponse,
  ResolvedTokenData,
} from '@/types/api.types';

export class CheckoutService {
  private basePath = '/checkout';

  // Payer Data Collection (no auth required — public checkout page)
  async submitPayerData(
    sessionId: string,
    data: PayerDataCollect
  ): Promise<PayerDataResponse> {
    return apiClient.post<PayerDataResponse>(
      `${this.basePath}/${sessionId}/payer-data`,
      data
    );
  }

  // Payment Tokenization (no auth required)
  async tokenize(sessionId: string): Promise<TokenizeCheckoutResponse> {
    return apiClient.post<TokenizeCheckoutResponse>(
      `${this.basePath}/${sessionId}/tokenize`
    );
  }

  // Resolve Token (no auth required)
  async resolveToken(
    sessionId: string,
    token: string
  ): Promise<ResolvedTokenData> {
    return apiClient.get<ResolvedTokenData>(
      `${this.basePath}/${sessionId}/resolve-token`,
      { params: { token } }
    );
  }
}

export const checkoutService = new CheckoutService();
