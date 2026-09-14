# Company Setups — diagnóstico del primer run conectado Delaware

Fecha: 2026-09-14, 23:03 Asia/Bangkok (UTC+7).

- El primer run conectado Delaware falló en la solicitud inicial del simulador: 1/60 solicitud reservada, cero respuestas completadas, cero tokens observados y cero acciones externas.
- El reporte anterior solo conservó `EVALUATION_FAILED`; no permite afirmar si la causa fue timeout, red, JSON o esquema.
- Se creó un transporte compartido con timeout de 45 segundos, `X-Client-Request-Id` y códigos saneados para timeout, red, HTTP, respuesta y esquema. No guarda cuerpos, claves ni respuestas, y no reintenta automáticamente.
- Versiones: onboarding `2026-09-14.6`, evaluación Delaware `2026-09-14.2` y evaluación Wyoming `2026-09-14.5`.
- `pnpm check` aprobó lint, TypeScript, 176/176 pruebas, diez bundles Edge y build. Delaware y Wyoming aprobaron 4/4 determinista, con cero solicitudes de red y cero acciones externas.
- Siguiente paso: publicar el diagnóstico y repetir `corepack pnpm test:delaware-agent:connected` desde la PowerShell privada. Solo 4/4 y cero acciones externas habilitan continuar Estonia.
