# Región de staging y evaluación de Singapur/Hong Kong

Investigación: 2026-09-02. Estado: evaluación de arquitectura y viabilidad preliminar; no aprobación regulatoria ni reglas publicadas. El fundador solicitó evaluar estas dos jurisdicciones antes de agregarlas. El catálogo operativo continúa con las cuatro rutas existentes.

## Decisión provisional de infraestructura

Recomendación: **Southeast Asia (Singapore), `ap-southeast-1`, para staging**. Aún no hay usuarios ni una distribución geográfica comprobada. El fundador trabaja desde Tailandia y contempla captación presencial en Bangkok, además de X y Reddit. Esta elección favorece el entorno inicial de pruebas; no demuestra la menor latencia mundial. La región de producción se decidirá con mediciones, mercado inicial y revisión de tratamiento de datos.

El usuario compartió inicialmente el project ref `uvmijrapoezpvtsyhhoj` y reportó que Supabase eligió Japón. Luego creó un reemplazo en Singapur: `keboldglfjonxcdnmyee`. Ese es ahora el único destino autorizado de staging. La región no se ha verificado mediante Management API; la URL pública por sí sola no permite determinarla. Ver `STAGING_SETUP.md` para la conexión pendiente.

| Contexto | Región a considerar | Decisión |
|---|---|---|
| Pruebas y equipo en Tailandia; sin usuarios todavía | Singapore, `ap-southeast-1` | Preferencia provisional para un staging nuevo |
| Proyecto Tokio ya configurado | Tokyo, `ap-northeast-1` | Válido para pruebas funcionales; no requiere borrarlo para avanzar |
| Usuarios concentrados en Latinoamérica/EE. UU. | North Virginia, `us-east-1` | Reevaluar antes de producción con mediciones |
| Requisito contractual de almacenamiento principal en la UE | Frankfurt, `eu-central-1` | Elegir región específica; revisar además el resto del tratamiento de datos |

Supabase usa una región principal por proyecto. La ubicación de los datos no certifica cumplimiento normativo y una región general no garantiza un país concreto. [Regiones oficiales](https://supabase.com/docs/guides/platform/regions).

Cambiar de región exige crear otro proyecto y migrar. Si el proyecto actual está vacío, se pueden aplicar las migraciones canónicas directamente al nuevo, sin trasladar datos. Cambiarán URL y claves; Auth y demás configuración requieren revisión. No borrar el proyecto Tokio antes de verificar el reemplazo. [Cambio de región](https://supabase.com/docs/guides/troubleshooting/change-project-region-eWJo5Z).

La jurisdicción de una compañía no determina automáticamente la región de la plataforma. Se mantiene un proyecto por entorno, no uno por país de constitución. Las Edge Functions se ejecutan normalmente cerca del solicitante; para operaciones intensivas de base de datos conviene medir la ejecución cerca de Postgres. Forzar una región elimina el rerouting automático ante caídas, por lo que no se activará sin evaluar ese intercambio. [Invocaciones regionales](https://supabase.com/docs/guides/functions/regional-invocation).

## Resultado de viabilidad

**Ambas rutas son candidatas razonables para una expansión asistida por proveedores. Ninguna queda certificada para operar o constituir automáticamente.** Permanecen `EXTERNAL_BLOCKED` en esta evaluación y fuera del catálogo, recomendaciones, workflows y seed activos. No se implementó un adaptador nuevo ni se probó una conexión a registros.

### Singapur: private company limited by shares, Pte. Ltd.

- ACRA indica que los extranjeros deben contratar un Corporate Service Provider (CSP) para reservar el nombre y registrar una estructura. La elegibilidad concreta debe revisarse con el CSP. [Extranjeros](https://www.acra.gov.sg/register/business/requirements-eligibility/).
- La compañía necesita al menos un director que cumpla residencia local y un domicilio registrado en Singapur. El formulario incorpora capital, accionistas, controladores y nominadores. El portal Bizfile utiliza Singpass/Corppass; su existencia no demuestra que tengamos una API o permiso de automatización. [Registro en Bizfile](https://www.acra.gov.sg/register/business/registering-different-business-structures/local-company/registering-via-bizfile/).
- Debe nombrarse secretario dentro de seis meses y auditor dentro de tres meses salvo exención; también hay registros y obligaciones recurrentes. Son hallazgos para revisión, no plazos activados en el motor. [Después del registro](https://www.acra.gov.sg/register/business/after-registering/local-company/).
- El régimen CSP vigente desde el 9 de junio de 2025 exige registro y controles AML/CFT/PF dentro de su alcance. Los nombramientos de nominee directors por negocio deben ser gestionados por CSP registrados con evaluación de idoneidad. No modelar el director residente como un nombre alquilado sin responsabilidades. [CSP Act](https://www.acra.gov.sg/regulations/legislation/corporate-service-providers-act/).
- Incorporación y residencia fiscal no equivalen: IRAS examina control y gestión. No prometer ventajas fiscales por registrar la entidad. [Residencia fiscal societaria](https://www.iras.gov.sg/taxes/corporate-income-tax/basics-of-corporate-income-tax/tax-residency-of-a-company-certificate-of-residence).

Conclusión de producto: viable para recopilar información, validar condiciones, preparar expediente y coordinar con un CSP. La disponibilidad de un director residente elegible, el proveedor y la revisión humana son dependencias críticas para operar.

### Hong Kong: private company limited by shares

- El Companies Registry admite constitución por no residentes. La solicitud incluye NNC1, estatutos e IRBR1; admite entrega electrónica o en papel. El domicilio registrado debe estar en Hong Kong. [Constitución, preguntas 1, 2 y 9](https://www.cr.gov.hk/en/faq/local-company/incorporation.htm).
- Se requiere al menos un director persona física y un secretario. El director puede ser no residente; el secretario persona física debe residir habitualmente en Hong Kong o, si es entidad, tener allí oficina o establecimiento. El director único no puede ser también secretario. [Directores y secretario, pregunta 5](https://www.cr.gov.hk/en/faq/local-company/directors-secretary.htm).
- Para un partner, verificar licencia TCSP o una exención documentada aplicable; no asumir que todo secretario necesita licencia ni que estar fuera de Hong Kong exime automáticamente al operador. El propio formulario contempla exenciones y remite las dudas a revisión independiente. [Constitución, pregunta 17](https://www.cr.gov.hk/en/faq/local-company/incorporation.htm), [Registro TCSP](https://www.tcsp.cr.gov.hk/).
- La expansión debe contemplar annual return, registro de controladores significativos, contabilidad, documentación tributaria y auditoría según el caso. No equivale a una entidad sin mantenimiento o impuestos. [Annual returns](https://www.cr.gov.hk/en/faq/local-company/annual-return.htm), [Controladores significativos](https://www.cr.gov.hk/en/legislation/scr/faq.htm), [Declaraciones IRD](https://www.ird.gov.hk/eng/tax/taxrep_ptr.htm).

Conclusión de producto: viable para preparación y coordinación asistida. No exige el mismo director residente que Singapur, pero esa diferencia no demuestra menor costo total, facilidad bancaria ni disponibilidad de integración.

## Condiciones antes de ampliar el producto

1. Un profesional competente revisa el alcance del operador y del partner. La etiqueta «software de orquestación» no sustituye esa evaluación.
2. Identificar partner y comprobar autorización, vigencia, servicios, responsabilidades, precios y cobertura de perfiles; no se enviaron contactos externos.
3. Revisar actividad, residencia, titularidad y excepciones; excluir de la ruta estándar casos que requieran permisos sectoriales o análisis individual.
4. Crear fuentes y reglas versionadas con evidencia, fechas efectivas y aprobación humana. La fecha de consulta de esta nota no sustituye la vigencia ni renueva automáticamente una fuente.
5. Implementar campos, roles, documentos, workflows y obligaciones específicos, primero con datos ficticios y adaptadores `SANDBOX` explícitos. No reutilizar mecánicamente los requisitos de las cuatro jurisdicciones actuales.
6. Probar casos negativos: ausencia de director residente SG, secretario/domicilio HK inválidos, partner no verificado, titularidad incompleta, actividad restringida, evidencia vencida, intentos de saltar revisión y confirmaciones externas sin soporte.
7. Validar la interfaz de presentación autorizada y conciliación de referencias con el partner; no inferir acceso de escritura a partir de un portal o una API de consulta.
8. Completar una prueba de integración supervisada antes de declarar la ruta operativa. Banco, Stripe, visado y residencia fiscal son decisiones separadas; no se garantizan.

La primera ruta asiática a implementar dependerá del partner que supere estos controles. Esta nota agrega ambas al backlog de expansión, no al onboarding disponible. La conexión de Supabase staging puede avanzar sin esperar esa expansión.
