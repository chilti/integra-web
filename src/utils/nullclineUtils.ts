/**
 * Utilidades para calcular ceroclinas (nullclines)
 * Las ceroclinas son las curvas donde dx/dt = 0 y dy/dt = 0
 * 
 * Usa el algoritmo Marching Squares para encontrar contornos precisos
 */

import type { DifferentialEquation } from '../types/equations';

interface NullclinePoint {
    x: number;
    y: number;
}

interface NullclineResult {
    xNullcline: NullclinePoint[];  // Puntos donde dx/dt = 0
    yNullcline: NullclinePoint[];  // Puntos donde dy/dt = 0
}

/**
 * Interpola linealmente para encontrar el cruce por cero
 */
function interpolateZero(x1: number, f1: number, x2: number, f2: number): number {
    if (f1 === f2) return (x1 + x2) / 2;
    // Interpolación lineal: encontrar x donde f(x) = 0
    return x1 - f1 * (x2 - x1) / (f2 - f1);
}

/**
 * Calcula las ceroclinas de un sistema 2D usando Marching Squares
 * Este algoritmo encuentra contornos precisos interpolando cruces por cero
 */
export function calculateNullclines(
    equation: DifferentialEquation,
    xRange: [number, number],
    yRange: [number, number],
    resolution: number = 100
): NullclineResult {
    const xNullcline: NullclinePoint[] = [];
    const yNullcline: NullclinePoint[] = [];

    if (equation.derivatives.length < 2) {
        return { xNullcline, yNullcline };
    }

    const xStep = (xRange[1] - xRange[0]) / resolution;
    const yStep = (yRange[1] - yRange[0]) / resolution;
    const params = equation.parameters;
    const t = 0;

    // Pre-calcular grilla de valores
    const dxGrid: number[][] = [];
    const dyGrid: number[][] = [];

    for (let i = 0; i <= resolution; i++) {
        dxGrid[i] = [];
        dyGrid[i] = [];
        for (let j = 0; j <= resolution; j++) {
            const x = xRange[0] + i * xStep;
            const y = yRange[0] + j * yStep;
            const state = [x, y];

            try {
                dxGrid[i][j] = equation.derivatives[0](t, state, params);
                dyGrid[i][j] = equation.derivatives[1](t, state, params);
            } catch {
                dxGrid[i][j] = NaN;
                dyGrid[i][j] = NaN;
            }
        }
    }

    // Marching Squares: buscar cruces por cero en cada celda
    for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
            const x = xRange[0] + i * xStep;
            const y = yRange[0] + j * yStep;

            // Valores en las 4 esquinas de la celda
            const dx00 = dxGrid[i][j];
            const dx10 = dxGrid[i + 1][j];
            const dx01 = dxGrid[i][j + 1];
            const dx11 = dxGrid[i + 1][j + 1];

            const dy00 = dyGrid[i][j];
            const dy10 = dyGrid[i + 1][j];
            const dy01 = dyGrid[i][j + 1];
            const dy11 = dyGrid[i + 1][j + 1];

            // Ceroclina dx/dt = 0: buscar cruces en bordes de celda
            if (isFinite(dx00) && isFinite(dx10) && isFinite(dx01) && isFinite(dx11)) {
                // Borde inferior (j constante)
                if (dx00 * dx10 < 0) {
                    const xCross = interpolateZero(x, dx00, x + xStep, dx10);
                    xNullcline.push({ x: xCross, y: y });
                }
                // Borde izquierdo (i constante)
                if (dx00 * dx01 < 0) {
                    const yCross = interpolateZero(y, dx00, y + yStep, dx01);
                    xNullcline.push({ x: x, y: yCross });
                }
                // Borde superior (solo en última fila)
                if (j === resolution - 1 && dx01 * dx11 < 0) {
                    const xCross = interpolateZero(x, dx01, x + xStep, dx11);
                    xNullcline.push({ x: xCross, y: y + yStep });
                }
                // Borde derecho (solo en última columna)
                if (i === resolution - 1 && dx10 * dx11 < 0) {
                    const yCross = interpolateZero(y, dx10, y + yStep, dx11);
                    xNullcline.push({ x: x + xStep, y: yCross });
                }
            }

            // Ceroclina dy/dt = 0: buscar cruces en bordes de celda
            if (isFinite(dy00) && isFinite(dy10) && isFinite(dy01) && isFinite(dy11)) {
                // Borde inferior
                if (dy00 * dy10 < 0) {
                    const xCross = interpolateZero(x, dy00, x + xStep, dy10);
                    yNullcline.push({ x: xCross, y: y });
                }
                // Borde izquierdo
                if (dy00 * dy01 < 0) {
                    const yCross = interpolateZero(y, dy00, y + yStep, dy01);
                    yNullcline.push({ x: x, y: yCross });
                }
                // Borde superior (solo en última fila)
                if (j === resolution - 1 && dy01 * dy11 < 0) {
                    const xCross = interpolateZero(x, dy01, x + xStep, dy11);
                    yNullcline.push({ x: xCross, y: y + yStep });
                }
                // Borde derecho (solo en última columna)
                if (i === resolution - 1 && dy10 * dy11 < 0) {
                    const yCross = interpolateZero(y, dy10, y + yStep, dy11);
                    yNullcline.push({ x: x + xStep, y: yCross });
                }
            }
        }
    }

    return { xNullcline, yNullcline };
}
