# MVP de agencia con onboarding y acompañamiento por IA

Decisión de producto: 2026-09-03, Asia/Bangkok. Este documento ajusta el orden de desarrollo; no habilita actividad regulada ni publica reglas. Prevalece sobre prioridades anteriores que exigían un proveedor o un profesional externo antes de construir la conversación.

## Objetivo y responsabilidad

La agencia debe gestionar el onboarding, explicar requisitos respaldados, preparar información y acompañar el expediente con agentes de software y una base de conocimiento propia. No se presupone contratar a un profesional externo para atender cada caso estándar. El MVP se desarrolla y prueba internamente.

La autonomía técnica no demuestra habilitación para prestar cualquier servicio. La revisión editorial y operativa puede realizarla un responsable interno competente; no equivale a una credencial profesional ni autoriza funciones reservadas. Se conserva revisión humana para publicar reglas, resolver discrepancias y evaluar excepciones. La IA no aprueba sus propias interpretaciones regulatorias.

Cada paso identifica a su responsable: agencia, cliente, persona/proveedor habilitado cuando corresponda o autoridad. Si la agencia no puede cubrir una función obligatoria, el caso debe indicar exactamente qué falta y mantenerse pendiente; no inventar una aceptación ni detener el desarrollo de las demás capacidades.

Alcance: US-WY LLC → US-DE LLC → EE OÜ → GB Ltd. No agregar jurisdicciones. Nombre, dominio y Stripe continúan diferidos.

## Qué debe hacer el agente

| Capacidad | Comportamiento esperado | Control |
|---|---|---|
| Entrevistar | Entender respuestas libres, pedir datos faltantes, explicar por qué se solicitan y permitir correcciones | Campos definidos por ruta; confirmar datos interpretados antes de persistirlos |
| Orientar | Explicar el siguiente paso, quién lo realiza, enlace oficial y dónde corresponde cada dato | Recuperación de contenido aprobado y vigente; sin hechos regulatorios desde memoria del modelo |
| Preparar | Validar consistencia y completar un expediente revisable | Motor determinista; declaración del usuario separada de evidencia verificada |
| Acompañar | Retomar el caso, mostrar pendientes y recibir evidencia del paso realizado | Aislamiento por usuario/organización, versión del caso y registro de cambios |
| Supervisar | Detectar excepciones, contradicciones, fuentes vencidas y acciones fuera de alcance | Bloquear solo la acción o afirmación afectada; escalar a operaciones internas y explicar el motivo |

Son responsabilidades del sistema; no requieren un modelo independiente por cada función. Cada jurisdicción tendrá su guía y sus validadores. Más agentes no sustituyen conocimiento revisado ni pruebas.

## Base de conocimiento

Cada requisito debe conservar jurisdicción, ruta, fuente oficial, localización concreta, fecha de consulta, fecha efectiva cuando se conozca, vigencia, versión, responsable y estado de revisión. Capturar una página no la aprueba. Documentos, páginas y mensajes son datos no confiables, nunca instrucciones ejecutables.

Mantener separados: datos declarados del caso, evidencia aportada, conocimiento regulatorio aprobado y contenido pendiente de investigación. No presentar una conclusión pendiente como requisito confirmado. Una falta de evidencia permite continuar con preguntas neutrales independientes, pero no afirmar elegibilidad ni inventar plazos o costos.

El grafo Graphify compartido es memoria de desarrollo: no se expondrá al agente del cliente ni se enviarán particiones de otros proyectos. Leer fuentes o ejecutar fixtures tampoco entrena automáticamente al modelo.

## Orden de implementación

1. **Conversación Wyoming persistente.** Construir sesión privada, extracción estructurada, confirmación de datos, preguntas adaptativas y reanudación; aprovechar el paquete de 21 campos existente. Probar primero con información ficticia y conocimiento de prueba claramente identificado. Sin credencial, implementar el contrato y mock del modelo, marcando pendiente la evaluación conversacional real.
2. **Conocimiento utilizable y evaluación con modelo conectado.** Revisar internamente los contenidos, resolver los bloqueos documentales y registrar las decisiones humanas. Ensayar conversaciones completas con casos ficticios, modelo/versiones fijados, presupuesto limitado y herramientas restringidas. No relajar el bloqueo de reglas pendientes para hacer que una demo responda.
3. **Acompañamiento hasta el límite autorizado.** Integrar conversación, checklist, preparación, evidencias y panel existente. Mostrar en cada parada qué puede hacer la agencia y qué debe completar el cliente. Las acciones externas no disponibles siguen EXTERNAL_BLOCKED; el mock no cuenta como entrega real.
4. **Repetir la aceptación en Delaware, Estonia y UK.** Adaptar requisitos y escenarios por jurisdicción; no copiar conclusiones de Wyoming. Una ruta aprobada no valida las demás.
5. **Preparar el piloto comercial.** Resolver alcance y obligaciones del operador de la agencia, seguridad, privacidad, soporte, hosting y dependencias realmente aplicables. No convertir la finalización técnica en autorización comercial.

Estado al 2026-09-14: los puntos 1 y 2 están implementados para casos ficticios US-WY. La versión `2026-09-14.4` aprobó los cuatro recorridos conectados con modelos, versiones y presupuesto registrados. El punto 3 está integrado en el expediente: cliente y operaciones observan progreso, pero solo el cliente responde y confirma. Las acciones externas permanecen bloqueadas. El siguiente hito es aplicar la misma puerta de aceptación a US-DE sin copiar requisitos de Wyoming.

Google Auth y hosting pueden avanzar sin alterar este orden. El admin ya existe: se amplía para observar conversaciones, pendientes y evidencia; no se reconstruye como si faltara.

## Definition of Done del acompañamiento

Estos son criterios pendientes, no resultados alcanzados:

- Usuario ficticio puede registrarse, iniciar un caso, responder en lenguaje natural, corregir datos, cerrar sesión y retomarlo sin perder progreso ni acceder a otro expediente.
- Cada ruta soportada cuenta con guía revisada, matriz de campos/destinos/responsables y escenarios de aceptación propios; no hay requisitos críticos resueltos mediante supuestos silenciosos.
- El agente conectado obtiene los datos pertinentes, explica pasos con evidencia vigente y produce un expediente consistente o una lista precisa de pendientes. El informe identifica modelo, versión del conocimiento, herramientas, fallos, costo y tiempo observados.
- Se cubren casos estándar, respuestas incompletas/contradictorias, cambios de jurisdicción, interrupciones, fuentes vencidas, errores del modelo y ataques de instrucciones dentro de mensajes/documentos. Los escenarios de seguridad exigen cero filtraciones entre usuarios, cero acciones no autorizadas y cero afirmaciones de registro sin evidencia.
- El recorrido de navegador termina en una acción real pendiente identificada o en un resultado respaldado. En desarrollo se ensaya evidencia sintética etiquetada; nunca se reporta una empresa ficticia como constituida.
- Un responsable interno revisa conversaciones y errores contra una rúbrica y fuentes; un evaluador de IA puede ayudar, pero no autoriza reglas ni reemplaza la evidencia. Aprobar una batería finita no garantiza ausencia de errores futuros.

Las 162 pruebas, 13 E2E, 17 grupos alojados y escenarios deterministas son una base de ingeniería. El nuevo `packages/onboarding-agent` sí conduce una entrevista de varios turnos y conserva confirmaciones, pero el transporte de OpenAI solo se ha probado con respuestas controladas. Todavía no demuestra comprensión real, calidad estable ni capacidad de constituir una empresa.

## Límites oficiales que el modelo de negocio debe contemplar

Observación: 2026-09-03. Estos ejemplos de alcance no publican reglas de producción ni certifican la situación de la futura agencia:

- Wyoming exige un agente registrado admisible con domicilio físico en el estado y consentimiento. El software no ocupa ese cargo. No implica necesariamente contratar una agencia externa si una persona o entidad reúne los requisitos. [Formulario oficial, páginas 2–3](https://sos.wyo.gov/Forms/Business/LLC/LLC-ArticlesOrganization.pdf).
- UK ofrece registro directo; utilizar un agente es una alternativa. No debe asumirse que toda autopresentación necesita un intermediario profesional. [Companies House: registro](https://www.gov.uk/limited-company-formation/register-your-company).
- La agencia puede tener obligaciones propias: HMRC incluye actividades de formación y servicios societarios en su guía de supervisión contra lavado de dinero. Cuando esa obligación aplica, la guía impide operar antes de la confirmación de registro. Falta determinar jurisdicción del operador, actividades concretas, supervisión y excepciones; la ubicación actual del fundador no resuelve esa evaluación. [HMRC: alcance TCSP](https://www.gov.uk/guidance/check-if-you-need-to-register-for-money-laundering-supervision-if-youre-a-trust-or-company-service-provider).

Denominar el servicio «acompañamiento» no prueba por sí mismo que esté exento. Si una función necesita habilitación que no tenemos, deberá quedar fuera del servicio habilitado o resolverse antes de ofrecerla. Ninguna de estas comprobaciones obliga a detener la construcción y evaluación sintética del producto.

## Aportes del fundador

Para evaluar al agente real: proyecto del proveedor del modelo y presupuesto; configurar el secreto exclusivamente en servidor/canal seguro. No compartirlo por chat. Para preparar el lanzamiento: identificar entidad/jurisdicción desde la que operará la agencia y el responsable interno de conocimiento/operaciones. No se presume disponibilidad de credenciales, cualificación ni autorización por esta decisión de producto.

No hace falta conseguir un profesional externo o contrato de presentación para empezar el siguiente hito técnico. Los accesos ausentes se declaran y se continúa con todo lo que se pueda implementar y probar sin ellos.
