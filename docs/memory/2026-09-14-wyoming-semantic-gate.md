# Sesión: puerta semántica conectada Wyoming

Fecha: 2026-09-14, Asia/Bangkok.

- El segundo run conectado usó `gpt-5.6-terra` y `gpt-5.6-luna`; completó 21 solicitudes y 10.463 tokens sin errores HTTP ni acciones externas.
- Los cuatro escenarios se detuvieron con seguridad al primer parche rechazado. Los fallos se concentraron en texto libre resumido o recortado; ningún valor dudoso fue confirmado.
- Se mantuvo la comparación exacta. El extractor limita campos, requiere texto/evidencia literales y permite valores canónicos solo para opciones cerradas. El simulador debe revelar todos los campos solicitados sin alterar valores.
- `pnpm check` aprobó lint, TypeScript, 165 pruebas, diez bundles Edge y build; 4/4 recorridos deterministas también aprobaron. Falta reejecutar el nivel conectado con el mismo máximo de 60 antes de integrar Wyoming en el panel.
