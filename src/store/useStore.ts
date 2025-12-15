import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// Types
// ============================================

export interface Shot {
  id: string;
  name: string;
  cameraAngle: number;
  cameraHeight: number;
  fov: number;
  framing: 'full' | 'cowboy' | 'medium' | 'closeup' | 'extreme-closeup';
  instructions: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  imageUrl?: string;
  jsonPrompt?: string;
  error?: string;
}

export interface GenerationSettings {
  apiProvider: 'demo' | 'fal' | 'bria' | 'replicate' | 'local';
  apiKey: string;
  imageSize: '1024x1024' | '1024x768' | '768x1024' | '1280x720';
  qualitySteps: number;
}

export interface StyleSettings {
  style: 'photorealistic' | 'cinematic' | 'anime' | 'concept' | '3d' | 'product';
  lightingType: string;
  lightDirection: string;
  colorPalette: 'auto' | 'warm' | 'cool' | 'neon' | 'muted' | 'monochrome';
}

export interface Project {
  id: string;
  name: string;
  prompt: string;
  referenceImage?: string;
  styleSettings: StyleSettings;
  shots: Shot[];
  baseJsonPrompt?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsistencyScore {
  overall: number;
  colorPalette: number;
  structure: number;
  lighting: number;
}

// History Entry for Undo/Redo
export interface HistoryEntry {
  id: string;
  timestamp: Date;
  action: string;
  projectState: Project;
}

// Generation History Entry
export interface GenerationHistoryEntry {
  id: string;
  timestamp: Date;
  prompt: string;
  shots: Array<{
    name: string;
    imageUrl: string;
    cameraAngle: number;
  }>;
  styleSettings: StyleSettings;
  consistencyScore?: ConsistencyScore;
}

// Prompt Preset
export interface PromptPreset {
  id: string;
  name: string;
  prompt: string;
  styleSettings: StyleSettings;
  createdAt: Date;
}

// Theme type
export type Theme = 'dark' | 'light';

// Export Format
export type ExportFormat = 'png' | 'jpg' | 'webp';

interface AppState {
  // Current Project
  currentProject: Project | null;
  projects: Project[];

  // Generation Settings
  settings: GenerationSettings;

  // Theme
  theme: Theme;

  // UI State
  isGenerating: boolean;
  currentGeneratingIndex: number;
  generationProgress: number; // 0-100 percentage
  generationStatus: string; // Human readable status message
  showSettings: boolean;
  showShotEditor: boolean;
  showComparisonTool: boolean;
  showHistory: boolean;
  showPresets: boolean;
  editingShotId: string | null;
  activeTab: 'input' | 'shots' | 'output'; // For mobile view

  // Consistency Analysis
  consistencyScore: ConsistencyScore | null;

  // History for Undo/Redo
  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];
  maxHistorySize: number;

  // Generation History
  generationHistory: GenerationHistoryEntry[];

  // Prompt Presets
  promptPresets: PromptPreset[];

  // Export Settings
  exportFormat: ExportFormat;
  exportWithMetadata: boolean;

  // Toast notifications
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
  }>;

  // Actions
  createProject: (name: string, prompt: string) => void;
  updateProject: (updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (project: Project | null) => void;

  // Shot Actions
  addShot: (shot: Omit<Shot, 'id' | 'status'>) => void;
  updateShot: (id: string, updates: Partial<Shot>) => void;
  removeShot: (id: string) => void;
  reorderShots: (startIndex: number, endIndex: number) => void;
  addShotsFromTemplate: (templateId: string) => void;
  regenerateShot: (id: string) => void;

  // Style Actions
  updateStyleSettings: (settings: Partial<StyleSettings>) => void;

  // Settings Actions
  updateSettings: (settings: Partial<GenerationSettings>) => void;

  // Theme Actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  // UI Actions
  setShowSettings: (show: boolean) => void;
  setShowShotEditor: (show: boolean) => void;
  setShowComparisonTool: (show: boolean) => void;
  setShowHistory: (show: boolean) => void;
  setShowPresets: (show: boolean) => void;
  setEditingShotId: (id: string | null) => void;
  setActiveTab: (tab: 'input' | 'shots' | 'output') => void;

  // Generation Actions
  setIsGenerating: (generating: boolean) => void;
  setCurrentGeneratingIndex: (index: number) => void;
  setGenerationProgress: (progress: number, status?: string) => void;
  setGenerationStatus: (status: string) => void;
  setBaseJsonPrompt: (prompt: string) => void;

  // Consistency
  setConsistencyScore: (score: ConsistencyScore | null) => void;

  // History/Undo-Redo Actions
  pushToHistory: (action: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Generation History Actions
  addToGenerationHistory: (entry: Omit<GenerationHistoryEntry, 'id' | 'timestamp'>) => void;
  clearGenerationHistory: () => void;

  // Prompt Preset Actions
  savePromptPreset: (name: string) => void;
  loadPromptPreset: (id: string) => void;
  deletePromptPreset: (id: string) => void;
  importPresets: (presets: PromptPreset[]) => void;
  exportPresets: () => PromptPreset[];

  // Export Actions
  setExportFormat: (format: ExportFormat) => void;
  setExportWithMetadata: (include: boolean) => void;

  // Toast Actions
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;
}

// ============================================
// Shot Templates
// ============================================

const SHOT_TEMPLATES: Record<string, Omit<Shot, 'id' | 'status'>[]> = {
  'character-turnaround': [
    { name: 'Front View', cameraAngle: 0, cameraHeight: 0, fov: 50, framing: 'full', instructions: 'facing directly at camera, front of body visible' },
    { name: '3/4 Left', cameraAngle: 45, cameraHeight: 0, fov: 50, framing: 'full', instructions: 'three-quarter view from left, slight turn' },
    { name: 'Side View', cameraAngle: 90, cameraHeight: 0, fov: 50, framing: 'full', instructions: 'perfect side profile, facing left' },
    { name: '3/4 Back', cameraAngle: 135, cameraHeight: 0, fov: 50, framing: 'full', instructions: 'three-quarter back view, showing mostly back with partial profile' },
    { name: 'Back View', cameraAngle: 180, cameraHeight: 0, fov: 50, framing: 'full', instructions: 'BACK OF CHARACTER ONLY, do not show face, subject facing away from camera, show back of head and body' },
  ],
  'product-360': [
    { name: 'Front', cameraAngle: 0, cameraHeight: 0, fov: 50, framing: 'medium', instructions: 'front facing view' },
    { name: '45°', cameraAngle: 45, cameraHeight: 0, fov: 50, framing: 'medium', instructions: 'angled 45 degrees from front' },
    { name: '90°', cameraAngle: 90, cameraHeight: 0, fov: 50, framing: 'medium', instructions: 'side view, 90 degrees' },
    { name: '135°', cameraAngle: 135, cameraHeight: 0, fov: 50, framing: 'medium', instructions: 'rear angle, 135 degrees, showing back' },
    { name: '180°', cameraAngle: 180, cameraHeight: 0, fov: 50, framing: 'medium', instructions: 'BACK VIEW ONLY, 180 degrees, rear of subject' },
    { name: '225°', cameraAngle: 225, cameraHeight: 0, fov: 50, framing: 'medium', instructions: 'rear angle, 225 degrees, showing back' },
    { name: '270°', cameraAngle: 270, cameraHeight: 0, fov: 50, framing: 'medium', instructions: 'side view, 270 degrees' },
    { name: '315°', cameraAngle: 315, cameraHeight: 0, fov: 50, framing: 'medium', instructions: 'angled 315 degrees from front' },
  ],
  'storyboard': [
    { name: 'Establishing Wide', cameraAngle: 30, cameraHeight: 5, fov: 24, framing: 'full', instructions: 'wide establishing shot' },
    { name: 'Medium Shot', cameraAngle: 0, cameraHeight: 0, fov: 50, framing: 'medium', instructions: '' },
    { name: 'Close-Up', cameraAngle: 10, cameraHeight: 0, fov: 85, framing: 'closeup', instructions: 'emotional close-up' },
    { name: 'Over Shoulder', cameraAngle: 160, cameraHeight: 5, fov: 50, framing: 'medium', instructions: 'over the shoulder perspective' },
    { name: 'Low Angle Hero', cameraAngle: 0, cameraHeight: -20, fov: 35, framing: 'cowboy', instructions: 'heroic low angle shot' },
    { name: 'Dutch Tilt Action', cameraAngle: 45, cameraHeight: 0, fov: 35, framing: 'medium', instructions: 'dynamic dutch angle' },
  ],
  'expression-sheet': [
    { name: 'Neutral', cameraAngle: 0, cameraHeight: 0, fov: 85, framing: 'closeup', instructions: 'neutral expression' },
    { name: 'Happy', cameraAngle: 10, cameraHeight: 0, fov: 85, framing: 'closeup', instructions: 'happy, smiling expression' },
    { name: 'Sad', cameraAngle: -10, cameraHeight: 5, fov: 85, framing: 'closeup', instructions: 'sad, melancholic expression' },
    { name: 'Angry', cameraAngle: 0, cameraHeight: -5, fov: 85, framing: 'closeup', instructions: 'angry, intense expression' },
    { name: 'Surprised', cameraAngle: 5, cameraHeight: 0, fov: 85, framing: 'closeup', instructions: 'surprised, shocked expression' },
    { name: 'Thoughtful', cameraAngle: 20, cameraHeight: 0, fov: 85, framing: 'closeup', instructions: 'thoughtful, contemplative expression' },
    { name: 'Determined', cameraAngle: 0, cameraHeight: -10, fov: 85, framing: 'closeup', instructions: 'determined, focused expression' },
    { name: 'Playful', cameraAngle: -15, cameraHeight: 5, fov: 85, framing: 'closeup', instructions: 'playful, mischievous expression' },
    { name: 'Confident', cameraAngle: 0, cameraHeight: 0, fov: 85, framing: 'closeup', instructions: 'confident, self-assured expression' },
  ],
};

// ============================================
// Store Implementation
// ============================================

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentProject: null,
      projects: [],
      settings: {
        apiProvider: 'bria',
        apiKey: '',
        imageSize: '1024x1024',
        qualitySteps: 50,
      },
      theme: 'dark',
      isGenerating: false,
      currentGeneratingIndex: -1,
      generationProgress: 0,
      generationStatus: '',
      showSettings: false,
      showShotEditor: false,
      showComparisonTool: false,
      showHistory: false,
      showPresets: false,
      editingShotId: null,
      activeTab: 'input',
      consistencyScore: null,
      toasts: [],

      // History state
      undoStack: [],
      redoStack: [],
      maxHistorySize: 50,

      // Generation history
      generationHistory: [],

      // Prompt presets
      promptPresets: [],

      // Export settings
      exportFormat: 'png',
      exportWithMetadata: true,

      // Project Actions
      createProject: (name, prompt) => {
        const newProject: Project = {
          id: generateId(),
          name,
          prompt,
          styleSettings: {
            style: 'photorealistic',
            lightingType: 'natural',
            lightDirection: 'center',
            colorPalette: 'auto',
          },
          shots: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          projects: [...state.projects, newProject],
          currentProject: newProject,
        }));
      },

      updateProject: (updates) => {
        set((state) => {
          if (!state.currentProject) return state;
          const updatedProject = {
            ...state.currentProject,
            ...updates,
            updatedAt: new Date(),
          };
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            ),
          };
        });
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProject: state.currentProject?.id === id ? null : state.currentProject,
        }));
      },

      setCurrentProject: (project) => set({ currentProject: project, consistencyScore: null }),

      // Shot Actions
      addShot: (shot) => {
        const newShot: Shot = {
          ...shot,
          id: generateId(),
          status: 'pending',
        };
        set((state) => {
          if (!state.currentProject) return state;
          const updatedProject = {
            ...state.currentProject,
            shots: [...state.currentProject.shots, newShot],
            updatedAt: new Date(),
          };
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            ),
          };
        });
      },

      updateShot: (id, updates) => {
        set((state) => {
          if (!state.currentProject) return state;
          const updatedProject = {
            ...state.currentProject,
            shots: state.currentProject.shots.map((shot) =>
              shot.id === id ? { ...shot, ...updates } : shot
            ),
            updatedAt: new Date(),
          };
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            ),
          };
        });
      },

      removeShot: (id) => {
        set((state) => {
          if (!state.currentProject) return state;
          const updatedProject = {
            ...state.currentProject,
            shots: state.currentProject.shots.filter((shot) => shot.id !== id),
            updatedAt: new Date(),
          };
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            ),
          };
        });
      },

      reorderShots: (startIndex, endIndex) => {
        set((state) => {
          if (!state.currentProject) return state;
          const shots = [...state.currentProject.shots];
          const [removed] = shots.splice(startIndex, 1);
          shots.splice(endIndex, 0, removed);
          const updatedProject = {
            ...state.currentProject,
            shots,
            updatedAt: new Date(),
          };
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            ),
          };
        });
      },

      addShotsFromTemplate: (templateId) => {
        const templateShots = SHOT_TEMPLATES[templateId];
        if (!templateShots) return;

        templateShots.forEach((shot) => {
          get().addShot(shot);
        });
      },

      regenerateShot: (id) => {
        set((state) => {
          if (!state.currentProject) return state;
          const updatedProject = {
            ...state.currentProject,
            shots: state.currentProject.shots.map((shot) =>
              shot.id === id ? { ...shot, status: 'pending' as const, imageUrl: undefined, error: undefined } : shot
            ),
            updatedAt: new Date(),
          };
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            ),
          };
        });
      },

      // Style Actions
      updateStyleSettings: (settings) => {
        set((state) => {
          if (!state.currentProject) return state;
          const updatedProject = {
            ...state.currentProject,
            styleSettings: { ...state.currentProject.styleSettings, ...settings },
            updatedAt: new Date(),
          };
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            ),
          };
        });
      },

      // Settings Actions
      updateSettings: (settings) => {
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }));
      },

      // Theme Actions
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme);
      },

      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        get().setTheme(newTheme);
      },

      // UI Actions
      setShowSettings: (show) => set({ showSettings: show }),
      setShowShotEditor: (show) => set({ showShotEditor: show }),
      setShowComparisonTool: (show) => set({ showComparisonTool: show }),
      setShowHistory: (show) => set({ showHistory: show }),
      setShowPresets: (show) => set({ showPresets: show }),
      setEditingShotId: (id) => set({ editingShotId: id, showShotEditor: !!id }),
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Generation Actions
      setIsGenerating: (generating) => set({
        isGenerating: generating,
        generationProgress: generating ? 0 : 0,
        generationStatus: generating ? 'Starting...' : ''
      }),
      setCurrentGeneratingIndex: (index) => set({ currentGeneratingIndex: index }),
      setGenerationProgress: (progress: number, status?: string) => set(state => ({
        generationProgress: progress,
        generationStatus: status || state.generationStatus
      })),
      setGenerationStatus: (status: string) => set({ generationStatus: status }),
      setBaseJsonPrompt: (prompt) => {
        set((state) => {
          if (!state.currentProject) return state;
          return {
            currentProject: {
              ...state.currentProject,
              baseJsonPrompt: prompt,
            },
          };
        });
      },

      // Consistency
      setConsistencyScore: (score) => set({ consistencyScore: score }),

      // History/Undo-Redo Actions
      pushToHistory: (action) => {
        const state = get();
        if (!state.currentProject) return;

        const entry: HistoryEntry = {
          id: generateId(),
          timestamp: new Date(),
          action,
          projectState: JSON.parse(JSON.stringify(state.currentProject)),
        };

        set((s) => ({
          undoStack: [...s.undoStack.slice(-s.maxHistorySize + 1), entry],
          redoStack: [], // Clear redo stack on new action
        }));
      },

      undo: () => {
        const state = get();
        if (state.undoStack.length === 0 || !state.currentProject) return;

        const lastEntry = state.undoStack[state.undoStack.length - 1];
        const currentEntry: HistoryEntry = {
          id: generateId(),
          timestamp: new Date(),
          action: 'undo',
          projectState: JSON.parse(JSON.stringify(state.currentProject)),
        };

        set({
          undoStack: state.undoStack.slice(0, -1),
          redoStack: [...state.redoStack, currentEntry],
          currentProject: lastEntry.projectState,
        });
      },

      redo: () => {
        const state = get();
        if (state.redoStack.length === 0) return;

        const nextEntry = state.redoStack[state.redoStack.length - 1];
        const currentEntry: HistoryEntry = {
          id: generateId(),
          timestamp: new Date(),
          action: 'redo',
          projectState: JSON.parse(JSON.stringify(state.currentProject!)),
        };

        set({
          redoStack: state.redoStack.slice(0, -1),
          undoStack: [...state.undoStack, currentEntry],
          currentProject: nextEntry.projectState,
        });
      },

      canUndo: () => get().undoStack.length > 0,
      canRedo: () => get().redoStack.length > 0,

      // Generation History Actions
      addToGenerationHistory: (entry) => {
        const newEntry: GenerationHistoryEntry = {
          ...entry,
          id: generateId(),
          timestamp: new Date(),
        };
        set((state) => ({
          generationHistory: [newEntry, ...state.generationHistory].slice(0, 100), // Keep last 100
        }));
      },

      clearGenerationHistory: () => set({ generationHistory: [] }),

      // Prompt Preset Actions
      savePromptPreset: (name) => {
        const state = get();
        if (!state.currentProject) return;

        const preset: PromptPreset = {
          id: generateId(),
          name,
          prompt: state.currentProject.prompt,
          styleSettings: state.currentProject.styleSettings,
          createdAt: new Date(),
        };

        set((s) => ({
          promptPresets: [...s.promptPresets, preset],
        }));

        state.addToast('success', `Preset "${name}" saved`);
      },

      loadPromptPreset: (id) => {
        const state = get();
        const preset = state.promptPresets.find((p) => p.id === id);
        if (!preset || !state.currentProject) return;

        state.updateProject({
          prompt: preset.prompt,
          styleSettings: preset.styleSettings,
        });

        state.addToast('success', `Loaded preset "${preset.name}"`);
      },

      deletePromptPreset: (id) => {
        set((state) => ({
          promptPresets: state.promptPresets.filter((p) => p.id !== id),
        }));
      },

      importPresets: (presets) => {
        set((state) => ({
          promptPresets: [...state.promptPresets, ...presets],
        }));
        get().addToast('success', `Imported ${presets.length} presets`);
      },

      exportPresets: () => get().promptPresets,

      // Export Actions
      setExportFormat: (format) => set({ exportFormat: format }),
      setExportWithMetadata: (include) => set({ exportWithMetadata: include }),

      // Toast Actions
      addToast: (type, message) => {
        const toast = { id: generateId(), type, message };
        set((state) => ({ toasts: [...state.toasts, toast] }));
        setTimeout(() => {
          get().removeToast(toast.id);
        }, 5000);
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },
    }),
    {
      name: 'fibo-continuity-engine',
      partialize: (state) => ({
        projects: state.projects,
        settings: state.settings,
        theme: state.theme,
        promptPresets: state.promptPresets,
        generationHistory: state.generationHistory.slice(0, 20), // Only persist last 20
        exportFormat: state.exportFormat,
        exportWithMetadata: state.exportWithMetadata,
      }),
    }
  )
);
