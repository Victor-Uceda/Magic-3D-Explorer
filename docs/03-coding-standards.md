# Coding Standards

> [!CAUTION]
> **REGLA ESTRICTA DE DISEÑO Y COLOR (3X):**
> 1. NO QUIERO COLORES NEON
> 2. NO QUIERO COLORES NEON
> 3. NO QUIERO COLORES NEON
>
> Prohibidos terminantemente los amarillos brillantes, verdes fluorescentes, cianes intensos o botones amarillos chillones. Toda la paleta debe ser sobria, oscura y elegante (grafito, pizarra, humo y acentos en oro/bronce mate tenue `#c5a059`).

---

## 1. Principios Fundamentales
* **Simplicidad y claridad para exposición**: El código debe ser autoexplicativo, legible y fácil de defender en una presentación técnica.
* **KISS (Keep It Simple, Stupid)**: Priorizar siempre la solución más directa y limpia sin introducir capas artificiales o sobreingeniería.
* **DRY (Don't Repeat Yourself) moderado**: Reutilizar lógica cuando represente una responsabilidad compartida real, sin forzar abstracciones prematuras.
* **Comentarios en español**: Todo comentario explicativo y documentación JSDoc debe redactarse en español claro y conciso.

---

## 2. Estándares de TypeScript y React
* **Tipado Estricto**:
  * Prohibido el uso de `any`.
  * Definir interfaces explícitas para props de componentes (`interface ComponentProps { ... }`).
  * Tipar retornos de funciones asíncronas y transformaciones de datos.
* **Modularidad y Custom Hooks**:
  * Desacoplar estado y efectos de los componentes hacia hooks reutilizables (`useCardSearch`, `useCardFilters`, `useFavorites`, `useDecks`, `useStudio3D`).
  * Evitar "God Components": Mantener los componentes por debajo de **~250-350 líneas de código**.
  * Si un componente gestiona múltiples responsabilidades (cabecera, controles, modales), desacoplarlo en submódulos atómicos dedicados.
* **Gestión de Efectos y Ciclo de Vida**:
  * Limpiar siempre timers, listeners (`removeEventListener`), debounce timeouts y controladores de abort (`AbortController`) en la función de retorno de `useEffect`.
  * Evitar dependencias cíclicas o estados redundantes que puedan provocar re-renders innecesarios.
* **Resiliencia con Error Boundaries**:
  * Envolver vistas y árboles propensos a excepciones (WebGL, Three.js, red) con `ErrorBoundary` para evitar caídas de la aplicación completa.

---

## 3. Arquitectura de Red y Servicios (Scryfall API)
* **Rate Limiting**: Respetar el intervalo mínimo de 80-100ms entre solicitudes consecutivas a la API pública de Scryfall (`SCRYFALL_CONFIG.MIN_REQUEST_DELAY_MS`).
* **Manejo de Errores Tipado**: Manejar explícitamente códigos de estado HTTP (404 Not Found, 429 Rate Limit Exceeded, 500 Internal Error) mediante clases de error personalizadas (`ScryfallError`).
* **Mapeo Seguro de Dominio**: Aislar la respuesta cruda de la API (`ScryfallCard`) del modelo interno de la aplicación (`Card`), resolviendo de forma segura cartas de doble cara (DFC) y URLs de imágenes.

---

## 4. Persistencia y Patrón Repository
* **Desacoplamiento de Almacenamiento**:
  * Utilizar la interfaz `ICardStorageRepository` para operaciones CRUD de favoritos y mazos.
  * La persistencia no debe estar acoplada directamente a `localStorage` dentro de los componentes visuales; siempre debe pasar a través del repositorio o los hooks `useFavorites` / `useDecks`.
  * Manejo seguro de errores ante cuotas de almacenamiento superadas o entornos sin acceso a `Storage`.

---

## 5. Rendimiento en Renderizado 3D (Three.js & R3F)
* **Caché de Texturas**: Almacenar texturas cargadas en un `Map<string, THREE.Texture>` global para evitar pausas por recolección de basura (*Garbage Collection*).
* **Geometrías Reutilizables**: Instanciar y memorizar geometrías complejas con `useMemo` en lugar de recrearlas en cada frame.
* **Optimizaciones de GPU**: Mantener 60 FPS estables desactivando sombras pesadas cuando no aporten valor (`shadows={false}`) y fijando el límite de DPR (`dpr={[1, 1.5]}`).

---

## 6. Nomenclatura y Reglas de Negocio
* **Nombres Descriptivos**:
  * Funciones: Verbo + Sustantivo (ej. `generateBoosterPack`, `mapScryfallCardToDomain`, `formatPricePEN`).
  * Custom Hooks: Prefijo `use` + Sustantivo/Acción (ej. `useCardSearch`, `useStudio3D`).
  * Componentes: PascalCase descriptivo (ej. `BoosterControls`, `CardInfoPanel`).
  * Constantes globales: SCREAMING_SNAKE_CASE (ej. `USD_TO_PEN_RATE`, `CARD_DIMENSIONS`).
* **Cero Magic Numbers**: Prohibido insertar constantes numéricas sueltas sin contexto en el código. Centralizar en `src/constants/`.
* **Precios en Moneda Local**: Todos los precios deben cotizarse y presentarse en Soles peruanos (`S/.`) mediante el formateador centralizado `formatPricePEN()`.

---

## 7. Verificación Continua
```text
npm run lint   → 0 errores, 0 warnings (Obligatorio)
npm run build  → Compilación limpia TypeScript/Vite (Obligatorio)
```
