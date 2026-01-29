import styles from './ControlPanel.module.css';
import type { DifferentialEquation, InitialConditions, SolverConfig } from '../types/equations';
import { NumericalMethod } from '../types/equations';
import { SOLVER_INFO } from '../solvers';

interface ControlPanelProps {
    equation: DifferentialEquation | null;
    initialConditions: InitialConditions;
    solverConfig: SolverConfig;
    isRunning: boolean;
    onInitialConditionsChange: (ic: InitialConditions) => void;
    onSolverConfigChange: (config: Partial<SolverConfig>) => void;
    onRun: () => void;
    onReset: () => void;
}

export default function ControlPanel({
    equation,
    initialConditions,
    solverConfig,
    isRunning,
    onInitialConditionsChange,
    onSolverConfigChange,
    onRun,
    onReset
}: ControlPanelProps) {
    const handleInitialConditionChange = (index: number, value: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;

        const newValues = [...initialConditions.values];
        newValues[index] = numValue;

        onInitialConditionsChange({
            ...initialConditions,
            values: newValues
        });
    };

    return (
        <div className={styles.controlPanel}>
            {/* Initial Conditions */}
            <div className={styles.controlGroup}>
                <h3 className={styles.sectionTitle}>🎯 Condiciones Iniciales</h3>
                <div className={styles.initialConditionsGrid}>
                    {equation?.variables.map((variable, index) => (
                        <div key={variable} className={styles.inputGroup}>
                            <label className={styles.inputLabel}>{variable}₀</label>
                            <input
                                type="number"
                                step="0.1"
                                value={initialConditions.values[index] || 0}
                                onChange={(e) => handleInitialConditionChange(index, e.target.value)}
                                className={styles.inputField}
                            />
                        </div>
                    )) || (
                            <div style={{ gridColumn: '1 / -1', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                Selecciona un sistema para definir condiciones iniciales
                            </div>
                        )}
                </div>
            </div>

            {/* Solver Configuration */}
            <div className={styles.controlGroup}>
                <h3 className={styles.sectionTitle}>⚙️ Configuración del Solver</h3>
                <div className={styles.solverConfigGrid}>
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Método</label>
                        <select
                            value={solverConfig.method}
                            onChange={(e) => onSolverConfigChange({ method: e.target.value as NumericalMethod })}
                            className={styles.selectField}
                        >
                            {Object.values(NumericalMethod).map(method => (
                                <option key={method} value={method}>
                                    {SOLVER_INFO[method].name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Paso (dt)</label>
                        <input
                            type="number"
                            step="0.001"
                            min="0.001"
                            value={solverConfig.dt}
                            onChange={(e) => onSolverConfigChange({ dt: parseFloat(e.target.value) })}
                            className={styles.inputField}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Tiempo inicial</label>
                        <input
                            type="number"
                            step="0.1"
                            value={initialConditions.time}
                            onChange={(e) => onInitialConditionsChange({ ...initialConditions, time: parseFloat(e.target.value) })}
                            className={styles.inputField}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Tiempo final</label>
                        <input
                            type="number"
                            step="1"
                            min="0.1"
                            value={solverConfig.tEnd}
                            onChange={(e) => onSolverConfigChange({ tEnd: parseFloat(e.target.value) })}
                            className={styles.inputField}
                        />
                    </div>
                </div>

                {/* Opciones avanzadas para RKF45 */}
                {solverConfig.method === NumericalMethod.RKF45 && (
                    <div className={styles.adaptiveOptions}>
                        <h4 className={styles.subsectionTitle}>Opciones Adaptativas</h4>
                        <div className={styles.solverConfigGrid}>
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>Tolerancia</label>
                                <select
                                    value={solverConfig.tolerance || 1e-6}
                                    onChange={(e) => onSolverConfigChange({ tolerance: parseFloat(e.target.value) })}
                                    className={styles.selectField}
                                >
                                    <option value={1e-4}>1e-4 (Baja)</option>
                                    <option value={1e-5}>1e-5 (Media)</option>
                                    <option value={1e-6}>1e-6 (Alta)</option>
                                    <option value={1e-8}>1e-8 (Muy alta)</option>
                                    <option value={1e-10}>1e-10 (Máxima)</option>
                                </select>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>Paso mínimo</label>
                                <select
                                    value={solverConfig.minStep || 1e-10}
                                    onChange={(e) => onSolverConfigChange({ minStep: parseFloat(e.target.value) })}
                                    className={styles.selectField}
                                >
                                    <option value={1e-6}>1e-6</option>
                                    <option value={1e-8}>1e-8</option>
                                    <option value={1e-10}>1e-10</option>
                                    <option value={1e-12}>1e-12</option>
                                </select>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>Paso máximo</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0.01"
                                    max="10"
                                    value={solverConfig.maxStep || 1.0}
                                    onChange={(e) => onSolverConfigChange({ maxStep: parseFloat(e.target.value) })}
                                    className={styles.inputField}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>


            {/* Control Buttons */}
            <div className={styles.buttonGroup}>
                <button
                    onClick={onRun}
                    disabled={!equation || isRunning}
                    className={`${styles.button} ${styles.buttonPrimary}`}
                >
                    <span className={styles.buttonIcon}>▶</span>
                    {isRunning ? 'Ejecutando...' : 'Ejecutar'}
                </button>
                <button
                    onClick={onReset}
                    disabled={isRunning}
                    className={`${styles.button} ${styles.buttonSecondary}`}
                >
                    <span className={styles.buttonIcon}>↻</span>
                    Reiniciar
                </button>
            </div>
        </div>
    );
}
