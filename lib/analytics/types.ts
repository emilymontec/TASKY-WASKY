/**
 * El Analytics Engine (sección 13) debe ser independiente de la API de
 * GitHub, de la UI y de la base de datos cuando sea posible. Por eso
 * define sus propios tipos de entrada en vez de importar los modelos de
 * Prisma directamente — cualquier capa (DB, fixtures de test, mocks) puede
 * alimentarlo mientras cumpla esta forma mínima.
 */

export interface AnalyticsCommitInput {
  id: string;
  date: Date; // timestamp UTC tal como lo entrega GitHub
  repositoryId: string;
}

export interface AnalyticsRepositoryInput {
  id: string;
  name: string;
}

export interface AnalyticsLanguageInput {
  repositoryId: string;
  language: string;
  bytes: number;
  capturedAt: Date;
}

export interface AnalyticsPeriod {
  /** Inclusivo. */
  start: Date;
  /**
   * ⚠️ EXCLUSIVO — el instante justo después del rango, no el último
   * instante incluido. Ver lib/dashboard/period.ts para el razonamiento
   * completo. Cualquier filtro de fecha contra este límite debe usar `<`
   * (`lt`), nunca `<=` (`lte`).
   */
  end: Date;
}
