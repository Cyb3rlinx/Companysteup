# Estado de construcción

Actualizado: 2026-09-03. Repositorio inicialmente vacío. Git local inicializado en `main` y publicado en el remoto privado de GitHub.

Punto de continuidad guardado en [SESSION_HANDOFF.md](SESSION_HANDOFF.md). El hito `c9d0ef7` aprobó CI application/edge/supabase ([33683581914](https://github.com/Cyb3rlinx/Companysteup/actions/runs/33683581914)) y Regulatory integrity ([33683581953](https://github.com/Cyb3rlinx/Companysteup/actions/runs/33683581953)). Guardar este estado solo agrega documentación; no representa otra ejecución de las pruebas funcionales.

**MVP funcional local y Supabase staging validado con datos sintéticos. El Definition of Done de operación real sigue bloqueado por partners, revisión humana, hosting y controles operativos. No es un lanzamiento de producción.**

| Hito | Resultado | Estado |
|---|---|---|
| M1 Foundation | Next.js, TypeScript, pnpm, entorno, Git y estructura modular | IMPLEMENTADO |
| M2 Supabase + RLS | 55 tablas, diez migraciones, aislamiento, RPC transaccional y Storage privado | DESPLEGADO Y VALIDADO EN STAGING SINTÉTICO |
| M3 Fuentes | 22 fuentes, 19 capturas directas, hashes, snapshots privados y monitor | IMPLEMENTADO; 3 FUENTES BLOQUEADAS |
| M4 Reglas | Versiones, fechas, evidencia, edición, publicación humana, supersesión y bloqueo por cambios | VALIDADO |
| M5 Onboarding | Cuenta, fundador, residencia, negocio, titularidad declarada, cuestionario y consentimiento | VALIDADO LOCAL Y SUPABASE ALOJADO |
| M6 Recomendación | Cuatro productos, afinidad explicable, costos separados y evidencia | VALIDADO |
| M7 Workflow | Responsables, pasos, precondiciones, pago y concurrencia | VALIDADO |
| M8 Delaware | Preparación, agente, registro/EIN simulados y obligaciones | VALIDADO EN SANDBOX; PARTNER BLOQUEADO |
| M9 Wyoming | Constitución, informe y fórmula de activos | VALIDADO EN SANDBOX; PARTNER BLOQUEADO |
| M10 Estonia | e-Residency, domicilio/contacto, firmas y requisitos RIK | VALIDADO EN SANDBOX; RIK/PARTNER BLOQUEADOS |
| M11 Reino Unido | Directores/PSC, identidad, autopresentación/ACSP y cumplimiento | VALIDADO EN SANDBOX; ACSP BLOQUEADO |
| M12 Cumplimiento | Fechas, importes, períodos posteriores, recálculo auditable, calendario y .ics | VALIDADO |
| M13 Cliente | Panel, casos, tareas, compañías, documentos privados, soporte y perfil | VALIDADO EN NAVEGADOR |
| M14 Administración | Fuentes, reglas, casos, revisiones, alertas y auditoría | VALIDADO EN NAVEGADOR |
| M15 Stripe | Checkout test, firma, idempotencia, monto/moneda, suscripción y orden de eventos | ADAPTADOR IMPLEMENTADO; CREDENCIALES BLOQUEADAS |
| M16 Asistente | Herramienta estricta, hechos verificados, fallback determinista y escalamiento | VALIDADO; OPENAI REAL SIN CREDENCIAL |
| M17 Notificaciones | Recordatorios internos 30/7/1/0 días, deduplicación y jobs desplegables | VALIDADO; EMAIL/JOBS REMOTOS BLOQUEADOS |
| M18 Seguridad | RLS, CSRF, límites, secretos, cuarentena, integridad y fronteras de IA | PRUEBAS LOCALES APROBADAS; HARDENING OPERATIVO PENDIENTE |
| M19 QA/CI | 127 pruebas unitarias/SQL y 11 E2E locales; integración alojada detallada abajo | APROBADO; VER EVIDENCIA DEL HITO ACTUAL |
| M20 Documentación | README, arquitectura, datos, seguridad, fuentes, jurisdicciones, modelo y runbook | ENTREGADO |
| M21 Laboratorio por jurisdicción | Ocho perfiles de investigación, 27 escenarios, mapa de campos/enlaces y eventos auditables | VALIDADO LOCAL; SIN PRESENTACIÓN EXTERNA NI LLM CONECTADO |
| M22 Acceso y seguimiento | Google OAuth preparado; panel cliente/admin con preparación registrada, responsables y actualización automática | PANEL VALIDADO; GOOGLE EXTERNAL_BLOCKED HASTA CONFIGURAR PROVEEDOR |

## Hito actual: UK, acceso Google y seguimiento privado (2026-09-03)

- UK se incorpora al laboratorio y a la primera tanda de validación: US-WY, US-DE, EE, GB. Cinco escenarios UK distinguen datos faltantes, verificación de directores, vínculo PSC y nación del domicilio. Fuentes GOV.UK consultadas; observaciones pendientes de revisión, sin publicar reglas regulatorias.
- Google OAuth implementado mediante Supabase SSR/PKCE, cookies HttpOnly, retorno fijo, scopes mínimos, control de origen y límites. El botón permanece deshabilitado en PGlite y en el staging actual: la consulta autenticada de configuración confirma Google deshabilitado. Falta Client ID/Secret en el proveedor y ensayo externo con cuenta de prueba; no se simula identidad Google. Ver `GOOGLE_AUTH.md`.
- Panel privado, detalle del expediente y admin muestran pasos, responsable, bloqueos, asistente por ruta y actividad persistida. La actualización cada 25 segundos sincroniza también las tarjetas existentes; no es Supabase Realtime. Solo se presenta una ejecución en curso cuando existe un inicio registrado reciente.
- Preparar resumen ejecuta el motor determinista con datos ya guardados y registra inicio/final/fallo, versión y revisión. No llama a un LLM, no paga, no envía información externa y no cambia el workflow. Los resúmenes anteriores se marcan desactualizados. No se confirma constitución real sin la futura integración y conciliación de evidencia.
- Repositorio permite ordenar antes de limitar resultados: hasta 100 casos/100 eventos recientes por caso. Prueba SQL con más de 1.000 eventos verifica lectura reciente y RLS. Metadatos OAuth falsificados no elevan roles ni conceden otra organización.
- Validación local: lint, TypeScript, 127 pruebas unitarias/SQL, 11 E2E y build aprobados. Laboratorio: 27 escenarios/8 perfiles; cero presentaciones. El navegador verifica renovación automática, aislamiento, callbacks inválidos, CSRF y vistas de escritorio/móvil.
- Revalidación alojada con la compilación actual: 16/16 grupos aprobados en Singapur, incluidos seguimiento, preparación UK persistida, aislamiento y bloqueos Google/laboratorio. Ver run y límites en `STAGING_VALIDATION.md`. No equivale a Google OAuth externo completado ni a constitución real.
- Sin migraciones nuevas, habilitación de pagos, publicación de reglas ni modificaciones de proveedores. El siguiente paso es revisar los paquetes de las cuatro rutas con un responsable humano y validar el canal autorizado de entrega; en paralelo se puede configurar Google. Stripe, marca y dominio siguen diferidos.

## Hito anterior: alcance de agentes y ensayo por jurisdicción (2026-09-03)

- Laboratorio autenticado en `/laboratorio-agentes`, con acceso desde el espacio privado. Clientes únicamente en sandbox; en Supabase solo roles internos. No es publicación de guías regulatorias para clientes reales.
- Siete perfiles versionados: US-WY, US-DE, EE, LT, AE-DU, SG, HK. Las cuatro candidatas nuevas permanecen fuera del catálogo comercial; GB se conserva fuera de esta campaña. Fuentes públicas revisadas y excepciones documentadas en `COUNTRY_SERVICE_VALIDATION.md`.
- Supervisor determinista: campos y destinos, responsables, límite de entrega y fuente, con revisión humana pendiente. No se activó modelo externo, entrenamiento automático ni navegación autenticada en registros.
- 22 escenarios sintéticos; contempla datos faltantes, Wyoming/nombre A, EIN con domicilio principal extranjero, firma/API RIK, autoridad de Dubái, director SG y secretario HK. Fuentes trasladadas/vencidas bloquean; jamás se marca un registro real.
- Nuevo E2E con usuario ficticio, onboarding, tres expedientes y auditoría de evaluaciones. Verifica casos ajenos, CSRF, permisos/URLs inyectados, jurisdicción incorrecta y que no cambian workflow, órdenes ni compañías. Escritorio, móvil y descarga del informe comprobados.
- Validación: 107 pruebas unitarias/SQL y nueve E2E aprobados; repetición específica del laboratorio aprobada. TypeScript, lint y build optimizado aprobados. `pnpm test:agents` genera `.local/qa/agent-journeys.json`; CI ejecuta ese comando y conserva solo ese informe sintético como artifact.
- Las trazas de investigación se vinculan únicamente a casos del sandbox local. En Supabase se impide escribirlas en historiales de clientes, incluso a operadores internos; el laboratorio interno sigue disponible sin vinculación.
- Sin cambios de migraciones, RLS, credenciales ni despliegue de Supabase. La validación alojada de 14 grupos del hito anterior sigue siendo evidencia histórica, no una prueba nueva de estas guías.
- Siguiente puerta: revisión humana del paquete US-WY/US-DE/EE y entrega a proveedores autorizados; después evaluación conversacional del modelo y ampliación del admin existente. Stripe, marca y dominio continúan diferidos.

## Evidencia ejecutada

- pnpm check: lint sin errores ni advertencias, TypeScript, 82 pruebas y build optimizado aprobados.
- pnpm test:e2e: ocho pruebas aprobadas con Edge; registro, cuestionario, cuatro recomendaciones, pago simulado, cuatro workflows, compañías, obligaciones, recordatorio efectivo, deduplicación e idioma público.
- Documento: cuarentena, aprobación interna, descarga con sesión/enlace firmado y rechazo anónimo.
- Pantallas públicas, administración y panel móvil; capturas en .local/qa, fuera de Git.
- Diez Edge Functions generadas desde servicios compartidos. Sus controles de autenticación tienen pruebas; el runtime Deno/Supabase desplegado no se ejecutó localmente.
- 19 capturas oficiales de 22 entradas; todas CAPTURED_NOT_APPROVED. Ninguna se publicó como aprobación real.

## Definition of Done: límites pendientes

### Ampliación: sitio bilingüe, roadmap y marca (2026-09-01)

- Sitio público en inglés por defecto, incluso con navegador configurado en español. Selector EN/ES con preferencia de un año en cookie HttpOnly/SameSite=Lax; Secure en producción.
- Las doce rutas públicas conservan traducción, avisos, límites, metadatos e idioma accesible. Acceso y panel siguen en español, también al navegar sin recargar. No se agregó ninguna jurisdicción ni se modificaron reglas, RLS o permisos.
- Tres E2E nuevos: idioma inicial y persistencia, SSR, recorridos públicos, teclado, anchos de 320/390/768/1024 px, cookie inválida y rechazo de acceso protegido incluso con un encabezado de presentación falsificado.
- Validación posterior: lint limpio, TypeScript aprobado, 79 pruebas unitarias/SQL, ocho E2E y build de producción aprobados. Capturas EN/ES de escritorio y móvil revisadas en `.local/qa`.
- Entregados `LAUNCH_ROADMAP.md` con accesos, responsables y criterios de cierre, y `BRAND_NAMING.md` con cinco opciones, filtro web limitado y revisión pendiente. Nexo no se ha reemplazado ni se ha confirmado disponibilidad de ningún nombre.
- No se conectaron ni contrataron servicios. Lovable queda opcional; no se promete importar este repositorio existente. Los bloqueos del DoD conectado permanecen vigentes.

### Ampliación: Supabase, Lovable y aceptación de agentes (2026-09-01)

- Trece verticales Supabase catalogadas sin duplicar tablas; un proyecto separado por entorno. Una prueba garantiza cobertura de las 55 tablas y diez Edge Functions.
- Paquete `lovable/` generado para un spike privado: conocimiento, prompt, tokens y contexto JSON derivado de los workflows. No contiene secretos ni se presenta como importación del codebase.
- Trece casos de aceptación nuevos cubren las cuatro rutas: propiedad/automatización, simulación completa, marca `MOCK`, confirmación antes de registro y bloqueos reales de partner/gobierno.
- Estado comprobado: el producto cubre onboarding y preparación en sandbox. La constitución real sigue no probada y `EXTERNAL_BLOCKED`; Stripe se pospone por decisión del fundador.
- PowerShell dispone de Git 2.53 y Git Credential Manager. `main` fue publicado en `Cyb3rlinx/Companysteup`; GitHub CLI no está instalado.
- Primera ejecución alojada: application, Supabase y Regulatory integrity aprobaron; Edge falló porque Deno 2.9 detectó el `package.json` del monorepo y usó `nodeModulesDir=manual` sin instalación. Se fijó Deno 2.9.6, `nodeModulesDir=auto`, lockfile y un paso explícito `deno install --frozen`. La ejecución corregida `33526706477` aprobó application, Edge y Supabase; Regulatory integrity aprobó en `33526706237`.

### Región y candidatas asiáticas: 2026-09-02

- Se recibió el project ref de Supabase; el fundador reporta región Japón. No se autenticó ni se desplegó el proyecto en este hito. La recomendación provisional para un staging nuevo es Singapore (`ap-southeast-1`), por el entorno inicial de pruebas y captación en Bangkok; producción exige mediciones y revisión de datos.
- La investigación oficial respalda evaluar SG Pte. Ltd. y HK private company limited by shares con partners y controles humanos. Continúan `EXTERNAL_BLOCKED` como candidatas de expansión, sin activar nuevas jurisdicciones ni reglas por interpretación de IA. Ver `REGION_AND_ASIA_FEASIBILITY.md` para fuentes, límites y condiciones.
- Cambio documental; `pnpm test` aprobó 79 pruebas existentes y `pnpm typecheck` aprobó. No se añadieron pruebas ni flujos de SG/HK: este resultado no valida la expansión operativa.

### Preparación de staging Singapur: 2026-09-02

- Nuevo destino autorizado `keboldglfjonxcdnmyee`, región Singapur reportada por el fundador. Descriptor sin secretos en `supabase/environments/staging.json`; región pendiente de verificación autenticada. No se enlazó ni modificó el remoto.
- Supabase CLI 2.116.0 instalada como dependencia fija; `pnpm supabase --version` verificado. La CLI confirmó ausencia de sesión. Se inició login oficial y se espera intervención del titular en navegador/terminal; no se pidieron tokens ni contraseñas por chat.
- Seed corregido para no duplicar ni reemplazar precios de catálogo en reintentos. Tres pruebas adicionales verifican repetición, ausencia de identidades/aprobaciones/evidencia y denegación anónima de reglas pendientes. `pnpm check` aprobado: lint, typecheck, 82 pruebas y build; instalación congelada y check Deno aprobados para las diez Edge Functions. Estos resultados locales no equivalen a despliegue alojado.
- Checklist y consulta SQL de lectura preparados en `STAGING_SETUP.md` y `supabase/operations/staging-verification.sql`. El sandbox local se mantiene sin cambios de modo; Supabase alojado sigue `EXTERNAL_BLOCKED` hasta completar login, despliegue y pruebas.

### Supabase alojado y onboarding real de infraestructura: 2026-09-02

- Login completado por el fundador. Región `ap-southeast-1` y proyecto activo confirmados; Japón no fue tocado. Preflight vacío, diez migraciones y seed aplicados, diez funciones Edge desplegadas y activas.
- Auth configurado con contraseña mínima de 12, email confirmado, TOTP conservado y callbacks locales exactos. El CLI falló al configurar Storage global por una función opcional del plan pago; no se contrató nada y los límites/permisos de buckets migrados están verificados.
- `pnpm test:staging`: 14/14 grupos aprobados, incluyendo JWT reales, intentos de elevar rol, RLS entre dos organizaciones, Edge, Storage, cuarentena, vencimiento de enlaces y onboarding en navegador. Ver `STAGING_VALIDATION.md` para resultados y límites.
- Las cuatro rutas generan expedientes GUIDED; no se aprobaron reglas ni identidades ficticias, no se liquidaron pagos ni se registraron compañías. La aprobación de un documento fue solo un fixture técnico de Storage auditado, luego rechazado y su blob eliminado.
- Scripts de inicio y pruebas limitados al staging sintético; secretos solo en archivos locales ignorados, sin acceso de operaciones sandbox. Frontend conectado disponible localmente en puerto 3100; hosting aún pendiente.
- Regresión: lint, 82 pruebas unitarias/SQL, TypeScript, build y ocho E2E locales aprobados. El primer E2E local detectó un timeout durante compilación/API e inicialización fría de PGlite: se espera explícitamente el resultado del signup antes de comprobar navegación, sin reintentos automáticos ni relajar controles funcionales. El CI del commit previo `fd830a4` aprobó application/Edge/Supabase (`33637313250`) y Regulatory integrity (`33637313214`); verificar el nuevo commit en GitHub Actions después del push.

### Activación externa pendiente

El flujo local y la infraestructura Supabase alojada funcionan con datos sintéticos. No se afirma que el checkout haya cobrado en Stripe externo ni que exista una constitución real. Se requieren:

1. Hosting de staging, correo y validación de confirmación/recuperación de cuenta; mantener Docker/pgTAP y gateway completos en CI. El acceso y despliegue Supabase ya están completados.
2. Credenciales Stripe test, precio anual autorizado y prueba de webhook de extremo a extremo.
3. Revisión humana de fuentes, fechas efectivas, contradicción de Delaware y publicación de reglas reales. Dos páginas de Estonia devuelven 403; el PDF de Wyoming requiere extractor revisado.
4. Contratos y autorizaciones de agentes, ACSP/RIK, KYC, screening, firmas y correo. Los adaptadores reales siguen EXTERNAL_BLOCKED.
5. Configurar protección de `main` con los workflows aprobados como checks requeridos.
6. MFA, antimalware, backups/restauración, observabilidad, privacidad/términos finales y revisión profesional antes de datos reales.

## Hallazgos regulatorios

Delaware: código e instrucciones específicas indican USD 400; la FAQ general conserva USD 300. Se exige revisión de discrepancia y fecha efectiva. FinCEN y ACSP se contrastaron con publicaciones de 2026, sin reutilizar supuestos históricos. Ver SOURCE_POLICY.md y JURISDICTIONS.md para fuentes y contexto.
