# Modelo de datos

La autoridad del esquema son las migraciones SQL en `supabase/migrations`. `docs/schema-catalog.json` enumera todas las tablas públicas permitidas por el repositorio y la RPC. `scripts/generate-schema.mjs` documenta la fundación; los cambios posteriores se aplican mediante nuevas migraciones, sin regenerar retrospectivamente la historia.

| Dominio | Registros principales | Invariante |
|---|---|---|
| Identidad | profiles, organizations, organization_members | El trigger de alta crea cliente y organización; ignora roles en metadata |
| Fundador | founder_profiles, founder_tax_residencies | Información privada por organización |
| Negocio | business_profiles, business_owners, questionnaire_answers | Contexto y titularidad; consentimiento registrado |
| Constituciones | formation_cases, case_steps, case_events, case_tasks, case_escalations | Transiciones con revisión optimista; eventos append-only |
| Riesgo | risk_assessments, identity_checks | Declaración del usuario no equivale a identidad aprobada |
| Compañías | companies, company_documents | Una compañía por expediente; registro simulado identificable |
| Fuentes | authorities, regulatory_sources, source_snapshots, source_monitor_runs | URL canónica, consulta, éxito, hashes y captura privada |
| Reglas | regulatory_rules, regulatory_rule_versions, rule_source_evidence | Código estable, versión, intervalo efectivo y evidencia |
| Cambios | source_change_events, regulatory_alerts | Cambio pendiente bloquea reglas e impacta obligaciones |
| Cumplimiento | company_obligations, obligation_events | Un código por compañía/período; recálculo auditable |
| Cobros | billing_products, billing_prices, orders, subscriptions, webhook_events | Precio del servidor; idempotencia y firma |
| Comunicación | notifications, support_tickets | Alcance de organización; recordatorio deduplicado |
| Control | audit_logs, consents, rate_limits | Auditoría y consentimientos append-only |

## Tenencia

Las tablas de negocio incorporan `organization_id`. Las referencias entre expedientes, documentos y compañías combinan identificador y organización para impedir que un servicio privilegiado enlace accidentalmente recursos de clientes distintos. RLS filtra lectura por membresía activa; las escrituras de negocio se realizan mediante servicios validados. El cliente solo puede editar sus campos de perfil permitidos.

Los datos normativos públicos se limitan a versiones ACTIVE utilizables: intervalo efectivo, verificación, evidencia primaria, fuentes vigentes y ausencia de cambios sin resolver. Los snapshots y la auditoría interna no son públicos.

## Historia y fechas

Importes en unidades menores enteras; monedas explícitas. Fechas de período en `date`, eventos en `timestamptz`. Los cálculos trabajan con fechas UTC y el calendario exporta eventos de día completo. No se interpretan fechas locales del navegador como fechas legales.

Una versión publicada no puede cambiar resultado, condición, explicación, código, número o fecha inicial. Se crea una nueva versión y se cierra la anterior. Una corrección del mismo día puede dejar un intervalo histórico vacío exclusivamente en una versión SUPERSEDED. Snapshots, evidencia publicada y eventos no se reescriben. El usuario ve una proyección que retira fechas/importes no vigentes; la fila histórica se conserva.

Los períodos posteriores requieren confirmación interna de cierre y datos específicos; no se inventa un período fiscal ni se marcan presentaciones como completadas por el simple transcurso del tiempo.
