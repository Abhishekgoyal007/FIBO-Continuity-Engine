import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Image as ImageIcon,
    Download,
    Grid,
    Maximize2,
    ExternalLink,
    Loader2
} from 'lucide-react';
import { useStore } from '../store/useStore';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import './OutputGallery.css';

export function OutputGallery() {
    const { currentProject, consistencyScore, addToast } = useStore();
    const [isExporting, setIsExporting] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (!currentProject) return null;

    const completedShots = currentProject.shots.filter(shot => shot.status === 'complete' && shot.imageUrl);

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

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            saveAs(zipBlob, `${currentProject.name.replace(/[^a-z0-9]/gi, '_')}_sequence.zip`);

            addToast('success', `Exported ${completedShots.length} images`);
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

    return (
        <section className="panel panel-output">
            <div className="panel-header">
                <h2>
                    <ImageIcon size={18} />
                    Generated Sequence
                </h2>
                <div className="panel-actions">
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
                        {/* Output Grid */}
                        <div className="output-grid">
                            {completedShots.map((shot) => (
                                <motion.div
                                    key={shot.id}
                                    className="output-item"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
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

                        {/* Consistency Score Panel */}
                        {consistencyScore && (
                            <div className="consistency-panel">
                                <div className="consistency-header">
                                    <h3>Consistency Analysis</h3>
                                    <span className="consistency-score">
                                        <span className="score-value">{consistencyScore.overall}</span>%
                                    </span>
                                </div>
                                <div className="consistency-bars">
                                    <div className="consistency-bar">
                                        <span className="bar-label">Color Palette</span>
                                        <div className="bar-track">
                                            <div
                                                className="bar-fill"
                                                style={{ width: `${consistencyScore.colorPalette}%` }}
                                            />
                                        </div>
                                        <span className="bar-value">{consistencyScore.colorPalette}%</span>
                                    </div>
                                    <div className="consistency-bar">
                                        <span className="bar-label">Structure</span>
                                        <div className="bar-track">
                                            <div
                                                className="bar-fill"
                                                style={{ width: `${consistencyScore.structure}%` }}
                                            />
                                        </div>
                                        <span className="bar-value">{consistencyScore.structure}%</span>
                                    </div>
                                    <div className="consistency-bar">
                                        <span className="bar-label">Lighting</span>
                                        <div className="bar-track">
                                            <div
                                                className="bar-fill"
                                                style={{ width: `${consistencyScore.lighting}%` }}
                                            />
                                        </div>
                                        <span className="bar-value">{consistencyScore.lighting}%</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="lightbox-overlay"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="lightbox-content">
                        <img src={selectedImage} alt="Full size preview" />
                    </div>
                </div>
            )}
        </section>
    );
}
