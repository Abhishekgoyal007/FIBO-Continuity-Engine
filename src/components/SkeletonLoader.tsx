import { motion } from 'framer-motion';
import './SkeletonLoader.css';

interface SkeletonProps {
    className?: string;
    style?: React.CSSProperties;
}

export function Skeleton({ className = '', style }: SkeletonProps) {
    return (
        <motion.div
            className={`skeleton ${className}`}
            style={style}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        />
    );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
    return (
        <div className={`skeleton-text-group ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className="skeleton-text"
                    style={{
                        width: i === lines - 1 ? '60%' : '100%',
                        animationDelay: `${i * 0.1}s`
                    }}
                />
            ))}
        </div>
    );
}

export function SkeletonImage({ aspectRatio = 1, className = '' }: { aspectRatio?: number; className?: string }) {
    return (
        <Skeleton
            className={`skeleton-image ${className}`}
            style={{ aspectRatio }}
        />
    );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
    return (
        <div className={`skeleton-card ${className}`}>
            <SkeletonImage />
            <div className="skeleton-card-content">
                <Skeleton className="skeleton-title" />
                <SkeletonText lines={2} />
            </div>
        </div>
    );
}

export function SkeletonShot() {
    return (
        <div className="skeleton-shot">
            <Skeleton className="skeleton-shot-number" />
            <div className="skeleton-shot-info">
                <Skeleton className="skeleton-shot-name" />
                <div className="skeleton-shot-details">
                    <Skeleton className="skeleton-tag" />
                    <Skeleton className="skeleton-tag" />
                    <Skeleton className="skeleton-tag" />
                </div>
            </div>
            <Skeleton className="skeleton-shot-thumb" />
        </div>
    );
}

export function SkeletonGallery({ count = 4 }: { count?: number }) {
    return (
        <div className="skeleton-gallery">
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                >
                    <SkeletonImage />
                </motion.div>
            ))}
        </div>
    );
}

// Loading overlay for generation
export function GeneratingOverlay({ message = 'Generating...', progress }: { message?: string; progress?: number }) {
    return (
        <motion.div
            className="generating-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="generating-content">
                <div className="generating-spinner">
                    <motion.div
                        className="spinner-ring"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                    <motion.div
                        className="spinner-ring inner"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                </div>
                <p className="generating-message">{message}</p>
                {progress !== undefined && (
                    <div className="generating-progress">
                        <div className="progress-track">
                            <motion.div
                                className="progress-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                        <span className="progress-text">{Math.round(progress)}%</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
