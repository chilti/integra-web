/**
 * Índice de solvers numéricos
 * Exporta todos los métodos disponibles
 */

import { euler } from './euler';
import { rk4 } from './rk4';
import { rkf45 } from './rkf45';
import { adamsBashforth } from './adamsBashforth';
import { NumericalMethod } from '../types/equations';
import type { DerivativeFunction, SimulationResult, SolverConfig } from '../types/equations';


// Tipo para función solver
export type SolverFunction = (
    y0: number[],
    t0: number,
    derivatives: DerivativeFunction[],
    params: Record<string, number>,
    config: SolverConfig
) => SimulationResult;

// Mapa de solvers disponibles
const SOLVERS: Record<NumericalMethod, SolverFunction> = {
    [NumericalMethod.EULER]: euler,
    [NumericalMethod.RK4]: rk4,
    [NumericalMethod.RKF45]: rkf45,
    [NumericalMethod.ADAMS_BASHFORTH]: adamsBashforth,
};


/**
 * Obtiene el solver correspondiente al método especificado
 */
export function getSolver(method: NumericalMethod): SolverFunction {
    const solver = SOLVERS[method];
    if (!solver) {
        throw new Error(`Método numérico no soportado: ${method}`);
    }
    return solver;
}

/**
 * Ejecuta una integración numérica
 */
export function integrate(
    y0: number[],
    t0: number,
    derivatives: DerivativeFunction[],
    params: Record<string, number>,
    config: SolverConfig
): SimulationResult {
    const solver = getSolver(config.method);
    return solver(y0, t0, derivatives, params, config);
}

// Exportar solvers individuales
export { euler, rk4, rkf45, adamsBashforth };

// Información sobre los métodos
export const SOLVER_INFO: Record<NumericalMethod, { name: string; description: string; order: number }> = {
    [NumericalMethod.EULER]: {
        name: 'Euler',
        description: 'Método de Euler (1er orden). Simple pero menos preciso.',
        order: 1
    },
    [NumericalMethod.RK4]: {
        name: 'Runge-Kutta 4',
        description: 'Método clásico de Runge-Kutta de 4to orden. Buen balance entre precisión y velocidad.',
        order: 4
    },
    [NumericalMethod.RKF45]: {
        name: 'Runge-Kutta-Fehlberg',
        description: 'Método adaptativo de paso variable (4to/5to orden). Máxima precisión.',
        order: 5
    },
    [NumericalMethod.ADAMS_BASHFORTH]: {
        name: 'Adams-Bashforth',
        description: 'Método multi-paso (4to orden). Eficiente: 1 evaluación por paso.',
        order: 4
    }
};
