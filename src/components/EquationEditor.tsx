import styles from './EquationEditor.module.css';
import type { DifferentialEquation } from '../types/equations';

interface EquationEditorProps {
    equation: DifferentialEquation | null;
    onChange: (equation: DifferentialEquation) => void;
}

export default function EquationEditor({ equation, onChange }: EquationEditorProps) {
    const handleParameterChange = (paramName: string, value: string) => {
        if (!equation) return;

        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;

        const updatedEquation: DifferentialEquation = {
            ...equation,
            parameters: {
                ...equation.parameters,
                [paramName]: numValue
            }
        };

        onChange(updatedEquation);
    };

    if (!equation) {
        return (
            <div className={styles.equationEditor}>
                <h3 className={styles.sectionTitle}>✏️ Editor de Ecuaciones</h3>
                <div className={styles.emptyState}>
                    Selecciona un sistema de ejemplo para comenzar
                </div>
            </div>
        );
    }

    return (
        <div className={styles.equationEditor}>
            <h3 className={styles.sectionTitle}>✏️ Editor de Ecuaciones</h3>

            <div className={styles.systemInfo}>
                <div className={styles.systemName}>{equation.name}</div>
                {equation.description && (
                    <div className={styles.systemDescription}>{equation.description}</div>
                )}
            </div>

            <div className={styles.equationsList}>
                {equation.equations.map((eq, index) => (
                    <div key={index} className={styles.equationItem}>
                        {eq}
                    </div>
                ))}
            </div>

            {Object.keys(equation.parameters).length > 0 && (
                <div className={styles.parametersSection}>
                    <h4 className={styles.sectionTitle}>Parámetros</h4>
                    <div className={styles.parametersGrid}>
                        {Object.entries(equation.parameters).map(([name, value]) => (
                            <div key={name} className={styles.parameterItem}>
                                <label className={styles.parameterLabel}>{name}</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={value}
                                    onChange={(e) => handleParameterChange(name, e.target.value)}
                                    className={styles.parameterInput}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
