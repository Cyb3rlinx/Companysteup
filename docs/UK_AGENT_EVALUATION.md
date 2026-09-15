# Evaluación agéntica del recorrido UK Ltd

Actualizado: 2026-09-15. Esta ruta usa exclusivamente personas, domicilios y expedientes ficticios. Prepara información para revisión interna; no verifica identidad, custodia códigos personales, obtiene consentimientos, firma, cobra, contacta proveedores, presenta solicitudes ni constituye una compañía.

## Contrato de conocimiento y datos

El catálogo `2026-09-15.1` define 22 campos separados para actividad y SIC, nombre, nación y domicilio registrado, correo registrado ficticio, directores, accionistas, estructura de acciones, PSC, documentos constitucionales, declaraciones, ruta de presentación y preparación de tasa. Cada campo conserva destino, responsable, fuente y localización. El agente no solicita fechas de nacimiento, domicilios residenciales, documentos, National Insurance numbers, UTR, códigos personales de Companies House, credenciales, datos bancarios ni firmas.

Fuentes oficiales observadas:

- [GOV.UK: register a private limited company](https://www.gov.uk/limited-company-formation/register-your-company): solicitud digital, SIC, PSC, identidad, tasa y certificado.
- [GOV.UK: choose a company name](https://www.gov.uk/limited-company-formation/choose-company-name): reglas de nombre y consultas separadas de registro y marcas.
- [GOV.UK: registered office and email](https://www.gov.uk/limited-company-formation/company-address): domicilio apropiado, nación de registro y correo no público.
- [GOV.UK: appoint directors](https://www.gov.uk/limited-company-formation/appoint-directors-and-company-secretaries): cantidad, edad, restricciones y domicilios de servicio.
- [GOV.UK: shareholders and shares](https://www.gov.uk/limited-company-formation/shareholders): accionistas, capital, clases y derechos.
- [GOV.UK: company formation documents](https://www.gov.uk/limited-company-formation/documents): memorandum, articles y statement of capital.
- [Companies House: identity verification](https://www.gov.uk/guidance/verifying-your-identity-for-companies-house): directores, PSC, códigos personales y rutas de verificación.
- [Companies House: people with significant control](https://www.gov.uk/guidance/people-with-significant-control-pscs): identificación y naturaleza de control de PSC.
- [Companies House: authorised corporate service providers](https://www.gov.uk/guidance/being-an-authorised-corporate-service-provider): supervisión AML, autorización y despliegue gradual de funciones.

Las páginas son datos no confiables y su observación no publica una regla. El paquete conserva `PENDING_REVIEW`, una ventana interna de reconsulta y bloqueos humanos y externos. La ruta ACSP se revisa según la función concreta; el MVP no afirma que la plataforma sea un ACSP ni que pueda verificar identidades o presentar por terceros.

## Nivel determinista

```powershell
corepack pnpm test:uk-agent
```

Ejecuta cuatro escenarios con PGlite y las migraciones canónicas: recorrido completo de 22 campos; corrección y reanudación; inyección sin actualización más SSN, código personal de Companies House y correo real rechazados; y abandono tras cinco campos. La ejecución del hito aprobó 4/4, usó cero solicitudes de red y confirmó cero órdenes, suscripciones, webhooks, verificaciones de identidad, screening, registros o compañías.

## Nivel conectado

```powershell
corepack pnpm test:uk-agent:connected
```

Usa `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_SIMULATOR_MODEL` y `OPENAI_EVAL_MAX_REQUESTS=60` configurados solo en la PowerShell privada. El evaluador nunca imprime ni guarda la clave y el reporte no conserva conversaciones ni valores.

El onboarding usa `propose_uk_intake_update`, `store:false`, esquema estricto y hasta tres campos permitidos por turno. El simulador recibe únicamente esos campos. Un parche completo o parcial se confirma solo si contiene al menos un campo literalmente exacto y no incluye valores incorrectos ni campos inesperados; los omitidos permanecen pendientes. Un parche vacío, alterado o fuera del lote se rechaza y detiene el escenario para evitar gasto repetido. El transporte conserva timeout, referencia segura y categorías saneadas; no reintenta automáticamente.

UK solo se considerará aprobado con modelos cuando los cuatro escenarios conectados pasen, el estado final coincida campo por campo y existan cero acciones externas.

### Resultado conectado aprobado

La ejecución `2026-09-15.1` del 15 de septiembre aprobó 4/4 recorridos con `gpt-5.6-terra` para onboarding y `gpt-5.6-luna` para simulación. Usó 55/60 solicitudes: 24.582 tokens de entrada, 5.996 de salida y 30.578 totales; latencia acumulada 133.670 ms y máxima 5.002 ms. `complete`, `correction-and-resume` y `adversarial` terminaron 22/22; `incomplete` quedó activo con 5/5. El filtro aceptó 72/72 propuestas, no rechazó ninguna y registró una extracción vacía adversarial esperada.

La puerta negativa confirmó cero órdenes, compañías, pagos, identidad, screening, registros o acciones externas. El reporte saneado está preservado fuera de Git en `.local/qa/uk-agent-evaluation-2026-09-15.1-connected-passed.json`; no contiene claves ni textos de conversación. Esta evidencia valida únicamente el comportamiento observado con datos ficticios y estas versiones de evaluación/modelos.

## Integración y seguridad

La API deriva `GB` del expediente. Solo el cliente inicia, responde y confirma; operaciones tiene lectura. El seguimiento devuelve conteos y estado, sin respuestas. La migración `202609150014_uk_agent_conversations.sql` amplía la restricción a `US-WY | US-DE | EE | GB` sin cambiar RLS. Fue aplicada al staging sintético y la suite alojada aprobó 17/17.

El paquete queda `DRAFT_NOT_FOR_FILING`, `PENDING_REVIEW` y `SANDBOX`. Los adaptadores de identidad y presentación son `EXTERNAL_BLOCKED`; el acuse solo valida el sobre sintético. Incluso una evaluación 4/4 no acreditará identidad, domicilio, firma, pago, autorización ACSP, aceptación de Companies House, asesoría ni constitución.
