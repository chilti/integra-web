import { useState } from 'react';
import styles from './ExportPanel.module.css';
import {
    exportPlotAsPNG,
    exportPlotAsSVG,
    exportResultsAsCSV,
    exportSystemAsJSON,
    exportDataAsJSON
} from '../utils/exportUtils';
import type { SimulationResult, DifferentialEquation, SolverConfig } from '../types/equations';

interface ExportPanelProps {
    equation: DifferentialEquation | null;
    result: SimulationResult | null;
    initialConditions: number[];
    config: SolverConfig;
}

export default function ExportPanel({ equation, result, initialConditions, config }: ExportPanelProps) {
    const [exporting, setExporting] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const showMessage = (msg: string) => {
        setMessage(msg);
        setTimeout(() => setMessage(null), 3000);
    };

    const handleExportImage = async (format: 'png' | 'svg') => {
        setExporting(format);
        try {
            // Buscar los contenedores de gráficos Plotly
            const phaseSpacePlot = document.querySelector('.js-plotly-plot') as HTMLElement;
            if (!phaseSpacePlot) {
                showMessage('No hay gráfica para exportar');
                return;
            }

            const filename = `${equation?.name || 'plot'}_${new Date().toISOString().slice(0, 10)}`;

            if (format === 'png') {
                await exportPlotAsPNG(phaseSpacePlot, filename);
            } else {
                await exportPlotAsSVG(phaseSpacePlot, filename);
            }
            showMessage(`Imagen ${format.toUpperCase()} exportada`);
        } catch (error) {
            console.error('Error al exportar imagen:', error);
            showMessage('Error al exportar imagen');
        } finally {
            setExporting(null);
        }
    };

    const handleExportCSV = () => {
        if (!result || !equation) {
            showMessage('No hay datos para exportar');
            return;
        }
        setExporting('csv');
        try {
            const filename = `${equation.name}_data_${new Date().toISOString().slice(0, 10)}`;
            exportResultsAsCSV(result, equation.variables, filename);
            showMessage('Datos CSV exportados');
        } catch (error) {
            console.error('Error al exportar CSV:', error);
            showMessage('Error al exportar CSV');
        } finally {
            setExporting(null);
        }
    };

    const handleExportJSON = (type: 'data' | 'config') => {
        if (!equation) {
            showMessage('No hay sistema para exportar');
            return;
        }
        setExporting(`json-${type}`);
        try {
            const filename = `${equation.name}_${type}_${new Date().toISOString().slice(0, 10)}`;
            if (type === 'config') {
                exportSystemAsJSON(equation, initialConditions, config, result || undefined, filename);
                showMessage('Configuración exportada');
            } else if (result) {
                exportDataAsJSON(result, equation.variables, filename);
                showMessage('Datos JSON exportados');
            } else {
                showMessage('No hay datos para exportar');
            }
        } catch (error) {
            console.error('Error al exportar JSON:', error);
            showMessage('Error al exportar');
        } finally {
            setExporting(null);
        }
    };

    const hasData = result && result.t.length > 0;

    return (
        <div className={styles.exportPanel}>
            <h3 className={styles.sectionTitle}>📤 Exportar</h3>

            {message && (
                <div className={styles.message}>{message}</div>
            )}

            <div className={styles.exportSection}>
                <span className={styles.sectionLabel}>Imágenes</span>
                <div className={styles.buttonGroup}>
                    <button
                        className={styles.exportButton}
                        onClick={() => handleExportImage('png')}
                        disabled={exporting !== null}
                        title="Exportar como PNG"
                    >
                        {exporting === 'png' ? '...' : '🖼️ PNG'}
                    </button>
                    <button
                        className={styles.exportButton}
                        onClick={() => handleExportImage('svg')}
                        disabled={exporting !== null}
                        title="Exportar como SVG"
                    >
                        {exporting === 'svg' ? '...' : '📐 SVG'}
                    </button>
                </div>
            </div>

            <div className={styles.exportSection}>
                <span className={styles.sectionLabel}>Datos</span>
                <div className={styles.buttonGroup}>
                    <button
                        className={styles.exportButton}
                        onClick={handleExportCSV}
                        disabled={!hasData || exporting !== null}
                        title="Exportar datos como CSV"
                    >
                        {exporting === 'csv' ? '...' : '📊 CSV'}
                    </button>
                    <button
                        className={styles.exportButton}
                        onClick={() => handleExportJSON('data')}
                        disabled={!hasData || exporting !== null}
                        title="Exportar datos como JSON"
                    >
                        {exporting === 'json-data' ? '...' : '📋 JSON'}
                    </button>
                </div>
            </div>

            <div className={styles.exportSection}>
                <span className={styles.sectionLabel}>Sistema</span>
                <div className={styles.buttonGroup}>
                    <button
                        className={`${styles.exportButton} ${styles.fullWidth}`}
                        onClick={() => handleExportJSON('config')}
                        disabled={!equation || exporting !== null}
                        title="Exportar configuración del sistema"
                    >
                        {exporting === 'json-config' ? '...' : '⚙️ Guardar Sistema'}
                    </button>
                </div>
            </div>

            {hasData && (
                <div className={styles.dataInfo}>
                    <span>{result.t.length} puntos de datos</span>
                </div>
            )}
        </div>
    );
}
