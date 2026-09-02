# Aceptación de agentes y formación empresarial

Actualizado: 2026-09-03. “Agente” puede significar un agente de software o un agente registrado/proveedor autorizado. Este documento los separa explícitamente.

## Laboratorio de alcance por jurisdicción

Se agregó `/laboratorio-agentes` con siete perfiles internos versionados, 22 escenarios sintéticos y mapa de información a fuentes oficiales. US-WY/US-DE/EE usan las rutas existentes; LT/Dubái/SG/HK permanecen en investigación. GB se conserva sin incluirlo en esta campaña. Detalle: `COUNTRY_SERVICE_VALIDATION.md`.

`pnpm test:agents` genera un informe auditable local. El nuevo E2E registra un usuario ficticio, crea tres expedientes y comprueba 22 escenarios, aislamiento entre organizaciones y ausencia de cambios en estados, órdenes o compañías. Las evaluaciones se pueden guardar como eventos sintéticos del expediente. El ensayo no interactúa con formularios autenticados oficiales ni evalúa un LLM.

La aceptación comercial sigue pendiente: los agentes no “aprenden” por leer páginas o pasar fixtures. Hace falta revisión de conocimiento, evaluación conversacional del modelo conectado y entrega autorizada a proveedores. Ningún perfil se considera habilitado para constituir compañías reales.

## Afirmación actualmente permitida

El sistema ayuda al usuario durante onboarding, comparación, preparación del expediente y seguimiento. En sandbox, operaciones puede simular los pasos de las cuatro rutas para validar la orquestación. **No existe evidencia todavía de que los agentes de software puedan constituir una empresa real de forma autónoma.**

## Matriz que debe aprobarse por jurisdicción

| Capacidad | US-DE LLC | US-WY LLC | EE OÜ | GB Ltd | Evidencia requerida |
|---|---|---|---|---|---|
| Onboarding, titularidad y consentimiento | Local aprobado | Local aprobado | Local aprobado | Local aprobado | E2E navegador + registros tenant-scoped |
| Recomendación explicable | Local aprobado | Local aprobado | Local aprobado | Local aprobado | Reglas vigentes y fuentes visibles |
| Preparación de expediente | Sandbox aprobado | Sandbox aprobado | Sandbox aprobado | Sandbox aprobado | Documento de prueba, hash, cuarentena y revisión |
| Identidad/KYC | Bloqueado | Bloqueado | e-Residency/partner bloqueado | Directores/PSC bloqueado | Respuesta de proveedor + revisión humana |
| Partner autorizado | Agente registrado bloqueado | Agente registrado bloqueado | Contacto/RIK bloqueado | ACSP/ruta guiada bloqueada | Contrato, alcance, sandbox y evidencias |
| Presentación gubernamental | Bloqueada | Bloqueada | Bloqueada | Bloqueada | API/ruta autorizada o referencia revisada |
| Confirmación real | No probada | No probada | No probada | No probada | Respuesta oficial conciliada por operador |
| Cumplimiento posterior | Local aprobado | Local aprobado | Local aprobado | Local aprobado | Obligaciones basadas en reglas vigentes |

## Tests automatizados

`tests/unit/formation-agent-acceptance.test.ts` comprueba para cada ruta:

- que todos los pasos tienen propietario y nivel de automatización coherentes;
- que existen acciones del usuario, preparación de plataforma, partner y gobierno;
- que el sandbox solo llega a `ACTIVE_COMPLIANCE` con eventos y referencias `MOCK` explícitas;
- que ningún paso anterior a la confirmación marca la empresa como registrada;
- que en modo no simulado un partner sin contrato y toda transición gubernamental quedan bloqueados;
- que una definición con automatización incompatible se rechaza.

Los E2E locales agregan signup, cuestionario, las cuatro recomendaciones, cuatro workflows simulados, aislamiento de tenant, documentos, compañía, obligaciones y recordatorios. `pnpm test:staging` aprobó 14 grupos contra Auth/Postgres/Storage/Edge reales: onboarding, expedientes GUIDED, documentos y bloqueos operativos, sin acceso sandbox de operaciones. El navegador completó el formulario y persistió su caso. No se ejecuta en remoto la parte que requiere aprobaciones o pagos ficticios; ver `STAGING_VALIDATION.md`.

## Puertas restantes

1. Definir contrato de integración por partner: solicitudes, respuestas, idempotencia, reintentos, errores y evidencia.
2. Crear fixtures oficiales de sandbox proporcionados por cada partner, sin PII real.
3. Agregar pruebas de contrato y conciliación para cada ruta.
4. Ejecutar un caso supervisado no comercial en el entorno permitido por la contraparte.
5. Revisión humana de la confirmación y obligaciones posteriores.
6. Solo después, cambiar el adaptador correspondiente de `EXTERNAL_BLOCKED` a `LIVE` mediante despliegue revisado.

Stripe, un botón o una respuesta de IA nunca cuentan como evidencia de registro. La evidencia debe provenir de la autoridad o del partner autorizado y conservarse con referencia, fecha y auditoría.
