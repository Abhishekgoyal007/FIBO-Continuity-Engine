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

interface AppState {
  // Current Project
  currentProject: Project | null;
  projects: Project[];

  // Generation Settings
  settings: GenerationSettings;

  // UI State
  isGenerating: boolean;
  currentGeneratingIndex: number;
  showSettings: boolean;
  showShotEditor: boolean;
  editingShotId: string | null;

  // Consistency Analysis
  consistencyScore: ConsistencyScore | null;

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

  // Style Actions
  updateStyleSettings: (settings: Partial<StyleSettings>) => void;

  // Settings Actions
  updateSettings: (settings: Partial<GenerationSettings>) => void;

  // UI Actions
  setShowSettings: (show: boolean) => void;
  setShowShotEditor: (show: boolean) => void;
  setEditingShotId: (id: string | null) => void;

  // Generation Actions
  setIsGenerating: (generating: boolean) => void;
  setCurrentGeneratingIndex: (index: number) => void;
  setBaseJsonPrompt: (prompt: string) => void;

  // Consistency
  setConsistencyScore: (score: ConsistencyScore | null) => void;

  // Toast Actions
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;
}

// ============================================
// Shot Templates
// ============================================

const SHOT_TEMPLATES: Record<string, Omit<Shot, 'id' | 'status'>[]> = {
  'character-turnaround': [
    { name: 'Front View', cameraAngle: 0, cameraHeight: 0, fov: 50, framing: 'full', instructions: 'facing directly at camera' },
    { name: '3/4 Left', cameraAngle: 45, cameraHeight: 0, fov: 50, framing: 'full', instructions: 'three-quarter view from left' },
    { name: 'Side View', cameraAngle: 90, cameraHeight: 0, fov: 50, framing: 'full', instructions: 'profile view' },
    { name: '3/4 Back', cameraAngle: 135, cameraHeight: 0, fov: 50, framing: 'full', instructions: 'three-quarter view from back' },
    { name: 'Back View', cameraAngle: 180, cameraHeight: 0, fov: 50, framing: 'full', instructions: 'facing away from camera' },
  ],
  'product-360': [
    { name: 'Front', cameraAngle: 0, cameraHeight: 0, fov: 50, framing: 'medium', instructions: '' },
    { name: '45°', cameraAngle: 45, cameraHeight: 0, fov: 50, framing: 'medium', instructions: '' },
    { name: '90°', cameraAngle: 90, cameraHeight: 0, fov: 50, framing: 'medium', instructions: '' },
    { name: '135°', cameraAngle: 135, cameraHeight: 0, fov: 50, framing: 'medium', instructions: '' },
    { name: '180°', cameraAngle: 180, cameraHeight: 0, fov: 50, framing: 'medium', instructions: '' },
    { name: '225°', cameraAngle: 225, cameraHeight: 0, fov: 50, framing: 'medium', instructions: '' },
    { name: '270°', cameraAngle: 270, cameraHeight: 0, fov: 50, framing: 'medium', instructions: '' },
    { name: '315°', cameraAngle: 315, cameraHeight: 0, fov: 50, framing: 'medium', instructions: '' },
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
      isGenerating: false,
      currentGeneratingIndex: -1,
      showSettings: false,
      showShotEditor: false,
      editingShotId: null,
      consistencyScore: null,
      toasts: [],

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

      // UI Actions
      setShowSettings: (show) => set({ showSettings: show }),
      setShowShotEditor: (show) => set({ showShotEditor: show }),
      setEditingShotId: (id) => set({ editingShotId: id, showShotEditor: !!id }),

      // Generation Actions
      setIsGenerating: (generating) => set({ isGenerating: generating }),
      setCurrentGeneratingIndex: (index) => set({ currentGeneratingIndex: index }),
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
      }),
    }
  )
);
