# Company Setups — Estonia determinista y staging

- Fecha: 2026-09-14, Asia/Bangkok.
- Se implementó un catálogo Estonia OÜ de 24 campos con fuentes RIK/e-Residency, paquete sintético, onboarding `EE`, panel cliente/operaciones, evaluación de cuatro recorridos y bloqueo explícito de códigos personales/PIN2.
- La evaluación determinista `2026-09-14.1` aprobó 4/4 con cero solicitudes de modelo y cero acciones externas. `pnpm check` aprobó 182 pruebas y build; E2E aprobó 15/15.
- La migración 013 se aplicó al staging Singapur `keboldglfjonxcdnmyee`; 17/17 grupos alojados aprobaron, incluida RLS para `EE`. No hubo seed, Edge, pagos, identidad, firma, presentación ni compañía real.
- Fuentes públicas observadas: guía de constitución de RIK, e-Business Register y guías e-Residency de OÜ, domicilio/contacto, múltiples fundadores y capital. Permanecen `PENDING_REVIEW` y con reconsulta interna.
- Siguiente paso: ejecutar `corepack pnpm test:estonia-agent:connected` en la PowerShell privada. Solo 4/4 y cero acciones externas habilitan continuar UK.
