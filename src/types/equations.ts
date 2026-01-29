/**
 * Tipos para el sistema de ecuaciones diferenciales
 */

// Función derivada: f(t, y, params) => dy/dt
export type DerivativeFunction = (
    t: number,
    y: number[],
    params: Record<string, number>
) => number;

// Métodos numéricos disponibles
export enum NumericalMethod {
    EULER = 'euler',
    RK4 = 'rk4',
    RKF45 = 'rkf45',
    ADAMS_BASHFORTH = 'adams-bashforth'
}


// Definición de una ecuación diferencial
export interface DifferentialEquation {
    id: string;
    name: string;
    description?: string;
    variables: string[];  // ['x', 'y', 'z']
    parameters: Record<string, number>;  // { sigma: 10, rho: 28, beta: 8/3 }
    equations: string[];  // ['sigma*(y - x)', 'x*(rho - z) - y', 'x*y - beta*z']
    derivatives: DerivativeFunction[];  // Funciones compiladas
}

// Condiciones iniciales
export interface InitialConditions {
    values: number[];  // [x0, y0, z0]
    time: number;  // t0
}

// Configuración del solver
export interface SolverConfig {
    method: NumericalMethod;
    dt: number;  // Paso de tiempo (inicial para métodos adaptativos)
    tEnd: number;  // Tiempo final
    maxSteps?: number;  // Máximo número de pasos
    // Opciones para métodos adaptativos (RKF45)
    tolerance?: number;  // Tolerancia del error (default: 1e-6)
    minStep?: number;  // Paso mínimo (default: 1e-10)
    maxStep?: number;  // Paso máximo (default: 1.0)
}


// Resultado de la simulación
export interface SimulationResult {
    t: number[];  // Tiempos
    y: number[][];  // Estados [t][variable]
    success: boolean;
    message?: string;
    steps: number;  // Número de pasos realizados
}

// Estado del sistema
export interface SystemState {
    equation: DifferentialEquation | null;
    initialConditions: InitialConditions;
    solverConfig: SolverConfig;
    result: SimulationResult | null;
    isRunning: boolean;
    error: string | null;
}

// Sistema de ejemplo predefinido
export interface ExampleSystem {
    id: string;
    name: string;
    description: string;
    category: 'chaotic' | 'oscillator' | 'biological' | 'mechanical' | 'neuronal' | 'other';
    variables: string[];
    parameters: Record<string, number>;
    equations: string[];
    suggestedInitialConditions: number[];
    suggestedConfig: Partial<SolverConfig>;
    references?: string[];
}

// Configuración de visualización
export interface VisualizationConfig {
    showPhaseSpace: boolean;
    showTimeSeries: boolean;
    phaseSpaceAxes: [number, number];  // Índices de variables a graficar
    timeSeriesVariables: number[];  // Índices de variables a mostrar
    showVectorField: boolean;
    trajectoryColor: string;
    gridSize?: number;  // Para campo vectorial
}
