import { motion } from 'framer-motion';
import {
    Monitor,
    Plus,
    Play,
    Loader2,
    Check,
    AlertCircle,
    Image as ImageIcon
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Shot } from '../store/useStore';
import { initFiboAPI } from '../api/fibo';
import './ShotPlanner.css';

const SHOT_TEMPLATES = [
    { id: 'character-turnaround', icon: '👤', name: 'Character Turnaround', count: '5 shots' },
    { id: 'product-360', icon: '📦', name: 'Product 360°', count: '8 shots' },
    { id: 'storyboard', icon: '🎬', name: 'Storyboard Sequence', count: '6 shots' },
    { id: 'expression-sheet', icon: '😊', name: 'Expression Sheet', count: '9 shots' },
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

    if (!currentProject) return null;

    const { shots } = currentProject;
    const hasValidPrompt = currentProject.prompt.trim().length > 10;
    const needsApiKey = settings.apiProvider !== 'demo' && settings.apiProvider !== 'local';
    const canGenerate = hasValidPrompt && shots.length > 0 && !isGenerating && (!needsApiKey || settings.apiKey);

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

            // Reset all shots to pending
            shots.forEach(shot => {
                updateShot(shot.id, { status: 'pending', imageUrl: undefined, error: undefined });
            });

            // Generate each shot
            await api.generateSequence(
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

    const estimatedTime = Math.ceil(shots.length * 0.5); // ~30s per shot

    return (
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
                {/* Quick Shot Templates */}
                <div className="shot-templates">
                    {SHOT_TEMPLATES.map((template) => (
                        <button
                            key={template.id}
                            className="template-btn"
                            onClick={() => handleAddTemplate(template.id)}
                            disabled={isGenerating}
                        >
                            <span className="template-icon">{template.icon}</span>
                            <span className="template-name">{template.name}</span>
                            <span className="template-count">{template.count}</span>
                        </button>
                    ))}
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
                                onClick={() => setEditingShotId(shot.id)}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                whileHover={{ scale: 1.01 }}
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

            {/* Generate Button */}
            <div className="panel-footer">
                <div className="generation-info">
                    <span className="shot-count">{shots.length} shot{shots.length !== 1 ? 's' : ''}</span>
                    <span className="separator">•</span>
                    <span className="estimate">~{estimatedTime} min</span>
                </div>
                <button
                    className="btn btn-generate"
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                >
                    {isGenerating ? (
                        <>
                            <Loader2 size={20} className="spin" />
                            Generating {currentGeneratingIndex + 1}/{shots.length}...
                        </>
                    ) : (
                        <>
                            <Play size={20} />
                            Generate Sequence
                        </>
                    )}
                </button>
            </div>
        </section>
    );
}
