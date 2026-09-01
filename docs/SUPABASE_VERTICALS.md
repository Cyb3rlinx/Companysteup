# Verticales de Supabase

Actualizado: 2026-09-01. Este diseño organiza el trabajo conectado sin dividir prematuramente una transacción de constitución entre bases de datos. `supabase/verticals.json` es el catálogo legible por máquinas; las migraciones siguen siendo la única autoridad del esquema.

## Decisión de arquitectura

Usar **un proyecto Supabase aislado por entorno**: staging, piloto y producción. Dentro de cada proyecto, las trece verticales se separan por propiedad funcional, RLS, funciones, buckets, secretos, pruebas y monitoreo. No crear un proyecto Supabase por vertical: rompería transacciones, multiplicaría identidades y aumentaría el riesgo de sincronización.

El entorno staging solo admite identidades y documentos ficticios. Piloto y producción permanecen `EXTERNAL_BLOCKED` hasta aprobar los controles correspondientes. No se copia la base local PGlite como si fuera producción; se aplican las migraciones desde cero.

## Orden de activación

| Ola | Verticales | Prueba de salida |
|---|---|---|
| S1 Base segura | identidad/tenancy, controles de plataforma, catálogo | Auth alojado, aislamiento entre dos organizaciones, roles administrados por servidor, auditoría inmutable y límites de tasa. |
| S2 Expediente | onboarding, identidad/riesgo, documentos | Signup/callback, consentimiento, cuestionario, Storage privado, cuarentena, enlaces firmados y rechazo anónimo/cross-tenant. KYC sigue bloqueado si no hay proveedor. |
| S3 Orquestación | casos, compañía, coordinación de partners | Cuatro workflows completos en sandbox; sin saltos, responsables correctos, evidencia obligatoria y bloqueo de partner/gobierno en modo no simulado. |
| S4 Evidencia | fuentes/reglas, cumplimiento continuo | Snapshots privados, publicación humana, vigencia, impacto de cambios, obligaciones y recordatorios con fechas verificadas. |
| S5 Integraciones | billing y comunicaciones | Solo después de S1–S4. Stripe test y correo de prueba validan firma, repetición, consentimiento y entrega. No habilitan trámites. |

## Controles obligatorios en cada vertical

- RLS en todas las tablas expuestas y pruebas negativas con usuarios de organizaciones distintas.
- `service_role` o clave secreta únicamente en servidor; nunca en un bundle Lovable/Vite ni en variables públicas.
- Migraciones hacia adelante, revisadas y ejecutadas por CI antes de despliegue.
- Datos semilla sin reglas `ACTIVE` reales ni aprobaciones sintéticas en remoto.
- Métricas por función, errores 5xx, auditoría y runbook del responsable.
- Estado de integración declarado: `SANDBOX`, `EXTERNAL_BLOCKED` o `LIVE`.

## Criterio para declarar una constitución asistida de extremo a extremo

Hay tres niveles diferentes y no deben mezclarse:

1. **E2E de producto:** el fundador crea cuenta, completa perfil/titularidad/consentimiento, recibe cuatro rutas, prepara documentos y llega a un handoff externo correctamente bloqueado. Esto se puede aprobar con datos ficticios.
2. **E2E de integración:** identidad, partner y autoridad responden en sus entornos autorizados; referencias y webhooks se concilian. Requiere contratos y credenciales de prueba.
3. **E2E operativo real:** una contraparte autorizada confirma que un caso supervisado terminó registrado y que el calendario posterior coincide con la evidencia oficial. Solo entonces puede afirmarse que la plataforma apoyó una constitución real.

Los agentes de software pueden orientar, recopilar, validar, preparar y coordinar. No sustituyen al fundador, revisor profesional, partner autorizado ni gobierno. Las pruebas nuevas demuestran el primer nivel y verifican que los niveles 2–3 permanecen bloqueados; no demuestran una constitución real.

## Stripe y hosting

Stripe queda fuera de las olas iniciales conforme a la decisión del fundador. Los tests usan pago `SANDBOX` únicamente para atravesar la precondición interna del workflow. La verificación Stripe test comienza después de que exista al menos una ruta de integración completa y supervisada; nunca se prueba con una clave live.

El frontend puede vivir en Lovable solo si se genera/adapta como proyecto Lovable y pasa la misma matriz de aceptación. Supabase seguirá siendo externo en el modelo híbrido y conserva sus propias obligaciones de operación y costo. Ver `docs/LOVABLE_EVALUATION.md`.
