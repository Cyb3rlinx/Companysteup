# Operación, despliegue y recuperación

## Entornos

| Entorno | Uso | Lo que NO representa |
|---|---|---|
| Sandbox local | Demostración con datos ficticios y PostgreSQL embebido | Supabase alojado, cobro o registro real |
| Supabase + Stripe test | Validación de infraestructura, Auth, Storage y pagos de prueba | Autorización regulada ni lanzamiento comercial |
| Producción | Bloqueado hasta revisión y activación formal | No se habilita cambiando una sola variable |

`pnpm dev` liga el servidor a 127.0.0.1:3000. El modo desarrollo sin APP_MODE usa sandbox. `pnpm start` usa la configuración explícita y no activa sandbox de forma implícita. No publicar el acceso de operador de demostración.

## Demostración local

1. Instalar y ejecutar como indica README. Abrir `/registro` y usar datos ficticios.
2. Completar fundador, negocio y preferencias; comparar las cuatro recomendaciones y crear un expediente.
3. Revisar la orden y confirmar un pago simulado. Gobierno y partners quedan fuera del total.
4. Usar el acceso de operaciones sandbox desde `/ingresar` o `/configuracion`.
5. Abrir `/admin`, elegir el expediente y completar pasos en orden con la opción explícita de simulación. Cada referencia se marca MOCK.
6. Después de la confirmación simulada aparecen compañía y obligaciones. El calendario muestra evidencia; datos sin vigencia requieren revisión.
7. Subir un PDF/PNG/JPEG ficticio; comprobar cuarentena y aprobarlo desde la vista interna de documentos. No subir identidad real.
8. Activar seguimiento simulado en facturación. En administración se pueden revisar fuentes, crear borradores y confirmar períodos.

Para comprobar recordatorios con una fecha futura, una sesión interna puede llamar `/api/notify` con `{ "today": "YYYY-MM-DD" }`. Esa opción existe solo en sandbox. Fuera de sandbox se rechaza y siempre se usa el día UTC actual.

La evidencia sintética caduca a las 24 horas. No se refresca sola ni se confunde con capturas oficiales. Si necesitas una demostración nueva, conserva/renombra tu carpeta `.local` después de parar el servidor y configura `SANDBOX_FIXTURE_TIME` en una base nueva. No uses esto para reaprobar datos reales.

## Supabase

Destino de staging y procedimiento de conexión actual: `STAGING_SETUP.md`. Supabase CLI está fijada en el proyecto; usar `pnpm supabase <comando>` para los ejemplos siguientes. No volver a ejecutar `init` sobre esta configuración existente.

1. Crear un proyecto de prueba separado y configurar sus credenciales en `apps/web/.env.local`, con `APP_MODE=supabase` y APP_ORIGIN exacto. No colocar service_role en NEXT_PUBLIC.
2. Con Supabase CLI y Docker disponibles, ejecutar `supabase start`, `supabase db reset`, `supabase test db` y `supabase db lint --level error`. Los comandos reset son destructivos para la base **local de pruebas**; nunca aplicarlos a un proyecto con datos que se quieran conservar.
3. Para el remoto, enlazar el proyecto correcto y revisar las migraciones antes de `supabase db push`. Importar el seed de forma controlada. No insertar aprobaciones sintéticas.
4. Configurar Auth: confirmación de email, site URL, callback `/auth/callback`, SMTP propio y políticas de acceso. Crear operadores mediante un procedimiento administrativo auditado; nunca metadatos del signup. Exigir MFA antes de acceso a datos reales.
5. Verificar los buckets privados y sus políticas. Configurar DOCUMENT_SIGNING_SECRET aleatorio de al menos 32 bytes. La aplicación firma enlaces de 60 segundos y vuelve a verificar sesión/tenant al descargar desde Storage.
6. Ejecutar `pnpm edge:build`. Desplegar `supabase functions deploy` con la configuración versionada y secretos del servidor. Los siete endpoints de usuario conservan el control JWT del gateway. `stripe-webhook`, `source-monitor` y `notify` validan firma/secreto/JWT en su handler, según corresponda.
7. Pasar pruebas reales de Auth, Storage, JWT, RLS, webhook y restauración antes de un piloto.

Las funciones implementadas son jurisdiction-recommend, case-create, case-advance, compliance-generate, regulatory-answer, source-monitor, source-ingest, checkout-create, stripe-webhook y notify. El código compartido fuente está en `packages/edge/handler.ts`; no editar manualmente el bundle generado.

## Fuentes y reglas

Entrar como compliance/admin, consultar fuente, descargar el snapshot privado y revisar la sección. Documentar la decisión antes de aprobar la fuente. Crear un borrador con evidencia y valores verificados; publicar en una segunda acción explícita. Una regla publicada se corrige creando otra versión. Si la fuente cambió, primero resolver la revisión del cambio. Un error de descarga conserva el bloqueo.

Los PDF y las páginas que rechazan consultas requieren un extractor revisado o una fuente oficial alternativa aprobada y agregada al catálogo. No cambiar user agent para eludir controles, usar mirrors no oficiales ni pegar datos como si fueran capturados por el monitor.

Los importes semilla son candidatos; para Delaware comparar código, instrucciones específicas y FAQ general y confirmar fecha efectiva. Para Reino Unido mantener diferenciadas las medidas actuales de identidad y las futuras medidas de presentación ACSP.

## Stripe test y suscripciones

Configurar STRIPE_SECRET_KEY `sk_test_...`, STRIPE_WEBHOOK_SECRET y un STRIPE_COMPLIANCE_PRICE_ID anual de prueba. Verificar el importe/moneda del precio de suscripción en Stripe; el cliente lo revisa en Checkout. No se incluyen tasas gubernamentales ni cotizaciones de partners en la orden de plataforma.

Registrar checkout.session.completed, checkout.session.async_payment_succeeded y customer.subscription.created/updated/deleted. Usar **una** URL de webhook por entorno: `/api/stripe-webhook` de Next o la función Edge correspondiente. Probar firma, repetición, pago pendiente, monto incorrecto, modo live, tenant equivocado y eventos fuera de orden. No confirmar pago desde el redirect de éxito.

En local, Stripe CLI puede reenviar eventos al endpoint. No registrar cuerpos completos, claves, tarjetas ni datos de identidad en logs. Una suscripción activa no habilita presentaciones reguladas.

## OpenAI

Configurar OPENAI_API_KEY y OPENAI_MODEL del lado servidor. Se usa Responses con `store:false`, función estricta y una sola llamada. La herramienta conserva exactamente pregunta y jurisdicción y retorna los hechos del motor. Sin clave o ante error se usa el motor determinista; no se completa la respuesta con memoria del modelo. No se envían documentos ni perfiles a OpenAI.

## Monitoreo y recordatorios

Crear un usuario exclusivo de automatización con rol compliance y membresía activa, y configurar AUTOMATION_USER_ID y SOURCE_MONITOR_SECRET (mínimo 32 caracteres) en Edge. Guardar URL base de funciones y secreto en Vault con los nombres del script `supabase/operations/schedule.sql`. Revisar y aplicar ese script para consultar fuentes cada 30 minutos, en lotes de tres, y generar recordatorios cada hora. No hay automatización alojada creada por este repositorio sin esas credenciales.

Los recordatorios internos se generan a 30, 7, 1 y 0 días, con clave única por obligación/fecha/ventana. Completados, fechas no confirmadas y fuentes vencidas no se notifican como hechos actuales. El email permanece EXTERNAL_BLOCKED: contratar proveedor, consentimientos, autenticación de dominio y webhook de entrega antes de implementarlo. `sent` en canal `in_app` significa disponible en el panel, no entregado por correo.

## Incidentes y recuperación

- Fuente incorrecta o comprometida: marcar cambio/revisión, bloquear publicación y obligaciones, conservar snapshots y revisar impacto; nunca borrar la evidencia para desbloquear.
- Pago incierto: reintentar la misma clave y reconciliar sesión/evento en Stripe. No crear otro cargo ni editar paid manualmente.
- Integración externa caída: devolver EXTERNAL_BLOCKED, mantener tareas pendientes y continuar preparación no regulada.
- Acceso indebido: revocar sesión/rol y rotar secretos afectados, preservar auditoría, evaluar notificación legal con profesionales.
- Base de datos: habilitar backups/PITR según plan de Supabase y ensayar restauración en un proyecto aislado. La carpeta local no es un backup de producción.
- Despliegue fallido: revertir código a una versión compatible. No revertir migraciones borrando tablas de negocio; crear correcciones hacia adelante.

Alertar sobre source_monitor_runs fallidos, reglas sin evidencia vigente, colas de revisión, errores 5xx y webhooks rechazados. Este repositorio incluye registros y vistas internas; el transporte de alertas externas y la guardia operativa siguen pendientes.

## CI y aceptación

GitHub Actions define lint, TypeScript, pruebas, build, navegador, Deno y Supabase reset/RLS. Marcar esos jobs como checks requeridos en protección de rama; los archivos YAML por sí solos no impiden un merge. El remoto está configurado y CI alojado aprobó el commit publicado documentado en `BUILD_STATUS.md`; eso no verifica todavía el proyecto Supabase staging. Docker no estaba operativo en la máquina de construcción; las pruebas SQL ejecutadas localmente usan PGlite.

Eventos distintos de suscripción con el mismo timestamp se bloquean con SUBSCRIPTION_RECONCILIATION: revisar el estado canónico en Stripe antes de aplicar una actualización administrativa auditada. Un evento posterior no reactiva una suscripción cancelada. Las escrituras usan precondición de versión para que los reintentos no reviertan eventos concurrentes.
