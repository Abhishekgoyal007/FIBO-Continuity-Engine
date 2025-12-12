import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MoveHorizontal } from 'lucide-react';
import './ComparisonSlider.css';

interface ComparisonSliderProps {
    beforeImage: string;
    afterImage: string;
    beforeLabel?: string;
    afterLabel?: string;
}

export function ComparisonSlider({
    beforeImage,
    afterImage,
    beforeLabel = 'Random AI',
    afterLabel = 'FIBO Consistent'
}: ComparisonSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = () => {
        setIsDragging(true);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        setSliderPosition(Math.min(Math.max(percentage, 0), 100));
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        setSliderPosition(Math.min(Math.max(percentage, 0), 100));
    };

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    return (
        <div
            ref={containerRef}
            className="comparison-slider"
            onTouchMove={(e) => handleTouchMove(e.nativeEvent)}
        >
            {/* Before Image (Random) */}
            <div className="comparison-before">
                <img src={beforeImage} alt="Before" />
                <div className="comparison-label before">
                    <span>{beforeLabel}</span>
                </div>
            </div>

            {/* After Image (Consistent) */}
            <div
                className="comparison-after"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                <img src={afterImage} alt="After" />
                <div className="comparison-label after">
                    <span>{afterLabel}</span>
                </div>
            </div>

            {/* Slider Handle */}
            <motion.div
                className="comparison-handle"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <div className="handle-line" />
                <div className="handle-knob">
                    <MoveHorizontal size={16} />
                </div>
                <div className="handle-line" />
            </motion.div>
        </div>
    );
}
