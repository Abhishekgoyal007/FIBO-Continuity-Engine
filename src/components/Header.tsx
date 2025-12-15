import { FolderOpen, Settings, Plus } from 'lucide-react';
import { useStore } from '../store/useStore';
import './Header.css';

export function Header() {
    const { currentProject, setShowSettings, createProject } = useStore();

    const handleNewProject = () => {
        createProject('New Project', '');
    };

    return (
        <header className="app-header">
            <div className="header-left">
                <div className="logo">
                    <img src="/logo.png" alt="FIBO" className="logo-image" />
                    <div className="logo-text">
                        <span className="logo-title">FIBO Continuity Engine</span>
                        <span className="logo-tagline">Perfect Multi-Frame Consistency</span>
                    </div>
                </div>
            </div>

            <div className="header-center">
                <button className="project-btn">
                    <FolderOpen size={16} />
                    <span>{currentProject?.name || 'New Project'}</span>
                </button>
            </div>

            <div className="header-right">
                <button
                    className="btn btn-ghost btn-icon header-btn"
                    onClick={() => setShowSettings(true)}
                    title="Settings"
                >
                    <Settings size={18} />
                </button>
                <button
                    className="btn btn-primary header-new-btn"
                    onClick={handleNewProject}
                >
                    <Plus size={16} />
                    <span>New Project</span>
                </button>
            </div>
        </header>
    );
}
