# 🎬 FIBO Continuity Engine

> **One-Click Perfectly Consistent Multi-Frame Generator**

Built for the [FIBO Hackathon](https://fibo-hackathon.devpost.com/) by Bria AI.

![FIBO Continuity Engine](./preview.png)

## 🎯 The Problem

Every professional studio struggles with this challenge:

> *"How do we generate 5–20 shots of the SAME character/environment/product, with the exact same look, style, lighting, textures, proportions, and color?"*

Traditional AI models fail at this because they can't maintain consistency across multiple frames. Each generation introduces drift in character appearance, lighting direction, color palette, and proportions.

## 💡 The Solution

**FIBO Continuity Engine** leverages FIBO's unique JSON-native capabilities to solve multi-frame consistency:

- **JSON-Native Control**: 1,000+ word structured prompts with deterministic parameters
- **Disentangled Generation**: Change camera angles WITHOUT affecting character/scene consistency  
- **Iterative Refinement**: Keep base prompt constant, only modify camera/composition
- **Automated Validation**: Color histogram & structural analysis to catch drift

## ✨ Features

### 🎥 Shot Planner
- Pre-built shot templates:
  - **Character Turnaround** (5 shots: Front, 45°, Side, 135°, Back)
  - **Product 360°** (8 shots at 45° intervals)
  - **Storyboard Sequence** (6 cinematic shots)
  - **Expression Sheet** (9 emotional expressions)
- Custom camera angle, FOV, and composition controls
- Lighting direction and color palette management

### 🔄 Sequence Generator
- Generate 6-20 consistent frames from a single character/scene description
- Automatic JSON parameter injection for each shot
- Batch processing with real-time progress tracking

### ✅ Consistency Validator
- Real-time color histogram comparison
- Silhouette/structure analysis
- Auto-regeneration for frames that break consistency

### 📦 Export Options
- Download individual frames (PNG)
- Export complete sequence as ZIP
- Full-size lightbox preview

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Fal.ai API key ([Get one free here](https://fal.ai/dashboard/keys))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/fibo-continuity-engine.git
cd fibo-continuity-engine

# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage

1. **Enter your API key** in Settings (gear icon)
2. **Describe your character/scene** in the left panel
3. **Choose a shot template** or add custom shots
4. **Click "Generate Sequence"** and watch the magic happen!

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Animations**: Framer Motion
- **API Integration**: @fal-ai/client
- **Export**: JSZip + FileSaver

## 🎯 Hackathon Categories

This project targets:
- **Best Overall** - Showcasing JSON-native control and professional parameters
- **Best New User Experience or Professional Tool** - Production-ready workflow for studios

## 📸 Screenshots

### Main Interface
The three-panel layout provides intuitive workflow:
- **Left**: Character/Scene description and style settings
- **Center**: Shot planner with templates and custom shots
- **Right**: Generated sequence gallery with export options

### Shot Templates
Quick-start with professional shot configurations:
- Character Turnaround for game dev & animation
- Product 360° for e-commerce
- Storyboard Sequence for film/video
- Expression Sheet for character design

## 🔧 Configuration

### API Providers
| Provider | Status | Notes |
|----------|--------|-------|
| Fal.ai | ✅ Supported | Recommended - Fast & reliable |
| Replicate | 🔄 Planned | Coming soon |
| Bria Platform | 🔄 Planned | Direct integration |
| Local Inference | 🔄 Planned | Requires GPU |

### Camera Presets
| Preset | Angle | FOV | Description |
|--------|-------|-----|-------------|
| Front | 0° | 50mm | Standard front view |
| Side | 90° | 50mm | Profile view |
| 45° | 45° | 50mm | Three-quarter view |
| Back | 180° | 50mm | Rear view |
| Close-up | 0° | 85mm | Detail shot |
| Low Angle | 0° (-20° height) | 35mm | Heroic shot |
| High Angle | 0° (+20° height) | 35mm | Overview shot |

## 🏆 Why This Wins

| Judging Criteria | How We Excel |
|------------------|--------------|
| **Usage of FIBO** | Leverages JSON-native prompts, camera params, lighting, color palette - impossible without FIBO's disentanglement |
| **Potential Impact** | Solves real problems for game studios, e-commerce, film production |
| **Innovation** | First tool to offer multi-shot consistency with automated validation |

## 📄 License

MIT License - Built for FIBO Hackathon 2025

---

**Made with ❤️ for the FIBO Hackathon**

*Powered by [BRIA FIBO](https://huggingface.co/briaai/FIBO) - The first JSON-native text-to-image model*
