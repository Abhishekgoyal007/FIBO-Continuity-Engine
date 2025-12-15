import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useStore } from '../store/useStore';
import './ThemeToggle.css';

export function ThemeToggle() {
    const { theme, toggleTheme } = useStore();

    return (
        <motion.button
            className="theme-toggle"
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            <div className="theme-toggle-track">
                <motion.div
                    className="theme-toggle-thumb"
                    animate={{
                        x: theme === 'dark' ? 0 : 22,
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                    {theme === 'dark' ? (
                        <Moon size={12} />
                    ) : (
                        <Sun size={12} />
                    )}
                </motion.div>
                <div className="theme-icons">
                    <Moon size={10} className={theme === 'dark' ? 'active' : ''} />
                    <Sun size={10} className={theme === 'light' ? 'active' : ''} />
                </div>
            </div>
        </motion.button>
    );
}
