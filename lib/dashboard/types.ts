import type { AnalyticsResult } from "@/lib/analytics/engine";
import type { DeveloperActivityScore } from "@/lib/analytics/score";
import type { PersistedInsight } from "@/lib/insights/types";

export interface DashboardData {
  analytics: AnalyticsResult;
  score: DeveloperActivityScore;
  insights: PersistedInsight[];
}
