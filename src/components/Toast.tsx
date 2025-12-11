import { motion } from 'framer-motion';
import { Check, AlertCircle, Info, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import './Toast.css';

interface ToastProps {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
}

export function Toast({ id, type, message }: ToastProps) {
    const { removeToast } = useStore();

    const icons = {
        success: <Check size={18} />,
        error: <AlertCircle size={18} />,
        info: <Info size={18} />,
    };

    return (
        <motion.div
            className={`toast toast-${type}`}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
        >
            <span className={`toast-icon toast-icon-${type}`}>
                {icons[type]}
            </span>
            <span className="toast-message">{message}</span>
            <button
                className="toast-close"
                onClick={() => removeToast(id)}
            >
                <X size={14} />
            </button>
        </motion.div>
    );
}
