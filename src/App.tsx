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
import './App.css';

function App() {
  const {
    currentProject,
    showSettings,
    showShotEditor,
    toasts,
    createProject
  } = useStore();

  // View state: 'landing' or 'app'
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [showOnboarding, setShowOnboarding] = useState(false);

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

  // Show landing page
  if (view === 'landing') {
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

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
        <InputPanel />

        {/* Center Panel: Shot Planner */}
        <ShotPlanner />

        {/* Right Panel: Output Gallery */}
        <OutputGallery />
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && <SettingsModal />}
      </AnimatePresence>

      {/* Shot Editor Modal */}
      <AnimatePresence>
        {showShotEditor && <ShotEditorModal />}
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
