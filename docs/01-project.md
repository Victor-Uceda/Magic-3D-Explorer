# Magic 3D Explorer

## 1. Descripción

Magic 3D Explorer es una aplicación web interactiva para explorar cartas de Magic: The Gathering mediante una experiencia visual 3D.

La aplicación obtiene información desde la API pública de Scryfall y transforma los datos de una carta en una representación visual interactiva.

La carta se presenta como el elemento central de una escena 3D y alrededor de ella aparecen nodos relacionados con diferentes categorías de información:

* Price
* Legality
* Printings
* Details

El proyecto no pretende ser un videojuego ni implementar las reglas completas de Magic: The Gathering.

El objetivo es construir una experiencia de exploración de datos utilizando una interfaz 3D.

---

## 2. Objetivo técnico

El proyecto debe demostrar buenas prácticas de desarrollo de software y especialmente:

* consumo de APIs externas;
* desarrollo backend;
* arquitectura limpia;
* separación de responsabilidades;
* validación de datos;
* manejo de errores;
* persistencia;
* autenticación;
* testing;
* Git;
* seguridad;
* rendimiento;
* código legible;
* revisión de código generado por IA.

---

## 3. Usuario

El usuario podrá:

1. buscar una carta;
2. visualizarla en 3D;
3. interactuar con la escena;
4. consultar información específica;
5. visualizar precios;
6. consultar legalidad;
7. consultar impresiones;
8. consultar detalles;
9. autenticarse;
10. guardar cartas favoritas.

---

## 4. Alcance del MVP

El MVP debe incluir:

* búsqueda de cartas;
* integración con Scryfall;
* carta 3D;
* cámara orbital;
* escena 3D;
* nodos de información;
* precios;
* legalidad;
* impresiones;
* detalles;
* Firebase Authentication;
* favoritos;
* Firestore;
* manejo de errores;
* tests básicos;
* deploy.

---

## 5. Fuera del alcance

No implementar inicialmente:

* partidas completas;
* combate;
* multiplayer;
* deck builder;
* marketplace;
* sistema de pagos;
* chat;
* inventario complejo;
* mundo abierto;
* personajes 3D;
* reglas completas de Magic;
* soporte completo para cartas de doble cara (DFC / Transform) en 3D (para el MVP se usará solo la cara frontal);
* IA avanzada.

Estas funcionalidades solamente podrán agregarse después de terminar correctamente el MVP.

---

## 6. Principio principal

El proyecto debe priorizar:

**Funcionalidad > Legibilidad > Mantenibilidad > Seguridad > Performance > Complejidad**

No introducir complejidad únicamente para hacer que el proyecto parezca más avanzado.

Una solución sencilla y bien implementada es preferible a una solución compleja e innecesaria.
