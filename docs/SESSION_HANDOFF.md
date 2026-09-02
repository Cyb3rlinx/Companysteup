# Punto de continuidad

Guardado a petición del fundador: 2026-09-03 (Asia/Bangkok). Este archivo conserva el estado de trabajo; no programa tareas futuras ni mantiene servidores activos.

## Base validada

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

1. Leer `AGENTS.md`, este archivo, `BUILD_STATUS.md` y `LAUNCH_ROADMAP.md`; comprobar cambios locales y estado real de los servicios antes de actuar.
2. Revisar los paquetes de US-WY/US-DE/EE/GB y documentar el canal de entrega autorizado, responsables, evidencia requerida y límites. La publicación de reglas requiere revisión humana; no sustituirla con resultados de pruebas.
3. Con proveedor/contrato y acceso de pruebas disponibles, validar la entrega supervisada. Sin ellos, mantener `EXTERNAL_BLOCKED` y continuar con preparación, contratos de adaptador y pruebas sintéticas.
4. En paralelo, configurar el cliente OAuth Web de Google dentro de Supabase mediante un canal seguro y probar Google → Supabase → callback → panel. No pedir Client Secret por conversación.
5. Evaluar conversación del modelo cuando exista credencial y presupuesto; luego conciliación de evidencia, asignación de profesionales y SLA. Hosting, controles operativos y piloto permanecen pendientes.

## Entornos y datos

- Único Supabase autorizado: `keboldglfjonxcdnmyee`, Singapur (`ap-southeast-1`), exclusivamente datos sintéticos. El proyecto anterior de Japón está excluido.
- Diez migraciones aplicadas, 55 tablas públicas con RLS y diez Edge Functions desplegadas. Este hito no agregó migraciones ni redesplegó Edge.
- Demo local: `http://127.0.0.1:3000/panel`; datos PGlite en `.local/agent-demo`. Metadatos de la demostración en `.local/qa/agent-demo.json`. No resetear esa base para ejecutar pruebas; usar un entorno aislado. Los fixtures caducan y no equivalen a evidencia oficial vigente.
- Frontend local conectado a Supabase: `http://127.0.0.1:3100`, mediante `pnpm start:staging`. Verificar disponibilidad; los procesos pueden finalizar al cerrar la sesión.
- Credenciales existentes solo en ubicaciones locales ignoradas/gestores del sistema. No imprimirlas, copiarlas a documentación ni incluirlas en Git. No incorporar datos personales reales.
- Para validar cambios funcionales: `pnpm check`, `pnpm test:e2e` y `pnpm test:agents`. `pnpm test:staging` crea fixtures sintéticos en el staging autorizado; no ejecutarlo como una consulta de estado ni contra producción.

Este checkpoint solo añade documentación. No modifica código, proveedores, datos ni configuración de infraestructura.
