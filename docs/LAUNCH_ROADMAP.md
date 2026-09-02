# Roadmap: qué necesitamos del fundador

Actualizado: 2026-09-03. Punto de partida: MVP local y Supabase staging sintético validados; laboratorio de siete rutas implementado. Hosting de frontend y operación comercial aún pendientes. Este documento no activa suscripciones, pagos ni publicaciones regulatorias.

La secuencia actual es **validar el servicio por jurisdicción → revisión y entrega a proveedor → pruebas de agente/modelo y formularios permitidos → admin de seguimiento → piloto supervisado**. GitHub y Supabase ya están conectados. El nombre, dominio y Stripe siguen diferidos; el spike de Lovable puede avanzar en paralelo, sin bloquear estas pruebas.

## Prioridad actual: saber qué podemos cumplir

Ya se implementó un laboratorio interno con las siete rutas solicitadas, información/destino/responsable, fuentes y 22 escenarios sintéticos. Las pruebas distinguen preparación de constitución real. LT, Dubái, SG y HK siguen en investigación; GB se conserva fuera de esta evaluación. Ver `COUNTRY_SERVICE_VALIDATION.md`.

Continuar primero con US-WY, US-DE y EE: revisión del expediente y validación de entrega con proveedor. SG/HK van después de confirmar cargos/proveedores locales; Dubái necesita autoridad específica; Lituania necesita confirmar el procedimiento digital vigente. Este orden es una prioridad de ingeniería, no una certificación legal ni recomendación fiscal.

Lo que falta del fundador para superar los límites externos, sin bloquear más desarrollo: responsable de revisión profesional; proveedor/contrato y acceso de pruebas; proyecto del modelo de IA con presupuesto cuando se quiera medir conversación autónoma; y proyecto privado Lovable/presupuesto para el spike. No enviar secretos por chat.

El admin básico ya existe. La siguiente ampliación mostrará agente y versión por expediente, etapa/responsable, bloqueo y próxima acción, historial/evidencia y derivaciones humanas. No se mostrará un avance jurídico solo porque una prueba de software haya aprobado.

## Entregables del fundador, en orden

| Etapa | Qué necesito de ti | Qué se hará con ello | Criterio de cierre |
|---|---|---|---|
| 1. GitHub | Cuenta u organización propietaria, URL de un repositorio privado y acceso de escritura limitado a ese repositorio. El propietario configura las protecciones y entornos que requieran permisos superiores. | Subir el código existente, ejecutar los workflows preparados y establecer revisión de cambios. | CI remoto aprobado, rama protegida y secretos excluidos del repositorio. |
| 1. Supabase | Proyecto **de pruebas separado**, URL/project ref, acceso al proyecto mediante sesión autorizada y decisión de región/presupuesto. Las claves se configuran en un canal seguro. | Aplicar las diez migraciones; configurar Auth, Storage privado, funciones y automatizaciones. | Pruebas reales de autenticación, JWT, RLS entre organizaciones, documentos y funciones desplegadas. PGlite no sustituye estas pruebas. |
| 2. Hosting | Proyecto privado Lovable para un spike y presupuesto máximo. Usar el paquete `lovable/`; no hace falta dominio. | Generar una implementación separada, publicar con acceso restringido y exportarla a un repositorio GitHub distinto para probar paridad. | Onboarding, seguridad, Supabase y build exportado aprobados. Si falla, reevaluar hosting Next.js sin mantener dos productos. |
| Diferido. Marca y dominio | Ningún entregable ahora. El fundador continuará investigando. | Mantener Nexo como placeholder interno y evitar comprar/configurar dominio. | Se retoma con dos finalistas y territorios cuando exista decisión. |
| Diferido. Stripe test | Ningún entregable ahora. | Mantener adaptador sandbox y bloqueo externo. La verificación comienza después de aprobar al menos una ruta real supervisada de integración de constitución. | Posteriormente: webhook de prueba, firma, idempotencia, importe/modo y conciliación. Ningún cobro live. |
| 3. Correo | Proveedor elegido, dominio de envío y remitente autorizado; acceso DNS para su verificación. | Conectar SMTP/Auth y el adaptador de notificaciones cuando proceda. | Primero pruebas con buzones de prueba y entregabilidad documentada. No se envían campañas ni mensajes externos durante el desarrollo sin autorización explícita. |
| 3. IA opcional | Proyecto del proveedor, secreto configurado de forma segura y presupuesto de consumo. | Validar el adaptador de enrutamiento existente; conservar respuestas basadas en reglas verificadas. | Fallback determinista funcionando y sin enviar perfiles ni documentos. No bloquea la demo actual. |
| 4. Revisión humana | Responsable identificado para fuentes/reglas, operador legal del servicio y profesionales para contratos, privacidad y alcance. | Revisar evidencia, fechas efectivas, discrepancias y textos antes de activar afirmaciones reales. | Publicaciones humanas auditadas; fuentes vencidas o pendientes continúan bloqueadas. |
| 4. Partners regulados | Contratos, autorización de alcance y acceso de prueba de agentes US, proveedores EE y ruta GB/ACSP; proveedores de identidad, screening y firma cuando apliquen. | Implementar y validar cada conexión dentro de lo contratado. | La contraparte confirma capacidad y responsabilidades. Una credencial técnica no equivale a autorización regulada. |
| 5. Piloto | Responsable de soporte/incidentes, revisión de seguridad, presupuesto operativo y aprobación del alcance del piloto. | Ensayar recuperación, MFA, monitoreo, backups y atención de excepciones. | Checklist de aceptación conectado y operativo aprobado antes de incorporar datos personales reales. |

La primera opción de hosting a evaluar será Lovable conforme a la decisión del fundador. No se adopta todavía: el producto actual es Next.js y el spike debe probar paridad antes de sustituir la implementación o su hosting. Ver `LOVABLE_EVALUATION.md`.

## Actualización: región y expansión asiática (2026-09-02)

GitHub está conectado. El fundador completó el login de Supabase y el reemplazo `keboldglfjonxcdnmyee` fue verificado en Singapur: diez migraciones y diez funciones desplegadas, 14/14 grupos de pruebas alojadas aprobados. El proyecto anterior de Japón queda excluido y no fue modificado. Ver `STAGING_VALIDATION.md`; producción se reevaluará con usuarios y requisitos de datos reales.

Singapur Pte. Ltd. y Hong Kong private company limited by shares entran en evaluación de expansión a petición del fundador. No están activas en el producto: requieren revisión profesional, reglas aprobadas, providers verificados e integración validada. Ver `REGION_AND_ASIA_FEASIBILITY.md`. No bloquean el staging de las cuatro rutas existentes.

## Supabase: datos públicos frente a secretos

Se pueden compartir por conversación la URL del proyecto, su identificador y el nombre del entorno. La clave publicable no es una credencial administrativa, pero tampoco hace falta pegarla aquí: puede configurarse directamente en el entorno.

Las claves secretas/service role, contraseñas de base de datos, tokens de CLI y secretos de firma van exclusivamente en variables del servidor o un gestor de secretos. Las claves secretas de Supabase tienen permisos elevados y omiten RLS; no deben aparecer en el navegador, Git ni mensajes. [Claves de Supabase](https://supabase.com/docs/guides/getting-started/api-keys).

Este repositorio espera `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y `SUPABASE_SERVICE_ROLE_KEY`, además de los secretos propios descritos en `.env.example`. Se comprobará la compatibilidad del tipo de clave con cada componente y el gateway de Edge Functions; no se deshabilitará la verificación JWT como atajo. Los operadores se crean mediante el procedimiento administrativo, nunca desde metadatos del registro.

GitHub permite secretos por repositorio y por entorno; el propietario debe configurar los controles que requieran administración. Solicitar solo los permisos necesarios y mantener separados staging/producción. [Documentación de GitHub](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets).

## Lovable: spike de hosting, no importación del MVP

Se preparó `lovable/` para generar un spike con contexto estable y datos ficticios. El código actual y sus migraciones siguen siendo la referencia durante la evaluación.

La documentación consultada indica que Lovable permite exportar sus proyectos a GitHub y sincronizarlos, pero **no importar un repositorio GitHub existente**. Esa sincronización no convierte automáticamente este repositorio en un proyecto editable por Lovable. [Git sync de Lovable, FAQ](https://docs.lovable.dev/integrations/github).

El spike debe vivir en un proyecto Lovable privado y exportarse a un repositorio nuevo. Solo después de aprobar la matriz de paridad se decide si Lovable aloja el frontend. No conectar una segunda herramienta de generación al esquema de producción; usar primero un Supabase staging vacío construido con las migraciones canónicas.

## Qué podemos terminar sin tus accesos

Código, interfaz, traducciones, motores, migraciones, pruebas, adaptadores simulados, contratos de API y documentación. GitHub/CI y Supabase alojado ya tienen evidencia de validación. Supabase se utiliza como `SANDBOX` con datos sintéticos; las conexiones de partners, pagos, KYC y autoridades continúan `EXTERNAL_BLOCKED`. No se presenta ninguna simulación como operación `LIVE`.

No se necesitan hoy tarjetas reales, documentos de identidad, credenciales de producción ni autorización para constituir compañías. Tampoco es necesario tener un dominio definitivo para probar el staging.

## Primer paquete que puedes proporcionar

- GitHub: repositorio recibido, publicado y CI aprobado; falta protección de rama.
- Supabase: acceso, región, despliegue y pruebas sintéticas completados. No hace falta repetir login ni compartir claves por chat.
- Enlace del proyecto Lovable privado cuando se cree y presupuesto mensual máximo.
- Nombre y dominio permanecen diferidos por decisión del fundador.
- Quién asumirá revisión de cumplimiento y acuerdos con partners; si aún no existe, queda identificado como pendiente.

No pegues claves, tokens ni contraseñas en la conversación. Los accesos se configuran mediante login autorizado, invitación al proyecto o gestor de secretos. No se requieren permisos globales ni transferirnos la titularidad de las cuentas.

## Dependencias de salida

Para una **beta técnica conectada sin cobros** deben estar aprobados GitHub/CI, Supabase completo y hosting restringido. Stripe permanece diferido. Partners pueden seguir bloqueados si la beta se presenta únicamente como preparación y no como constitución real.

Para una **operación comercial** se añaden revisión humana, textos definitivos, acuerdos aplicables, seguridad operativa y autorización expresa del piloto. No fijamos una fecha de lanzamiento hasta resolver estas dependencias externas. Ver `BUILD_STATUS.md`, `SECURITY.md` y `RUNBOOK.md` para los controles y límites actuales.
