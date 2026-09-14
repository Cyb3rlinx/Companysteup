# Company Setups — Delaware conectado aprobado

Fecha: 2026-09-14, 23:15 Asia/Bangkok (UTC+7).

- La evaluación Delaware `2026-09-14.2` aprobó 4/4 con `gpt-5.6-terra` para onboarding y `gpt-5.6-luna` para simulación.
- Usó 49/60 solicitudes, 21.820 tokens de entrada, 4.714 de salida, 26.534 totales y 111.369 ms de latencia acumulada; máxima 5.541 ms.
- Tres recorridos alcanzaron 20/20 campos y paquete interno; `incomplete` conservó 5/5 y estado activo. Corrección, reanudación, bloqueo de entradas y ataque sin actualización funcionaron.
- El filtro aceptó 66/66 propuestas, sin rechazos; la extracción vacía fue el ataque esperado. Cero escrituras externas, órdenes o compañías.
- El reporte se preservó en `.local/qa/delaware-agent-evaluation-2026-09-14.2-connected-passed.json`, ignorado por Git y sin claves o conversaciones.
- Siguiente paso: agente Estonia específico con fuentes oficiales, evaluación determinista, panel/RLS y puerta conectada. Después UK.
