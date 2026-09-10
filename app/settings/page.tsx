import { redirect } from "next/navigation";
import { auth, signIn, GITHUB_SCOPES_WITH_PRIVATE_REPOS } from "@/lib/auth";
import { getPrivateReposStatus } from "@/lib/settings/service";
import { PrivateReposToggle } from "@/components/settings/PrivateReposToggle";

/**
 * ⚠️ Fase 6 — el punto de mayor sensibilidad de privacidad del producto
 * (sección 42, Consideraciones): "cualquier ambigüedad en la UI sobre
 * qué se está compartiendo es inaceptable". El copy de esta página se
 * revisó explícitamente para ser inequívoco — decir qué se lee (nombres
 * de repos privados, sus commits, sus lenguajes) y qué NO se hace con
 * eso (nunca se comparte el contenido del código, solo metadata
 * agregada, y nunca se hace público sin un paso de consentimiento
 * aparte — ver Fase 4).
 */
export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const status = await getPrivateReposStatus(session.user.id);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-8 font-display text-2xl font-semibold text-white">Configuración</h1>

      <section className="rounded-xl border border-wrapped-border bg-wrapped-card p-6">
        <h2 className="font-display text-lg font-semibold text-white">
          Repositorios privados
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-400">
          Por defecto, GitHub Wrapped solo analiza tus repositorios públicos. Si activás esta
          opción, también vamos a leer los <strong>nombres, commits y lenguajes</strong> de tus
          repositorios privados para incluirlos en tus estadísticas.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-neutral-400">
          Nunca leemos ni almacenamos el <strong>contenido del código</strong> — solo metadata
          agregada (cuántos commits, en qué lenguaje, cuándo). Esa metadata nunca se hace pública
          automáticamente: compartir tu Wrapped sigue siendo una decisión aparte (ver{" "}
          <span className="text-neutral-300">Compartir</span> dentro de cada Wrapped). Podés
          desactivar esto en cualquier momento — al hacerlo, borramos los datos de repos privados
          ya sincronizados, no solo dejamos de traer nuevos.
        </p>

        <div className="mt-6">
          {!status.hasGrantedScope ? (
            <form
              action={async () => {
                "use server";
                await signIn(
                  "github",
                  { redirectTo: "/settings" },
                  { scope: GITHUB_SCOPES_WITH_PRIVATE_REPOS }
                );
              }}
            >
              <button
                type="submit"
                className="rounded-full bg-wrapped-accent px-5 py-2.5 text-sm font-medium text-black hover:opacity-90"
              >
                Conectar repos privados
              </button>
            </form>
          ) : (
            <PrivateReposToggle initialEnabled={status.enabled} enabledAt={status.enabledAt} />
          )}
        </div>
      </section>
    </main>
  );
}
