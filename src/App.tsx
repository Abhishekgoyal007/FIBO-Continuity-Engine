import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from './store/useStore';
import { LandingPage } from './components/LandingPage';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { ShotPlanner } from './components/ShotPlanner';
import { OutputGallery } from './components/OutputGallery';
import { SettingsModal } from './components/SettingsModal';
import { ShotEditorModal } from './components/ShotEditorModal';
import { OnboardingTutorial } from './components/OnboardingTutorial';
import { Toast } from './components/Toast';
import { MobileNav } from './components/MobileNav';
import { HistoryModal } from './components/HistoryModal';
import { PresetsModal } from './components/PresetsModal';
import { ComparisonTool } from './components/ComparisonTool';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import './App.css';

function App() {
  const {
    currentProject,
    showSettings,
    showShotEditor,
    showHistory,
    showPresets,
    showComparisonTool,
    toasts,
    createProject,
    theme,
    activeTab
  } = useStore();

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // View state: 'landing' or 'app' - initialized to null to prevent hydration mismatch
  const [view, setView] = useState<'landing' | 'app' | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Sync view with URL on mount (client-side only)
  useEffect(() => {
    const path = window.location.pathname;
    setView(path === '/app' ? 'app' : 'landing');
  }, []);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setView(path === '/app' ? 'app' : 'landing');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Check if first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('fibo_visited');
    if (!hasVisited) {
      setShowOnboarding(true);
    }
  }, []);

  // Create a default project if none exists
  useEffect(() => {
    if (!currentProject) {
      createProject('New Project', '');
    }
  }, [currentProject, createProject]);

  const handleEnterApp = () => {
    // Update URL without page reload
    window.history.pushState({}, '', '/app');
    setView('app');
    // Show onboarding on first visit
    const hasVisited = localStorage.getItem('fibo_visited');
    if (!hasVisited) {
      setShowOnboarding(true);
      localStorage.setItem('fibo_visited', 'true');
    }
  };

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
  };

  // Show loading state while determining initial view (prevents hydration mismatch)
  if (view === null) {
    return (
      <div className="app" style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary, #0a0a0f)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(139, 92, 246, 0.3)',
          borderTopColor: '#8b5cf6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  // Show landing page
  if (view === 'landing') {
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

  // Determine which panel is active (for mobile)
  const getPanelClassName = (panelType: 'input' | 'shots' | 'output') => {
    return `panel panel-${panelType} ${activeTab === panelType ? 'active' : ''}`;
  };

  // Show main app
  return (
    <div className="app">
      {/* Animated Background */}
      <div className="bg-animation">
        <div className="bg-gradient"></div>
        <div className="bg-grid"></div>
      </div>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="app-main">
        {/* Left Panel: Input & Configuration */}
        <section className={getPanelClassName('input')}>
          <InputPanel />
        </section>

        {/* Center Panel: Shot Planner */}
        <section className={getPanelClassName('shots')}>
          <ShotPlanner />
        </section>

        {/* Right Panel: Output Gallery */}
        <section className={getPanelClassName('output')}>
          <OutputGallery />
        </section>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && <SettingsModal />}
      </AnimatePresence>

      {/* Shot Editor Modal */}
      <AnimatePresence>
        {showShotEditor && <ShotEditorModal />}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && <HistoryModal />}
      </AnimatePresence>

      {/* Presets Modal */}
      <AnimatePresence>
        {showPresets && <PresetsModal />}
      </AnimatePresence>

      {/* Comparison Tool */}
      <AnimatePresence>
        {showComparisonTool && <ComparisonTool />}
      </AnimatePresence>

      {/* Onboarding Tutorial */}
      <AnimatePresence>
        {showOnboarding && <OnboardingTutorial onClose={handleCloseOnboarding} />}
      </AnimatePresence>

      {/* Toast Notifications */}
      <div className="toast-container">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
