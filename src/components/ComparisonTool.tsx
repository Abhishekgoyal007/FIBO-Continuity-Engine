import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Layers,
    Play,
    Pause,
    SkipForward,
    SkipBack,
    Grid
} from 'lucide-react';
import { useStore } from '../store/useStore';
import './ComparisonTool.css';

type ViewMode = 'slider' | 'sideBySide' | 'overlay' | 'animation';

export function ComparisonTool() {
    const { showComparisonTool, setShowComparisonTool, currentProject } = useStore();
    const [viewMode, setViewMode] = useState<ViewMode>('slider');
    const [sliderPosition, setSliderPosition] = useState(50);
    const [selectedIndices, setSelectedIndices] = useState<[number, number]>([0, 1]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationIndex, setAnimationIndex] = useState(0);
    const [overlayOpacity, setOverlayOpacity] = useState(0.5);
    const [animationSpeed, setAnimationSpeed] = useState(500);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<NodeJS.Timeout | null>(null);

    const completedShots = currentProject?.shots.filter(
        shot => shot.status === 'complete' && shot.imageUrl
    ) || [];

    // Slider drag handling
    const handleMouseMove = (e: MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        setSliderPosition(Math.min(Math.max(percentage, 0), 100));
    };

    const handleMouseDown = () => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    // Animation control
    const toggleAnimation = () => {
        if (isAnimating) {
            if (animationRef.current) {
                clearInterval(animationRef.current);
                animationRef.current = null;
            }
            setIsAnimating(false);
        } else {
            setIsAnimating(true);
            animationRef.current = setInterval(() => {
                setAnimationIndex(prev => (prev + 1) % completedShots.length);
            }, animationSpeed);
        }
    };

    const nextFrame = () => {
        setAnimationIndex(prev => (prev + 1) % completedShots.length);
    };

    const prevFrame = () => {
        setAnimationIndex(prev => (prev - 1 + completedShots.length) % completedShots.length);
    };

    // Update animation speed
    useEffect(() => {
        if (isAnimating && animationRef.current) {
            clearInterval(animationRef.current);
            animationRef.current = setInterval(() => {
                setAnimationIndex(prev => (prev + 1) % completedShots.length);
            }, animationSpeed);
        }
    }, [animationSpeed, completedShots.length, isAnimating]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (animationRef.current) {
                clearInterval(animationRef.current);
            }
        };
    }, []);

    if (!showComparisonTool) return null;

    const image1 = completedShots[selectedIndices[0]]?.imageUrl;
    const image2 = completedShots[selectedIndices[1]]?.imageUrl;
    const animatedImage = completedShots[animationIndex]?.imageUrl;

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay comparison-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowComparisonTool(false)}
            >
                <motion.div
                    className="comparison-tool"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="comparison-header">
                        <h2>
                            <Layers size={20} />
                            Compare Frames
                        </h2>
                        <div className="comparison-modes">
                            <button
                                className={`mode-btn ${viewMode === 'slider' ? 'active' : ''}`}
                                onClick={() => setViewMode('slider')}
                            >
                                Slider
                            </button>
                            <button
                                className={`mode-btn ${viewMode === 'sideBySide' ? 'active' : ''}`}
                                onClick={() => setViewMode('sideBySide')}
                            >
                                Side by Side
                            </button>
                            <button
                                className={`mode-btn ${viewMode === 'overlay' ? 'active' : ''}`}
                                onClick={() => setViewMode('overlay')}
                            >
                                Overlay
                            </button>
                            <button
                                className={`mode-btn ${viewMode === 'animation' ? 'active' : ''}`}
                                onClick={() => setViewMode('animation')}
                            >
                                Animate
                            </button>
                        </div>
                        <button
                            className="btn btn-icon btn-ghost"
                            onClick={() => setShowComparisonTool(false)}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="comparison-body">
                        {completedShots.length < 2 ? (
                            <div className="comparison-empty">
                                <Grid size={48} />
                                <h3>Need at least 2 images</h3>
                                <p>Generate more shots to compare them</p>
                            </div>
                        ) : (
                            <>
                                {/* Slider View */}
                                {viewMode === 'slider' && image1 && image2 && (
                                    <div className="comparison-slider" ref={containerRef}>
                                        <div className="slider-before">
                                            <img src={image1} alt="Before" />
                                            <div className="slider-label">
                                                {completedShots[selectedIndices[0]]?.name}
                                            </div>
                                        </div>
                                        <div
                                            className="slider-after"
                                            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                                        >
                                            <img src={image2} alt="After" />
                                            <div className="slider-label right">
                                                {completedShots[selectedIndices[1]]?.name}
                                            </div>
                                        </div>
                                        <div
                                            className="slider-handle"
                                            style={{ left: `${sliderPosition}%` }}
                                            onMouseDown={handleMouseDown}
                                        >
                                            <div className="handle-bar" />
                                        </div>
                                    </div>
                                )}

                                {/* Side by Side View */}
                                {viewMode === 'sideBySide' && image1 && image2 && (
                                    <div className="comparison-side-by-side">
                                        <div className="side-image">
                                            <img src={image1} alt="Image 1" />
                                            <div className="side-label">
                                                {completedShots[selectedIndices[0]]?.name}
                                            </div>
                                        </div>
                                        <div className="side-image">
                                            <img src={image2} alt="Image 2" />
                                            <div className="side-label">
                                                {completedShots[selectedIndices[1]]?.name}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Overlay View */}
                                {viewMode === 'overlay' && image1 && image2 && (
                                    <div className="comparison-overlay-view">
                                        <div className="overlay-stack">
                                            <img src={image1} alt="Base" className="overlay-base" />
                                            <img
                                                src={image2}
                                                alt="Overlay"
                                                className="overlay-top"
                                                style={{ opacity: overlayOpacity }}
                                            />
                                        </div>
                                        <div className="overlay-controls">
                                            <label>Overlay Opacity</label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.05"
                                                value={overlayOpacity}
                                                onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                                            />
                                            <span>{Math.round(overlayOpacity * 100)}%</span>
                                        </div>
                                    </div>
                                )}

                                {/* Animation View */}
                                {viewMode === 'animation' && animatedImage && (
                                    <div className="comparison-animation">
                                        <div className="animation-display">
                                            <motion.img
                                                key={animationIndex}
                                                src={animatedImage}
                                                alt="Animation frame"
                                                initial={{ opacity: 0.8 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.1 }}
                                            />
                                            <div className="animation-label">
                                                {completedShots[animationIndex]?.name}
                                            </div>
                                        </div>
                                        <div className="animation-controls">
                                            <button className="btn btn-icon" onClick={prevFrame}>
                                                <SkipBack size={18} />
                                            </button>
                                            <button
                                                className={`btn btn-icon ${isAnimating ? 'btn-primary' : ''}`}
                                                onClick={toggleAnimation}
                                            >
                                                {isAnimating ? <Pause size={18} /> : <Play size={18} />}
                                            </button>
                                            <button className="btn btn-icon" onClick={nextFrame}>
                                                <SkipForward size={18} />
                                            </button>
                                            <div className="speed-control">
                                                <label>Speed</label>
                                                <input
                                                    type="range"
                                                    min="100"
                                                    max="1000"
                                                    step="100"
                                                    value={1100 - animationSpeed}
                                                    onChange={(e) => setAnimationSpeed(1100 - parseInt(e.target.value))}
                                                />
                                            </div>
                                            <span className="frame-counter">
                                                {animationIndex + 1} / {completedShots.length}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Thumbnail Strip */}
                    {completedShots.length >= 2 && viewMode !== 'animation' && (
                        <div className="comparison-thumbnails">
                            <div className="thumbnail-row">
                                <span className="thumbnail-label">Image 1:</span>
                                {completedShots.map((shot, idx) => (
                                    <button
                                        key={shot.id}
                                        className={`thumbnail-btn ${selectedIndices[0] === idx ? 'active' : ''}`}
                                        onClick={() => setSelectedIndices([idx, selectedIndices[1]])}
                                    >
                                        <img src={shot.imageUrl} alt={shot.name} />
                                    </button>
                                ))}
                            </div>
                            <div className="thumbnail-row">
                                <span className="thumbnail-label">Image 2:</span>
                                {completedShots.map((shot, idx) => (
                                    <button
                                        key={shot.id}
                                        className={`thumbnail-btn ${selectedIndices[1] === idx ? 'active' : ''}`}
                                        onClick={() => setSelectedIndices([selectedIndices[0], idx])}
                                    >
                                        <img src={shot.imageUrl} alt={shot.name} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
