import { useState } from 'react';
import styles from './SystemLibrary.module.css';
import { EXAMPLE_SYSTEMS, CATEGORIES } from '../data/exampleSystems';
import { parseSystem } from '../utils/equationParser';
import type { DifferentialEquation } from '../types/equations';

interface SystemLibraryProps {
    onSelectSystem: (equation: DifferentialEquation) => void;
}

export default function SystemLibrary({ onSelectSystem }: SystemLibraryProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const handleSelectSystem = (systemId: string) => {
        const system = EXAMPLE_SYSTEMS.find(s => s.id === systemId);
        if (!system) return;

        try {
            const { variables, derivatives } = parseSystem(system.equations);

            const equation: DifferentialEquation = {
                id: system.id,
                name: system.name,
                description: system.description,
                variables,
                parameters: system.parameters,
                equations: system.equations,
                derivatives
            };

            onSelectSystem(equation);
        } catch (error) {
            console.error('Error al cargar sistema:', error);
        }
    };

    const filteredSystems = selectedCategory
        ? EXAMPLE_SYSTEMS.filter(s => s.category === selectedCategory)
        : EXAMPLE_SYSTEMS;

    return (
        <div className={styles.systemLibrary}>
            <h3 className={styles.sectionTitle}>📚 Sistemas de Ejemplo</h3>

            {/* Category filter tabs */}
            <div className={styles.categoryTabs}>
                <button
                    className={`${styles.categoryTab} ${!selectedCategory ? styles.active : ''}`}
                    onClick={() => setSelectedCategory(null)}
                >
                    Todos ({EXAMPLE_SYSTEMS.length})
                </button>
                {CATEGORIES.map(cat => {
                    const count = EXAMPLE_SYSTEMS.filter(s => s.category === cat.id).length;
                    if (count === 0) return null;
                    return (
                        <button
                            key={cat.id}
                            className={`${styles.categoryTab} ${selectedCategory === cat.id ? styles.active : ''}`}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            {cat.icon} {cat.name} ({count})
                        </button>
                    );
                })}
            </div>

            <div className={styles.systemsGrid}>
                {filteredSystems.map(system => {
                    const category = CATEGORIES.find(c => c.id === system.category);
                    return (
                        <div
                            key={system.id}
                            className={styles.systemCard}
                            onClick={() => handleSelectSystem(system.id)}
                        >
                            <div className={styles.systemCardHeader}>
                                <span className={styles.systemIcon}>{category?.icon || '📊'}</span>
                                <span className={styles.systemName}>{system.name}</span>
                            </div>
                            <p className={styles.systemDescription}>{system.description}</p>
                            <div className={styles.systemVars}>
                                {system.variables.slice(0, 3).join(', ')}
                                {system.variables.length > 3 && '...'}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
