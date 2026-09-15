# Wyoming vigente y puerta Google

Fecha: 2026-09-15, Asia/Bangkok.

- Wyoming `2026-09-14.5` aprobó 4/4 recorridos conectados con `gpt-5.6-terra` y `gpt-5.6-luna`: 49/60 solicitudes, 26.988 tokens, 69/69 propuestas aceptadas y cero acciones externas. Reporte saneado: `.local/qa/wyoming-agent-evaluation-2026-09-14.5-connected-passed.json`.
- El registro operativo queda con Wyoming, Delaware, Estonia y UK en `CONNECTED_PASSED_CURRENT`. Esta evidencia es sintética y no habilita registros, pagos, firmas, KYC ni contacto con autoridades o partners.
- Se agregó una comprobación remota que valida el staging autorizado, usa la clave publicable local sin imprimirla y guarda solo resultados saneados. El estado observado fue Google deshabilitado, correo habilitado y registro disponible.
- `pnpm test:google-auth:staging` falla cerrado hasta que Google y el registro estén habilitados. La configuración externa exige un cliente OAuth Web y Client ID/Secret guardados directamente en Supabase; no deben compartirse por chat o Git.
- Validación: lint, TypeScript, 196/196 pruebas, diez bundles Edge, build, 4/4 evaluadores determinísticos y 16/16 E2E aprobados. No cambió esquema, RLS ni Edge.
- Siguiente paso: configurar el proveedor Google y probar Google → Supabase → callback → panel con una cuenta sintética/controlada. Después, alojar el repositorio Next.js y ejecutar el piloto supervisado.
