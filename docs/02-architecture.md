# Architecture

## 1. Arquitectura general

La aplicación debe utilizar una arquitectura dividida entre frontend, backend, servicios externos y persistencia.

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

---

## 2. Frontend

Tecnologías:

* React
* TypeScript
* Vite
* React Three Fiber
* Three.js
* Drei

Responsabilidades:

* interfaz;
* búsqueda;
* interacción;
* visualización;
* escena 3D;
* autenticación del usuario;
* favoritos;
* estados de loading/error/success.

El frontend no debe contener lógica de acceso directo a servicios externos cuando dicha lógica pueda centralizarse en el backend.

---

## 3. Backend

Utilizar Firebase Cloud Functions.

Responsabilidades:

* comunicación con Scryfall;
* validación;
* normalización;
* cache;
* lógica de negocio;
* manejo de errores;
* operaciones relacionadas con favoritos cuando corresponda.

---

## 4. Scryfall

Scryfall es una dependencia externa.

Nunca asumir que:

* siempre está disponible;
* siempre devuelve datos completos;
* nunca cambia;
* nunca devuelve errores.

Toda respuesta externa debe validarse antes de utilizarse.

---

## 5. Cliente Scryfall

Crear una abstracción específica para Scryfall.

Ejemplo:

```text
functions/src/infrastructure/scryfall/
    scryfallClient.ts
```

Responsabilidades:

* realizar requests con headers requeridos (`User-Agent: Magic3DExplorer/1.0`, `Accept: application/json`);
* timeout;
* status codes (incluyendo `429 Too Many Requests`);
* errores de red;
* parseo inicial.

No debe contener lógica relacionada con Firestore o UI.

---

## 6. Servicios

La lógica relacionada con cartas debe vivir en un servicio.

Ejemplo:

```text
cardService.ts
```

Responsabilidades:

* buscar cartas;
* obtener cartas;
* consultar cache;
* actualizar cache;
* utilizar ScryfallClient;
* transformar resultados.

---

## 7. DTO y Mapper

No propagar directamente los objetos completos de Scryfall por toda la aplicación.

Flujo:

```text
ScryfallResponse
       ↓
CardMapper
       ↓
Card
       ↓
Application
```

La aplicación debe trabajar con modelos propios cuando sea apropiado.
En cartas de doble cara (DFC / `card_faces`), el mapper debe normalizar y extraer la cara frontal (`card_faces[0].image_uris`) para mantener simple la interfaz visual.

---

## 8. Firestore

Utilizar Firestore para:

* favoritos;
* información cacheada cuando corresponda;
* datos asociados al usuario.

No duplicar innecesariamente toda la respuesta de Scryfall.

---

## 9. Authentication

Firebase Authentication será responsable de identificar usuarios.

Los favoritos deben estar asociados al usuario autenticado.

Un usuario no debe poder leer o modificar los favoritos de otro usuario.

---

## 10. Repository

Cuando la interacción con Firestore sea suficientemente compleja, utilizar una capa repository.

Ejemplo:

```text
favoriteRepository
```

Responsabilidad:

* guardar;
* obtener;
* eliminar favoritos.

La lógica de negocio debe permanecer en el servicio.

No crear repositories innecesarios para operaciones triviales.

---

## 11. Dependency Injection

Utilizar Dependency Injection cuando facilite:

* testing;
* desacoplamiento;
* sustitución de dependencias.

Ejemplo:

```text
CardService
     ↓
ScryfallClient
```

En tests:

```text
CardService
     ↓
MockScryfallClient
```

No implementar un framework de Dependency Injection complejo si no es necesario.

---

## 12. Arquitectura 3D

Separar la escena 3D de la interfaz convencional.

```text
src/three/

Scene.tsx
Card3D.tsx
InfoNode.tsx
Connection.tsx
CameraController.tsx
Table.tsx
Lighting.tsx
```

### Card3D

Responsable de representar una carta.

### InfoNode

Representa un nodo de información.

### Connection

Representa una conexión visual.

### Scene

Coordina los elementos de la escena.

### CameraController

Controla la cámara.

---

## 13. Carta 3D

No crear un modelo 3D diferente para cada carta.

Utilizar un único modelo geométrico reutilizable.

La imagen de Scryfall será utilizada como textura.

```text
Scryfall
   ↓
image URL
   ↓
Texture
   ↓
Card3D
```

---

## 14. Flujo de búsqueda

```text
Usuario
   ↓
React
   ↓
Cloud Function
   ↓
CardService
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
       Escena 3D
```

---

## 15. Estructura inicial

```text
magic-3d-explorer/

├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── cards/
│   │   ├── search/
│   │   └── dashboard/
│   │
│   ├── three/
│   │   ├── Scene.tsx
│   │   ├── Card3D.tsx
│   │   ├── InfoNode.tsx
│   │   ├── Connection.tsx
│   │   ├── CameraController.tsx
│   │   ├── Table.tsx
│   │   └── Lighting.tsx
│   │
│   ├── features/
│   │   ├── cards/
│   │   ├── favorites/
│   │   └── search/
│   │
│   ├── services/
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   ├── pages/
│   ├── App.tsx
│   └── main.tsx
│
├── functions/
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
├── tests/
├── public/
├── firestore.rules
├── firebase.json
├── .env.example
├── README.md
├── package.json
└── tsconfig.json
```
