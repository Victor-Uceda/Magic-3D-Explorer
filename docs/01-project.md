# Magic 3D Explorer

## 1. Descripción

Magic 3D Explorer es una plataforma para descubrir, explorar y visualizar cartas de Magic: The Gathering mediante una experiencia 3D inteligente.

El producto está diseñado alrededor de un flujo principal: **CATÁLOGO → EXPLORAR → QUICK VIEW → 3D (cuando el usuario lo elija) → MAZO → DECK 3D → SIMULAR**.

El concepto clave: **el catálogo es el "punto de entrada" y la experiencia 3D es el "momento especial"**. El usuario entra al catálogo, descubre cartas que le interesan, explora información, decide cuándo quiere ver la carta en 3D (no es obligatorio al inicio), la agrega a un mazo y puede visualizar ese mazo completo en 3D después.

Esto cambia completamente la percepción del proyecto: en vez de que el usuario entre y vea una demo 3D preguntándose "¿y ahora qué hacer?", entra, ve cartas que le interesan, explora, abre una en 3D, la agrega a un mazo y posteriormente puede visualizar ese mazo completo en 3D.

---

## 2. Objetivo técnico

El proyecto debe demostrar:

* Consumo de APIs externas (Scryfall);
* Arquitectura limpia y separación de responsabilidades;
* Flujo de producto coherente desde catálogo hasta simulación de mazos;
* Validación de datos y manejo de errores;
* Persistencia (Firebase Auth + Firestore);
* Testing y Git;
* Rendimiento y code legible;
* Revisiones de código generado por IA con criterio técnico.

---

## 3. Usuario

El usuario podrá:

1. Buscar y descubrir cartas en un catálogo infinito (punto de entrada);
2. Explorar información Quick View de cartas sin navegar obligatoriamente a 3D;
3. Ver cartas en 3D cuando lo elija (momento especial, no pantalla obligatoria);
4. Agregar cartas a mazos personales;
5. Crear y administrar mazos con formato seleccionado;
6. Visualizar mazos completos en 3D (Deck 3D);
7. Simular manos iniciales, robar, mulligan y barajar;
8. Autenticarse y guardar favoritos/colección;
9. Filtrar y ordenar el catálogo por diversos atributos;
10. Recibir información progresiva sin saturación.

---

## 4. Alcance del MVP

El MVP debe incluir:

* Catálogo de cartas con infinite scroll (punto de entrada);
* Quick View de cartas (sin 3D obligatoria - el usuario decide);
* Card Detail con toda la información relevante;
* Filtros progresivos (color, tipo, rareza, set, precio);
* Sorting de resultados (nombre, precio, fecha, rareza, coste);
* Deck Builder (crear mazos básicos con nombre y formato);
* Deck 3D (visualizar mazo completo en 3D);
* Booster Simulator (ya existente, integrado en flujo de mazos);
* Firebase Authentication (opcional, no bloquea la exploración);
* Favoritos y colección personal;
* Tests básicos;
* Deploy.

---

## 5. Fuera del alcance

No implementar inicialmente:

* Dashboard genérico;
* Interfaz de videojuego;
* Cyberpunk, neon o hologramas;
* Glassmorphism excesivo;
* Gradientes excesivos;
* Círculos flotantes sin función;
* Partículas permanentes;
* Glow excesivo;
* "AI aesthetic";
* Exceso de tarjetas simultáneas;
* Exceso de botones o iconos;
* Reglas completas de Magic;
* IA avanzada para generación de cartas;
* Gameplay completo (partidas, combate, multiplayer);
* Marketplace o sistema de pagos;
* Chat o inventario complejo.

---

## 6. Principio principal

El proyecto debe priorizar:

**Funcionalidad > Legibilidad > Mantenibilidad > Seguridad > Performance > Complejidad**

No introducir complejidad únicamente para hacer que el proyecto parezca más avanzado.

Una solución sencilla y bien implementada es preferible a una solución compleja e innecesaria.

El usuario nunca debe necesitar instrucciones para entender dónde hacer las acciones básicas. Si lo necesita, el flujo debe considerarse fallido.

---

## 7. Prioridad del trabajo

No comenzar programando inmediatamente.

Primero:

1. Rediseño de navegación y arquitectura de páginas (rutas SPA);
2. Home/Feed con catálogo infinito como punto de entrada;
3. Catálogo con infinite scroll, filtros y sorting;
4. Quick View y Card Detail;
5. Mejorar Card 3D (visual language: análisis, no videojuego);
6. Authentication Firebase (opcional, flujo natural);
7. Deck Builder;
8. Deck 3D;
9. Integrar Deck Simulator;
10. Colección + favoritos;
11. Responsive;
12. Testing + QA + performance.

---

## 8. Critério de éxito

El producto debe conseguir que un usuario nuevo pueda hacer esto sin explicación:

```
entrar
   ↓
descubrir una carta en el catálogo
   ↓
abrirla en Quick View
   ↓
entender su información
   ↓
verla en 3D (opcional, cuando lo desee)
   ↓
agregarla a un mazo
   ↓
abrir el mazo
   ↓
verlo en 3D (Deck 3D)
   ↓
simular una mano
```

Si el usuario necesita instrucciones para entender dónde hacer estas acciones, el flujo debe considerarse fallido.

---

## 9. Resultado esperado

No quiero simplemente una interfaz "bonita".

Quiero:

```
PRODUCT THINKING
+ GOOD UX
+ CLEAN ARCHITECTURE
+ 3D EXPERIENCE (como momento especial, no como navegación default)
+ API INTEGRATION (Scryfall)
+ AUTHENTICATION (opcional, no bloqueante)
+ DECK BUILDING
+ SIMULATION (hand drafting, booster)
```

El resultado debe sentirse como un producto real y no como una demo técnica. La progresión debe ser natural: catálogo → descubrimiento → decisión sobre 3D → mazo → visualización 3D del mazo → simulación.

---

## 10. Flujo visual resumido

```
MAGIC 3D
   │
   ├──▼ CATÁLOGO (punto de entrada)
   │    │
   │    ├──▼ Infinite Scroll
   │    │    │
   │    │    ├──▼ Filtros progresivos
   │    │    │    │
   │    │    │    ├──▼ Sorting
   │    │    │    │
   │    │    │    └──────▼
   │    │    │           └──► cada carta
   │    │    │                      │
   │    │    │                      ├──► Hover → Quick View
   │    │    │                      │     (sin 3D obligatoria)
   │    │    │                      │
   │    │    │                      ├──► Card Detail
   │    │    │                      │
   │    │    │                      └──► [Ver en 3D] (opcional)
   │    │    │                               │
   │    │    │                               ▼
   │    │    │                      [Agregar al mazo]
   │    │    │                               │
   │    │    │                               ▼
   │    │    │                      Mis Mazos
   │    │    │                               │
   │    │    │                               ▼
   │    │    │                      Deck 3D
   │    │    │                               │
   │    │    │                               ▼
   │    │    │                      Simulador
   │    │    │                               │
   │    │    │                               └──► Mano inicial, robar, mulligan, barajar
   │    │    │
   │    │    └──────────────────────────────► Favoritos/Colección
   │    │
   │    └──────────────────────────────► Authentication (si quiere guardar)
   │
   └──────────────────────────────────────────────► Maquetación visual:
                                      CATÁLOGO → DESCUBRIR → DECIDIR 3D → MAZO → DECK 3D → SIMULAR