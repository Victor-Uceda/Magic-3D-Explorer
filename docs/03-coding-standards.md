# Coding Standards

## 1. Objetivo

Todo el código debe ser:

* legible;
* mantenible;
* testeable;
* predecible;
* seguro;
* sencillo.

El código debe poder ser entendido por otro desarrollador sin depender del contexto del autor.

---

## 2. KISS

Utilizar la solución más sencilla que resuelva correctamente el problema.

No introducir:

* abstracciones innecesarias;
* frameworks adicionales;
* patrones innecesarios;
* capas artificiales.

---

## 3. DRY

Evitar duplicación de lógica.

Pero no aplicar DRY de forma excesiva.

No crear una abstracción solamente porque dos funciones tienen unas líneas similares.

La abstracción debe representar una responsabilidad real.

---

## 4. SOLID

Aplicar SOLID cuando aporte valor.

Especialmente:

### Single Responsibility

Una clase, función o módulo debe tener una responsabilidad clara.

### Open/Closed

Facilitar extensión cuando exista una necesidad real.

### Dependency Inversion

Separar lógica de negocio de implementaciones externas cuando sea beneficioso.

---

## 5. Funciones

Las funciones deben:

* ser pequeñas;
* tener una responsabilidad;
* tener nombres descriptivos;
* evitar efectos secundarios innecesarios.

Evitar funciones que hagan simultáneamente:

* HTTP;
* validación;
* base de datos;
* lógica de negocio;
* transformación;
* respuesta.

Separar responsabilidades.

---

## 6. Nombres

Utilizar nombres descriptivos.

Preferir:

```typescript
getCardByName()
saveFavoriteCard()
mapScryfallCard()
calculatePriceChange()
```

Evitar:

```typescript
getData()
process()
handle()
doStuff()
```

---

## 7. TypeScript

Utilizar TypeScript estricto.

Evitar `any`.

No utilizar `any` simplemente para solucionar rápidamente un error.

Preferir:

* interfaces;
* types;
* unions;
* generics;
* type guards;
* tipos específicos.

---

## 8. Interfaces

Crear interfaces para representar contratos importantes.

Ejemplo:

```typescript
interface Card {
  id: string;
  name: string;
  manaCost: string;
  typeLine: string;
  oracleText: string;
}
```

---

## 9. Errores

Los errores deben ser explícitos.

No utilizar:

```typescript
catch {
}
```

sin una razón válida.

Crear errores controlados cuando sea necesario:

```text
ValidationError
NotFoundError
ExternalApiError
UnauthorizedError
DatabaseError
```

No enviar stack traces al frontend.

---

## 10. Validación

Tratar toda entrada externa como no confiable.

Validar:

* inputs;
* parámetros;
* respuestas de APIs;
* datos de Firestore;
* información de autenticación.

---

## 11. Seguridad

Nunca:

* almacenar secretos en Git;
* colocar credenciales en frontend;
* confiar ciegamente en datos enviados por el cliente;
* exponer información interna.

Utilizar `.env` cuando corresponda.

Mantener `.env.example` sin secretos reales.

---

## 12. Comentarios

No comentar código obvio.

Incorrecto:

```typescript
// Increment counter
counter++;
```

Los comentarios deben explicar principalmente:

* por qué existe una decisión;
* limitaciones;
* comportamiento no evidente.

---

## 13. Componentes React

Evitar componentes gigantes.

Un componente debe tener una responsabilidad clara.

Separar:

```text
CardSearch
CardDetails
Card3D
InfoNode
FavoritesButton
```

No colocar toda la aplicación dentro de `App.tsx`.

---

## 14. Hooks

Utilizar hooks personalizados para lógica reutilizable.

Ejemplos:

```text
useCardSearch()
useFavorites()
useAuth()
```

No crear hooks gigantes que manejen toda la aplicación.

---

## 15. Estado

Utilizar el nivel de estado más sencillo posible.

Prioridad:

1. estado local;
2. hooks;
3. Context;
4. estado global solamente cuando sea necesario.

---

## 16. Magic Numbers

Evitar valores mágicos.

Preferir:

```typescript
const SIGNIFICANT_PRICE_CHANGE_PERCENT = 5;
```

en lugar de:

```typescript
if (change > 5) {}
```

cuando el número tenga significado de negocio.

---

## 17. Dependencias

Antes de instalar una dependencia:

1. identificar el problema;
2. comprobar si ya existe una solución;
3. evaluar mantenimiento;
4. evaluar tamaño;
5. evaluar seguridad;
6. justificar su utilización.

No instalar librerías por comodidad si una solución sencilla ya existe.

---

## 18. Performance

Optimizar únicamente cuando exista una razón.

Priorizar:

* renders eficientes;
* lazy loading;
* debounce;
* cache;
* reutilización de recursos 3D;
* optimización de texturas.

Evitar micro-optimizaciones innecesarias.

---

## 19. 3D Performance

Reutilizar:

* geometrías;
* materiales;
* texturas cuando sea posible.

Evitar crear objetos innecesarios en cada render.

No cargar recursos pesados hasta necesitarlos.

---

## 20. Code Smells

Durante cada revisión buscar:

* funciones gigantes;
* componentes gigantes;
* duplicación;
* nombres ambiguos;
* `any`;
* lógica duplicada;
* dependencias innecesarias;
* imports sin utilizar;
* errores ignorados;
* lógica de negocio en componentes visuales;
* acoplamiento excesivo;
* comentarios innecesarios.

---

## 21. Regla de diseño

No utilizar patrones de diseño simplemente para demostrar conocimiento.

Usar patrones únicamente cuando resuelvan un problema real.

Patrones permitidos cuando sean apropiados:

* Repository;
* Service Layer;
* Adapter;
* Mapper;
* Dependency Injection;
* Custom Hooks.

Evitar sobreingeniería.

---

## 22. Principio final

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
