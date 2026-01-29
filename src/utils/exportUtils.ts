/**
 * Utilidades de exportación para INTEGRA Web
 * Permite exportar gráficas como imágenes y datos como CSV/JSON
 */

import type { SimulationResult, DifferentialEquation, SolverConfig } from '../types/equations';

/**
 * Exporta una gráfica de Plotly como imagen PNG
 */
export async function exportPlotAsPNG(plotDiv: HTMLElement, filename: string = 'plot'): Promise<void> {
    // @ts-ignore - Plotly global
    const Plotly = window.Plotly;
    if (!Plotly) {
        throw new Error('Plotly no está disponible');
    }

    await Plotly.downloadImage(plotDiv, {
        format: 'png',
        width: 1920,
        height: 1080,
        filename: filename
    });
}

/**
 * Exporta una gráfica de Plotly como imagen SVG
 */
export async function exportPlotAsSVG(plotDiv: HTMLElement, filename: string = 'plot'): Promise<void> {
    // @ts-ignore - Plotly global
    const Plotly = window.Plotly;
    if (!Plotly) {
        throw new Error('Plotly no está disponible');
    }

    await Plotly.downloadImage(plotDiv, {
        format: 'svg',
        width: 1920,
        height: 1080,
        filename: filename
    });
}

/**
 * Exporta los resultados de simulación como CSV
 */
export function exportResultsAsCSV(
    result: SimulationResult,
    variables: string[],
    filename: string = 'simulation_data'
): void {
    // Crear encabezados
    const headers = ['t', ...variables];

    // Crear filas de datos
    const rows: string[] = [headers.join(',')];

    for (let i = 0; i < result.t.length; i++) {
        const row = [result.t[i].toFixed(8), ...result.y[i].map(v => v.toFixed(8))];
        rows.push(row.join(','));
    }

    // Crear blob y descargar
    const csvContent = rows.join('\n');
    downloadFile(csvContent, `${filename}.csv`, 'text/csv');
}

/**
 * Exporta la configuración completa del sistema como JSON
 */
export function exportSystemAsJSON(
    equation: DifferentialEquation,
    initialConditions: number[],
    config: SolverConfig,
    result?: SimulationResult,
    filename: string = 'system_config'
): void {
    const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        system: {
            id: equation.id,
            name: equation.name,
            description: equation.description,
            variables: equation.variables,
            parameters: equation.parameters,
            equations: equation.equations
        },
        initialConditions,
        solverConfig: {
            method: config.method,
            dt: config.dt,
            tEnd: config.tEnd,
            tolerance: config.tolerance,
            minStep: config.minStep,
            maxStep: config.maxStep
        },
        ...(result && {
            simulationResult: {
                success: result.success,
                message: result.message,
                steps: result.steps,
                dataPoints: result.t.length
            }
        })
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    downloadFile(jsonContent, `${filename}.json`, 'application/json');
}

/**
 * Exporta los datos de simulación completos como JSON
 */
export function exportDataAsJSON(
    result: SimulationResult,
    variables: string[],
    filename: string = 'simulation_data'
): void {
    const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        variables: ['t', ...variables],
        dataPoints: result.t.length,
        data: {
            t: result.t,
            ...variables.reduce((acc, varName, idx) => {
                acc[varName] = result.y.map(y => y[idx]);
                return acc;
            }, {} as Record<string, number[]>)
        }
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    downloadFile(jsonContent, `${filename}.json`, 'application/json');
}

/**
 * Función auxiliar para descargar archivos
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

/**
 * Tipos de exportación disponibles
 */
export const EXPORT_FORMATS = {
    IMAGE: [
        { id: 'png', name: 'PNG', description: 'Imagen de alta resolución', extension: '.png' },
        { id: 'svg', name: 'SVG', description: 'Gráfico vectorial escalable', extension: '.svg' }
    ],
    DATA: [
        { id: 'csv', name: 'CSV', description: 'Datos separados por comas', extension: '.csv' },
        { id: 'json', name: 'JSON', description: 'Formato estructurado', extension: '.json' }
    ],
    CONFIG: [
        { id: 'json-config', name: 'Sistema (JSON)', description: 'Configuración completa', extension: '.json' }
    ]
} as const;
