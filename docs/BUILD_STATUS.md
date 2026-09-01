# Estado de construcción

Actualizado: 2026-09-01. Repositorio inicialmente vacío. Git local inicializado en `main` y publicado en el remoto privado de GitHub.

**MVP funcional en sandbox, con validación local aprobada. El Definition of Done conectado sigue bloqueado por credenciales, revisión humana y validación alojada. No es un lanzamiento de producción.**

| Hito | Resultado | Estado |
|---|---|---|
| M1 Foundation | Next.js, TypeScript, pnpm, entorno, Git y estructura modular | IMPLEMENTADO |
| M2 Supabase + RLS | 55 tablas, diez migraciones, aislamiento, RPC transaccional y Storage privado | VALIDADO EN PGLITE; SUPABASE COMPLETO PENDIENTE |
| M3 Fuentes | 22 fuentes, 19 capturas directas, hashes, snapshots privados y monitor | IMPLEMENTADO; 3 FUENTES BLOQUEADAS |
| M4 Reglas | Versiones, fechas, evidencia, edición, publicación humana, supersesión y bloqueo por cambios | VALIDADO |
| M5 Onboarding | Cuenta, fundador, residencia, negocio, titularidad declarada, cuestionario y consentimiento | VALIDADO EN SANDBOX |
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
| M19 QA/CI | 79 pruebas unitarias/SQL, ocho E2E, lint, TypeScript y build | LOCAL APROBADO; CI REMOTO PENDIENTE |
| M20 Documentación | README, arquitectura, datos, seguridad, fuentes, jurisdicciones, modelo y runbook | ENTREGADO |

## Evidencia ejecutada

- pnpm check: lint sin errores ni advertencias, TypeScript, 79 pruebas y build optimizado aprobados.
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

### Activación externa pendiente

El flujo local, las pruebas de aislamiento y GitHub Actions funcionan. No se afirma que el checkout haya cobrado en Stripe test externo ni que Supabase Auth/Storage alojado esté validado. Se requieren:

1. Proyecto y credenciales Supabase; Docker operativo para reset, pgTAP y gateway/GoTrue/Storage completos.
2. Credenciales Stripe test, precio anual autorizado y prueba de webhook de extremo a extremo.
3. Revisión humana de fuentes, fechas efectivas, contradicción de Delaware y publicación de reglas reales. Dos páginas de Estonia devuelven 403; el PDF de Wyoming requiere extractor revisado.
4. Contratos y autorizaciones de agentes, ACSP/RIK, KYC, screening, firmas y correo. Los adaptadores reales siguen EXTERNAL_BLOCKED.
5. Configurar protección de `main` con los workflows aprobados como checks requeridos.
6. MFA, antimalware, backups/restauración, observabilidad, privacidad/términos finales y revisión profesional antes de datos reales.

## Hallazgos regulatorios

Delaware: código e instrucciones específicas indican USD 400; la FAQ general conserva USD 300. Se exige revisión de discrepancia y fecha efectiva. FinCEN y ACSP se contrastaron con publicaciones de 2026, sin reutilizar supuestos históricos. Ver SOURCE_POLICY.md y JURISDICTIONS.md para fuentes y contexto.
