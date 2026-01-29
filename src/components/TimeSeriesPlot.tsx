import { useMemo, memo } from 'react';
import Plot from 'react-plotly.js';
import type { SimulationResult, DifferentialEquation } from '../types/equations';

interface TimeSeriesPlotProps {
    result: SimulationResult | null;
    equation: DifferentialEquation | null;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

function TimeSeriesPlot({ result, equation }: TimeSeriesPlotProps) {
    const plotData = useMemo(() => {
        if (!result || !result.success || !equation) {
            return [];
        }

        const traces = equation.variables.map((variable, index) => ({
            type: 'scatter' as const,
            mode: 'lines' as const,
            x: result.t,
            y: result.y.map(state => state[index]),
            name: variable,
            line: {
                color: COLORS[index % COLORS.length],
                width: 2
            }
        }));

        return traces;
    }, [result, equation]);

    const layout = useMemo(() => ({
        autosize: true,
        paper_bgcolor: '#1a1f2e',
        plot_bgcolor: '#0f1419',
        font: {
            color: '#e5e7eb',
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
        },
        margin: { l: 60, r: 50, t: 30, b: 50 },
        xaxis: {
            title: 'Tiempo (t)',
            gridcolor: '#374151',
            zerolinecolor: '#4b5563',
            color: '#e5e7eb'
        },
        yaxis: {
            title: 'Valor',
            gridcolor: '#374151',
            zerolinecolor: '#4b5563',
            color: '#e5e7eb'
        },
        legend: {
            x: 1,
            xanchor: 'right' as const,
            y: 1,
            bgcolor: 'rgba(26, 31, 46, 0.8)',
            bordercolor: '#374151',
            borderwidth: 1,
            font: { color: '#e5e7eb' }
        },
        hovermode: 'x unified' as const
    }), []);

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
            style={{ width: '100%', height: '100%' }}
            useResizeHandler={true}
        />
    );
}

// Wrap with React.memo to prevent unnecessary re-renders
export default memo(TimeSeriesPlot);
