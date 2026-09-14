# Company Setups — memoria del proyecto de agentes que crean empresas

## Identidad y objetivo

- Company Setups, Company OS y Nexo nombran este proyecto: una plataforma de orquestación de constitución y cumplimiento para fundadores internacionales. Nexo es provisional.
- El objetivo es acompañar onboarding, comparación, preparación de expedientes y seguimiento; no ser asesor legal, banco, autoridad, proveedor KYC ni agente autorizado. Fuente: `AGENTS.md` y `README.md`.
- Decisión del fundador del 2026-09-03: construir una agencia que opere onboarding y acompañamiento con agentes y conocimiento propios, sin presuponer un profesional externo por cada caso estándar. Priorizar conversación real y evaluación; no esperar un contrato de presentación para desarrollar el MVP. Fuente: `docs/AGENCY_MVP_SCOPE.md`.
- Código canónico: `D:/Codex/Company Setups`; repositorio privado `Cyb3rlinx/Companysteup`. El grafo compartido vive en `D:/Claude CODE/graphify-out/graph.json`.

## Estado operativo y límites

- Al 2026-09-03, el MVP local funciona y existe validación histórica de Supabase staging con datos sintéticos. Esto no es lanzamiento de producción ni prueba de constitución real. Fuente: `docs/BUILD_STATUS.md`.
- Los agentes preparan expedientes y orientan con controles deterministas; todavía no constituyen empresas reales de forma autónoma. Wyoming y Delaware aprobaron evaluaciones con modelos conectados sobre datos ficticios y cero acciones externas. No hay pagos reales ni presentación gubernamental habilitada. Fuente: `docs/WYOMING_AGENT_EVALUATION.md`, `docs/DELAWARE_AGENT_EVALUATION.md` y `docs/BUILD_STATUS.md`.
- Wyoming cuenta con evaluación en dos niveles: cliente ficticio determinista ejecutable sin red y cliente/modelo conectados mediante Responses. El evaluador conserva la verdad de referencia y nunca delega al modelo su propia aprobación. Fuente: `docs/WYOMING_AGENT_EVALUATION.md`.
- El grafo es memoria de desarrollo, no evidencia legal vigente ni autorización de operaciones. Fuentes vencidas, contradicciones o revisión pendiente bloquean afirmaciones y exigen revisión humana. Fuente: `AGENTS.md`.

## Jurisdicciones y alcance

- Catálogo comercial limitado a US-DE LLC, US-WY LLC, EE OÜ y GB Ltd. Orden de validación: US-WY → US-DE → EE → GB. No agregar jurisdicciones. Fuente: `AGENTS.md` y `docs/SESSION_HANDOFF.md`.
- El laboratorio tiene ocho perfiles y 27 escenarios históricos; LT, Dubái, SG y HK son únicamente investigación interna, no productos activos. Fuente: `docs/AGENT_ACCEPTANCE.md`.

## Arquitectura y módulos

- Next.js + TypeScript en `apps/web`; tipos y permisos en `packages/domain`; lógica de negocio independiente en `packages`. Fuente: `docs/ARCHITECTURE.md`.
- `packages/formation-guidance` prepara guías por ruta; `packages/case-tracking` conserva actividad y revisión. El panel consulta cada 25 segundos, no usa Supabase Realtime. Fuente: `docs/BUILD_STATUS.md`.
- `packages/formation-packet` prepara el paquete interno Wyoming: 21 campos, fuentes/destinos y 11 escenarios adicionales. El acuse es SANDBOX, no aceptación del proveedor; las respuestas no se guardan en eventos. Fuente: `docs/WYOMING_REVIEW_PACKET.md`.
- Las conversaciones Wyoming y Delaware están integradas en el detalle del expediente. El cliente controla sus respuestas y confirmaciones; operaciones tiene lectura. El seguimiento solo devuelve jurisdicción, estado, conteos y eventos saneados, sin valores del intake. Fuente: `apps/web/components/wyoming-conversation.tsx`, `packages/case-tracking/index.ts` y `packages/onboarding-agent/service.ts`.
- `packages/regulatory-engine` controla fuentes, versiones, vigencia y publicación humana; `packages/workflow-engine` orquesta; `packages/compliance-engine` calcula obligaciones con reglas verificadas. Fuente: `docs/ARCHITECTURE.md`.
- Supabase migrations es la autoridad del esquema; PGlite local usa las mismas migraciones. El staging autorizado tiene doce migraciones, 57 tablas con RLS y diez Edge Functions. La migración 012 permite conversaciones `US-WY | US-DE` y conserva RLS. Fuente: `docs/SESSION_HANDOFF.md` y `docs/STAGING_VALIDATION.md`.
- Roles consultados del servidor, nunca elevados por metadatos del usuario; documentos privados y cuarentena; secretos solo del servidor. Fuente: `AGENTS.md` y `docs/ARCHITECTURE.md`.

## Decisiones conservadas

- Conversación y panel: español LATAM. Sitio público: inglés inicial con selector español. Fuente: `docs/SESSION_HANDOFF.md`.
- Google OAuth está implementado con Supabase SSR/PKCE; el proveedor seguía deshabilitado en el último checkpoint. Configuración segura y prueba externa pendientes: `docs/GOOGLE_AUTH.md`.
- Stripe, nombre definitivo y dominio están diferidos. Lovable es opcional; no sustituye el repositorio ni las migraciones. Fuente: `docs/SESSION_HANDOFF.md`.
- Partners, KYC, firmas, presentación oficial y confirmación real permanecen EXTERNAL_BLOCKED hasta autorización, integración y evidencia revisada. No inferir LIVE de un test exitoso. Fuente: `docs/AGENT_ACCEPTANCE.md`.
- La revisión editorial/operativa puede ser interna y competente; se conserva publicación humana de reglas y escalamiento de excepciones. No equivale a habilitación profesional. Determinar obligaciones de la agencia según su operador y actividad antes de lanzamiento comercial, sin bloquear desarrollo sintético. Fuente: `docs/AGENCY_MVP_SCOPE.md`.

## Evidencia histórica, no ejecución nueva

- Último hito funcional documentado: `c9d0ef7`; checkpoint documental: `2412063`. CI application/edge/supabase y Regulatory integrity aprobados para el hito indicado. Fuente: `docs/SESSION_HANDOFF.md`.
- El checkpoint reporta 127 pruebas unitarias/SQL, 11 E2E, 27 escenarios y 16 grupos de staging, además de lint, TypeScript y build. Es evidencia histórica asociada al hito, no validación automática de cambios posteriores. Fuente: `docs/BUILD_STATUS.md`.
- El hito Wyoming posterior aprobó 155 pruebas unitarias/SQL, 12 E2E, lint, TypeScript y build; 11 escenarios específicos más los 27 generales. Cambios locales sin commit/push; no heredan el CI anterior. Fuente: `docs/BUILD_STATUS.md`.

## Siguiente paso y bloqueos

- Wyoming y Delaware aprobaron 4/4 recorridos deterministas y conectados. Delaware `2026-09-14.2` completó 49/60 solicitudes con cero acciones externas. Siguiente paso: matriz, conversación, panel y puerta agéntica específica de Estonia; después UK. Fuente: `docs/WYOMING_AGENT_EVALUATION.md`, `docs/DELAWARE_AGENT_EVALUATION.md` y `docs/SESSION_HANDOFF.md`.
- El adaptador conversacional Wyoming usa Responses con salida estructurada, privilegio mínimo por turno y confirmación. El evaluador determinista conserva la verdad y no delega la aprobación al modelo. Esta evidencia no valida futuras versiones ni otras jurisdicciones. Fuente: `packages/onboarding-agent`, `packages/agent-evaluation` y `docs/WYOMING_AGENT_EVALUATION.md`.
- Las credenciales del modelo permanecen exclusivamente en la terminal privada y no son necesarias para repetir el nivel determinista. Google puede configurarse en paralelo. Para lanzamiento hay que identificar operador y responsable interno, y resolver servicios externos solo cuando la ruta o actividad los requiera. Fuente: `docs/SESSION_HANDOFF.md`.
- Hosting, correo, hardening operativo y piloto supervisado siguen pendientes. No ejecutar `test:staging` como lectura de estado: crea fixtures remotos. Fuente: `docs/SESSION_HANDOFF.md`.

## Memoria entre conversaciones y Guarda el estado

- Decisión del usuario del 2026-09-03: usar el grafo existente como cerebro del proyecto y poder decir «Guarda el estado» al cerrar una conversación, sin releer chats anteriores.
- «Guarda el estado» significa resumir lo hecho, decisiones y motivos, pendientes/bloqueos, evidencia real y siguiente paso en `docs/SESSION_HANDOFF.md`; actualizar esta memoria si cambian decisiones estables y agregar un resumen breve en `docs/memory/`.
- Después ejecutar `pnpm brain:sync`, que indexa incrementalmente el código con Graphify, extrae los textos de memoria localmente y actualiza solo la partición Company Setups del grafo compartido. No reconstruye ni reemplaza los otros proyectos.
- Al retomar: `pnpm brain:query "Company Setups punto de continuidad siguiente paso"`. Citar `source_file` y `source_location`. Leer solo fuentes puntuales si la memoria está ausente, ambigua o desactualizada.
