"use client";

import { useEffect, useState } from "react";

interface EarnedBadge {
  type: string;
  label: string;
  description: string;
  earnedAt: string;
}

/**
 * Los badges son logros permanentes (ver lib/gamification/), no
 * dependen del selector de período del dashboard — por eso este
 * componente hace su propio fetch, independiente del período
 * seleccionado en `DashboardClient`.
 */
export function BadgesGrid() {
  const [badges, setBadges] = useState<EarnedBadge[] | null>(null);

  useEffect(() => {
    fetch("/api/badges")
      .then((res) => (res.ok ? res.json() : { badges: [] }))
      .then((data) => setBadges(data.badges))
      .catch(() => setBadges([]));
  }, []);

  if (badges === null) return null;

  if (badges.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Todavía no ganaste ningún badge. Se otorgan automáticamente al sincronizar.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {badges.map((badge) => (
        <div
          key={badge.type}
          className="rounded-xl border border-wrapped-border bg-wrapped-card px-4 py-3"
          title={badge.description}
        >
          <p className="font-display text-sm font-semibold text-wrapped-amber">{badge.label}</p>
          <p className="text-xs text-neutral-500">{badge.description}</p>
        </div>
      ))}
    </div>
  );
}
