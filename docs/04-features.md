# Funcionalidades del Sistema — Especificación Completa

---

## 1. 🧭 Navegación SPA, Enrutamiento Real y Rendimiento
* **Enrutamiento Dinámico con React Router (`/`, `/catalog`, `/card/:id`, `/decks`, `/deck-3d/:deckId?`, `/collection`, `/booster`)**:
  * URLs limpias y compartibles para cualquier carta, sobre o mazo específico.
  * Soporte completo para el historial (Atrás / Adelante) y retroceso inteligente (`navigate(-1)`) desde cualquier vista 3D.
  * Despliegue en **Vercel** configurado mediante `vercel.json` para evitar errores 404 al recargar rutas profundas.
* **Code-Splitting Dinámico con `React.lazy()` & `<Suspense>`**:
  * El bundle inicial se redujo a **~70 kB** (20 kB gzip).
  * Three.js, React Three Fiber y los visores 3D se descargan bajo demanda con el indicador animado `ArcaneLoader`.
* **Navbar Fija Glassmorphism**:
  * Logo de *Magic 3D* con tipografía Cinzel Decorative.
  * Cápsula de búsqueda central con autocompletado en tiempo real y atajo de teclado **`/`**.
  * Enlaces directos ordenados: *Catálogo*, *Mazos*, *Sobres 3D*, *Colección* y *Carta Aleatoria 3D*.
* **Búsqueda Reactiva con Debounce**:
  * Hook `useCardSearch` con autocompletado inteligente (límite de 6 sugerencias) y debounce seguro.
* **Modal de Filtros Avanzados**:
  * Selección de identidades de maná (Blanco, Azul, Negro, Rojo, Verde, Incoloro).
  * Filtros por rareza, tipo de carta, formatos de legalidad (Standard, Modern, Commander, etc.) y ordenamiento (Nombre, Precio, CMC, Fecha).
  * Contador memoizado de filtros activos (`activeFilterCount`).

---

## 2. 🎴 Catálogo de Cartas & Discovery
* **Cuadrícula Responsiva Auto-Fill**:
  * Adaptable desde móviles hasta monitores Ultra-Wide sin desbordamientos laterales.
  * *Infinite Scroll* automático con cursor `next_page` de Scryfall y esqueletos de carga (*Skeletons*).
* **Precios en Moneda Local**:
  * Cada tarjeta muestra su precio cotizado en Soles peruanos (`S/.`) mediante `formatPricePEN()`.
* **Acceso Directo al Estudio 3D**:
  * Al hacer clic en cualquier carta, se abre de inmediato en el visor 3D de alta fidelidad.

---

## 3. 🔮 Visor y Estudio 3D Inmersivo
* **Modelo 3D de Alta Definición**:
  * Carta con esquinas redondeadas auténticas de MTG (`CARD_DIMENSIONS`) y núcleo de cartulina oscura.
  * Texturas en alta resolución con respaldo procedural si falla la red.
* **Control de Acabados Físicos**:
  * **Normal**: Acabado mate de imprenta tradicional.
  * **Foil**: Iridiscencia dinámica con reflejos de arcoíris según el ángulo de luz (atajo **`F`**).
  * **Etched**: Relieve metálico cepillado (atajo **`E`**).
* **Mecánica de Volteo 3D**:
  * Voltea la carta con la tecla **`ESPACIO`** o haciendo clic en ella.
  * Soporte nativo para cartas de doble cara (DFC) mostrando anverso y reverso reales.
* **Modal de Variantes de Arte e Impresiones Históricas**:
  * Atajo de teclado **`V`** o botón en dock.
  * Cuadrícula modal con todas las ilustraciones históricas y versiones especiales de la carta actual.
* **Códice Técnico MTG (Panel Lateral Derecho)**:
  * Pestaña deslizable interactiva.
  * Texto de reglas completo con glifos de maná vectoriales SVG incrustados.
  * Desglose de legalidades por formato (Standard, Modern, Pioneer, Legacy, Vintage, Commander, Pauper).
  * Estadísticas de combate (Fuerza/Resistencia, Lealtad) y datos de ilustrador y set.
* **Panel de Sinergias (Panel Lateral Izquierdo)**:
  * Drawer deslizable con cartas recomendadas de alta sinergia para inspeccionar en 3D con un solo clic.

---

## 4. 📦 Simulador de Sobres de Draft 3D (Booster Opener)
* **Selector de Expansiones MTG**:
  * Compatibilidad con sets modernos y clásicos (*Modern Horizons 3, Foundations, Kamigawa, etc.*).
* **Física y Animación de Apertura**:
  * Paquete sellado en 3D con brillo foil que se rasga al hacer clic.
* **Distribución Probabilística Real (`BOOSTER_CONFIG`)**:
  * 10 Cartas Comunes.
  * 3 Cartas Infrecuentes.
  * 1 Carta Rara o Mítica (probabilidad de mítica ~1 en 7.4).
  * 1 Carta Bonus / Foil.
* **Fase de Revelación Paso a Paso**:
  * Indicador de progreso de 15 cartas con dots codificados por color de rareza.
  * Navegación *Anterior*, *Siguiente*, *Voltear* y *Ver Todo*.
* **Resumen Final Económico**:
  * Cuadrícula con las 15 cartas obtenidas, identificación del *Top Pull* y cálculo del valor total en Soles (`S/.`).
  * Botón para añadir todo el sobre a un mazo con un solo clic.

---

## 5. 🛠️ Constructor de Mazos y Colección de Favoritos
* **Constructor de Mazos**:
  * Agregar cartas individuales o sobres completos mediante `DeckPickerModal`.
  * Desglose visual por tipos (Criaturas, Conjuros, Tierras, etc.) y conteo de cartas.
  * Compartir mazos mediante enlaces codificados en Base64 URL-safe.
* **Visualizador 3D de Mazo (`Deck3DPage`)**:
  * Renderizado del mazo completo apilado en 3D con posibilidad de inspeccionar cartas.
* **Colección de Favoritos**:
  * Guardar cartas favoritas con persistencia desacoplada mediante `ICardStorageRepository`.

---

## 6. 🛡️ Resiliencia y Estabilidad
* **ErrorBoundary Global**:
  * Protección contra errores en tiempo de ejecución en WebGL y componentes visuales, con panel de reintento.
* **Deep Links**:
  * Soporte para enlaces directos a cartas (`?card=id`) y mazos compartidos (`?deck=data`).