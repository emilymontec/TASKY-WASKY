import type { WrappedSlide } from "@/lib/wrapped/types";

export type ExportFormat = "story" | "post" | "twitter";

export const EXPORT_DIMENSIONS: Record<ExportFormat, { width: number; height: number }> = {
  story: { width: 1080, height: 1920 },
  post: { width: 1080, height: 1080 },
  twitter: { width: 1200, height: 675 }
};

const GRADIENTS: Record<WrappedSlide["kind"], string> = {
  opening: "linear-gradient(160deg, #0d1117 0%, #0f2942 100%)",
  volume: "linear-gradient(160deg, #0d1117 0%, #0c2a4d 100%)",
  rhythm: "linear-gradient(160deg, #1a1400 0%, #0d1117 100%)",
  languages: "linear-gradient(160deg, #1a0d29 0%, #0d1117 100%)",
  repos: "linear-gradient(160deg, #031f12 0%, #0d1117 100%)",
  streak: "linear-gradient(160deg, #241400 0%, #0d1117 100%)",
  closing: "linear-gradient(160deg, #0d1117 0%, #161b22 100%)"
};

const ACCENTS: Record<WrappedSlide["kind"], string> = {
  opening: "#58a6ff",
  volume: "#58a6ff",
  rhythm: "#e3b341",
  languages: "#e879f9",
  repos: "#34d399",
  streak: "#e3b341",
  closing: "#ffffff"
};

const DAY_LABELS_ES: Record<string, string> = {
  Monday: "lunes",
  Tuesday: "martes",
  Wednesday: "miércoles",
  Thursday: "jueves",
  Friday: "viernes",
  Saturday: "sábado",
  Sunday: "domingo"
};

interface ExportContent {
  title: string;
  big: string;
  sub: string | null;
}

/**
 * ⚠️ Distinto de los componentes de `components/wrapped/slides/`: esos
 * usan clases de Tailwind, que `ImageResponse` (Satori) no procesa —
 * necesita árboles de React con `style` inline. En vez de duplicar cada
 * slide con estilos completos, esta función deriva el contenido textual
 * de una versión simplificada "tarjeta para compartir" por tipo de
 * slide, reutilizando el mismo `data` ya calculado — nunca recalcula
 * nada, solo decide qué mostrar.
 */
export function buildExportContent(slide: WrappedSlide): ExportContent {
  switch (slide.kind) {
    case "opening":
      return {
        title: "GitHub Wrapped",
        big: String(slide.data.year),
        sub: `${slide.data.username} · ${slide.data.totalCommits.toLocaleString("es")} commits`
      };
    case "volume":
      return {
        title: "Este año escribiste",
        big: slide.data.totalCommits.toLocaleString("es"),
        sub: `commits en ${slide.data.activeDays} días distintos`
      };
    case "rhythm": {
      const hourLabel = slide.data.mostActiveHour !== null ? `${slide.data.mostActiveHour}:00` : null;
      const dayLabel = slide.data.mostActiveDay ? DAY_LABELS_ES[slide.data.mostActiveDay] : null;
      return {
        title: "Tu momento más productivo",
        big: hourLabel && dayLabel ? `${dayLabel}, ${hourLabel}` : hourLabel ?? dayLabel ?? "—",
        sub: slide.data.narrative
      };
    }
    case "languages":
      return {
        title: "Tu lenguaje del año",
        big: slide.data.topLanguage ?? "—",
        sub: slide.data.narrative
      };
    case "repos":
      return {
        title: "Tu repositorio del año",
        big: slide.data.topRepository ?? "—",
        sub: slide.data.narrative
      };
    case "streak":
      return {
        title: "Tu racha más larga",
        big: `${slide.data.longestStreak} días`,
        sub: slide.data.narrative
      };
    case "closing":
      return {
        title: `Eso fue ${slide.data.year}`,
        big: slide.data.totalCommits.toLocaleString("es"),
        sub: slide.data.topLanguage ? `commits, sobre todo en ${slide.data.topLanguage}` : "commits"
      };
  }
}

export function getGradient(kind: WrappedSlide["kind"]): string {
  return GRADIENTS[kind];
}

export function getAccent(kind: WrappedSlide["kind"]): string {
  return ACCENTS[kind];
}
