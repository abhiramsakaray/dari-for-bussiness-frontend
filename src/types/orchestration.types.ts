// ============================================================================
// ORCHESTRATION — GATEWAY ANALYTICS
// ============================================================================

export type GatewayHealthStatus = 'healthy' | 'degraded' | 'down';

export interface GatewayHealth {
  status: GatewayHealthStatus;
  is_available: boolean;
  uptime_percentage: number;
  avg_latency_ms: number;
  p95_latency_ms: number;
  error_rate: number;
  timeout_count: number;
  consecutive_failures: number;
  last_success_at: string | null;
  last_failure_at: string | null;
  last_checked_at: string | null;
}

export interface GatewayPerformance {
  gateway: string;
  transactions: number;
  successes: number;
  failures: number;
  success_rate: number;
  volume: string;
  fees: string;
  refunds: {
    count: number;
    volume: string;
  };
  chargebacks: {
    count: number;
    volume: string;
  };
  latency: {
    avg_ms: number;
    p95_ms: number;
  };
  timeouts: number;
  last_success_at: string | null;
  last_failure_at: string | null;
  health: GatewayHealth;
}

export interface GatewayOverviewResponse {
  gateways: GatewayPerformance[];
  generated_at: string;
}

export interface GatewayTrendPoint {
  window_start: string;
  window_end: string;
  transactions: number;
  success_rate: number;
  volume: string;
  fees: string;
  avg_latency_ms: number;
  p95_latency_ms: number;
  uptime_percentage: number;
}

export interface GatewayDetailResponse extends GatewayPerformance {
  trend: GatewayTrendPoint[];
}

// ============================================================================
// ORCHESTRATION — ANALYTICS
// ============================================================================

export interface OrchestrationAnalyticsResponse {
  window_days: number;
  routing_decisions: number;
  by_strategy: Record<string, number>;
  by_gateway: Record<string, number>;
  failovers: {
    failovers_triggered: number;
    failovers_recovered: number;
    recovered_revenue: string;
    all_gateways_failed: number;
  };
  generated_at: string;
}

// ============================================================================
// ORCHESTRATION — COST SAVINGS
// ============================================================================

export interface SavingsPeriod {
  saved_amount: string;
  transactions_count: number;
  currency: string;
}

export interface SavingsDetail {
  period_date: string;
  actual_fee_paid: string;
  best_possible_fee: string;
  worst_possible_fee: string;
  saved_amount: string;
  transactions_count: number;
  currency: string;
}

export interface SavingsResponse {
  today: SavingsPeriod;
  month: SavingsPeriod;
  year: SavingsPeriod;
  lifetime: SavingsPeriod;
  detail_30d: SavingsDetail[];
}

// ============================================================================
// ORCHESTRATION — RECOMMENDATIONS
// ============================================================================

export type RecommendationSeverity = 'info' | 'low' | 'medium' | 'high';
export type RecommendationStatus = 'active' | 'dismissed' | 'stale';

export interface Recommendation {
  id: string;
  rec_type: string;
  severity: RecommendationSeverity;
  message: string;
  action: string | null;
  data: Record<string, unknown> | null;
  status: RecommendationStatus;
  created_at: string;
}

export interface RecommendationsResponse {
  recommendations: Recommendation[];
}

// ============================================================================
// ORCHESTRATION — ROUTING RULES
// ============================================================================

export interface RoutingRule {
  id: string;
  priority: number;
  country: string | null;
  currency: string | null;
  payment_method: string | null;
  min_amount: string | null;
  max_amount: string | null;
  target_gateway: string;
  is_active: boolean;
  created_at: string;
}

export interface RoutingRulesResponse {
  rules: RoutingRule[];
}

export interface CreateRoutingRuleInput {
  priority: number;
  country?: string;
  currency?: string;
  payment_method?: string;
  min_amount?: string;
  max_amount?: string;
  target_gateway: string;
}

// ============================================================================
// ORCHESTRATION — ROUTING DECISIONS
// ============================================================================

export interface RoutingCandidate {
  gateway: string;
  score: number;
  success_rate: number;
  fee_pct: number;
  avg_latency_ms: number;
  uptime: number;
  available: boolean;
  health_status: GatewayHealthStatus;
}

export type RoutingStrategy = 'rule' | 'smart' | 'failover' | 'only_option';

export interface RoutingDecision {
  id: string;
  session_id: string | null;
  selected_gateway: string;
  final_gateway: string | null;
  failover_used: boolean;
  strategy: RoutingStrategy;
  score: number | null;
  reason: string[];
  candidates: RoutingCandidate[];
  amount: string | null;
  currency: string | null;
  country: string | null;
  payment_method: string | null;
  estimated_fee: string | null;
  estimated_success_rate: number | null;
  created_at: string;
}

export interface RoutingDecisionsResponse {
  decisions: RoutingDecision[];
}

export interface ScoreBreakdown {
  success: number;
  cost: number;
  uptime: number;
  latency: number;
  availability: number;
  risk_penalty: number;
}

export interface RiskInfo {
  risk_level: 'none' | 'medium' | 'high';
  penalty: number;
  reasons: string[];
}

export interface DecisionExplanation {
  headline: string;
  success_rate: string;
  fee: string;
  latency: string;
  uptime: string;
  score_breakdown: ScoreBreakdown;
  risk: RiskInfo;
}

export interface RoutingDecisionDetail extends RoutingDecision {
  explanation: DecisionExplanation;
}

// ============================================================================
// ORCHESTRATION — OPTIMIZATION INSIGHTS (Payment Optimization Center)
// ============================================================================

export interface RoutingEfficiencyScore {
  current_score: number;
  previous_score: number;
  trend_pct: number | null;
  trend_direction: 'up' | 'down' | 'flat';
  breakdown: {
    avg_success_rate: number;
    fee_efficiency_pct: number;
    uptime_pct: number;
    failover_recovery_rate: number;
  };
  routing_decisions: number;
  failovers: {
    triggered: number;
    recovered: number;
  };
  window_days: number;
}

export interface SavingsWindow {
  saved_amount: string;
  actual_fee_paid: string;
  worst_possible_fee: string;
  best_possible_fee: string;
  transactions: number;
  fee_reduction_pct: number;
}

export interface SavingsAnalysis {
  today: SavingsWindow;
  month: SavingsWindow;
  year: SavingsWindow;
  lifetime: SavingsWindow;
  annualized_savings: string;
  headline: string;
}

export interface GatewayComparisonItem {
  gateway: string;
  success_rate: number;
  avg_latency_ms: number;
  total_fees: string;
  processing_volume: string;
  total_transactions: number;
  health_status: string;
  is_available: boolean;
  uptime_24h: number;
  refund_rate: number;
}

export interface RoutingInsights {
  best_gateway: string | null;
  gateways: GatewayComparisonItem[];
  routing_distribution_pct: Record<string, number>;
  recommended_allocation: Record<string, number>;
  window_days: number;
}

export interface OptimizationRecommendation {
  id: string;
  type: string;
  severity: 'info' | 'low' | 'medium' | 'high';
  message: string;
  action: string | null;
  data: Record<string, unknown> | null;
  created_at: string;
}

export interface OptimizationInsightsResponse {
  efficiency: RoutingEfficiencyScore;
  savings: SavingsAnalysis;
  routing: RoutingInsights;
  recommendations: OptimizationRecommendation[];
  total_active_recommendations: number;
  generated_at: string;
}
