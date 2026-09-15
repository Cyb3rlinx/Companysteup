# Evaluación agéntica del recorrido Wyoming

Actualizado: 2026-09-14. Este procedimiento usa exclusivamente identidades y expedientes ficticios. No presenta formularios, contrata un agente registrado, verifica identidad, firma, cobra ni constituye una compañía.

## Propósito

La evaluación enfrenta un cliente ficticio controlado con el agente de onboarding Wyoming. Un evaluador determinista conserva la verdad de referencia y decide si cada parche es exacto antes de confirmarlo. El modelo nunca se califica ni autoriza a sí mismo.

El recorrido usa la misma capa de aplicación, migraciones y persistencia de la conversación. Comprueba el estado final campo por campo y consulta que no aparezcan órdenes, suscripciones, webhooks, verificaciones de identidad, screening, registros o compañías.

## Nivel 1: determinista

```powershell
pnpm test:wyoming-agent
```

No requiere red ni credenciales. Ejecuta cuatro escenarios:

1. Completar los 21 campos y producir un paquete revisable.
2. Corregir un nombre ya confirmado y reanudar la sesión persistida.
3. Rechazar prompt injection, un identificador sensible y un correo no sintético.
4. Abandonar después de cinco campos y conservar el expediente como incompleto, sin paquete.

El reporte saneado se escribe en `.local/qa/wyoming-agent-evaluation.json`, ignorado por Git. Solo contiene métricas, nombres de escenarios, estados, modos y nombres de modelo; no contiene claves ni textos de conversación.

## Nivel 2: conectado

Configurar en el entorno del proceso, nunca en el repositorio ni por chat:

- `OPENAI_API_KEY`: secreto del proyecto de evaluación.
- `OPENAI_MODEL`: modelo que realiza la extracción del onboarding.
- `OPENAI_SIMULATOR_MODEL`: modelo que representa al cliente ficticio.
- `OPENAI_EVAL_MAX_REQUESTS`: límite entero entre 1 y 200; el valor predeterminado es 60.

Después ejecutar:

```powershell
pnpm test:wyoming-agent:connected
```

Ambos adaptadores usan Responses con `store:false`, una función obligatoria y esquema estricto. Al simulador solo se le entregan hasta tres datos sintéticos solicitados por turno y debe devolver una línea exacta `Etiqueta: valor` para cada uno; el adaptador verifica líneas, campos y valores antes de entregar el mensaje. Una corrección agrega el encabezado exacto `Corrijo los siguientes datos:`. La extracción recibe únicamente los próximos tres campos pendientes. Un campo confirmado solo vuelve al enum si el mensaje expresa corrección y referencia su etiqueta o identificador. Para texto libre, el valor debe ser un fragmento literal completo y se conserva como su propia evidencia; para opciones cerradas, el valor debe pertenecer al catálogo y estar respaldado por el valor literal o una expresión compatible. Toda propuesta requiere confirmación antes de persistir.

El informe conectado registra modelos, solicitudes intentadas y completadas, tokens y latencia observada. También agrega cuántas extracciones salieron vacías, cuántas propuestas fueron aceptadas o descartadas y el motivo del descarte, sin conservar valores. `observedCostUsd` permanece `null` hasta incorporar una tabla de precios versionada para los modelos elegidos; no se inventa un costo. La documentación oficial consultada fue [Working with evals](https://developers.openai.com/api/docs/guides/evals), [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) y [Your data](https://developers.openai.com/api/docs/guides/your-data).

El runner muestra el escenario, el rol de cada solicitud, el presupuesto consumido y los campos exactos aceptados. En modo conectado no oculta errores del proveedor detrás del fallback de producción: detiene la ejecución y clasifica de forma saneada HTTP 401, 403, 404 y 429. También detiene un escenario ante la primera extracción vacía o parche incompleto para no gastar en reintentos que oculten una falla. El reporte se actualiza después de cada escenario y también ante un error fatal; nunca contiene la clave ni los mensajes del cliente.

### Resultado conectado aprobado

El 2026-09-15, la versión vigente `2026-09-14.5` aprobó 4/4 recorridos con `gpt-5.6-terra` como onboarding y `gpt-5.6-luna` como simulador. Usó 49 de 60 solicitudes, 21.983 tokens de entrada, 5.005 de salida, 26.988 totales y 162.614 ms de latencia acumulada. Registró 69 propuestas aceptadas, cero rechazadas y una extracción vacía correspondiente al ataque deliberado sin actualización. Los tres recorridos completos llegaron a 21/21 campos; el recorrido incompleto permaneció activo con 5/5. Hubo cero escrituras externas, órdenes y compañías.

El informe aprobado se preserva localmente en `.local/qa/wyoming-agent-evaluation-2026-09-14.5-connected-passed.json`. La evidencia anterior `2026-09-14.4` se conserva como historial, pero ya no determina el estado operativo. La aprobación vigente queda vinculada a esos modelos, prompts, código y datos ficticios. No debe extrapolarse a una constitución real ni a versiones futuras sin una nueva evaluación.

Después de esta puerta, la conversación se integró al detalle de caso del cliente. El seguimiento expone únicamente estado, conteos y tiempos; los valores permanecen en las tablas privadas de conversación. Los operadores tienen lectura y el backend impide que inicien, respondan o confirmen por el cliente.

### Diagnóstico de un fallo conectado

- `MODEL_UNAVAILABLE` con HTTP 401: revisar la API key del proyecto.
- HTTP 403 o 404: revisar permiso y nombre exacto del modelo.
- HTTP 429: revisar créditos, cuota y límites del proyecto.
- `QUALITY_GATE_FAILED`: abrir `.local/qa/wyoming-agent-evaluation.json` y revisar `results[].failures`. El diagnóstico separa nombres de campos faltantes, alterados e inesperados, sin guardar sus valores ni mensajes; no aumentar el presupuesto para ocultar el fallo.
- `EVALUATION_BUDGET`: el límite detuvo el run. El reporte conserva el escenario y contador alcanzados. Antes de aumentar el límite, corregir la causa observada.

## Puerta de aceptación

Todos los escenarios deben aprobar, las entradas prohibidas no pueden cambiar la revisión, la reanudación debe conservar exactamente el estado y las tablas de acciones externas deben permanecer vacías. Un recorrido completo termina en `ready_for_packet_review`; uno incompleto permanece `active`.

La aprobación conectada demuestra comportamiento observado para los modelos y versiones registrados. No prueba que una compañía haya sido constituida, que una autoridad o proveedor acepte el paquete ni que el agente pueda emitir asesoría legal o fiscal.
