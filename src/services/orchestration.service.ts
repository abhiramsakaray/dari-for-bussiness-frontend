import { apiClient } from '@/lib/api-client';
import {
  GatewayOverviewResponse,
  GatewayDetailResponse,
  OrchestrationAnalyticsResponse,
  SavingsResponse,
  RecommendationsResponse,
  RoutingRulesResponse,
  CreateRoutingRuleInput,
  RoutingDecisionsResponse,
  RoutingDecisionDetail,
  OptimizationInsightsResponse,
} from '@/types/orchestration.types';

export class OrchestrationService {
  private analyticsPath = '/analytics';
  private orchestrationPath = '/orchestration';

  // ── Gateway Analytics ──────────────────────────────────────────────

  async getGatewayOverview(): Promise<GatewayOverviewResponse> {
    return apiClient.get<GatewayOverviewResponse>(`${this.analyticsPath}/gateways`);
  }

  async getGatewayDetail(gateway: string, days = 30): Promise<GatewayDetailResponse> {
    return apiClient.get<GatewayDetailResponse>(
      `${this.analyticsPath}/gateways/${gateway}`,
      { params: { days } }
    );
  }

  // ── Orchestration Analytics ────────────────────────────────────────

  async getOrchestrationAnalytics(days = 30): Promise<OrchestrationAnalyticsResponse> {
    return apiClient.get<OrchestrationAnalyticsResponse>(
      `${this.analyticsPath}/orchestration`,
      { params: { days } }
    );
  }

  // ── Cost Savings ───────────────────────────────────────────────────

  async getSavings(): Promise<SavingsResponse> {
    return apiClient.get<SavingsResponse>(`${this.analyticsPath}/savings`);
  }

  // ── Recommendations ────────────────────────────────────────────────

  async getRecommendations(includeStale = false): Promise<RecommendationsResponse> {
    return apiClient.get<RecommendationsResponse>(
      `${this.analyticsPath}/recommendations`,
      { params: { include_stale: includeStale } }
    );
  }

  async refreshRecommendations(): Promise<void> {
    return apiClient.post(`${this.analyticsPath}/recommendations/refresh`);
  }

  async dismissRecommendation(recId: string): Promise<void> {
    return apiClient.post(`${this.analyticsPath}/recommendations/${recId}/dismiss`);
  }

  // ── Routing Rules ──────────────────────────────────────────────────

  async getRoutingRules(): Promise<RoutingRulesResponse> {
    return apiClient.get<RoutingRulesResponse>(`${this.orchestrationPath}/routing-rules`);
  }

  async createRoutingRule(input: CreateRoutingRuleInput): Promise<{ id: string; status: string }> {
    return apiClient.post(`${this.orchestrationPath}/routing-rules`, input);
  }

  async deleteRoutingRule(ruleId: string): Promise<void> {
    return apiClient.delete(`${this.orchestrationPath}/routing-rules/${ruleId}`);
  }

  // ── Optimization Insights ──────────────────────────────────────────────

  async getOptimizationInsights(days = 30): Promise<OptimizationInsightsResponse> {
    return apiClient.get<OptimizationInsightsResponse>(
      `${this.analyticsPath}/optimization`,
      { params: { days } }
    );
  }

  // ── Routing Decisions ──────────────────────────────────────────────

  async getDecisions(limit = 50): Promise<RoutingDecisionsResponse> {
    return apiClient.get<RoutingDecisionsResponse>(
      `${this.orchestrationPath}/decisions`,
      { params: { limit } }
    );
  }

  async getDecisionDetail(decisionId: string): Promise<RoutingDecisionDetail> {
    return apiClient.get<RoutingDecisionDetail>(
      `${this.orchestrationPath}/decisions/${decisionId}`
    );
  }
}

export const orchestrationService = new OrchestrationService();
