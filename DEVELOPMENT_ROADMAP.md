# GitHub Wrapped — Development Roadmap

> Ver `ROADMAP.md` para el análisis de producto completo (secciones 1-43).
> Este archivo trackea el plan técnico de implementación fase por fase.
> Convención: `[x]` fase completa y con tests, `[ ]` fase pendiente.

- [x] **Fase 0 — Foundation**
      Next.js 14 (App Router), Prisma schema inicial, Auth.js + GitHub
      OAuth, tokens cifrados en reposo, job queue con Inngest.
- [x] **Fase 1 — Insights Engine**
      Analytics Engine puro (sin red/DB) + capa de narración con IA
      opcional (fallback a plantillas deterministas sin `ANTHROPIC_API_KEY`).
- [x] **Fase 2 — Dashboard**
      Gráficos de heatmap, distribución de lenguajes y tendencia de
      commits, seleccionables por período.
- [x] **Fase 3 — Wrapped Experience**
      Slide deck full-screen con Framer Motion, orden narrativo
      persistido en `WrappedReport.slidesOrder`.
- [x] **Fase 4 — Sharing**
      Páginas públicas, Open Graph images (`next/og`), toggle de
      privacidad como acción consciente del dueño.
- [x] **Fase 5 — Gamificación & Comparaciones**
      Badges (`streak_7/30/100`, `polyglot_5`, `night_shift`,
      `century_club`, `marathon`), Developer Activity Score, comparaciones
      opt-in por ambas partes.
- [x] **Fase 6 — Repos privados (opt-in)**
      Reautorización incremental de OAuth, job de purga al desactivar.
- [x] **Fase 7 — Tiempo real y automatización**
      Webhooks (`push`/`repository`) verificados por HMAC, cron de
      reconciliación diario, auto-generación del Wrapped al cerrar el año.
- [x] **Fase 8 — Notificaciones**
      Email transaccional cuando el Wrapped anual está listo (solo en la
      primera generación de un año cerrado) y cuando se alcanza un
      milestone de racha (`streak_7/30/100`), con preferencias granulares
      por usuario y deduplicación por constraint de DB
      (`NotificationLog @@unique([userId, type, key])`). Envío vía Resend
      con fallback no-op documentado si no hay API key configurada.
- [ ] **Fase 9 — i18n**
      La app está en español hardcodeado en toda la UI y en las
      plantillas de email de la Fase 8. Falta una capa de traducción y
      decidir el mecanismo de detección de idioma.
- [ ] **Fase 10 — Seguridad/Compliance**
      Auditoría de permisos, rate limiting propio sobre endpoints
      públicos, exportación/borrado de datos del usuario (GDPR-like).
- [ ] **Fase 11 — Performance/Escalabilidad**
      Paginar el fan-out de `lib/jobs/reconcile.ts` y
      `lib/jobs/wrapped-auto-generate.ts` cuando el volumen de usuarios lo
      justifique (documentado como límite conocido en ambos archivos).
- [ ] **Fase 12 — Testing E2E**
      Hoy solo hay tests unitarios/integración con mocking (143 tests,
      sin red ni DB real). Falta Playwright/Cypress contra un entorno
      desplegado.
- [ ] **Fase 13 — CI/CD**
      Pipeline de GitHub Actions: `tsc --noEmit`, `npm test`, `next build`
      en cada PR, antes de habilitar deploys automáticos a Vercel.

---

## Notas de verificación (honestidad sobre lo no probado)

Cada fase documenta explícitamente qué no se pudo verificar en el
sandbox de desarrollo, en vez de marcarlo como completo sin más:

- **Fase 7**: registro de webhooks contra GitHub real, reconciliación
  contra infraestructura real de cron — no verificados end-to-end.
- **Fase 8**: envío real de emails vía Resend (solo probado el contrato
  HTTP con `fetch` mockeado), generación real del Prisma Client contra
  Postgres (bloqueada por descarga del binario del motor en este
  sandbox — mismo límite que en fases anteriores), renderizado visual
  del HTML del email en clientes de correo reales.
- **Todas las fases**: 60fps de las animaciones de Framer Motion en
  dispositivos móviles reales, previews de Open Graph en plataformas
  sociales reales.
