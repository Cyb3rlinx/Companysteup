# Conexión de Supabase staging: Singapur

Actualizado: 2026-09-02. Destino proporcionado por el fundador: `keboldglfjonxcdnmyee`, URL `https://keboldglfjonxcdnmyee.supabase.co`. Región `ap-southeast-1` verificada mediante la API de administración, estado `ACTIVE_HEALTHY`. El proyecto anterior `uvmijrapoezpvtsyhhoj` queda excluido de este despliegue y no fue modificado.

El descriptor público está en `supabase/environments/staging.json`. No contiene credenciales. Estado: `SANDBOX` por su uso exclusivo con datos sintéticos, sobre infraestructura Supabase real y `APP_MODE=supabase`. Las diez migraciones, el seed pendiente de revisión y las diez funciones Edge están desplegados. Esto no habilita pagos, identidad, presentaciones ni aprobaciones regulatorias reales.

## Ejecución local contra staging

El login CLI ya está completo. Las credenciales se obtuvieron mediante la sesión autorizada y se guardaron únicamente en `.local/staging/credentials.json`, ignorado por Git. Contiene `projectRef`, `url`, `anonKey`, `publishableKey` y `serviceRoleKey`; no copiar su contenido a docs, logs, chats ni al navegador. El servidor genera su secreto de documentos en `.local/staging/server.json`, también ignorado. En otro equipo se deben aprovisionar mediante un canal seguro.

```powershell
pnpm build
pnpm start:staging
# En otra terminal, desde la misma raíz:
pnpm test:staging
```

Abrir `http://127.0.0.1:3100`. El launcher no modifica el sandbox del puerto 3000 y fuerza Stripe, IA externa, correo, KYC y partners sin credenciales. El proceso necesita acceso de red a Supabase; en un entorno restringido, un error de red puede aparecer como fallo del rate limit. No debilitar el RPC ni RLS para resolverlo.

El runner exige el descriptor del staging autorizado y `--synthetic-only`, crea dos cuentas `@example.test` confirmadas mediante Admin API **sin enviar correo**, y conserva los registros ficticios para auditoría. Solo borra los objetos Storage que creó en esa ejecución, dejando sus metadatos rechazados. El reporte saneado queda en `.local/staging/report.json`; no forma parte del CI automático ni corre contra producción.

Auth remoto confirmado: contraseña mínima de 12 caracteres, confirmación de email, TOTP conservado, OTP de ocho dígitos y frecuencia de correo de un minuto. Callbacks exactos para localhost/127.0.0.1 en 3000 y 127.0.0.1 en 3100. `APP_ORIGIN` de Edge apunta a 3100. SMTP, entrega de correos y callback desde buzón real siguen sin probar.

La CLI 2.116.0 aplicó Auth, pero `config push` terminó con HTTP 402 al intentar configurar buckets vectoriales opcionales en el plan gratuito. No se contrató ningún plan. Una segunda revisión confirmó Auth actualizado y Storage global aún en 50 MiB; no repetir indiscriminadamente `config push`. Las migraciones sí establecieron límites por bucket: customer/company 10 MiB, snapshots 32 MiB (migración 009) y public-assets 2 MiB. La aplicación limita documentos a 10 MiB. Los buckets documentales son privados; public-assets es público intencionalmente.

## Herramienta y login

Supabase CLI 2.116.0 está fijada como dependencia de desarrollo. En PowerShell, desde la raíz del repositorio:

```powershell
pnpm supabase --version
pnpm supabase login --name CompanySetupStaging --output-format text
```

Completar el flujo oficial en el navegador y escribir su código directamente en esa terminal. No enviarlo por chat. `--output-format text` permite el prompt interactivo cuando la CLI detecta un entorno de agente y escoge JSON automáticamente. No usar `--token` con un secreto literal en el historial.

El login requiere una acción del titular de la cuenta; la URL del proyecto no concede permisos. La CLI utiliza el almacenamiento nativo de credenciales cuando está disponible; no aceptar silenciosamente un fallback de credenciales en texto plano. En la ejecución restringida de Codex, el acceso a la configuración nativa de Windows requiere permiso del entorno. [Instalación oficial](https://supabase.com/docs/guides/local-development/cli/getting-started), [login de CLI](https://supabase.com/docs/reference/cli/supabase-login).

## Verificación antes de escribir

1. Consultar `pnpm supabase projects list --output json`. Comprobar que el destino coincide con el project ref del descriptor, que está operativo y que la región coincide. No mostrar ni guardar las API keys en el resultado de una herramienta.
2. Enlazar únicamente el destino autorizado:

```powershell
pnpm supabase link --project-ref keboldglfjonxcdnmyee
pnpm supabase migration list
pnpm supabase db push --dry-run
```

3. Si la CLI solicita contraseña de base de datos, introducirla directamente en la terminal. No ponerla en argumentos, docs ni Git.
4. Consultar metadatos del esquema y cantidades agregadas de usuarios/objetos mediante acceso SQL autorizado. Confirmar que es el staging nuevo y que no hay tablas o migraciones desconocidas. Ante diferencias, inspeccionar antes de aplicar nada; nunca reparar historial ni resetear el remoto para forzar coincidencia.
5. El plan esperado es aplicar las diez migraciones canónicas. El seed se revisa por separado; no usar `--include-seed` sin esa revisión. `db push --dry-run` no prueba RLS ni la aplicación, solo muestra el plan. [Referencia de db push](https://supabase.com/docs/reference/cli/supabase-db-push).

## Despliegue después del preflight

- Aplicar migraciones hacia adelante al proyecto verificado y luego importar `supabase/seed.sql` una vez mediante SQL autorizado. El seed contiene solo catálogos/candidatos pendientes; una repetición no debe duplicar o reemplazar el precio de catálogo existente. No cargar fixtures del sandbox local.
- Ejecutar `supabase/operations/staging-verification.sql`: lectura de cantidades, RLS, estados editoriales y buckets; no extrae identidades ni documentos. El resultado esperado inicial incluye 55 tablas públicas con RLS, reglas pendientes y cero aprobaciones/publicaciones/evidencia sintética. Esta consulta no sustituye pruebas de aislamiento con JWT reales.
- Configurar Auth y las variables del servidor por canal seguro. Para el ensayo local contra staging, usar `APP_ORIGIN=http://127.0.0.1:3100`, site URL correspondiente y callback exacto `http://127.0.0.1:3000/auth/callback`. Mantener confirmación de email; no aplicar automáticamente toda la configuración local al remoto. El hosting futuro reemplazará estos orígenes de prueba con sus URL HTTPS.
- Mantener el modo local actual hasta configurar las claves y verificar Auth. `APP_MODE=supabase` selecciona infraestructura alojada; no habilita automáticamente partners o pagos. Generar `DOCUMENT_SIGNING_SECRET` aleatorio en el servidor sin imprimirlo.
- Generar el bundle con `pnpm edge:build` y desplegar solo las diez funciones previstas al project ref explícito. Mantener la configuración JWT versionada y comprobar compatibilidad con las claves del proyecto; no deshabilitar validación JWT como solución a un error de autorización.
- No activar Stripe, correo, cron ni consultas programadas de fuentes durante este hito. No crear usuarios privilegiados desde metadatos de registro.

## Cobertura de pruebas alojadas

1. Auth y JWT: sesión válida, token ausente, malformado o alterado; intento de elevar rol mediante metadatos. Crear identidades ficticias de prueba sin enviar correos externos. La entrega real de confirmación/callback requiere un buzón de prueba autorizado aparte.
2. RLS: dos organizaciones y datos distintos; aislamiento en ambas direcciones con JWT de cliente, denegación de escrituras privilegiadas y de lectura de borradores regulatorios.
3. Storage: documentos ficticios, cuarentena, rechazo anónimo y entre organizaciones, enlaces firmados y vencimiento.
4. Edge: respuesta autorizada, errores de autenticación y ausencia de secretos en logs. Verificar los tres handlers con autenticación propia sin omitir los siete controles JWT del gateway.
5. Onboarding y expedientes: persistencia real y bloqueo honesto cuando faltan reglas revisadas, pagos o partners. No publicar reglas sintéticas en remoto para forzar recomendaciones; el recorrido simulado completo continúa en la base local aislada.

Los resultados ejecutados y sus límites se registran en `STAGING_VALIDATION.md`. Singapur y Hong Kong siguen siendo candidatas de expansión, no rutas activas del catálogo.
