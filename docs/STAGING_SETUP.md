# Conexión de Supabase staging: Singapur

Actualizado: 2026-09-02. Destino proporcionado por el fundador: `keboldglfjonxcdnmyee`, URL `https://keboldglfjonxcdnmyee.supabase.co`. Región esperada: `ap-southeast-1`; pendiente de verificar mediante acceso autenticado. El proyecto anterior `uvmijrapoezpvtsyhhoj` queda excluido de este despliegue.

El descriptor público está en `supabase/environments/staging.json`. No contiene credenciales y no enlaza por sí mismo la CLI ni configura la aplicación. Estado actual: `EXTERNAL_BLOCKED` por autenticación pendiente. Solo datos ficticios; sin cobros ni presentaciones reales. No se solicitó borrar ningún proyecto.

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
- Configurar Auth y las variables del servidor por canal seguro. Para el ensayo local contra staging, usar `APP_ORIGIN=http://127.0.0.1:3000`, site URL correspondiente y callback exacto `http://127.0.0.1:3000/auth/callback`. Mantener confirmación de email; no aplicar automáticamente toda la configuración local al remoto. El hosting futuro reemplazará estos orígenes de prueba con sus URL HTTPS.
- Mantener el modo local actual hasta configurar las claves y verificar Auth. `APP_MODE=supabase` selecciona infraestructura alojada; no habilita automáticamente partners o pagos. Generar `DOCUMENT_SIGNING_SECRET` aleatorio en el servidor sin imprimirlo.
- Generar el bundle con `pnpm edge:build` y desplegar solo las diez funciones previstas al project ref explícito. Mantener la configuración JWT versionada y comprobar compatibilidad con las claves del proyecto; no deshabilitar validación JWT como solución a un error de autorización.
- No activar Stripe, correo, cron ni consultas programadas de fuentes durante este hito. No crear usuarios privilegiados desde metadatos de registro.

## Pruebas alojadas pendientes

1. Auth y JWT: sesión válida, token ausente, vencido o alterado; intento de elevar rol mediante metadatos. Crear identidades ficticias de prueba sin enviar correos externos. La entrega real de confirmación/callback requiere un buzón de prueba autorizado aparte.
2. RLS: dos organizaciones y datos distintos; aislamiento en ambas direcciones con JWT de cliente, denegación de escrituras privilegiadas y de lectura de borradores regulatorios.
3. Storage: documentos ficticios, cuarentena, rechazo anónimo y entre organizaciones, enlaces firmados y vencimiento.
4. Edge: respuesta autorizada, errores de autenticación y ausencia de secretos en logs. Verificar los tres handlers con autenticación propia sin omitir los siete controles JWT del gateway.
5. Onboarding y expedientes: persistencia real y bloqueo honesto cuando faltan reglas revisadas, pagos o partners. No publicar reglas sintéticas en remoto para forzar recomendaciones; el recorrido simulado completo continúa en la base local aislada.

La conexión alojada no se declara aprobada hasta guardar resultados de estas pruebas. Singapur y Hong Kong siguen siendo candidatas de expansión, no rutas activas del catálogo.
