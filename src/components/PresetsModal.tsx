import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Bookmark,
    Plus,
    Trash2,
    Download,
    Upload,
    Check,
    FileJson
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { PromptPreset } from '../store/useStore';
import './PresetsModal.css';

export function PresetsModal() {
    const {
        showPresets,
        setShowPresets,
        promptPresets,
        savePromptPreset,
        loadPromptPreset,
        deletePromptPreset,
        importPresets,
        exportPresets,
        currentProject,
        addToast
    } = useStore();

    const [newPresetName, setNewPresetName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleSavePreset = () => {
        if (!newPresetName.trim()) {
            addToast('error', 'Please enter a preset name');
            return;
        }

        if (!currentProject?.prompt.trim()) {
            addToast('error', 'Please enter a prompt first');
            return;
        }

        savePromptPreset(newPresetName.trim());
        setNewPresetName('');
        setIsCreating(false);
    };

    const handleExport = () => {
        const presets = exportPresets();
        const blob = new Blob([JSON.stringify(presets, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fibo-presets.json';
        a.click();
        URL.revokeObjectURL(url);
        addToast('success', `Exported ${presets.length} presets`);
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                const text = await file.text();
                const presets = JSON.parse(text) as PromptPreset[];

                if (!Array.isArray(presets)) {
                    throw new Error('Invalid format');
                }

                importPresets(presets);
            } catch {
                addToast('error', 'Invalid preset file');
            }
        };
        input.click();
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (!showPresets) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPresets(false)}
            >
                <motion.div
                    className="modal-content presets-modal"
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-header">
                        <h2>
                            <Bookmark size={20} />
                            Prompt Presets
                        </h2>
                        <div className="modal-header-actions">
                            <button
                                className="btn btn-sm btn-ghost"
                                onClick={handleImport}
                                title="Import presets"
                            >
                                <Upload size={14} />
                                Import
                            </button>
                            {promptPresets.length > 0 && (
                                <button
                                    className="btn btn-sm btn-ghost"
                                    onClick={handleExport}
                                    title="Export presets"
                                >
                                    <Download size={14} />
                                    Export
                                </button>
                            )}
                            <button
                                className="btn btn-icon btn-ghost"
                                onClick={() => setShowPresets(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="modal-body">
                        {/* Create New Preset */}
                        <div className="preset-create">
                            {isCreating ? (
                                <motion.div
                                    className="preset-create-form"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                >
                                    <input
                                        type="text"
                                        placeholder="Preset name..."
                                        value={newPresetName}
                                        onChange={(e) => setNewPresetName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
                                        autoFocus
                                    />
                                    <div className="preset-create-actions">
                                        <button
                                            className="btn btn-sm btn-ghost"
                                            onClick={() => {
                                                setIsCreating(false);
                                                setNewPresetName('');
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={handleSavePreset}
                                        >
                                            <Check size={14} />
                                            Save
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <button
                                    className="btn preset-create-btn"
                                    onClick={() => setIsCreating(true)}
                                    disabled={!currentProject?.prompt.trim()}
                                >
                                    <Plus size={18} />
                                    Save Current Prompt as Preset
                                </button>
                            )}
                        </div>

                        {/* Presets List */}
                        {promptPresets.length === 0 ? (
                            <div className="presets-empty">
                                <div className="presets-empty-icon">
                                    <FileJson size={32} />
                                </div>
                                <h3>No presets saved</h3>
                                <p>Save your favorite prompts for quick access</p>
                            </div>
                        ) : (
                            <div className="presets-list">
                                {promptPresets.map((preset) => (
                                    <motion.div
                                        key={preset.id}
                                        className="preset-item"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        whileHover={{ x: 4 }}
                                    >
                                        <div className="preset-item-info">
                                            <h4>{preset.name}</h4>
                                            <p className="preset-prompt">
                                                {preset.prompt.length > 80
                                                    ? preset.prompt.substring(0, 80) + '...'
                                                    : preset.prompt}
                                            </p>
                                            <div className="preset-meta">
                                                <span className="preset-style">
                                                    {preset.styleSettings.style}
                                                </span>
                                                <span className="preset-date">
                                                    {formatDate(preset.createdAt)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="preset-actions">
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => loadPromptPreset(preset.id)}
                                            >
                                                Load
                                            </button>
                                            <button
                                                className="btn btn-sm btn-ghost btn-danger"
                                                onClick={() => deletePromptPreset(preset.id)}
                                                title="Delete preset"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
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
