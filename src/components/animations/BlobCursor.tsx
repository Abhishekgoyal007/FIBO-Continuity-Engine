import { useEffect, useRef } from 'react';
import './BlobCursor.css';

interface BlobCursorProps {
    color?: string;
    size?: number;
}

export function BlobCursor({ color = '#00d9ff', size = 30 }: BlobCursorProps) {
    const blobRef = useRef<HTMLDivElement>(null);
    const positionRef = useRef({ x: 0, y: 0 });
    const targetRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            targetRef.current = { x: e.clientX, y: e.clientY };
        };

        const animate = () => {
            if (!blobRef.current) return;

            // Smooth interpolation
            positionRef.current.x += (targetRef.current.x - positionRef.current.x) * 0.15;
            positionRef.current.y += (targetRef.current.y - positionRef.current.y) * 0.15;

            blobRef.current.style.transform = `translate(${positionRef.current.x - size / 2}px, ${positionRef.current.y - size / 2}px)`;

            requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', handleMouseMove);
        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [size]);

    return (
        <div
            ref={blobRef}
            className="blob-cursor"
            style={{
                width: size,
                height: size,
                background: color,
                boxShadow: `0 0 ${size}px ${color}, 0 0 ${size * 2}px ${color}`
            }}
        />
    );
}
