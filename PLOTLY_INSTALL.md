# Script para instalar Plotly.js correctamente

## Problema
La página aparece en blanco porque `react-plotly.js` requiere dependencias adicionales que no se instalaron automáticamente.

## Solución

### Paso 1: Instalar Plotly.js base
```bash
npm install plotly.js-dist-min
```

### Paso 2: Instalar react-plotly.js
```bash
npm install react-plotly.js
```

### Paso 3: Instalar tipos de TypeScript
```bash
npm install --save-dev @types/plotly.js @types/react-plotly.js
```

## Verificación

Después de instalar, ejecuta:
```bash
npm list plotly.js react-plotly.js
```

Deberías ver algo como:
```
integra-web@1.0.0
├── plotly.js-dist-min@2.x.x
└── react-plotly.js@2.x.x
```

## Alternativa: Usar CDN (más simple)

Si la instalación de npm falla, podemos usar Plotly desde CDN agregando esto al `index.html`:

```html
<script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
```

## Estado Actual

Por ahora, he creado versiones temporales de los componentes de visualización que:
- ✅ Muestran información de la simulación
- ✅ Muestran estadísticas de las variables
- ✅ Funcionan sin dependencias externas
- ✅ Permiten probar que todo el resto del sistema funciona

Una vez que Plotly esté correctamente instalado, restauraremos los componentes con gráficos interactivos.

## Próximos pasos

1. Verifica que la aplicación ahora carga correctamente
2. Prueba ejecutar una simulación (ej: Lorenz)
3. Verifica que se muestran las estadísticas
4. Luego instalaremos Plotly para los gráficos completos
