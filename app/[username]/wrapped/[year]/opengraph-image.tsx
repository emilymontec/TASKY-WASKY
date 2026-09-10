import { ImageResponse } from "next/og";
import { getPublicWrappedSummary } from "@/lib/wrapped/service";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "GitHub Wrapped";

/**
 * Convención de archivo de Next.js (App Router): con este archivo
 * presente, Next.js genera e inyecta automáticamente las etiquetas
 * `<meta property="og:image">` / `twitter:image` de la ruta hermana
 * `page.tsx` — no hace falta escribir esas etiquetas a mano (sección
 * Fase 4, Trabajo técnico: "Open Graph / Twitter Card dinámicos
 * generados por request").
 *
 * ⚠️ Deliberadamente NO usa `getPublicWrappedPageData` (que recomputa el
 * Analytics Engine completo) — los crawlers de redes sociales golpean
 * esta ruta, no personas, así que se usa `getPublicWrappedSummary`, que
 * solo lee los campos ya denormalizados en `WrappedReport`. Si el
 * reporte no existe o es privado, se genera una imagen genérica en vez
 * de fallar — un crawler que recibe un 404 en la imagen a veces cachea
 * el fallo para el link entero.
 */
export default async function OpengraphImage({
  params
}: {
  params: { username: string; year: string };
}) {
  const summary = await getPublicWrappedSummary(params.username, Number(params.year));

  return new ImageResponse(
    (
      <div
        style={{
          width: size.width,
          height: size.height,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: "linear-gradient(160deg, #0d1117 0%, #0f2942 100%)",
          fontFamily: "sans-serif",
          textAlign: "center"
        }}
      >
        <div style={{ display: "flex", fontSize: 26, color: "#8b949e", marginBottom: 16 }}>
          GitHub Wrapped {params.year}
        </div>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 700, color: "#58a6ff" }}>
          {summary ? `@${summary.username}` : "Wrapped"}
        </div>
        {summary && (
          <div style={{ display: "flex", fontSize: 30, color: "#c9d1d9", marginTop: 20 }}>
            {summary.totalCommits.toLocaleString("es")} commits
            {summary.topLanguage ? ` · ${summary.topLanguage}` : ""}
          </div>
        )}
      </div>
    ),
    size
  );
}
