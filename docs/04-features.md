# Features

## 1. Card Search

El usuario debe poder buscar una carta por nombre.

Ejemplo:

```text
Black Lotus
```

El frontend enviará la solicitud al backend.

Estados:

```text
IDLE
LOADING
SUCCESS
EMPTY
ERROR
```

---

## 2. Card Data

Mostrar como mínimo:

* nombre;
* mana cost;
* type line;
* oracle text;
* rarity;
* set;
* set name;
* artist;
* image;
* prices;
* legalities.

---

## 3. 3D Card

La carta debe aparecer en una escena 3D.

Debe permitir:

* rotación;
* zoom;
* movimiento de cámara;
* selección.

Utilizar una geometría reutilizable.

La imagen de Scryfall debe utilizarse como textura (en cartas DFC o de doble cara, utilizar la textura de la cara frontal para el MVP).

---

## 4. Information Nodes

Crear cuatro nodos principales:

```text
PRICE
LEGALITY
PRINTINGS
DETAILS
```

Los nodos deben estar conectados visualmente con la carta.

---

## 5. Price Node

Mostrar información disponible de precios.

Ejemplo:

```text
USD
$3.21

EUR
€2.87
```

No inventar datos que Scryfall no proporcione.

---

## 6. Legality Node

Mostrar legalidad por formato.

Ejemplo:

```text
Standard
Modern
Legacy
Vintage
Commander
Pioneer
Pauper
```

Utilizar los formatos realmente proporcionados por Scryfall.

---

## 7. Printings Node

Mostrar las diferentes impresiones de la carta.

Cuando sea posible:

* set;
* set name;
* release date;
* imagen.

No cargar información innecesaria antes de solicitarla.

---

## 8. Details Node

Mostrar:

* nombre;
* tipo;
* rareza;
* artista;
* texto;
* mana cost.

---

## 9. Authentication

Utilizar Firebase Authentication.

Debe permitir autenticación mediante un método sencillo apropiado para el MVP.

El usuario no autenticado puede explorar cartas.

El usuario autenticado puede guardar favoritos.

---

## 10. Favorites

Usuario autenticado:

```text
Add Favorite
Remove Favorite
View Favorites
```

Los favoritos deben pertenecer exclusivamente al usuario correspondiente.

---

## 11. Firestore

Estructura conceptual:

```text
users/
    {userId}/

favorites/
    {favoriteId}
```

No almacenar información duplicada innecesariamente.

---

## 12. Cache

Antes de consultar Scryfall:

```text
Request
 ↓
Cache
 ↓
¿Válido?
 ├── YES → Return
 └── NO → Scryfall
```

Definir un TTL razonable.

Documentar la estrategia.

---

## 13. Error Handling

Mostrar estados amigables.

Ejemplo:

```text
Card not found

Unable to connect to Scryfall

Something went wrong. Please try again.
```

No mostrar errores internos.

---

## 14. Responsive

La aplicación debe funcionar en:

* desktop;
* tablet;
* móvil.

La experiencia 3D puede simplificarse en pantallas pequeñas.

---

## 15. Performance

Implementar:

* debounce de búsqueda;
* cache;
* carga progresiva;
* lazy loading cuando corresponda;
* reutilización de recursos 3D.

---

## 16. Accessibility

Cuando corresponda:

* botones accesibles;
* labels;
* navegación por teclado;
* contraste adecuado;
* textos alternativos.

La interfaz 3D no debe ser la única forma de acceder a información importante.

---

## 17. MVP Definition of Done

El MVP está terminado cuando:

1. el usuario abre la aplicación;
2. busca una carta;
3. backend consulta Scryfall;
4. se recibe información válida;
5. la carta aparece en 3D;
6. puede rotarse;
7. puede hacer zoom;
8. puede seleccionar PRICE;
9. puede seleccionar LEGALITY;
10. puede seleccionar PRINTINGS;
11. puede seleccionar DETAILS;
12. puede iniciar sesión;
13. puede guardar favoritos;
14. puede consultar favoritos;
15. existen tests;
16. el proyecto puede desplegarse.
