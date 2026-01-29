import { useMemo, useState, memo } from 'react';
import Plot from 'react-plotly.js';
import type { SimulationResult, DifferentialEquation } from '../types/equations';
import { calculateNullclines } from '../utils/nullclineUtils';

interface PhaseSpacePlotProps {
    result: SimulationResult | null;
    equation: DifferentialEquation | null;
    onSelectInitialCondition?: (values: number[]) => void;
}

function PhaseSpacePlot({ result, equation }: PhaseSpacePlotProps) {
    const [showNullclines, setShowNullclines] = useState(true);

    // Calcular rango basado en los datos de la trayectoria
    const dataRange = useMemo(() => {
        if (!result || !result.y.length) {
            return { xRange: [-10, 10] as [number, number], yRange: [-10, 10] as [number, number] };
        }
        const xVals = result.y.map(s => s[0]);
        const yVals = result.y.map(s => s[1]);
        const xMin = Math.min(...xVals);
        const xMax = Math.max(...xVals);
        const yMin = Math.min(...yVals);
        const yMax = Math.max(...yVals);
        const xPad = (xMax - xMin) * 0.2 || 1;
        const yPad = (yMax - yMin) * 0.2 || 1;
        return {
            xRange: [xMin - xPad, xMax + xPad] as [number, number],
            yRange: [yMin - yPad, yMax + yPad] as [number, number]
        };
    }, [result]);

    // Calcular ceroclinas para sistemas 2D
    const nullclineData = useMemo(() => {
        if (!equation || equation.variables.length !== 2 || !showNullclines) {
            return { xNullcline: [], yNullcline: [] };
        }
        return calculateNullclines(equation, dataRange.xRange, dataRange.yRange, 120);
    }, [equation, dataRange, showNullclines]);

    const plotData = useMemo(() => {
        if (!result || !result.success || !equation) {
            return [];
        }

        const numVars = equation.variables.length;
        const traces: any[] = [];

        if (numVars >= 3) {
            // Gráfico 3D
            const x = result.y.map(state => state[0]);
            const y = result.y.map(state => state[1]);
            const z = result.y.map(state => state[2]);

            traces.push({
                type: 'scatter3d' as const,
                mode: 'lines' as const,
                x,
                y,
                z,
                line: {
                    color: result.t,
                    colorscale: 'Viridis',
                    width: 3
                },
                name: 'Trayectoria'
            });
        } else if (numVars >= 2) {
            // Ceroclinas (para 2D)
            if (showNullclines && nullclineData.xNullcline.length > 0) {
                traces.push({
                    type: 'scatter' as const,
                    mode: 'markers' as const,
                    x: nullclineData.xNullcline.map(p => p.x),
                    y: nullclineData.xNullcline.map(p => p.y),
                    marker: {
                        color: '#ef4444',
                        size: 2,
                        opacity: 0.8
                    },
                    name: `d${equation.variables[0]}/dt = 0`,
                    hoverinfo: 'skip'
                });
            }

            if (showNullclines && nullclineData.yNullcline.length > 0) {
                traces.push({
                    type: 'scatter' as const,
                    mode: 'markers' as const,
                    x: nullclineData.yNullcline.map(p => p.x),
                    y: nullclineData.yNullcline.map(p => p.y),
                    marker: {
                        color: '#22c55e',
                        size: 2,
                        opacity: 0.8
                    },
                    name: `d${equation.variables[1]}/dt = 0`,
                    hoverinfo: 'skip'
                });
            }


            // Trayectoria
            const x = result.y.map(state => state[0]);
            const y = result.y.map(state => state[1]);

            traces.push({
                type: 'scatter' as const,
                mode: 'lines' as const,
                x,
                y,
                line: {
                    color: '#3b82f6',
                    width: 2
                },
                name: 'Trayectoria'
            });

            // Punto inicial
            traces.push({
                type: 'scatter' as const,
                mode: 'markers' as const,
                x: [result.y[0][0]],
                y: [result.y[0][1]],
                marker: {
                    color: '#3b82f6',
                    size: 10,
                    symbol: 'circle'
                },
                name: 'Inicio',
                showlegend: false
            });
        }

        return traces;
    }, [result, equation, showNullclines, nullclineData]);

    const layout = useMemo(() => {
        const numVars = equation?.variables.length || 0;

        const baseLayout: any = {
            autosize: true,
            paper_bgcolor: '#1a1f2e',
            plot_bgcolor: '#0f1419',
            font: {
                color: '#e5e7eb',
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
            },
            margin: { l: 50, r: 50, t: 30, b: 50 },
            hovermode: 'closest',
            legend: {
                x: 1,
                y: 1,
                xanchor: 'right',
                bgcolor: 'rgba(0,0,0,0.5)',
                font: { size: 10 }
            }
        };

        if (numVars >= 3) {
            return {
                ...baseLayout,
                scene: {
                    xaxis: {
                        title: equation?.variables[0] || 'x',
                        gridcolor: '#374151',
                        color: '#e5e7eb'
                    },
                    yaxis: {
                        title: equation?.variables[1] || 'y',
                        gridcolor: '#374151',
                        color: '#e5e7eb'
                    },
                    zaxis: {
                        title: equation?.variables[2] || 'z',
                        gridcolor: '#374151',
                        color: '#e5e7eb'
                    },
                    bgcolor: '#0f1419'
                }
            };
        } else {
            return {
                ...baseLayout,
                xaxis: {
                    title: equation?.variables[0] || 'x',
                    gridcolor: '#374151',
                    zerolinecolor: '#4b5563',
                    color: '#e5e7eb'
                },
                yaxis: {
                    title: equation?.variables[1] || 'y',
                    gridcolor: '#374151',
                    zerolinecolor: '#4b5563',
                    color: '#e5e7eb'
                }
            };
        }
    }, [equation]);

    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['lasso2d', 'select2d'] as any[]
    };

    if (!result || !equation) {
        return (
            <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.875rem'
            }}>
                Ejecuta una simulación para ver el espacio de fases
            </div>
        );
    }

    if (!result.success) {
        return (
            <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--error)',
                fontSize: '0.875rem',
                textAlign: 'center',
                padding: 'var(--spacing-lg)'
            }}>
                Error en la simulación: {result.message}
            </div>
        );
    }

    const is2D = equation.variables.length === 2;

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {is2D && (
                <div style={{
                    padding: '4px 8px',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    borderBottom: '1px solid var(--border)'
                }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={showNullclines}
                            onChange={(e) => setShowNullclines(e.target.checked)}
                        />
                        Ceroclinas
                    </label>
                </div>
            )}
            <div style={{ flex: 1 }}>
                <Plot
                    data={plotData}
                    layout={layout}
                    config={config}
                    style={{ width: '100%', height: '100%' }}
                    useResizeHandler={true}
                />
            </div>
        </div>
    );
}

// Wrap with React.memo to prevent unnecessary re-renders
export default memo(PhaseSpacePlot);
