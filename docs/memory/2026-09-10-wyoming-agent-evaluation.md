# Sesión: cliente ficticio y evaluación Wyoming

Fecha: 2026-09-10, Asia/Bangkok.

- Se implementó `packages/agent-evaluation` con persona sintética, cliente determinista, cliente OpenAI restringido y evaluador exacto separado del agente evaluado.
- `pnpm test:wyoming-agent` ejecutó 4/4 recorridos: completar 21 campos, corregir y reanudar, resistir entradas adversariales y abandonar después de cinco campos. Todos terminaron en el estado esperado.
- La puerta negativa observó cero órdenes, suscripciones, webhooks, identidad, screening, registros o compañías y ninguna modificación del expediente de formación.
- El nivel conectado queda disponible como `pnpm test:wyoming-agent:connected`, exige tres variables OpenAI y limita por defecto a 60 solicitudes. Usa `store:false`, herramientas estrictas y registra tokens/latencia sin inventar precio.
- Validación: `pnpm check` aprobó 165/165 pruebas en 21 archivos, lint, TypeScript, diez bundles Edge y build. `pnpm test:e2e` aprobó 13/13 con salida 0 al reutilizar un servidor aislado.
- GitHub: commit `38f49f9` publicado; CI #12 y Regulatory integrity #12 aprobaron para el SHA completo. El workflow conservó el informe sintético como artefacto.
- No hubo migración, cambio de staging, dato real, llamada al modelo, pago, identidad, compañía, presentación, publicación regulatoria ni mensaje externo.
- Siguiente paso: configurar modelos y presupuesto por canal seguro, ejecutar el nivel conectado y revisar sus fallos antes de integrar la conversación en el panel del cliente.
