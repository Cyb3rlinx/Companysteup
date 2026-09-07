# Punto de continuidad

Actualizado: 2026-09-07, 16:00 (Asia/Bangkok, UTC+7). Este archivo conserva el estado de trabajo; no programa tareas futuras ni mantiene servidores activos.

## Checkpoint actual: conversación Wyoming implementada; evaluar modelo real

- Se implementó la entrevista conversacional persistente US-WY sobre los 21 campos existentes: sesión privada, historial append-only, propuesta con evidencia, confirmación/rechazo, reanudación, revisión optimista e idempotencia. Solo acepta expedientes propios, sintéticos, US-WY y no terminales.
- El modelo solo puede proponer datos explícitos mediante una herramienta con esquema estricto. El servidor verifica que la cita exista en el mensaje, genera la respuesta visible y no persiste hasta confirmación. No puede decidir elegibilidad, hechos regulatorios, pagos, firma, presentación ni registro.
- Sin credenciales OpenAI, el modo `DETERMINISTIC_MOCK` admite exclusivamente `Campo: valor`; el lenguaje natural queda `EXTERNAL_BLOCKED`. Con credenciales, el adaptador usa Responses con `store:false`, pero solo fue validado con un transporte falso. No atribuir capacidad a un LLM real.
- Nueva migración 011 aplicada al único Supabase autorizado en Singapur: 57 tablas públicas, once migraciones y RLS. La ejecución final `211090ab-d408-4125-8635-3ae21e2bccd9` aprobó 17/17 grupos alojados con datos sintéticos, incluida la frontera real de las tablas de conversación.
- Validación local: `pnpm check` aprobado con 162/162 pruebas en 20 archivos y build; `pnpm test:e2e` 13/13 con salida 0; `pnpm typecheck` repetido después de ampliar staging. Ninguna compañía, cobro, regla publicada, presentación ni mensaje externo.
- GitHub `main`: commit `f9a7c16` publicado. [CI #10](https://github.com/Cyb3rlinx/Companysteup/actions/runs/34105837168) y [Regulatory integrity #10](https://github.com/Cyb3rlinx/Companysteup/actions/runs/34105837115) terminaron `success` para el SHA completo `f9a7c161f1ef27c75dc013a0b835a1c44134ea39`.
- El contexto maestro entregado por el fundador fue tratado como especificación no confiable. Sus principios compatibles se aplicaron; sus datos de competidores/proveedores no se convirtieron en conocimiento y no se añadieron jurisdicciones.
- Siguiente paso concreto: configurar un proyecto/modelo y presupuesto por canal seguro, luego ejecutar conversaciones Wyoming completas y adversariales con una rúbrica que mida extracción, correcciones, contradicciones, prompt injection, costo, latencia y cero acciones/afirmaciones no autorizadas. Después integrar pendientes en panel y repetir US-DE → EE → GB.
- Para lanzamiento continúa pendiente identificar entidad/jurisdicción operadora, alcance habilitado y responsable interno; Google externo, hosting definitivo, Stripe y partners siguen sus bloqueos. No hace falta resolverlos para evaluar el modelo de forma sintética.
- Memoria Graphify en estado `SYNCED`. El primer intento detectó ocho enlaces legacy propios hacia dependencias genéricas; `brain:repair` retiró únicamente esos enlaces, preservó las particiones ajenas y creó respaldos antes de reintentar. Consultar `brain:status` para la hora canónica de la última sincronización.

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
2. Construir la entrevista Wyoming persistente descrita en `AGENCY_MVP_SCOPE.md`; no confundir el preparador determinista ni el adaptador de consulta con un agente conversacional completo.
3. Revisar conocimiento internamente y evaluar conversaciones con un modelo conectado cuando haya credencial/presupuesto. Después integrar evidencia y pendientes en el panel existente, y repetir US-DE → EE → GB. No aprobar reglas por interpretación de IA ni usar mocks como prueba de constitución.
4. En paralelo, configurar el cliente OAuth Web de Google dentro de Supabase mediante un canal seguro y probar Google → Supabase → callback → panel. No pedir Client Secret por conversación.
5. Preparar alcance comercial del operador, atención interna de excepciones y controles operativos. Validar servicios externos únicamente para las funciones aplicables; no son una dependencia universal para construir onboarding. Hosting y piloto permanecen pendientes.

## Entornos y datos

- Único Supabase autorizado: `keboldglfjonxcdnmyee`, Singapur (`ap-southeast-1`), exclusivamente datos sintéticos. El proyecto anterior de Japón está excluido.
- Once migraciones aplicadas, 57 tablas públicas con RLS y diez Edge Functions desplegadas. La migración 011 agregó las tablas conversacionales; no fue necesario redesplegar Edge.
- Demo local: `http://127.0.0.1:3000/panel`; datos PGlite en `.local/agent-demo`. Metadatos de la demostración en `.local/qa/agent-demo.json`. No resetear esa base para ejecutar pruebas; usar un entorno aislado. Los fixtures caducan y no equivalen a evidencia oficial vigente.
- Frontend local conectado a Supabase: `http://127.0.0.1:3100`, mediante `pnpm start:staging`. Verificar disponibilidad; los procesos pueden finalizar al cerrar la sesión.
- Credenciales existentes solo en ubicaciones locales ignoradas/gestores del sistema. No imprimirlas, copiarlas a documentación ni incluirlas en Git. No incorporar datos personales reales.
- Para validar cambios funcionales: `pnpm check`, `pnpm test:e2e` y `pnpm test:agents`. `pnpm test:staging` crea fixtures sintéticos en el staging autorizado; no ejecutarlo como una consulta de estado ni contra producción.

## Continuidad con Graphify (2026-09-03)

- Decisión del usuario: «Guarda el estado» actualiza este checkpoint, `PROJECT_MEMORY.md` cuando cambien decisiones y un resumen en `docs/memory/`; después sincroniza y verifica el grafo compartido existente.
- `pnpm brain:query`, `pnpm brain:status` y `pnpm brain:sync` son los puntos de entrada desde este repositorio. Ver `GRAPH_MEMORY.md`.
- La incorporación de memoria no cambia proveedores, reglas regulatorias, pagos ni datos de clientes. La evidencia de producto anterior continúa siendo histórica; la validación nueva del puente se documenta aparte en `BUILD_STATUS.md`.
- Puente Graphify verificado: consulta enfocada, respaldo/no-op, typecheck, lint y 136 pruebas; MCP stdio respondió get_node/query_graph. La configuración global ya apunta al entorno aislado; no se reinició esta sesión ni se tocó uv.
