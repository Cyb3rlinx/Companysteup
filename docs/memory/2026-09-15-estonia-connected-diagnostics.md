# Company Setups — diagnóstico conectado Estonia

- Fecha: 2026-09-15, Asia/Bangkok.
- El primer run conectado Estonia `2026-09-14.1` aprobó corrección/reanudación e incompleto, pero falló completo y adversarial. Usó 27/60 solicitudes, 14.982 tokens y cero acciones externas.
- El filtro del onboarding registró 34 propuestas y 34 aceptadas, sin valores rechazados. En los dos escenarios fallidos el primer parche omitió `financialYear` y conservó exactos los campos presentes; la evaluación anterior exigía que cada lote fuera completo y lo rechazó entero.
- La evaluación `2026-09-15.1` acepta al menos un campo exacto solo cuando no existen valores incorrectos ni campos inesperados. Los campos omitidos permanecen pendientes, se reintentan y quedan contados como `partialPatches`. Un parche vacío o inseguro sigue fallando cerrado.
- No se elevó el presupuesto, no se amplió el lote y no se delegó confirmación al modelo. `pnpm check` aprobó lint, TypeScript, 182/182 pruebas, diez bundles Edge y build; la evaluación determinista aprobó 4/4 con cero acciones externas.
- La corrección `0bfd3bd` está publicada en `main`; Regulatory integrity #29 aprobó en 40 segundos y CI #29 aprobó en 3 minutos con application, Supabase y Edge.
- Siguiente paso: repetir `corepack pnpm test:estonia-agent:connected` en la misma PowerShell privada. Solo 4/4 y cero acciones externas habilitan continuar UK.
