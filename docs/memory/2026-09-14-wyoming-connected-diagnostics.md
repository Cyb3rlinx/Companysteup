# Sesión: diagnóstico del primer run conectado Wyoming

Fecha: 2026-09-14, Asia/Bangkok.

- El fundador configuró las cuatro variables en su PowerShell privado y ejecutó el nivel conectado mediante Corepack; no se copiaron ni guardaron secretos.
- El run terminó `EVALUATION_BUDGET` al alcanzar 60 solicitudes. El runner anterior ocultaba `DomainError` del proveedor mediante el fallback de producción y no guardaba diagnóstico parcial, así que el resultado no acredita disponibilidad ni calidad del modelo.
- Se agregó un modo de fallo estricto exclusivo del laboratorio, mensajes HTTP saneados, progreso por solicitud, corte ante falta de avance y reporte parcial sin contenido conversacional.
- La rúbrica exige ahora todos los campos solicitados en cada lote; un parche parcial ya no se acepta silenciosamente.
- Validación: `pnpm check` aprobó lint, TypeScript, 165/165 pruebas, diez bundles Edge y build. El runner determinista aprobó 4/4, guardó estado `PASSED` y verificó cero escrituras externas.
- Siguiente paso: reejecutar con el mismo límite de 60 y usar el primer error o escenario fallido para decidir la corrección. No aumentar presupuesto sin diagnóstico.
