import { useMemo, memo } from 'react';
import Plot from 'react-plotly.js';
import type { SimulationResult, DifferentialEquation } from '../types/equations';

interface TimeSeriesPlotProps {
    result: SimulationResult | null;
    equation: DifferentialEquation | null;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

function TimeSeriesPlot({ result, equation }: TimeSeriesPlotProps) {
    const { plotData, layout } = useMemo(() => {
        if (!result || !result.success || !equation) {
            return { plotData: [], layout: {} };
        }

        const numVars = equation.variables.length;

        // Create traces, assigning each to a different y-axis
        const traces = equation.variables.map((variable, index) => ({
            type: 'scatter' as const,
            mode: 'lines' as const,
            x: result.t,
            y: result.y.map(state => state[index]),
            name: variable,
            xaxis: 'x',
            yaxis: index === 0 ? 'y' : `y${index + 1}`,
            line: {
                color: COLORS[index % COLORS.length],
                width: 2
            },
            showlegend: true
        }));

        // Dynamic layout configuration
        const baseLayout = {
            autosize: true,
            paper_bgcolor: '#1a1f2e',
            plot_bgcolor: '#0f1419',
            font: {
                color: '#e5e7eb',
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
            },
            margin: { l: 60, r: 20, t: 30, b: 50 },
            grid: {
                rows: numVars,
                columns: 1,
                pattern: 'coupled' as any,
                roworder: 'top to bottom' as any // Cast to any to avoid strict union type mismatch
            },
            height: Math.max(400, numVars * 200), // Adjust height based on number of plots
            xaxis: {
                title: 'Tiempo (t)',
                gridcolor: '#374151',
                zerolinecolor: '#4b5563',
                color: '#e5e7eb',
                anchor: `y${numVars}` as any // Cast to any to avoid AxisName type mismatch
            },
            legend: {
                orientation: 'h' as const,
                y: 1.05, // Position above the top plot
                x: 0.5,
                xanchor: 'center' as const,
                bgcolor: 'rgba(26, 31, 46, 0.8)',
                bordercolor: '#374151',
                borderwidth: 1,
                font: { color: '#e5e7eb' }
            },
            hovermode: 'x unified' as const
        };

        // Configure each y-axis
        const yAxes: Record<string, any> = {};
        equation.variables.forEach((variable, index) => {
            const axisName = index === 0 ? 'yaxis' : `yaxis${index + 1}`;
            yAxes[axisName] = {
                title: variable,
                gridcolor: '#374151',
                zerolinecolor: '#4b5563',
                color: '#e5e7eb',
                // Add some padding to domain if needed, but grid handles main layout
            };
        });

        return {
            plotData: traces,
            layout: { ...baseLayout, ...yAxes }
        };
    }, [result, equation]);

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
                Ejecuta una simulación para ver las series temporales
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

    return (
        <Plot
            data={plotData}
            layout={layout}
            config={config}
            style={{ width: '100%', height: '100%', minHeight: '400px' }}
            useResizeHandler={true}
        />
    );
}

// Wrap with React.memo to prevent unnecessary re-renders
export default memo(TimeSeriesPlot);
