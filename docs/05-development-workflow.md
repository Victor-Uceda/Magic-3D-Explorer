# Development Workflow

## 1. Regla principal

El proyecto debe desarrollarse incrementalmente.

No implementar todas las funcionalidades simultáneamente.

Cada fase debe quedar funcional antes de comenzar la siguiente.

---

## 2. FASE 1 — Project Setup & Rediseño de Navegación

Configurar:

* React;
* TypeScript;
* Vite;
* ESLint;
* Git;
* **Rutas SPA (routing)** - nueva estructura de navegación;
* **Navbar persistente** - estructura profesional;
* Estructura inicial de archivos y carpetas.

Verificar:

```text
npm install
npm run dev
npm run build
```

**Entregables FASE 1:**
* Rutas definidas (/ , /catalog, /card/:id, /deck/:id, /booster, /collection, /login);
* Navbar en todas las pantallas;
* Home/Feed inicial con mensaje de descubrimiento.

---

## 3. FASE 2 — Home / Feed + Infinite Scroll

Crear:

* HomeFeed componente - experiencia editorial, no dashboard corporativo;
* Infinite scroll engine - cursor pagination basada en Scryfall `next_page`;
* Lote inicial de cartas (12-20);
* Skeleton loading entre lotes;
* Load more al detectar proximidad;

Objetivo:

tener una página de bienvenida que funcione como descubrimiento, donde el usuario pueda empezar a explorar cartas inmediatamente sin ver 3D obligatoriamente.

---

## 4. FASE 3 — Catálogo + Filtros + Sorting

Crear:

* CatalogGrid componente - grid responsivo (4/2/1 columnas);
* FiltersPanel - filtros progresivos (desktop: controles superiores; mobile: drawer);
* Sort dropdown - nombre, precio, fecha, rareza, coste;
* Estados: IDLE, LOADING, SUCCESS, EMPTY, ERROR;
* Debounce en applied filters;
* Prevención de requests duplicados;

Implementar:

* Filtros de color (W, U, B, R, G, C);
* Filtros de tipo (creatura, instant, sorcery, artifact, land, planeswalker, enchantment);
* Filtros de rareza;
* Filtro de set;
* Filtro de coste de mana;
* Filtro de precio;

---

## 5. FASE 4 — Quick View + Card Detail

Crear:

* QuickView componente - modelo modular, sin navegación obligatoria a 3D;
* CardDetail página - información completa de la carta;
* OracleText parsing con ManaSymbol;
* Acciones: [Ver en 3D] (primaria), [Agregar al mazo], [Favorito];

Flujo:

```
Catálogo
   ↓
Hover / Click carta
   ↓
Quick View (modular)
   ↓
[Ver en 3D] → Card 3D Experience (opcional)
   ↓
[Agregar al mazo] → Mazo Builder
   ↓
[Favorito] → (login si no autenticado)
```

---

## 6. FASE 5 — Mejorar Card 3D (Visual Language)

Mejorar la experiencia 3D existente para que sea "premium analytical visualization", no "videojuego".

Tareas:

* Remover partículas permanentes;
* Remover neón, hologramas, efectos sci-fi;
* Ajustar iluminación a estudio controlado (sin reflejos excesivos);
* Mejorar materiales (sobrios, texturas reales);
* Nodos discretos (Price/Legality/Editions/Details) con conectores finos;
* Movimiento suave, sin animaciones permanentes;
* Cámara profesional (órbita controlada, no aleatoria);
* Conservar geometría rounded y system de finish (normal/foil/etched);

**El 3D debe ser opt-in:** el usuario decide cuándo activarlo, no es la pantalla por defecto.

---

## 7. FASE 6 — Authentication

Configurar Firebase Authentication.

**Flujo:**

```
Usuario entra
   ↓
explora cartas (SIN requerir login)
   ↓
agrega favorito → sistema solicita login
   ↓
login (Firebase) → guarda favorito

O:

Usuario crea mazo → quiere guardar → login
```

**No bloquear exploración.** El usuario puede buscar, filtrar, ver Quick View y Card Detail sin autenticar.

---

## 8. FASE 7 — Deck Builder

Implementar sección MAZOS.

**Layout:**

```
+------------------------------------------------+
| NOMBRE MAZO           37 / 100         |
+------------------------------------------------+
|                                                |
| Buscar cartas...                              |
|                                                |
| [cards] [cards] [cards] [cards]               |
|                                                |
+----------------------+-------------------------+
| CARTAS DEL MAZO      | RESUMEN                 |
|                      |                         |
| 4x Card              | Creatures       24      |
| 4x Card              | Lands           24      |
| 2x Card              | Instants         8      |
|                      |                         |
|                      | Avg Mana Cost   2.7     |
+----------------------+-------------------------+
```

**Funcionalidades:**

* Crear mazo: nombre, formato (selected), descripción opcional;
* Agregar cartas desde catálogo;
* Quitar cartas;
* Ver resumen (creatures, lands, instants, avg cmc);
* Formato adaptado (no asumir reglas estándar para todos);

---

## 9. FASE 8 — Deck 3D

Flujo:

```
MIS MAZOS
   ↓
seleccionar mazo
   ↓
[ Ver en 3D ]
   ↓
DECK 3D
```

**Vista 3D de mazo:**

* Representar cartas del mazo en espacio 3D;
* Modos: GRID, STACK, GROUPED, 3D;
* Rotar cámara, zoom;
* Seleccionar carta individual, inspeccionar;
* Agrupar cartas;
* Cambiar organización;

**El modo 3D es el diferencial.** Los demás modos son alternativas.

---

## 10. FASE 9 — Integrar Deck Simulator

Integrar simulador dentro del flujo del mazo.

Cada mazo debe tener:

```
[ Editar ]   [ Ver 3D ]   [ Simular ]
```

**Simulador permite:**

* Abrir mano inicial;
* Robar;
* Mulligan;
* Barajar;
* Avanzar turno;

**No implementar todas las reglas de Magic.** Objetivo: probar composición del mazo.

**Mantener simulador existente** (boosterSimulator.ts) pero integrarlo en el flujo de mazos.

---

## 11. FASE 10 — Colección + Favoritos

Implementar:

* Mi espacio: Mis mazos, Favoritos, Colección;
* Mismo lenguaje visual del catálogo (no interfaz completamente diferente);
* Favoritos del usuario autenticado;
* Cartas de sus mazos;
* Actividad reciente (sutil, sin estadísticas llenas);

---

## 12. FASE 11 — Responsive

**Desktop:**

* navbar completo;
* grid amplio (4 columnas);
* 3D completo;

**Tablet:**

* grid reducido (2 columnas);
* filtros adaptados (drawer o controles adaptados);

**Mobile:**

* navegación simplificada;
* filtros en drawer;
* cartas en 2 columnas;
* experiencia 3D simplificada (o oculta por defecto);

**No simplemente reducir tamaños.** Adaptar la experiencia.

---

## 13. FASE 12 — Testing + QA + Performance

Probar:

### Búsqueda

* carta existente;
* carta inexistente;
* nombre incorrecto;
* búsqueda vacía;

### API

* API disponible;
* timeout;
* error HTTP;

### Authentication

* login;
* logout;
* usuario no autenticado (puede explorar);

### Favorites

* agregar;
* eliminar;
* listar;
* intentar acceder a datos ajenos;

### 3D

* rotación;
* zoom;
* selección de nodos;
* responsive (breakpoints);

### Performance

* infinite scroll (lotes, no requests infinitos);
* imágenes de cartas (lazy loading);
* texturas 3D (cache, reutilización);
* renderizado Three.js;
* Firestore reads/writes;

**Ejecutar:**

```text
npm test
npm run lint
npm run build
```

---

## 14. Code Review

Antes de finalizar:

Revisar:

* responsabilidades;
* duplicación;
* nombres;
* `any`;
* errores;
* seguridad;
* dependencias;
* performance;
* tests;

Refactorizar cuando sea necesario.

No utilizar un único commit gigante. Crear commits pequeños y descriptivos (feat: add catalog, fix: search debounce, etc.).

---

## 15. Git

Utilizar commits pequeños.

Ejemplos:

```text
feat: initialize project routing
feat: add HomeFeed component
feat: add CatalogGrid with infinite scroll
feat: add QuickView component
feat: add CardDetail page
feat: add Deck Builder
feat: add Deck 3D
feat: add Authentication flow
feat: add Favorites integration
fix: handle scryfall rate limit
refactor: extract card mapper
```

No trabajar directamente en `main` cuando el cambio sea suficientemente grande. Usar branches:

```text
main
develop
feature/catalog
feature/quick-view
feature/auth
feature/deck-builder
```

---

## 16. Pull Requests

Cada PR debe indicar:

* qué cambia;
* por qué;
* cómo probarlo;
* posibles riesgos.

Antes de merge:

* build;
* tests;
* lint;
* revisión del código.

---

## 16. Deploy

Antes de producción:

```text
npm run lint
npm test
npm run build
```

Verificar configuración Firebase.

No desplegar secretos.

Actualizar README cuando cambie arquitectura o funcionalidades.

No documentar funcionalidades inexistentes.