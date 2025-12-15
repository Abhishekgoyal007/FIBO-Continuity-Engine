import { useState, useRef } from 'react';
import './BeforeAfterSlider.css';

interface BeforeAfterSliderProps {
    beforeImage: string;
    afterImage: string;
    beforeLabel?: string;
    afterLabel?: string;
}

export function BeforeAfterSlider({
    beforeImage,
    afterImage,
    beforeLabel = 'Traditional AI',
    afterLabel = 'With FIBO'
}: BeforeAfterSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const handleMove = (clientX: number) => {
        if (!containerRef.current || !isDragging.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(percentage);
    };

    const handleMouseDown = () => {
        isDragging.current = true;
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        handleMove(e.clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        handleMove(e.touches[0].clientX);
    };

    return (
        <div
            ref={containerRef}
            className="before-after-container"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
        >
            {/* After Image (full) */}
            <div className="after-image">
                <img src={afterImage} alt="After FIBO" />
                <span className="image-label after-label">{afterLabel}</span>
            </div>

            {/* Before Image (clipped) */}
            <div
                className="before-image"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                <img src={beforeImage} alt="Before FIBO" />
                <span className="image-label before-label">{beforeLabel}</span>
            </div>

            {/* Slider Handle */}
            <div
                className="slider-handle"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
            >
                <div className="slider-line" />
                <div className="slider-circle">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M8 6L4 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16 6L20 12L16 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
