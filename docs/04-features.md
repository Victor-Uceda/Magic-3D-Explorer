# Features

## 1. Card Search

El usuario debe poder buscar una carta por nombre desde el navbar.

**Estados:**

```text
IDLE
LOADING
SUCCESS (resultados en catálogo)
EMPTY
ERROR
```

**Comportamiento:**
* Enter → abrir resultados en catálogo
* Click → Abrir experiencia 3D de la carta
* Debounce en el input de búsqueda
* Resultados rápidos con imagen, nombre, set, rareza y precio en Soles (PEN)

---

## 2. Catálogo de Cartas

Punto de entrada del usuario. Debe ser una experiencia de discovery visual directa.

**Estructura:**
```
HEADER:
  MAGIC 3D | Buscar... | Catálogo | Mazos | Colección

CONTENIDO:
  CARTAS [cantidad encontrada]

FILTROS (progresivos):
  - color (W, U, B, R, G, C)
  - tipo (creature, instant, sorcery, artifact, land, planeswalker, enchantment)
  - rareza (common, uncommon, rare, mythic)
  - formato (commander, modern, standard, pioneer, pauper, legacy)

PRECIOS:
  - Siempre en Soles peruanos (S/.) calculados desde Scryfall

GRID:
  - Cartas como elemento principal
  - Responsivo: desktop 4 columnas, tablet 2, mobile 2
  - Infinite scroll (cursor pagination, lotes automáticos por Scryfall next_page)
  - Skeleton loading con efecto shimmer entre lotes
  - Clic en cualquier carta abre directamente su visor 3D interactivo
```

**Comportamiento:**
* Usuario entra → ve catálogo (punto de entrada)
* Desplaza → carga lote siguiente detectando proximidad
* Aplica filtros → filtra resultados en tiempo real
* Selecciona carta → Quick View o Card Detail

---

## 3. Card Detail & 3D Experience

Toda interacción de detalle se realiza directamente en el entorno 3D interactivo.

**Debe incluir:**
* Modelo 3D interactivo de la carta con acabados Normal, Foil y Etched
* Nombre, tipo, coste de maná
* Oracle text (con parsing de símbolos de maná SVG)
* Rareza, set, artista
* Precios de mercado en Soles (S/.)
* Drawer lateral de cartas relacionadas / resultados de búsqueda
* Panel técnico de especificaciones (P/T, Lealtad, Ranking EDHREC, Sinergias)
* Acciones de mazo y favoritos persistentes

* Impresiones (variant cards)

**Acciones principales (peso visual diferenciado):**
* [Ver en 3D] - **PRIMARIA** (highlighted)
* [Agregar al mazo] - secundaria
* [Favorito] - tertiary

**No poner todas las acciones con el mismo peso visual.** Debe existir una acción primaria clara.

**El usuario puede pasar de aquí a Quick View o volver al catálogo.**

---

## 5. Information Nodes

Crear cuatro nodos principales para la experiencia 3D:

```text
PRICE
LEGALITY
EDITIONS
DETAILS
```

**Los nodos deben parecer herramientas de análisis, no esferas brillantes.**

**Ejemplo visual en Card 3D:**
```
                       PRICE
                         |
                         |
                    [ CARD 3D ]
                    /         \
                   /           \
             EDITIONS        LEGALITY
                   \
                    DETAILS
```

**Cada nodo puede utilizar:**
* Icono funcional (sin hologramas, sin neón);
* Etiqueta de texto;
* Pequeña cantidad de información;
* Conexión visual fina y discreta;

**Los conectores deben ser finos y discretos.**

**Estética:** "premium analytical visualization" NO: "AI generated futuristic dashboard".

---

## 6. Price Node

Mostrar información disponible de precios.

**Ejemplo:**
```
USD
$3.21

EUR
€2.87
```

No inventar datos que Scryfall no proporcione.

---

## 7. Legality Node

Mostrar legalidad por formato.

**Ejemplo:**
```
Standard  → legal
Modern  → legal
Legacy  → banned
Vintage → restricted
Commander → legal
Pioneer → legal
Pauper  → not_legal
```

Utilizar los formatos realmente proporcionados por Scryfall.

---

## 8. Printings Node

Mostrar las diferentes impresiones de la carta.

**Cuando sea posible:**
* set;
* set name;
* release date;
* imagen (miniatura).

No cargar información innecesaria antes de solicitarla.

---

## 9. Details Node

Mostrar:

* nombre;
* tipo;
* rareza;
* artista;
* texto (Oracle text con símbolos de maná);
* mana cost.

---

## 10. Authentication

Utilizar Firebase Authentication.

**Pero NO bloquear la exploración.**

**Flujo:**
```
Usuario entra
   ↓
explora cartas (SIN login requerido)
   ↓
ve una carta
   ↓
agrega favorito → solicita login
   ↓
login → guarda favorito

O:

Usuario crea mazo → quiere guardar → login
```

El usuario anónimo puede explorar cartas, filtrar, buscar, ver Quick View.

---

## 11. Favorites

Usuario autenticado:

```text
Add Favorite
Remove Favorite
View Favorites
```

Los favoritos deben pertenecer exclusivamente al usuario correspondiente.

---

## 12. Firestore

Estructura conceptual:

```text
users/
    {userId}/
favorites/
    {favoriteId}
    cardId: string
    cardName: string
    imageUrl: string
    setName: string
    createdAt: number

decks/
    {deckId}
    name: string
    format: string
    description: string
    cards: [{cardId, quantity}]
    createdAt: number
    userId: string

no almacenar información duplicada innecesariamente.
```

---

## 13. Error Handling

Mostrar estados amigables.

**Ejemplo:**
```
Card not found

Unable to connect to Scryfall

Something went wrong. Please try again.
```

No mostrar errores internos al usuario.

---

## 14. Responsive

La aplicación debe funcionar en:

* desktop;
* tablet;
* móvil.

**La experiencia 3D puede simplificarse en pantallas pequeñas.**

* Desktop: navbar completo, grid amplio, 3D completo
* Tablet: grid reducido, filtros adaptados
* Mobile: navegación simplificada, filtros en drawer, cartas en 2 columnas, experiencia 3D simplificada o oculta

No simplemente reducir tamaños. Adaptar la experiencia.

---

## 15. Performance

Implementar:

* debounce de búsqueda;
* cache (texturas 3D, datos de cartas);
* lazy loading (componentes, imágenes);
* infinite scroll (cursor pagination, lotes controlados);
* reutilización de geometrías y materiales (ya existe en Card3D);
* pagination en requests a Scryfall;

No cargar miles de cartas de una sola vez. No descargar recursos innecesarios.

---

## 16. Accessibility

Cuando corresponda:

* botones accesibles;
* labels apropiados;
* navegación por teclado (/, espacio, f, e, n, r, flechas, esc);
* contraste adecuado;
* textos alternativos en imágenes;

La interfaz 3D no debe ser la única forma de acceder a información importante. Toda la información relevante debe estar disponible también en UI 2D (Quick View, Card Detail).

---

## 17. MVP Definition of Done

El MVP está terminado cuando:

1. el usuario entra y ve el catálogo (punto de entrada);
2. busca una carta;
3. filtro y sorting funcionan;
4. abre una carta en Quick View;
5. entiende su información;
6. ve la carta en 3D (opcional, cuando lo decide);
7. la agrega a un mazo;
8. crea un mazo;
9. ve el mazo en 3D (Deck 3D);
10. simula una mano;
11. puede favoritar una carta (login opcional);
12. el proyecto puede desplegarse.

---

## 18. Lo que NO quiero

NO diseñar:

* dashboard genérico;
* interfaz de videojuego;
* cyberpunk;
* neon;
* hologramas;
* glassmorphism exagerado;
* gradientes excesivos;
* círculos flotantes sin función;
* partículas permanentes;
* glow excesivo;
* "AI aesthetic";
* exceso de tarjetas;
* exceso de botones;
* exceso de iconos;

No hacer que parezca una plantilla generada por IA.

Debe parecer un producto diseñado por un equipo de producto profesional.

---

## 19. Prioridad del trabajo (por feature)

1. Catálogo con infinite scroll y filtros;
2. Quick View (modular, sin 3D obligatoria);
3. Card Detail;
4. 3D Visual Language (quita partículas/neón, mejora iluminación);
5. Authentication;
6. Deck Builder;
7. Deck 3D;
8. Deck Simulator;
9. Colección + Favoritos;
10. Responsive;
11. Testing + QA.