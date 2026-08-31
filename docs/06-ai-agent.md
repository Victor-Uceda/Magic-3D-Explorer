# AI Development Agent Instructions

## 🤖 Protocolo de Desarrollo para el Agente IA

1. **Inspección antes de editar**: Revisar siempre el código existente, contratos de interfaces y convenciones antes de realizar cambios.
2. **Comentarios 100% en español**: Todo comentario, JSDoc y mensaje explicativo debe redactarse en español claro.
3. **Código simple para exposición**: Diseñar el código para que sea legible y autoexplicativo a primera vista.
4. **Modularidad estricta**: Los componentes deben mantenerse por debajo de **~250 líneas**. Desacoplar submódulos dedicados si una vista o componente crece.
5. **Cero Magic Numbers**: Reutilizar constantes de dominio (ej. `USD_TO_PEN_RATE = 3.75`).
6. **Precios en Soles (`S/.`)**: Emplear siempre `formatPricePEN(...)`.
7. **Verificación obligatoria**: Al terminar cualquier cambio, ejecutar `npm run lint` y `npm run build` para asegurar 0 errores.
