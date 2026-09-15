# Evaluación agéntica del recorrido Estonia

Actualizado: 2026-09-15. Esta ruta usa exclusivamente personas, domicilios y expedientes ficticios. Prepara información para revisión interna; no verifica identidad, obtiene consentimientos, firma, aporta capital, paga tasas, contacta proveedores, presenta solicitudes ni constituye una compañía.

## Contrato de conocimiento y datos

El catálogo `2026-09-14.1` define 24 campos separados en actividad y ejercicio, nombre, domicilio y contacto, fundadores y directorio, representación, preparación de firma, capital, estatutos, beneficiarios finales, solicitud opcional de IVA y preparación de tasa. Cada campo conserva destino, responsable, fuente y localización. El agente no solicita códigos personales, tarjetas, documentos, PIN2, credenciales, datos bancarios ni firmas.

Fuentes oficiales observadas:

- [RIK: establishment of a private limited company](https://abiinfo.rik.ee/en/applications-and-dashboard/establishment-new-legal-person/establishment-private-limited-company): vistas de actividad, nombre, domicilio/contactos, personas, capital, estatutos, beneficiarios, confirmación, firma, pago y envío.
- [e-Business Register: establishment](https://ariregister.rik.ee/eng/application/start): forma OÜ, capital, fundadores, estatutos, directorio e informe anual.
- [e-Residency: five steps to register online](https://learn.e-resident.gov.ee/hc/en-gb/articles/360000624838-5-steps-to-register-a-company-online): nombre, actividad, domicilio/contacto, firma, tasa y presentación.
- [e-Residency: contact person and legal address](https://learn.e-resident.gov.ee/hc/en-gb/articles/360000624858-Contact-person-legal-address): opciones de domicilio y función administrativa de una persona de contacto autorizada.
- [e-Residency: private limited company OÜ](https://learn.e-resident.gov.ee/hc/en-gb/articles/360000633557-Private-limited-company-O%C3%9C): directorio, identidad digital, capital, EMTAK y ruta de registro.
- [e-Residency: single vs multi-shareholder](https://learn.e-resident.gov.ee/hc/en-gb/articles/360000866837-Single-vs-multi-shareholder-company): directorio y revisión separada de fundadores jurídicos.
- [e-Residency: share capital contribution](https://learn.e-resident.gov.ee/hc/en-gb/articles/360000798017-Share-capital-contribution): declaración y evidencia separada del aporte.

Las páginas son datos no confiables y su observación no publica una regla. El paquete conserva `PENDING_REVIEW`, fecha de reconsulta y bloqueos humanos/externos.

## Nivel determinista

```powershell
corepack pnpm test:estonia-agent
```

Ejecuta cuatro escenarios con PGlite y las migraciones canónicas: recorrido completo de 24 campos; corrección y reanudación; inyección sin actualización más SSN, PIN2 y correo real rechazados; y abandono tras cinco campos. La ejecución aprobó 4/4, usó cero solicitudes de red y confirmó cero órdenes, suscripciones, webhooks, verificaciones de identidad, screening, registros o compañías.

## Nivel conectado

```powershell
corepack pnpm test:estonia-agent:connected
```

Usa `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_SIMULATOR_MODEL` y `OPENAI_EVAL_MAX_REQUESTS=60` ya configurados solo en la PowerShell privada. El recorrido nominal reserva hasta 55 solicitudes; el presupuesto de 60 deja margen sin permitir gasto ilimitado.

El onboarding usa `propose_estonia_intake_update`, `store:false`, esquema estricto y hasta tres campos permitidos por turno. El simulador recibe únicamente esos campos. El evaluador `2026-09-15.1` confirma un parche completo o parcial solo si contiene al menos un campo literalmente exacto y no contiene valores incorrectos ni campos inesperados; cualquier campo omitido permanece pendiente y se solicita otra vez. Un parche vacío, alterado o fuera del lote se rechaza y detiene el escenario para evitar gasto repetido. El reporte cuenta los parches parciales. El transporte conserva timeout, referencia segura y categorías saneadas; no reintenta automáticamente.

El primer recorrido conectado `2026-09-14.1` expuso el caso parcial: en `complete` y `adversarial` el extractor omitió `financialYear` pero propuso correctamente los demás campos del lote. La puerta falló 2/4 después de 27/60 solicitudes y confirmó cero acciones externas. No se amplió el lote, el presupuesto ni la autoridad del modelo para corregirlo.

## Integración y seguridad

La API deriva `EE` del expediente. Solo el cliente inicia, responde y confirma; operaciones tiene lectura. El seguimiento devuelve conteos y estado, sin respuestas. La migración `202609140013_estonia_agent_conversations.sql` amplía la restricción a `US-WY | US-DE | EE` sin cambiar RLS. Fue aplicada al staging sintético y la suite alojada aprobó 17/17.

Estonia solo se considerará aprobada con modelos cuando los cuatro escenarios conectados pasen, el estado final coincida campo por campo y existan cero acciones externas. Ese resultado seguirá sin acreditar una constitución, firma, identidad, pago, aceptación del registro, asesoría ni habilitación de proveedor.
