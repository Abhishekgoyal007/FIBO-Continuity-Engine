import { useState } from 'react';
import { Edit3, Sun, Palette, ChevronDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { StyleSettings } from '../store/useStore';
import './InputPanel.css';

const STYLE_PRESETS: { id: StyleSettings['style']; icon: string; label: string }[] = [
    { id: 'photorealistic', icon: '📷', label: 'Photorealistic' },
    { id: 'cinematic', icon: '🎬', label: 'Cinematic' },
    { id: 'anime', icon: '🎨', label: 'Anime' },
    { id: 'concept', icon: '✏️', label: 'Concept Art' },
    { id: '3d', icon: '🎮', label: '3D Render' },
    { id: 'product', icon: '📦', label: 'Product Shot' },
];

const LIGHTING_OPTIONS = [
    { value: 'natural', label: 'Natural Daylight' },
    { value: 'golden', label: 'Golden Hour' },
    { value: 'studio', label: 'Studio Three-Point' },
    { value: 'dramatic', label: 'Dramatic Rim Light' },
    { value: 'neon', label: 'Neon/Cyberpunk' },
    { value: 'moonlight', label: 'Moonlight' },
    { value: 'overcast', label: 'Soft Overcast' },
];

const PALETTE_OPTIONS: { id: StyleSettings['colorPalette']; gradient: string; label: string }[] = [
    { id: 'auto', gradient: 'conic-gradient(from 0deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #ff6b6b)', label: 'Auto' },
    { id: 'warm', gradient: 'linear-gradient(90deg, #ff6b6b, #feca57, #ff9ff3)', label: 'Warm' },
    { id: 'cool', gradient: 'linear-gradient(90deg, #54a0ff, #5f27cd, #00d2d3)', label: 'Cool' },
    { id: 'neon', gradient: 'linear-gradient(90deg, #ff00ff, #00ffff, #00ff00)', label: 'Neon' },
    { id: 'muted', gradient: 'linear-gradient(90deg, #636e72, #b2bec3, #dfe6e9)', label: 'Muted' },
    { id: 'monochrome', gradient: 'linear-gradient(90deg, #2d3436, #636e72, #dfe6e9)', label: 'Mono' },
];

const DIRECTION_POSITIONS = [
    'top-left', 'top', 'top-right',
    'left', 'center', 'right',
    'bottom-left', 'bottom', 'bottom-right'
];

export function InputPanel() {
    const { currentProject, updateProject, updateStyleSettings } = useStore();
    const [expandedSections, setExpandedSections] = useState<string[]>([]);

    if (!currentProject) return null;

    const { styleSettings } = currentProject;

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
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
                {/* Quick Prompt Input */}
                <div className="input-group">
                    <label htmlFor="quickPrompt">Describe Your Subject</label>
                    <textarea
                        id="quickPrompt"
                        value={currentProject.prompt}
                        onChange={(e) => updateProject({ prompt: e.target.value })}
                        placeholder="e.g., A cyberpunk female assassin with neon blue hair, wearing a sleek black tactical suit with glowing circuit patterns..."
                        rows={5}
                    />
                    <span className="input-hint">
                        Keep it descriptive - FIBO will expand this into a structured prompt
                    </span>
                </div>

                {/* Style Presets */}
                <div className="input-group">
                    <label>Visual Style</label>
                    <div className="style-presets">
                        {STYLE_PRESETS.map((preset) => (
                            <button
                                key={preset.id}
                                className={`preset-btn ${styleSettings.style === preset.id ? 'active' : ''}`}
                                onClick={() => updateStyleSettings({ style: preset.id })}
                            >
                                <span className="preset-icon">{preset.icon}</span>
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Advanced Controls Accordion */}
                <div className="accordion">
                    {/* Lighting Section */}
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
                            <div className="control-row">
                                <label>Lighting Type</label>
                                <select
                                    value={styleSettings.lightingType}
                                    onChange={(e) => updateStyleSettings({ lightingType: e.target.value })}
                                >
                                    {LIGHTING_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="control-row">
                                <label>Light Direction</label>
                                <div className="direction-picker">
                                    {DIRECTION_POSITIONS.map((dir) => (
                                        <div
                                            key={dir}
                                            className={`direction-dot ${styleSettings.lightDirection === dir ? 'active' : ''}`}
                                            onClick={() => updateStyleSettings({ lightDirection: dir })}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Palette Section */}
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
                            <div className="palette-presets">
                                {PALETTE_OPTIONS.map((palette) => (
                                    <button
                                        key={palette.id}
                                        className={`palette-btn ${styleSettings.colorPalette === palette.id ? 'active' : ''}`}
                                        onClick={() => updateStyleSettings({ colorPalette: palette.id })}
                                    >
                                        <span
                                            className="palette-preview"
                                            style={{ background: palette.gradient }}
                                        />
                                        {palette.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
