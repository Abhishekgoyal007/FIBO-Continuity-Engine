import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import './DecryptedText.css';

interface DecryptedTextProps {
    text: string;
    speed?: number;
    className?: string;
    encrypted?: boolean;
    revealDirection?: 'start' | 'end' | 'center';
    onComplete?: () => void;
}

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*';

export function DecryptedText({
    text,
    speed = 50,
    className = '',
    encrypted = true,
    onComplete
}: DecryptedTextProps) {
    const [displayText, setDisplayText] = useState(encrypted ? scrambleText(text) : text);
    const [isRevealing, setIsRevealing] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLSpanElement>(null);

    function scrambleText(str: string): string {
        return str.split('').map(char =>
            char === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)]
        ).join('');
    }

    useEffect(() => {
        if (!encrypted) {
            setDisplayText(text);
            return;
        }

        // Start reveal after a small delay
        const startTimeout = setTimeout(() => {
            setIsRevealing(true);
            let currentIndex = 0;
            const textLength = text.length;

            intervalRef.current = setInterval(() => {
                setDisplayText(() => {
                    const revealed = text.slice(0, currentIndex + 1);
                    const scrambled = scrambleText(text.slice(currentIndex + 1));
                    return revealed + scrambled;
                });

                currentIndex++;

                if (currentIndex >= textLength) {
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                    }
                    setDisplayText(text);
                    setIsRevealing(false);
                    onComplete?.();
                }
            }, speed);
        }, 500);

        return () => {
            clearTimeout(startTimeout);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [text, speed, encrypted, onComplete]);

    return (
        <motion.span
            ref={containerRef}
            className={`decrypted-text ${className} ${isRevealing ? 'revealing' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {displayText.split('').map((char, i) => (
                <span
                    key={i}
                    className={`char ${i < text.indexOf(displayText[i]) ? 'revealed' : 'scrambled'}`}
                    style={{
                        animationDelay: `${i * 20}ms`
                    }}
                >
                    {char}
                </span>
            ))}
        </motion.span>
    );
}
