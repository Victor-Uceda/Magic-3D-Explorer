# Flujo de Desarrollo y Guía de Recreación desde Cero

Esta guía describe el procedimiento exacto para recrear, configurar y ejecutar el proyecto desde cero.

---

## 📋 Requisitos Previos

* **Node.js**: v18.0.0 o superior (recomendado v20.x LTS).
* **npm**: v9.0.0 o superior.

---

## 🚀 Guía de Instalación y Puesta en Marcha

### 1. Clonar o Inicializar el Proyecto
```bash
git clone <url-del-repositorio>
cd PROYECTO
```

### 2. Instalar Dependencias del Ecosistema
```bash
npm install
```

*Dependencias principales utilizadas*:
* `react`, `react-dom` (v19)
* `three`, `@react-three/fiber`, `@react-three/drei` (Motor 3D)
* `lucide-react` (Iconografía)
* `canvas-confetti` (Efectos de celebración en sobres)

*Dependencias de desarrollo*:
* `typescript`
* `vite` y `@vitejs/plugin-react`
* `eslint` y plugins de React Hooks

---

## 🛠️ Scripts y Comandos de Trabajo

### Iniciar Servidor Local de Desarrollo (HMR)
```bash
npm run dev
```
> Abre tu navegador en **`http://localhost:3000/`** (o puerto asignado).

### Verificación de Calidad y Tipos (Linter)
```bash
npm run lint
```
> Comprueba el cumplimiento estricto de TypeScript y reglas de React. **Debe arrojar 0 errores y 0 warnings**.

### Compilación para Producción (Build)
```bash
npm run build
```
> Ejecuta `tsc -b` y compila los bundles minificados en la carpeta `/dist`.

### Previsualizar la Compilación de Producción
```bash
npm run preview
```

---

## 🧪 Lista de Verificación para Nuevos Desarrolladores

1. [ ] **Sin colores neón**: Verificar que no se introduzcan amarillos chillones, verdes fosforescentes o cianes estridentes.
2. [ ] **Moneda en Soles**: Confirmar que los precios nuevos usen `formatPricePEN(...)`.
3. [ ] **Modularidad**: Ningún componente nuevo debe exceder ~250 líneas.
4. [ ] **Comentarios**: Documentar lógica y funciones en español claro y conciso.
5. [ ] **Pruebas de compilación**: Ejecutar `npm run lint` y `npm run build` antes de realizar commits.