/**
 * Método de Runge-Kutta-Fehlberg 4/5 (RKF45)
 * Método de paso adaptativo que ajusta automáticamente el tamaño del paso
 * para mantener el error dentro de una tolerancia especificada.
 */

import type { DerivativeFunction, SimulationResult, SolverConfig } from '../types/equations';

// Coeficientes de Butcher para RKF45
const A = [
    0,
    1 / 4,
    3 / 8,
    12 / 13,
    1,
    1 / 2
];

const B = [
    [0],
    [1 / 4],
    [3 / 32, 9 / 32],
    [1932 / 2197, -7200 / 2197, 7296 / 2197],
    [439 / 216, -8, 3680 / 513, -845 / 4104],
    [-8 / 27, 2, -3544 / 2565, 1859 / 4104, -11 / 40]
];

// Coeficientes para la solución de orden 4
const C4 = [25 / 216, 0, 1408 / 2565, 2197 / 4104, -1 / 5, 0];

// Coeficientes para la solución de orden 5
const C5 = [16 / 135, 0, 6656 / 12825, 28561 / 56430, -9 / 50, 2 / 55];

export interface RKF45Config extends SolverConfig {
    tolerance?: number;     // Tolerancia del error (default: 1e-6)
    minStep?: number;       // Paso mínimo permitido (default: 1e-10)
    maxStep?: number;       // Paso máximo permitido (default: 1.0)
    safetyFactor?: number;  // Factor de seguridad para ajuste de paso (default: 0.9)
}

export function rkf45(
    y0: number[],
    t0: number,
    derivatives: DerivativeFunction[],
    params: Record<string, number>,
    config: RKF45Config
): SimulationResult {
    const {
        tEnd,
        maxSteps = 100000,
        tolerance = 1e-6,
        minStep = 1e-10,
        maxStep = 1.0,
        safetyFactor = 0.9
    } = config;

    let dt = config.dt || 0.01; // Paso inicial
    const n = y0.length;

    // Arrays para almacenar resultados
    const tValues: number[] = [t0];
    const yValues: number[][] = [y0.slice()];

    let t = t0;
    let y = y0.slice();
    let steps = 0;
    let rejectedSteps = 0;

    // Arrays para los coeficientes k
    const k: number[][] = Array(6).fill(null).map(() => Array(n).fill(0));

    try {
        while (t < tEnd && steps < maxSteps) {
            // Limitar el paso para no pasarse del tiempo final
            if (t + dt > tEnd) {
                dt = tEnd - t;
            }

            // Calcular los 6 coeficientes k
            // k1 = f(t, y)
            for (let i = 0; i < n; i++) {
                k[0][i] = derivatives[i](t, y, params);
            }

            // k2 a k6
            for (let stage = 1; stage < 6; stage++) {
                const tStage = t + A[stage] * dt;
                const yStage = y.slice();

                for (let i = 0; i < n; i++) {
                    let sum = 0;
                    for (let j = 0; j < stage; j++) {
                        sum += B[stage][j] * k[j][i];
                    }
                    yStage[i] = y[i] + dt * sum;
                }

                for (let i = 0; i < n; i++) {
                    k[stage][i] = derivatives[i](tStage, yStage, params);
                }
            }

            // Calcular soluciones de orden 4 y 5
            const y4 = y.slice();
            const y5 = y.slice();

            for (let i = 0; i < n; i++) {
                let sum4 = 0;
                let sum5 = 0;
                for (let j = 0; j < 6; j++) {
                    sum4 += C4[j] * k[j][i];
                    sum5 += C5[j] * k[j][i];
                }
                y4[i] = y[i] + dt * sum4;
                y5[i] = y[i] + dt * sum5;
            }

            // Estimar el error (diferencia entre orden 4 y orden 5)
            let error = 0;
            for (let i = 0; i < n; i++) {
                const err = Math.abs(y5[i] - y4[i]);
                const scale = Math.max(Math.abs(y[i]), Math.abs(y5[i]), 1e-10);
                error = Math.max(error, err / scale);
            }

            // Verificar si el paso es aceptable
            if (error <= tolerance || dt <= minStep) {
                // Paso aceptado - usar solución de orden 5
                t += dt;
                y = y5;
                steps++;

                // Guardar resultados
                tValues.push(t);
                yValues.push(y.slice());

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
            } else {
                rejectedSteps++;
            }

            // Ajustar tamaño del paso para el siguiente paso
            let newDt: number;
            if (error === 0) {
                newDt = dt * 2; // Duplicar si el error es cero
            } else {
                // Fórmula estándar de ajuste de paso
                newDt = safetyFactor * dt * Math.pow(tolerance / error, 0.2);
            }

            // Limitar el paso entre minStep y maxStep
            dt = Math.max(minStep, Math.min(maxStep, newDt));
        }

        return {
            t: tValues,
            y: yValues,
            success: true,
            message: `Integración completada. Pasos: ${steps}, Rechazados: ${rejectedSteps}`,
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
