import { ReactNode } from 'react';
import './StarBorder.css';

interface StarBorderProps {
    children: ReactNode;
    className?: string;
    color?: string;
    speed?: string;
}

export function StarBorder({
    children,
    className = '',
    color = '#00d9ff',
    speed = '6s'
}: StarBorderProps) {
    return (
        <div className={`star-border ${className}`} style={{ '--star-color': color, '--star-speed': speed } as React.CSSProperties}>
            <div className="star-border-inner">
                {children}
            </div>
            <div className="star-border-glow" />
        </div>
    );
}
