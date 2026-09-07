# Wyoming: paquete de preparación y entrega

Fecha: 2026-09-03, Asia/Bangkok. Versión del paquete: `2026-09-03.1`. Estado: **DRAFT_NOT_FOR_FILING / PENDING_REVIEW**. Es una herramienta interna de preparación con datos sintéticos. No prueba constitución, aceptación por un proveedor ni suficiencia documental para presentar.

## Resultado disponible

En `/laboratorio-agentes`, seleccionar Wyoming y usar «Preparar el expediente de Wyoming». Cargar un fundador ficticio o completar los 21 campos de preparación. El resultado muestra faltantes, responsables, mapa de campos, enlaces oficiales, revisión de canal y checklist de entrega. Descargar el JSON para conservar el contenido: el formulario no se persiste en la base.

«Datos completos para revisión interna» solo significa que este formulario de preparación pasó sus comprobaciones básicas. No valida domicilio, nombre, firmas, consentimiento, titularidad, identidad ni elegibilidad. Un «Sí» no elimina esos bloqueos. No se generan Articles firmables ni un SS-4 completo; las clasificaciones fiscales y obligaciones quedan para revisión profesional independiente.

Los domicilios postal/principal y del agente se declaran por separado. La actividad y titularidad se identifican como preguntas internas, sin presentarlas como apartados del formulario estatal. Los nombres, direcciones y correo de ejemplo son ficticios; ningún proveedor ha sido contratado. Solo se admite correo `.test` en este ensayo; no pedir identificadores fiscales, archivos de identidad ni firmas.

## Evidencia oficial consultada

Observación: `2026-09-03T08:07:30Z`. Reconsulta interna antes de `2026-09-04T08:07:30Z` (24 horas). Es una ventana de revisión, no la fecha efectiva de una norma. Al vencer, el resultado mantiene el inventario para revisión pero suspende las orientaciones de canal. Nunca se renueva la observación por ejecutar pruebas.

| Fuente | Ubicación utilizada | Aplicación limitada |
|---|---|---|
| [Wyoming Articles / consentimiento](https://sos.wyo.gov/Forms/Business/LLC/LLC-ArticlesOrganization.pdf) | PDF pp. 2–3; Articles junio 2021, consentimiento diciembre 2021 | Mapa de nombre, modalidad, agente, domicilios, organizador, contacto y declaraciones; firma/consentimiento separados. Revisar versión antes de uso real. |
| [Instrucciones del portal](https://wyobiz.wyo.gov/Business/RegistrationInstr.aspx) | Who Can File Here? / What you will need | Nombre con A deriva a revisión en papel según la página observada. Otro nombre no garantiza acceso ni aceptación en línea. Búsqueda de nombre pendiente de evidencia revisada. |
| [IRS SS-4](https://www.irs.gov/instructions/iss4) | Revisión 12/2025, How To Apply for an EIN | Separar presencia pertinente en EE. UU./territorios, disponibilidad de identificador y solicitud previa. Una oficina extranjera o nacionalidad por sí sola no determina el canal. No crear solicitudes duplicadas. |

No se fijan tarifas, plazos de procesamiento, fechas de obligaciones ni conclusiones fiscales en este paquete. No se publicaron reglas ni se aprobaron snapshots. Las páginas consultadas son fuentes de investigación pendientes de revisión humana.

## Fronteras y trazabilidad

- Preparador puro en `packages/formation-packet`; esquema estricto, URLs fijas y versión del servidor. No acepta `registered`, aprobaciones, firma, SSN ni destinos externos por parámetros. Texto libre es dato, nunca una instrucción de herramientas.
- Acceso mediante el laboratorio: cliente solo en PGlite; Supabase alojado solo roles internos. Ni siquiera un operador puede vincular investigación a un caso alojado. Se mantiene la frontera existente de publicación.
- En sandbox puede asociarse un caso US-WY local del usuario, con revisión explícita. Un caso ajeno devuelve 404; otra jurisdicción, revisión obsoleta o caso terminal se rechazan. No se cargan los datos del expediente ni se sustituyen con el fixture.
- Solo se registra `WY_PACKET_PREPARED` con hash, versión, revisión y códigos de resultado. No direcciones ni respuestas en `case_events`. El historial es una evaluación sintética, no actividad de un modelo autónomo. El hash vincula contenido normalizado y revisión; no es una firma ni certificado.
- La preparación no actualiza workflow, órdenes, compañías ni reglas; tampoco avanza pasos o simula su aprobación. No requiere pagar.
- `simulatePacketReceipt` está marcado SANDBOX y solo identifica un sobre de prueba por hash. `providerAccepted=false`, `registered=false`, cero escrituras externas y adaptador de presentación `EXTERNAL_BLOCKED`. No existe método de envío ni un acuse emitido por un partner.
- Repetir idéntico contenido/revisión dentro de la misma vigencia produce la misma huella. Cada preparación vinculada puede generar otro evento de auditoría; no se afirma deduplicación transaccional de eventos. Un futuro conector deberá gestionar idempotencia de operaciones externas y conciliación antes de reintentar.

## Puerta de revisión humana y entrega

Antes de habilitar una entrega real, completar un registro con:

| Elemento | Evidencia que falta | Responsable | Estado actual |
|---|---|---|---|
| Paquete | Hash/revisión exactos, datos completos y correcciones | Usuario + revisor | Pendiente; solo fixture |
| Fuentes | Versión, fecha efectiva cuando corresponda, captura y aprobación humana | Cumplimiento | PENDING_REVIEW |
| Agente registrado | Contraparte, domicilio, consentimiento y alcance acordado | Proveedor + operaciones | EXTERNAL_BLOCKED |
| Firmante | Identidad, autoridad y declaraciones revisadas | Organizador + revisor | No verificado |
| Canal de entrega | Destino seguro, datos permitidos, quién presenta y quién paga | Operaciones + proveedor | Sin contrato/canal validado |
| Recepción | Identificador de solicitud, rechazo/corrección, tiempos y contacto de incidencias | Proveedor | Solo acuse sintético |
| Resolución | Evidencia emitida por autoridad, conciliada con el caso | Autoridad + revisor | Sin presentación |
| EIN y posconstitución | Elegibilidad, responsable, solicitud previa, método y obligaciones separados | Profesional competente | Pendiente |

Ningún operador debe convertir este documento en una aprobación por completar casillas. La eventual aprobación debe seguir el flujo versionado y auditado de fuentes/reglas; la evidencia de un proveedor debe provenir de su canal autorizado. No enviar emails, completar declaraciones, abrir cuentas oficiales, firmar ni pagar durante desarrollo.

## Pruebas reproducibles

`pnpm test:wyoming` produce `.local/qa/wyoming-packet-qa.json` con 11 escenarios: base, faltantes, nombre A, agente fuera de WY, PO Box, consentimiento pendiente, close LLC, EIN desconocido, solicitud previa, presencia pertinente e identificador disponible, y fuente vencida. Complementa `pnpm test:agents` (27 escenarios de las ocho guías); no reemplaza una evaluación conversacional del modelo.

Las pruebas unitarias/SQL verifican límites de datos, fuentes/fechas, negativa de aprobación, rechazo de parámetros inyectados, aislamiento y ausencia de cambios de workflow/pago. El E2E recorre el formulario, conserva el paquete, compara el hash con el evento y rechaza CSRF, caso ajeno y revisión incorrecta. Los resultados efectivamente ejecutados se documentan en `BUILD_STATUS.md`.

Siguiente paso: revisar este paquete con un profesional y obtener el contrato/canal de pruebas de un proveedor. Mientras falten, el adaptador sigue bloqueado; el código y las pruebas no sustituyen esa validación.
