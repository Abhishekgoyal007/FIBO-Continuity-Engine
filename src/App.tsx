import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Plus,
  Play,
  Download,
  Image as ImageIcon,
  Camera,
  Palette,
  Sun,
  Layers,
  X,
  Check,
  AlertCircle,
  Info
} from 'lucide-react';
import { useStore } from './store/useStore';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { ShotPlanner } from './components/ShotPlanner';
import { OutputGallery } from './components/OutputGallery';
import { SettingsModal } from './components/SettingsModal';
import { ShotEditorModal } from './components/ShotEditorModal';
import { Toast } from './components/Toast';
import './App.css';

function App() {
  const {
    currentProject,
    showSettings,
    showShotEditor,
    toasts,
    createProject,
    setShowSettings
  } = useStore();

  // Create a default project if none exists
  useEffect(() => {
    if (!currentProject) {
      createProject('New Project', '');
    }
  }, [currentProject, createProject]);

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
