# Acceso con Google y espacio privado

Fecha: 2026-09-03. Código implementado; conexión externa `EXTERNAL_BLOCKED`. Se consultó `/auth/v1/settings` del staging autorizado `keboldglfjonxcdnmyee`: Google deshabilitado y acceso por correo habilitado. No se modificó la configuración remota ni se creó una cuenta Google.

## Funcionamiento implementado

Registro e ingreso muestran **Continuar con Google**. En el sandbox PGlite permanece deshabilitado: no se simula una identidad de Google. El ingreso por correo y contraseña sigue disponible.

Fuera de PGlite, el servidor exige configuración explícita `GOOGLE_AUTH_MODE=SANDBOX` o `LIVE`, URL de Supabase, clave publicable y origen válido. El inicio es un POST con control de origen y límite de solicitudes; el cliente no puede elegir proveedor, rol, destino ni scopes. Supabase SSR genera PKCE y guarda su verificador en cookie HttpOnly/SameSite=Lax, Secure bajo HTTPS. Solo se solicitan `openid email profile`; no Gmail, Drive, acceso offline ni tokens Google guardados en tablas o registros de la aplicación.

El callback intercambia el código por sesión mediante el SDK, comprueba usuario/perfil/membresía y redirige exclusivamente a `/panel`. Código inválido, duplicado, error de proveedor o fallo de membresía vuelve a `/ingresar?confirmation=failed`, sin reflejar mensajes, tokens ni destinos recibidos. Nunca se usan `next`, `Host` o `X-Forwarded-Host` como destino. El intercambio PKCE verifica la sesión iniciadora; no se aceptan JWT arbitrarios desde el formulario.

El trigger existente `bootstrap_user` crea perfil y organización propios. El rol predeterminado es `customer`; `role`, `app_role` u organización en metadatos no conceden permisos. Google sirve para autenticarse en la plataforma: no reemplaza KYC, firmas, códigos de Companies House ni revisión de titulares.

## Configuración que falta del fundador

1. Elegir un proyecto Google Cloud/Google Auth Platform bajo su control y configurar audiencia/consentimiento. Mientras esté en Testing, limitarlo a cuentas de prueba autorizadas. No usar expedientes ni documentos reales.
2. Crear un cliente OAuth de tipo **Web application**. Configurar los orígenes de la aplicación que realmente se utilizarán.
3. Agregar en Google la URI de retorno del proveedor: `https://keboldglfjonxcdnmyee.supabase.co/auth/v1/callback`.
4. En Supabase → Authentication → Sign In / Providers → Google, guardar Client ID y Client Secret y habilitar Google. El secreto se guarda allí o mediante gestión de secretos autorizada, nunca en Git, `NEXT_PUBLIC_*` o conversación.
5. En Supabase → URL Configuration, permitir el callback del frontend: `http://127.0.0.1:3100/auth/callback` para `pnpm start:staging`. Mantener `APP_ORIGIN=http://127.0.0.1:3100` en ese servidor. No confundir este callback con el del paso 3.
6. Iniciar el staging con `GOOGLE_AUTH_MODE=SANDBOX` en el entorno del servidor y probar con una cuenta de prueba controlada. El script `start:staging` conserva esa variable, pero no habilita el proveedor por sí solo.
7. Para hosting definitivo, usar HTTPS, agregar el callback exacto, comprobar cookies Secure, retirar destinos de desarrollo del entorno productivo y revisar restricciones de audiencia. No se requiere comprar un dominio para probar localhost.

La configuración sigue el [flujo Google de Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google) y su [cliente SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client). La aprobación de la pantalla de consentimiento, si aplica, corresponde al proveedor; no está garantizada por estos cambios.

## Evidencia y pruebas pendientes

Se prueba el SDK real para generación PKCE/cookies y se prueban errores, destinos inesperados, parámetros inyectados, CSRF y callbacks fallidos sin sesión. Una prueba SQL usa metadatos de estilo OAuth maliciosos y confirma que no elevan permisos ni cambian de organización.

Falta la prueba externa completa Google → Supabase → callback → panel, cancelación en el proveedor, reingreso a la misma organización y cierre de sesión. No se declara aprobada hasta disponer de configuración y cuenta de pruebas. No habilitar Google solo para que un botón parezca funcional.

## Panel y actividad del expediente

`/panel` y `/casos/:id` muestran progreso de pasos, responsable, asistente por ruta, bloqueos y actividad. Se actualizan cada 25 segundos mientras la pestaña esté visible y al recuperar foco; si falla la consulta se avisa que los datos pueden estar desactualizados. El endpoint protegido devuelve hasta 100 expedientes y los últimos 100 eventos por caso, en orden descendente antes del límite; no es una suscripción Supabase Realtime.

**Preparar resumen del expediente** ejecuta el preparador determinista con datos del negocio ya guardados, sin pago ni llamadas externas. Registra inicio, finalización o fallo y versión/revisión del caso. No almacena el cuestionario en los eventos ni avanza el workflow. Una ejecución iniciada sin resultado deja de mostrarse en curso a los dos minutos; una revisión posterior del caso marca el resumen como anterior. Es preparación acotada, no un agente autónomo trabajando en segundo plano.

Con adaptadores de registro todavía bloqueados, el panel nunca afirma constitución real. Incluso un flag `registered` sin la futura conciliación de evidencia se muestra pendiente de verificación. El admin reutiliza este seguimiento para los casos a los que tiene acceso; la separación entre organizaciones permanece en RLS.
