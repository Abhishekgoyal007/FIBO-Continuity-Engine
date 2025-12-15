import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Edit3,
    Sun,
    Palette,
    ChevronDown,
    Sparkles,
    Loader2,
    Upload,
    X,
    Image as ImageIcon
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { StyleSettings } from '../store/useStore';
import { enhancePrompt, suggestImprovements } from '../utils/promptEnhancer';
import { LIGHTING_PRESETS, COLOR_PALETTES, STYLE_PRESETS } from '../utils/visualPresets';
import './InputPanel.css';

export function InputPanel() {
    const {
        currentProject,
        updateProject,
        updateStyleSettings,
        addToast
    } = useStore();

    const [expandedSections, setExpandedSections] = useState<string[]>(['style']);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [referenceImage, setReferenceImage] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!currentProject) return null;

    const { styleSettings } = currentProject;

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };

    // Handle file upload
    const handleFileUpload = (file: File) => {
        if (!file.type.startsWith('image/')) {
            addToast('error', 'Please upload an image file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            addToast('error', 'Image must be less than 10MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            setReferenceImage(dataUrl);
            updateProject({ referenceImage: dataUrl });
            addToast('success', 'Reference image uploaded!');
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const removeImage = () => {
        setReferenceImage(null);
        updateProject({ referenceImage: undefined });
        addToast('info', 'Reference image removed');
    };

    // Enhance prompt using Gemini AI
    const handleEnhancePrompt = async () => {
        if (!currentProject.prompt.trim()) {
            addToast('error', 'Please enter a prompt first');
            return;
        }

        setIsEnhancing(true);
        try {
            // Try with Gemini API key if available (can add in settings)
            const result = await enhancePrompt(
                currentProject.prompt,
                styleSettings.style,
                undefined // Could add Gemini API key to settings
            );

            updateProject({ prompt: result.enhanced });

            if (result.suggestions.length > 0) {
                setSuggestions(result.suggestions);
            }

            addToast('success', '✨ Prompt enhanced!');
        } catch (error) {
            console.error('Enhancement failed:', error);
            addToast('error', 'Could not enhance prompt');
        } finally {
            setIsEnhancing(false);
        }
    };

    // Check for improvements as user types
    const handlePromptChange = (value: string) => {
        updateProject({ prompt: value });

        if (value.length > 10) {
            const newSuggestions = suggestImprovements(value);
            setSuggestions(newSuggestions);
        } else {
            setSuggestions([]);
        }
    };

    return (
        <section className="panel panel-input">
            <div className="panel-header">
                <h2>
                    <Edit3 size={18} />
                    Character & Scene
                </h2>
            </div>

            <div className="panel-content">
                {/* Enhanced Prompt Input with AI Button */}
                <div className="input-group prompt-group">
                    <div className="prompt-header">
                        <label htmlFor="quickPrompt">Describe Your Subject</label>
                        <button
                            className="btn btn-sm btn-enhance"
                            onClick={handleEnhancePrompt}
                            disabled={isEnhancing || !currentProject.prompt.trim()}
                            title="Enhance with AI"
                        >
                            {isEnhancing ? (
                                <Loader2 size={14} className="spin" />
                            ) : (
                                <Sparkles size={14} />
                            )}
                            Enhance
                        </button>
                    </div>
                    <textarea
                        id="quickPrompt"
                        value={currentProject.prompt}
                        onChange={(e) => handlePromptChange(e.target.value)}
                        placeholder="e.g., Square glass perfume bottle with gold cap, clear liquid, 'LUXE' label, on marble surface"
                        rows={4}
                    />

                    {/* Prompt Suggestions */}
                    <AnimatePresence>
                        {suggestions.length > 0 && (
                            <motion.div
                                className="prompt-suggestions"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                {suggestions.map((suggestion, i) => (
                                    <div key={i} className="suggestion-item">
                                        <span className="suggestion-icon">💡</span>
                                        {suggestion}
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Reference Image Upload */}
                <div className="input-group">
                    <label>Reference Image (Optional)</label>
                    <div
                        className={`image-upload-zone ${isDragging ? 'dragging' : ''} ${referenceImage ? 'has-image' : ''}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file);
                            }}
                            style={{ display: 'none' }}
                        />

                        {referenceImage ? (
                            <div className="image-preview">
                                <img src={referenceImage} alt="Reference" />
                                <button
                                    className="remove-image-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeImage();
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="upload-placeholder">
                                <Upload size={24} />
                                <span>Drop image here or click to upload</span>
                                <small>PNG, JPG up to 10MB</small>
                            </div>
                        )}
                    </div>
                </div>

                {/* Visual Style Presets with Images */}
                <div className="input-group">
                    <label>Visual Style</label>
                    <div className="visual-style-grid">
                        {STYLE_PRESETS.map((preset) => (
                            <motion.button
                                key={preset.id}
                                className={`visual-preset-card ${styleSettings.style === preset.id ? 'active' : ''}`}
                                onClick={() => updateStyleSettings({ style: preset.id as StyleSettings['style'] })}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="preset-preview">
                                    {preset.previewImage ? (
                                        <img src={preset.previewImage} alt={preset.name} />
                                    ) : (
                                        <div className="preset-gradient" style={{ background: preset.cssGradient }} />
                                    )}
                                </div>
                                <span className="preset-label">{preset.name}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Advanced Controls Accordion */}
                <div className="accordion">
                    {/* Lighting Section with Visual Presets */}
                    <div className={`accordion-item ${expandedSections.includes('lighting') ? 'open' : ''}`}>
                        <button
                            className="accordion-header"
                            onClick={() => toggleSection('lighting')}
                        >
                            <span>
                                <Sun size={18} />
                                Lighting & Mood
                            </span>
                            <ChevronDown size={16} className="accordion-arrow" />
                        </button>
                        <div className="accordion-content">
                            <div className="visual-lighting-grid">
                                {LIGHTING_PRESETS.map((preset) => (
                                    <motion.button
                                        key={preset.id}
                                        className={`lighting-preset-card ${styleSettings.lightingType === preset.id ? 'active' : ''}`}
                                        onClick={() => updateStyleSettings({ lightingType: preset.id })}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        <div className="lighting-preview">
                                            {preset.previewImage ? (
                                                <img src={preset.previewImage} alt={preset.name} />
                                            ) : (
                                                <div className="preset-gradient" style={{ background: preset.cssGradient }} />
                                            )}
                                        </div>
                                        <span className="lighting-label">{preset.name}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Color Palette Section with Visual Presets */}
                    <div className={`accordion-item ${expandedSections.includes('palette') ? 'open' : ''}`}>
                        <button
                            className="accordion-header"
                            onClick={() => toggleSection('palette')}
                        >
                            <span>
                                <Palette size={18} />
                                Color Palette
                            </span>
                            <ChevronDown size={16} className="accordion-arrow" />
                        </button>
                        <div className="accordion-content">
                            <div className="visual-palette-grid">
                                {COLOR_PALETTES.map((palette) => (
                                    <motion.button
                                        key={palette.id}
                                        className={`palette-preset-card ${styleSettings.colorPalette === palette.id ? 'active' : ''}`}
                                        onClick={() => updateStyleSettings({ colorPalette: palette.id as StyleSettings['colorPalette'] })}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        <div className="palette-preview-large">
                                            {palette.previewImage ? (
                                                <img src={palette.previewImage} alt={palette.name} />
                                            ) : (
                                                <div className="preset-gradient" style={{ background: palette.cssGradient }} />
                                            )}
                                        </div>
                                        <span className="palette-label">{palette.name}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
