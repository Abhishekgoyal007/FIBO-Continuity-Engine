import { motion } from 'framer-motion';
import { Edit3, Camera, Image } from 'lucide-react';
import { useStore } from '../store/useStore';
import './MobileNav.css';

export function MobileNav() {
    const { activeTab, setActiveTab } = useStore();

    const tabs = [
        { id: 'input' as const, label: 'Input', icon: Edit3 },
        { id: 'shots' as const, label: 'Shots', icon: Camera },
        { id: 'output' as const, label: 'Output', icon: Image },
    ];

    return (
        <nav className="mobile-nav">
            <div className="mobile-nav-inner">
                {tabs.map((tab) => (
                    <motion.button
                        key={tab.id}
                        className={`mobile-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                        whileTap={{ scale: 0.95 }}
                    >
                        <tab.icon size={20} />
                        <span>{tab.label}</span>
                        {activeTab === tab.id && (
                            <motion.div
                                className="nav-indicator"
                                layoutId="mobileNavIndicator"
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        )}
                    </motion.button>
                ))}
            </div>
        </nav>
    );
}
