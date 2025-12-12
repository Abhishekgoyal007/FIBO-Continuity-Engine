import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Image as ImageIcon,
    Download,
    Grid,
    Maximize2,
    ExternalLink,
    Loader2,
    CheckCircle,
    AlertTriangle,
    Info,
    RefreshCw,
    Play,
    Pause,
    Film
} from 'lucide-react';
import { useStore } from '../store/useStore';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import './OutputGallery.css';

export function OutputGallery() {
    const { currentProject, consistencyScore, addToast, setConsistencyScore } = useStore();
    const [isExporting, setIsExporting] = useState(false);
    const [isExportingGif, setIsExportingGif] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationIndex, setAnimationIndex] = useState(0);
    const animationRef = useRef<NodeJS.Timeout | null>(null);

    if (!currentProject) return null;

    const completedShots = currentProject.shots.filter(shot => shot.status === 'complete' && shot.imageUrl);

    // Auto-analyze when we have new completed shots
    const analyzeConsistency = async () => {
        if (completedShots.length < 2) return;

        setIsAnalyzing(true);
        try {
            const imageUrls = completedShots.map(s => s.imageUrl!);
            const { validateSequenceConsistency } = await import('../utils/consistency');
            const result = await validateSequenceConsistency(imageUrls);

            setConsistencyScore({
                overall: result.overall,
                colorPalette: result.colorPalette,
                structure: result.structure,
                lighting: result.lighting,
            });
        } catch (error) {
            console.error('Consistency analysis failed:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleExportAll = async () => {
        if (completedShots.length === 0) {
            addToast('error', 'No images to export');
            return;
        }

        setIsExporting(true);

        try {
            const zip = new JSZip();
            const folder = zip.folder(currentProject.name.replace(/[^a-z0-9]/gi, '_'));

            // Download each image and add to zip
            for (const shot of completedShots) {
                if (shot.imageUrl) {
                    try {
                        const response = await fetch(shot.imageUrl);
                        const blob = await response.blob();
                        const filename = `${shot.name.replace(/[^a-z0-9]/gi, '_')}.png`;
                        folder?.file(filename, blob);
                    } catch (err) {
                        console.error(`Failed to fetch ${shot.name}:`, err);
                    }
                }
            }

            // Add consistency report
            if (consistencyScore) {
                const report = `FIBO Continuity Engine - Consistency Report
========================================
Project: ${currentProject.name}
Generated: ${new Date().toISOString()}

Overall Score: ${consistencyScore.overall}%
Color Palette: ${consistencyScore.colorPalette}%
Structure: ${consistencyScore.structure}%
Lighting: ${consistencyScore.lighting}%

Shots Generated: ${completedShots.length}
${completedShots.map((s, i) => `${i + 1}. ${s.name}`).join('\n')}
`;
                folder?.file('consistency_report.txt', report);
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            saveAs(zipBlob, `${currentProject.name.replace(/[^a-z0-9]/gi, '_')}_sequence.zip`);

            addToast('success', `Exported ${completedShots.length} images + report`);
        } catch (error) {
            console.error('Export error:', error);
            addToast('error', 'Export failed');
        } finally {
            setIsExporting(false);
        }
    };

    const handleDownloadSingle = async (imageUrl: string, name: string) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            saveAs(blob, `${name.replace(/[^a-z0-9]/gi, '_')}.png`);
        } catch (error) {
            addToast('error', 'Download failed');
        }
    };

    // GIF Export using gifshot
    const handleExportGif = async () => {
        if (completedShots.length < 2) {
            addToast('error', 'Need at least 2 images for GIF');
            return;
        }

        setIsExportingGif(true);
        try {
            const gifshot = await import('gifshot');
            const imageUrls = completedShots.map(s => s.imageUrl!);

            gifshot.createGIF({
                images: imageUrls,
                gifWidth: 512,
                gifHeight: 512,
                interval: 0.5,
                numFrames: imageUrls.length,
                frameDuration: 1,
                sampleInterval: 10,
            }, (obj: { error: boolean; image: string; errorMsg?: string }) => {
                if (!obj.error) {
                    const link = document.createElement('a');
                    link.download = `${currentProject.name.replace(/[^a-z0-9]/gi, '_')}_sequence.gif`;
                    link.href = obj.image;
                    link.click();
                    addToast('success', 'GIF exported successfully!');
                } else {
                    console.error('GIF creation failed:', obj.errorMsg);
                    addToast('error', 'GIF export failed');
                }
                setIsExportingGif(false);
            });
        } catch (error) {
            console.error('GIF export error:', error);
            addToast('error', 'GIF export failed');
            setIsExportingGif(false);
        }
    };

    // Animation Preview Toggle
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
            }, 500);
        }
    };

    // Cleanup animation on unmount
    useEffect(() => {
        return () => {
            if (animationRef.current) {
                clearInterval(animationRef.current);
            }
        };
    }, []);

    const getScoreColor = (score: number): string => {
        if (score >= 80) return 'var(--success)';
        if (score >= 60) return 'var(--accent-primary)';
        if (score >= 40) return 'var(--warning)';
        return 'var(--error)';
    };

    const getScoreLabel = (score: number): { label: string; icon: React.ReactNode } => {
        if (score >= 80) return { label: 'Excellent', icon: <CheckCircle size={16} /> };
        if (score >= 60) return { label: 'Good', icon: <Info size={16} /> };
        if (score >= 40) return { label: 'Fair', icon: <AlertTriangle size={16} /> };
        return { label: 'Needs Work', icon: <AlertTriangle size={16} /> };
    };

    return (
        <section className="panel panel-output">
            <div className="panel-header">
                <h2>
                    <ImageIcon size={18} />
                    Generated Sequence
                </h2>
                <div className="panel-actions">
                    {completedShots.length >= 2 && (
                        <>
                            <button
                                className={`btn btn-sm ${isAnimating ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={toggleAnimation}
                                title={isAnimating ? 'Stop Animation' : 'Play Animation'}
                            >
                                {isAnimating ? <Pause size={16} /> : <Play size={16} />}
                            </button>
                            <button
                                className="btn btn-sm btn-ghost"
                                onClick={handleExportGif}
                                disabled={isExportingGif}
                                title="Export as GIF"
                            >
                                {isExportingGif ? (
                                    <Loader2 size={16} className="spin" />
                                ) : (
                                    <Film size={16} />
                                )}
                            </button>
                            {!isAnalyzing && (
                                <button
                                    className="btn btn-sm btn-ghost"
                                    onClick={analyzeConsistency}
                                    title="Re-analyze Consistency"
                                >
                                    <RefreshCw size={16} />
                                </button>
                            )}
                        </>
                    )}
                    <button
                        className="btn btn-sm btn-ghost"
                        onClick={handleExportAll}
                        disabled={completedShots.length === 0 || isExporting}
                    >
                        {isExporting ? (
                            <Loader2 size={16} className="spin" />
                        ) : (
                            <Download size={16} />
                        )}
                        Export All
                    </button>
                </div>
            </div>

            <div className="panel-content">
                {completedShots.length === 0 ? (
                    <div className="output-empty-state">
                        <div className="pulse-ring" />
                        <Grid size={64} strokeWidth={1} />
                        <p>Your generated sequence will appear here</p>
                    </div>
                ) : (
                    <>
                        {/* Consistency Score Panel - Show First */}
                        {consistencyScore && (
                            <motion.div
                                className="consistency-panel"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="consistency-header">
                                    <div className="consistency-title">
                                        <span
                                            className="consistency-icon"
                                            style={{ color: getScoreColor(consistencyScore.overall) }}
                                        >
                                            {getScoreLabel(consistencyScore.overall).icon}
                                        </span>
                                        <span>Consistency Analysis</span>
                                    </div>
                                    <div className="consistency-score">
                                        <span
                                            className="score-value"
                                            style={{ color: getScoreColor(consistencyScore.overall) }}
                                        >
                                            {consistencyScore.overall}
                                        </span>
                                        <span className="score-suffix">%</span>
                                    </div>
                                </div>
                                <div className="consistency-bars">
                                    <div className="consistency-bar">
                                        <span className="bar-label">Color Palette</span>
                                        <div className="bar-track">
                                            <motion.div
                                                className="bar-fill"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${consistencyScore.colorPalette}%` }}
                                                transition={{ duration: 0.5, delay: 0.1 }}
                                                style={{ background: getScoreColor(consistencyScore.colorPalette) }}
                                            />
                                        </div>
                                        <span className="bar-value">{consistencyScore.colorPalette}%</span>
                                    </div>
                                    <div className="consistency-bar">
                                        <span className="bar-label">Structure</span>
                                        <div className="bar-track">
                                            <motion.div
                                                className="bar-fill"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${consistencyScore.structure}%` }}
                                                transition={{ duration: 0.5, delay: 0.2 }}
                                                style={{ background: getScoreColor(consistencyScore.structure) }}
                                            />
                                        </div>
                                        <span className="bar-value">{consistencyScore.structure}%</span>
                                    </div>
                                    <div className="consistency-bar">
                                        <span className="bar-label">Lighting</span>
                                        <div className="bar-track">
                                            <motion.div
                                                className="bar-fill"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${consistencyScore.lighting}%` }}
                                                transition={{ duration: 0.5, delay: 0.3 }}
                                                style={{ background: getScoreColor(consistencyScore.lighting) }}
                                            />
                                        </div>
                                        <span className="bar-value">{consistencyScore.lighting}%</span>
                                    </div>
                                </div>
                                {consistencyScore.overall >= 80 && (
                                    <div className="consistency-badge excellent">
                                        🎯 Production Ready
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {isAnalyzing && (
                            <div className="analyzing-state">
                                <Loader2 size={24} className="spin" />
                                <span>Analyzing consistency...</span>
                            </div>
                        )}

                        {/* Animation Preview */}
                        {isAnimating && completedShots.length > 0 && (
                            <div className="animation-preview">
                                <div className="animation-frame">
                                    <img
                                        src={completedShots[animationIndex]?.imageUrl}
                                        alt={completedShots[animationIndex]?.name}
                                    />
                                </div>
                                <div className="animation-info">
                                    <span className="animation-label">
                                        {completedShots[animationIndex]?.name}
                                    </span>
                                    <span className="animation-progress">
                                        {animationIndex + 1} / {completedShots.length}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Output Grid */}
                        <div className="output-grid">
                            {completedShots.map((shot, index) => (
                                <motion.div
                                    key={shot.id}
                                    className="output-item"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <img src={shot.imageUrl} alt={shot.name} />
                                    <div className="output-item-overlay">
                                        <span className="output-item-name">{shot.name}</span>
                                        <div className="output-item-actions">
                                            <button
                                                className="btn btn-sm btn-ghost"
                                                onClick={() => setSelectedImage(shot.imageUrl!)}
                                                title="View Full Size"
                                            >
                                                <Maximize2 size={14} />
                                            </button>
                                            <button
                                                className="btn btn-sm btn-ghost"
                                                onClick={() => handleDownloadSingle(shot.imageUrl!, shot.name)}
                                                title="Download"
                                            >
                                                <Download size={14} />
                                            </button>
                                            <a
                                                href={shot.imageUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-sm btn-ghost"
                                                title="Open in New Tab"
                                            >
                                                <ExternalLink size={14} />
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        className="lightbox-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.div
                            className="lightbox-content"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                        >
                            <img src={selectedImage} alt="Full size preview" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
