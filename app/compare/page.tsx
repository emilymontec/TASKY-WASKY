import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listComparisonsForUser } from "@/lib/comparisons/service";
import { InviteForm } from "@/components/comparisons/InviteForm";
import { ComparisonRow } from "@/components/comparisons/ComparisonRow";

/**
 * Server Component — la protección de ruta vive aquí (mismo motivo que
 * app/dashboard/page.tsx: sin middleware.ts, ver esa nota para el
 * porqué).
 */
export default async function ComparePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const comparisons = await listComparisonsForUser(session.user.id);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-2 font-display text-2xl font-semibold text-white">Comparaciones</h1>
      <p className="mb-8 text-sm text-neutral-400">
        Invita a otro usuario a comparar su actividad con la tuya. Nunca es automático — la otra
        persona tiene que aceptar, y cualquiera de los dos puede revocarlo después.
      </p>

      <div className="mb-8">
        <InviteForm />
      </div>

      {comparisons.length === 0 ? (
        <p className="text-sm text-neutral-500">Todavía no tenés ninguna comparación.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {comparisons.map((c) => (
            <ComparisonRow key={c.id} comparison={c} />
          ))}
        </div>
      )}
    </main>
  );
}
