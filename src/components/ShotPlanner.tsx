import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Monitor,
    Plus,
    Play,
    Loader2,
    Check,
    AlertCircle,
    Image as ImageIcon,
    Eye,
    RefreshCw,
    X,
    User,
    Box,
    Clapperboard,
    Smile
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Shot } from '../store/useStore';
import { initFiboAPI, buildBasePrompt } from '../api/fibo';
import './ShotPlanner.css';

const SHOT_TEMPLATES = [
    { id: 'character-turnaround', icon: User, name: 'Character Turnaround', count: '5 shots' },
    { id: 'product-360', icon: Box, name: 'Product 360°', count: '8 shots' },
    { id: 'storyboard', icon: Clapperboard, name: 'Storyboard Sequence', count: '6 shots' },
    { id: 'expression-sheet', icon: Smile, name: 'Expression Sheet', count: '9 shots' },
];

export function ShotPlanner() {
    const {
        currentProject,
        settings,
        isGenerating,
        currentGeneratingIndex,
        addShot,
        addShotsFromTemplate,
        updateShot,
        setEditingShotId,
        setIsGenerating,
        setCurrentGeneratingIndex,
        addToast
    } = useStore();

    // Base image preview state
    const [baseImage, setBaseImage] = useState<{
        url: string;
        structuredPrompt?: string;
        seed: number;
    } | null>(null);
    const [isPreviewingBase, setIsPreviewingBase] = useState(false);
    const [showBasePreview, setShowBasePreview] = useState(false);

    if (!currentProject) return null;

    const { shots } = currentProject;
    const hasValidPrompt = currentProject.prompt.trim().length > 10;
    const needsApiKey = settings.apiProvider !== 'demo' && settings.apiProvider !== 'local';
    const canGenerate = hasValidPrompt && shots.length > 0 && !isGenerating && (!needsApiKey || settings.apiKey);
    const canPreview = hasValidPrompt && !isGenerating && !isPreviewingBase && (!needsApiKey || settings.apiKey);

    const handleAddTemplate = (templateId: string) => {
        addShotsFromTemplate(templateId);
        addToast('success', `Added ${templateId.replace('-', ' ')} shots`);
    };

    const handleAddCustomShot = () => {
        addShot({
            name: `Shot ${shots.length + 1}`,
            cameraAngle: 0,
            cameraHeight: 0,
            fov: 50,
            framing: 'medium',
            instructions: '',
        });
    };

    // Generate base preview image first
    const handlePreviewBase = async () => {
        if (!hasValidPrompt) {
            addToast('error', 'Please enter a description first');
            return;
        }
        if (needsApiKey && !settings.apiKey) {
            addToast('error', `Please add your API key in Settings`);
            return;
        }

        setIsPreviewingBase(true);
        setShowBasePreview(true);

        try {
            const api = initFiboAPI(
                settings.apiKey,
                settings.imageSize,
                settings.qualitySteps,
                settings.apiProvider as 'fal' | 'bria' | 'demo'
            );

            const basePrompt = buildBasePrompt(currentProject.prompt, currentProject.styleSettings);
            addToast('info', 'Generating base preview...');

            const result = await api.generate(basePrompt + ', front view, professional photography');

            setBaseImage({
                url: result.images[0]?.url || '',
                structuredPrompt: result.structured_prompt,
                seed: result.seed
            });

            addToast('success', '✨ Base preview ready! Approve to generate all angles.');
        } catch (error) {
            console.error('Preview error:', error);
            addToast('error', 'Preview generation failed');
            setShowBasePreview(false);
        } finally {
            setIsPreviewingBase(false);
        }
    };

    // Generate full sequence using the approved base image
    const handleGenerateFromBase = async () => {
        if (!baseImage || shots.length === 0) {
            addToast('error', 'Please add shots first');
            return;
        }

        setShowBasePreview(false);
        setIsGenerating(true);
        setCurrentGeneratingIndex(0);

        try {
            const api = initFiboAPI(
                settings.apiKey,
                settings.imageSize,
                settings.qualitySteps,
                settings.apiProvider as 'fal' | 'bria' | 'demo'
            );

            // Reset all shots to pending
            shots.forEach(shot => {
                updateShot(shot.id, { status: 'pending', imageUrl: undefined, error: undefined });
            });

            // Generate each shot using the base structured prompt
            const results = await api.generateSequence(
                currentProject.prompt,
                shots,
                currentProject.styleSettings,
                (index, status, result) => {
                    setCurrentGeneratingIndex(index);

                    if (status === 'start') {
                        updateShot(shots[index].id, { status: 'generating' });
                    } else if (status === 'complete' && result) {
                        updateShot(shots[index].id, {
                            status: 'complete',
                            imageUrl: result.images[0]?.url,
                        });
                    } else if (status === 'error') {
                        updateShot(shots[index].id, {
                            status: 'error',
                            error: 'Generation failed',
                        });
                    }
                },
                baseImage.seed // Use same seed as base image
            );

            // Run consistency validation
            const imageUrls = results
                .filter(r => r.images && r.images.length > 0)
                .map(r => r.images[0].url);

            if (imageUrls.length >= 2) {
                addToast('info', 'Analyzing sequence consistency...');
                const { validateSequenceConsistency } = await import('../utils/consistency');
                const consistencyResult = await validateSequenceConsistency(imageUrls);

                useStore.getState().setConsistencyScore({
                    overall: consistencyResult.overall,
                    colorPalette: consistencyResult.colorPalette,
                    structure: consistencyResult.structure,
                    lighting: consistencyResult.lighting,
                });

                const emoji = consistencyResult.overall >= 80 ? '🎯' : consistencyResult.overall >= 60 ? '✓' : '⚠️';
                addToast('success', `${emoji} Consistency Score: ${consistencyResult.overall}%`);
            }

            addToast('success', `Successfully generated ${shots.length} shots!`);
        } catch (error) {
            console.error('Generation error:', error);
            addToast('error', 'Generation failed. Check your API key and try again.');
        } finally {
            setIsGenerating(false);
            setCurrentGeneratingIndex(-1);
        }
    };

    // Direct full sequence generation (original flow)
    const handleGenerate = async () => {
        if (!hasValidPrompt) {
            addToast('error', 'Please enter a character/scene description (min 10 chars)');
            return;
        }
        if (shots.length === 0) {
            addToast('error', 'Please add at least one shot');
            return;
        }
        if (needsApiKey && !settings.apiKey) {
            addToast('error', `Please add your ${settings.apiProvider.toUpperCase()} API key in Settings`);
            return;
        }

        setIsGenerating(true);
        setCurrentGeneratingIndex(0);

        try {
            const api = initFiboAPI(
                settings.apiKey,
                settings.imageSize,
                settings.qualitySteps,
                settings.apiProvider as 'fal' | 'bria' | 'demo'
            );

            shots.forEach(shot => {
                updateShot(shot.id, { status: 'pending', imageUrl: undefined, error: undefined });
            });

            const results = await api.generateSequence(
                currentProject.prompt,
                shots,
                currentProject.styleSettings,
                (index, status, result) => {
                    setCurrentGeneratingIndex(index);

                    if (status === 'start') {
                        updateShot(shots[index].id, { status: 'generating' });
                    } else if (status === 'complete' && result) {
                        updateShot(shots[index].id, {
                            status: 'complete',
                            imageUrl: result.images[0]?.url,
                        });
                    } else if (status === 'error') {
                        updateShot(shots[index].id, {
                            status: 'error',
                            error: 'Generation failed',
                        });
                    }
                }
            );

            const imageUrls = results
                .filter(r => r.images && r.images.length > 0)
                .map(r => r.images[0].url);

            if (imageUrls.length >= 2) {
                addToast('info', 'Analyzing sequence consistency...');
                const { validateSequenceConsistency } = await import('../utils/consistency');
                const consistencyResult = await validateSequenceConsistency(imageUrls);

                useStore.getState().setConsistencyScore({
                    overall: consistencyResult.overall,
                    colorPalette: consistencyResult.colorPalette,
                    structure: consistencyResult.structure,
                    lighting: consistencyResult.lighting,
                });

                const emoji = consistencyResult.overall >= 80 ? '🎯' : consistencyResult.overall >= 60 ? '✓' : '⚠️';
                addToast('success', `${emoji} Consistency Score: ${consistencyResult.overall}%`);
            }

            addToast('success', `Successfully generated ${shots.length} shots!`);
        } catch (error) {
            console.error('Generation error:', error);
            addToast('error', 'Generation failed. Check your API key and try again.');
        } finally {
            setIsGenerating(false);
            setCurrentGeneratingIndex(-1);
        }
    };

    const getShotStatusIcon = (shot: Shot, index: number) => {
        if (isGenerating && index === currentGeneratingIndex) {
            return <Loader2 size={16} className="spin" />;
        }
        switch (shot.status) {
            case 'complete':
                return <Check size={16} className="text-success" />;
            case 'error':
                return <AlertCircle size={16} className="text-error" />;
            default:
                return null;
        }
    };

    const estimatedTime = Math.ceil(shots.length * 0.5);

    return (
        <>
            <section className="panel panel-shots">
                <div className="panel-header">
                    <h2>
                        <Monitor size={18} />
                        Shot Planner
                    </h2>
                    <div className="panel-actions">
                        <button
                            className="btn btn-sm btn-ghost"
                            onClick={handleAddCustomShot}
                        >
                            <Plus size={16} />
                            Add Shot
                        </button>
                    </div>
                </div>

                <div className="panel-content">
                    {/* Shot Templates */}
                    <div className="shot-templates">
                        {SHOT_TEMPLATES.map((template) => {
                            const IconComponent = template.icon;
                            return (
                                <button
                                    key={template.id}
                                    className="template-btn"
                                    onClick={() => handleAddTemplate(template.id)}
                                >
                                    <span className="template-icon">
                                        <IconComponent size={20} />
                                    </span>
                                    <span className="template-name">{template.name}</span>
                                    <span className="template-count">{template.count}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Shot List */}
                    <div className="shot-list">
                        {shots.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">
                                    <ImageIcon size={48} strokeWidth={1} />
                                </div>
                                <h3>No Shots Added Yet</h3>
                                <p>Choose a template above or add individual shots to build your sequence</p>
                            </div>
                        ) : (
                            shots.map((shot, index) => (
                                <motion.div
                                    key={shot.id}
                                    className={`shot-card ${shot.status}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => setEditingShotId(shot.id)}
                                >
                                    <div className="shot-number">{index + 1}</div>
                                    <div className="shot-info">
                                        <div className="shot-name">{shot.name}</div>
                                        <div className="shot-details">
                                            <span>{shot.cameraAngle}°</span>
                                            <span>{shot.fov}mm</span>
                                            <span>{shot.framing}</span>
                                        </div>
                                    </div>
                                    {shot.imageUrl && (
                                        <div className="shot-thumb">
                                            <img src={shot.imageUrl} alt={shot.name} />
                                        </div>
                                    )}
                                    <div className="shot-status">
                                        {getShotStatusIcon(shot, index)}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Generate Buttons */}
                <div className="panel-footer">
                    <div className="generation-info">
                        <span className="shot-count">{shots.length} shot{shots.length !== 1 ? 's' : ''}</span>
                        <span className="separator">•</span>
                        <span className="estimate">~{estimatedTime} min</span>
                    </div>
                    <div className="footer-buttons">
                        {/* Preview Base Button */}
                        <button
                            className="btn btn-preview"
                            onClick={handlePreviewBase}
                            disabled={!canPreview}
                            title="Generate a preview first, then approve"
                        >
                            {isPreviewingBase ? (
                                <Loader2 size={18} className="spin" />
                            ) : (
                                <Eye size={18} />
                            )}
                            Preview
                        </button>

                        {/* Generate All Button */}
                        <button
                            className="btn btn-generate"
                            onClick={handleGenerate}
                            disabled={!canGenerate}
                            title={!canGenerate ? (
                                !hasValidPrompt ? "Enter a prompt (min 10 characters)" :
                                    shots.length === 0 ? "Add shots first" :
                                        needsApiKey && !settings.apiKey ? "Set API key in Settings or use Demo Mode" :
                                            isGenerating ? "Generation in progress" :
                                                "Ready to generate"
                            ) : "Generate all shots"}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 size={20} className="spin" />
                                    {currentGeneratingIndex + 1}/{shots.length}
                                </>
                            ) : (
                                <>
                                    <Play size={20} />
                                    Generate
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </section>

            {/* Base Preview Modal */}
            <AnimatePresence>
                {showBasePreview && (
                    <motion.div
                        className="base-preview-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !isPreviewingBase && setShowBasePreview(false)}
                    >
                        <motion.div
                            className="base-preview-modal"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="base-preview-header">
                                <h3>
                                    <Eye size={20} />
                                    Base Image Preview
                                </h3>
                                <button
                                    className="btn btn-ghost btn-icon"
                                    onClick={() => setShowBasePreview(false)}
                                    disabled={isPreviewingBase}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="base-preview-content">
                                {isPreviewingBase ? (
                                    <div className="preview-loading">
                                        <Loader2 size={48} className="spin" />
                                        <p>Generating base preview...</p>
                                        <span>This establishes your subject's appearance</span>
                                    </div>
                                ) : baseImage ? (
                                    <div className="preview-result">
                                        <img src={baseImage.url} alt="Base preview" />
                                        <div className="preview-info">
                                            {shots.length === 0 ? (
                                                <>
                                                    <p>✨ Great! Now add shots to generate from this reference.</p>
                                                    <div className="quick-templates">
                                                        {SHOT_TEMPLATES.slice(0, 2).map(t => {
                                                            const IconComp = t.icon;
                                                            return (
                                                                <button
                                                                    key={t.id}
                                                                    className="btn btn-sm btn-ghost"
                                                                    onClick={() => {
                                                                        addShotsFromTemplate(t.id);
                                                                        addToast('success', `Added ${t.count}`);
                                                                    }}
                                                                >
                                                                    <IconComp size={14} /> {t.name}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </>
                                            ) : (
                                                <p>Does this look right? All {shots.length} angles will be generated based on this reference.</p>
                                            )}
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            <div className="base-preview-footer">
                                <button
                                    className="btn btn-ghost"
                                    onClick={handlePreviewBase}
                                    disabled={isPreviewingBase}
                                >
                                    <RefreshCw size={16} />
                                    Regenerate
                                </button>
                                {shots.length === 0 ? (
                                    <button
                                        className="btn btn-generate"
                                        onClick={() => {
                                            addShotsFromTemplate('product-360');
                                            addToast('success', 'Added Product 360° template (8 shots)');
                                        }}
                                    >
                                        <Plus size={18} />
                                        Add Shots First
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-generate"
                                        onClick={handleGenerateFromBase}
                                        disabled={!baseImage || isPreviewingBase}
                                    >
                                        <Check size={18} />
                                        Generate {shots.length} Shots
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
