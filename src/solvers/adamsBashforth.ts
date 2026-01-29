/**
 * Método de Adams-Bashforth (Multi-paso explícito)
 * Usa valores anteriores para predecir el siguiente estado.
 * Más eficiente que RK4 porque solo calcula una derivada por paso.
 */

import type { DerivativeFunction, SimulationResult, SolverConfig } from '../types/equations';


// Coeficientes de Adams-Bashforth para diferentes órdenes
// AB2: y_{n+1} = y_n + h * (3/2 * f_n - 1/2 * f_{n-1})
// AB3: y_{n+1} = y_n + h * (23/12 * f_n - 16/12 * f_{n-1} + 5/12 * f_{n-2})
// AB4: y_{n+1} = y_n + h * (55/24 * f_n - 59/24 * f_{n-1} + 37/24 * f_{n-2} - 9/24 * f_{n-3})

const AB_COEFFICIENTS = {
    2: [3 / 2, -1 / 2],
    3: [23 / 12, -16 / 12, 5 / 12],
    4: [55 / 24, -59 / 24, 37 / 24, -9 / 24]
};

export interface AdamsBashforthConfig extends SolverConfig {
    order?: 2 | 3 | 4;  // Orden del método (default: 4)
}

export function adamsBashforth(
    y0: number[],
    t0: number,
    derivatives: DerivativeFunction[],
    params: Record<string, number>,
    config: AdamsBashforthConfig
): SimulationResult {
    const { dt, tEnd, maxSteps = 100000 } = config;
    const order = config.order || 4;
    const n = y0.length;
    const coeffs = AB_COEFFICIENTS[order];

    // Arrays para almacenar resultados
    const tValues: number[] = [t0];
    const yValues: number[][] = [y0.slice()];

    let t = t0;
    let y = y0.slice();
    let steps = 0;

    // Historial de derivadas (necesitamos 'order' valores anteriores)
    const fHistory: number[][] = [];

    // Calcular derivada inicial
    const f0 = derivatives.map(deriv => deriv(t, y, params));
    fHistory.push(f0);

    try {
        // Fase de arranque: usar RK4 para los primeros pasos
        // Necesitamos (order - 1) pasos adicionales para tener suficiente historial
        const startupSteps = order - 1;

        for (let i = 0; i < startupSteps && t < tEnd && steps < maxSteps; i++) {
            // Calcular un paso con RK4
            const k1 = derivatives.map(deriv => deriv(t, y, params));

            const y1 = y.map((yi, idx) => yi + dt / 2 * k1[idx]);
            const k2 = derivatives.map(deriv => deriv(t + dt / 2, y1, params));

            const y2 = y.map((yi, idx) => yi + dt / 2 * k2[idx]);
            const k3 = derivatives.map(deriv => deriv(t + dt / 2, y2, params));

            const y3 = y.map((yi, idx) => yi + dt * k3[idx]);
            const k4 = derivatives.map(deriv => deriv(t + dt, y3, params));

            // Actualizar estado
            const yNew = y.map((yi, idx) =>
                yi + dt / 6 * (k1[idx] + 2 * k2[idx] + 2 * k3[idx] + k4[idx])
            );

            t += dt;
            y = yNew;
            steps++;

            // Guardar resultados
            tValues.push(t);
            yValues.push(y.slice());

            // Guardar derivada en el nuevo punto
            const fNew = derivatives.map(deriv => deriv(t, y, params));
            fHistory.push(fNew);

            // Verificar valores válidos
            if (y.some(val => !isFinite(val))) {
                return {
                    t: tValues,
                    y: yValues,
                    success: false,
                    message: 'La integración divergió durante el arranque (valores infinitos o NaN)',
                    steps
                };
            }
        }

        // Fase principal: usar Adams-Bashforth
        while (t < tEnd && steps < maxSteps) {
            // Limitar el paso para no pasarse del tiempo final
            let h = dt;
            if (t + h > tEnd) {
                h = tEnd - t;
            }

            // Calcular predicción usando coeficientes de Adams-Bashforth
            const yNew = y.slice();

            for (let i = 0; i < n; i++) {
                let sum = 0;
                for (let j = 0; j < order; j++) {
                    // fHistory tiene las derivadas más recientes al final
                    const fIdx = fHistory.length - 1 - j;
                    sum += coeffs[j] * fHistory[fIdx][i];
                }
                yNew[i] = y[i] + h * sum;
            }

            t += h;
            y = yNew;
            steps++;

            // Guardar resultados
            tValues.push(t);
            yValues.push(y.slice());

            // Calcular y guardar nueva derivada
            const fNew = derivatives.map(deriv => deriv(t, y, params));
            fHistory.push(fNew);

            // Mantener solo las últimas 'order' derivadas
            if (fHistory.length > order) {
                fHistory.shift();
            }

            // Verificar valores válidos
            if (y.some(val => !isFinite(val))) {
                return {
                    t: tValues,
                    y: yValues,
                    success: false,
                    message: 'La integración divergió (valores infinitos o NaN)',
                    steps
                };
            }
        }

        return {
            t: tValues,
            y: yValues,
            success: true,
            message: `Adams-Bashforth (orden ${order}) completado. Pasos: ${steps}`,
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
