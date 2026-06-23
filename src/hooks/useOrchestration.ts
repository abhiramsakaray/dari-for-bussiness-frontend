import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orchestrationService } from '@/services/orchestration.service';
import { CreateRoutingRuleInput } from '@/types/orchestration.types';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';

export const ORCHESTRATION_KEY = 'orchestration';

// ── Gateway Analytics ────────────────────────────────────────────────

export function useGatewayOverview() {
  return useQuery({
    queryKey: [ORCHESTRATION_KEY, 'gateways'],
    queryFn: () => orchestrationService.getGatewayOverview(),
    staleTime: 60 * 1000, // 1 minute — matches health check interval
  });
}

export function useGatewayDetail(gateway: string, days = 30) {
  return useQuery({
    queryKey: [ORCHESTRATION_KEY, 'gateways', gateway, days],
    queryFn: () => orchestrationService.getGatewayDetail(gateway, days),
    enabled: !!gateway,
    staleTime: 60 * 1000,
  });
}

// ── Orchestration Analytics ──────────────────────────────────────────

export function useOrchestrationAnalytics(days = 30) {
  return useQuery({
    queryKey: [ORCHESTRATION_KEY, 'analytics', days],
    queryFn: () => orchestrationService.getOrchestrationAnalytics(days),
    staleTime: 5 * 60 * 1000,
  });
}

// ── Cost Savings ─────────────────────────────────────────────────────

export function useSavings() {
  return useQuery({
    queryKey: [ORCHESTRATION_KEY, 'savings'],
    queryFn: () => orchestrationService.getSavings(),
    staleTime: 5 * 60 * 1000,
  });
}

// ── Recommendations ──────────────────────────────────────────────────

export function useRecommendations(includeStale = false) {
  return useQuery({
    queryKey: [ORCHESTRATION_KEY, 'recommendations', includeStale],
    queryFn: () => orchestrationService.getRecommendations(includeStale),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRefreshRecommendations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => orchestrationService.refreshRecommendations(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ORCHESTRATION_KEY, 'recommendations'] });
      toast.success('Recommendations refreshed');
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, 'Failed to refresh recommendations'));
    },
  });
}

export function useDismissRecommendation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (recId: string) => orchestrationService.dismissRecommendation(recId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ORCHESTRATION_KEY, 'recommendations'] });
      toast.success('Recommendation dismissed');
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, 'Failed to dismiss recommendation'));
    },
  });
}

// ── Routing Rules ────────────────────────────────────────────────────

export function useRoutingRules() {
  return useQuery({
    queryKey: [ORCHESTRATION_KEY, 'routing-rules'],
    queryFn: () => orchestrationService.getRoutingRules(),
    staleTime: 30 * 1000,
  });
}

export function useCreateRoutingRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRoutingRuleInput) => orchestrationService.createRoutingRule(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ORCHESTRATION_KEY, 'routing-rules'] });
      toast.success('Routing rule created');
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, 'Failed to create routing rule'));
    },
  });
}

export function useDeleteRoutingRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ruleId: string) => orchestrationService.deleteRoutingRule(ruleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ORCHESTRATION_KEY, 'routing-rules'] });
      toast.success('Routing rule deactivated');
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, 'Failed to deactivate routing rule'));
    },
  });
}

// ── Routing Decisions ────────────────────────────────────────────────

export function useRoutingDecisions(limit = 50) {
  return useQuery({
    queryKey: [ORCHESTRATION_KEY, 'decisions', limit],
    queryFn: () => orchestrationService.getDecisions(limit),
    staleTime: 30 * 1000,
  });
}

export function useRoutingDecisionDetail(decisionId: string) {
  return useQuery({
    queryKey: [ORCHESTRATION_KEY, 'decisions', decisionId],
    queryFn: () => orchestrationService.getDecisionDetail(decisionId),
    enabled: !!decisionId,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Optimization Insights ────────────────────────────────────────────

export function useOptimizationInsights(days = 30) {
  return useQuery({
    queryKey: [ORCHESTRATION_KEY, 'optimization', days],
    queryFn: () => orchestrationService.getOptimizationInsights(days),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
