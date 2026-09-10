import type { LanguageDistributionEntry } from "@/lib/analytics/languages";
import type { Weekday } from "@/lib/analytics/timezone";

export interface OpeningSlideData {
  year: number;
  username: string;
  totalCommits: number;
}

export interface VolumeSlideData {
  totalCommits: number;
  activeDays: number;
  averageCommitsPerWeek: number;
}

export interface RhythmSlideData {
  mostActiveHour: number | null;
  mostActiveDay: Weekday | null;
  nightActivityPercentage: number;
  weekendActivityPercentage: number;
  narrative: string | null;
}

export interface LanguagesSlideData {
  topLanguage: string | null;
  distribution: LanguageDistributionEntry[];
  narrative: string | null;
}

export interface ReposSlideData {
  topRepository: string | null;
  activeRepositories: number;
  narrative: string | null;
}

export interface StreakSlideData {
  longestStreak: number;
  currentStreak: number;
  narrative: string | null;
}

export interface ClosingSlideData {
  year: number;
  totalCommits: number;
  topLanguage: string | null;
}

/**
 * Orden narrativo fijo (Fase 3): apertura → volumen → ritmo → lenguajes
 * → repos → racha → cierre. Es un union discriminado por `kind` a
 * propósito — la UI hace un `switch` exhaustivo sobre `kind`, así que
 * agregar un tipo de slide nuevo sin actualizar el renderer es un error
 * de compilación, no un slide en blanco en producción.
 */
export type WrappedSlide =
  | { kind: "opening"; data: OpeningSlideData }
  | { kind: "volume"; data: VolumeSlideData }
  | { kind: "rhythm"; data: RhythmSlideData }
  | { kind: "languages"; data: LanguagesSlideData }
  | { kind: "repos"; data: ReposSlideData }
  | { kind: "streak"; data: StreakSlideData }
  | { kind: "closing"; data: ClosingSlideData };

export const SLIDE_ORDER = [
  "opening",
  "volume",
  "rhythm",
  "languages",
  "repos",
  "streak",
  "closing"
] as const;
