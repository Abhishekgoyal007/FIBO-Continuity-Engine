import { useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';

interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    action: () => void;
    description: string;
}

/**
 * Global keyboard shortcuts hook
 * Provides productivity shortcuts for power users
 */
export function useKeyboardShortcuts() {
    const {
        undo,
        redo,
        canUndo,
        canRedo,
        setShowSettings,
        setShowHistory,
        setShowPresets,
        toggleTheme,
        addToast
    } = useStore();

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Ignore if user is typing in an input
        const target = e.target as HTMLElement;
        if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable
        ) {
            // Only allow Ctrl/Cmd shortcuts in inputs
            if (!e.ctrlKey && !e.metaKey) return;
        }

        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const modifier = isMac ? e.metaKey : e.ctrlKey;

        // Undo: Ctrl/Cmd + Z
        if (modifier && !e.shiftKey && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            if (canUndo()) {
                undo();
                addToast('info', 'Undo');
            }
            return;
        }

        // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
        if (modifier && (
            (e.shiftKey && e.key.toLowerCase() === 'z') ||
            (!e.shiftKey && e.key.toLowerCase() === 'y')
        )) {
            e.preventDefault();
            if (canRedo()) {
                redo();
                addToast('info', 'Redo');
            }
            return;
        }

        // Settings: Ctrl/Cmd + ,
        if (modifier && e.key === ',') {
            e.preventDefault();
            setShowSettings(true);
            return;
        }

        // History: Ctrl/Cmd + H
        if (modifier && e.key.toLowerCase() === 'h') {
            e.preventDefault();
            setShowHistory(true);
            return;
        }

        // Presets: Ctrl/Cmd + P (prevent print)
        if (modifier && e.key.toLowerCase() === 'p') {
            e.preventDefault();
            setShowPresets(true);
            return;
        }

        // Toggle Theme: Ctrl/Cmd + D
        if (modifier && e.key.toLowerCase() === 'd') {
            e.preventDefault();
            toggleTheme();
            addToast('info', 'Theme toggled');
            return;
        }

        // Escape: Close modals
        if (e.key === 'Escape') {
            const store = useStore.getState();
            if (store.showSettings) {
                store.setShowSettings(false);
            } else if (store.showHistory) {
                store.setShowHistory(false);
            } else if (store.showPresets) {
                store.setShowPresets(false);
            } else if (store.showComparisonTool) {
                store.setShowComparisonTool(false);
            }
            return;
        }
    }, [undo, redo, canUndo, canRedo, setShowSettings, setShowHistory, setShowPresets, toggleTheme, addToast]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}

// Get list of all shortcuts for help display
export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
    { key: 'Z', ctrl: true, action: () => { }, description: 'Undo' },
    { key: 'Z', ctrl: true, shift: true, action: () => { }, description: 'Redo' },
    { key: 'Y', ctrl: true, action: () => { }, description: 'Redo' },
    { key: ',', ctrl: true, action: () => { }, description: 'Open Settings' },
    { key: 'H', ctrl: true, action: () => { }, description: 'Open History' },
    { key: 'P', ctrl: true, action: () => { }, description: 'Open Presets' },
    { key: 'D', ctrl: true, action: () => { }, description: 'Toggle Theme' },
    { key: 'Escape', action: () => { }, description: 'Close Modal' },
];
