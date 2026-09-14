# Sesión: Wyoming conectado e integrado al expediente

Fecha: 2026-09-14, Asia/Bangkok.

- El run conectado de la versión `2026-09-14.4` aprobó 4/4 recorridos con `gpt-5.6-terra` y `gpt-5.6-luna`: 49/60 solicitudes, 27.212 tokens totales, 69 propuestas aceptadas, cero descartadas y una extracción vacía adversarial esperada.
- Los recorridos completos, de corrección y adversarial llegaron a 21/21 campos; el incompleto permaneció activo con 5/5. La puerta negativa confirmó cero escrituras externas, órdenes y compañías.
- La conversación Wyoming quedó integrada en el detalle del caso del cliente. Persiste al recargar y actualiza el resumen de seguimiento.
- Operaciones dispone de lectura, pero las mutaciones exigen rol de cliente. Los eventos y el endpoint de seguimiento conservan conteos y nombres de campos, nunca valores del intake.
- `pnpm check` aprobó lint, TypeScript, 168/168 pruebas, diez bundles Edge y build. El nivel determinista volvió a aprobar 4/4 sin red ni acciones externas.
- `pnpm test:e2e` aprobó 13/13 con salida 0 sobre un servidor sandbox aislado y reutilizado.
- No hubo migraciones ni cambios de staging. Siguiente paso: cierre de QA/CI y luego intake más evaluación US-DE, seguido de EE y GB.
