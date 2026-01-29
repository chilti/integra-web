import { useMemo, useState, memo } from 'react';
import Plot from 'react-plotly.js';
import type { DifferentialEquation } from '../types/equations';
import styles from './VectorFieldPlot.module.css';
import { calculateNullclines } from '../utils/nullclineUtils';

interface VectorFieldPlotProps {
    equation: DifferentialEquation | null;
    initialXRange?: [number, number];
    initialYRange?: [number, number];
    initialZRange?: [number, number];
}

function VectorFieldPlot({
    equation,
    initialXRange = [-10, 10],
    initialYRange = [-10, 10],
    initialZRange = [-10, 10]
}: VectorFieldPlotProps) {
    // Controles internos para densidad y tamaño
    const [gridSize, setGridSize] = useState(30);
    const [vectorScale, setVectorScale] = useState(0.5);

    // Control de rango unificado (aplica a todos los ejes)
    const [rangeMin, setRangeMin] = useState(initialXRange[0]);
    const [rangeMax, setRangeMax] = useState(initialXRange[1]);

    // Rangos derivados del control unificado
    const xRange: [number, number] = [rangeMin, rangeMax];
    const yRange: [number, number] = [rangeMin, rangeMax];
    const zRange: [number, number] = [rangeMin, rangeMax];

    // Toggle para ceroclinas
    const [showNullclines, setShowNullclines] = useState(true);

    // Calcular ceroclinas para sistemas 2D
    const nullclineData = useMemo(() => {
        if (!equation || equation.variables.length !== 2 || !showNullclines) {
            return { xNullcline: [], yNullcline: [] };
        }
        return calculateNullclines(equation, xRange, yRange, 120);
    }, [equation, xRange, yRange, showNullclines]);

    const vectorData = useMemo(() => {
        if (!equation || equation.derivatives.length < 2) {
            return [];
        }

        const numVars = equation.variables.length;
        const params = equation.parameters;
        const is3D = numVars >= 3;

        // Generar grid de puntos
        const xStep = (xRange[1] - xRange[0]) / (gridSize - 1);
        const yStep = (yRange[1] - yRange[0]) / (gridSize - 1);
        const zStep = (zRange[1] - zRange[0]) / (gridSize - 1);

        const xPos: number[] = [];
        const yPos: number[] = [];
        const zPos: number[] = [];
        const uVec: number[] = [];  // Componente x del vector
        const vVec: number[] = [];  // Componente y del vector
        const wVec: number[] = [];  // Componente z del vector (3D)
        const magnitudes: number[] = [];

        if (is3D) {
            // Grid 3D
            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    for (let k = 0; k < gridSize; k++) {
                        const x = xRange[0] + i * xStep;
                        const y = yRange[0] + j * yStep;
                        const z = zRange[0] + k * zStep;
                        const state = [x, y, z];
                        const t = 0;

                        try {
                            const dx = equation.derivatives[0](t, state, params);
                            const dy = equation.derivatives[1](t, state, params);
                            const dz = equation.derivatives[2](t, state, params);

                            const mag = Math.sqrt(dx * dx + dy * dy + dz * dz);

                            if (isFinite(mag) && mag > 0) {
                                xPos.push(x);
                                yPos.push(y);
                                zPos.push(z);
                                // Normalizar vectores para visualización uniforme
                                uVec.push(dx / mag);
                                vVec.push(dy / mag);
                                wVec.push(dz / mag);
                                magnitudes.push(Math.log1p(mag));  // Log scale para magnitudes
                            }
                        } catch {
                            // Ignorar puntos donde la derivada no está definida
                        }
                    }
                }
            }

            return [{
                type: 'cone' as const,
                x: xPos,
                y: yPos,
                z: zPos,
                u: uVec,
                v: vVec,
                w: wVec,
                colorscale: 'Portland',
                intensity: magnitudes,
                sizemode: 'scaled' as const,
                sizeref: 0.5 / vectorScale,  // Mayor sizeref = conos más pequeños
                anchor: 'tail' as const,
                showscale: true,
                colorbar: {
                    title: { text: 'Magnitud', font: { color: '#e5e7eb' } },
                    tickfont: { color: '#e5e7eb' }
                },
                name: 'Campo vectorial'
            }] as any[];

        } else {
            // Grid 2D - usar quiver plot simulado con scatter
            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    const x = xRange[0] + i * xStep;
                    const y = yRange[0] + j * yStep;
                    const state = [x, y];
                    const t = 0;

                    try {
                        const dx = equation.derivatives[0](t, state, params);
                        const dy = equation.derivatives[1](t, state, params);

                        const mag = Math.sqrt(dx * dx + dy * dy);

                        if (isFinite(mag) && mag > 0) {
                            xPos.push(x);
                            yPos.push(y);
                            // Normalizar para visualización
                            const scale = Math.min(xStep, yStep) * 0.4;
                            uVec.push(dx / mag * scale);
                            vVec.push(dy / mag * scale);
                            magnitudes.push(Math.log1p(mag));
                        }
                    } catch {
                        // Ignorar puntos donde la derivada no está definida
                    }
                }
            }

            // Crear líneas para simular flechas 2D
            const arrowTraces = [];

            // Líneas principales
            for (let i = 0; i < xPos.length; i++) {
                arrowTraces.push({
                    type: 'scatter' as const,
                    mode: 'lines' as const,
                    x: [xPos[i], xPos[i] + uVec[i]],
                    y: [yPos[i], yPos[i] + vVec[i]],
                    line: {
                        color: `hsl(${200 + magnitudes[i] * 30}, 70%, 50%)`,
                        width: 2
                    },
                    showlegend: false,
                    hoverinfo: 'skip' as const
                });

                // Punta de flecha
                const angle = Math.atan2(vVec[i], uVec[i]);
                const arrowSize = Math.min(xStep, yStep) * 0.15;
                const tipX = xPos[i] + uVec[i];
                const tipY = yPos[i] + vVec[i];

                arrowTraces.push({
                    type: 'scatter' as const,
                    mode: 'lines' as const,
                    x: [
                        tipX - arrowSize * Math.cos(angle - Math.PI / 6),
                        tipX,
                        tipX - arrowSize * Math.cos(angle + Math.PI / 6)
                    ],
                    y: [
                        tipY - arrowSize * Math.sin(angle - Math.PI / 6),
                        tipY,
                        tipY - arrowSize * Math.sin(angle + Math.PI / 6)
                    ],
                    line: {
                        color: `hsl(${200 + magnitudes[i] * 30}, 70%, 50%)`,
                        width: 2
                    },
                    showlegend: false,
                    hoverinfo: 'skip' as const
                });
            }

            // Agregar ceroclinas al final de las traces
            if (showNullclines && nullclineData.xNullcline.length > 0) {
                arrowTraces.push({
                    type: 'scatter' as const,
                    mode: 'markers' as const,
                    x: nullclineData.xNullcline.map(p => p.x),
                    y: nullclineData.xNullcline.map(p => p.y),
                    marker: {
                        color: '#ef4444',
                        size: 2,
                        opacity: 0.9
                    },
                    name: `d${equation.variables[0]}/dt = 0`,
                    showlegend: true,
                    hoverinfo: 'skip' as const
                });
            }

            if (showNullclines && nullclineData.yNullcline.length > 0) {
                arrowTraces.push({
                    type: 'scatter' as const,
                    mode: 'markers' as const,
                    x: nullclineData.yNullcline.map(p => p.x),
                    y: nullclineData.yNullcline.map(p => p.y),
                    marker: {
                        color: '#22c55e',
                        size: 2,
                        opacity: 0.9
                    },
                    name: `d${equation.variables[1]}/dt = 0`,
                    showlegend: true,
                    hoverinfo: 'skip' as const
                });
            }


            return arrowTraces;
        }
    }, [equation, gridSize, vectorScale, xRange, yRange, zRange, showNullclines, nullclineData]);

    const layout = useMemo(() => {
        const numVars = equation?.variables.length || 0;
        const is3D = numVars >= 3;

        const baseLayout: any = {
            autosize: true,
            paper_bgcolor: '#1a1f2e',
            plot_bgcolor: '#0f1419',
            font: {
                color: '#e5e7eb',
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
            },
            margin: { l: 50, r: 50, t: 30, b: 50 },
            showlegend: false
        };

        if (is3D) {
            return {
                ...baseLayout,
                scene: {
                    xaxis: {
                        title: equation?.variables[0] || 'x',
                        gridcolor: '#374151',
                        color: '#e5e7eb',
                        range: xRange
                    },
                    yaxis: {
                        title: equation?.variables[1] || 'y',
                        gridcolor: '#374151',
                        color: '#e5e7eb',
                        range: yRange
                    },
                    zaxis: {
                        title: equation?.variables[2] || 'z',
                        gridcolor: '#374151',
                        color: '#e5e7eb',
                        range: zRange
                    },
                    bgcolor: '#0f1419',
                    aspectmode: 'cube'
                }
            };
        } else {
            return {
                ...baseLayout,
                xaxis: {
                    title: equation?.variables[0] || 'x',
                    gridcolor: '#374151',
                    zerolinecolor: '#4b5563',
                    color: '#e5e7eb',
                    range: xRange
                },
                yaxis: {
                    title: equation?.variables[1] || 'y',
                    gridcolor: '#374151',
                    zerolinecolor: '#4b5563',
                    color: '#e5e7eb',
                    range: yRange,
                    scaleanchor: 'x'
                }
            };
        }
    }, [equation, xRange, yRange, zRange]);

    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false
    };

    if (!equation) {
        return (
            <div className={styles.placeholder}>
                Selecciona un sistema para ver el campo vectorial
            </div>
        );
    }

    if (equation.derivatives.length < 2) {
        return (
            <div className={styles.placeholder}>
                El campo vectorial requiere al menos 2 variables
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>🧭 Campo Vectorial</h3>
                <div className={styles.controls}>
                    <label className={styles.controlLabel}>
                        Densidad:
                        <select
                            value={gridSize}
                            onChange={(e) => setGridSize(parseInt(e.target.value))}
                            className={styles.controlSelect}
                        >
                            <option value={10}>Muy baja (10)</option>
                            <option value={20}>Baja (20)</option>
                            <option value={30}>Media (30)</option>
                            <option value={40}>Alta (40)</option>
                            <option value={50}>Muy alta (50)</option>
                        </select>
                    </label>
                    <label className={styles.controlLabel}>
                        Tamaño:
                        <input
                            type="range"
                            min="0.3"
                            max="2"
                            step="0.1"
                            value={vectorScale}
                            onChange={(e) => setVectorScale(parseFloat(e.target.value))}
                            className={styles.controlSlider}
                        />
                    </label>
                </div>
                <div className={styles.rangeControls}>
                    <span className={styles.rangeLabel}>Rango:</span>
                    <label className={styles.rangeInput}>
                        <input
                            type="number"
                            value={rangeMin}
                            onChange={(e) => setRangeMin(parseFloat(e.target.value))}
                            className={styles.rangeNumber}
                        />
                        a
                        <input
                            type="number"
                            value={rangeMax}
                            onChange={(e) => setRangeMax(parseFloat(e.target.value))}
                            className={styles.rangeNumber}
                        />
                    </label>
                    {equation.variables.length === 2 && (
                        <label className={styles.rangeInput} style={{ marginLeft: 'auto' }}>
                            <input
                                type="checkbox"
                                checked={showNullclines}
                                onChange={(e) => setShowNullclines(e.target.checked)}
                            />
                            Ceroclinas
                        </label>
                    )}
                </div>
            </div>
            <div className={styles.plotContainer}>
                <Plot
                    key={`vf-${gridSize}-${vectorScale}-${xRange.join(',')}-${yRange.join(',')}-${zRange.join(',')}-${showNullclines}`}
                    data={vectorData}
                    layout={{ ...layout, datarevision: `${gridSize}-${vectorScale}-${xRange.join(',')}-${yRange.join(',')}-${showNullclines}` }}
                    config={config}
                    style={{ width: '100%', height: '100%' }}
                    useResizeHandler={true}
                />
            </div>
        </div>
    );
}

// Wrap with React.memo to prevent unnecessary re-renders
export default memo(VectorFieldPlot);
