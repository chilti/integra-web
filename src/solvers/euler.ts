/**
 * Método de Euler (orden 1)
 * Método más simple para integración numérica
 */

import type { DerivativeFunction, SimulationResult, SolverConfig } from '../types/equations';

export function euler(
    y0: number[],
    t0: number,
    derivatives: DerivativeFunction[],
    params: Record<string, number>,
    config: SolverConfig
): SimulationResult {
    const { dt, tEnd, maxSteps = 100000 } = config;
    const n = y0.length;

    // Arrays para almacenar resultados
    const tValues: number[] = [t0];
    const yValues: number[][] = [y0.slice()];

    let t = t0;
    let y = y0.slice();
    let steps = 0;

    try {
        while (t < tEnd && steps < maxSteps) {
            // Calcular derivadas
            const dydt = derivatives.map(f => f(t, y, params));

            // Actualizar estado: y_{n+1} = y_n + dt * f(t_n, y_n)
            const yNew = y.map((yi, i) => yi + dt * dydt[i]);

            // Verificar valores válidos
            if (yNew.some(val => !isFinite(val))) {
                return {
                    t: tValues,
                    y: yValues,
                    success: false,
                    message: 'La integración divergió (valores infinitos o NaN)',
                    steps
                };
            }

            t += dt;
            y = yNew;
            steps++;

            // Guardar resultados
            tValues.push(t);
            yValues.push(y.slice());
        }

        return {
            t: tValues,
            y: yValues,
            success: true,
            message: steps >= maxSteps ? 'Se alcanzó el número máximo de pasos' : 'Integración completada',
            steps
        };
    } catch (error) {
        return {
            t: tValues,
            y: yValues,
            success: false,
            message: `Error durante la integración: ${error}`,
            steps
        };
    }
}
