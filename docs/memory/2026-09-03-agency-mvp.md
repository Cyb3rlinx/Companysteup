# Agencia con onboarding y acompañamiento propios

Fecha: 2026-09-03, 16:52 Asia/Bangkok (UTC+7).

## Decisión y motivo

- El fundador aclaró que quiere una agencia que atienda onboarding y acompañamiento mediante IA y conocimiento propios; no depender de profesionales externos para cada caso estándar ni para construir el MVP.
- Se sustituye la prioridad anterior de conseguir primero revisión profesional/proveedor por conversación Wyoming persistente, conocimiento revisado y evaluación real del modelo. Después integrar evidencia y repetir Delaware → Estonia → UK; no ampliar jurisdicciones.
- La revisión humana editorial/operativa puede ser interna y competente; no se eliminan publicación humana, límites de asesoramiento ni requisitos de habilitación. IA, aprobación técnica y una base de datos no sustituyen funciones legalmente exigidas.

## Cambios

- Nuevo `docs/AGENCY_MVP_SCOPE.md`: capacidades, separación de responsabilidades, plan, criterios de aceptación conversacional y obligaciones potenciales del operador.
- Actualizados roadmap, aceptación, BUILD_STATUS, memoria estable y checkpoint. Solo documentación; sin nuevas funciones, cambios de esquema, publicación de reglas, trámites, cobros, commit, push ni despliegues.
- Consultadas fuentes oficiales Wyoming, GOV.UK y HMRC; registradas como observaciones, no como reglas aprobadas.

## Pruebas y pendientes

- Validación nueva: `pnpm typecheck`, `pnpm test` (155/155 en 18 archivos) y `git diff --check` aprobados. No se repitieron E2E/build/staging; los resultados históricos de 12 E2E y 16 grupos alojados no acreditan conversación de un LLM.
- Falta implementar conversación persistente y configurar proyecto/modelo/presupuesto para medirla con datos ficticios. Sin acceso se construye contrato/mock, identificando esa limitación.
- Antes del piloto comercial, identificar entidad/jurisdicción y responsable interno de la agencia, determinar obligaciones aplicables y resolver funciones externas necesarias. Esto no bloquea desarrollo sintético.

## Siguiente paso

- Implementar entrevista Wyoming con respuestas libres, confirmación estructurada, preguntas adaptativas y reanudación sobre el paquete de 21 campos. El adaptador actual solo enruta consultas a reglas y no cumple ese objetivo.
