import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Pencil,
    Eye,
    Zap,
    ArrowRight,
    X,
    Sparkles
} from 'lucide-react';
import './OnboardingTutorial.css';

interface OnboardingTutorialProps {
    onClose: () => void;
}

const STEPS = [
    {
        icon: Pencil,
        title: 'Describe Your Subject',
        description: 'Enter a detailed description of what you want to generate. The more specific, the better!',
        tip: 'Example: "Elegant glass perfume bottle with gold cap on marble surface"'
    },
    {
        icon: Eye,
        title: 'Preview Base Image',
        description: 'Click "Preview" to generate a reference image. This establishes the visual DNA for consistency.',
        tip: 'FIBO captures the structured prompt to ensure all frames match'
    },
    {
        icon: Zap,
        title: 'Generate Sequence',
        description: 'Choose a template or add custom shots. Click "Generate" to create your consistent multi-frame sequence!',
        tip: 'All angles will maintain the same style, colors, and details'
    }
];

export function OnboardingTutorial({ onClose }: OnboardingTutorialProps) {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose();
        }
    };

    const handleSkip = () => {
        onClose();
    };

    const step = STEPS[currentStep];
    const Icon = step.icon;

    return (
        <motion.div
            className="onboarding-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="onboarding-modal"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
                {/* Close Button */}
                <button className="onboarding-close" onClick={handleSkip}>
                    <X size={18} />
                </button>

                {/* Header */}
                <div className="onboarding-header">
                    <div className="onboarding-badge">
                        <Sparkles size={12} />
                        <span>Quick Start</span>
                    </div>
                    <div className="onboarding-steps">
                        {STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`step-dot ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'complete' : ''}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        className="onboarding-content"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="onboarding-icon">
                            <Icon size={32} />
                        </div>

                        <div className="step-number">Step {currentStep + 1} of {STEPS.length}</div>

                        <h2>{step.title}</h2>
                        <p>{step.description}</p>

                        <div className="onboarding-tip">
                            <span className="tip-label">💡 Tip:</span>
                            <span>{step.tip}</span>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Footer */}
                <div className="onboarding-footer">
                    <button className="btn btn-ghost" onClick={handleSkip}>
                        Skip Tutorial
                    </button>
                    <button className="btn btn-primary onboarding-next" onClick={handleNext}>
                        <span>{currentStep === STEPS.length - 1 ? 'Get Started' : 'Next'}</span>
                        <ArrowRight size={16} />
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
