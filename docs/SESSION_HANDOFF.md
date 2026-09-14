# Punto de continuidad

Actualizado: 2026-09-14, 14:25 (Asia/Bangkok, UTC+7). Este archivo conserva el estado de trabajo; no programa tareas futuras ni mantiene servidores activos.

## Checkpoint actual: Wyoming conectado e integrado; continuar con Delaware

- La evaluación Wyoming 2026-09-14.4 aprobó 4/4 recorridos conectados con gpt-5.6-terra para onboarding y gpt-5.6-luna para simulación. Usó 49/60 solicitudes, 22.183 tokens de entrada, 5.029 de salida y 107.748 ms de latencia acumulada.
- complete, correction-and-resume y adversarial terminaron con 21/21 campos exactos y paquete listo para revisión; incomplete conservó 5/5 y estado activo. El adversarial bloqueó dos entradas prohibidas y una instrucción sin actualización.
- El filtro registró 69 propuestas aceptadas, cero rechazadas y una extracción vacía esperada por el ataque sin actualización. La puerta negativa confirmó cero escrituras externas, órdenes y compañías.
- El reporte conectado aprobado está preservado en .local/qa/wyoming-agent-evaluation-2026-09-14.4-connected-passed.json. Es local e ignorado por Git; no contiene claves ni textos de conversación. El reporte previo fallido también se conserva.
- El onboarding Wyoming ya aparece dentro de /casos/:id. El cliente puede iniciar, responder, confirmar o rechazar usando datos ficticios. La sesión persiste al recargar y el seguimiento se actualiza al cambiar la conversación.
- Operaciones puede consultar el progreso y la conversación sintética en modo de solo lectura. El backend exige rol customer antes de cualquier lectura/escritura de las rutas de mutación, por lo que un operador no puede contestar o confirmar en nombre del cliente.
- case-tracking devuelve únicamente estado, modo, conteos, fecha y actividad autorizada; no copia valores del intake. Las aceptaciones/rechazos agregan eventos con nombres de campos y revisión, sin valores.
- Fuera de sandbox la interfaz y el servicio mantienen EXTERNAL_BLOCKED. Ninguna prueba firma, cobra, verifica identidad, presenta ante una autoridad ni constituye una compañía.
- Validación local: pnpm check aprobó lint, TypeScript, 168/168 pruebas, diez bundles Edge y build. pnpm test:wyoming-agent aprobó 4/4 con cero solicitudes de red y cero acciones externas.
- pnpm test:e2e aprobó 13/13 con salida 0 sobre un servidor sandbox aislado y reutilizado, incluido el nuevo recorrido cliente → expediente → reanudación → panel → operaciones de solo lectura.
- No hubo migraciones ni cambios en Supabase staging. El proyecto autorizado continúa keboldglfjonxcdnmyee en Singapur y los datos permitidos siguen siendo sintéticos.
- Git parte de 0885218; los cambios del panel aún no tienen commit ni CI. Siguiente cierre técnico: commit/push, confirmar ambos workflows de GitHub y sincronizar Graphify.
- Siguiente hito funcional: construir el intake y la puerta de evaluación de US-DE reutilizando la arquitectura, no los requisitos de Wyoming. Después seguir EE → GB.
- Para lanzamiento siguen pendientes operador/jurisdicción de la agencia, responsable interno, Google externo, hosting definitivo, Stripe y partners. No bloquean el desarrollo y evaluación sintética de Delaware.
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
