# Motor regulatorio

## Captura y revisión

1. Elegir una fuente del catálogo oficial. El servidor exige HTTPS y URL exacta, sin credenciales, puertos alternativos ni redirecciones automáticas.
2. Consultar con timeout de 15 segundos y máximo 5 MB. Captchas, 403, errores, respuestas parciales y PDF sin extractor verificado fallan de forma cerrada.
3. Normalizar HTML como texto no confiable. Guardar contenido bruto y normalizado en Storage privado, con hashes SHA-256 y metadata. Nunca ejecutar HTML o instrucciones de la fuente.
4. Comparar hash normalizado. Un cambio crea un evento, marca la fuente para revisión, bloquea versiones y genera impacto en obligaciones.
5. Cumplimiento revisa la captura y justifica su decisión. Una descarga exitosa por sí sola no aprueba la fuente ni la regla.
6. Crear un borrador con resultado estructurado, explicación, fecha efectiva, snapshot, sección y resumen de evidencia. Los cálculos monetarios y de fechas admiten esquemas delimitados.
7. Publicar explícitamente. El motor y PostgreSQL verifican evidencia, vigencia, reviewer autorizado y ausencia de conflictos. No se sustituye silenciosamente la evidencia elegida por una captura más nueva.

## Selección de hechos

`selectRule` solo devuelve una versión ACTIVE, efectiva en la fecha consultada, verificada, con evidencia primaria oficial cuyo hash coincide con la fuente actual y sin cambios pendientes. La fuente crítica debe tener menos de 24 horas desde una consulta exitosa; un timestamp futuro no cuenta como fresco. Si hay cero o varias versiones utilizables, devuelve `null`.

Las condiciones soportan `all`, `any`, `eq`, `in` y `gte`, sin eval ni código ejecutable. Una condición desconocida o un campo ausente no habilitan una regla.

Cada hecho expone código y versión, autoridad, URL, título, fecha de consulta/verificación, vigencia y confianza. Una respuesta compuesta exige todos los hechos necesarios. El asistente devuelve texto de las reglas revisadas; OpenAI solo puede invocar la herramienta estricta con la pregunta y jurisdicción originales. Un error de modelo cae al motor determinista.

## Impacto y recálculo

Los cambios pendientes y las nuevas versiones señalan obligaciones afectadas para revisión. Aun sin tarea programada, las lecturas y notificaciones vuelven a evaluar la frescura, por lo que no dependen de que un job haya actualizado el estado visual. El calendario no exporta fechas bloqueadas.

Cumplimiento confirma compañía, período y razón, y recalcula con reglas actuales. La operación preserva el ID de la obligación, registra el estado anterior y no modifica una obligación completada. Primeras cuentas y cuentas posteriores de GB usan reglas distintas; el período fiscal y la última confirmation statement se confirman cuando son necesarios.

## Pruebas

Las pruebas cubren frescura, fechas futuras, intervalos, evidencia ausente, hash distinto, cambios, permisos de publicación, superposición, corrección del mismo día, inmutabilidad, SSRF, condiciones, retiro de fechas e importes y deduplicación. Las capturas de investigación no se importan como aprobaciones de producción.
