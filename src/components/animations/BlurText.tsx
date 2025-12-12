import { motion } from 'framer-motion';
import './BlurText.css';

interface BlurTextProps {
    text: string;
    delay?: number;
    className?: string;
}

export function BlurText({ text, delay = 0, className = '' }: BlurTextProps) {
    const words = text.split(' ');

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: delay }
        })
    };

    const child = {
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring',
                damping: 12,
                stiffness: 100
            }
        },
        hidden: {
            opacity: 0,
            filter: 'blur(10px)',
            y: 20
        }
    };

    return (
        <motion.span
            className={`blur-text ${className}`}
            variants={container}
            initial="hidden"
            animate="visible"
        >
            {words.map((word, index) => (
                <motion.span
                    key={index}
                    className="blur-word"
                    variants={child}
                >
                    {word}{' '}
                </motion.span>
            ))}
        </motion.span>
    );
}
