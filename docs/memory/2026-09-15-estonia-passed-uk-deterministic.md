# Estonia conectada aprobada y UK determinista

Fecha: 2026-09-15 (Asia/Bangkok).

- Estonia `2026-09-15.1` aprobó 4/4 en modo `CONNECTED` con `gpt-5.6-terra` y simulador `gpt-5.6-luna`: 59/60 solicitudes, 32.408 tokens, 131.776 ms acumulados, 78/78 propuestas aceptadas, una extracción vacía adversarial esperada y cero acciones externas. El reporte saneado se preservó localmente en `.local/qa/estonia-agent-evaluation-2026-09-15.1-connected-passed.json`.
- Se implementó el agente UK Ltd `2026-09-15.1` con 22 campos propios, nueve fuentes oficiales, paquete sintético, conversación privada, confirmación del cliente, tracking sin valores y cuatro escenarios. Identidad, códigos personales, domicilio, firmas, tasa, ACSP y presentación permanecen fuera del agente.
- Validación local: `pnpm check` aprobó lint, TypeScript, 188/188 pruebas, diez bundles Edge y build; Playwright aprobó 16/16; UK determinista aprobó 4/4 con cero solicitudes y cero acciones externas.
- La migración `202609150014_uk_agent_conversations.sql` fue la única pendiente, se aplicó al staging autorizado `keboldglfjonxcdnmyee` sin seed ni Edge y la suite alojada aprobó 17/17 con aislamiento RLS GB.
- Siguiente puerta: ejecutar `corepack pnpm test:uk-agent:connected` desde la PowerShell privada con presupuesto 60. Solo 4/4, estado exacto y cero acciones externas habilitan cerrar la secuencia conversacional de las cuatro jurisdicciones.
