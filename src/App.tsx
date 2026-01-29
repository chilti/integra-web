import { useState, useCallback } from 'react';
import styles from './App.module.css';
import ControlPanel from './components/ControlPanel';
import SystemLibrary from './components/SystemLibrary';
import CustomEquationEditor from './components/CustomEquationEditor';
import PhaseSpacePlot from './components/PhaseSpacePlot';
import TimeSeriesPlot from './components/TimeSeriesPlot';
import VectorFieldPlot from './components/VectorFieldPlot';
import ExportPanel from './components/ExportPanel';
import AboutModal from './components/AboutModal';
import HelpPanel from './components/HelpPanel';
import type { SystemState, DifferentialEquation, InitialConditions, SolverConfig } from './types/equations';
import { NumericalMethod } from './types/equations';
import { integrate } from './solvers';

function App() {

    const [systemState, setSystemState] = useState<SystemState>({
        equation: null,
        initialConditions: {
            values: [1, 1, 1],
            time: 0
        },
        solverConfig: {
            method: NumericalMethod.RK4,
            dt: 0.01,
            tEnd: 50,
            maxSteps: 100000
        },
        result: null,
        isRunning: false,
        error: null
    });

    const [showHelp, setShowHelp] = useState(false);
    const [showAbout, setShowAbout] = useState(false);

    const handleEquationChange = useCallback((equation: DifferentialEquation) => {
        setSystemState(prev => ({
            ...prev,
            equation,
            error: null,
            // Ajustar condiciones iniciales si cambia el número de variables
            initialConditions: {
                ...prev.initialConditions,
                values: equation.variables.map((_, i) => prev.initialConditions.values[i] || 1)
            }
        }));
    }, []);

    const handleInitialConditionsChange = useCallback((ic: InitialConditions) => {
        setSystemState(prev => ({ ...prev, initialConditions: ic }));
    }, []);

    const handleSolverConfigChange = useCallback((config: Partial<SolverConfig>) => {
        setSystemState(prev => ({
            ...prev,
            solverConfig: { ...prev.solverConfig, ...config }
        }));
    }, []);

    const handleRun = () => {
        if (!systemState.equation) {
            setSystemState(prev => ({ ...prev, error: 'No hay ecuación definida' }));
            return;
        }

        setSystemState(prev => ({ ...prev, isRunning: true, error: null }));

        try {
            const result = integrate(
                systemState.initialConditions.values,
                systemState.initialConditions.time,
                systemState.equation.derivatives,
                systemState.equation.parameters,
                systemState.solverConfig
            );

            setSystemState(prev => ({
                ...prev,
                result,
                isRunning: false,
                error: result.success ? null : result.message || 'Error en la integración'
            }));
        } catch (error) {
            setSystemState(prev => ({
                ...prev,
                isRunning: false,
                error: `Error: ${error}`
            }));
        }
    };

    const handleReset = () => {
        setSystemState(prev => ({
            ...prev,
            result: null,
            error: null
        }));
    };

    return (
        <div className={styles.app}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.logoContainer}>
                        <span className={styles.logoIcon}>∫</span>
                        <h1 className={styles.logo}>INTEGRA</h1>
                    </div>
                    <span className={styles.subtitle}>Análisis de Sistemas Dinámicos</span>
                </div>
                <div className={styles.headerRight}>
                    <button className={styles.iconButton} title="Ayuda" data-tooltip="Ayuda" onClick={() => setShowHelp(true)}>
                        ❓
                    </button>
                    <button className={styles.iconButton} title="Acerca de" data-tooltip="Info" onClick={() => setShowAbout(true)}>
                        ℹ️
                    </button>
                </div>
            </header>

            {/* Modals */}
            <HelpPanel isOpen={showHelp} onClose={() => setShowHelp(false)} />
            <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />

            {/* Main Content */}
            <div className={styles.mainContent}>
                {/* Left Panel - Definition */}
                <div className={styles.leftPanel}>
                    <div className={styles.panelHeader}>
                        <h2>📐 Definición del Sistema</h2>
                    </div>
                    <div className={styles.panelContent}>
                        <SystemLibrary onSelectSystem={handleEquationChange} />

                        <CustomEquationEditor
                            currentEquation={systemState.equation}
                            onEquationChange={handleEquationChange}
                        />


                        <ControlPanel
                            equation={systemState.equation}
                            initialConditions={systemState.initialConditions}
                            solverConfig={systemState.solverConfig}
                            isRunning={systemState.isRunning}
                            onInitialConditionsChange={handleInitialConditionsChange}
                            onSolverConfigChange={handleSolverConfigChange}
                            onRun={handleRun}
                            onReset={handleReset}
                        />

                        <ExportPanel
                            equation={systemState.equation}
                            result={systemState.result}
                            initialConditions={systemState.initialConditions.values}
                            config={systemState.solverConfig}
                        />

                        {systemState.error && (
                            <div style={{
                                marginTop: 'var(--spacing-md)',
                                padding: 'var(--spacing-md)',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid var(--error)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--error)'
                            }}>
                                {systemState.error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Visualization */}
                <div className={styles.rightPanel}>
                    <div className={styles.visualizationGrid}>
                        <div className={styles.plotContainer}>
                            <div className={styles.plotHeader}>
                                <h3 className={styles.plotTitle}>🌀 Espacio de Fases</h3>
                            </div>
                            <div className={styles.plotContent}>
                                <PhaseSpacePlot
                                    result={systemState.result}
                                    equation={systemState.equation}
                                    onSelectInitialCondition={(values: number[]) => {
                                        handleInitialConditionsChange({
                                            ...systemState.initialConditions,
                                            values
                                        });
                                    }}
                                />
                            </div>
                        </div>

                        <div className={styles.plotContainer}>
                            <div className={styles.plotHeader}>
                                <h3 className={styles.plotTitle}>📈 Series Temporales</h3>
                            </div>
                            <div className={styles.plotContent}>
                                <TimeSeriesPlot
                                    result={systemState.result}
                                    equation={systemState.equation}
                                />
                            </div>
                        </div>

                        <div className={styles.plotContainer}>
                            <VectorFieldPlot
                                equation={systemState.equation}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
