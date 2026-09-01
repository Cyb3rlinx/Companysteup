# Política de fuentes

El catálogo de `regulatory/source-manifests/official_sources.json` contiene 22 entradas canónicas oficiales. No se usan blogs, memoria de modelos ni páginas comerciales como autoridad normativa. La jerarquía del catálogo distingue legislación, registros, autoridades tributarias y programas oficiales.

## Investigación realizada

La última captura directa, el 31 de agosto de 2026 a las 17:16 UTC, obtuvo 19 fuentes y dejó 3 bloqueadas: PDF de Wyoming sin extractor verificado y dos páginas del centro de ayuda de e-Residency que devolvieron HTTP 403. No se eludieron los bloqueos. El informe reproducible está en `regulatory/fixtures/capture-report.json`; cada captura incluye URL, timestamp, estado y hashes en `regulatory/fixtures/captured`.

Los textos normalizados de investigación se conservan en `.local/source-snapshots`, fuera de Git. No se distribuyen páginas completas. Estas capturas no constituyen aprobación humana ni activan reglas. El monitor de la aplicación, en cambio, conserva bruto y normalizado en el bucket privado y los enlaza al registro de snapshot.

Las URL de ACSP, obligaciones fiscales de e-residentes y confirmation statement se corrigieron usando destinos oficiales explícitos. El monitor sigue rechazando redirecciones: un cambio futuro requiere revisar y modificar el catálogo.

## Contradicciones

La FAQ general de Delaware difiere del código y de las instrucciones específicas. Se documenta la divergencia y se exige revisión de importe y fecha efectiva. Una captura reciente no prueba por sí sola que una afirmación sea correcta. Los cambios de ACSP y BOI demuestran por qué el sistema consulta fuentes y no conserva supuestos históricos como verdades actuales.

El revisor debe comprobar autoridad competente, fecha efectiva, población/regla aplicable, unidad monetaria, condición, excepciones, sección precisa y otras fuentes contradictorias. Las explicaciones deben diferenciar requisito legal de política comercial. Las interpretaciones fiscales y los casos ambiguos se escalan.

## Actualización

Una fuente crítica tiene una cadencia máxima utilizable de 24 horas. El monitor programado se configura en Supabase; no existe un job remoto activo sin credenciales. Las fechas de consulta y éxito se separan: fallar una consulta no renueva el contenido. La lectura también comprueba vigencia, por lo que los datos se bloquean aunque el monitor esté caído.

Un hash cambiado abre revisión; una IA puede resumir una diferencia en una futura extensión, pero no puede aprobar ni publicar. Los snapshots y la evidencia publicada son inmutables. Una nueva versión exige trazabilidad y revisión humana explícita.

`pnpm sources:fetch` es una herramienta de investigación con acceso de red. No es el monitor de producción ni publica su salida. Para producción, usar las acciones de administración o `source-monitor`/`source-ingest` autenticadas.
