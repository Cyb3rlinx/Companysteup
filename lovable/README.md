# Paquete de contexto para un spike en Lovable

Este directorio permite pedirle a Lovable que genere **un prototipo separado** con el mismo alcance visual y funcional. No importa ni despliega el repositorio Next.js actual, no aplica migraciones y no contiene secretos.

## Uso propuesto

1. Crear un proyecto vacío y privado en Lovable para el spike.
2. Adjuntar `PROJECT_KNOWLEDGE.md`, `START_PROMPT.md`, `context.generated.json` y `design-tokens.json` en el chat/proyecto. Copiar el contenido estable de `PROJECT_KNOWLEDGE.md` a Project Knowledge si el plan lo permite.
3. Pedir Plan mode y revisar que conserve exactamente cuatro jurisdicciones, los actores y todos los bloqueos. No conectar Supabase todavía.
4. Generar primero interfaz con datos ficticios. No pegar claves, documentos reales ni SQL en el chat.
5. Publicar únicamente con acceso restringido para la evaluación. El URL `lovable.app` puede servir antes de elegir dominio.
6. Exportar el proyecto Lovable a **un repositorio GitHub nuevo**, por ejemplo `company-os-lovable-spike`. No intentar conectarlo al repositorio canónico.
7. Ejecutar la matriz de `docs/AGENT_ACCEPTANCE.md` sobre el export. Si no alcanza paridad, se descarta sin afectar el producto principal.

Ejecuta `pnpm lovable:export` cuando cambien workflows, integraciones o verticales. `context.generated.json` debe revisarse como cualquier cambio de código.

## Límite técnico

Los archivos adjuntos aportan contexto para que el agente genere código; no preservan automáticamente la arquitectura Next.js, rutas servidor, RLS, hashes, funciones Edge o pruebas. La documentación oficial de Lovable sigue indicando que un repositorio GitHub existente no se puede importar. Su función de archivos admite adjuntos/datos y su MCP en preview admite uploads, pero eso tampoco constituye una importación de código.

El resultado del spike no es la autoridad para datos ni reglas. `supabase/migrations` conserva esa autoridad y `packages` conserva la lógica de dominio mientras se decide cualquier portabilidad.
