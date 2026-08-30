# Architecture

## 1. Arquitectura general

La aplicación debe utilizar una arquitectura dividida entre frontend, servicios externos y persistencia.

```text
                    Scryfall API
                         ▲
                         │
                         │ HTTPS
                         │
                 Firebase Functions
                         │
              ┌───────────┴───────────┐
              │                       │
          Firestore              Business Logic
              │                       │
              └───────────┬───────────┘
                          │
                          │ HTTPS
                          ▼
                   React Application
                          │
               ┌──────────┴──────────┐
               │                     │
           Normal UI             3D Scene
                                   │
                          React Three Fiber
                                   │
                                Three.js
```

### Flujo de datos actualizado:

```
Usuario / Entrada
   ↓
Catálogo (SPA Route: /catalog)
   ↓
Infinite Scroll con cursor pagination
   ↓
Filtros progresivos (color, tipo, rareza, set, precio)
   ↓
Sorting (nombre, precio, fecha, rareza, coste)
   ↓
Cada carta → Quick View (opcional, sin 3D obligatoria)
   ↓
Card Detail (información completa)
   ↓
[Ver en 3D] (usuario decide activar)
   ↓
Card 3D Experience (momento especial)
   ↓
[Agregar al mazo]
   ↓
Mis Mazos
   ↓
Deck Builder
   ↓
Guardar en Firestore (si autenticado)
   ↓
Deck 3D (visualizar mazo completo)
   ↓
Deck Simulator (mano inicial, robar, mulligan, barajar)
```

---

## 2. Frontend

**Tecnologías:**
* React 18 + TypeScript + Vite
* React Three Fiber + Three.js + Drei (escena 3D, como característica, no como navegación)
* Vite plugins y dependencias existentes

**Responsabilidades:**
* Interfaz de usuario (Home, Catalog, Card Detail, Quick View, Deck Builder, Deck 3D, Collection, Favorites);
* Búsqueda y filtrado;
* Estados de loading, error y success;
* Navegación SPA (routers);
* Responsive design (desktop, tablet, mobile);
* Microinteracciones sutiles;
* Consumo de API Scryfall mediante el cliente ya existente.

**Restricciones clave:**
* El 3D NO es la pantalla inicial obligatoria;
* El catálogo es el punto de entrada;
* El 3D es una acción que el usuario decide cuándo activar;
* No crear una experiencia "sci-fi" o "videojuego" - mantener estética "premium analytical";

---

## 3. Backend

Utilizar Firebase Cloud Functions (o servicios equivalentes) para:

* Comunicación con Scryfall (centralizar requests, caching, rate-limit handling);
* Validación de entradas y respuestas;
* Normalización de datos (card mapper);
* Operaciones de favoritos cuando corresponda;
* Lógica de negocio relacionada con mazos y colección.

**No mezclar con UI.** El backend debe ser independiente de la presentación.

---

## 4. Scryfall

Scryfall es una dependencia externa.

**Nunca asumir que:**
* Siempre está disponible;
* Siempre devuelve datos completos;
* Nunca cambia;
* Nunca devuelve errores.

**Toda respuesta externa debe validarse antes de utilizarse.**

**Cliente Scryfall:** Mantener el cliente existente con:
* Headers requeridos (`User-Agent: Magic3DExplorer/1.0`, `Accept: application/json`);
* Timeout configurado;
* Status codes (incluyendo `429 Too Many Requests`);
* Errores de red;
* Parseo inicial y mapeo a dominio Card.

**No debe contener lógica relacionada con Firestore o UI.**

---

## 5. Servicios

La lógica relacionada con cartas debe vivir en un servicio.

**Responsabilidades:**
* Buscar cartas;
* Obtener cartas (con paginación cursor);
* Consultar cache;
* Utilizar ScryfallClient;
* Transformar resultados mediante CardMapper.

**Flujo optimizado:**
```
Request
  ↓
Cache (¿Válido?)
  ├── YES → Return (con pagination)
  └── NO → ScryfallClient → Scryfall → validar → mapear → guardar cache → devolver
```

---

## 6. Card Mapper

No propagar directamente los objetos completos de Scryfall por toda la aplicación.

**Flujo:**
```
ScryfallResponse
   ↓
CardMapper
   ↓
Card (propio dominio)
   ↓
Application
```

**Para cartas DFC (double-faced cards):** El mapper debe normalizar y extraer la cara frontal (`card_faces[0].image_uris`) para mantener simple la interfaz visual y el componente Card3D.

La aplicación debe trabajar con modelos propios cuando sea apropiado.

---

## 7. Authentication

Firebase Authentication será responsable de identificar usuarios.

**Flujo actualizado:**
```
Usuario entra
   ↓
explora cartas (SIN requerir login)
   ↓
ve una carta
   ↓
agrega favorito → sistema solicita login
   ↓
login → guarda favorito
```

O:

```
Usuario crea mazo → quiere guardar → login
```

**El login debe sentirse como parte natural del flujo, no como barrera inicial.**

---

## 8. Firestore

Utilizar Firestore para:

* Favoritos;
* Mazos del usuario;
* Colección personal;
* Datos asociados al usuario.

**No duplicar innecesariamente toda la respuesta de Scryfall.** Solo guardar lo necesario: IDs de cartas, nombres, estados de favorito/mazo, fechas.

**Estructura conceptual:**
```
users/
    {userId}/
 favorites/
     {favoriteId}
 decks/
     {deckId}
       name: string
       format: string
       description: string
       cards: [{cardId, quantity, sideboard}]
       createdAt: timestamp
```

---

## 9. Repository (cuando sea necesario)

Cuando la interacción con Firestore sea suficientemente compleja, utilizar una capa repository.

**Ejemplo:**
```
favoriteRepository
deckRepository
```

**Responsabilidad:**
* guardar;
* obtener;
* eliminar favoritos/mazos.

La lógica de negocio debe permanecer en el servicio.

No crear repositories innecesarios para operaciones triviales.

---

## 10. Dependency Injection

Utilizar Dependency Injection cuando facilite:

* testing;
* desacoplamiento;
* sustitución de dependencias.

**En tests:**
```
CardService
   ↓
MockScryfallClient
```

No implementar un framework de Dependency Injection complejo si no es necesario.

---

## 11. Arquitectura 3D

Separar la escena 3D de la interfaz convencional.

**Estructura inicial (con nuevo enfoque):**

```
src/three/

Scene.tsx          → Coordinadora de elementos 3D (opcional, no default)
Card3D.tsx         → Modelo de carta individual (conservar geometría, mejorar visual)
BoosterPack3D.tsx  → Sobre booster (integrar en flujo de mazos)
BoosterScene.tsx   → Secuencia de apertura (mantener, integrar)
CardReveal3D.tsx   → Revelación de carta en booster
CameraController.tsx → Control cámara órbita
Table.tsx          → Mesa/base 3D
Lighting.tsx       → Iluminación de estudio (sobria, sin neón)
InfoNode.tsx       → Nodos de análisis (Price, Legality, Editions, Details)
Connection.tsx     → Conexiones visuales finas y discretas
```

**Principios 3D:**
* Geometría limpia;
* Iluminación controlada (tipo estudio fotográfico);
* Sombras sutiles;
* Materiales sobrios;
* Movimiento suave;
* Cámara profesional;
* No partículas permanentes, no hologramas, no neón;
* El 3D debe aportar valor y ser opt-in, no por defecto.

---

## 12. Flujo de búsqueda

```text
Usuario
   ↓
React (navbar search)
   ↓
Search global
   ↓
Cursor pagination (Scryfall)
   ↓
Cache
   │
   ├── encontrada → devolver
   │
   └── no encontrada
          ↓
      ScryfallClient
           ↓
        Scryfall
           ↓
        validar
           ↓
        mapear
           ↓
        guardar cache
           ↓
        devolver
           ↓
         React
           ↓
        Quick View / Card Detail
           ↓
        Escena 3D (opcional)
```

---

## 13. Estructura inicial

```text
magic-3d-explorer/

src/
│   ├── components/              # UI components (rediseñados)
│   │   ├── ui/                  # Atomic components (ManaSymbol, etc.)
│   │   ├── cards/               # Card item, Quick View, Card Detail
│   │   ├── search/              # Search bar, filters
│   │   ├── dashboard/           # Home, Catalog, Decks
│   │   └── dashboard/           # User area, Collection
│   │
│   ├── three/                   # Componentes 3D (ver punto 11)
│   │   ├── Scene.tsx
│   │   ├── Card3D.tsx
│   │   ├── InfoNode.tsx
│   │   ├── Connection.tsx
│   │   ├── CameraController.tsx
│   │   ├── Table.tsx
│   │   └── Lighting.tsx
│   │
│   ├── features/                # Feature folders (opcional, para organizar)
│   │   ├── cards/
│   │   ├── favorites/
│   │   └── search/
│   │
│   ├── services/                # Business logic (ya existente)
│   │   ├── scryfall/            # Cliente Scryfall + mapper
│   │   └── boosterSimulator.ts
│   │
│   ├── types/                   # Interfaces TypeScript
│   │   ├── card.ts
│   │   └── index.ts
│   │
│   ├── utils/                   # Utilidades (cn, debounce, getManaAuraColor)
│   │
│   ├── App.tsx                  # Router + state global (actualizado)
│   │   └── main.tsx
│   │
│   ├── pages/                   # Páginas SPA
│   │   ├── HomeFeed.tsx
│   │   ├── CatalogGrid.tsx
│   │   ├── CardDetail.tsx
│   │   ├── QuickView.tsx
│   │   ├── DeckBuilder.tsx
│   │   ├── Deck3D.tsx
│   │   ├── Collection.tsx
│   │   ├── Favorites.tsx
│   │   └── BoosterOpener.tsx
│   │
│   ├── services/                # Business logic
│   │   ├── scryfall/
│   │   └── boosterSimulator.ts
│   │
│   ├── hooks/                   # Custom hooks (useSearch, useDebounce, etc.)
│   │
│   └── App.tsx
│   └── main.tsx
│
├── functions/                   # Firebase Functions (backend)
│   └── src/
│       ├── cards/
│       ├── favorites/
│       ├── infrastructure/
│       │   ├── scryfall/
│       │   └── firestore/
│       ├── shared/
│       │   ├── errors/
│       │   ├── validation/
│       │   └── utils/
│       └── index.ts
│
├── tests/                       # Tests unitarios y E2E
├── public/                      # Assets públicos
├── firestore.rules
├── firebase.json
├── .env.example
├── README.md
├── package.json
└── tsconfig.json
```

---

## 14. Code Standards (resumen)

Aplicar los estándares de 03-coding-standards.md con énfasis en:

* KISS: solución más sencilla que resuelva el problema;
* DRY: evitar duplicación, pero no abstracciones innecesarias;
* SOLID cuando aporte valor (especialmente Single Responsibility);
* TypeScript estricto, evitar `any`;
* Errores explícitos, no bloques `catch {}`;
* Validar toda entrada externa;
* Seguridad: ningún secreto en Git, ningún credential en frontend;
* Performance: optimizar cuando exista razón (infinite scroll, imágenes, texturas 3D);
* Micro-optimizaciones innecesarias no;
* Comentarios: explicar por qué, no qué.

---

## 15. Principio final

El mejor código para este proyecto es:

```text
Simple
Readable
Explicit
Testable
Maintainable
Secure
```

No el código más sofisticado.