import { useState, ReactNode } from 'react';
import styles from './Expander.module.css';

interface ExpanderProps {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
    icon?: string;
    className?: string;
    isOpen?: boolean;
    onToggle?: (isOpen: boolean) => void;
}

export default function Expander({
    title,
    children,
    defaultOpen = false,
    icon,
    className = '',
    isOpen: controlledIsOpen,
    onToggle
}: ExpanderProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);

    const isExpanded = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

    const handleToggle = () => {
        const newState = !isExpanded;
        if (onToggle) {
            onToggle(newState);
        }
        if (controlledIsOpen === undefined) {
            setInternalIsOpen(newState);
        }
    };

    return (
        <div className={`${styles.expander} ${className}`}>
            <button
                className={styles.header}
                onClick={handleToggle}
                aria-expanded={isExpanded}
            >
                <div className={styles.titleContainer}>
                    {icon && <span className={styles.icon}>{icon}</span>}
                    <span className={styles.title}>{title}</span>
                </div>
                <span className={`${styles.caret} ${isExpanded ? styles.caretOpen : ''}`}>
                    ▼
                </span>
            </button>

            <div
                className={`${styles.content} ${isExpanded ? styles.contentOpen : ''}`}
                aria-hidden={!isExpanded}
            >
                <div className={styles.innerContent}>
                    {children}
                </div>
            </div>
        </div>
    );
}
