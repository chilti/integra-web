/**
 * Biblioteca de sistemas dinámicos de ejemplo
 */

import type { ExampleSystem } from '../types/equations';
import { NumericalMethod } from '../types/equations';

export const EXAMPLE_SYSTEMS: ExampleSystem[] = [
    {
        id: 'lorenz',
        name: 'Atractor de Lorenz',
        description: 'Sistema caótico que modela la convección atmosférica. Famoso por su forma de mariposa.',
        category: 'chaotic',
        variables: ['x', 'y', 'z'],
        parameters: {
            sigma: 10,
            rho: 28,
            beta: 8 / 3
        },
        equations: [
            'dx/dt = sigma*(y - x)',
            'dy/dt = x*(rho - z) - y',
            'dz/dt = x*y - beta*z'
        ],
        suggestedInitialConditions: [1, 1, 1],
        suggestedConfig: {
            method: NumericalMethod.RK4,
            dt: 0.01,
            tEnd: 50
        },
        references: [
            'Lorenz, E. N. (1963). Deterministic nonperiodic flow. Journal of the atmospheric sciences, 20(2), 130-141.'
        ]
    },
    {
        id: 'vanderpol',
        name: 'Oscilador de Van der Pol',
        description: 'Oscilador no lineal con amortiguamiento no lineal. Presenta ciclos límite.',
        category: 'oscillator',
        variables: ['x', 'y'],
        parameters: {
            mu: 1.0
        },
        equations: [
            'dx/dt = y',
            'dy/dt = mu*(1 - x*x)*y - x'
        ],
        suggestedInitialConditions: [2, 0],
        suggestedConfig: {
            method: NumericalMethod.RK4,
            dt: 0.05,
            tEnd: 30
        },
        references: [
            'Van der Pol, B. (1926). On relaxation-oscillations. The London, Edinburgh and Dublin Phil. Mag. & J. of Sci., 2(11), 978-992.'
        ]
    },
    {
        id: 'lotka-volterra',
        name: 'Lotka-Volterra (Predador-Presa)',
        description: 'Modelo clásico de dinámica poblacional entre predadores y presas.',
        category: 'biological',
        variables: ['x', 'y'],
        parameters: {
            alpha: 1.5,
            beta: 1.0,
            gamma: 3.0,
            delta: 1.0
        },
        equations: [
            'dx/dt = alpha*x - beta*x*y',
            'dy/dt = delta*x*y - gamma*y'
        ],
        suggestedInitialConditions: [1, 1],
        suggestedConfig: {
            method: NumericalMethod.RK4,
            dt: 0.01,
            tEnd: 20
        },
        references: [
            'Lotka, A. J. (1925). Elements of physical biology. Williams & Wilkins.'
        ]
    },
    {
        id: 'pendulum',
        name: 'Péndulo Simple',
        description: 'Péndulo simple sin fricción. Movimiento periódico.',
        category: 'mechanical',
        variables: ['theta', 'omega'],
        parameters: {
            g: 9.81,
            L: 1.0
        },
        equations: [
            'dtheta/dt = omega',
            'domega/dt = -(g/L)*sin(theta)'
        ],
        suggestedInitialConditions: [Math.PI / 4, 0],
        suggestedConfig: {
            method: NumericalMethod.RK4,
            dt: 0.01,
            tEnd: 10
        }
    },
    {
        id: 'duffing',
        name: 'Oscilador de Duffing',
        description: 'Oscilador no lineal forzado. Puede exhibir comportamiento caótico.',
        category: 'oscillator',
        variables: ['x', 'v'],
        parameters: {
            alpha: -1,
            beta: 1,
            delta: 0.3,
            gamma: 0.5,
            omega: 1.2
        },
        equations: [
            'dx/dt = v',
            'dv/dt = -delta*v - alpha*x - beta*x*x*x + gamma*cos(omega*t)'
        ],
        suggestedInitialConditions: [1, 0],
        suggestedConfig: {
            method: NumericalMethod.RK4,
            dt: 0.01,
            tEnd: 100
        }
    },
    {
        id: 'rossler',
        name: 'Atractor de Rössler',
        description: 'Sistema caótico más simple que Lorenz, con estructura de espiral.',
        category: 'chaotic',
        variables: ['x', 'y', 'z'],
        parameters: {
            a: 0.2,
            b: 0.2,
            c: 5.7
        },
        equations: [
            'dx/dt = -y - z',
            'dy/dt = x + a*y',
            'dz/dt = b + z*(x - c)'
        ],
        suggestedInitialConditions: [1, 1, 1],
        suggestedConfig: {
            method: NumericalMethod.RK4,
            dt: 0.01,
            tEnd: 100
        },
        references: [
            'Rössler, O. E. (1976). An equation for continuous chaos. Physics Letters A, 57(5), 397-398.'
        ]
    },
    {
        id: 'harmonic',
        name: 'Oscilador Armónico Simple',
        description: 'Sistema masa-resorte ideal. Movimiento armónico simple.',
        category: 'mechanical',
        variables: ['x', 'v'],
        parameters: {
            k: 1.0,
            m: 1.0
        },
        equations: [
            'dx/dt = v',
            'dv/dt = -(k/m)*x'
        ],
        suggestedInitialConditions: [1, 0],
        suggestedConfig: {
            method: NumericalMethod.RK4,
            dt: 0.01,
            tEnd: 20
        }
    },
    {
        id: 'damped-oscillator',
        name: 'Oscilador Amortiguado',
        description: 'Oscilador armónico con amortiguamiento. Decae exponencialmente.',
        category: 'mechanical',
        variables: ['x', 'v'],
        parameters: {
            k: 1.0,
            m: 1.0,
            c: 0.3
        },
        equations: [
            'dx/dt = v',
            'dv/dt = -(k/m)*x - (c/m)*v'
        ],
        suggestedInitialConditions: [1, 0],
        suggestedConfig: {
            method: NumericalMethod.RK4,
            dt: 0.01,
            tEnd: 20
        }
    },
    {
        id: 'fitzhugh-nagumo',
        name: 'FitzHugh-Nagumo',
        description: 'Modelo simplificado de excitación neuronal. Captura potenciales de acción.',
        category: 'biological',
        variables: ['v', 'w'],
        parameters: {
            a: 0.7,
            b: 0.8,
            tau: 12.5,
            I: 0.5
        },
        equations: [
            'dv/dt = v - v*v*v/3 - w + I',
            'dw/dt = (v + a - b*w)/tau'
        ],
        suggestedInitialConditions: [-1, 1],
        suggestedConfig: {
            method: NumericalMethod.RK4,
            dt: 0.1,
            tEnd: 100
        },
        references: [
            'FitzHugh, R. (1961). Impulses and physiological states in theoretical models of nerve membrane.'
        ]
    },
    {
        id: 'brusselator',
        name: 'Brusselator',
        description: 'Modelo de reacción química autocatalítica. Exhibe oscilaciones químicas.',
        category: 'biological',
        variables: ['x', 'y'],
        parameters: {
            a: 1.0,
            b: 3.0
        },
        equations: [
            'dx/dt = a + x*x*y - b*x - x',
            'dy/dt = b*x - x*x*y'
        ],
        suggestedInitialConditions: [1, 1],
        suggestedConfig: {
            method: NumericalMethod.RK4,
            dt: 0.01,
            tEnd: 50
        }
    },
    {
        id: 'sir',
        name: 'Modelo SIR',
        description: 'Modelo epidemiológico clásico: Susceptibles, Infectados, Recuperados.',
        category: 'biological',
        variables: ['S', 'I', 'R'],
        parameters: {
            beta: 0.3,
            gamma: 0.1
        },
        equations: [
            'dS/dt = -beta*S*I',
            'dI/dt = beta*S*I - gamma*I',
            'dR/dt = gamma*I'
        ],
        suggestedInitialConditions: [0.99, 0.01, 0],
        suggestedConfig: {
            method: NumericalMethod.RK4,
            dt: 0.1,
            tEnd: 100
        }
    },
    {
        id: 'henon-heiles',
        name: 'Henon-Heiles',
        description: 'Sistema hamiltoniano que modela el movimiento estelar en galaxias.',
        category: 'chaotic',
        variables: ['x', 'y', 'px', 'py'],
        parameters: {
            lambda: 1.0
        },
        equations: [
            'dx/dt = px',
            'dy/dt = py',
            'dpx/dt = -x - 2*lambda*x*y',
            'dpy/dt = -y - lambda*(x*x - y*y)'
        ],
        suggestedInitialConditions: [0.1, 0.0, 0.2, 0.2],
        suggestedConfig: {
            method: NumericalMethod.RK4,
            dt: 0.01,
            tEnd: 50
        },
        references: [
            'Hénon, M., & Heiles, C. (1964). The applicability of the third integral of motion.'
        ]
    },
    {
        id: 'double-well',
        name: 'Pozo Doble (Bistable)',
        description: 'Sistema con dos estados estables. Transiciones entre pozos de potencial.',
        category: 'mechanical',
        variables: ['x', 'v'],
        parameters: {
            a: 1.0,
            b: 1.0,
            gamma: 0.1
        },
        equations: [
            'dx/dt = v',
            'dv/dt = a*x - b*x*x*x - gamma*v'
        ],
        suggestedInitialConditions: [0.5, 0],
        suggestedConfig: {
            method: NumericalMethod.RK4,
            dt: 0.01,
            tEnd: 50
        }
    },
    {
        id: 'thomas',
        name: 'Atractor de Thomas',
        description: 'Sistema caótico 3D con simetría cíclica. Forma un atractor extraño simétrico.',
        category: 'chaotic',
        variables: ['x', 'y', 'z'],
        parameters: {
            b: 0.208186
        },
        equations: [
            'dx/dt = sin(y) - b*x',
            'dy/dt = sin(z) - b*y',
            'dz/dt = sin(x) - b*z'
        ],
        suggestedInitialConditions: [0.1, 0.0, 0.0],
        suggestedConfig: {
            method: NumericalMethod.RK4,
            dt: 0.1,
            tEnd: 200
        },
        references: [
            'Thomas, R. (1999). Deterministic chaos seen in terms of feedback circuits.'
        ]
    },
    {
        id: 'aizawa',
        name: 'Atractor de Aizawa',
        description: 'Atractor caótico 3D con forma de torus deformado.',
        category: 'chaotic',
        variables: ['x', 'y', 'z'],
        parameters: {
            a: 0.95,
            b: 0.7,
            c: 0.6,
            d: 3.5,
            e: 0.25,
            f: 0.1
        },
        equations: [
            'dx/dt = (z - b)*x - d*y',
            'dy/dt = d*x + (z - b)*y',
            'dz/dt = c + a*z - z*z*z/3 - (x*x + y*y)*(1 + e*z) + f*z*x*x*x'
        ],
        suggestedInitialConditions: [0.1, 0.0, 0.0],
        suggestedConfig: {
            method: NumericalMethod.RK4,
            dt: 0.005,
            tEnd: 50
        }
    },
    // ========== MODELOS NEURONALES ==========
    {
        id: 'morris-lecar',
        name: 'Morris-Lecar',
        description: 'Modelo biofísico reducido de neurona. Canónico para estudiar excitabilidad Clase I vs II.',
        category: 'neuronal',
        variables: ['V', 'W'],
        parameters: {
            C: 20,
            gL: 2,
            gCa: 4.4,
            gK: 8,
            VL: -60,
            VCa: 120,
            VK: -84,
            V1: -1.2,
            V2: 18,
            V3: 2,
            V4: 30,
            phi: 0.04,
            Iapp: 80
        },
        equations: [
            'dV/dt = (Iapp - gL*(V - VL) - gCa*0.5*(1 + tanh((V - V1)/V2))*(V - VCa) - gK*W*(V - VK))/C',
            'dW/dt = phi*(0.5*(1 + tanh((V - V3)/V4)) - W)/cosh((V - V3)/(2*V4))'
        ],
        suggestedInitialConditions: [-60, 0.01],
        suggestedConfig: {
            method: NumericalMethod.RK4,
            dt: 0.1,
            tEnd: 200
        },
        references: [
            'Morris, C., & Lecar, H. (1981). Voltage oscillations in the barnacle giant muscle fiber.'
        ]
    },
    {
        id: 'hindmarsh-rose',
        name: 'Hindmarsh-Rose',
        description: 'Modelo de 3 variables para bursting neuronal. Variable z controla ráfagas.',
        category: 'neuronal',
        variables: ['x', 'y', 'z'],
        parameters: {
            a: 1.0,
            b: 3.0,
            c: 1.0,
            d: 5.0,
            s: 4.0,
            xR: -1.6,
            r: 0.006,
            I: 3.2
        },
        equations: [
            'dx/dt = y - a*x*x*x + b*x*x - z + I',
            'dy/dt = c - d*x*x - y',
            'dz/dt = r*(s*(x - xR) - z)'
        ],
        suggestedInitialConditions: [-1.5, -10, 2],
        suggestedConfig: {
            method: NumericalMethod.RK4,
            dt: 0.02,
            tEnd: 500
        },
        references: [
            'Hindmarsh, J. L., & Rose, R. M. (1984). A model of neuronal bursting.'
        ]
    },
    {
        id: 'fitzhugh-nagumo',
        name: 'FitzHugh-Nagumo',
        description: 'Simplificación 2D del modelo de Hodgkin-Huxley. Modelo canónico de neurona excitable.',
        category: 'neuronal',
        variables: ['v', 'w'],
        parameters: {
            a: 0.7,
            b: 0.8,
            tau: 12.5,
            I: 0.5
        },
        equations: [
            'dv/dt = v - v*v*v/3 - w + I',
            'dw/dt = (v + a - b*w)/tau'
        ],
        suggestedInitialConditions: [-1, -0.5],
        suggestedConfig: {
            method: NumericalMethod.RK4,
            dt: 0.1,
            tEnd: 100
        },
        references: [
            'FitzHugh, R. (1961). Impulses and physiological states in theoretical models of nerve membrane.'
        ]
    },
    {
        id: 'carrillo-hoppensteadt',
        name: 'Carrillo-Hoppensteadt',
        description: 'Oscilador de relajación que despliega la discontinuidad del Integrate-and-Fire. Análisis de sincronización sin discontinuidades.',
        category: 'neuronal',
        variables: ['V', 'I'],
        parameters: {
            epsilon: 0.00001,
            S: 5.0,
            R: 1.0
        },
        equations: [
            'dV/dt = epsilon*(S - V - R*I)',
            'dI/dt = V - 0.0075*I + 2*I*exp(-I/2)'
        ],
        suggestedInitialConditions: [0.1, 0.1],
        suggestedConfig: {
            method: NumericalMethod.RK4,
            dt: 0.01,
            tEnd: 100
        },
        references: [
            'Carrillo, H., & Hoppensteadt, F. C. (1997). Unfolding of a singular Hopf bifurcation.'
        ]
    }
];

/**
 * Obtiene un sistema por su ID
 */
export function getSystemById(id: string): ExampleSystem | undefined {
    return EXAMPLE_SYSTEMS.find(sys => sys.id === id);
}

/**
 * Obtiene sistemas por categoría
 */
export function getSystemsByCategory(category: ExampleSystem['category']): ExampleSystem[] {
    return EXAMPLE_SYSTEMS.filter(sys => sys.category === category);
}

/**
 * Categorías disponibles
 */
export const CATEGORIES = [
    { id: 'chaotic', name: 'Sistemas Caóticos', icon: '🦋' },
    { id: 'oscillator', name: 'Osciladores', icon: '〰️' },
    { id: 'biological', name: 'Sistemas Biológicos', icon: '🧬' },
    { id: 'mechanical', name: 'Sistemas Mecánicos', icon: '⚙️' },
    { id: 'neuronal', name: 'Modelos Neuronales', icon: '🧠' },
    { id: 'other', name: 'Otros', icon: '📊' }
] as const;
