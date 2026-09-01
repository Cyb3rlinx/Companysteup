# Seguridad y límites de lanzamiento

Este MVP está validado localmente; no debe incorporar documentos reales ni recibir pagos reales antes de completar las revisiones y conexiones de lanzamiento.

| Amenaza | Control implementado | Trabajo o límite pendiente |
|---|---|---|
| Acceso entre clientes | RLS, membresía, autorización en servicios y FKs con organización; pruebas negativas | Revalidar contra proyecto Supabase real |
| Filtración service_role | Imports de servidor, sin variables públicas secretas, RPC no ejecutable por cliente | Rotación y gestor de secretos del hosting |
| Filtración API keys | `.env` y `.local` fuera de Git; modelos/Stripe solo servidor | Escaneo de secretos en remoto y política de rotación |
| Archivos maliciosos | Lista MIME, magic bytes, 10 MB, bloqueo PDF activo, cuarentena, descarga adjunta privada | Antivirus/CDR, revisión entrenada y política de retención |
| Prompt injection | Fuentes/documentos tratados como datos; herramienta estricta; respuesta factual determinista | Mantener este límite al añadir capacidades |
| Información legal vencida | Vigencia de fuentes en motor, lecturas RLS y proyección de obligaciones; bloqueo y escalamiento | Operación diaria de revisión y alertas |
| Envenenamiento de fuentes | URL oficial exacta, no redirecciones, hashes, captura inmutable y publicación humana | Validación semántica humana y resolución de contradicciones |
| Onboarding fraudulento | Identidad declarada separada, gates, riesgo y pasos de partner | KYC/sanciones/PEP contratados; no aprobación real en MVP |
| Partner comprometido | Adaptadores reales bloqueados; no confiar en bandera enviada por cliente | Firma de webhooks, lista de cuentas autorizadas y reconciliación por partner |
| Escalamiento de admin | Rol desde profiles; cliente sin permiso de cambiarlo; metadata ignorada | MFA y procedimiento auditado para alta/baja de operadores |
| Ley inventada por IA | Sin respuesta factual libre de LLM, solo reglas utilizables con evidencia | Revisión editorial de cada cambio |

## HTTP, sesiones y pagos

Web: origen exacto en mutaciones, cookies HttpOnly/SameSite, límites de cuerpo y límites persistentes por actor. Auth tiene un límite global conservador: antes de producción, agregar controles por IP en un proxy confiable y protección contra abuso sin facilitar denegación global. Supabase SSR verifica usuarios y refresca cookies mediante proxy; el perfil permite solo nombre, idioma y zona horaria.

Edge: JWT verificado con Supabase Auth para usuarios. Los jobs requieren un secreto de al menos 32 caracteres comparado en tiempo constante y un usuario de automatización con rol de cumplimiento. Solo source-monitor/notify admiten ese camino. Webhooks Stripe verifican el cuerpo original y rechazan modo live; importe, moneda y sesión deben coincidir con la orden del servidor. Eventos de suscripción exigen organización, compañía y precio permitido; deduplicación y timestamp evitan regresiones por eventos antiguos.

Cabeceras: CSP restringida, frame/object bloqueados, no sniffing y referencia limitada. `unsafe-inline` para scripts es una limitación del MVP; sustituir por nonce en una revisión de hosting antes de producción. No habilitar `unsafe-eval` fuera de desarrollo.

## Datos privados

Los buckets de clientes, compañías y snapshots son privados. El cliente obtiene documentos aprobados mediante enlaces HMAC de 60 segundos con autorización de tenant también al descargar. Los nombres físicos son UUID; no se usan nombres originales como rutas. Los archivos se entregan como adjuntos y no se procesan con IA. La revisión manual no equivale a un escaneo antivirus.

Los textos jurídicos de privacidad/términos son borradores visibles como tales. Definir responsable, base de tratamiento, residencia, retención, exportación, eliminación, respuesta a incidentes y acuerdos con proveedores antes de datos reales. Los registros append-only no eximen de cumplir derechos aplicables: diseñar redacción o desvinculación legalmente revisada sin reescribir evidencia de forma informal.

## Límites de operación

El sandbox se ejecuta ligado a 127.0.0.1, ofrece acceso explícito al operador de demostración y acepta solo datos ficticios. No exponerlo públicamente. Las credenciales reales no hacen que los adaptadores de partners estén autorizados. No se han realizado trámites, verificaciones de identidad, envíos de correo ni cobros reales durante la construcción.

Para lanzar: ejecutar CI remoto y Supabase completo, revisar RLS de extremo a extremo, integrar antimalware, MFA, backups/restauración, observabilidad, revisión profesional y contratos. Tratar cualquier fallo de autenticación, evidencia o integración como bloqueante para la acción afectada.
