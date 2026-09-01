# Evaluación de Lovable como hosting

Actualizado: 2026-09-01. Decisión provisional: **crear un spike, no migrar todavía el MVP**.

## Respuesta directa

Lovable incluye publicación y hosting para aplicaciones construidas en Lovable, con URL permanente `lovable.app`, controles de acceso y dominio personalizado opcional. Por ello puede reemplazar el hosting del frontend **si el producto se genera o adapta a su stack y aprueba paridad**. [Hosting y ownership](https://docs.lovable.dev/tips-tricks/deployment-hosting-ownership) · [Compartir y publicar](https://docs.lovable.dev/features/share-project).

No es un mecanismo para desplegar este repositorio Next.js tal como está. La guía externa de Lovable describe sus exports como una aplicación cliente con variables `VITE_*`, build `dist/` y React Router. El producto actual usa App Router, Server Components/Actions, proxy SSR, rutas API y secretos de servidor. Moverlo implica un port, no una simple carga de archivos. [Hosting externo](https://docs.lovable.dev/tips-tricks/external-deployment-hosting).

## Sobre Markdown y JSON

La idea de aportar archivos es válida para transmitir especificación, diseño y datos. Lovable documenta Project Knowledge, archivos de reglas Markdown en design systems y uploads/adjuntos en su MCP preview. También puede analizar JSON/CSV. Esos mecanismos entregan contexto o datos al agente; no importan un codebase externo. [Design systems](https://docs.lovable.dev/features/design-systems) · [MCP de Lovable](https://docs.lovable.dev/integrations/lovable-mcp-server) · [Archivos y datos](https://docs.lovable.dev/features/generate-files).

La FAQ mantiene que no se puede importar un repositorio GitHub existente; Lovable sí puede exportar y sincronizar el repositorio que él crea. [GitHub Git sync, FAQ](https://docs.lovable.dev/integrations/github#faq).

## Riesgos que el spike debe resolver

| Riesgo | Comprobación |
|---|---|
| Reimplementación silenciosa | Comparar rutas, estados, workflows y respuestas con `context.generated.json`. |
| Lógica o secretos trasladados al cliente | Revisar bundle/export; ninguna clave secreta en `VITE_*`; operaciones privilegiadas solo en Edge/server. |
| Dos autoridades de esquema | Conectar únicamente un Supabase staging construido desde las migraciones canónicas. Lovable no crea/edita tablas por prompt. |
| Divergencia de RLS | Ejecutar dos tenants, anónimo y roles; mismas pruebas negativas que el repositorio principal. |
| SSR/SEO e idioma | Verificar HTML, metadata, EN/ES, navegación directa y callbacks en el hosting publicado. |
| Funciones no portables | Probar las diez Edge Functions desplegadas y contratos de error/idempotencia. |
| Lock-in operativo | Exportar a GitHub separado y comprobar build reproducible fuera de Lovable. |

## Decisión después del spike

Lovable será hosting principal solo si:

1. el export conserva un build reproducible y revisable;
2. las 79 pruebas de dominio/SQL siguen usando los paquetes o contratos canónicos;
3. la suite E2E de onboarding y las pruebas de seguridad pasan en su URL publicada;
4. Supabase staging se construye exclusivamente desde las migraciones;
5. no se duplica la lógica crítica en prompts o componentes cliente;
6. costo, backups, logs, acceso y recuperación son aceptables.

Si falla, conservar Lovable únicamente para prototipos visuales. Elegir hosting por ahorrar una cuenta no compensa mantener dos implementaciones de cumplimiento. Lovable Cloud tampoco elimina el costo ni la operación del Supabase externo en el modelo híbrido.
