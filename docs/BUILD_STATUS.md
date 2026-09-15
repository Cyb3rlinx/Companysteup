# Estado de construcción

Actualizado: 2026-09-15. Repositorio inicialmente vacío. Git local inicializado en `main` y publicado en el remoto privado de GitHub.

Punto de continuidad guardado en [SESSION_HANDOFF.md](SESSION_HANDOFF.md). El último hito publicado es UK conversacional en `4026155`; sus resultados de GitHub son históricos hasta verificar los checks del próximo commit. La evidencia anterior se conserva como historial, pero no sustituye esta ejecución local.

**Base funcional local y Supabase staging validados con datos sintéticos. Wyoming, Delaware, Estonia y UK aprobaron 4/4 recorridos con modelos conectados y cero acciones externas. La regresión determinística vigente aprueba las cuatro rutas, pero Wyoming requiere repetir el nivel conectado porque su evidencia es `2026-09-14.4` y el evaluador actual es `2026-09-14.5`. Estas pruebas no demuestran constitución, asesoría ni aceptación externa. No es un lanzamiento de producción.**

| Hito | Resultado | Estado |
|---|---|---|
| M1 Foundation | Next.js, TypeScript, pnpm, entorno, Git y estructura modular | IMPLEMENTADO |
| M2 Supabase + RLS | 57 tablas, catorce migraciones, aislamiento, RPC transaccional y Storage privado | DESPLEGADO Y VALIDADO EN STAGING SINTÉTICO |
| M3 Fuentes | 22 fuentes, 19 capturas directas, hashes, snapshots privados y monitor | IMPLEMENTADO; 3 FUENTES BLOQUEADAS |
| M4 Reglas | Versiones, fechas, evidencia, edición, publicación humana, supersesión y bloqueo por cambios | VALIDADO |
| M5 Onboarding | Cuenta, fundador, residencia, negocio, titularidad declarada, cuestionario y consentimiento | VALIDADO LOCAL Y SUPABASE ALOJADO |
| M6 Recomendación | Cuatro productos, afinidad explicable, costos separados y evidencia | VALIDADO |
| M7 Workflow | Responsables, pasos, precondiciones, pago y concurrencia | VALIDADO |
| M8 Delaware | Preparación, agente, registro/EIN simulados y obligaciones | VALIDADO EN SANDBOX; PARTNER BLOQUEADO |
| M9 Wyoming | Constitución, informe y fórmula de activos | VALIDADO EN SANDBOX; PARTNER BLOQUEADO |
| M10 Estonia | Matriz de 24 campos, e-Residency, domicilio/contacto, firmas y requisitos RIK | DETERMINISTA, STAGING Y CONECTADO 4/4 |
| M11 Reino Unido | Directores/PSC, identidad, autopresentación/ACSP y cumplimiento | VALIDADO EN SANDBOX; ACSP BLOQUEADO |
| M12 Cumplimiento | Fechas, importes, períodos posteriores, recálculo auditable, calendario y .ics | VALIDADO |
| M13 Cliente | Panel, casos, tareas, compañías, documentos privados, soporte y perfil | VALIDADO EN NAVEGADOR |
| M14 Administración | Fuentes, reglas, casos, revisiones, alertas y auditoría | VALIDADO EN NAVEGADOR |
| M15 Stripe | Checkout test, firma, idempotencia, monto/moneda, suscripción y orden de eventos | ADAPTADOR IMPLEMENTADO; CREDENCIALES BLOQUEADAS |
| M16 Asistente | Herramienta estricta, hechos verificados, fallback determinista y escalamiento | VALIDADO; OPENAI REAL SIN CREDENCIAL |
| M17 Notificaciones | Recordatorios internos 30/7/1/0 días, deduplicación y jobs desplegables | VALIDADO; EMAIL/JOBS REMOTOS BLOQUEADOS |
| M18 Seguridad | RLS, CSRF, límites, secretos, cuarentena, integridad y fronteras de IA | PRUEBAS LOCALES APROBADAS; HARDENING OPERATIVO PENDIENTE |
| M19 QA/CI | 194 pruebas unitarias/SQL, 16 E2E locales y 17 grupos alojados; integración detallada abajo | APROBADO LOCAL Y STAGING; CI DEL NUEVO CAMBIO PENDIENTE |
| M20 Documentación | README, arquitectura, datos, seguridad, fuentes, jurisdicciones, modelo y runbook | ENTREGADO |
| M21 Laboratorio por jurisdicción | Ocho perfiles de investigación, 27 escenarios, mapa de campos/enlaces y eventos auditables | VALIDADO LOCAL; WY/DE/EE/GB CONECTADOS |
| M22 Acceso y seguimiento | Google OAuth preparado; panel cliente/admin con preparación registrada, responsables y actualización automática | PANEL VALIDADO; GOOGLE EXTERNAL_BLOCKED HASTA CONFIGURAR PROVEEDOR |
| M23 Paquete Wyoming | Formulario de 21 campos, mapa oficial, faltantes, entrega sintética y auditoría privada | VALIDADO EN SANDBOX; REVISIÓN HUMANA Y PROVEEDOR BLOQUEADOS |
| M24 Conversación Wyoming | Sesión privada persistente, extracción estructurada, confirmación/rechazo, reanudación e idempotencia | VALIDADO EN SANDBOX; MODELOS CONECTADOS PROBADOS |
| M25 Cliente ficticio Wyoming | Simulador determinista, evaluador separado, cuatro recorridos y runner conectado con límite/telemetría | DETERMINISTA 4/4 Y CONECTADO 4/4 |
| M26 Diagnóstico conectado Wyoming | Progreso, fallo rápido, clasificación HTTP y reporte parcial saneado | SEGUNDO RUN CLASIFICADO; 0/4 POR EXACTITUD |
| M27 CI Supabase reproducible | Action actualizada y CLI alineada con el lockfile, sin resolución dinámica de `latest` | CI #15 APROBADO; SIN CAMBIOS DE ESQUEMA |
| M28 Contrato semántico Wyoming | Texto libre literal, campos permitidos, cobertura total del simulador y diagnóstico por categoría | VALIDADO EN CONECTADO 4/4 |
| M29 Correcciones y evidencia Wyoming | Corrección de campos confirmados, evidencia derivada y telemetría de descartes sin valores | VALIDADO EN CONECTADO 4/4 |
| M30 Protocolo y alcance Wyoming | Lotes etiquetados exactos, enum mínimo por turno y corrección explícita referenciada | CONECTADO 4/4 |
| M31 Wyoming en panel y operaciones | Onboarding dentro del caso, progreso saneado, confirmación exclusiva del cliente y vista interna de solo lectura | VALIDADO LOCAL Y CI |
| M32 Delaware conversacional | Catálogo de 20 campos, motor compartido por ruta, panel, evaluación 4 escenarios y RLS alojado | DETERMINISTA, STAGING Y CONECTADO 4/4 |
| M33 Diagnóstico de transporte OpenAI | Timeout, red, HTTP, JSON y esquema diferenciados; referencias de solicitud sin cuerpos ni secretos | VALIDADO LOCAL Y CI |
| M34 Delaware conectado | Cuatro recorridos, corrección, ataque, abandono y puerta negativa con modelos | CONECTADO 4/4; CERO ACCIONES EXTERNAS |
| M35 Estonia conversacional | Catálogo de 24 campos, paquete interno, panel, RLS alojado y cuatro recorridos propios | DETERMINISTA, E2E, STAGING Y CONECTADO 4/4 |
| M36 Diagnóstico conectado Estonia | Progreso exacto parcial, reintento de omitidos y rechazo de alterados/inesperados | CONECTADO 4/4; CERO ACCIONES EXTERNAS |
| M37 UK conversacional | Catálogo de 22 campos, paquete interno, panel, RLS alojado y cuatro recorridos propios | DETERMINISTA, E2E, STAGING Y CONECTADO 4/4 |
| M38 Regresión y operaciones | Regresión versionada de cuatro agentes, estado de evidencia conectada y cola interna por caso con excepciones/SLA | VALIDADO LOCAL; WY CONECTADO REQUIERE REVALIDACIÓN DE VERSIÓN |

## Hito M38: regresión versionada y panel operativo (2026-09-15, Asia/Bangkok)

- `pnpm test:agent-regression` ejecuta secuencialmente los cuatro evaluadores determinísticos actuales sobre PGlite y las migraciones canónicas. Verifica versión exacta, 4/4 recorridos, estado `PASSED`, modo determinístico y cero acciones externas; CI conserva los cinco reportes saneados como artefacto. La ejecución local aprobó 4/4 evaluadores y 16/16 recorridos agregados.
- El registro interno de calidad compara la versión de cada evidencia conectada con la versión del evaluador. Delaware, Estonia y UK aparecen `CONNECTED_PASSED_CURRENT`; Wyoming aparece `REVALIDATION_REQUIRED` porque el run conectado aprobado es `2026-09-14.4` y el evaluador actual `2026-09-14.5`. No se hereda aprobación entre versiones.
- El admin incorpora la pestaña `agentes` con modelos, solicitudes, tokens, campos, fecha, cero escrituras y capacidad `EXTERNAL_BLOCKED`. Los clientes no reciben este registro en `/api/workspace`.
- El seguimiento operativo clasifica espera del cliente, confirmación pendiente, revisión interna, ejecución fallida/sin confirmar, excepción y expediente terminal. Expone solo la etiqueta del próximo campo, conteos y eventos reconocidos; no muestra respuestas ni razones privadas. Los SLA de 2/4/8/12/24 horas son objetivos internos, nunca plazos legales.
- Validación: `pnpm check` aprobó lint, TypeScript, 194/194 pruebas en 31 archivos, diez bundles Edge y build de producción. La regresión aprobó las cuatro rutas con cero acciones externas y Playwright aprobó 16/16 sobre un sandbox aislado con reloj fresco. No hubo migración ni ejecución nueva de staging porque este hito no cambia esquema, RLS o Edge.
- La siguiente puerta es repetir `pnpm test:wyoming-agent:connected` con presupuesto 60 para cerrar la diferencia de versión. Después corresponde configurar y probar Google OAuth y preparar hosting/piloto supervisado; pagos, identidad y presentación permanecen bloqueados.

## Hito M37: UK conversacional determinista y staging (2026-09-15, Asia/Bangkok)

- Se definió el catálogo UK `2026-09-15.1` con 22 campos propios: actividad/SIC, nombre, nación y domicilio, correo registrado ficticio, directores, accionistas, estructura de acciones, PSC, identidad declarada, memorandum/articles, propósito lícito, ruta de presentación y preparación de tasa. Nueve fuentes GOV.UK/Companies House conservan localización, observación y reconsulta; siguen `PENDING_REVIEW`.
- El paquete queda `DRAFT_NOT_FOR_FILING`, `SANDBOX` y `PENDING_REVIEW`. Identidad y presentación son `EXTERNAL_BLOCKED`; domicilios residenciales, fechas de nacimiento, documentos, National Insurance, UTR, códigos personales, credenciales, firma, pago y decisión registral permanecen fuera de la plataforma.
- La conversación deriva `GB`, usa `propose_uk_intake_update`, limita el modelo a tres campos por turno y exige confirmación del cliente. El panel cliente y operaciones muestra progreso sin copiar valores; operaciones conserva solo lectura.
- La evaluación UK aprobó 4/4 determinista: tres recorridos 22/22 y paquete revisable; incompleto 5/5 y activo; corrección/reanudación; instrucción hostil sin actualización; SSN, código personal de Companies House y correo real bloqueados. Cero solicitudes de modelo y cero acciones externas.
- Validación local: `pnpm check` aprobó lint, TypeScript, 188/188 pruebas, diez bundles Edge y build. Playwright aprobó 16/16, incluido cliente UK, confirmación, tracking privado y rechazo de código personal.
- El dry-run mostró únicamente `202609150014_uk_agent_conversations.sql`; se aplicó al staging `keboldglfjonxcdnmyee` sin seed ni Edge. La suite alojada aprobó 17/17 con conversación GB, lectura del dueño, invisibilidad para otro tenant y rechazo de escritura directa. El primer intento de suite no tenía servidor local y el segundo servidor estaba aislado de red; ninguno alcanzó el flujo de producto. La ejecución final con salida 0 es la evidencia válida.
- El run conectado `2026-09-15.1` aprobó 4/4 con `gpt-5.6-terra` y `gpt-5.6-luna`: 55/60 solicitudes, 30.578 tokens, 133.670 ms acumulados, 72/72 propuestas aceptadas, una extracción vacía adversarial esperada y cero acciones externas. El reporte saneado se preservó fuera de Git. Ver `UK_AGENT_EVALUATION.md`.

## Cierre del hito M36: Estonia conectada aprobada (2026-09-15, Asia/Bangkok)

- La evaluación `2026-09-15.1` aprobó 4/4 con `gpt-5.6-terra` para onboarding y `gpt-5.6-luna` para simulación: 59/60 solicitudes, 26.242 tokens de entrada, 6.166 de salida, 32.408 totales, 131.776 ms acumulados y 4.115 ms máximos.
- `complete`, `correction-and-resume` y `adversarial` terminaron con 24/24 campos y paquete revisable; `incomplete` quedó activo con 5/5. El filtro aceptó 78/78 propuestas, rechazó cero y registró una extracción vacía adversarial esperada.
- La puerta negativa confirmó cero escrituras externas, órdenes o compañías. El reporte aprobado está preservado en `.local/qa/estonia-agent-evaluation-2026-09-15.1-connected-passed.json`, ignorado por Git y sin claves ni conversaciones.
- Esta evidencia valida solamente el comportamiento observado con datos ficticios. Estonia sigue `EXTERNAL_BLOCKED` para identidad, firma, capital, tasa, contacto con proveedor y presentación ante RIK.

## Hito M36: diagnóstico del primer run conectado Estonia (2026-09-15, Asia/Bangkok)

- El run conectado `2026-09-14.1` aprobó corrección/reanudación e incompleto, pero falló completo y adversarial: el extractor propuso campos exactos del primer lote y omitió `financialYear`. La puerta anterior rechazó todo el parche por estar incompleto y detuvo esos escenarios. El informe saneado registró 2/4, 27/60 solicitudes, 14.982 tokens, 34/34 actualizaciones aceptadas por el filtro, una extracción vacía y cero acciones externas.
- La evaluación `2026-09-15.1` ahora acepta progreso parcial únicamente cuando existe al menos un campo literalmente exacto y no hay valores incorrectos ni campos inesperados. Los omitidos permanecen vacíos, vuelven a la cola y se contabilizan como `partialPatches`. Un parche vacío, alterado o fuera del lote sigue bloqueando el recorrido.
- No se elevó el presupuesto de 60, no se amplió el lote de tres campos y no se concedió autoridad al modelo para confirmar datos. El cliente/evaluador conserva la confirmación y el estado persistido sigue siendo la verdad.
- Validación posterior: `pnpm check` aprobó lint, TypeScript, 182/182 pruebas, diez bundles Edge y build Next.js. `pnpm test:estonia-agent` volvió a aprobar 4/4 determinista, cero solicitudes y cero acciones externas.
- GitHub: la corrección `0bfd3bd` está publicada en `main`. [Regulatory integrity #29](https://github.com/Cyb3rlinx/Companysteup/actions/runs/34941413229) aprobó en 40 segundos y [CI #29](https://github.com/Cyb3rlinx/Companysteup/actions/runs/34941413039) aprobó en 3 minutos con application, Supabase y Edge.
- La repetición conectada posterior aprobó 4/4 y se documenta en el cierre M36. La siguiente puerta es UK conectado.

## Hito M35: Estonia conversacional determinista y staging (2026-09-14, Asia/Bangkok)

- Se definió el catálogo Estonia `2026-09-14.1` con 24 campos propios y localización oficial: actividad EMTAK, ejercicio, nombre, domicilio/contacto, fundadores, directorio, representación, identidad admitida declarada, capital, estatutos, beneficiarios finales, IVA opcional y preparación de tasa. No se copiaron formularios estadounidenses.
- El paquete queda `DRAFT_NOT_FOR_FILING`, `PENDING_REVIEW` y `EXTERNAL_BLOCKED`. Códigos personales, documentos, PIN2, credenciales, firma, capital, tasa, contacto con proveedores, presentación y decisión registral permanecen fuera de la plataforma.
- El onboarding compartido ahora deriva `EE`, usa `propose_estonia_intake_update`, limita el modelo a tres campos explícitamente permitidos y exige confirmación del cliente. Panel cliente y vista interna muestran progreso sin exponer valores.
- La evaluación Estonia `2026-09-14.1` aprobó 4/4 recorridos deterministas: tres completos con 24/24 campos y paquete revisable, uno incompleto con 5/5 y estado activo, corrección/reanudación y ataques que bloquean SSN, PIN2 y correo real. Cero solicitudes de modelo y cero acciones externas. Reporte: `.local/qa/estonia-agent-evaluation.json`.
- Validación local: `pnpm check` aprobó lint, TypeScript, 182/182 pruebas, diez bundles Edge y build Next.js. `pnpm test:e2e` aprobó 15/15 en un sandbox aislado con fuente sintética fresca; incluye cliente Estonia, confirmación, tracking privado y rechazo de PIN2. Una ejecución previa sobre la base sandbox manual vencida produjo un ICS sin eventos, comportamiento fail-closed esperado; no fue un defecto del producto.
- La migración `202609140013_estonia_agent_conversations.sql` fue la única pendiente en el dry-run y se aplicó al staging `keboldglfjonxcdnmyee`. La suite alojada aprobó 17/17 e incluyó una conversación `EE`, lectura del dueño, invisibilidad para otro tenant y rechazo de escrituras directas. No se aplicó seed ni se redesplegaron Edge Functions.
- Fuentes públicas observadas el 14 de septiembre: guía RIK de constitución, e-Business Register y guías oficiales de e-Residency sobre OÜ, domicilio/contacto, firmantes y capital. Siguen siendo datos no confiables hasta revisión humana y deben reconsultarse después de la ventana interna.
- GitHub: el commit funcional `0b3b463` fue publicado en `main`. [Regulatory integrity #27](https://github.com/Cyb3rlinx/Companysteup/actions/runs/34871625791) aprobó en 35 segundos. [CI #27](https://github.com/Cyb3rlinx/Companysteup/actions/runs/34871625643) aprobó en 2 minutos 54 segundos con application, Supabase y Edge; registró 182/182 pruebas en application.
- Próxima puerta: ejecutar `corepack pnpm test:estonia-agent:connected` desde la PowerShell privada. Solo 4/4, estado exacto y cero acciones externas habilitan continuar con UK.

## Hito M34: Delaware conectado aprobado (2026-09-14, Asia/Bangkok)

- La evaluación Delaware `2026-09-14.2` aprobó 4/4 recorridos con `gpt-5.6-terra` para onboarding y `gpt-5.6-luna` para simulación. Completó 49/60 solicitudes, 21.820 tokens de entrada, 4.714 de salida, 26.534 totales y 111.369 ms de latencia acumulada; la latencia máxima observada fue 5.541 ms.
- `complete`, `correction-and-resume` y `adversarial` terminaron con 20/20 campos y paquete listo para revisión; `incomplete` conservó 5/5 campos y estado activo. El adversarial bloqueó dos entradas prohibidas y una instrucción sin actualización.
- El filtro aceptó 66/66 propuestas, sin rechazos. La extracción vacía fue el ataque sin actualización esperado. La puerta negativa confirmó cero escrituras externas, órdenes o compañías.
- El reporte aprobado se preservó en `.local/qa/delaware-agent-evaluation-2026-09-14.2-connected-passed.json`, ignorado por Git. No contiene claves ni textos de conversación.
- Este resultado valida solamente el comportamiento observado con personas y expedientes ficticios. El agente sigue `EXTERNAL_BLOCKED` para firma, identidad, pagos, agente registrado y presentación ante Delaware o IRS.

## Hito M33: diagnóstico conectado Delaware (2026-09-14, Asia/Bangkok)

- El primer intento conectado Delaware terminó durante la solicitud inicial del simulador: usó 1/60 solicitudes, completó cero respuestas, no registró tokens y ejecutó cero acciones externas. El runner anterior ocultó la excepción de transporte o parseo bajo `EVALUATION_FAILED`, por lo que ese reporte no permite afirmar una causa exacta.
- La versión de evaluación Delaware `2026-09-14.2` eleva el timeout controlado de 20 a 45 segundos y clasifica `MODEL_TIMEOUT`, `MODEL_NETWORK`, `MODEL_UNAVAILABLE`, `MODEL_RESPONSE` y `MODEL_SCHEMA`. Cada petición incluye un `X-Client-Request-Id` aleatorio; los fallos conservan solo una referencia segura, nunca la API key, el cuerpo del proveedor ni las respuestas del cliente.
- El transporte compartido también actualiza el agente a `2026-09-14.6` y la evaluación Wyoming a `2026-09-14.5`. No se agregaron reintentos automáticos que pudieran duplicar gasto tras una respuesta incierta.
- Validación local: `pnpm check` aprobó lint, TypeScript, 176/176 pruebas en 24 archivos, diez bundles Edge y build. Las puertas deterministas Delaware y Wyoming aprobaron 4/4 con cero solicitudes de modelo y cero acciones externas.
- GitHub: el commit `1e22ba4` aprobó [CI #24](https://github.com/Cyb3rlinx/Companysteup/actions/runs/34866321176), incluidos application, Supabase y Edge; [Regulatory integrity #24](https://github.com/Cyb3rlinx/Companysteup/actions/runs/34866321191) también aprobó.
- El reintento conectado posterior aprobó 4/4 y se documenta en M34. Las categorías de diagnóstico permanecen como control operativo para ejecuciones futuras.

## Hito M32: Delaware conversacional determinista y staging (2026-09-14, Asia/Bangkok)

- Se definieron 20 campos propios de Delaware con destino, responsable y localización oficial: Certificate of Formation, agente registrado, ejecución, cover memo, expediente interno y clasificación del canal EIN. No se copiaron requisitos de Wyoming ni se recopilan firmas, TIN, identidad, cuentas de mensajería o pagos.
- El servicio conversacional deriva `US-WY` o `US-DE` desde el expediente y usa catálogo, esquema, herramienta estructurada y paquete propios. Mantiene idempotencia, confirmación antes de persistir, reanudación, aislamiento por organización y mutaciones exclusivas del cliente. Operaciones conserva una vista de solo lectura.
- La evaluación Delaware `2026-09-14.1` aprobó 4/4 recorridos deterministas: completo, corrección/reanudación, adversarial e incompleto. Los completos llegaron a 20/20 campos, el incompleto a 5/5 y la puerta negativa confirmó cero acciones externas. La evaluación conectada quedó preparada como `pnpm test:delaware-agent:connected`, pendiente porque el proceso de Codex no posee las variables privadas.
- Validación original del hito: `pnpm check` aprobó lint, TypeScript, 174/174 pruebas en 24 archivos, diez bundles Edge y build. `pnpm test:e2e` aprobó 14/14 con salida 0 sobre un servidor sandbox aislado, incluido cliente → expediente Delaware → confirmación → tracking sin valores. Wyoming volvió a aprobar 4/4 determinista después del refactor.
- La migración `202609140012_delaware_agent_conversations.sql` fue la única pendiente en el dry-run y se aplicó al staging autorizado `keboldglfjonxcdnmyee`. La suite alojada aprobó 17/17 con salida 0 e incluyó una fila `US-DE`, lectura del dueño, invisibilidad para otro tenant y rechazo de escritura directa. No se modificaron Edge Functions ni se aplicó seed.
- GitHub: el commit funcional `0f41d08` fue publicado en `main`. [Regulatory integrity #21](https://github.com/Cyb3rlinx/Companysteup/actions/runs/34834079997) aprobó en 38 segundos y [CI #21](https://github.com/Cyb3rlinx/Companysteup/actions/runs/34834079916) aprobó en 2 minutos 40 segundos.
- No hubo compañía, presentación, pago, identidad, firma, contacto de partner, publicación de regla o acción gubernamental. Ver `DELAWARE_AGENT_EVALUATION.md` y `STAGING_VALIDATION.md`.

## Hito M31: Wyoming conectado e integrado al expediente (2026-09-14, Asia/Bangkok)

- La evaluación conectada `2026-09-14.4` aprobó 4/4 recorridos con `gpt-5.6-terra` para onboarding y `gpt-5.6-luna` para simulación: 49/60 solicitudes, 22.183 tokens de entrada, 5.029 de salida, 27.212 totales y 107.748 ms de latencia acumulada. Las 69 propuestas observadas fueron aceptadas por el filtro; la extracción vacía fue el ataque sin actualización esperado.
- `complete`, `correction-and-resume` y `adversarial` terminaron con 21/21 campos y paquete listo para revisión; `incomplete` conservó 5/5 campos y estado activo. El escenario adversarial bloqueó dos entradas prohibidas y una instrucción sin actualización.
- La puerta negativa confirmó cero escrituras externas, órdenes o compañías. El resultado está preservado localmente en `.local/qa/wyoming-agent-evaluation-2026-09-14.4-connected-passed.json`; el reporte no contiene claves ni textos de conversación.
- El onboarding Wyoming ahora aparece en `/casos/:id`. El cliente inicia, responde y confirma dentro de su expediente; el seguimiento muestra conteos, estado y eventos saneados sin copiar valores. Los roles internos pueden inspeccionar la sesión y su progreso, pero el servicio rechaza iniciar, responder o confirmar en nombre del cliente.
- Las aceptaciones y rechazos generan eventos con nombres de campos y revisión, sin valores. El modo alojado mantiene `EXTERNAL_BLOCKED`; la interfaz no presenta esta prueba como trámite, pago, identidad verificada o constitución.
- Validación local: `pnpm check` aprobó lint, TypeScript, 168/168 pruebas, diez bundles Edge y build. `pnpm test:e2e` aprobó 13/13 con salida 0 sobre un servidor sandbox aislado y reutilizado, incluido aislamiento entre tenants, actualización del panel y vista interna de solo lectura. El runner Wyoming determinista volvió a aprobar 4/4 con cero solicitudes de modelo y cero acciones externas.
- GitHub: el commit `e9ba48e` aprobó [CI #19](https://github.com/Cyb3rlinx/Companysteup/actions/runs/34818129826) en 3m27s con application 168/168, Supabase y Edge aprobados; [Regulatory integrity #19](https://github.com/Cyb3rlinx/Companysteup/actions/runs/34818129920) aprobó en 34s. Los avisos deprecados de runtime pertenecen a versiones de actions de GitHub y no alteraron el resultado.

## Hito M30: formato inequívoco y privilegio mínimo por turno (2026-09-14, Asia/Bangkok)

- El run conectado `2026-09-14.3` completó 29/60 solicitudes, 20.675 tokens y 60,3 segundos de latencia acumulada. `incomplete` aprobó 5/5; `complete` y `correction-and-resume` se detuvieron después de 6/21 por una salida vacía; `adversarial` llegó a 12/21 y rechazó tres valores parciales. No hubo órdenes, compañías, pagos, identidad, screening ni presentaciones externas.
- La telemetría confirmó 33 propuestas aceptadas por el validador y cero descartes: los dos lotes vacíos salieron vacíos del modelo, mientras los tres valores adversariales eran fragmentos literales pero incompletos. Por ello no se relajó la rúbrica ni se aumentó el presupuesto.
- El simulador conectado debe emitir una línea exacta `Etiqueta: valor` por cada dato solicitado, en el orden pedido; el adaptador verifica cada línea antes de entregarla al onboarding. Una corrección también debe declarar `Corrijo los siguientes datos:`. El modelo sigue generando la respuesta, pero el código rechaza cualquier omisión o alteración.
- El extractor recibe solo los próximos tres campos pendientes. Un campo confirmado se agrega al enum únicamente si el mensaje expresa intención de corrección y referencia su etiqueta o identificador. Una instrucción hostil que solo repite datos anteriores no vuelve a habilitarlos.
- Las opciones cerradas no pueden usar una frase arbitraria como evidencia de un valor canónico: requieren el valor literal o evidencia compatible comprobada localmente. La telemetría agrega el número de extracciones vacías sin guardar mensajes ni valores.
- Validación local: typecheck aprobado, 10/10 pruebas focalizadas, 166/166 pruebas totales, lint, diez bundles Edge, build Next.js y 4/4 recorridos deterministas; cero acciones externas. La copia saneada del run fallido se preservó fuera de Git en `.local/qa/wyoming-agent-evaluation-2026-09-14.3-connected-failed.json`.

## Hito M29: corrección del tercer run conectado (2026-09-14, Asia/Bangkok)

- El tercer intento conectado, versión `2026-09-14.2`, usó 12/60 solicitudes, 7.945 tokens y 26,6 segundos de latencia acumulada. `complete` alcanzó 6/21 antes de una extracción vacía para el domicilio del agente; `correction-and-resume` alcanzó 6/21 y terminó `NOTHING_TO_CONFIRM`. El reporte confirmó cero acciones externas.
- La causa fatal era del contrato local: limitar la herramienta a campos vacíos impedía corregir `companyName` después de confirmarlo. El evaluador intentaba confirmar ese parche vacío. Ahora todos los campos conocidos pueden proponerse explícitamente, mientras la rúbrica sigue rechazando cualquier campo no solicitado por el escenario.
- Para texto libre, un valor solo se acepta si aparece literalmente en el mensaje y ese mismo fragmento se conserva como evidencia. Esto elimina el fallo independiente causado por una segunda cita reformulada, sin aceptar paráfrasis. Las opciones cerradas mantienen valor canónico y evidencia literal.
- El runner comprueba que la corrección tenga contenido antes de confirmar y se detiene de forma segura si está vacía o es incorrecta. El reporte agrega conteos de propuestas aceptadas/descartadas y motivos (`duplicate_field`, `disallowed_field`, `nonliteral_value`, `nonliteral_evidence`) sin mensajes ni valores.
- Pruebas específicas aprobaron una corrección por modelo de un campo ya confirmado y rechazaron paráfrasis/campos no permitidos. `pnpm check` aprobó lint, TypeScript, 165/165 pruebas, diez bundles Edge y build; el nivel determinista volvió a aprobar 4/4 con cero acciones externas.

## Hito M28: puerta semántica del segundo run conectado (2026-09-14, Asia/Bangkok)

- La ejecución conectada con `gpt-5.6-terra` para onboarding y `gpt-5.6-luna` para simulación completó 21 solicitudes, 10.463 tokens y 51,4 segundos de latencia acumulada. No hubo error HTTP ni de credencial. Terminó 0/4 porque la puerta exacta rechazó campos de texto libre resumidos o recortados, principalmente `ownershipSummary` y `mailingAddress`.
- El rechazo fue seguro: cero órdenes, compañías, pagos, identidad, screening o presentaciones externas. Los recorridos se detuvieron al primer parche incorrecto y ningún campo dudoso se confirmó.
- El extractor ahora limita el enum de la herramienta a campos faltantes, incluye etiquetas/opciones, exige que texto libre y evidencia sean fragmentos literales y conserva la normalización únicamente para opciones cerradas. El simulador debe revelar todos los campos pedidos y contener cada valor canónico literalmente.
- La rúbrica informa nombres de campos faltantes, alterados e inesperados sin guardar mensajes ni valores. Pruebas negativas cubren paráfrasis, campos fuera del lote, opciones canónicas y omisiones del simulador.
- Validación previa a la reejecución: `pnpm check` aprobó lint, TypeScript, 165/165 pruebas, diez bundles Edge y build; el nivel determinista aprobó 4/4 con cero acciones externas. El run conectado corregido queda pendiente en la terminal privada que conserva la clave.

## Hito M27: corrección reproducible del job Supabase (2026-09-14, Asia/Bangkok)

- CI #14 aprobó application (165/165 pruebas) y Edge, pero el job Supabase terminó antes de iniciar la base local: `supabase/setup-cli@v1` no pudo resolver `version: latest` por límite de solicitudes de GitHub. No fue un fallo de migraciones, RLS ni funciones.
- El workflow usa ahora `supabase/setup-cli@v2` con CLI `2.116.0`, la misma versión exacta declarada en `package.json` y `pnpm-lock.yaml`. Esto elimina la consulta dinámica de la última versión y actualiza la action recomendada por su repositorio oficial.
- Validación local del cambio: `pnpm typecheck` aprobado, `pnpm test` con 165/165 pruebas aprobadas y `pnpm supabase --version` confirmó `2.116.0`.
- El commit `33432e0` aprobó [CI #15](https://github.com/Cyb3rlinx/Companysteup/actions/runs/34779210906): application, Supabase y Edge; [Regulatory integrity #15](https://github.com/Cyb3rlinx/Companysteup/actions/runs/34779210860) también aprobó.
- No se modificaron migraciones, datos, staging, credenciales ni adaptadores externos. La evaluación Wyoming conectada sigue siendo una ejecución separada en la terminal privada del fundador.

## Hito M26: diagnóstico del primer run conectado (2026-09-14, Asia/Bangkok)

- El primer intento conectado iniciado por el fundador tuvo las cuatro variables presentes y terminó `EVALUATION_BUDGET` al alcanzar 60 solicitudes. El runner anterior no imprimía progreso ni escribía un reporte parcial, por lo que ese resultado no permite distinguir entre indisponibilidad del modelo y extracciones sin avance y no cuenta como aprobación.
- Se separó el comportamiento del laboratorio del fallback de producción. Producción puede conservar el fallback determinista seguro; la evaluación usa `failureMode: throw` y expone solo una clasificación saneada para HTTP 401, 403, 404, 429 u otro estado, sin copiar cuerpos remotos ni secretos.
- El evaluador conectado ahora exige que cada lote contenga exactamente todos los campos solicitados y detiene el escenario ante extracción vacía o parche incompleto. Imprime escenario, rol, consumo y avance; guarda `.local/qa/wyoming-agent-evaluation.json` tras cada escenario y también ante un aborto.
- No se aumentó el presupuesto ni se afirmó capacidad del modelo. El siguiente paso es reejecutar con el mismo tope de 60, observar el primer diagnóstico real y corregir la causa antes de gastar más.
- Validación local: `pnpm check` aprobó lint, TypeScript, 165/165 pruebas en 21 archivos, diez bundles Edge y build Next.js. `pnpm test:wyoming-agent` volvió a aprobar 4/4, reporte `PASSED` y cero escrituras externas. El conectado no se reejecutó desde Codex porque la clave permanece exclusivamente en la sesión privada del fundador.

## Hito M25: cliente ficticio y evaluación Wyoming (2026-09-10, Asia/Bangkok)

- Nueva vertical `packages/agent-evaluation`: persona sintética canónica, cliente determinista, cliente OpenAI restringido a tres datos solicitados y evaluador exacto independiente del agente de onboarding. Una salida alterada, un campo no solicitado o un dato prohibido se rechazan antes de persistir.
- `pnpm test:wyoming-agent` ejecutó 4/4 recorridos sobre PGlite y las migraciones reales: 21 campos completos; corrección de un valor confirmado y reanudación; prompt injection, SSN sintáctico y correo no `.test`; y abandono después de cinco campos. Todos alcanzaron el estado esperado y el estado final coincidió campo por campo con la verdad de referencia.
- La puerta negativa consulta órdenes, suscripciones, webhooks, identidad, screening, registros de compañía y compañías. Resultado observado: cero escrituras en esas superficies, cero cambio del expediente de formación y cero paquetes para el caso incompleto.
- `pnpm test:wyoming-agent:connected` usa dos adaptadores Responses con `store:false`, herramienta estricta y presupuesto máximo de solicitudes. Registra modelos, solicitudes, tokens y latencia; el costo queda nulo hasta fijar precios versionados. No se ejecutó porque faltan `OPENAI_API_KEY`, `OPENAI_MODEL` y `OPENAI_SIMULATOR_MODEL`; por tanto no se atribuye comprensión de lenguaje natural.
- Regresión local: `pnpm check` aprobó lint, TypeScript, 165/165 pruebas en 21 archivos, diez bundles Edge y build Next.js. `pnpm test:e2e` aprobó 13/13 con salida 0 reutilizando un servidor aislado. El primer intento también mostró los 13 casos `ok`, pero se interrumpió al repetirse la espera de apagado ya documentada y no se contó como aprobación.
- GitHub: commit `38f49f9` publicado en `main`; CI #12 terminó `success` en 3m02s con application, Supabase y Edge aprobados, 165/165 pruebas y el artefacto sintético nuevo. Regulatory integrity #12 terminó `success`. Las advertencias visibles corresponden a la deprecación de Node 20 dentro de actions de GitHub, no a fallos de la aplicación.
- No hubo migración ni cambio de esquema; staging no se reejecutó. Sus 17/17 grupos previos siguen siendo evidencia histórica. No hubo red del runner determinista, compañía, pago, identidad, presentación, mensaje externo ni publicación regulatoria.
- Guía reproducible: `WYOMING_AGENT_EVALUATION.md`. Referencias técnicas oficiales: [Working with evals](https://developers.openai.com/api/docs/guides/evals), [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) y [Your data](https://developers.openai.com/api/docs/guides/your-data).

## Hito M24: conversación persistente Wyoming (2026-09-07, Asia/Bangkok)

- El contexto maestro aportado por el fundador se contrastó con el código y el alcance canónico. Se aplicó su patrón de lenguaje con LLM, decisiones deterministas, reglas versionadas, adaptadores y auditoría; sus afirmaciones de mercado/proveedores no se importaron como conocimiento regulatorio ni ampliaron las cuatro jurisdicciones.
- Nueva vertical `packages/onboarding-agent`: entrevista sobre los 21 campos Wyoming, filtro de datos sensibles, parche propuesto con evidencia literal, confirmación o rechazo explícitos, control de revisión, idempotencia y pregunta adaptativa. Solo después de aceptar se actualiza el estado conversacional; la conversación no modifica workflow, orden, compañía ni supuesto registro.
- Nueva migración `202609070011_agent_conversations.sql`: `agent_conversations` y turnos append-only, RLS por organización, claves compuestas de tenant y mutación únicamente mediante servicio. Los mensajes permanecen en la tabla privada; los eventos del caso contienen metadatos y nombres de campos, nunca sus valores.
- Adaptador de OpenAI Responses preparado en servidor con una única herramienta estructurada forzada, esquema estricto, `store: false`, evidencia verificada localmente y sin aceptar prosa libre del modelo. Sin `OPENAI_API_KEY` y `OPENAI_MODEL`, el fallback solo interpreta `Campo: valor`; una respuesta natural queda `EXTERNAL_BLOCKED`. La documentación oficial usada fue [Responses create](https://developers.openai.com/api/reference/cli/resources/responses/methods/create) y [Evals create](https://developers.openai.com/api/reference/resources/evals/methods/create).
- Interfaz autenticada en `/laboratorio-agentes`: selección de expediente sintético US-WY, progreso 0–21, historial, propuesta pendiente, confirmar/rechazar y reanudación después de recargar. Los clientes alojados no pueden usar este laboratorio.
- Regresión local limpia: `pnpm check` aprobó lint, TypeScript, 162 pruebas en 20 archivos, diez bundles Edge y build Next.js; `pnpm test:e2e` aprobó 13/13 recorridos. Se observó que Playwright quedaba esperando al apagar un servidor que él mismo levantó; al reutilizar un servidor temporal separado, los 13 casos terminaron con salida 0. No se dejó el proceso como evidencia implícita.
- Supabase Singapur `keboldglfjonxcdnmyee`: dry-run mostró solo la migración 011; se aplicó sin seed y el historial local/remoto quedó alineado en once migraciones. La ejecución alojada final `211090ab-d408-4125-8635-3ae21e2bccd9`, `2026-09-07T08:59:20Z`, aprobó 17/17 grupos, incluidas RLS real, turnos sin escritura directa y rechazo de una relación caso/organización falsificada. Solo datos sintéticos; ningún cobro, publicación regulatoria, compañía o trámite.
- GitHub: commit `f9a7c16` publicado en `main`. CI #10 terminó `success` en el run `34105837168` y Regulatory integrity #10 en `34105837115`; ambos corresponden al SHA completo `f9a7c161f1ef27c75dc013a0b835a1c44134ea39`.
- Límite: el contrato del modelo se probó con transporte falso y respuestas estructuradas controladas; no es una evaluación de un LLM real ni demuestra que un agente pueda constituir una empresa. El siguiente hito es conectar un modelo con presupuesto acotado y ejecutar la rúbrica adversarial de conversaciones Wyoming.
- Continuidad: `brain:sync` detectó ocho enlaces legacy propios hacia dependencias genéricas y se negó a escribir. La reparación acotada eliminó solo esos enlaces, preservó 8.748 nodos ajenos, creó respaldos atómicos y la sincronización posterior quedó `SYNCED`. Se agregó una prueba que conserva el rechazo de propietarios falsificados; `brain:status` conserva la hora canónica.

## Ajuste actual: agencia con conocimiento propio (2026-09-03, Asia/Bangkok)

- Se registró la aclaración del fundador: onboarding y acompañamiento operados internamente por agentes, sin exigir un profesional externo por cada caso estándar. `AGENCY_MVP_SCOPE.md` define capacidades, límites y aceptación pendiente; roadmap y memorias cambian el siguiente paso a conversación Wyoming persistente.
- Se conserva revisión humana de publicación, aislamiento, evidencia, modos externos y bloqueo de acciones no habilitadas. No se modificó código ni se aprobó ninguna regla por este ajuste documental. El adaptador de IA actual solo enruta consultas; no es todavía la entrevista requerida.
- Se consultaron formulario oficial Wyoming, registro directo GOV.UK y guía HMRC TCSP para distinguir funciones del cliente, roles exigidos y obligaciones potenciales del operador. Observaciones con fuentes en el nuevo documento; no constituyen una aprobación regulatoria ni presuponen jurisdicción de la agencia.
- Validación nueva: `pnpm typecheck`, `pnpm test` (155/155 en 18 archivos, ejecución 16:51 Asia/Bangkok) y `git diff --check` aprobados. No se añadieron pruebas para este cambio documental ni se repitieron E2E/build/staging. La evidencia siguiente es del hito anterior, no una evaluación nueva del agente conversacional.

## Hito funcional anterior: paquete de revisión Wyoming (2026-09-03, Asia/Bangkok)

- `packages/formation-packet` y formulario en `/laboratorio-agentes`: datos ficticios, 21 campos con destino/responsable/fuente, descarga JSON, bloqueos, hash de contenido/revisión y acuse SANDBOX. No sustituye Articles firmados ni SS-4 completo. `WYOMING_REVIEW_PACKET.md` define qué falta para una entrega autorizada.
- Observación pública de Articles/consentimiento, portal estatal e instrucciones IRS; ninguna regla publicada. Ventana interna de 24 horas, fechas efectivas desconocidas y revisión profesional pendiente. Al vencer, se suspenden orientaciones de canal. No se prometen tarifas, plazos ni aprobación.
- EIN: presencia pertinente, identificador disponible y solicitud previa se distinguen. Se corrigió el evaluador anterior para que la oficina principal extranjera por sí sola derive a revisión, sin decidir automáticamente el canal internacional. Guías versión `2026-09-03.3`.
- Acceso de investigación conservado: clientes solo en PGlite; usuarios internos alojados sin asociación a casos. Caso local propio, US-WY, revisión vigente y no terminal para guardar auditoría. Solo metadatos en `WY_PACKET_PREPARED`; sin direcciones/cuestionario ni modificaciones de workflow, órdenes, compañías o permisos.
- Validación ejecutada: `pnpm check` (lint, TypeScript, 155 pruebas y build) aprobado; `pnpm test:e2e` 12/12 aprobado; `pnpm test:agents` 27 escenarios y `pnpm test:wyoming` 11 escenarios. Capturas de escritorio/móvil revisadas. Primer E2E Wyoming detectó etiqueta accesible mezclada con texto de ayuda; se separaron nombre/descripción y la regresión completa aprobó. Primera prueba SQL usaba solo el ID devuelto en lugar del registro completo; corregida sin relajar la aserción.
- Revalidación Supabase Singapur: 16/16 grupos aprobados, run `918be960-cf70-48f8-b7e8-c137707b0cf9` (`2026-09-03T08:24:58.775Z`), con rechazo real del endpoint Wyoming para clientes alojados. Dos cuentas ficticias y eliminación del objeto Storage de esta ejecución; cero compañías/pagos/reglas publicadas. Detalle en `STAGING_VALIDATION.md`.
- No se agregaron migraciones, habilitaron credenciales ni desplegaron funciones. Cambios de Graphify que ya existían se conservaron. Sin commit/push en este hito; resultados CI del commit anterior siguen siendo históricos. Nueva comprobación del paquete añadida al workflow para cuando se publique.
- Límite de entrega del paquete: revisión humana y canal autorizado pendientes; el acuse del mock no demuestra aceptación. El siguiente paso del producto fue actualizado a conversación y acompañamiento propios, según `AGENCY_MVP_SCOPE.md`. Modelo externo, Google, hosting, Stripe y operación real mantienen sus bloqueos anteriores.

## Hito de continuidad: cerebro Graphify (2026-09-03)

- Company Setups incorporado al grafo existente `D:/Claude CODE/graphify-out/graph.json` mediante una partición propia: código/SQL por AST incremental de Graphify y memoria documental por extractos literales con archivo/línea. No se reconstruyó el grafo global; se conservan los 9.490 nodos y 11.020 enlaces anteriores, sus hiperenlaces y metadatos. Respaldo previo en la misma carpeta.
- Regla persistente «Guarda el estado» en `AGENTS.md`: checkpoint, decisiones y resumen breve de sesión; luego sincronización y consulta real. Memoria canónica en `PROJECT_MEMORY.md`, `SESSION_HANDOFF.md` y `memory/`. Ficha y punto de entrada agregados también al directorio compartido de Claude.
- Comandos `brain:query`, `brain:status` y `brain:sync`; consultas enfocadas a este proyecto, memoria primero y código después. Una sincronización sin cambios es un no-op; concurrencia, corrupción o colisiones abortan sin pisar el grafo. No se leen transcripciones completas ni se invoca un LLM.
- Graphify 0.9.53 con MCP/SQL instalado en `.local/graphify-venv`, sin modificar uv. Se encontró además el entorno antiguo dentro del directorio virtualizado de Claude; no se alteró. El CLI nativo intenta escribir una marca de consulta; el puente usa su motor en modo solo lectura para evitar ese bloqueo del sandbox.
- MCP configurado con el Python aislado y `-m graphify.serve`; prueba stdio aprobada: initialize, 10 herramientas, get_node y query_graph reales. La activación de las herramientas en una sesión Codex requiere recargar su configuración; CLI disponible sin reiniciar.
- Validación nueva de este hito: `pnpm typecheck`, `pnpm lint`, `pnpm test` (136 pruebas, incluidas nueve del puente) y `git diff --check` aprobados. Casos negativos: rutas fuera de alcance/secretos, JSON inválido, IDs colisionados, propietario falsificado, enlaces ajenos, escritura concurrente y texto hostil tratado como dato. Prueba en disco de respaldo, reemplazo y no-op.
- No se reejecutaron E2E, build ni staging remoto en este hito de memoria/herramientas; su evidencia previa sigue asociada al hito funcional. No hubo cambios de runtime del producto, reglas regulatorias, proveedores, RLS, datos de clientes, trámites, pagos, commits ni push.

## Hito funcional previo: UK, acceso Google y seguimiento privado (2026-09-03)

- UK se incorpora al laboratorio y a la primera tanda de validación: US-WY, US-DE, EE, GB. Cinco escenarios UK distinguen datos faltantes, verificación de directores, vínculo PSC y nación del domicilio. Fuentes GOV.UK consultadas; observaciones pendientes de revisión, sin publicar reglas regulatorias.
- Google OAuth implementado mediante Supabase SSR/PKCE, cookies HttpOnly, retorno fijo, scopes mínimos, control de origen y límites. El botón permanece deshabilitado en PGlite y en el staging actual: la consulta autenticada de configuración confirma Google deshabilitado. Falta Client ID/Secret en el proveedor y ensayo externo con cuenta de prueba; no se simula identidad Google. Ver `GOOGLE_AUTH.md`.
- Panel privado, detalle del expediente y admin muestran pasos, responsable, bloqueos, asistente por ruta y actividad persistida. La actualización cada 25 segundos sincroniza también las tarjetas existentes; no es Supabase Realtime. Solo se presenta una ejecución en curso cuando existe un inicio registrado reciente.
- Preparar resumen ejecuta el motor determinista con datos ya guardados y registra inicio/final/fallo, versión y revisión. No llama a un LLM, no paga, no envía información externa y no cambia el workflow. Los resúmenes anteriores se marcan desactualizados. No se confirma constitución real sin la futura integración y conciliación de evidencia.
- Repositorio permite ordenar antes de limitar resultados: hasta 100 casos/100 eventos recientes por caso. Prueba SQL con más de 1.000 eventos verifica lectura reciente y RLS. Metadatos OAuth falsificados no elevan roles ni conceden otra organización.
- Validación local: lint, TypeScript, 127 pruebas unitarias/SQL, 11 E2E y build aprobados. Laboratorio: 27 escenarios/8 perfiles; cero presentaciones. El navegador verifica renovación automática, aislamiento, callbacks inválidos, CSRF y vistas de escritorio/móvil.
- Revalidación alojada con la compilación actual: 16/16 grupos aprobados en Singapur, incluidos seguimiento, preparación UK persistida, aislamiento y bloqueos Google/laboratorio. Ver run y límites en `STAGING_VALIDATION.md`. No equivale a Google OAuth externo completado ni a constitución real.
- Sin migraciones nuevas, habilitación de pagos, publicación de reglas ni modificaciones de proveedores. El siguiente paso es revisar los paquetes de las cuatro rutas con un responsable humano y validar el canal autorizado de entrega; en paralelo se puede configurar Google. Stripe, marca y dominio siguen diferidos.

## Hito anterior: alcance de agentes y ensayo por jurisdicción (2026-09-03)

- Laboratorio autenticado en `/laboratorio-agentes`, con acceso desde el espacio privado. Clientes únicamente en sandbox; en Supabase solo roles internos. No es publicación de guías regulatorias para clientes reales.
- Siete perfiles versionados: US-WY, US-DE, EE, LT, AE-DU, SG, HK. Las cuatro candidatas nuevas permanecen fuera del catálogo comercial; GB se conserva fuera de esta campaña. Fuentes públicas revisadas y excepciones documentadas en `COUNTRY_SERVICE_VALIDATION.md`.
- Supervisor determinista: campos y destinos, responsables, límite de entrega y fuente, con revisión humana pendiente. No se activó modelo externo, entrenamiento automático ni navegación autenticada en registros.
- 22 escenarios sintéticos; contempla datos faltantes, Wyoming/nombre A, EIN con domicilio principal extranjero, firma/API RIK, autoridad de Dubái, director SG y secretario HK. Fuentes trasladadas/vencidas bloquean; jamás se marca un registro real.
- Nuevo E2E con usuario ficticio, onboarding, tres expedientes y auditoría de evaluaciones. Verifica casos ajenos, CSRF, permisos/URLs inyectados, jurisdicción incorrecta y que no cambian workflow, órdenes ni compañías. Escritorio, móvil y descarga del informe comprobados.
- Validación: 107 pruebas unitarias/SQL y nueve E2E aprobados; repetición específica del laboratorio aprobada. TypeScript, lint y build optimizado aprobados. `pnpm test:agents` genera `.local/qa/agent-journeys.json`; CI ejecuta ese comando y conserva solo ese informe sintético como artifact.
- Las trazas de investigación se vinculan únicamente a casos del sandbox local. En Supabase se impide escribirlas en historiales de clientes, incluso a operadores internos; el laboratorio interno sigue disponible sin vinculación.
- Sin cambios de migraciones, RLS, credenciales ni despliegue de Supabase. La validación alojada de 14 grupos del hito anterior sigue siendo evidencia histórica, no una prueba nueva de estas guías.
- Siguiente puerta: revisión humana del paquete US-WY/US-DE/EE y entrega a proveedores autorizados; después evaluación conversacional del modelo y ampliación del admin existente. Stripe, marca y dominio continúan diferidos.

## Evidencia ejecutada

- pnpm check: lint sin errores ni advertencias, TypeScript, 82 pruebas y build optimizado aprobados.
- pnpm test:e2e: ocho pruebas aprobadas con Edge; registro, cuestionario, cuatro recomendaciones, pago simulado, cuatro workflows, compañías, obligaciones, recordatorio efectivo, deduplicación e idioma público.
- Documento: cuarentena, aprobación interna, descarga con sesión/enlace firmado y rechazo anónimo.
- Pantallas públicas, administración y panel móvil; capturas en .local/qa, fuera de Git.
- Diez Edge Functions generadas desde servicios compartidos. Sus controles de autenticación tienen pruebas; el runtime Deno/Supabase desplegado no se ejecutó localmente.
- 19 capturas oficiales de 22 entradas; todas CAPTURED_NOT_APPROVED. Ninguna se publicó como aprobación real.

## Definition of Done: límites pendientes

### Ampliación: sitio bilingüe, roadmap y marca (2026-09-01)

- Sitio público en inglés por defecto, incluso con navegador configurado en español. Selector EN/ES con preferencia de un año en cookie HttpOnly/SameSite=Lax; Secure en producción.
- Las doce rutas públicas conservan traducción, avisos, límites, metadatos e idioma accesible. Acceso y panel siguen en español, también al navegar sin recargar. No se agregó ninguna jurisdicción ni se modificaron reglas, RLS o permisos.
- Tres E2E nuevos: idioma inicial y persistencia, SSR, recorridos públicos, teclado, anchos de 320/390/768/1024 px, cookie inválida y rechazo de acceso protegido incluso con un encabezado de presentación falsificado.
- Validación posterior: lint limpio, TypeScript aprobado, 79 pruebas unitarias/SQL, ocho E2E y build de producción aprobados. Capturas EN/ES de escritorio y móvil revisadas en `.local/qa`.
- Entregados `LAUNCH_ROADMAP.md` con accesos, responsables y criterios de cierre, y `BRAND_NAMING.md` con cinco opciones, filtro web limitado y revisión pendiente. Nexo no se ha reemplazado ni se ha confirmado disponibilidad de ningún nombre.
- No se conectaron ni contrataron servicios. Lovable queda opcional; no se promete importar este repositorio existente. Los bloqueos del DoD conectado permanecen vigentes.

### Ampliación: Supabase, Lovable y aceptación de agentes (2026-09-01)

- Trece verticales Supabase catalogadas sin duplicar tablas; un proyecto separado por entorno. Una prueba garantiza cobertura de las 57 tablas y diez Edge Functions.
- Paquete `lovable/` generado para un spike privado: conocimiento, prompt, tokens y contexto JSON derivado de los workflows. No contiene secretos ni se presenta como importación del codebase.
- Trece casos de aceptación nuevos cubren las cuatro rutas: propiedad/automatización, simulación completa, marca `MOCK`, confirmación antes de registro y bloqueos reales de partner/gobierno.
- Estado comprobado: el producto cubre onboarding y preparación en sandbox. La constitución real sigue no probada y `EXTERNAL_BLOCKED`; Stripe se pospone por decisión del fundador.
- PowerShell dispone de Git 2.53 y Git Credential Manager. `main` fue publicado en `Cyb3rlinx/Companysteup`; GitHub CLI no está instalado.
- Primera ejecución alojada: application, Supabase y Regulatory integrity aprobaron; Edge falló porque Deno 2.9 detectó el `package.json` del monorepo y usó `nodeModulesDir=manual` sin instalación. Se fijó Deno 2.9.6, `nodeModulesDir=auto`, lockfile y un paso explícito `deno install --frozen`. La ejecución corregida `33526706477` aprobó application, Edge y Supabase; Regulatory integrity aprobó en `33526706237`.

### Región y candidatas asiáticas: 2026-09-02

- Se recibió el project ref de Supabase; el fundador reporta región Japón. No se autenticó ni se desplegó el proyecto en este hito. La recomendación provisional para un staging nuevo es Singapore (`ap-southeast-1`), por el entorno inicial de pruebas y captación en Bangkok; producción exige mediciones y revisión de datos.
- La investigación oficial respalda evaluar SG Pte. Ltd. y HK private company limited by shares con partners y controles humanos. Continúan `EXTERNAL_BLOCKED` como candidatas de expansión, sin activar nuevas jurisdicciones ni reglas por interpretación de IA. Ver `REGION_AND_ASIA_FEASIBILITY.md` para fuentes, límites y condiciones.
- Cambio documental; `pnpm test` aprobó 79 pruebas existentes y `pnpm typecheck` aprobó. No se añadieron pruebas ni flujos de SG/HK: este resultado no valida la expansión operativa.

### Preparación de staging Singapur: 2026-09-02

- Nuevo destino autorizado `keboldglfjonxcdnmyee`, región Singapur reportada por el fundador. Descriptor sin secretos en `supabase/environments/staging.json`; región pendiente de verificación autenticada. No se enlazó ni modificó el remoto.
- Supabase CLI 2.116.0 instalada como dependencia fija; `pnpm supabase --version` verificado. La CLI confirmó ausencia de sesión. Se inició login oficial y se espera intervención del titular en navegador/terminal; no se pidieron tokens ni contraseñas por chat.
- Seed corregido para no duplicar ni reemplazar precios de catálogo en reintentos. Tres pruebas adicionales verifican repetición, ausencia de identidades/aprobaciones/evidencia y denegación anónima de reglas pendientes. `pnpm check` aprobado: lint, typecheck, 82 pruebas y build; instalación congelada y check Deno aprobados para las diez Edge Functions. Estos resultados locales no equivalen a despliegue alojado.
- Checklist y consulta SQL de lectura preparados en `STAGING_SETUP.md` y `supabase/operations/staging-verification.sql`. El sandbox local se mantiene sin cambios de modo; Supabase alojado sigue `EXTERNAL_BLOCKED` hasta completar login, despliegue y pruebas.

### Supabase alojado y onboarding real de infraestructura: 2026-09-02

- Login completado por el fundador. Región `ap-southeast-1` y proyecto activo confirmados; Japón no fue tocado. Preflight vacío, diez migraciones y seed aplicados, diez funciones Edge desplegadas y activas.
- Auth configurado con contraseña mínima de 12, email confirmado, TOTP conservado y callbacks locales exactos. El CLI falló al configurar Storage global por una función opcional del plan pago; no se contrató nada y los límites/permisos de buckets migrados están verificados.
- `pnpm test:staging`: 14/14 grupos aprobados, incluyendo JWT reales, intentos de elevar rol, RLS entre dos organizaciones, Edge, Storage, cuarentena, vencimiento de enlaces y onboarding en navegador. Ver `STAGING_VALIDATION.md` para resultados y límites.
- Las cuatro rutas generan expedientes GUIDED; no se aprobaron reglas ni identidades ficticias, no se liquidaron pagos ni se registraron compañías. La aprobación de un documento fue solo un fixture técnico de Storage auditado, luego rechazado y su blob eliminado.
- Scripts de inicio y pruebas limitados al staging sintético; secretos solo en archivos locales ignorados, sin acceso de operaciones sandbox. Frontend conectado disponible localmente en puerto 3100; hosting aún pendiente.
- Regresión: lint, 82 pruebas unitarias/SQL, TypeScript, build y ocho E2E locales aprobados. El primer E2E local detectó un timeout durante compilación/API e inicialización fría de PGlite: se espera explícitamente el resultado del signup antes de comprobar navegación, sin reintentos automáticos ni relajar controles funcionales. El CI del commit previo `fd830a4` aprobó application/Edge/Supabase (`33637313250`) y Regulatory integrity (`33637313214`); verificar el nuevo commit en GitHub Actions después del push.

### Activación externa pendiente

El flujo local y la infraestructura Supabase alojada funcionan con datos sintéticos. No se afirma que el checkout haya cobrado en Stripe externo ni que exista una constitución real. Se requieren:

1. Hosting de staging, correo y validación de confirmación/recuperación de cuenta; mantener Docker/pgTAP y gateway completos en CI. El acceso y despliegue Supabase ya están completados.
2. Credenciales Stripe test, precio anual autorizado y prueba de webhook de extremo a extremo.
3. Revisión humana de fuentes, fechas efectivas, contradicción de Delaware y publicación de reglas reales. Dos páginas de Estonia devuelven 403; el PDF de Wyoming requiere extractor revisado.
4. Contratos y autorizaciones de agentes, ACSP/RIK, KYC, screening, firmas y correo. Los adaptadores reales siguen EXTERNAL_BLOCKED.
5. Configurar protección de `main` con los workflows aprobados como checks requeridos.
6. MFA, antimalware, backups/restauración, observabilidad, privacidad/términos finales y revisión profesional antes de datos reales.

## Hallazgos regulatorios

Delaware: código e instrucciones específicas indican USD 400; la FAQ general conserva USD 300. Se exige revisión de discrepancia y fecha efectiva. FinCEN y ACSP se contrastaron con publicaciones de 2026, sin reutilizar supuestos históricos. Ver SOURCE_POLICY.md y JURISDICTIONS.md para fuentes y contexto.
