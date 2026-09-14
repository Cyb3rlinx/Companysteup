# Sesión: puerta semántica conectada Wyoming

Fecha: 2026-09-14, Asia/Bangkok.

- El segundo run conectado usó `gpt-5.6-terra` y `gpt-5.6-luna`; completó 21 solicitudes y 10.463 tokens sin errores HTTP ni acciones externas.
- Los cuatro escenarios se detuvieron con seguridad al primer parche rechazado. Los fallos se concentraron en texto libre resumido o recortado; ningún valor dudoso fue confirmado.
- Se mantuvo la comparación exacta. El extractor limita campos, requiere texto/evidencia literales y permite valores canónicos solo para opciones cerradas. El simulador debe revelar todos los campos solicitados sin alterar valores.
- `pnpm check` aprobó lint, TypeScript, 165 pruebas, diez bundles Edge y build; 4/4 recorridos deterministas también aprobaron. Falta reejecutar el nivel conectado con el mismo máximo de 60 antes de integrar Wyoming en el panel.

## Tercer intento y versión 2026-09-14.3

- El siguiente run usó 12 solicitudes y 7.945 tokens: un recorrido quedó en 6/21 por extracción vacía y el escenario de corrección terminó `NOTHING_TO_CONFIRM`; cero acciones externas.
- El campo confirmado estaba excluido del enum del modelo y el runner intentó confirmar el parche vacío. Se habilitaron correcciones explícitas de todos los campos conocidos y se agregó un control previo a la confirmación.
- Un valor libre literal pasa a ser su propia evidencia; las paráfrasis siguen bloqueadas. El reporte contará descartes y motivos sin guardar textos o valores.
- `pnpm check` aprobó lint, TypeScript, 165 pruebas, diez bundles Edge y build; 9 pruebas enfocadas y 4/4 recorridos deterministas también aprobaron. Falta una única reejecución conectada con límite 60.

## Cuarto intento y versión 2026-09-14.4

- El run `2026-09-14.3` consumió 29/60 solicitudes y 20.675 tokens. `incomplete` aprobó; los otros recorridos se detuvieron de forma segura por dos salidas vacías y tres valores parciales. La telemetría registró 33 propuestas aceptadas, cero descartes y cero acciones externas.
- Se reemplazó la amplitud de todos los campos por privilegio mínimo: próximos tres campos pendientes en turnos ordinarios y campos confirmados únicamente ante una corrección explícita que referencia su etiqueta o ID.
- El cliente modelo debe devolver líneas `Etiqueta: valor` exactas y el adaptador las verifica. Las opciones canónicas exigen evidencia compatible y el reporte cuenta extracciones vacías sin registrar el texto.
- `pnpm check` aprobó lint, TypeScript, 166 pruebas, diez bundles Edge y build; 10 pruebas focalizadas y 4/4 recorridos deterministas aprobaron. Falta publicar y ejecutar el conectado `2026-09-14.4` con el mismo límite 60.
