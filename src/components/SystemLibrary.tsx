import { useState, useEffect } from 'react';
import styles from './SystemLibrary.module.css';
import Expander from './common/Expander';
import { EXAMPLE_SYSTEMS, CATEGORIES } from '../data/exampleSystems';
import { parseSystem } from '../utils/equationParser';
import type { DifferentialEquation } from '../types/equations';

interface SystemLibraryProps {
    currentSystemId: string | null;
    onSelectSystem: (equation: DifferentialEquation) => void;
    equation: DifferentialEquation | null;
    isRunning: boolean;
    onRun: () => void;
    onReset: () => void;
}

export default function SystemLibrary({
    currentSystemId,
    onSelectSystem,
    equation,
    isRunning,
    onRun,
    onReset
}: SystemLibraryProps) {
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    // Removed local currentSystemId state since it's now a prop

    // Initial system load (optional, to sync UI)
    useEffect(() => {
        // Just to ensure we have a "current" system to show in summary
        // In a real app this might come from props if App manages state
    }, []);

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
            onReset(); // Reset simulation/graphics on new system selection
            // setCurrentSystemId(system.id); // Controlled by parent
            setIsGalleryOpen(false); // Close gallery expander on selection
        } catch (error) {
            console.error('Error al cargar sistema:', error);
        }
    };

    const filteredSystems = selectedCategory
        ? EXAMPLE_SYSTEMS.filter(s => s.category === selectedCategory)
        : EXAMPLE_SYSTEMS;

    const currentSystem = EXAMPLE_SYSTEMS.find(s => s.id === currentSystemId);

    return (
        <>
            {/* Compact View inside Panel */}
            <div className={styles.summaryContainer}>
                {currentSystem ? (
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryHeader}>
                            <h3 className={styles.summaryTitle}>{currentSystem.name}</h3>
                            <span className={styles.summaryCategory}>
                                {CATEGORIES.find(c => c.id === currentSystem.category)?.name}
                            </span>
                        </div>
                        <p className={styles.summaryDescription}>{currentSystem.description}</p>
                    </div>
                ) : (
                    <div className={styles.summaryCard}>
                        <p className={styles.summaryDescription}>Selecciona un sistema para comenzar.</p>
                    </div>
                )}
            </div>

            <div className={styles.buttonGroup}>
                <button
                    className={styles.buttonPrimary}
                    onClick={onRun}
                    disabled={!equation || isRunning}
                    title="Ejecutar simulación"
                >
                    <span className={styles.buttonIcon}>{isRunning ? '⏳' : '▶'}</span>
                    {isRunning ? 'Calculando...' : 'Ejecutar'}
                </button>
                <button
                    className={styles.buttonSecondary}
                    onClick={onReset}
                    disabled={!equation}
                    title="Reiniciar simulación"
                >
                    <span className={styles.buttonIcon}>↺</span>
                    Reiniciar
                </button>
            </div>

            <Expander
                title="Galería de Sistemas"
                icon="📚"
                defaultOpen={false}
                className={styles.systemLibrary}
                isOpen={isGalleryOpen}
                onToggle={setIsGalleryOpen}
            >
                <div className={styles.summaryContainer}>
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
            </Expander>
        </>
    );
}
