# Plan de hosting del MVP

Actualizado: 2026-09-15. Decisión técnica: alojar el repositorio canónico Next.js en **Vercel** para la beta sintética; conservar Lovable únicamente como spike visual separado. No se despliega producción ni se incorporan datos personales con este documento.

## Motivo

La aplicación usa App Router, renderizado servidor, rutas API, cookies HttpOnly, proxy SSR y secretos exclusivos del servidor. No puede convertirse en un export estático sin perder funciones críticas. La [documentación de despliegue de Next.js](https://nextjs.org/docs/app/getting-started/deploying) indica que un servidor Node o un contenedor conserva todas las funciones, mientras el export estático tiene soporte limitado. [Vercel para Next.js](https://vercel.com/docs/frameworks/full-stack/nextjs) permite importar el repositorio Git y gestionar variables por entorno con integración directa.

Lovable publica aplicaciones construidas dentro de su propio flujo, pero no importa este repositorio existente ni preserva automáticamente sus rutas servidor, RLS o pruebas. Mantener dos implementaciones antes del piloto aumentaría el riesgo de divergencia. El paquete `lovable/` sigue disponible para evaluar branding o interfaz sin convertirlo en autoridad del producto.

## Primer despliegue permitido

El primer entorno será una beta técnica con URL generada por el proveedor, Supabase Singapur `keboldglfjonxcdnmyee` y datos exclusivamente sintéticos. No requiere nombre ni dominio definitivo.

Variables de Preview/Staging:

| Variable | Valor o manejo |
|---|---|
| `APP_MODE` | `supabase` |
| `APP_ORIGIN` | Origen HTTPS exacto asignado al despliegue, sin ruta |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del staging autorizado |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave publicable del staging |
| `SUPABASE_SERVICE_ROLE_KEY` | Secreto de servidor del staging; nunca público |
| `DOCUMENT_SIGNING_SECRET` | Secreto aleatorio de al menos 64 caracteres, solo servidor |
| `GOOGLE_AUTH_MODE` | `SANDBOX` únicamente después de habilitar Google; antes `EXTERNAL_BLOCKED` |
| Stripe, KYC, correo y partners | Vacíos / `EXTERNAL_BLOCKED` durante la beta |

Vercel separa variables entre Preview y Production y las aplica en un nuevo despliegue; no se deben pasar valores secretos mediante URLs o archivos versionados. Ver [entornos y variables de Vercel](https://vercel.com/docs/environment-variables).

## Auth y URL estable

Google OAuth necesita coincidencias exactas. Se usará una URL fija de staging, no una URL distinta por cada preview:

1. Definir esa URL como `APP_ORIGIN`.
2. Agregar `${APP_ORIGIN}/auth/callback` a Redirect URLs de Supabase.
3. Mantener en Google `https://keboldglfjonxcdnmyee.supabase.co/auth/v1/callback` como Authorized redirect URI del cliente Web.
4. Definir la URL fija como Site URL del staging mientras se prueba.
5. Ejecutar `pnpm test:google-auth:staging` y después el recorrido manual con cuenta de prueba.

Supabase recomienda callbacks exactos para producción y reserva comodines para previews; este MVP usará el callback exacto para reducir redirecciones aceptadas. Ver [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).

## Puerta antes de incorporar un piloto

- CI de GitHub y Regulatory integrity aprobados sobre el commit desplegado.
- Build del proveedor aprobado y `/`, `/ingresar`, `/registro`, `/panel` y `/admin` responden según autenticación.
- Headers de seguridad presentes y cookies `Secure` bajo HTTPS.
- Google: alta, cancelación, reingreso, misma organización y cierre de sesión probados con una cuenta controlada.
- RLS entre dos organizaciones y bloqueo anónimo revalidados contra el staging.
- Backups, recuperación, MFA de administradores, logs y responsable de incidentes definidos.
- El piloto conserva pagos, KYC, correo, partners y presentaciones en `EXTERNAL_BLOCKED`.

## Accesos externos pendientes

Para ejecutar el despliegue faltan una cuenta/proyecto Vercel conectado al repositorio privado y la configuración de secretos mediante el panel del proveedor. Para completar Google faltan Client ID/Secret creados por el fundador y guardados directamente en Supabase. Ninguno debe enviarse por chat o confirmarse en un archivo del repositorio.
