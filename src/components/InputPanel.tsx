import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Edit3,
    Sun,
    Palette,
    ChevronDown,
    Sparkles,
    Loader2,
    Check
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

    if (!currentProject) return null;

    const { styleSettings } = currentProject;

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
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
                                    {styleSettings.style === preset.id && (
                                        <div className="preset-selected">
                                            <Check size={14} />
                                        </div>
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
                                            {styleSettings.lightingType === preset.id && (
                                                <div className="preset-selected">
                                                    <Check size={12} />
                                                </div>
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
                                            {styleSettings.colorPalette === palette.id && (
                                                <div className="preset-selected">
                                                    <Check size={12} />
                                                </div>
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
