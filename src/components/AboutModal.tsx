import { memo } from 'react';
import styles from './AboutModal.module.css';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

function AboutModal({ isOpen, onClose }: AboutModalProps) {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>×</button>

                <div className={styles.header}>
                    <span className={styles.logoIcon}>∫</span>
                    <h1 className={styles.title}>INTEGRA Web</h1>
                    <span className={styles.version}>v2.0</span>
                </div>

                <div className={styles.content}>
                    <section className={styles.section}>
                        <h2>Acerca de INTEGRA</h2>
                        <p>
                            INTEGRA es un sistema de software para analizar visual e interactivamente
                            el comportamiento de los sistemas dinámicos modelados por ecuaciones
                            diferenciales ordinarias o en diferencias.
                        </p>
                        <p>
                            El sistema usa su propia biblioteca de métodos numéricos para resolver
                            estas ecuaciones diferenciales. Mediante la integración numérica, INTEGRA
                            permite hacer simulaciones de la dinámica de estos sistemas.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>Visualización</h2>
                        <ul>
                            <li>Evoluciones del sistema en el espacio de estados (2D/3D)</li>
                            <li>Cursos temporales de las variables de estado</li>
                            <li>Campo vectorial para sistemas bidimensionales</li>
                            <li>Ceroclinas (nullclines) para análisis cualitativo</li>
                            <li>Selección interactiva de condiciones iniciales</li>
                            <li>Rotaciones de ejes coordenados para diferentes perspectivas</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>Autores Originales (INTEGRA C++)</h2>
                        <ul className={styles.authorList}>
                            <li>Humberto Carrillo Calvet</li>
                            <li>Antonio Carrillo Ledesma</li>
                            <li>† Luis Alonso Nava Fernandez</li>
                        </ul>
                        <a
                            href="https://www.dynamics.unam.mx/DinamicaNoLineal4/php/tecnologia/integra.php"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.link}
                        >
                            🔗 Sitio web original
                        </a>
                    </section>

                    <section className={styles.section}>
                        <h2>INTEGRA Web</h2>
                        <p className={styles.newVersion}>
                            Esta versión web ha sido desarrollada por:
                        </p>
                        <ul className={styles.authorList}>
                            <li><strong>José Luis Jiménez Andrade</strong></li>
                            <li>Claude (Anthropic AI)</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>Tecnologías</h2>
                        <div className={styles.techStack}>
                            <span className={styles.tech}>React</span>
                            <span className={styles.tech}>TypeScript</span>
                            <span className={styles.tech}>Plotly.js</span>
                            <span className={styles.tech}>Vite</span>
                        </div>
                    </section>
                </div>

                <div className={styles.footer}>
                    <p>© 2026 - UNAM / Dinámica No Lineal</p>
                </div>
            </div>
        </div>
    );
}

export default memo(AboutModal);
