"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ComparisonSummary } from "@/lib/comparisons/service";

const STATUS_LABELS: Record<ComparisonSummary["status"], string> = {
  PENDING: "Pendiente",
  ACCEPTED: "Aceptada",
  DECLINED: "Rechazada"
};

export function ComparisonRow({ comparison }: { comparison: ComparisonSummary }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function respond(action: "accept" | "revoke") {
    setSubmitting(true);
    await fetch(`/api/comparisons/${comparison.id}`, {
      method: "PATCH",
      body: JSON.stringify({ action })
    });
    setSubmitting(false);
    router.refresh();
  }

  const canAccept = comparison.status === "PENDING" && comparison.direction === "received";
  const canRevoke = comparison.status !== "DECLINED";

  return (
    <div className="flex items-center justify-between rounded-xl border border-wrapped-border bg-wrapped-card p-4">
      <div>
        <p className="text-sm text-neutral-200">
          {comparison.direction === "sent" ? "Invitaste a " : "Te invitó "}
          <span className="font-medium text-white">{comparison.otherUsername}</span>
        </p>
        <p className="text-xs text-neutral-500">{STATUS_LABELS[comparison.status]}</p>
      </div>

      <div className="flex items-center gap-2">
        {comparison.status === "ACCEPTED" && (
          <Link
            href={`/compare/${comparison.id}`}
            className="rounded-full bg-wrapped-accent px-3 py-1.5 text-xs font-medium text-black hover:opacity-90"
          >
            Ver comparación
          </Link>
        )}
        {canAccept && (
          <button
            type="button"
            onClick={() => respond("accept")}
            disabled={submitting}
            className="rounded-full bg-wrapped-accent px-3 py-1.5 text-xs font-medium text-black hover:opacity-90 disabled:opacity-50"
          >
            Aceptar
          </button>
        )}
        {canRevoke && (
          <button
            type="button"
            onClick={() => respond("revoke")}
            disabled={submitting}
            className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/20 disabled:opacity-50"
          >
            {comparison.status === "PENDING" ? "Cancelar" : "Revocar"}
          </button>
        )}
      </div>
    </div>
  );
}
