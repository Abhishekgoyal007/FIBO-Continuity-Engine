import type { ReactNode } from 'react';
import './ScrollStack.css';

interface ScrollStackItemProps {
    children: ReactNode;
    itemClassName?: string;
}

interface ScrollStackProps {
    children: ReactNode;
    className?: string;
}

export const ScrollStackItem = ({ children, itemClassName = '' }: ScrollStackItemProps) => (
    <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

export function ScrollStack({
    children,
    className = ''
}: ScrollStackProps) {
    return (
        <div className={`scroll-stack-scroller ${className}`.trim()}>
            <div className="scroll-stack-inner">
                {children}
            </div>
        </div>
    );
}
