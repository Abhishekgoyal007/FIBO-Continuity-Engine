import { Settings, Plus, FolderOpen } from 'lucide-react';
import { useStore } from '../store/useStore';
import './Header.css';

export function Header() {
    const { currentProject, setShowSettings, createProject } = useStore();

    const handleNewProject = () => {
        const name = prompt('Enter project name:', 'New Project');
        if (name) {
            createProject(name, '');
        }
    };

    return (
        <header className="app-header">
            <div className="logo-section">
                <div className="logo-icon">
                    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="40" height="40" rx="10" fill="url(#logo-gradient)" />
                        <path d="M12 14H28M12 20H24M12 26H20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="28" cy="26" r="4" fill="white" />
                        <defs>
                            <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40">
                                <stop stopColor="#6366f1" />
                                <stop offset="1" stopColor="#ec4899" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <div className="logo-text">
                    <h1>FIBO Continuity Engine</h1>
                    <span className="tagline">Perfect Multi-Frame Consistency</span>
                </div>
            </div>

            <div className="header-center">
                {currentProject && (
                    <div className="project-name">
                        <FolderOpen size={16} />
                        <span>{currentProject.name}</span>
                    </div>
                )}
            </div>

            <div className="header-actions">
                <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => setShowSettings(true)}
                    title="Settings"
                >
                    <Settings size={20} />
                </button>
                <button
                    className="btn btn-primary"
                    onClick={handleNewProject}
                >
                    <Plus size={18} />
                    New Project
                </button>
            </div>
        </header>
    );
}
