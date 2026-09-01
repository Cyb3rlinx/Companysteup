# Prompt de inicio para Lovable

Construye un spike privado de la experiencia descrita en PROJECT_KNOWLEDGE.md y context.generated.json. Antes de escribir código, crea un plan y enumera las diferencias entre tu stack y el repositorio Next.js de referencia.

Primera entrega:

1. Sitio público responsive en inglés por defecto, selector EN/ES persistente y las doce rutas públicas del contexto.
2. Acceso y workspace en español con onboarding de fundador, negocio, titularidad, consentimiento y comparación de exactamente cuatro jurisdicciones.
3. Expediente visual con todos los pasos del workflow generado, actor responsable, estado y bloqueo visible.
4. Datos sintéticos locales únicamente. Etiqueta visible `SANDBOX`; ninguna solicitud externa, pago, KYC, email o trámite.
5. Vista de evidencia que muestre fuente, vigencia y `requires_human_review`, sin afirmar valores regulatorios no incluidos en el contexto.

Restricciones:

- No crees nuevas jurisdicciones ni acortes los workflows.
- No uses metadata del usuario para roles.
- No expongas service role ni secretos en variables VITE o cliente.
- No marques un caso como registrado por una predicción o acción de IA.
- No recrees ni alteres el esquema Supabase: primero debe revisarse la compatibilidad con `supabase/migrations` del repositorio principal.
- No actives Lovable Cloud Database ni una integración Supabase sin autorización explícita y un proyecto staging vacío.
- No agregues Stripe hasta que la prueba de integración de constitución esté aprobada.

Entrega una tabla de paridad con: implementado, simulado, bloqueado y no compatible. Exportaremos este spike a un repositorio GitHub separado y ejecutaremos pruebas antes de decidir hosting.
