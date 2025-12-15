import { motion } from 'framer-motion';
import {
    FolderOpen,
    Settings,
    Plus,
    Undo2,
    Redo2,
    Clock,
    Bookmark,
    Layers
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { ThemeToggle } from './ThemeToggle';
import './Header.css';

export function Header() {
    const {
        currentProject,
        setShowSettings,
        setShowHistory,
        setShowPresets,
        setShowComparisonTool,
        createProject,
        undo,
        redo,
        canUndo,
        canRedo
    } = useStore();

    const handleNewProject = () => {
        createProject('New Project', '');
    };

    const completedShots = currentProject?.shots.filter(s => s.status === 'complete') || [];

    return (
        <header className="app-header">
            <div className="header-left">
                <div className="logo">
                    <div className="logo-icon">
                        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="4" y="4" width="10" height="10" rx="2" fill="url(#gradient1)" />
                            <rect x="18" y="4" width="10" height="10" rx="2" fill="url(#gradient1)" opacity="0.7" />
                            <rect x="4" y="18" width="10" height="10" rx="2" fill="url(#gradient1)" opacity="0.5" />
                            <rect x="18" y="18" width="10" height="10" rx="2" fill="url(#gradient1)" opacity="0.3" />
                            <defs>
                                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <div className="logo-text">
                        <span className="logo-title">FIBO</span>
                        <span className="logo-tagline">Continuity Engine</span>
                    </div>
                </div>
            </div>

            <div className="header-center">
                {/* Undo/Redo */}
                <div className="header-actions-group">
                    <motion.button
                        className="btn btn-ghost btn-icon header-btn"
                        onClick={undo}
                        disabled={!canUndo()}
                        title="Undo (Ctrl+Z)"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Undo2 size={16} />
                    </motion.button>
                    <motion.button
                        className="btn btn-ghost btn-icon header-btn"
                        onClick={redo}
                        disabled={!canRedo()}
                        title="Redo (Ctrl+Y)"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Redo2 size={16} />
                    </motion.button>
                </div>

                <div className="header-divider" />

                {/* Project Name */}
                <button className="project-btn">
                    <FolderOpen size={16} />
                    <span>{currentProject?.name || 'New Project'}</span>
                </button>

                <div className="header-divider" />

                {/* Quick Actions */}
                <div className="header-actions-group">
                    <motion.button
                        className="btn btn-ghost btn-icon header-btn"
                        onClick={() => setShowHistory(true)}
                        title="Generation History"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Clock size={16} />
                    </motion.button>
                    <motion.button
                        className="btn btn-ghost btn-icon header-btn"
                        onClick={() => setShowPresets(true)}
                        title="Saved Presets"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Bookmark size={16} />
                    </motion.button>
                    {completedShots.length >= 2 && (
                        <motion.button
                            className="btn btn-ghost btn-icon header-btn"
                            onClick={() => setShowComparisonTool(true)}
                            title="Compare Frames"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Layers size={16} />
                        </motion.button>
                    )}
                </div>
            </div>

            <div className="header-right">
                {/* Theme Toggle */}
                <ThemeToggle />

                <motion.button
                    className="btn btn-ghost btn-icon header-btn"
                    onClick={() => setShowSettings(true)}
                    title="Settings"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Settings size={18} />
                </motion.button>

                <motion.button
                    className="btn btn-primary header-new-btn"
                    onClick={handleNewProject}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Plus size={16} />
                    <span>New</span>
                </motion.button>
            </div>
        </header>
    );
}
