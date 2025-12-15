import { useEffect, useRef, useState } from 'react';

interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    onClick?: () => void;
    placeholderColor?: string;
}

/**
 * Lazy loading image component with progressive blur-up effect
 * Uses IntersectionObserver for efficient viewport detection
 */
export function LazyImage({
    src,
    alt,
    className = '',
    onClick,
    placeholderColor = 'rgba(255, 255, 255, 0.05)'
}: LazyImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [error, setError] = useState(false);
    const imgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '100px', // Start loading 100px before in view
                threshold: 0.1
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleLoad = () => {
        setIsLoaded(true);
    };

    const handleError = () => {
        setError(true);
    };

    // Convert to WebP if possible (append format param for supported services)
    const optimizedSrc = src.includes('unsplash.com')
        ? src.replace(/fm=\w+/, 'fm=webp').replace(/\?/, '?fm=webp&')
        : src;

    return (
        <div
            ref={imgRef}
            className={`lazy-image-container ${className} ${isLoaded ? 'loaded' : 'loading'}`}
            onClick={onClick}
            style={{
                backgroundColor: placeholderColor,
                cursor: onClick ? 'pointer' : 'default'
            }}
        >
            {isInView && !error && (
                <>
                    {/* Low quality placeholder (blur) */}
                    {!isLoaded && (
                        <div className="lazy-image-placeholder">
                            <div className="skeleton-shimmer" />
                        </div>
                    )}

                    {/* Actual image */}
                    <img
                        src={optimizedSrc}
                        alt={alt}
                        onLoad={handleLoad}
                        onError={handleError}
                        loading="lazy"
                        decoding="async"
                        className={`lazy-image ${isLoaded ? 'visible' : ''}`}
                    />
                </>
            )}

            {error && (
                <div className="lazy-image-error">
                    <span>⚠️</span>
                </div>
            )}
        </div>
    );
}

/**
 * Progressive image with blur-up effect
 * Shows tiny thumbnail first, then full image
 */
export function ProgressiveImage({
    src,
    alt,
    className = '',
    onClick,
    thumbnailSrc
}: LazyImageProps & { thumbnailSrc?: string }) {
    const [stage, setStage] = useState<'placeholder' | 'thumbnail' | 'full'>('placeholder');
    const [fullLoaded, setFullLoaded] = useState(false);

    // Generate tiny thumbnail URL (for Unsplash)
    const tinyUrl = thumbnailSrc || (src.includes('unsplash.com')
        ? src.replace(/w=\d+/, 'w=20').replace(/h=\d+/, 'h=20')
        : undefined);

    return (
        <div
            className={`progressive-image-container ${className} ${fullLoaded ? 'loaded' : 'loading'}`}
            onClick={onClick}
        >
            {/* Tiny blurred thumbnail */}
            {tinyUrl && stage === 'placeholder' && (
                <img
                    src={tinyUrl}
                    alt=""
                    className="progressive-thumbnail"
                    onLoad={() => setStage('thumbnail')}
                    aria-hidden="true"
                />
            )}

            {/* Full resolution image */}
            <img
                src={src}
                alt={alt}
                className={`progressive-full ${fullLoaded ? 'visible' : ''}`}
                onLoad={() => {
                    setFullLoaded(true);
                    setStage('full');
                }}
                loading="lazy"
                decoding="async"
            />
        </div>
    );
}
