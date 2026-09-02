# Nexo · Company OS

MVP de orquestación de constitución y cumplimiento para fundadores internacionales. Interfaz en español LATAM. Cuatro productos: Delaware LLC, Wyoming LLC, Estonia OÜ y Reino Unido Ltd.

**El sandbox funciona localmente. No constituye compañías, cobra dinero, verifica identidades ni ofrece asesoría legal.** Las integraciones que requieren credenciales o contratos permanecen bloqueadas; no se presentan como operativas.

## Inicio rápido

Requisitos: Node.js 24 y pnpm 11.19.0.

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

Abre [la aplicación local](http://127.0.0.1:3000). Crea una cuenta con datos ficticios y una contraseña de al menos 12 caracteres. Completa la evaluación, elige una ruta y confirma un pago simulado. Para explorar pasos internos, usa «Entrar a operaciones sandbox» desde el acceso o la configuración.

El sitio público abre en inglés por defecto y permite cambiar a español latinoamericano con EN/ES. La preferencia se conserva por navegador durante un año y se aplica a todas las páginas públicas, incluidos avisos de sandbox y borradores legales. El acceso y el panel permanecen en español. No cambia las reglas ni sus evidencias. Nexo es una marca provisional pendiente de selección.

El sandbox usa PostgreSQL embebido (PGlite), las mismas migraciones y políticas RLS. Guarda datos y documentos en `.local/`, excluido de Git. Las evidencias sintéticas tienen una fecha fija y caducan: después de 24 horas el producto solicita revisión. No cambia automáticamente esa fecha. En un sandbox **nuevo**, `SANDBOX_FIXTURE_TIME` permite establecer una fecha de prueba; nunca habilita reglas en Supabase. Las pruebas E2E de CI usan una base nueva y una fecha de fixture explícita.

Playwright asigna `SANDBOX_DATA_DIR` a una base PGlite aislada cuando inicia su propio servidor. Si reutiliza un servidor de desarrollo ya abierto, conserva deliberadamente su base y su vigencia; ejecuta CI en un entorno limpio para la aceptación reproducible.

## Validación

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Playwright usa Edge en Windows y Chromium en CI. En Linux instala Chromium con `node node_modules/@playwright/test/cli.js install --with-deps chromium`. `pnpm build` genera las diez Edge Functions y compila Next.js.

## Activación externa

Copia `.env.example` a `apps/web/.env.local`, usa `APP_MODE=supabase` y configura solo claves de prueba. Despliega las migraciones y el seed en un proyecto Supabase separado. El seed **no contiene reglas ACTIVE**: captura fuentes, revisa evidencia y publica nuevas versiones desde administración. Stripe solo admite claves `sk_test_`; la suscripción requiere además un precio anual autorizado. Nunca publiques el modo sandbox local como servicio multiusuario.

Consulta [RUNBOOK](docs/RUNBOOK.md) para Auth, Storage, Edge Functions, Stripe, automatización, pruebas y recuperación. [BUILD_STATUS](docs/BUILD_STATUS.md) diferencia lo comprobado localmente de los bloqueos pendientes. [SECURITY](docs/SECURITY.md) describe los límites antes de incorporar datos reales.

Para los próximos pasos del fundador, consulta [roadmap de accesos y servicios](docs/LAUNCH_ROADMAP.md) y [propuesta de nombres de marca](docs/BRAND_NAMING.md). Lovable es opcional y no sustituye este repositorio ni sus migraciones.

El [acceso Google y seguimiento privado](docs/GOOGLE_AUTH.md) incluye configuración pendiente, límites y pruebas. El panel muestra progreso y actividad registrada por ruta; preparar un resumen no constituye una compañía ni ejecuta un agente autónomo. Google permanece bloqueado hasta configurar el proveedor.

La activación por dominios está definida en [verticales Supabase](docs/SUPABASE_VERTICALS.md); la diferencia entre una simulación completa y una constitución real está en [aceptación de agentes](docs/AGENT_ACCEPTANCE.md). Para evaluar hosting sin reescribir a ciegas, usa el [spike de Lovable](docs/LOVABLE_EVALUATION.md) y el paquete de contexto en `lovable/`.

## Estructura

`apps/web` contiene la experiencia Next.js; `packages` los motores independientes; `jurisdictions` los cuatro adaptadores; `supabase` las migraciones, RLS, funciones y pruebas; `regulatory` el catálogo oficial y las reglas candidatas; `tests` las pruebas de dominio, PostgreSQL y navegador.

Documentación: [Arquitectura](docs/ARCHITECTURE.md), [datos](docs/DATA_MODEL.md), [motor regulatorio](docs/REGULATORY_ENGINE.md), [jurisdicciones](docs/JURISDICTIONS.md), [política de fuentes](docs/SOURCE_POLICY.md), [modelo comercial](docs/BUSINESS_MODEL.md).
