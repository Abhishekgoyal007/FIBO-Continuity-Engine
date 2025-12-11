import { fal } from '@fal-ai/client';
import type { Shot, StyleSettings } from '../store/useStore';

// ============================================
// Types
// ============================================

export interface FiboGenerateParams {
    prompt: string;
    negative_prompt?: string;
    image_size?: string;
    num_inference_steps?: number;
    guidance_scale?: number;
    seed?: number;
}

export interface FiboResult {
    images: Array<{
        url: string;
        width: number;
        height: number;
        content_type: string;
    }>;
    seed: number;
    prompt?: string;
}

// Demo images for testing without API
const DEMO_IMAGES = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1024&h=1024&fit=crop',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1024&h=1024&fit=crop',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1024&h=1024&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1024&h=1024&fit=crop',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1024&h=1024&fit=crop',
    'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=1024&h=1024&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1024&h=1024&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1024&h=1024&fit=crop',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1024&h=1024&fit=crop',
];

// ============================================
// Camera Angle to Instructions Mapping
// ============================================

const getCameraAngleInstruction = (angle: number): string => {
    const normalizedAngle = ((angle % 360) + 360) % 360;

    if (normalizedAngle <= 15 || normalizedAngle >= 345) return 'front view, facing the camera directly';
    if (normalizedAngle >= 15 && normalizedAngle < 60) return 'three-quarter view from the left side';
    if (normalizedAngle >= 60 && normalizedAngle < 120) return 'side profile view from the left';
    if (normalizedAngle >= 120 && normalizedAngle < 165) return 'three-quarter back view from the left';
    if (normalizedAngle >= 165 && normalizedAngle < 195) return 'back view, facing away from camera';
    if (normalizedAngle >= 195 && normalizedAngle < 240) return 'three-quarter back view from the right';
    if (normalizedAngle >= 240 && normalizedAngle < 300) return 'side profile view from the right';
    if (normalizedAngle >= 300 && normalizedAngle < 345) return 'three-quarter view from the right side';

    return 'front view';
};

const getCameraHeightInstruction = (height: number): string => {
    if (height <= -15) return 'low angle shot looking up, heroic perspective';
    if (height <= -5) return 'slightly low angle';
    if (height >= 15) return 'high angle shot looking down, bird\'s eye perspective';
    if (height >= 5) return 'slightly high angle';
    return 'eye level';
};

const getFovInstruction = (fov: number): string => {
    if (fov <= 24) return '24mm ultra wide angle lens, dramatic perspective';
    if (fov <= 35) return '35mm wide angle lens';
    if (fov <= 50) return '50mm standard lens, natural perspective';
    if (fov <= 85) return '85mm portrait lens, subtle compression';
    return '135mm telephoto lens, compressed perspective';
};

const getFramingInstruction = (framing: Shot['framing']): string => {
    switch (framing) {
        case 'full': return 'full body shot showing entire figure';
        case 'cowboy': return 'cowboy shot from mid-thigh up';
        case 'medium': return 'medium shot from waist up';
        case 'closeup': return 'close-up shot of face and shoulders';
        case 'extreme-closeup': return 'extreme close-up shot, face filling frame';
        default: return 'medium shot';
    }
};

// ============================================
// Style to Prompt Enhancements
// ============================================

const getStyleEnhancement = (style: StyleSettings['style']): string => {
    switch (style) {
        case 'photorealistic':
            return 'photorealistic, hyperrealistic photography, professional DSLR photograph, 8K resolution, sharp focus';
        case 'cinematic':
            return 'cinematic film still, anamorphic lens, movie scene, dramatic lighting, film grain, color graded';
        case 'anime':
            return 'anime style illustration, vibrant colors, clean lines, professional anime art, detailed shading';
        case 'concept':
            return 'concept art, digital painting, artstation trending, professional illustration, detailed brushwork';
        case '3d':
            return '3D render, octane render, unreal engine 5, subsurface scattering, volumetric lighting, highly detailed';
        case 'product':
            return 'professional product photography, studio lighting, clean white background, commercial photography, high-end advertisement';
        default:
            return '';
    }
};

const getLightingEnhancement = (lightingType: string): string => {
    switch (lightingType) {
        case 'natural': return 'natural daylight, soft ambient lighting';
        case 'golden': return 'golden hour lighting, warm sunlight, long shadows';
        case 'studio': return 'professional studio three-point lighting, key light, fill light, rim light';
        case 'dramatic': return 'dramatic rim lighting, strong backlight, silhouette edges';
        case 'neon': return 'neon lighting, cyberpunk glow, colorful light sources, RGB lighting';
        case 'moonlight': return 'soft moonlight, cool blue tones, nighttime ambiance';
        case 'overcast': return 'soft overcast lighting, diffused light, no harsh shadows';
        default: return '';
    }
};

const getPaletteEnhancement = (palette: StyleSettings['colorPalette']): string => {
    switch (palette) {
        case 'warm': return 'warm color palette, orange and red tones, cozy atmosphere';
        case 'cool': return 'cool color palette, blue and purple tones, calm atmosphere';
        case 'neon': return 'neon color palette, vibrant pinks, cyans, and magentas, high saturation';
        case 'muted': return 'muted color palette, desaturated tones, subtle colors';
        case 'monochrome': return 'monochromatic color scheme, limited color palette, cohesive tones';
        case 'auto':
        default:
            return '';
    }
};

// ============================================
// Build Complete Prompt for Shot
// ============================================

export const buildShotPrompt = (
    baseDescription: string,
    shot: Shot,
    styleSettings: StyleSettings
): string => {
    const parts: string[] = [];

    parts.push(baseDescription.trim());
    parts.push(getCameraAngleInstruction(shot.cameraAngle));
    parts.push(getCameraHeightInstruction(shot.cameraHeight));
    parts.push(getFovInstruction(shot.fov));
    parts.push(getFramingInstruction(shot.framing));

    if (shot.instructions.trim()) {
        parts.push(shot.instructions.trim());
    }

    parts.push(getStyleEnhancement(styleSettings.style));
    parts.push(getLightingEnhancement(styleSettings.lightingType));
    parts.push(getPaletteEnhancement(styleSettings.colorPalette));
    parts.push('highly detailed, professional quality, masterpiece');

    return parts.filter(Boolean).join(', ');
};

// ============================================
// FIBO API Client
// ============================================

export type ApiProvider = 'fal' | 'bria' | 'demo';

export class FiboAPI {
    private apiKey: string;
    private imageSize: string;
    private qualitySteps: number;
    private provider: ApiProvider;

    constructor(
        apiKey: string,
        imageSize: string = '1024x1024',
        qualitySteps: number = 50,
        provider: ApiProvider = 'fal'
    ) {
        this.apiKey = apiKey;
        this.imageSize = imageSize;
        this.qualitySteps = qualitySteps;
        this.provider = provider;

        if (provider === 'fal' && apiKey) {
            fal.config({
                credentials: apiKey,
            });
        }
    }

    /**
     * Generate a single image using FIBO
     */
    async generate(prompt: string, seed?: number): Promise<FiboResult> {
        // Demo mode - return placeholder images
        if (this.provider === 'demo' || !this.apiKey) {
            return this.generateDemo();
        }

        if (this.provider === 'bria') {
            return this.generateWithBria(prompt, seed);
        }

        // Fal.ai
        return this.generateWithFal(prompt, seed);
    }

    /**
     * Demo mode - returns placeholder images
     */
    private async generateDemo(): Promise<FiboResult> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        const randomImage = DEMO_IMAGES[Math.floor(Math.random() * DEMO_IMAGES.length)];

        return {
            images: [{
                url: randomImage,
                width: 1024,
                height: 1024,
                content_type: 'image/jpeg'
            }],
            seed: Math.floor(Math.random() * 1000000),
            prompt: 'Demo mode - placeholder image'
        };
    }

    /**
     * Generate using Fal.ai
     */
    private async generateWithFal(prompt: string, seed?: number): Promise<FiboResult> {
        try {
            const result = await fal.subscribe('fal-ai/bria/fibo', {
                input: {
                    prompt,
                    image_size: this.getSizeParam(this.imageSize) as 'square_hd' | 'square' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9',
                    num_inference_steps: this.qualitySteps,
                    guidance_scale: 5,
                    seed,
                },
                logs: true,
                onQueueUpdate: (update) => {
                    if (update.status === 'IN_PROGRESS' && update.logs) {
                        console.log('[FIBO]', update.logs.map(l => l.message).join('\n'));
                    }
                },
            });

            return result.data as unknown as FiboResult;
        } catch (error) {
            console.error('FIBO generation error:', error);
            throw error;
        }
    }

    /**
     * Generate using BRIA Platform API (1000 free calls/month)
     */
    private async generateWithBria(prompt: string, seed?: number): Promise<FiboResult> {
        try {
            const response = await fetch('https://engine.prod.bria-api.com/v1/text-to-image/hd/fibo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api_token': this.apiKey,
                },
                body: JSON.stringify({
                    prompt,
                    num_results: 1,
                    sync: true,
                    seed,
                }),
            });

            if (!response.ok) {
                throw new Error(`BRIA API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            return {
                images: data.result.map((r: { urls: string[] }) => ({
                    url: r.urls[0],
                    width: 1024,
                    height: 1024,
                    content_type: 'image/png'
                })),
                seed: seed || 0,
                prompt
            };
        } catch (error) {
            console.error('BRIA API error:', error);
            throw error;
        }
    }

    /**
     * Generate a complete sequence of shots with consistency
     */
    async generateSequence(
        baseDescription: string,
        shots: Shot[],
        styleSettings: StyleSettings,
        onProgress: (index: number, status: 'start' | 'complete' | 'error', result?: FiboResult) => void,
        baseSeed?: number
    ): Promise<FiboResult[]> {
        const results: FiboResult[] = [];
        const seed = baseSeed ?? Math.floor(Math.random() * 1000000);

        for (let i = 0; i < shots.length; i++) {
            const shot = shots[i];
            onProgress(i, 'start');

            try {
                const prompt = buildShotPrompt(baseDescription, shot, styleSettings);
                console.log(`[FIBO] Generating shot ${i + 1}/${shots.length}: ${shot.name}`);
                console.log(`[FIBO] Prompt: ${prompt.substring(0, 200)}...`);

                const result = await this.generate(prompt, seed);
                results.push(result);
                onProgress(i, 'complete', result);
            } catch (error) {
                console.error(`Error generating shot ${i}:`, error);
                onProgress(i, 'error');
                throw error;
            }
        }

        return results;
    }

    private getSizeParam(size: string): string {
        switch (size) {
            case '1024x1024': return 'square_hd';
            case '1024x768': return 'landscape_4_3';
            case '768x1024': return 'portrait_4_3';
            case '1280x720': return 'landscape_16_9';
            default: return 'square_hd';
        }
    }
}

// ============================================
// Singleton Instance
// ============================================

let fiboInstance: FiboAPI | null = null;

export const initFiboAPI = (
    apiKey: string,
    imageSize?: string,
    qualitySteps?: number,
    provider: ApiProvider = 'fal'
): FiboAPI => {
    fiboInstance = new FiboAPI(apiKey, imageSize, qualitySteps, provider);
    return fiboInstance;
};

export const getFiboAPI = (): FiboAPI | null => fiboInstance;
