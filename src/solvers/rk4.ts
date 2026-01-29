/**
 * Método Runge-Kutta de 4to orden (RK4)
 * Método clásico de alta precisión
 */

import type { DerivativeFunction, SimulationResult, SolverConfig } from '../types/equations';

export function rk4(
    y0: number[],
    t0: number,
    derivatives: DerivativeFunction[],
    params: Record<string, number>,
    config: SolverConfig
): SimulationResult {
    const { dt, tEnd, maxSteps = 100000 } = config;

    // Arrays para almacenar resultados
    const tValues: number[] = [t0];
    const yValues: number[][] = [y0.slice()];

    let t = t0;
    let y = y0.slice();
    let steps = 0;

    try {
        while (t < tEnd && steps < maxSteps) {
            // k1 = f(t_n, y_n)
            const k1 = derivatives.map(f => f(t, y, params));

            // k2 = f(t_n + dt/2, y_n + dt/2 * k1)
            const y2 = y.map((yi, i) => yi + 0.5 * dt * k1[i]);
            const k2 = derivatives.map(f => f(t + 0.5 * dt, y2, params));

            // k3 = f(t_n + dt/2, y_n + dt/2 * k2)
            const y3 = y.map((yi, i) => yi + 0.5 * dt * k2[i]);
            const k3 = derivatives.map(f => f(t + 0.5 * dt, y3, params));

            // k4 = f(t_n + dt, y_n + dt * k3)
            const y4 = y.map((yi, i) => yi + dt * k3[i]);
            const k4 = derivatives.map(f => f(t + dt, y4, params));

            // y_{n+1} = y_n + dt/6 * (k1 + 2*k2 + 2*k3 + k4)
            const yNew = y.map((yi, i) =>
                yi + (dt / 6.0) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])
            );

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
