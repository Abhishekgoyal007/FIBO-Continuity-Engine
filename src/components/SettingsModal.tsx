import { motion } from 'framer-motion';
import { X, Sparkles, Zap, Cloud, HardDrive } from 'lucide-react';
import { useStore } from '../store/useStore';
import './SettingsModal.css';

const API_PROVIDERS = [
    {
        id: 'bria',
        name: 'BRIA Platform',
        description: '1000 free API calls per month (Recommended)',
        icon: Zap,
        free: true,
        recommended: true,
        link: 'https://platform.bria.ai/console/account/api-keys'
    },
    {
        id: 'demo',
        name: 'Demo Mode',
        description: 'Test UI with placeholder images (no API key needed)',
        icon: Sparkles,
        free: true
    },
    {
        id: 'fal',
        name: 'Fal.ai',
        description: 'Fast inference, pay-per-use',
        icon: Cloud,
        free: false,
        link: 'https://fal.ai/dashboard/keys'
    },
    {
        id: 'local',
        name: 'Local Inference',
        description: 'Run FIBO on your own GPU (16GB+ VRAM)',
        icon: HardDrive,
        free: true,
        disabled: true
    },
];

export function SettingsModal() {
    const { settings, updateSettings, setShowSettings, addToast } = useStore();

    const handleSave = () => {
        if (settings.apiProvider !== 'demo' && !settings.apiKey.trim()) {
            addToast('error', 'Please enter an API key or use Demo Mode');
            return;
        }
        addToast('success', 'Settings saved');
        setShowSettings(false);
    };

    const selectedProvider = API_PROVIDERS.find(p => p.id === settings.apiProvider);

    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
        >
            <motion.div
                className="modal-content"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>Settings</h2>
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => setShowSettings(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="settings-section">
                        <h3>API Provider</h3>
                        <div className="provider-grid">
                            {API_PROVIDERS.map((provider) => {
                                const Icon = provider.icon;
                                return (
                                    <button
                                        key={provider.id}
                                        className={`provider-card ${settings.apiProvider === provider.id ? 'active' : ''} ${provider.disabled ? 'disabled' : ''}`}
                                        onClick={() => !provider.disabled && updateSettings({ apiProvider: provider.id as any })}
                                        disabled={provider.disabled}
                                    >
                                        <div className="provider-icon">
                                            <Icon size={20} />
                                        </div>
                                        <div className="provider-info">
                                            <span className="provider-name">
                                                {provider.name}
                                                {provider.free && <span className="free-badge">FREE</span>}
                                            </span>
                                            <span className="provider-desc">{provider.description}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {settings.apiProvider !== 'demo' && (
                        <div className="settings-section">
                            <h3>API Key</h3>
                            <div className="input-group">
                                <input
                                    type="password"
                                    id="apiKey"
                                    value={settings.apiKey}
                                    onChange={(e) => updateSettings({ apiKey: e.target.value })}
                                    placeholder="Enter your API key"
                                />
                                {selectedProvider?.link && (
                                    <span className="input-hint">
                                        Get your key at{' '}
                                        <a href={selectedProvider.link} target="_blank" rel="noopener noreferrer">
                                            {selectedProvider.link.replace('https://', '').split('/')[0]}
                                        </a>
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="settings-section">
                        <h3>Generation Settings</h3>
                        <div className="input-group">
                            <label htmlFor="imageSize">Image Size</label>
                            <select
                                id="imageSize"
                                value={settings.imageSize}
                                onChange={(e) => updateSettings({ imageSize: e.target.value as any })}
                            >
                                <option value="1024x1024">1024 × 1024 (Square)</option>
                                <option value="1024x768">1024 × 768 (Landscape)</option>
                                <option value="768x1024">768 × 1024 (Portrait)</option>
                                <option value="1280x720">1280 × 720 (16:9)</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label htmlFor="quality">Quality Steps: {settings.qualitySteps}</label>
                            <input
                                type="range"
                                id="quality"
                                min="20"
                                max="100"
                                value={settings.qualitySteps}
                                onChange={(e) => updateSettings({ qualitySteps: parseInt(e.target.value) })}
                            />
                            <div className="range-labels">
                                <span>Fast (20)</span>
                                <span>Quality (100)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        className="btn btn-ghost"
                        onClick={() => setShowSettings(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                    >
                        Save Settings
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
