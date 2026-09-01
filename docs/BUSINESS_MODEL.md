# Modelo comercial y límites del servicio

Nexo vende preparación, organización y coordinación. No es autoridad, agente registrado, abogado, asesor fiscal, banco, proveedor KYC ni ACSP. Su nombre y textos comerciales son una propuesta de MVP, pendiente de revisión de marca y términos.

## Desglose

| Concepto | Tratamiento en MVP |
|---|---|
| Tarifa de plataforma | Precio sembrado de USD 99 por preparación/coordinación; se determina en servidor |
| Tasa gubernamental | Separada y sujeta a fuente vigente; no cobrada en la orden actual |
| Servicio de partner | Cotización y contrato pendientes; no se inventa un precio |
| Seguimiento anual | Opcional; Stripe test requiere un precio anual configurado y aprobado |
| Servicios adicionales | No contratados ni cobrados implícitamente |

La pantalla sandbox no es Stripe test: simula el pago sin tarjeta. Al configurar Stripe test, Checkout proporciona su propia página y el pago se confirma exclusivamente mediante webhook firmado. No se admiten claves ni eventos live. La suscripción también tiene activación simulada claramente rotulada, o Checkout de Stripe test y eventos de ciclo de vida.

Constituir no garantiza KYC, cuenta bancaria, acceso a Stripe, residencia fiscal, elegibilidad migratoria ni un ahorro de impuestos. Se muestran responsables y bloqueos antes de cada acción; la promesa comercial es organización y visibilidad, no ausencia absoluta de riesgo legal.

Antes de vender: acordar alcance, cancelaciones, devoluciones, protección de datos, impuestos propios de Nexo, precios de seguimiento, contratos de partners y responsabilidades de presentación. Ninguno de esos acuerdos se presume por tener una API key.
