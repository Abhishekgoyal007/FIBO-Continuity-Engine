import { motion } from 'framer-motion';
import {
    Sparkles,
    Layers,
    Zap,
    ArrowRight,
    Play,
    Image,
    Download
} from 'lucide-react';
import {
    Aurora,
    StarBorder,
    ClickSpark,
    GooeyNav,
    RotatingText,
    ScrollStack,
    ScrollStackItem
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

    return (
        <div className="landing-page">
            {/* Aurora Background */}
            <Aurora
                colorStops={["#60ed56", "#a967e8", "#3b82f6"]}
                amplitude={1.0}
                blend={0.5}
                speed={0.5}
            />

            {/* Dark Overlay */}
            <div className="landing-overlay" />

            {/* Navigation with GooeyNav */}
            <header className="landing-header">
                <div className="nav-logo">
                    <img src="/logo.png" alt="FIBO" className="logo-image" />
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

            {/* Hero Section */}
            <section className="hero">
                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="hero-badge">
                        <Sparkles size={14} />
                        <span>BRIA AI Platform</span>
                    </div>

                    <h1 className="hero-title">
                        <span className="hero-title-italic">Bring the Magic to you,</span>
                        <br />
                        <span className="hero-title-italic">with </span>
                        <RotatingText
                            texts={['one click', 'FIBO Engine', 'AI power', 'consistency']}
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
                    </h1>

                    <div className="hero-buttons">
                        <ClickSpark sparkColor="#fff" sparkSize={12} sparkRadius={50} sparkCount={8} duration={400} extraScale={1.5}>
                            <motion.button
                                className="btn-primary-hero"
                                onClick={onEnterApp}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Get Started
                            </motion.button>
                        </ClickSpark>
                        <ClickSpark sparkColor="#fff" sparkSize={10} sparkRadius={40} sparkCount={8} duration={400}>
                            <motion.button
                                className="btn-secondary-hero"
                                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Learn More
                            </motion.button>
                        </ClickSpark>
                    </div>
                </motion.div>
            </section>

            {/* ScrollStack Features Section */}
            <section id="features" className="scroll-stack-section">
                <ScrollStack>
                    <ScrollStackItem>
                        <span className="stack-card-number">01</span>
                        <div className="stack-card-icon">
                            <Sparkles size={28} />
                        </div>
                        <h3>One-Click Consistency</h3>
                        <p>Generate perfectly consistent multi-frame sequences with a single click. FIBO ensures every frame maintains the same style, lighting, and character details.</p>
                    </ScrollStackItem>

                    <ScrollStackItem>
                        <span className="stack-card-number">02</span>
                        <div className="stack-card-icon">
                            <Layers size={28} />
                        </div>
                        <h3>Smart Structured Prompts</h3>
                        <p>FIBO captures the DNA of your first generation and applies it to all frames. No more manual prompt engineering for each angle.</p>
                    </ScrollStackItem>

                    <ScrollStackItem>
                        <span className="stack-card-number">03</span>
                        <div className="stack-card-icon">
                            <Image size={28} />
                        </div>
                        <h3>Character Turnarounds</h3>
                        <p>Create 360° character views for animation, games, or product design. Front, side, back, and 3/4 views - all perfectly matched.</p>
                    </ScrollStackItem>

                    <ScrollStackItem>
                        <span className="stack-card-number">04</span>
                        <div className="stack-card-icon">
                            <Play size={28} />
                        </div>
                        <h3>Storyboard Sequences</h3>
                        <p>Generate scene-by-scene storyboards where characters and environments stay consistent throughout your narrative.</p>
                    </ScrollStackItem>

                    <ScrollStackItem>
                        <span className="stack-card-number">05</span>
                        <div className="stack-card-icon">
                            <Download size={28} />
                        </div>
                        <h3>Production Ready Export</h3>
                        <p>Export your sequences as individual images, contact sheets, or animated GIFs. Ready for production in seconds.</p>
                    </ScrollStackItem>
                </ScrollStack>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <motion.div
                    className="cta-card"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2>Ready to create consistent sequences?</h2>
                    <p>Start generating production-ready multi-frame content now.</p>
                    <ClickSpark sparkColor="#fff" sparkSize={12} sparkRadius={50} sparkCount={8} duration={400} extraScale={1.5}>
                        <StarBorder color="#00d9ff" speed="5s">
                            <button className="btn-hero" onClick={onEnterApp}>
                                <Zap size={18} />
                                <span>Launch FIBO Engine</span>
                                <ArrowRight size={18} />
                            </button>
                        </StarBorder>
                    </ClickSpark>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <div className="logo-mark" />
                        <span>FIBO Continuity Engine</span>
                    </div>
                    <p>Built for the BRIA Hackathon 2025</p>
                </div>
            </footer>
        </div>
    );
}
