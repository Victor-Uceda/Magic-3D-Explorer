# 🎯 Guía Maestra de Entrevista Técnica: Backend Developer
## Proyecto: *Magic 3D Explorer*

Esta guía está diseñada específicamente para que demuestres tus conocimientos como **Backend / Fullstack Engineer**. Aunque la aplicación cuenta con un frontend 3D impresionante, aquí aprenderás a explicar **la arquitectura de datos, el consumo resiliente de APIs, la seguridad en la nube, el modelado NoSQL y la escalabilidad del sistema**.

---

## ⏱️ 1. El Elevator Pitch (Cómo presentarlo en 60 segundos)

> *"Magic 3D Explorer es una plataforma web para coleccionistas de cartas Magic: The Gathering. Desde la perspectiva de arquitectura y backend, diseñé un sistema serverless desacoplado que integra APIs de terceros bajo estrictas políticas de rate-limiting, una capa de persistencia NoSQL en Cloud Firestore con sincronización en tiempo real, autenticación segura basada en tokens JWT/OAuth2 con Firebase Auth, y un motor probabilístico que simula la distribución matemática de rarezas de sobres físicos. Apliqué patrones de diseño como Adapter/Data Mapper para aislar el contrato de la API externa del dominio interno, y técnicas de resiliencia como circuit breaker/timeouts con AbortController y sanitización de esquemas."*

---

## 🏗️ 2. Arquitectura del Sistema y Flujo de Datos

```
[ Cliente SPA ] (React 18 + TS)
       │
       ├─── 1. Autenticación ──────► [ Firebase Auth ] (OAuth 2.0 / JWT)
       │                                     │
       ├─── 2. Datos de Usuario ───► [ Cloud Firestore NoSQL ]
       │    (Mazos, Favoritos)       (users/{uid}/decks/{id})
       │                             (Listeners onSnapshot en tiempo real)
       │
       └─── 3. Integración Externa ─► [ ScryfallClient (Custom Gateway) ]
                                             │
                                             ├─ Rate Limiting (Queue ~80ms)
                                             ├─ AbortController Timeouts
                                             ├─ Data Mapper Pattern (DTO -> Domain)
                                             │
                                             ▼
                                     [ Scryfall REST API ]
```

---

## 🧠 3. Pilares Técnicos Fundamentales (Lo que DEBES explicar)

### A. Consumo Resiliente de APIs Externas y Rate Limiting (`ScryfallClient.ts`)
- **Problema**: La API oficial de Scryfall penaliza con código `HTTP 429 (Too Many Requests)` o bloquea IPs si se hacen peticiones a más de 10-15 req/seg.
- **Solución implementada**:
  1. **Throttling / Delay de Seguridad**: Control de `lastRequestTime` con un delay mínimo programado de `80ms` entre ráfagas de consultas.
  2. **Timeout con AbortController**: Si una consulta tarda más de `8000ms`, se cancela automáticamente el stream HTTP mediante `AbortController.abort()` para no consumir memoria ni dejar conexiones colgadas.
  3. **Identificación de Cliente (RFC Compliance)**: Envío de cabecera `User-Agent: Magic3DExplorer/1.0` y `Accept: application/json;q=0.9,*/*;q=0.8`.
  4. **Jerarquía Tipada de Errores**: Manejo explícito de `ScryfallNotFoundError (404)`, `ScryfallRateLimitError (429)`, `ScryfallTimeoutError` y `ScryfallNetworkError`.

### B. Patrón Data Mapper / Adapter (`cardMapper.ts`)
- **Problema**: Las APIs externas cambian sus esquemas (`snake_case`, campos anidados en cartas bifaces `card_faces`, precios en `null` o strings `"12.50"`). Si el frontend usa el JSON directo, cualquier cambio en la API externa rompe la aplicación.
- **Solución**:
  - Se creó una función de transformación pura `mapScryfallCardToDomain(dto: ScryfallCard): Card`.
  - Normaliza la nomenclatura a `camelCase`.
  - Extrae de forma segura imágenes de alta resolución (priorizando `normal` / `large` / `png`).
  - Convierte y calcula precios de USD a moneda local (Soles PEN `S/.` a tasa de cambio fija `3.75`).
  - Resuelve cartas de doble cara (Transformables / DFC) concatenando oráculos o leyendo la cara frontal.

### C. Persistencia y Modelado NoSQL en Cloud Firestore (`firestoreService.ts`)
- **Estructura de Base de Datos**:
  - `users/{userId}/decks/{deckId}`: Subcolección dedicada por usuario. Garantiza aislamiento de datos y búsquedas indexadas ultra rápidas por propietario.
  - `users/{userId}/favorites/collection`: Almacén de cartas marcadas como favoritas.
- **Sanitización de Datos**:
  - Firestore rechaza valores `undefined`. Se implementó un serializador recursivo `sanitizeForFirestore(data)` que mapea `undefined -> null`.
- **Sincronización en Tiempo Real**:
  - Uso de listeners `onSnapshot` que envían diffs atómicos de cambios en mazos directamente al cliente sin necesidad de polling repetitivo.

### D. Motor Probabilístico de Simulación de Sobres (`boosterSimulator.ts`)
- **Algoritmo de Generación**:
  - Distribución matemática de un sobre estándar MTG (15 cartas):
    - **1 Carta Rara o Mítica**: Probabilidad de Mítica = `1/8 (12.5%)`, Rara = `7/8 (87.5%)`.
    - **3 Cartas Infrecuentes**.
    - **10 Cartas Comunes**.
    - **1 Tierra Básica**.
    - **Slot Foil Probabilístico**: ~33% de probabilidad de reemplazar 1 común por una versión Foil de cualquier rareza.
  - **Manejo de Conjuntos (Sets) y Exclusiones**:
    - Deduplicación por `card.id` mediante estructuras de datos `Set<string>`.
    - Consultas filtradas por `set:<code>` y `is:booster`.

### E. Seguridad y Gestión de Entorno
- **Separación de Responsabilidades**: Las variables de infraestructura se inyectan mediante variables de entorno `VITE_FIREBASE_*`.
- **Reglas de Seguridad Firestore (RBAC & Ownership)**:
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{userId}/decks/{deckId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
  ```

---

## 🎤 4. Preguntas Típicas de Entrevista Backend y Cómo Responderlas

### ❓ Pregunta 1: *"¿Por qué elegiste Cloud Firestore (NoSQL) en lugar de una base de datos relacional (PostgreSQL/MySQL)?"*
> **Tu respuesta:**
> *"Elegí Cloud Firestore principalmente por dos motivos: la naturaleza jerárquica de los datos de un usuario (mazos y cartas como subdocumentos JSON) y la necesidad de sincronización en tiempo real (`onSnapshot`) entre múltiples pestañas o dispositivos sin tener que mantener un servidor WebSocket dedicado. Además, la arquitectura serverless de Firestore me permitió escalar sin preocuparme por aprovisionar instancias o balanceadores de carga, delegando la autorización directamente en las Security Rules a nivel de documento."*

### ❓ Pregunta 2: *"¿Cómo manejas el Rate Limiting de APIs de terceros para que tus usuarios no saturen el servicio externo?"*
> **Tu respuesta:**
> *"Implementé una capa de Gateway en `ScryfallClient` que registra la estampa de tiempo de la última solicitud (`lastRequestTime`). Si dos componentes o usuarios disparan peticiones simultáneas, el cliente encola un retardo asíncrono que garantiza una ventana de seguridad mínima de 80ms entre peticiones. Adicionalmente, agregué una capa de caché en memoria (`Map<string, Card[]>`) para búsquedas frecuentes y sinergias, evitando realizar peticiones redundantes cuando el usuario ya consultó una carta."*

### ❓ Pregunta 3: *"Si tuvieras que escalar este backend a 500,000 usuarios activos concurrentes, ¿qué cambios arquitectónicos harías?"*
> **Tu respuesta:**
> *"Evolucionaría la arquitectura en tres fases:*
> 1. *Capa de Caché Distribuida con Redis: Almacenar los resultados de búsquedas de cartas populares y metadatos de colecciones en Redis con TTL de 24 horas, reduciendo el 90% de llamadas a APIs externas.*
> 2. *Microservicio Backend en Node.js / NestJS o Go: En lugar de que los clientes consulten directamente a Scryfall, colocaría un API Gateway propio con colas de mensajes (BullMQ / RabbitMQ) para procesar solicitudes masivas e indexar todo el catálogo de cartas en Elasticsearch / Meilisearch para búsquedas de texto completo en sub-milisegundos.*
> 3. *Base de datos Híbrida: Mantener Firestore para perfiles y mazos, pero migrar la información analítica de precios de mercado y transacciones a PostgreSQL con réplicas de lectura."*

### ❓ Pregunta 4: *"¿Cómo aseguras que el código sea testeable y desacoplado?"*
> **Tu respuesta:**
> *"Apliqué el principio de Inversión de Dependencias y el patrón Adapter. Toda la lógica de red está encapsulada en `scryfallClient.ts` y desacoplada de la UI. La capa de mapeo `cardMapper.ts` recibe un contrato externo (DTO) y devuelve una entidad de dominio pura (`Card`). Esto permite hacer pruebas unitarias con Jest/Vitest mockeando las respuestas JSON sin necesidad de tocar la base de datos ni hacer llamadas reales a internet."*

---

## 📚 5. Glosario de Conceptos Backend para lucirte

| Concepto | Dónde se aplica en tu proyecto |
|---|---|
| **Rate Limiting / Throttling** | En `ScryfallClient.ts` respetando 80ms entre peticiones para evitar HTTP 429. |
| **Adapter / Data Mapper** | En `cardMapper.ts` para aislar el esquema del proveedor externo del dominio propio. |
| **Idempotencia** | En `saveCloudDeck()` utilizando `setDoc` con `{ merge: true }` y claves `deck.id` predecibles. |
| **JWT / Bearer Token** | En Firebase Authentication para verificar sesiones de usuario sin guardar estados en memoria. |
| **Sanitización de Payload** | En `sanitizeForFirestore()` eliminando valores `undefined` antes de persistir. |
| **In-Memory Caching** | En `synergiesCache` (`Map<string, Card[]>`) y `textureCache` para mitigar latencia de red. |
| **Circuit Breaker / Timeout** | En `AbortController` cancelando llamadas fetch colgadas a los 8 segundos. |

---

## 💡 6. Consejos Finales para el Día de la Entrevista
1. **Habla de 'Por qué' antes que del 'Cómo'**: Siempre explica qué problema de negocio o técnico resolviste antes de entrar al detalle del código.
2. **Reconoce trade-offs (compromisos)**: Un buen backend sabe que ninguna arquitectura es perfecta. Menciona por qué NoSQL fue ideal para esta etapa y cómo migrarías a relacional si necesitaras queries relacionales complejas o reportes financieros ACID.
3. **Muestra orgullo por la robustez**: Menciona que el proyecto cuenta con 0 errores de compilación TypeScript (`tsc -b`), linting estricto y tipado de dominio al 100%.
