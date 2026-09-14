# Roadmap: qué necesitamos del fundador

Actualizado: 2026-09-03. Punto de partida: MVP local y Supabase staging sintético validados; laboratorio de ocho rutas implementado. Hosting de frontend y operación comercial aún pendientes. Este documento no activa suscripciones, pagos ni publicaciones regulatorias.

La secuencia actual es **agente conversacional Wyoming → conocimiento revisado y evaluación con modelo → acompañamiento y evidencia en panel → Delaware, Estonia y UK → piloto con alcance habilitado**. No se exige un profesional externo por caso como condición general para construir el MVP. GitHub y Supabase ya están conectados. El nombre, dominio y Stripe siguen diferidos; el spike de Lovable no bloquea estas pruebas. Definición y criterios de aceptación: `AGENCY_MVP_SCOPE.md`.

## Prioridad actual: saber qué podemos cumplir

Ya se implementó un laboratorio interno con las ocho rutas solicitadas, información/destino/responsable, fuentes y 27 escenarios sintéticos. Las pruebas distinguen preparación de constitución real. LT, Dubái, SG y HK siguen en investigación; UK se incluye en la primera tanda de validación. Ver `COUNTRY_SERVICE_VALIDATION.md`.

Continuar únicamente con US-WY → US-DE → EE → GB. Las demás rutas del laboratorio siguen siendo investigación histórica, fuera de este MVP. La prioridad es que el usuario pueda conversar, preparar y retomar su caso con instrucciones respaldadas. Este orden no es una certificación legal ni recomendación fiscal.

Wyoming ya dispone de un paquete interno específico y una entrevista conversacional persistente: 21 campos, destinos/fuentes, propuestas confirmables, correcciones, reanudación y descarga JSON, todo con datos ficticios. El siguiente paso es conectar un modelo con presupuesto limitado y ejecutar la evaluación adversarial; el fallback actual no finge comprensión de lenguaje natural. El contenido regulatorio sigue pendiente de revisión humana y los clientes alojados permanecen bloqueados. El acuse sintético no acredita aceptación externa. Ver `WYOMING_REVIEW_PACKET.md` y `AGENCY_MVP_SCOPE.md`.

La próxima dependencia técnica es proyecto del modelo de IA con presupuesto y secreto configurado en servidor para medir conversación real. Sin acceso se construyen sesión, herramientas y mock, dejando explícitamente pendiente esa evaluación. Para operación comercial se identifican responsable interno de conocimiento y entidad/jurisdicción de la agencia; contratos o profesionales se requieren según la actividad concreta, no como paso universal de onboarding. No enviar secretos por chat.

El panel del usuario y el admin ya muestran asistente por ruta, versión, ejecución del preparador, etapa/responsable, bloqueos, siguiente acción e historial. Se actualizan consultando datos persistidos; no simulan actividad autónoma. Se ampliarán con conversación, pendientes del cliente, conciliación de evidencia y atención de excepciones por operaciones internas.

Google Auth está implementado con PKCE y bloqueo explícito hasta configurar el proveedor. El fundador debe aportar un cliente OAuth Web en Google y configurar Client ID/Secret dentro de Supabase, sin compartir secretos por chat. La prueba completa con Google sigue pendiente. Ver `GOOGLE_AUTH.md`; ingresar con Google no equivale a verificación de identidad empresarial.

## Entregables del fundador, en orden

| Etapa | Qué necesito de ti | Qué se hará con ello | Criterio de cierre |
|---|---|---|---|
| 1. GitHub | Cuenta u organización propietaria, URL de un repositorio privado y acceso de escritura limitado a ese repositorio. El propietario configura las protecciones y entornos que requieran permisos superiores. | Subir el código existente, ejecutar los workflows preparados y establecer revisión de cambios. | CI remoto aprobado, rama protegida y secretos excluidos del repositorio. |
| 1. Supabase | Proyecto **de pruebas separado**, URL/project ref, acceso al proyecto mediante sesión autorizada y decisión de región/presupuesto. Las claves se configuran en un canal seguro. | Aplicar las doce migraciones; configurar Auth, Storage privado, funciones y automatizaciones. | Pruebas reales de autenticación, JWT, RLS entre organizaciones, documentos y funciones desplegadas. PGlite no sustituye estas pruebas. |
| 2. Hosting | Proyecto privado Lovable para un spike y presupuesto máximo. Usar el paquete `lovable/`; no hace falta dominio. | Generar una implementación separada, publicar con acceso restringido y exportarla a un repositorio GitHub distinto para probar paridad. | Onboarding, seguridad, Supabase y build exportado aprobados. Si falla, reevaluar hosting Next.js sin mantener dos productos. |
| Diferido. Marca y dominio | Ningún entregable ahora. El fundador continuará investigando. | Mantener Nexo como placeholder interno y evitar comprar/configurar dominio. | Se retoma con dos finalistas y territorios cuando exista decisión. |
| Diferido. Stripe test | Ningún entregable ahora. | Mantener adaptador sandbox y bloqueo externo. La verificación comienza después de aprobar al menos una ruta real supervisada de integración de constitución. | Posteriormente: webhook de prueba, firma, idempotencia, importe/modo y conciliación. Ningún cobro live. |
| 3. Correo | Proveedor elegido, dominio de envío y remitente autorizado; acceso DNS para su verificación. | Conectar SMTP/Auth y el adaptador de notificaciones cuando proceda. | Primero pruebas con buzones de prueba y entregabilidad documentada. No se envían campañas ni mensajes externos durante el desarrollo sin autorización explícita. |
| Prioridad actual. IA conversacional | Proyecto del proveedor, secreto seguro y presupuesto de consumo. | Construir y evaluar entrevista persistente, herramientas restringidas y guía con conocimiento revisado; empezar con datos ficticios. | Conversaciones y pruebas negativas aprobadas por ruta. El adaptador actual de consulta no basta y un mock no acredita capacidad del modelo. |
| Durante desarrollo. Revisión humana interna | Responsable competente de conocimiento/operaciones. | Revisar evidencia, fechas, discrepancias y textos; publicar con auditoría y atender excepciones. | Fuentes vencidas o pendientes siguen bloqueadas. La revisión interna no otorga una habilitación profesional. |
| Antes de operación comercial. Alcance del operador | Entidad/jurisdicción de la agencia y actividades ofrecidas. | Determinar obligaciones propias, privacidad, contratos y funciones que requieren habilitación. | Alcance comprobado; no asumir exención por llamar al servicio acompañamiento. |
| Según la ruta. Servicios externos | Contratos, autorización y acceso de prueba solo para funciones aplicables que no cubran la agencia o el cliente. | Distinguir autopresentación, acción del cliente y entrega autorizada. | Capacidad y responsabilidades comprobadas. Si faltan, bloquear esa acción, sin detener la ingeniería del onboarding. |
| 5. Piloto | Responsable de soporte/incidentes, revisión de seguridad, presupuesto operativo y aprobación del alcance del piloto. | Ensayar recuperación, MFA, monitoreo, backups y atención de excepciones. | Checklist de aceptación conectado y operativo aprobado antes de incorporar datos personales reales. |

La primera opción de hosting a evaluar será Lovable conforme a la decisión del fundador. No se adopta todavía: el producto actual es Next.js y el spike debe probar paridad antes de sustituir la implementación o su hosting. Ver `LOVABLE_EVALUATION.md`.

## Actualización: región y expansión asiática (2026-09-02)

GitHub está conectado. El fundador completó el login de Supabase y el reemplazo `keboldglfjonxcdnmyee` fue verificado en Singapur: doce migraciones y diez funciones desplegadas, 17/17 grupos de pruebas alojadas aprobados. El proyecto anterior de Japón queda excluido y no fue modificado. Ver `STAGING_VALIDATION.md`; producción se reevaluará con usuarios y requisitos de datos reales.

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
- Proyecto y presupuesto del modelo para evaluación conversacional; sin secretos por chat.
- Responsable interno de conocimiento y entidad/jurisdicción de la agencia para definir su alcance comercial. No se exige contratar un profesional externo para iniciar el siguiente hito técnico.

No pegues claves, tokens ni contraseñas en la conversación. Los accesos se configuran mediante login autorizado, invitación al proyecto o gestor de secretos. No se requieren permisos globales ni transferirnos la titularidad de las cuentas.

## Dependencias de salida

Para una **beta técnica conectada sin cobros** deben estar aprobados GitHub/CI, Supabase completo y hosting restringido. Stripe permanece diferido. Partners pueden seguir bloqueados si la beta se presenta únicamente como preparación y no como constitución real.

Para una **operación comercial** se añaden revisión humana, alcance habilitado del operador, textos definitivos, acuerdos aplicables, seguridad operativa y autorización expresa del piloto. No fijamos una fecha sin resolver esos requisitos; tampoco los usamos para posponer la construcción del agente. Ver `AGENCY_MVP_SCOPE.md`, `BUILD_STATUS.md`, `SECURITY.md` y `RUNBOOK.md`.
