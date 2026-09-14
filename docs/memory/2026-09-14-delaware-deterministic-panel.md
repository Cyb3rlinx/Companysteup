# Company Setups — Delaware determinista, panel y staging

Fecha: 2026-09-14, 17:32 Asia/Bangkok (UTC+7).

- Se agregó el catálogo Delaware de 20 campos con fuentes oficiales, destinos y responsables; excluye firmas, TIN, documentos de identidad, cuentas de mensajería y pagos.
- El motor conversacional ahora deriva `US-WY` o `US-DE` del expediente. Conserva confirmación del cliente, reanudación, idempotencia, aislamiento y vista operativa de solo lectura.
- El panel de caso y el laboratorio muestran Delaware; case-tracking expone conteos y estado, sin valores.
- La evaluación Delaware `2026-09-14.1` aprobó 4/4 recorridos deterministas y cero acciones externas. La conectada queda pendiente en la terminal privada con OpenAI.
- `pnpm check` aprobó lint, TypeScript, 174/174 pruebas, diez bundles Edge y build. E2E aprobó 14/14 con salida 0 en servidor sandbox aislado. Wyoming regresó 4/4 determinista.
- La migración 012 fue la única pendiente, se aplicó al staging Singapur `keboldglfjonxcdnmyee` y la suite alojada aprobó 17/17 con una conversación Delaware y RLS explícitos.
- Siguiente paso: ejecutar `corepack pnpm test:delaware-agent:connected`; si aprueba, documentar métricas y continuar Estonia. Si falla, corregir el contrato observado sin relajar la puerta ni aumentar gasto a ciegas.
- No hubo compañía, presentación, pago, identidad, firma, partner, publicación regulatoria ni acción gubernamental real.
