# INTEGRA Web

Sistema moderno de análisis de sistemas dinámicos basado en web.

## 🚀 Características

- **Interfaz Unificada**: Definición y simulación en una sola aplicación
- **Visualización Interactiva**: Gráficos 2D/3D con Plotly.js
- **Métodos Numéricos**: Euler, Runge-Kutta 4, y más
- **Biblioteca de Ejemplos**: Sistemas clásicos predefinidos (Lorenz, Van der Pol, etc.)
- **Diseño Moderno**: Interfaz oscura y profesional

## 📋 Requisitos Previos

- **Node.js** 18.x o superior
- **npm** 9.x o superior

### Instalación de Node.js

#### Windows
1. Descargar desde [nodejs.org](https://nodejs.org/)
2. Ejecutar el instalador
3. Reiniciar la terminal

O con winget:
```powershell
winget install OpenJS.NodeJS.LTS
```

#### Verificar instalación
```bash
node --version
npm --version
```

## 🛠️ Instalación del Proyecto

1. **Navegar al directorio del proyecto**
```bash
cd d:\Antigravity\Integra\integra-web
```

2. **Instalar dependencias**
```bash
npm install
```

Esto instalará:
- React 18
- TypeScript 5
- Vite (build tool)
- Plotly.js (visualización)
- Y todas las dependencias necesarias

## 🎮 Uso

### Modo Desarrollo

Iniciar el servidor de desarrollo:
```bash
npm run dev
```

La aplicación se abrirá automáticamente en `http://localhost:3000`

### Compilar para Producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`

### Vista Previa de Producción

```bash
npm run preview
```

## 📖 Guía de Uso

### 1. Seleccionar un Sistema de Ejemplo

En el panel izquierdo, haz clic en uno de los sistemas de ejemplo:
- **Atractor de Lorenz**: Sistema caótico clásico
- **Oscilador de Van der Pol**: Ciclo límite
- **Lotka-Volterra**: Predador-presa
- Y más...

### 2. Ajustar Parámetros

Una vez cargado el sistema, puedes modificar:
- **Parámetros del sistema** (σ, ρ, β, etc.)
- **Condiciones iniciales** (x₀, y₀, z₀)
- **Configuración del solver** (método, paso de tiempo, tiempo final)

### 3. Ejecutar Simulación

Haz clic en el botón **"Ejecutar"** para iniciar la integración numérica.

### 4. Visualizar Resultados

- **Espacio de Fases** (arriba): Trayectoria en el espacio de estados
- **Series Temporales** (abajo): Evolución de cada variable en el tiempo

## 🧮 Métodos Numéricos Disponibles

- **Euler**: Método de primer orden (simple, menos preciso)
- **Runge-Kutta 4**: Método clásico de cuarto orden (recomendado)
- **RKF45**: Runge-Kutta-Fehlberg adaptativo (próximamente)

## 🎨 Estructura del Proyecto

```
integra-web/
├── src/
│   ├── components/      # Componentes React
│   │   ├── EquationEditor.tsx
│   │   ├── ControlPanel.tsx
│   │   ├── PhaseSpacePlot.tsx
│   │   ├── TimeSeriesPlot.tsx
│   │   └── SystemLibrary.tsx
│   ├── solvers/         # Métodos numéricos
│   │   ├── euler.ts
│   │   ├── rk4.ts
│   │   └── index.ts
│   ├── utils/           # Utilidades
│   │   └── equationParser.ts
│   ├── types/           # Tipos TypeScript
│   │   └── equations.ts
│   ├── data/            # Datos
│   │   └── exampleSystems.ts
│   ├── App.tsx          # Componente principal
│   ├── main.tsx         # Punto de entrada
│   └── index.css        # Estilos globales
├── public/              # Archivos estáticos
├── index.html           # HTML principal
├── package.json         # Dependencias
├── tsconfig.json        # Configuración TypeScript
└── vite.config.ts       # Configuración Vite
```

## 🔧 Desarrollo

### Agregar un Nuevo Sistema de Ejemplo

Edita `src/data/exampleSystems.ts`:

```typescript
{
  id: 'mi-sistema',
  name: 'Mi Sistema',
  description: 'Descripción del sistema',
  category: 'other',
  variables: ['x', 'y'],
  parameters: { a: 1.0, b: 2.0 },
  equations: [
    'dx/dt = a*x - b*x*y',
    'dy/dt = -y + x*y'
  ],
  suggestedInitialConditions: [1, 1],
  suggestedConfig: {
    method: NumericalMethod.RK4,
    dt: 0.01,
    tEnd: 20
  }
}
```

### Agregar un Nuevo Método Numérico

1. Crear archivo en `src/solvers/mi-metodo.ts`
2. Implementar la función con la firma correcta
3. Exportar desde `src/solvers/index.ts`
4. Agregar a `SOLVER_INFO`

## 🐛 Solución de Problemas

### La simulación diverge (valores infinitos)

- Reduce el paso de tiempo (`dt`)
- Usa un método de mayor orden (RK4 en lugar de Euler)
- Verifica las condiciones iniciales

### La aplicación no se inicia

```bash
# Limpiar caché y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Errores de TypeScript

```bash
# Verificar tipos
npm run build
```

## 📚 Próximas Características (Fases 2-4)

- [ ] Compilación de biblioteca C++ a WebAssembly
- [ ] Visualización 3D mejorada con Three.js
- [ ] Campos vectoriales
- [ ] Diagramas de bifurcación
- [ ] Secciones de Poincaré
- [ ] Exportación de datos (CSV, PNG)
- [ ] Editor de ecuaciones personalizado
- [ ] Más métodos numéricos

## 📄 Licencia

Proyecto académico - INTEGRA

## 👥 Créditos

Migración a web del sistema INTEGRA C++ original.
https://www.dynamics.unam.mx/DinamicaNoLineal4/php/tecnologia/integra.php


Autores Originales (INTEGRA C++)

Humberto Carrillo Calvet
Antonio Carrillo Ledesma
† Luis Alonso Nava Fernandez
                     

Esta versión web ha sido desarrollada por:
José Luis Jiménez Andrade
Claude (Anthropic AI), Antigravity (Google Inc).
