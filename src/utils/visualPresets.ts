/**
 * Visual Presets for Lighting, Mood, and Color Palettes
 * 
 * Provides visual previews for style selections so users can
 * see what each option looks like before selecting.
 */

// Import visual style images
import photorealisticImg from '../assets/visual-styles/photorealistic.png';
import cinematicImg from '../assets/visual-styles/cinematic.png';
import productImg from '../assets/visual-styles/product.png';
import animeImg from '../assets/visual-styles/anime.png';
import conceptArtImg from '../assets/visual-styles/concept-art.png';
import render3dImg from '../assets/visual-styles/3d-render.png';

// Import lighting preset images
import naturalImg from '../assets/lighting-preset/natural.png';
import goldenHourImg from '../assets/lighting-preset/golden-hour.png';
import studioImg from '../assets/lighting-preset/studio.png';
import dramaticImg from '../assets/lighting-preset/dramatic.png';
import neonGlowImg from '../assets/lighting-preset/neon-glow.png';
import moonlightImg from '../assets/lighting-preset/moonlight.png';

// Import color palette images
import warmImg from '../assets/color-palettes/warm.png';
import coolImg from '../assets/color-palettes/cool.png';
import neutralImg from '../assets/color-palettes/neutral.png';
import vibrantImg from '../assets/color-palettes/vibrant.png';
import monochromeImg from '../assets/color-palettes/monochrome.png';

export interface VisualPreset {
    id: string;
    name: string;
    description: string;
    previewImage: string;
    cssGradient: string;
    promptModifier: string;
}

// Visual style presets with local images
export const STYLE_PRESETS: VisualPreset[] = [
    {
        id: 'photorealistic',
        name: 'Photorealistic',
        description: 'Like a real photograph',
        previewImage: photorealisticImg,
        cssGradient: 'linear-gradient(135deg, #2C3E50 0%, #3498DB 100%)',
        promptModifier: 'photorealistic, professional DSLR photography, 8K resolution, sharp focus'
    },
    {
        id: 'cinematic',
        name: 'Cinematic',
        description: 'Movie-like dramatic look',
        previewImage: cinematicImg,
        cssGradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        promptModifier: 'cinematic film still, anamorphic lens, movie scene, dramatic lighting, color graded'
    },
    {
        id: 'product',
        name: 'Product Shot',
        description: 'E-commerce ready',
        previewImage: productImg,
        cssGradient: 'linear-gradient(135deg, #FFFFFF 0%, #F0F0F0 100%)',
        promptModifier: 'professional product photography, studio lighting, clean white background, commercial'
    },
    {
        id: 'anime',
        name: 'Anime',
        description: 'Japanese animation style',
        previewImage: animeImg,
        cssGradient: 'linear-gradient(135deg, #FF6B9D 0%, #C44569 100%)',
        promptModifier: 'anime style illustration, vibrant colors, clean lines, detailed shading'
    },
    {
        id: 'concept',
        name: 'Concept Art',
        description: 'Digital painting style',
        previewImage: conceptArtImg,
        cssGradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        promptModifier: 'concept art, digital painting, artstation trending, professional illustration'
    },
    {
        id: '3d',
        name: '3D Render',
        description: 'CGI quality graphics',
        previewImage: render3dImg,
        cssGradient: 'linear-gradient(135deg, #00b4db 0%, #0083b0 100%)',
        promptModifier: '3D render, octane render, unreal engine 5, volumetric lighting, highly detailed'
    },
];

// Lighting presets with local images
export const LIGHTING_PRESETS: VisualPreset[] = [
    {
        id: 'natural',
        name: 'Natural',
        description: 'Soft daylight, balanced tones',
        previewImage: naturalImg,
        cssGradient: 'linear-gradient(135deg, #87CEEB 0%, #98D8C8 100%)',
        promptModifier: 'natural soft daylight, balanced ambient lighting'
    },
    {
        id: 'golden',
        name: 'Golden Hour',
        description: 'Warm sunset tones, long shadows',
        previewImage: goldenHourImg,
        cssGradient: 'linear-gradient(135deg, #FF8C00 0%, #FFD700 100%)',
        promptModifier: 'golden hour warm sunlight, orange and amber tones, long soft shadows'
    },
    {
        id: 'studio',
        name: 'Studio',
        description: 'Professional 3-point lighting',
        previewImage: studioImg,
        cssGradient: 'linear-gradient(135deg, #FFFFFF 0%, #E0E0E0 100%)',
        promptModifier: 'professional studio three-point lighting, key light fill light rim light'
    },
    {
        id: 'dramatic',
        name: 'Dramatic',
        description: 'High contrast, bold shadows',
        previewImage: dramaticImg,
        cssGradient: 'linear-gradient(135deg, #2C3E50 0%, #000000 100%)',
        promptModifier: 'dramatic rim lighting, strong backlight, chiaroscuro, high contrast'
    },
    {
        id: 'neon',
        name: 'Neon Glow',
        description: 'Cyberpunk colored lights',
        previewImage: neonGlowImg,
        cssGradient: 'linear-gradient(135deg, #FF00FF 0%, #00FFFF 100%)',
        promptModifier: 'neon lighting, cyberpunk glow, pink and cyan light sources, RGB lighting'
    },
    {
        id: 'moonlight',
        name: 'Moonlight',
        description: 'Cool blue nighttime ambiance',
        previewImage: moonlightImg,
        cssGradient: 'linear-gradient(135deg, #1a1a2e 0%, #4a69bd 100%)',
        promptModifier: 'soft moonlight, cool blue tones, nighttime ambiance, ethereal glow'
    },
];

// Color palette presets with local images
export const COLOR_PALETTES: VisualPreset[] = [
    {
        id: 'auto',
        name: 'Auto',
        description: 'AI chooses best palette',
        previewImage: '',
        cssGradient: 'conic-gradient(from 0deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #ff6b6b)',
        promptModifier: ''
    },
    {
        id: 'warm',
        name: 'Warm',
        description: 'Reds, oranges, yellows',
        previewImage: warmImg,
        cssGradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 50%, #FED330 100%)',
        promptModifier: 'warm color palette, reds oranges and yellows, cozy atmosphere'
    },
    {
        id: 'cool',
        name: 'Cool',
        description: 'Blues, teals, purples',
        previewImage: coolImg,
        cssGradient: 'linear-gradient(135deg, #667eea 0%, #48dbfb 50%, #a29bfe 100%)',
        promptModifier: 'cool color palette, blues and purples, calm atmosphere'
    },
    {
        id: 'neutral',
        name: 'Neutral',
        description: 'Whites, grays, beiges',
        previewImage: neutralImg,
        cssGradient: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 50%, #bdbdbd 100%)',
        promptModifier: 'neutral color palette, whites grays and beiges, minimalist'
    },
    {
        id: 'vibrant',
        name: 'Vibrant',
        description: 'Bold, saturated colors',
        previewImage: vibrantImg,
        cssGradient: 'linear-gradient(135deg, #FF0080 0%, #7928CA 50%, #FF4D4D 100%)',
        promptModifier: 'vibrant saturated colors, bold and eye-catching, high saturation'
    },
    {
        id: 'monochrome',
        name: 'Monochrome',
        description: 'Single color variations',
        previewImage: monochromeImg,
        cssGradient: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 50%, #8a8a8a 100%)',
        promptModifier: 'monochromatic color scheme, single color variations, elegant'
    },
];

/**
 * Get lighting preset by ID
 */
export function getLightingPreset(id: string): VisualPreset | undefined {
    return LIGHTING_PRESETS.find(p => p.id === id);
}

/**
 * Get color palette by ID
 */
export function getColorPalette(id: string): VisualPreset | undefined {
    return COLOR_PALETTES.find(p => p.id === id);
}

/**
 * Get style preset by ID
 */
export function getStylePreset(id: string): VisualPreset | undefined {
    return STYLE_PRESETS.find(p => p.id === id);
}
