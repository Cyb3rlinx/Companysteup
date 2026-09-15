# UK conectado y operaciones de agentes

Fecha: 2026-09-15, Asia/Bangkok.

- UK `2026-09-15.1` aprobó 4/4 conectado: `gpt-5.6-terra` / `gpt-5.6-luna`, 55/60 solicitudes, 30.578 tokens y cero acciones externas. Reporte saneado local, ignorado por Git.
- La regresión `2026-09-15.1` ejecuta los cuatro evaluadores determinísticos vigentes, verifica versión, 4/4 y cero escrituras, y genera `.local/qa/agent-regression.json`. CI ahora la ejecuta y sube los cinco informes.
- El admin muestra calidad por agente y seguimiento operativo por caso: próximo campo sin valor, excepciones abiertas, responsable, último evento y SLA interno. El cliente no recibe el registro de calidad ni motivos privados.
- Delaware, Estonia y UK tienen evidencia conectada de su versión vigente. Wyoming exige revalidación porque la evidencia aprobada es `2026-09-14.4` y el evaluador actual `2026-09-14.5`.
- Validación local: 194/194 pruebas, lint, TypeScript, diez bundles Edge, build, cuatro evaluadores determinísticos y 16/16 E2E. Staging no se repitió porque no cambió el esquema, RLS ni Edge.
- Publicado en `71e3708`; CI #32 aprobó application, Supabase y Edge, y Regulatory integrity #32 aprobó. El artefacto contiene la regresión y los cuatro informes determinísticos.
- Siguiente paso: `corepack pnpm test:wyoming-agent:connected` con las variables privadas y límite 60. Después, Google OAuth alojado y preparación de hosting/piloto supervisado; trámites, identidad y pagos reales continúan `EXTERNAL_BLOCKED`.
