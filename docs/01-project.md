# Magic 3D Explorer — Visión y Alcance del Proyecto

**Magic 3D Explorer** es una aplicación web interactiva de alto rendimiento diseñada para explorar, inspeccionar y coleccionar cartas de **Magic: The Gathering (MTG)** en un entorno tridimensional inmersivo con Three.js y React.

---

## 🎯 Objetivos y Pilares del Proyecto

1. **Visor 3D de Alta Fidelidad**:
   - Renderizado 3D de cartas con esquinas redondeadas auténticas y núcleo de cartulina oscura.
   - Shaders físicos en tiempo real para acabados **Normal** (mate), **Foil** (iridiscencia cromática) y **Etched** (grabado metálico cepillado).
   - Volteo de cartas de doble cara (DFC) y reverso clásico de MTG mediante la tecla **`ESPACIO`** o clic en la carta.
   - Rotación orbital libre con Drei OrbitControls y fondo inmersivo de santuario con auras reactivas según la identidad de maná de la carta.

2. **Catálogo Rápido y Discovery**:
   - Barra de búsqueda central en cápsula con autocompletado en tiempo real y atajo de teclado **`/`**.
   - Cinta de categorías (*Criaturas, Instantáneos, Conjuros, Artefactos, Encantamientos, Planeswalkers, Tierras, Míticas*).
   - Cuadrícula responsiva con carga infinita (*Infinite Scroll*) y esqueletos de carga (*Skeletons*).
   - Modal de filtros avanzados por tipo, rareza, colores de maná y ordenamiento.

3. **Simulador de Sobres de Draft (Booster Opener 3D)**:
   - Selección de expansiones modernas y clásicas (*Modern Horizons 3, Foundations, Kamigawa, etc.*).
   - Apertura cinemática en 3D con distribución probabilística real: 10 Comunes, 3 Infrecuentes, 1 Rara/Mítica (probabilidad 1:7.4) y 1 Bonus/Foil.
   - Revelado interactivo carta por carta con volteo y resumen final con cálculo de valor económico total.

4. **Gestión de Mazos y Colección**:
   - Constructor de mazos con desglose por tipo y coste de maná.
   - Colección de cartas favoritas con persistencia local (*LocalStorage*).

5. **Identidad Visual Noble & Cero Neón**:
  
   - Paleta de colores sobria y elegante: grafito, pizarra oscura, humo y acentos en oro mate apagado (`#c5a059`).
   - Todos los precios cotizados exclusivamente en Soles peruanos (`S/.`) con tasa de cambio centralizada (`USD_TO_PEN_RATE = 3.75`).