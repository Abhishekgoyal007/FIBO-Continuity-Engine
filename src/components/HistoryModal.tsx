import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Clock,
    Trash2,
    RotateCcw,
    Image as ImageIcon,
    ChevronRight
} from 'lucide-react';
import { useStore } from '../store/useStore';
import './HistoryModal.css';

export function HistoryModal() {
    const {
        showHistory,
        setShowHistory,
        generationHistory,
        clearGenerationHistory,
        addToast,
        updateProject,
        currentProject
    } = useStore();

    const handleLoadFromHistory = (entry: typeof generationHistory[0]) => {
        if (!currentProject) return;

        updateProject({
            prompt: entry.prompt,
            styleSettings: entry.styleSettings,
        });

        addToast('success', 'Loaded prompt from history');
        setShowHistory(false);
    };

    const formatDate = (date: Date) => {
        const d = new Date(date);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString();
    };

    if (!showHistory) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowHistory(false)}
            >
                <motion.div
                    className="modal-content history-modal"
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-header">
                        <h2>
                            <Clock size={20} />
                            Generation History
                        </h2>
                        <div className="modal-header-actions">
                            {generationHistory.length > 0 && (
                                <button
                                    className="btn btn-sm btn-ghost btn-danger"
                                    onClick={() => {
                                        clearGenerationHistory();
                                        addToast('info', 'History cleared');
                                    }}
                                >
                                    <Trash2 size={14} />
                                    Clear All
                                </button>
                            )}
                            <button
                                className="btn btn-icon btn-ghost"
                                onClick={() => setShowHistory(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="modal-body">
                        {generationHistory.length === 0 ? (
                            <div className="history-empty">
                                <div className="history-empty-icon">
                                    <Clock size={32} />
                                </div>
                                <h3>No history yet</h3>
                                <p>Your generation history will appear here</p>
                            </div>
                        ) : (
                            <div className="history-list">
                                {generationHistory.map((entry) => (
                                    <motion.div
                                        key={entry.id}
                                        className="history-item"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        whileHover={{ x: 4 }}
                                    >
                                        <div className="history-item-preview">
                                            {entry.shots.slice(0, 3).map((shot, idx) => (
                                                <div
                                                    key={idx}
                                                    className="history-thumb"
                                                    style={{ zIndex: 3 - idx }}
                                                >
                                                    <img src={shot.imageUrl} alt={shot.name} />
                                                </div>
                                            ))}
                                            {entry.shots.length > 3 && (
                                                <div className="history-thumb-more">
                                                    +{entry.shots.length - 3}
                                                </div>
                                            )}
                                        </div>

                                        <div className="history-item-info">
                                            <p className="history-prompt">
                                                {entry.prompt.length > 100
                                                    ? entry.prompt.substring(0, 100) + '...'
                                                    : entry.prompt}
                                            </p>
                                            <div className="history-meta">
                                                <span className="history-time">
                                                    <Clock size={12} />
                                                    {formatDate(entry.timestamp)}
                                                </span>
                                                <span className="history-shots">
                                                    <ImageIcon size={12} />
                                                    {entry.shots.length} shots
                                                </span>
                                                {entry.consistencyScore && (
                                                    <span className="history-score">
                                                        {entry.consistencyScore.overall}% consistent
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            className="btn btn-sm btn-ghost history-load-btn"
                                            onClick={() => handleLoadFromHistory(entry)}
                                            title="Load this prompt"
                                        >
                                            <RotateCcw size={14} />
                                            <ChevronRight size={14} />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
