import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Trash2, Camera } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Shot } from '../store/useStore';
import './ShotEditorModal.css';

const ANGLE_PRESETS = [
    { angle: 0, label: 'Front' },
    { angle: 45, label: '45°' },
    { angle: 90, label: 'Side' },
    { angle: 135, label: '135°' },
    { angle: 180, label: 'Back' },
];

const FOV_OPTIONS = [
    { value: 24, label: '24mm - Ultra Wide' },
    { value: 35, label: '35mm - Wide' },
    { value: 50, label: '50mm - Standard' },
    { value: 85, label: '85mm - Portrait' },
    { value: 135, label: '135mm - Telephoto' },
];

const FRAMING_OPTIONS: { value: Shot['framing']; label: string }[] = [
    { value: 'full', label: 'Full Body' },
    { value: 'cowboy', label: 'Cowboy Shot' },
    { value: 'medium', label: 'Medium Shot' },
    { value: 'closeup', label: 'Close-Up' },
    { value: 'extreme-closeup', label: 'Extreme Close-Up' },
];

export function ShotEditorModal() {
    const {
        currentProject,
        editingShotId,
        setShowShotEditor,
        setEditingShotId,
        updateShot,
        removeShot,
        addToast
    } = useStore();

    const shot = currentProject?.shots.find(s => s.id === editingShotId);

    const [formData, setFormData] = useState({
        name: '',
        cameraAngle: 0,
        cameraHeight: 0,
        fov: 50,
        framing: 'medium' as Shot['framing'],
        instructions: '',
    });

    useEffect(() => {
        if (shot) {
            setFormData({
                name: shot.name,
                cameraAngle: shot.cameraAngle,
                cameraHeight: shot.cameraHeight,
                fov: shot.fov,
                framing: shot.framing,
                instructions: shot.instructions,
            });
        }
    }, [shot]);

    if (!shot) return null;

    const handleClose = () => {
        setShowShotEditor(false);
        setEditingShotId(null);
    };

    const handleSave = () => {
        updateShot(shot.id, formData);
        addToast('success', `Updated "${formData.name}"`);
        handleClose();
    };

    const handleDelete = () => {
        if (confirm(`Delete "${shot.name}"?`)) {
            removeShot(shot.id);
            addToast('info', `Deleted "${shot.name}"`);
            handleClose();
        }
    };

    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
        >
            <motion.div
                className="modal-content modal-wide"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>Edit Shot</h2>
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={handleClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="shot-editor-grid">
                        {/* Preview */}
                        <div className="shot-preview">
                            {shot.imageUrl ? (
                                <img src={shot.imageUrl} alt={shot.name} />
                            ) : (
                                <div className="preview-placeholder">
                                    <Camera size={48} strokeWidth={1} />
                                    <span>Preview will update with settings</span>
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="shot-controls">
                            <div className="control-group">
                                <label>Shot Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Front View"
                                />
                            </div>

                            <div className="control-group">
                                <label>Camera Angle</label>
                                <div className="angle-selector">
                                    {ANGLE_PRESETS.map((preset) => (
                                        <button
                                            key={preset.angle}
                                            className={`angle-btn ${formData.cameraAngle === preset.angle ? 'active' : ''}`}
                                            onClick={() => setFormData(prev => ({ ...prev, cameraAngle: preset.angle }))}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="control-group">
                                <label>Camera Height: {formData.cameraHeight}°</label>
                                <div className="slider-with-value">
                                    <input
                                        type="range"
                                        min="-30"
                                        max="30"
                                        value={formData.cameraHeight}
                                        onChange={(e) => setFormData(prev => ({ ...prev, cameraHeight: parseInt(e.target.value) }))}
                                    />
                                </div>
                                <div className="range-labels">
                                    <span>Low Angle (-30°)</span>
                                    <span>High Angle (+30°)</span>
                                </div>
                            </div>

                            <div className="control-group">
                                <label>Field of View (Lens)</label>
                                <select
                                    value={formData.fov}
                                    onChange={(e) => setFormData(prev => ({ ...prev, fov: parseInt(e.target.value) }))}
                                >
                                    {FOV_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="control-group">
                                <label>Framing</label>
                                <select
                                    value={formData.framing}
                                    onChange={(e) => setFormData(prev => ({ ...prev, framing: e.target.value as Shot['framing'] }))}
                                >
                                    {FRAMING_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="control-group">
                                <label>Additional Instructions</label>
                                <textarea
                                    rows={2}
                                    value={formData.instructions}
                                    onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                                    placeholder="e.g., dynamic action pose, looking at camera..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        className="btn btn-ghost delete-btn"
                        onClick={handleDelete}
                    >
                        <Trash2 size={16} />
                        Delete
                    </button>
                    <div className="modal-footer-right">
                        <button
                            className="btn btn-ghost"
                            onClick={handleClose}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSave}
                        >
                            Save Shot
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
