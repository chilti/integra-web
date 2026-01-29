import { memo } from 'react';
import styles from './HelpPanel.module.css';

interface HelpPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

function HelpPanel({ isOpen, onClose }: HelpPanelProps) {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.panel} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h1>📖 Guía Rápida</h1>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <div className={styles.content}>
                    <section className={styles.section}>
                        <h2>🚀 Inicio Rápido</h2>
                        <ol>
                            <li>Selecciona un sistema de la <strong>Biblioteca</strong> o crea uno personalizado</li>
                            <li>Ajusta las <strong>condiciones iniciales</strong> y <strong>parámetros</strong></li>
                            <li>Configura el <strong>método numérico</strong> y paso de tiempo</li>
                            <li>Presiona <strong>▶ Ejecutar</strong> para simular</li>
                        </ol>
                    </section>

                    <section className={styles.section}>
                        <h2>📊 Visualizaciones</h2>
                        <div className={styles.featureGrid}>
                            <div className={styles.feature}>
                                <span className={styles.icon}>🌀</span>
                                <h3>Espacio de Fases</h3>
                                <p>Visualiza trayectorias en 2D o 3D. Arrastra para rotar, scroll para zoom.</p>
                            </div>
                            <div className={styles.feature}>
                                <span className={styles.icon}>📈</span>
                                <h3>Series Temporales</h3>
                                <p>Gráficas de cada variable vs tiempo. Hover para ver valores.</p>
                            </div>
                            <div className={styles.feature}>
                                <span className={styles.icon}>🧭</span>
                                <h3>Campo Vectorial</h3>
                                <p>Muestra la dirección del flujo en cada punto del espacio (solo 2D).</p>
                            </div>
                        </div>
                    </section>

                    <section className={styles.section}>
                        <h2>⚙️ Métodos Numéricos</h2>
                        <table className={styles.methodsTable}>
                            <thead>
                                <tr>
                                    <th>Método</th>
                                    <th>Orden</th>
                                    <th>Uso recomendado</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Euler</td>
                                    <td>1°</td>
                                    <td>Visualización rápida, sistemas simples</td>
                                </tr>
                                <tr>
                                    <td>Runge-Kutta 4</td>
                                    <td>4°</td>
                                    <td>Uso general, buen balance precisión/velocidad</td>
                                </tr>
                                <tr>
                                    <td>RKF45</td>
                                    <td>4°/5°</td>
                                    <td>Paso adaptativo, máxima precisión</td>
                                </tr>
                                <tr>
                                    <td>Adams-Bashforth</td>
                                    <td>4°</td>
                                    <td>Eficiente para integraciones largas</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    <section className={styles.section}>
                        <h2>📁 Exportación</h2>
                        <ul>
                            <li><strong>PNG/SVG</strong> - Imágenes de los gráficos</li>
                            <li><strong>CSV</strong> - Datos de la simulación</li>
                            <li><strong>JSON</strong> - Configuración del sistema</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>⌨️ Atajos</h2>
                        <div className={styles.shortcuts}>
                            <div className={styles.shortcut}>
                                <kbd>Scroll</kbd>
                                <span>Zoom en gráficos</span>
                            </div>
                            <div className={styles.shortcut}>
                                <kbd>Arrastrar</kbd>
                                <span>Rotar vista 3D</span>
                            </div>
                            <div className={styles.shortcut}>
                                <kbd>Doble clic</kbd>
                                <span>Reset zoom</span>
                            </div>
                        </div>
                    </section>

                    <section className={styles.section}>
                        <h2>💡 Tips</h2>
                        <ul>
                            <li>Usa <strong>ceroclinas</strong> para encontrar puntos de equilibrio</li>
                            <li>Reduce <strong>dt</strong> si la simulación diverge</li>
                            <li>El campo vectorial solo está disponible para sistemas 2D</li>
                            <li>Los paneles de gráficos son redimensionables</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default memo(HelpPanel);
