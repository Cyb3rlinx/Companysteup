# Punto de continuidad

Actualizado: 2026-09-15, 17:28 (Asia/Bangkok, UTC+7). Este archivo conserva el estado de trabajo; no programa tareas futuras ni mantiene servidores activos.

## Checkpoint actual: UK conectado aprobado; regresión y operaciones listas

- UK `2026-09-15.1` aprobó 4/4 conectada con `gpt-5.6-terra` y simulador `gpt-5.6-luna`: 55/60 solicitudes, 30.578 tokens, 133.670 ms acumulados, 72/72 propuestas aceptadas, una extracción vacía adversarial esperada y cero acciones externas. El reporte saneado se preservó en `.local/qa/uk-agent-evaluation-2026-09-15.1-connected-passed.json`.
- `pnpm test:agent-regression` ejecuta los cuatro evaluadores determinísticos actuales, exige versión exacta, 4/4 y cero escrituras, y genera un informe agregado. La ejecución aprobó los cuatro; CI fue actualizado para sustituir la prueba aislada de Wyoming y conservar los cinco reportes.
- El admin muestra calidad conectada por ruta y seguimiento por expediente: estado de atención, próximo campo sin valor, excepciones, responsable, evento reconocido y SLA interno. El cliente no recibe el registro de calidad ni razones privadas de escalamiento.
- Delaware, Estonia y UK tienen evidencia conectada vigente. Wyoming queda `REVALIDATION_REQUIRED`: el reporte conectado aprobado corresponde a `2026-09-14.4`, mientras el evaluador actual es `2026-09-14.5` por el cambio de transporte compartido.
- `pnpm check` aprobó lint, TypeScript, 194/194 pruebas, diez bundles Edge y build. Playwright aprobó 16/16 con un servidor sandbox aislado y reloj fresco. La regresión de agentes aprobó 4/4 evaluadores y 16/16 escenarios con cero acciones externas.
- No se repitió staging: no cambió esquema, RLS ni Edge; las catorce migraciones y 17/17 grupos alojados del hito UK siguen siendo evidencia histórica. Ningún recorrido firma, cobra, verifica identidad, contacta un partner, presenta ante una autoridad o constituye una compañía.
- Próxima puerta concreta: repetir `corepack pnpm test:wyoming-agent:connected` desde la PowerShell privada con límite 60. Si pasa 4/4 y cero acciones externas, registrar evidencia `2026-09-14.5`; después avanzar a Google OAuth alojado y preparación del hosting/piloto.

## Detalle histórico reciente

- Wyoming permanece aprobado 4/4 conectado en `2026-09-14.4` e integrado al expediente. El reporte aprobado sigue en `.local/qa/wyoming-agent-evaluation-2026-09-14.4-connected-passed.json`, ignorado por Git.
- Delaware conserva el catálogo `2026-09-14.1` de 20 campos con fuentes, destinos y responsables. La evaluación `2026-09-14.2` aprobó 4/4 conectada. No recopila firmas, TIN, documentos de identidad, cuentas de mensajería o pagos.
- Estonia incorpora catálogo `2026-09-14.1` de 24 campos propios con fuentes RIK/e-Residency, destinos, responsables y paquete `DRAFT_NOT_FOR_FILING`. Códigos personales, PIN2, credenciales, firma, capital, tasa y presentación quedan fuera del agente.
- El motor conversacional deriva `US-WY`, `US-DE`, `EE` o `GB` del expediente y selecciona esquema, herramienta estructurada y paquete propios. El cliente inicia, responde, confirma y retoma; operaciones solo lee.
- El tracking expone jurisdicción, estado, modo, conteos y fecha; no copia valores. Los eventos contienen nombres de campos y revisión, nunca las respuestas.
- La evaluación Delaware determinista aprobó 4/4: completos 20/20, incompleto 5/5, corrección/reanudación y adversarial. Cero solicitudes de red y cero acciones externas. Reporte local: `.local/qa/delaware-agent-evaluation.json`.
- Para el hito UK, `pnpm check` aprobó lint, TypeScript, 188/188 pruebas, diez bundles Edge y build. `pnpm test:e2e` aprobó 16/16 sobre un sandbox aislado con fuente sintética fresca.
- La evaluación Estonia determinista aprobó 4/4: tres recorridos 24/24 y paquete revisable; incompleto 5/5 y activo; corrección/reanudación; instrucción hostil sin actualización; SSN, PIN2 y correo real bloqueados. Cero solicitudes de modelo y cero acciones externas.
- El primer run Estonia conectado `2026-09-14.1` aprobó 2/4 y falló cerrado tras 27/60 solicitudes con cero acciones externas. En completo y adversarial el extractor omitió `financialYear` dentro del primer lote, aunque los campos presentes fueron exactos; la evaluación rechazaba cualquier parche parcial.
- La evaluación `2026-09-15.1` acepta solo el subconjunto literalmente exacto si no hay valores incorrectos ni campos inesperados, deja los omitidos pendientes y los reintenta. Un parche vacío o inseguro todavía detiene el escenario. `pnpm check` aprobó 182/182 pruebas y build; el runner determinista volvió a aprobar 4/4.
- La corrección `0bfd3bd` está publicada en `main`. [Regulatory integrity #29](https://github.com/Cyb3rlinx/Companysteup/actions/runs/34941413229) aprobó en 40 segundos y [CI #29](https://github.com/Cyb3rlinx/Companysteup/actions/runs/34941413039) aprobó en 3 minutos con application, Supabase y Edge.
- Las migraciones 013 y 014 se aplicaron secuencialmente al staging Singapur `keboldglfjonxcdnmyee`, cada una después de un dry-run que mostró solo ese cambio, sin seed ni Edge. La revalidación más reciente aprobó 17/17 con conversaciones Delaware, Estonia y UK y aislamiento RLS explícito.
- El run conectado aprobado usó 49/60 solicitudes, 21.820 tokens de entrada, 4.714 de salida, 26.534 totales y 111.369 ms acumulados. Los completos llegaron a 20/20; el incompleto quedó activo con 5/5.
- El filtro aceptó 66 propuestas, rechazó cero y registró una extracción vacía adversarial esperada. Se bloquearon dos entradas sensibles/no sintéticas y una instrucción sin actualización. La puerta negativa confirmó cero escrituras externas, órdenes o compañías.
- El transporte `2026-09-14.6` usa timeout de 45 segundos, `X-Client-Request-Id` y categorías saneadas para timeout, red, HTTP, JSON y esquema. No reintenta automáticamente ni guarda cuerpos, claves o respuestas. Delaware ya aprobó con este contrato.
- El arreglo `1e22ba4` aprobó [CI #24](https://github.com/Cyb3rlinx/Companysteup/actions/runs/34866321176) con application, Supabase y Edge, además de [Regulatory integrity #24](https://github.com/Cyb3rlinx/Companysteup/actions/runs/34866321191).
- El reporte Delaware aprobado está preservado en `.local/qa/delaware-agent-evaluation-2026-09-14.2-connected-passed.json`; el reporte Estonia determinista está en `.local/qa/estonia-agent-evaluation.json`. Ambos están ignorados por Git y no contienen claves ni conversaciones.
- Fuera de sandbox el agente permanece `EXTERNAL_BLOCKED`. Ninguna prueba firma, cobra, verifica identidad, contacta un partner, presenta ante una autoridad o constituye una compañía.
- El hito funcional Delaware está publicado en `0f41d08`. [Regulatory integrity #21](https://github.com/Cyb3rlinx/Companysteup/actions/runs/34834079997) aprobó en 38 segundos y [CI #21](https://github.com/Cyb3rlinx/Companysteup/actions/runs/34834079916) aprobó en 2 minutos 40 segundos.
- El hito funcional Estonia está publicado en `0b3b463`. [Regulatory integrity #27](https://github.com/Cyb3rlinx/Companysteup/actions/runs/34871625791) aprobó en 35 segundos y [CI #27](https://github.com/Cyb3rlinx/Companysteup/actions/runs/34871625643) aprobó en 2 minutos 54 segundos con application, Supabase y Edge.
- Para lanzamiento siguen pendientes operador/jurisdicción de la agencia, responsable interno, Google externo, hosting definitivo, Stripe y partners. No bloquean la puerta conectada Estonia ni el desarrollo posterior de UK.

## Hito anterior: paquete Wyoming (2026-09-03, Asia/Bangkok)

- Se siguió el orden solicitado y se completó el paquete técnico de preparación Wyoming: 21 campos, mapa de destino/fuente, bloqueos por datos/canal y descarga JSON. Implementación en `packages/formation-packet` y laboratorio autenticado. Documento de entrega: `docs/WYOMING_REVIEW_PACKET.md`.
- El ejemplo es ficticio y el acuse SANDBOX; ninguna compañía fue presentada ni aceptada. Solo metadatos auditables pueden vincularse a un caso local propio US-WY con revisión explícita. Clientes alojados no acceden al paquete pendiente de revisión.
- Decisión: no guardar domicilios/respuestas en eventos y no convertir casillas declaradas en verificaciones. Se separó elegibilidad EIN de la ubicación de la oficina principal; fuentes observadas el 3 de septiembre, con reconsulta interna en 24 horas y aprobación humana pendiente.
- Pruebas nuevas realmente ejecutadas: `pnpm check` (155 pruebas, lint, TypeScript y build), 12 E2E, 27 escenarios generales y 11 escenarios Wyoming. Capturas e informe en `.local/qa`. Ver resultados alojados en `BUILD_STATUS.md` / `STAGING_VALIDATION.md`.
- Supabase: 16/16 grupos aprobados en el run `918be960-cf70-48f8-b7e8-c137707b0cf9`, incluyendo rechazo del paquete Wyoming para clientes alojados. Únicamente datos sintéticos; sin presentación, cobros o publicación de reglas.
- Límites conservados: paquete pendiente de revisión humana y entrega externa no validada. Sigue sin LLM conectado, Google externo validado, hosting definitivo, pagos ni registros reales. No se hicieron commits, push ni despliegues; preservar también los cambios Graphify locales previos.
- La prioridad de obtener primero revisión profesional/contrato de proveedor quedó sustituida por el checkpoint actual de agencia. La evidencia del paquete no demuestra aceptación externa ni expediente listo para presentar.

## Base histórica validada

- Repositorio: `Cyb3rlinx/Companysteup`, rama `main`. Último hito de implementación: `c9d0ef7` (UK, Google OAuth y seguimiento privado), publicado en GitHub.
- CI del hito: [33683581914](https://github.com/Cyb3rlinx/Companysteup/actions/runs/33683581914), application/edge/supabase aprobados. [Regulatory integrity 33683581953](https://github.com/Cyb3rlinx/Companysteup/actions/runs/33683581953) aprobado. Esta evidencia corresponde al commit indicado, no a cambios futuros.
- Validaciones: lint, TypeScript, build, 127 pruebas unitarias/SQL, 11 E2E, 27 escenarios del laboratorio y 16 grupos de integración Supabase aprobados. Detalle en `BUILD_STATUS.md` y `STAGING_VALIDATION.md`.
- No se ha constituido ninguna compañía real. No se han activado cobros ni aprobado reglas regulatorias reales.

## Decisiones que se conservan

- Conversación y panel en español LATAM; sitio público en inglés por defecto con selector español.
- Productos activos: Wyoming LLC, Delaware LLC, Estonia OÜ y UK Ltd. Orden de validación: US-WY → US-DE → EE → GB.
- Laboratorio interno: ocho rutas, incluidas LT, Dubái, SG y HK únicamente como investigación. No ampliar el catálogo comercial sin completar sus condiciones.
- Panel cliente, detalle de caso y admin muestran progreso, responsable, bloqueos y eventos persistidos; consulta automática cada 25 segundos. El preparador es determinista: no es un agente autónomo ni una presentación ante la autoridad.
- Google OAuth está implementado con Supabase SSR/PKCE, pero el proveedor sigue deshabilitado. No simular acceso Google. Configuración y prueba pendiente en `GOOGLE_AUTH.md`.
- Stripe, nombre definitivo y dominio siguen diferidos. Lovable es un spike pendiente de acceso y paridad; el repositorio Next.js sigue siendo la referencia.

## Retomar por aquí

1. Consultar primero `pnpm brain:query "Company Setups punto de continuidad siguiente paso"` (o MCP graphify) y comprobar `pnpm brain:status`. Leer este checkpoint o fuentes puntuales solo si faltan datos o hay cambios; no releer conversaciones completas.
2. Ejecutar `corepack pnpm test:wyoming-agent:connected` desde la PowerShell privada que conserva `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_SIMULATOR_MODEL` y límite 60. No compartir la clave por chat.
3. Si Wyoming `2026-09-14.5` aprueba 4/4 y cero acciones externas, preservar el reporte y actualizar el registro operativo para dejar 4/4 versiones conectadas vigentes. Si falla, diagnosticar sin relajar la puerta ni elevar gasto a ciegas.
4. Configurar Google OAuth dentro de Supabase mediante un canal seguro y probar Google → Supabase → callback → panel.
5. Preparar hosting y piloto supervisado con alcance del operador, responsable interno, colas/excepciones y datos exclusivamente sintéticos hasta completar seguridad y servicios externos aplicables.

## Entornos y datos

- Único Supabase autorizado: `keboldglfjonxcdnmyee`, Singapur (`ap-southeast-1`), exclusivamente datos sintéticos. El proyecto anterior de Japón está excluido.
- Catorce migraciones aplicadas, 57 tablas públicas con RLS y diez Edge Functions desplegadas. La migración 014 habilitó `GB` en las conversaciones sin cambiar RLS; no fue necesario redesplegar Edge.
- Demo local: `http://127.0.0.1:3000/panel`; datos PGlite en `.local/agent-demo`. Metadatos de la demostración en `.local/qa/agent-demo.json`. No resetear esa base para ejecutar pruebas; usar un entorno aislado. Los fixtures caducan y no equivalen a evidencia oficial vigente.
- Frontend local conectado a Supabase: `http://127.0.0.1:3100`, mediante `pnpm start:staging`. Verificar disponibilidad; los procesos pueden finalizar al cerrar la sesión.
- Credenciales existentes solo en ubicaciones locales ignoradas/gestores del sistema. No imprimirlas, copiarlas a documentación ni incluirlas en Git. No incorporar datos personales reales.
- Para validar cambios funcionales: `pnpm check`, `pnpm test:e2e` y `pnpm test:agents`. `pnpm test:staging` crea fixtures sintéticos en el staging autorizado; no ejecutarlo como una consulta de estado ni contra producción.

## Continuidad con Graphify (2026-09-03)

- Decisión del usuario: «Guarda el estado» actualiza este checkpoint, `PROJECT_MEMORY.md` cuando cambien decisiones y un resumen en `docs/memory/`; después sincroniza y verifica el grafo compartido existente.
- `pnpm brain:query`, `pnpm brain:status` y `pnpm brain:sync` son los puntos de entrada desde este repositorio. Ver `GRAPH_MEMORY.md`.
- La incorporación de memoria no cambia proveedores, reglas regulatorias, pagos ni datos de clientes. La evidencia de producto anterior continúa siendo histórica; la validación nueva del puente se documenta aparte en `BUILD_STATUS.md`.
- Puente Graphify verificado: consulta enfocada, respaldo/no-op, typecheck, lint y 136 pruebas; MCP stdio respondió get_node/query_graph. La configuración global ya apunta al entorno aislado; no se reinició esta sesión ni se tocó uv.
