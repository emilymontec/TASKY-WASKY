"use client";

import { useState } from "react";
import type { PeriodOption } from "@/lib/dashboard/period";
import type { DashboardData } from "@/lib/dashboard/types";
import type { AnalyticsWithScore } from "@/lib/analytics/service";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityHeatmap } from "@/components/dashboard/ActivityHeatmap";
import { LanguageChart } from "@/components/dashboard/LanguageChart";
import { CommitTrend } from "@/components/dashboard/CommitTrend";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { InsightsGrid } from "@/components/dashboard/InsightsGrid";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Skeleton } from "@/components/dashboard/Skeleton";
import { ScoreCard } from "@/components/dashboard/ScoreCard";
import { BadgesGrid } from "@/components/dashboard/BadgesGrid";

interface DashboardClientProps {
  initialPeriod: PeriodOption;
  initialData: DashboardData;
}

/**
 * Cambiar de período solo vuelve a pedir analytics (+ score, que viaja
 * junto desde la Fase 5) — los insights y los badges no dependen del
 * selector de gráficos (insights son del período canónico "rolling12",
 * badges son logros permanentes). Esto evita fetches redundantes y evita
 * que esas secciones "parpadeen" al cambiar de período.
 */
export function DashboardClient({ initialPeriod, initialData }: DashboardClientProps) {
  const [period, setPeriod] = useState<PeriodOption>(initialPeriod);
  const [analytics, setAnalytics] = useState(initialData.analytics);
  const [score, setScore] = useState(initialData.score);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePeriodChange(next: PeriodOption) {
    if (next === period) return;
    setPeriod(next);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/analytics?period=${next}`);
      if (!res.ok) throw new Error("No se pudo cargar el período seleccionado.");
      const data: AnalyticsWithScore = await res.json();
      setAnalytics(data.analytics);
      setScore(data.score);
    } catch {
      setError("No se pudo cargar el período seleccionado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const hasActivity = analytics.commitStats.totalCommits > 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <PeriodSelector value={period} onChange={handlePeriodChange} disabled={loading} />
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      {!hasActivity ? (
        <EmptyState
          title="Sin actividad en este período"
          description="Prueba con un rango más amplio, o espera a que termine la sincronización si acabas de conectar tu cuenta."
        />
      ) : (
        <>
          <section className="grid grid-cols-2 gap-6 rounded-xl border border-wrapped-border bg-wrapped-card p-6 sm:grid-cols-4">
            <StatCard value={analytics.commitStats.totalCommits} label="Commits" accent />
            <StatCard value={analytics.repositoryStats.activeRepositories} label="Repos activos" />
            <StatCard value={analytics.languageStats.languageCount} label="Lenguajes" />
            <StatCard value={analytics.commitStats.activeDays} label="Días activos" />
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <StreakCard
              currentStreak={analytics.streaks.currentStreak}
              longestStreak={analytics.streaks.longestStreak}
            />
            <ScoreCard score={score} />
          </div>

          <section className="rounded-xl border border-wrapped-border bg-wrapped-card p-6">
            <h2 className="mb-4 font-display text-lg font-semibold">Actividad</h2>
            {loading ? (
              <Skeleton className="h-[120px] w-full" />
            ) : (
              <ActivityHeatmap dailyDistribution={analytics.temporal.dailyDistribution} />
            )}
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-wrapped-border bg-wrapped-card p-6">
              <h2 className="mb-4 font-display text-lg font-semibold">Tendencia semanal</h2>
              {loading ? (
                <Skeleton className="h-[160px] w-full" />
              ) : (
                <CommitTrend dailyDistribution={analytics.temporal.dailyDistribution} />
              )}
            </section>

            <section className="rounded-xl border border-wrapped-border bg-wrapped-card p-6">
              <h2 className="mb-4 font-display text-lg font-semibold">Lenguajes</h2>
              {loading ? (
                <Skeleton className="h-[180px] w-full" />
              ) : (
                <LanguageChart distribution={analytics.languageStats.distribution} />
              )}
            </section>
          </div>
        </>
      )}

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold">Badges</h2>
        <BadgesGrid />
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold">Insights de tu año</h2>
        <InsightsGrid insights={initialData.insights} />
      </section>
    </div>
  );
}
