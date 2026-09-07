# Validación de Supabase alojado

## Revalidación: conversaciones Wyoming y RLS (2026-09-07, Bangkok)

Ejecución final `2026-09-07T08:59:20Z`, run `211090ab-d408-4125-8635-3ae21e2bccd9`: **17/17 grupos aprobados** contra `keboldglfjonxcdnmyee`. El dry-run mostró únicamente `202609070011_agent_conversations.sql`; se aplicó sin seed y la consulta posterior confirmó once migraciones locales/remotas alineadas.

El grupo nuevo creó una conversación y un turno sintéticos mediante service role. El propietario autenticado pudo leerlos; otro tenant obtuvo cero filas; el cliente anónimo no obtuvo datos; los clientes no pudieron actualizar la conversación ni insertar turnos directamente; una fila con organización y caso de tenants distintos fue rechazada por la clave compuesta. El frontend alojado rechazó iniciar el laboratorio conversacional con 403 antes de procesar el mensaje. Los demás grupos volvieron a validar Auth, RLS, Edge, Storage y navegador.

Se retuvieron dos cuentas ficticias y el fixture conversacional de esta ejecución para auditoría; no contienen datos personales reales. El objeto Storage creado por la prueba fue eliminado y su metadato quedó rechazado. No hubo compañía, pago, regla publicada, presentación, llamada a OpenAI ni acción ante autoridad. Los intentos intermedios que detectaron aserciones incorrectas del runner no cuentan como aprobados; la conclusión se basa en la ejecución final con salida 0.

## Revalidación: frontera del paquete Wyoming (2026-09-03, Bangkok)

Ejecución `2026-09-03T08:24:58.775Z`, run `918be960-cf70-48f8-b7e8-c137707b0cf9`: **16/16 grupos aprobados** contra `keboldglfjonxcdnmyee`. El grupo de laboratorio ahora verifica que el endpoint `/api/wyoming-packet` rechaza clientes alojados con 403 antes de procesar datos de investigación. No se publicó la guía ni se atribuyó revisión profesional al resultado.

Se repitieron Auth, RLS, seguimiento, Edge, Storage y onboarding de navegador con dos cuentas ficticias. Se eliminó únicamente el objeto Storage de esta ejecución. Sin compañías, cobros, reglas publicadas ni captura regulatoria aprobada. Las funciones alojadas no se redesplegaron; el frontend usa la compilación actual desde localhost. Este resultado no valida un proveedor de Wyoming, un LLM ni una presentación real.

## Revalidación: seguimiento y Google (2026-09-03, Bangkok)

Ejecución `2026-09-02T21:06:57.058Z`, run `17976268-efa1-40d1-9fb7-cfc77f1fde70`: **16/16 grupos aprobados** con la nueva compilación Next.js conectada al mismo staging autorizado. Incluye los 14 grupos históricos y dos nuevos:

- Seguimiento privado de cuatro expedientes GUIDED, preparación UK con eventos reales de inicio/finalización en Postgres, borrador no presentable y workflow/revisión intactos. Accesos ajenos/anónimos e inyección de estado rechazados.
- Google sin configurar devuelve `EXTERNAL_BLOCKED`; CSRF y destinos inyectados rechazados. Clientes alojados no acceden al laboratorio regulatorio pendiente de revisión.

Se crearon dos nuevas cuentas ficticias; no se enviaron emails, pagos ni trámites. El objeto de Storage de esta ejecución se eliminó. Ninguna compañía ni regla publicada. Google externo sigue sin probar; las funciones Edge desplegadas no cambiaron en esta revalidación. Los límites operativos descritos abajo permanecen vigentes.

## Evidencia histórica inicial

Fecha: 2026-09-02. Ejecución final: `2026-09-02T14:30:25.219Z`, run `60df332c-aa18-4717-bc42-7561bf1e2d52`. Proyecto autorizado: `keboldglfjonxcdnmyee`, Singapur (`ap-southeast-1`). Uso `SANDBOX` con infraestructura real; no producción.

Resultado: **14/14 grupos de integración aprobados** mediante `pnpm test:staging`. El runner está en `scripts/test-staging.ts`; el reporte completo saneado queda localmente en `.local/staging/report.json`. No se usó el acceso de operaciones sandbox ni se aprobaron reglas regulatorias para hacer pasar los recorridos.

| Grupo | Evidencia aprobada |
|---|---|
| Acceso anónimo | Workspace sin sesión devuelve 401 |
| Auth y onboarding | Dos identidades sintéticas, sesiones reales, fundador, negocio, titularidad y consentimiento persistidos; metadatos `superadmin` no cambian el rol customer |
| Contraseña y frecuencia | Contraseña incorrecta rechazada; segundo consumo de un bucket limitado denegado |
| RLS entre organizaciones | Lectura propia válida; negocio, fundador, titulares, consentimientos y respuestas ajenos invisibles en ambas direcciones; API ajena devuelve 404 |
| Permisos privilegiados | Rechazo de cambio de rol/membresía, escritura directa de negocio, RPC de servicio y lectura de reglas pendientes |
| Cuatro rutas | Casos US-DE, US-WY, EE y GB guardados como GUIDED; avance sin pago bloqueado, checkout externo 503, liquidación mock 403, operador sandbox 404 |
| JWT de Edge | Tokens ausentes, malformados y con firma alterada rechazados por el gateway |
| Recomendación y asistente | JWT real aceptado; cuatro rutas requieren revisión, sin tasas verificadas; pregunta sin evidencia escala a humano y guarda el escalamiento |
| Mutaciones Edge | Creación real de caso guiado; propiedad de organización validada; pago y avance indebidos rechazados |
| Funciones privilegiadas | Clientes rechazados en ingestión/monitor/compliance; secretos de worker falsos y webhook sin firma rechazados; notify de cliente permanece limitado a su organización |
| Documentos y enlaces | Upload a Storage real, cuarentena, aprobación de fixture técnico auditada, descarga válida del dueño, rechazo de anónimo/otro tenant, rechazo de upload directo, enlace de aplicación y URL de Storage vencidos |
| Navegador | Login, formulario de onboarding, cuatro recomendaciones, creación de expediente, persistencia del panel; inglés inicial y selector español |
| Ausencia de efectos reales | Ninguna compañía, pago liquidado, captura/evidencia regulatoria o regla aprobada/publicada |
| Limpieza limitada | Blob creado por el runner eliminado; metadatos del documento marcados rejected; registros de auditoría preservados |

## Estado del despliegue

- Preflight inicial: ninguna tabla pública, usuario u objeto Storage antes de aplicar las migraciones. No se reseteó ni reparó historial remoto.
- Once migraciones locales y remotas coinciden; 57 tablas públicas y cero sin RLS.
- Diez Edge Functions `ACTIVE`. Siete conservan `verify_jwt=true`; webhook, monitor y notify usan los controles propios versionados y probados. No se usó `--no-verify-jwt`.
- Seed: 22 versiones `PENDING_REVIEW`, cero verificadas/publicadas, un precio inicial PLATFORM_SETUP; COMPLIANCE_ANNUAL sin precio autorizado. No se duplicaron precios.
- Siete cuentas sintéticas conservadas entre el ensayo inicial y las repeticiones. No contienen datos personales reales. Los passwords se generaron en memoria y no se guardaron en Git ni reportes; las sesiones del recorrido final se cerraron. No se enviaron correos.
- Buckets documentales privados. customer/company: 10 MiB; regulatory-snapshots: 32 MiB; public-assets público: 2 MiB. Detalle del límite del CLI para configuración global en `STAGING_SETUP.md`.

## Alcance de la conclusión

Está probado el onboarding, la preparación de expedientes y las fronteras de seguridad sobre Auth/Postgres/Storage/Edge reales. **No está probado que un agente pueda constituir una empresa real.** KYC, firmas, partners y autoridades siguen `EXTERNAL_BLOCKED`; el asistente usa fallback determinista sin API externa. Stripe continúa diferido por decisión del fundador.

Los recorridos completos de constitución y cumplimiento permanecen simulaciones locales identificadas como MOCK. En staging no se fabricaron aprobaciones regulatorias, señales de identidad, pagos ni referencias gubernamentales para avanzar.

No se validaron entrega de confirmación de email/SMTP, recuperación desde buzón, rotación y vencimiento natural de JWT, MFA end to end, escáner antimalware, recuperación de backups, carga/concurrencia de producción, disponibilidad regional ni un frontend alojado. Los rechazos de JWT alterados no prueban por sí solos su vencimiento natural. Estos puntos y una revisión profesional siguen pendientes antes de admitir información real.
