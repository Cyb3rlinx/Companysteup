# Punto de continuidad

Actualizado: 2026-09-14, 17:42 (Asia/Bangkok, UTC+7). Este archivo conserva el estado de trabajo; no programa tareas futuras ni mantiene servidores activos.

## Checkpoint actual: Delaware determinista integrado; ejecutar puerta conectada

- Wyoming permanece aprobado 4/4 conectado en `2026-09-14.4` e integrado al expediente. El reporte aprobado sigue en `.local/qa/wyoming-agent-evaluation-2026-09-14.4-connected-passed.json`, ignorado por Git.
- Delaware `2026-09-14.1` tiene un catálogo propio de 20 campos con fuentes, destinos y responsables. No recopila firmas, TIN, documentos de identidad, cuentas de mensajería o pagos.
- El motor conversacional deriva `US-WY` o `US-DE` del expediente y selecciona esquema, herramienta estructurada y paquete propios. El cliente inicia, responde, confirma y retoma; operaciones solo lee.
- El tracking expone jurisdicción, estado, modo, conteos y fecha; no copia valores. Los eventos contienen nombres de campos y revisión, nunca las respuestas.
- La evaluación Delaware determinista aprobó 4/4: completos 20/20, incompleto 5/5, corrección/reanudación y adversarial. Cero solicitudes de red y cero acciones externas. Reporte local: `.local/qa/delaware-agent-evaluation.json`.
- `pnpm check` aprobó lint, TypeScript, 174/174 pruebas, diez bundles Edge y build. `pnpm test:e2e` aprobó 14/14 con salida 0 en servidor sandbox aislado. Wyoming volvió a aprobar 4/4 determinista.
- La migración 012 fue la única pendiente, se aplicó al staging Singapur `keboldglfjonxcdnmyee` sin seed ni Edge. La revalidación final aprobó 17/17 con una conversación Delaware y aislamiento RLS explícito.
- La puerta conectada Delaware está implementada pero no ejecutada: las cuatro variables OpenAI no están disponibles en el proceso de Codex. Ejecutar desde la PowerShell privada: `corepack pnpm test:delaware-agent:connected`.
- Si el run conectado aprueba 4/4, preservar el reporte y continuar Estonia. Si falla, diagnosticar el primer parche exacto sin relajar la rúbrica ni aumentar el presupuesto a ciegas.
- Fuera de sandbox el agente permanece `EXTERNAL_BLOCKED`. Ninguna prueba firma, cobra, verifica identidad, contacta un partner, presenta ante una autoridad o constituye una compañía.
- El hito funcional Delaware está publicado en `0f41d08`. [Regulatory integrity #21](https://github.com/Cyb3rlinx/Companysteup/actions/runs/34834079997) aprobó en 38 segundos y [CI #21](https://github.com/Cyb3rlinx/Companysteup/actions/runs/34834079916) aprobó en 2 minutos 40 segundos.
- Para lanzamiento siguen pendientes operador/jurisdicción de la agencia, responsable interno, Google externo, hosting definitivo, Stripe y partners. No bloquean Estonia después de resolver la puerta conectada Delaware.

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

1. Consultar primero `pnpm brain:query "Company Setups punto de continuidad siguiente paso"` (o MCP graphify) y comprobar `pnpm brain:status`. Leer este checkpoint o fuentes puntuales solo si faltan datos o hay cambios; no releer conversaciones completas. Comprobar cambios locales y servicios antes de actuar.
2. Ejecutar `corepack pnpm test:delaware-agent:connected` en la PowerShell privada con las cuatro variables ya usadas para Wyoming. No copiar claves al chat ni al repositorio.
3. Preservar y revisar el reporte Delaware. Solo con 4/4 y cero acciones externas continuar Estonia; ante fallo, corregir el contrato observado sin relajar la puerta. Después repetir EE → GB.
4. En paralelo, configurar el cliente OAuth Web de Google dentro de Supabase mediante un canal seguro y probar Google → Supabase → callback → panel. No pedir Client Secret por conversación.
5. Preparar alcance comercial del operador, atención interna de excepciones y controles operativos. Validar servicios externos únicamente para las funciones aplicables; no son una dependencia universal para construir onboarding. Hosting y piloto permanecen pendientes.

## Entornos y datos

- Único Supabase autorizado: `keboldglfjonxcdnmyee`, Singapur (`ap-southeast-1`), exclusivamente datos sintéticos. El proyecto anterior de Japón está excluido.
- Doce migraciones aplicadas, 57 tablas públicas con RLS y diez Edge Functions desplegadas. La migración 012 habilitó `US-DE` en las conversaciones sin cambiar RLS; no fue necesario redesplegar Edge.
- Demo local: `http://127.0.0.1:3000/panel`; datos PGlite en `.local/agent-demo`. Metadatos de la demostración en `.local/qa/agent-demo.json`. No resetear esa base para ejecutar pruebas; usar un entorno aislado. Los fixtures caducan y no equivalen a evidencia oficial vigente.
- Frontend local conectado a Supabase: `http://127.0.0.1:3100`, mediante `pnpm start:staging`. Verificar disponibilidad; los procesos pueden finalizar al cerrar la sesión.
- Credenciales existentes solo en ubicaciones locales ignoradas/gestores del sistema. No imprimirlas, copiarlas a documentación ni incluirlas en Git. No incorporar datos personales reales.
- Para validar cambios funcionales: `pnpm check`, `pnpm test:e2e` y `pnpm test:agents`. `pnpm test:staging` crea fixtures sintéticos en el staging autorizado; no ejecutarlo como una consulta de estado ni contra producción.

## Continuidad con Graphify (2026-09-03)

- Decisión del usuario: «Guarda el estado» actualiza este checkpoint, `PROJECT_MEMORY.md` cuando cambien decisiones y un resumen en `docs/memory/`; después sincroniza y verifica el grafo compartido existente.
- `pnpm brain:query`, `pnpm brain:status` y `pnpm brain:sync` son los puntos de entrada desde este repositorio. Ver `GRAPH_MEMORY.md`.
- La incorporación de memoria no cambia proveedores, reglas regulatorias, pagos ni datos de clientes. La evidencia de producto anterior continúa siendo histórica; la validación nueva del puente se documenta aparte en `BUILD_STATUS.md`.
- Puente Graphify verificado: consulta enfocada, respaldo/no-op, typecheck, lint y 136 pruebas; MCP stdio respondió get_node/query_graph. La configuración global ya apunta al entorno aislado; no se reinició esta sesión ni se tocó uv.
