/**
 * Parser de ecuaciones diferenciales
 * Convierte strings de ecuaciones a funciones ejecutables
 */

import type { DerivativeFunction } from '../types/equations';

// Funciones matemáticas soportadas
const MATH_FUNCTIONS: Record<string, (x: number) => number> = {
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    asin: Math.asin,
    acos: Math.acos,
    atan: Math.atan,
    sinh: Math.sinh,
    cosh: Math.cosh,
    tanh: Math.tanh,
    exp: Math.exp,
    log: Math.log,
    ln: Math.log,
    log10: Math.log10,
    sqrt: Math.sqrt,
    abs: Math.abs,
    sign: Math.sign,
    floor: Math.floor,
    ceil: Math.ceil,
    round: Math.round,
};

// Constantes matemáticas
const MATH_CONSTANTS: Record<string, number> = {
    pi: Math.PI,
    e: Math.E,
    PI: Math.PI,
    E: Math.E,
};

/**
 * Parsea una ecuación diferencial y la convierte en una función
 * @param equation String de la ecuación (ej: "sigma*(y - x)")
 * @param variables Array de nombres de variables (ej: ['x', 'y', 'z'])
 * @returns Función derivada
 */
export function parseEquation(
    equation: string,
    variables: string[]
): DerivativeFunction {
    // Limpiar la ecuación
    let cleanedEq = equation.trim();

    // Función para convertir potencias a Math.pow
    // Usamos un enfoque iterativo para manejar todos los casos
    function convertPowers(expr: string): string {
        // Patrón: base^exponente donde base puede ser un identificador, número, o paréntesis
        // y exponente puede ser un número, identificador, o expresión entre paréntesis
        let result = expr;
        let prevResult = '';

        // Iterar hasta que no haya más cambios
        while (result !== prevResult) {
            prevResult = result;

            // Caso 1: identificador^exponente (ej: x^2, omega^2)
            result = result.replace(
                /([a-zA-Z_][a-zA-Z0-9_]*)\^(\d+\.?\d*)/g,
                (_, base, exp) => `Math.pow(${base}, ${exp})`
            );

            // Caso 2: identificador^identificador (ej: x^n)
            result = result.replace(
                /([a-zA-Z_][a-zA-Z0-9_]*)\^([a-zA-Z_][a-zA-Z0-9_]*)/g,
                (_, base, exp) => `Math.pow(${base}, ${exp})`
            );

            // Caso 3: )^exponente (ej: (x+1)^2)
            result = result.replace(
                /\)\^(\d+\.?\d*)/g,
                (_, exp) => `, ${exp})`
            ).replace(/\(\(([^()]+)\), (\d+\.?\d*)\)/g, 'Math.pow($1, $2)');

            // Caso 4: número^exponente (ej: 2^x)
            result = result.replace(
                /(\d+\.?\d*)\^([a-zA-Z_][a-zA-Z0-9_]*)/g,
                (_, base, exp) => `Math.pow(${base}, ${exp})`
            );
        }

        return result;
    }

    cleanedEq = convertPowers(cleanedEq);

    // Crear el cuerpo de la función
    let functionBody = cleanedEq;


    // Reemplazar variables por acceso al array y[i]
    // Usamos placeholders únicos primero para evitar colisiones
    // (por ejemplo, evitar que 'y' reemplace la 'y' en 'y[0]')
    const PLACEHOLDER_PREFIX = '___VAR_';
    const PLACEHOLDER_SUFFIX = '___';

    // Primer paso: reemplazar variables por placeholders únicos
    variables.forEach((variable, index) => {
        const regex = new RegExp(`\\b${variable}\\b`, 'g');
        functionBody = functionBody.replace(regex, `${PLACEHOLDER_PREFIX}${index}${PLACEHOLDER_SUFFIX}`);
    });

    // Segundo paso: reemplazar placeholders por acceso real al array
    variables.forEach((_, index) => {
        const placeholder = `${PLACEHOLDER_PREFIX}${index}${PLACEHOLDER_SUFFIX}`;
        functionBody = functionBody.split(placeholder).join(`y[${index}]`);
    });


    // Reemplazar parámetros por acceso a params
    // Detectar parámetros (palabras que no son variables ni funciones)
    const paramRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
    let match;
    const usedParams = new Set<string>();

    while ((match = paramRegex.exec(functionBody)) !== null) {
        const word = match[1];
        // Si no es una variable, función matemática, o constante, es un parámetro
        if (
            !variables.includes(word) &&
            !MATH_FUNCTIONS.hasOwnProperty(word) &&
            !MATH_CONSTANTS.hasOwnProperty(word) &&
            word !== 'y' &&
            word !== 't' &&
            word !== 'params' &&
            word !== 'Math' &&
            word !== 'pow'  // Ignorar pow (de Math.pow)
        ) {
            usedParams.add(word);
        }
    }


    // Reemplazar parámetros
    usedParams.forEach(param => {
        const regex = new RegExp(`\\b${param}\\b`, 'g');
        functionBody = functionBody.replace(regex, `params.${param}`);
    });

    // Reemplazar funciones matemáticas
    Object.keys(MATH_FUNCTIONS).forEach(func => {
        const regex = new RegExp(`\\b${func}\\b`, 'g');
        functionBody = functionBody.replace(regex, `Math.${func}`);
    });

    // Reemplazar constantes matemáticas
    Object.keys(MATH_CONSTANTS).forEach(constant => {
        const regex = new RegExp(`\\b${constant}\\b`, 'g');
        functionBody = functionBody.replace(regex, `Math.${constant}`);
    });

    try {
        // Crear la función
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        const func = new Function('t', 'y', 'params', `return ${functionBody};`) as DerivativeFunction;
        return func;
    } catch (error) {
        throw new Error(`Error al parsear ecuación "${equation}": ${error}`);
    }
}

/**
 * Valida una ecuación antes de parsearla
 * @param equation String de la ecuación
 * @param variables Array de nombres de variables conocidas
 * @param paramNames Array de nombres de parámetros conocidos
 * @returns true si es válida, mensaje de error si no
 */
export function validateEquation(
    equation: string,
    variables: string[] = [],
    paramNames: string[] = []
): { valid: boolean; error?: string } {
    if (!equation || equation.trim() === '') {
        return { valid: false, error: 'La ecuación no puede estar vacía' };
    }

    // Verificar paréntesis balanceados
    let parenthesisCount = 0;
    for (const char of equation) {
        if (char === '(') parenthesisCount++;
        if (char === ')') parenthesisCount--;
        if (parenthesisCount < 0) {
            return { valid: false, error: 'Paréntesis no balanceados' };
        }
    }
    if (parenthesisCount !== 0) {
        return { valid: false, error: 'Paréntesis no balanceados' };
    }

    // Verificar caracteres inválidos
    const validChars = /^[a-zA-Z0-9_+\-*/().,\s^]+$/;
    if (!validChars.test(equation)) {
        return { valid: false, error: 'La ecuación contiene caracteres inválidos' };
    }

    // Intentar parsear como prueba
    try {
        // Usar Math.pow() en lugar de ** para evitar problemas con operadores unarios
        let testBody = equation
            .replace(/([a-zA-Z_][a-zA-Z0-9_]*|\))\s*\^\s*([+-]?\d+\.?\d*|[a-zA-Z_][a-zA-Z0-9_]*|\([^)]+\))/g,
                (_, base, exp) => `Math.pow(${base}, ${exp})`)
            .replace(/(\d+\.?\d*)\s*\^\s*([a-zA-Z_][a-zA-Z0-9_]*|\([^)]+\))/g,
                (_, base, exp) => `Math.pow(${base}, ${exp})`)
            .replace(/\b(sin|cos|tan|exp|log|sqrt|abs)\b/g, 'Math.$1');


        // Crear un contexto de prueba
        const testVars: Record<string, number> = {};
        variables.forEach((v, i) => { testVars[v] = i + 1; });
        paramNames.forEach(p => { testVars[p] = 1; });

        // Esto verificará la sintaxis
        new Function('t', 'y', 'params', `return ${testBody};`);
    } catch (e) {
        return { valid: false, error: `Sintaxis inválida: ${e}` };
    }

    return { valid: true };
}


/**
 * Extrae nombres de variables de un array de ecuaciones
 * @param equations Array de strings de ecuaciones en formato "dx/dt = ..."
 * @returns Array de nombres de variables
 */
export function extractVariables(equations: string[]): string[] {
    const variables: string[] = [];

    for (const eq of equations) {
        // Buscar patrón d{variable}/dt
        const match = eq.match(/d([a-zA-Z_][a-zA-Z0-9_]*)\s*\/\s*dt/);
        if (match) {
            variables.push(match[1]);
        }
    }

    return variables;
}

/**
 * Extrae la parte derecha de una ecuación diferencial
 * @param equation String completo "dx/dt = ..."
 * @returns Parte derecha de la ecuación
 */
export function extractRightHandSide(equation: string): string {
    const parts = equation.split('=');
    if (parts.length !== 2) {
        throw new Error(`Ecuación inválida: ${equation}`);
    }
    return parts[1].trim();
}

/**
 * Parsea un sistema completo de ecuaciones diferenciales
 * @param equationStrings Array de ecuaciones en formato "dx/dt = ..."
 * @returns Objeto con variables y funciones derivadas
 */
export function parseSystem(equationStrings: string[]): {
    variables: string[];
    derivatives: DerivativeFunction[];
} {
    // Extraer variables
    const variables = extractVariables(equationStrings);

    if (variables.length === 0) {
        throw new Error('No se encontraron variables en las ecuaciones');
    }

    if (variables.length !== equationStrings.length) {
        throw new Error('Número de variables no coincide con número de ecuaciones');
    }

    // Extraer y parsear ecuaciones
    const derivatives: DerivativeFunction[] = [];

    for (const eqString of equationStrings) {
        const rightSide = extractRightHandSide(eqString);
        const validation = validateEquation(rightSide);

        if (!validation.valid) {
            throw new Error(`Error en ecuación "${eqString}": ${validation.error}`);
        }

        const derivative = parseEquation(rightSide, variables);
        derivatives.push(derivative);
    }

    return { variables, derivatives };
}

/**
 * Parsea múltiples ecuaciones directamente (sin formato "dx/dt = ...")
 * @param equations Array de expresiones (lado derecho de las ecuaciones)
 * @param variables Array de nombres de variables
 * @param params Objeto con valores de parámetros
 * @returns Array de funciones derivadas
 */
export function parseEquations(
    equations: string[],
    variables: string[],
    params: Record<string, number>
): DerivativeFunction[] {
    const derivatives: DerivativeFunction[] = [];

    for (const eq of equations) {
        const validation = validateEquation(eq, variables, Object.keys(params));
        if (!validation.valid) {
            throw new Error(`Error en ecuación: ${validation.error}`);
        }

        const derivative = parseEquation(eq, variables);
        derivatives.push(derivative);
    }

    return derivatives;
}

/**
 * Extrae parámetros de una expresión
 * @param expression String de la expresión
 * @param variables Array de nombres de variables conocidas
 * @returns Array de nombres de parámetros detectados
 */
export function extractParameters(
    expression: string,
    variables: string[]
): string[] {
    const params: Set<string> = new Set();

    // Buscar todas las palabras en la expresión
    const wordRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
    let match;

    while ((match = wordRegex.exec(expression)) !== null) {
        const word = match[1];

        // Ignorar si es una variable, función matemática, constante o palabra reservada
        if (
            !variables.includes(word) &&
            !MATH_FUNCTIONS.hasOwnProperty(word) &&
            !MATH_CONSTANTS.hasOwnProperty(word) &&
            word !== 't' &&
            word !== 'y' &&
            word !== 'params' &&
            word !== 'Math' &&
            word !== 'pow'  // Ignorar pow (de Math.pow)
        ) {
            params.add(word);
        }
    }

    return Array.from(params);
}

