import { useState, useEffect, useCallback } from 'react';
import styles from './CustomEquationEditor.module.css';
import type { DifferentialEquation } from '../types/equations';
import { parseEquations, extractParameters, validateEquation } from '../utils/equationParser';

interface CustomEquationEditorProps {
    currentEquation: DifferentialEquation | null;
    onEquationChange: (equation: DifferentialEquation) => void;
}

interface EquationVariable {
    name: string;
    expression: string;
    error: string | null;
}

interface SavedSystem {
    id: string;
    name: string;
    variables: EquationVariable[];
    parameters: Record<string, number>;
    savedAt: string;
}

const STORAGE_KEY = 'integra-saved-systems';

export default function CustomEquationEditor({ currentEquation, onEquationChange }: CustomEquationEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [systemName, setSystemName] = useState('Mi Sistema');
    const [variables, setVariables] = useState<EquationVariable[]>([
        { name: 'x', expression: '', error: null },
        { name: 'y', expression: '', error: null }
    ]);
    const [parameters, setParameters] = useState<{ name: string; value: number }[]>([]);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [savedSystems, setSavedSystems] = useState<SavedSystem[]>([]);

    // Cargar sistemas guardados al iniciar
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setSavedSystems(JSON.parse(saved));
            } catch (e) {
                console.error('Error loading saved systems:', e);
            }
        }
    }, []);

    // Cuando se selecciona un sistema predefinido, cargar sus datos
    useEffect(() => {
        if (currentEquation && !isEditing) {
            setSystemName(currentEquation.name);
            setVariables(currentEquation.variables.map((name, i) => ({
                name,
                expression: currentEquation.equations[i] || '',
                error: null
            })));
            const paramEntries = Object.entries(currentEquation.parameters);
            setParameters(paramEntries.map(([name, value]) => ({ name, value })));
        }
    }, [currentEquation, isEditing]);

    const handleVariableNameChange = (index: number, name: string) => {
        const validName = name.replace(/[^a-zA-Z_]/g, '').slice(0, 10);
        setVariables(prev => prev.map((v, i) =>
            i === index ? { ...v, name: validName } : v
        ));
        setSuccessMessage(null);
    };

    const handleExpressionChange = (index: number, expression: string) => {
        setVariables(prev => prev.map((v, i) =>
            i === index ? { ...v, expression, error: null } : v
        ));
        setGlobalError(null);
        setSuccessMessage(null);

        // Detectar nuevos parámetros
        const allExpressions = variables.map((v, i) =>
            i === index ? expression : v.expression
        ).join(' ');
        const detectedParams = extractParameters(allExpressions, variables.map(v => v.name));

        // Agregar parámetros nuevos sin eliminar los existentes
        const existingNames = new Set(parameters.map(p => p.name));
        const newParams = detectedParams.filter(p => !existingNames.has(p));
        if (newParams.length > 0) {
            setParameters(prev => [...prev, ...newParams.map(name => ({ name, value: 1 }))]);
        }
    };

    const handleAddVariable = () => {
        const usedNames = new Set(variables.map(v => v.name));
        const letters = 'xyzuvwpqrstabcdefghijklmno'.split('');
        const newName = letters.find(l => !usedNames.has(l)) || `v${variables.length + 1}`;
        setVariables(prev => [...prev, { name: newName, expression: '', error: null }]);
    };

    const handleRemoveVariable = (index: number) => {
        if (variables.length <= 1) return;
        setVariables(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddParameter = () => {
        const usedNames = new Set(parameters.map(p => p.name));
        const greekLetters = ['alpha', 'beta', 'gamma', 'delta', 'sigma', 'rho', 'mu', 'lambda'];
        const newName = greekLetters.find(l => !usedNames.has(l)) || `p${parameters.length + 1}`;
        setParameters(prev => [...prev, { name: newName, value: 1 }]);
    };

    const handleRemoveParameter = (index: number) => {
        setParameters(prev => prev.filter((_, i) => i !== index));
    };

    const handleParameterNameChange = (index: number, name: string) => {
        const validName = name.replace(/[^a-zA-Z_0-9]/g, '').slice(0, 15);
        setParameters(prev => prev.map((p, i) =>
            i === index ? { ...p, name: validName } : p
        ));
    };

    const handleParameterValueChange = (index: number, valueStr: string) => {
        const value = parseFloat(valueStr);
        if (!isNaN(value)) {
            setParameters(prev => prev.map((p, i) =>
                i === index ? { ...p, value } : p
            ));
        }
    };

    const validateAndApply = useCallback(() => {
        setGlobalError(null);
        setSuccessMessage(null);

        // Validar nombres de variables únicos
        const varNames = variables.map(v => v.name);
        const uniqueNames = new Set(varNames);
        if (uniqueNames.size !== varNames.length) {
            setGlobalError('Los nombres de variables deben ser únicos');
            return;
        }

        // Validar que no haya nombres vacíos
        if (varNames.some(n => !n)) {
            setGlobalError('Los nombres de variables no pueden estar vacíos');
            return;
        }

        // Validar expresiones
        const paramObj: Record<string, number> = {};
        parameters.forEach(p => { paramObj[p.name] = p.value; });

        let hasErrors = false;
        const validatedVars = variables.map(v => {
            const validation = validateEquation(v.expression, varNames, Object.keys(paramObj));
            if (!validation.valid) {
                hasErrors = true;
                return { ...v, error: validation.error || 'Expresión inválida' };
            }
            return { ...v, error: null };
        });

        setVariables(validatedVars);

        if (hasErrors) {
            setGlobalError('Hay errores en las ecuaciones. Corrígelos antes de continuar.');
            return;
        }

        // Parsear ecuaciones
        try {
            const equations = variables.map(v => v.expression);
            const derivatives = parseEquations(equations, varNames, paramObj);

            const newEquation: DifferentialEquation = {
                id: `custom-${Date.now()}`,
                name: systemName || 'Sistema Personalizado',
                description: `Sistema personalizado con ${variables.length} variable(s)`,
                variables: varNames,
                parameters: paramObj,
                equations,
                derivatives
            };

            onEquationChange(newEquation);
            setSuccessMessage('✓ Sistema aplicado correctamente');
        } catch (error) {
            setGlobalError(`Error al procesar las ecuaciones: ${error}`);
        }
    }, [variables, parameters, systemName, onEquationChange]);

    const handleSaveSystem = () => {
        const system: SavedSystem = {
            id: `saved-${Date.now()}`,
            name: systemName || 'Sistema Sin Nombre',
            variables: variables.map(v => ({ ...v })),
            parameters: Object.fromEntries(parameters.map(p => [p.name, p.value])),
            savedAt: new Date().toISOString()
        };

        const updatedSystems = [...savedSystems, system];
        setSavedSystems(updatedSystems);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSystems));
        setSuccessMessage('✓ Sistema guardado');
    };

    const handleLoadSavedSystem = (system: SavedSystem) => {
        setSystemName(system.name);
        setVariables(system.variables.map(v => ({ ...v, error: null })));
        setParameters(Object.entries(system.parameters).map(([name, value]) => ({ name, value })));
        setIsEditing(true);
        setSuccessMessage(`Cargado: ${system.name}`);
    };

    const handleDeleteSavedSystem = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const updatedSystems = savedSystems.filter(s => s.id !== id);
        setSavedSystems(updatedSystems);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSystems));
    };

    return (
        <div className={styles.customEditor}>
            <div className={styles.sectionTitle}>
                <span>✏️ Editor de Ecuaciones</span>
                <button
                    className={`${styles.toggleButton} ${isEditing ? styles.toggleButtonActive : ''}`}
                    onClick={() => setIsEditing(!isEditing)}
                >
                    {isEditing ? 'Modo Edición' : 'Editar'}
                </button>
            </div>

            {isEditing && (
                <div className={styles.editorContainer}>
                    {/* Nombre del sistema */}
                    <input
                        type="text"
                        className={styles.nameInput}
                        value={systemName}
                        onChange={(e) => setSystemName(e.target.value)}
                        placeholder="Nombre del sistema"
                    />

                    {/* Variables y Ecuaciones */}
                    <div className={styles.subsectionTitle}>Ecuaciones Diferenciales</div>
                    <div className={styles.equationsList}>
                        {variables.map((variable, index) => (
                            <div key={index}>
                                <div className={styles.equationRow}>
                                    <span className={styles.equationPrefix}>
                                        d
                                        <input
                                            type="text"
                                            value={variable.name}
                                            onChange={(e) => handleVariableNameChange(index, e.target.value)}
                                            style={{
                                                width: '20px',
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'var(--accent-primary)',
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: 'inherit',
                                                padding: 0
                                            }}
                                        />
                                        /dt =
                                    </span>
                                    <input
                                        type="text"
                                        className={`${styles.equationInput} ${variable.error ? styles.equationInputError : ''}`}
                                        value={variable.expression}
                                        onChange={(e) => handleExpressionChange(index, e.target.value)}
                                        placeholder={`Expresión para ${variable.name}' (ej: sigma*(y - x))`}
                                    />
                                    {variables.length > 1 && (
                                        <button
                                            className={styles.removeButton}
                                            onClick={() => handleRemoveVariable(index)}
                                            title="Eliminar variable"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                                {variable.error && (
                                    <div className={styles.errorMessage} style={{ marginTop: '4px', marginLeft: '68px' }}>
                                        {variable.error}
                                    </div>
                                )}
                            </div>
                        ))}
                        <button className={styles.addButton} onClick={handleAddVariable}>
                            + Agregar Variable
                        </button>
                    </div>

                    {/* Parámetros */}
                    <div className={styles.subsectionTitle}>Parámetros</div>
                    <div className={styles.parametersGrid}>
                        {parameters.map((param, index) => (
                            <div key={index} className={styles.parameterRow}>
                                <input
                                    type="text"
                                    className={styles.parameterNameInput}
                                    value={param.name}
                                    onChange={(e) => handleParameterNameChange(index, e.target.value)}
                                />
                                <span style={{ color: 'var(--text-muted)' }}>=</span>
                                <input
                                    type="number"
                                    step="0.1"
                                    className={styles.parameterValueInput}
                                    value={param.value}
                                    onChange={(e) => handleParameterValueChange(index, e.target.value)}
                                />
                                <button
                                    className={styles.removeButton}
                                    onClick={() => handleRemoveParameter(index)}
                                    title="Eliminar parámetro"
                                    style={{ width: '24px', height: '24px' }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                    <button className={styles.addButton} onClick={handleAddParameter}>
                        + Agregar Parámetro
                    </button>

                    {/* Mensajes de error/éxito */}
                    {globalError && <div className={styles.errorMessage}>{globalError}</div>}
                    {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

                    {/* Botones de acción */}
                    <div className={styles.buttonRow}>
                        <button
                            className={styles.applyButton}
                            onClick={validateAndApply}
                        >
                            ▶ Aplicar Sistema
                        </button>
                        <button
                            className={styles.saveButton}
                            onClick={handleSaveSystem}
                        >
                            💾 Guardar
                        </button>
                    </div>

                    {/* Sistemas guardados */}
                    {savedSystems.length > 0 && (
                        <div className={styles.savedSystemsList}>
                            <div className={styles.subsectionTitle}>Sistemas Guardados</div>
                            {savedSystems.map(system => (
                                <div
                                    key={system.id}
                                    className={styles.savedSystemItem}
                                    onClick={() => handleLoadSavedSystem(system)}
                                >
                                    <span className={styles.savedSystemName}>{system.name}</span>
                                    <div className={styles.savedSystemActions}>
                                        <button
                                            className={styles.deleteButton}
                                            onClick={(e) => handleDeleteSavedSystem(e, system.id)}
                                            title="Eliminar"
                                        >
                                            🗑
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
