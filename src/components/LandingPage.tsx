import { motion } from 'framer-motion';
import {
    Sparkles,
    Layers,
    Zap,
    ArrowRight,
    Play,
    Image,
    Gamepad2,
    Film,
    ShoppingBag,
    Palette,
    Github,
    Twitter,
    Clock,
    Target,
    Wand2,
    RotateCcw,
    CheckCircle,
    Cpu,
    Box
} from 'lucide-react';
import {
    Aurora,
    StarBorder,
    ClickSpark,
    GooeyNav,
    RotatingText,
    CountUp,
    Particles,
    ScrollProgress
} from './animations';
import './LandingPage.css';

interface LandingPageProps {
    onEnterApp: () => void;
}

export function LandingPage({ onEnterApp }: LandingPageProps) {

    const navItems = [
        { label: 'Home', href: '#' },
        { label: 'Features', href: '#features' },
        { label: 'How it works', href: '#workflow' },
        { label: 'Launch App', href: '#', onClick: onEnterApp }
    ];

    // Sample showcase images - FIBO generated samples
    const showcaseFrames = [
        { angle: '0°', label: 'Front', image: '/sample-1.jpg' },
        { angle: '45°', label: '3/4 View', image: '/sample-2.jpg' },
        { angle: '90°', label: 'Side', image: '/sample-3.jpg' },
        { angle: '180°', label: 'Back', image: '/sample-4.jpg' },
    ];

    return (
        <div className="landing-page">
            {/* Scroll Progress Bar */}
            <ScrollProgress />

            {/* Aurora Background */}
            <Aurora
                colorStops={["#3b82f6", "#8b5cf6", "#06b6d4"]}
                amplitude={1.2}
                blend={0.6}
                speed={0.4}
            />

            {/* Floating Particles */}
            <Particles count={50} />

            {/* Dark Overlay */}
            <div className="landing-overlay" />

            {/* Navigation */}
            <header className="landing-header">
                <div className="nav-logo">
                    <div className="logo-icon-animated">
                        <Box size={20} />
                    </div>
                    <span>FIBO</span>
                </div>
                <GooeyNav
                    items={navItems}
                    particleCount={15}
                    particleDistances={[90, 10]}
                    particleR={100}
                    initialActiveIndex={0}
                    animationTime={300}
                    timeVariance={150}
                    colors={[1, 1, 1, 1, 1, 1, 1, 1]}
                />
            </header>

            {/* Hero Section - Completely Redesigned */}
            <section className="hero">
                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* Powered by badge */}
                    <motion.div
                        className="hero-badge"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Sparkles size={14} />
                        <span>Powered by BRIA AI</span>
                    </motion.div>

                    {/* Main Headline */}
                    <h1 className="hero-title">
                        <span className="hero-title-main">One Subject.</span>
                        <br />
                        <span className="hero-title-gradient">Infinite Angles.</span>
                        <br />
                        <span className="hero-title-accent">
                            <RotatingText
                                texts={['Zero Inconsistency', 'Perfect Continuity', 'Any Perspective', '360° Freedom']}
                                mainClassName="rotating-highlight"
                                staggerFrom="last"
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '-120%' }}
                                staggerDuration={0.025}
                                splitLevelClassName="overflow-hidden"
                                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                                rotationInterval={2500}
                            />
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <motion.p
                        className="hero-subtitle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        AI-powered multi-frame consistency for characters, products & storyboards.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        className="hero-buttons"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <ClickSpark sparkColor="#fff" sparkSize={12} sparkRadius={50} sparkCount={8} duration={400} extraScale={1.5}>
                            <motion.button
                                className="btn-primary-hero"
                                onClick={onEnterApp}
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Zap size={18} />
                                Start Creating
                                <ArrowRight size={18} />
                            </motion.button>
                        </ClickSpark>
                        <motion.button
                            className="btn-secondary-hero"
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Play size={16} />
                            See How It Works
                        </motion.button>
                    </motion.div>
                </motion.div>

                {/* Animated 360° Preview */}
                <motion.div
                    className="hero-preview"
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                >
                    <div className="preview-showcase">
                        <div className="preview-frames">
                            {showcaseFrames.map((frame, index) => (
                                <motion.div
                                    key={frame.angle}
                                    className="preview-frame"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.8 + index * 0.1 }}
                                >
                                    <div className="frame-image">
                                        <img src={frame.image} alt={`${frame.label} view`} />
                                    </div>
                                    <div className="frame-info">
                                        <span className="frame-angle">{frame.angle}</span>
                                        <span className="frame-label">{frame.label}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="preview-badge">
                            <CheckCircle size={14} />
                            <span>100% Consistent</span>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <span className="section-tag">Features</span>
                    <h2>Why FIBO Changes Everything</h2>
                    <p>The first AI tool that truly understands multi-frame consistency</p>
                </motion.div>

                <div className="features-grid">
                    {[
                        {
                            icon: Layers,
                            title: 'Structured Prompts',
                            description: 'FIBO captures the DNA of your first image and applies it to all subsequent frames.',
                            highlight: 'Core Technology'
                        },
                        {
                            icon: RotateCcw,
                            title: '360° Turnarounds',
                            description: 'Create complete character turnarounds from front to back with perfect consistency.',
                            highlight: 'Most Popular'
                        },
                        {
                            icon: Cpu,
                            title: 'Smart Seed Lock',
                            description: 'Same seed + structured prompt = identical character across all angles.',
                            highlight: 'Unique to FIBO'
                        },
                        {
                            icon: Zap,
                            title: 'Lightning Fast',
                            description: 'Generate 8 consistent frames in under 30 seconds. Production-ready output.',
                            highlight: 'Performance'
                        }
                    ].map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            className="feature-card"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                        >
                            <div className="feature-highlight">{feature.highlight}</div>
                            <div className="feature-icon">
                                <feature.icon size={28} />
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stats-container">
                    <motion.div
                        className="stat-item"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="stat-icon"><Target size={24} /></div>
                        <div className="stat-value"><CountUp end={100} suffix="%" /></div>
                        <div className="stat-label">Consistency</div>
                    </motion.div>

                    <div className="stat-divider" />

                    <motion.div
                        className="stat-item"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="stat-icon"><Wand2 size={24} /></div>
                        <div className="stat-value"><CountUp end={8} suffix=" frames" /></div>
                        <div className="stat-label">Per Sequence</div>
                    </motion.div>

                    <div className="stat-divider" />

                    <motion.div
                        className="stat-item"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="stat-icon"><Clock size={24} /></div>
                        <div className="stat-value"><CountUp end={30} prefix="<" suffix="s" /></div>
                        <div className="stat-label">Generation</div>
                    </motion.div>
                </div>
            </section>

            {/* How It Works */}
            <section id="workflow" className="workflow-section">
                <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <span className="section-tag">How It Works</span>
                    <h2>Three Simple Steps</h2>
                    <p>From prompt to production-ready in seconds</p>
                </motion.div>

                <div className="workflow-steps">
                    {[
                        { num: '01', title: 'Describe', desc: 'Enter your subject prompt and choose a visual style', icon: Sparkles },
                        { num: '02', title: 'Configure', desc: 'Select angles, add shots, or use pre-built templates', icon: Layers },
                        { num: '03', title: 'Generate', desc: 'Get perfectly consistent multi-angle images instantly', icon: Image }
                    ].map((step, index) => (
                        <motion.div
                            key={step.num}
                            className="workflow-card"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 }}
                        >
                            <div className="workflow-num">{step.num}</div>
                            <div className="workflow-icon"><step.icon size={32} /></div>
                            <h3>{step.title}</h3>
                            <p>{step.desc}</p>
                            {index < 2 && <div className="workflow-connector"><ArrowRight size={20} /></div>}
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Use Cases */}
            <section className="use-cases-section">
                <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <span className="section-tag">Use Cases</span>
                    <h2>Built for Creators</h2>
                    <p>FIBO powers workflows across industries</p>
                </motion.div>

                <div className="use-cases-grid">
                    {[
                        { icon: Gamepad2, title: 'Game Dev', desc: 'Character sprites & asset turnarounds' },
                        { icon: Film, title: 'Animation', desc: 'Consistent storyboard sequences' },
                        { icon: ShoppingBag, title: 'E-Commerce', desc: '360° product photography' },
                        { icon: Palette, title: 'Design', desc: 'Style-consistent variations' }
                    ].map((useCase, index) => (
                        <motion.div
                            key={useCase.title}
                            className="use-case-card"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="use-case-icon"><useCase.icon size={28} /></div>
                            <h4>{useCase.title}</h4>
                            <p>{useCase.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Final CTA */}
            <section className="cta-section">
                <motion.div
                    className="cta-content"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2>Ready to Create?</h2>
                    <p>Start generating consistent multi-angle images now</p>
                    <ClickSpark sparkColor="#fff" sparkSize={12} sparkRadius={50} sparkCount={10} duration={400} extraScale={1.5}>
                        <StarBorder color="#00d9ff" speed="5s">
                            <button className="btn-cta" onClick={onEnterApp}>
                                <Zap size={20} />
                                <span>Launch FIBO Engine</span>
                                <ArrowRight size={20} />
                            </button>
                        </StarBorder>
                    </ClickSpark>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <div className="logo-icon-animated small">
                            <Box size={16} />
                        </div>
                        <span>FIBO Continuity Engine</span>
                    </div>
                    <div className="footer-links">
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer"><Github size={18} /></a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><Twitter size={18} /></a>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>Built for BRIA Hackathon 2025</p>
                    <p>Made with ❤️ by the FIBO Team</p>
                </div>
            </footer>
        </div>
    );
}
