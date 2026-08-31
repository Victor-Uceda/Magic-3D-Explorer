# ✨ Magic 3D Explorer

Explorador interactivo en 3D para cartas de **Magic: The Gathering (MTG)** desarrollado con **React**, **Three.js**, **React Three Fiber (R3F)** y la API pública oficial de **Scryfall**.

---

## 🌟 Características Destacadas

* **🔮 Visor 3D Inmersivo**: Shaders en tiempo real para acabados **Normal**, **Foil** (iridiscente dinámico) y **Etched** (grabado metálico), cámara orbital Drei y volteo interactivo de cartas (**`ESPACIO`** o clic).
* **🖼️ Variantes de Arte MTG**: Explorador de artes históricos e impresiones especiales con atajo **`V`**.
* **📦 Simulador de Sobres 3D**: Apertura y revelado de sobres Draft de 15 cartas de cualquier set con distribución probabilística real y cotización en Soles (`S/.`).
* **🃏 Constructor y Visor 3D de Mazos**: Creación y apilamiento 3D de mazos completos con compartición por enlaces.
* **📜 Códice Técnico MTG**: Panel lateral con texto de reglas, glifos vectoriales SVG de maná, legalidades por formato y estadísticas de combate.
* **🔍 Catálogo & Discovery**: Cuadrícula responsiva con *Infinite Scroll*, búsqueda con autocompletado en tiempo real (**`/`**) y filtros avanzados por maná, tipo y rareza.
* **🧩 Arquitectura Limpia**: Desacoplamiento modular mediante **Custom Hooks** (`useCardSearch`, `useCardFilters`, `useDecks`, `useFavorites`, `useStudio3D`), patrón **Repository** de persistencia y **ErrorBoundary** para resiliencia WebGL.
* **💎 Identidad Visual Noble**: Diseño sin colores neón estridentes, con paleta sobria en pizarra, grafito y acentos en oro mate tenue.

---

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor local de desarrollo
npm run dev

# 3. Validar calidad de código y compilación
npm run lint
npm run build
```

---

## 📚 Documentación Técnica Detallada

La documentación completa para entender y recrear el proyecto se encuentra en la carpeta [`/docs`](./docs):

* **[`01-project.md`](./docs/01-project.md)**: Visión, alcance y pilares del proyecto.
* **[`02-architecture.md`](./docs/02-architecture.md)**: Arquitectura técnica, árbol de archivos, pipeline 3D y flujo de datos.
* **[`03-coding-standards.md`](./docs/03-coding-standards.md)**: Estándares de TypeScript, React, modularidad y regla 3X de cero neón.
* **[`04-features.md`](./docs/04-features.md)**: Especificación detallada de todas las funcionalidades.
* **[`05-development-workflow.md`](./docs/05-development-workflow.md)**: Guía paso a paso para recrear el proyecto desde cero.
* **[`06-ai-agent.md`](./docs/06-ai-agent.md)**: Protocolo de desarrollo para asistentes y agentes IA.
