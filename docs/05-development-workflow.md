# Development Workflow

## 1. Regla principal

El proyecto debe desarrollarse incrementalmente.

No implementar todas las funcionalidades simultáneamente.

Cada fase debe quedar funcional antes de comenzar la siguiente.

---

# 2. FASE 1 — Project Setup

Configurar:

* React;
* TypeScript;
* Vite;
* ESLint;
* Git;
* estructura inicial.

Verificar:

```text
npm install
npm run dev
npm run build
```

---

# 3. FASE 2 — 3D Scene

Crear:

* escena;
* cámara;
* iluminación;
* mesa;
* carta;
* controles de cámara.

Utilizar inicialmente una imagen temporal.

Objetivo:

tener una escena 3D funcional antes de integrar APIs.

---

# 4. FASE 3 — Scryfall Client

Crear cliente de Scryfall.

Implementar:

* búsqueda;
* headers requeridos (`User-Agent: Magic3DExplorer/1.0`, `Accept: application/json`);
* timeout;
* errores HTTP (incluyendo rate limit 429);
* errores de red.

No mezclar con Firestore.

---

# 5. FASE 4 — Cloud Functions

Crear funciones backend.

Implementar:

```text
searchCard
getCard
```

Validar entradas.

Validar respuestas externas.

---

# 6. FASE 5 — Mapper

Crear:

```text
ScryfallCardResponse
        ↓
CardMapper
        ↓
Card
```

Normalizar cartas regulares y cartas de doble cara (DFC tomando la cara frontal `card_faces[0]`).

Evitar propagar estructuras externas por toda la aplicación.

---

# 7. FASE 6 — Integración 3D

Conectar datos reales.

Flujo:

```text
Search
 ↓
Backend
 ↓
Scryfall
 ↓
Card
 ↓
Card3D
```

Utilizar la imagen real de Scryfall.

---

# 8. FASE 7 — Information Nodes

Implementar:

* PRICE;
* LEGALITY;
* PRINTINGS;
* DETAILS.

Cada nodo debe tener una responsabilidad clara.

---

# 9. FASE 8 — Authentication

Configurar Firebase Authentication.

Proteger funcionalidades privadas.

---

# 10. FASE 9 — Favorites

Implementar:

* guardar;
* eliminar;
* listar.

Aplicar Security Rules.

---

# 11. FASE 10 — Cache

Implementar cache en Firestore.

Definir:

* TTL;
* estructura;
* invalidación;
* comportamiento ante errores.

---

# 12. FASE 11 — Testing

Crear tests para:

### Backend

* Scryfall client;
* mapper;
* card service;
* errores;
* validación.

### Frontend

* búsqueda;
* loading;
* error;
* resultado;
* favoritos.

Los servicios externos deben mockearse.

---

# 13. FASE 12 — QA

Realizar pruebas manuales:

### Búsqueda

* carta existente;
* carta inexistente;
* nombre incorrecto;
* búsqueda vacía.

### API

* API disponible;
* timeout;
* error HTTP.

### Authentication

* login;
* logout;
* usuario no autenticado.

### Favorites

* agregar;
* eliminar;
* listar;
* intentar acceder a datos ajenos.

### 3D

* rotación;
* zoom;
* selección de nodos;
* responsive.

---

# 14. FASE 13 — Code Review

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
* tests.

Refactorizar cuando sea necesario.

---

# 15. Git

Utilizar commits pequeños.

Ejemplos:

```text
feat: initialize project

feat: add 3d card scene

feat: add scryfall client

feat: add card search function

feat: add card mapper

feat: add information nodes

feat: add firebase authentication

feat: add favorites

test: add card service tests

fix: handle scryfall timeout

refactor: extract card mapper
```

No utilizar un único commit gigante.

---

# 16. Branches

Para funcionalidades importantes:

```text
main
develop
feature/card-search
feature/3d-scene
feature/favorites
```

No trabajar directamente en `main` cuando el cambio sea suficientemente grande.

---

# 17. Pull Requests

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

# 18. Deploy

Antes de producción:

```text
npm run lint
npm test
npm run build
```

Verificar configuración Firebase.

No desplegar secretos.

---

# 19. Documentación

Actualizar README cuando cambie:

* arquitectura;
* configuración;
* instalación;
* variables;
* funcionalidades.

No documentar funcionalidades inexistentes.
