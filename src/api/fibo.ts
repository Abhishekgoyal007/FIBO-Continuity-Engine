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
    structured_prompt?: string;
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
    structured_prompt?: string;
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
    if (height <= -15) return 'low angle shot looking up';
    if (height <= -5) return 'slightly low angle';
    if (height >= 15) return 'high angle shot looking down';
    if (height >= 5) return 'slightly high angle';
    return 'eye level';
};

const getFovInstruction = (fov: number): string => {
    if (fov <= 24) return '24mm lens';
    if (fov <= 35) return '35mm lens';
    if (fov <= 50) return '50mm lens';
    if (fov <= 85) return '85mm lens';
    return '135mm lens';
};

const getFramingInstruction = (framing: Shot['framing']): string => {
    switch (framing) {
        case 'full': return 'full shot showing entire subject';
        case 'cowboy': return 'medium-full shot';
        case 'medium': return 'medium shot';
        case 'closeup': return 'close-up shot';
        case 'extreme-closeup': return 'extreme close-up';
        default: return 'medium shot';
    }
};

// ============================================
// Style to Prompt Enhancements
// ============================================

const getStyleEnhancement = (style: StyleSettings['style']): string => {
    switch (style) {
        case 'photorealistic':
            return 'photorealistic, professional photography, 8K, sharp focus';
        case 'cinematic':
            return 'cinematic, film still, dramatic lighting';
        case 'anime':
            return 'anime style, vibrant colors, clean lines';
        case 'concept':
            return 'concept art, digital painting';
        case '3d':
            return '3D render, octane render, highly detailed';
        case 'product':
            return 'professional product photography, studio lighting, clean background';
        default:
            return '';
    }
};

const getLightingEnhancement = (lightingType: string): string => {
    switch (lightingType) {
        case 'natural': return 'natural daylight';
        case 'golden': return 'golden hour lighting';
        case 'studio': return 'professional studio lighting';
        case 'dramatic': return 'dramatic rim lighting';
        case 'neon': return 'neon lighting';
        case 'moonlight': return 'moonlight, cool tones';
        case 'overcast': return 'soft overcast lighting';
        default: return '';
    }
};

const getPaletteEnhancement = (palette: StyleSettings['colorPalette']): string => {
    switch (palette) {
        case 'warm': return 'warm color palette';
        case 'cool': return 'cool color palette';
        case 'neon': return 'neon colors, high saturation';
        case 'muted': return 'muted colors, desaturated';
        case 'monochrome': return 'monochromatic';
        case 'auto':
        default:
            return '';
    }
};

// ============================================
// Build Base Prompt (without camera specifics)
// ============================================

export const buildBasePrompt = (
    baseDescription: string,
    styleSettings: StyleSettings
): string => {
    const parts: string[] = [];

    parts.push(baseDescription.trim());
    parts.push(getStyleEnhancement(styleSettings.style));
    parts.push(getLightingEnhancement(styleSettings.lightingType));
    parts.push(getPaletteEnhancement(styleSettings.colorPalette));
    parts.push('highly detailed, professional quality');

    return parts.filter(Boolean).join(', ');
};

// ============================================
// Build Shot-Specific Camera Instruction
// ============================================

export const buildCameraInstruction = (shot: Shot): string => {
    const parts: string[] = [];

    parts.push(getCameraAngleInstruction(shot.cameraAngle));
    parts.push(getCameraHeightInstruction(shot.cameraHeight));
    parts.push(getFovInstruction(shot.fov));
    parts.push(getFramingInstruction(shot.framing));

    if (shot.instructions.trim()) {
        parts.push(shot.instructions.trim());
    }

    return parts.filter(Boolean).join(', ');
};

// ============================================
// Build Complete Prompt for Shot
// ============================================

export const buildShotPrompt = (
    baseDescription: string,
    shot: Shot,
    styleSettings: StyleSettings
): string => {
    const base = buildBasePrompt(baseDescription, styleSettings);
    const camera = buildCameraInstruction(shot);
    return `${base}, ${camera}`;
};

// ============================================
// Aspect Ratio Mapping
// ============================================

const getAspectRatio = (size: string): string => {
    switch (size) {
        case '1024x1024': return '1:1';
        case '1024x768': return '4:3';
        case '768x1024': return '3:4';
        case '1280x720': return '16:9';
        default: return '1:1';
    }
};

// ============================================
// FIBO API Client
// ============================================

export type ApiProvider = 'bria' | 'fal' | 'demo';

export class FiboAPI {
    private apiKey: string;
    private imageSize: string;
    private qualitySteps: number;
    private provider: ApiProvider;

    constructor(
        apiKey: string,
        imageSize: string = '1024x1024',
        qualitySteps: number = 50,
        provider: ApiProvider = 'bria'
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
    async generate(prompt: string, seed?: number, structuredPrompt?: string): Promise<FiboResult> {
        // Demo mode - return placeholder images
        if (this.provider === 'demo' || !this.apiKey) {
            return this.generateDemo();
        }

        if (this.provider === 'bria') {
            return this.generateWithBria(prompt, seed, structuredPrompt);
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
     * Generate using BRIA Platform API v2 (Official FIBO API)
     * 
     * KEY FOR CONSISTENCY:
     * - First shot: Generate with text prompt → Get structured_prompt back
     * - Subsequent shots: Use structured_prompt + camera angle refinement
     */
    private async generateWithBria(
        prompt: string,
        seed?: number,
        structuredPrompt?: string
    ): Promise<FiboResult> {
        try {
            console.log('[BRIA API] Sending request...');
            console.log('[BRIA API] Has structured_prompt:', !!structuredPrompt);

            const requestBody: Record<string, unknown> = {
                model_version: 'FIBO',
                aspect_ratio: getAspectRatio(this.imageSize),
                num_steps: this.qualitySteps,
                sync: true,
            };

            // If we have a structured_prompt from a previous generation,
            // use it with a refinement prompt for the new camera angle
            if (structuredPrompt) {
                requestBody.structured_prompt = structuredPrompt;
                requestBody.prompt = prompt; // This becomes the refinement instruction
                console.log('[BRIA API] Using structured_prompt with refinement');
            } else {
                requestBody.prompt = prompt;
            }

            if (seed !== undefined) {
                requestBody.seed = seed;
            }

            const response = await fetch('https://engine.prod.bria-api.com/v2/image/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api_token': this.apiKey,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[BRIA API] Error response:', errorText);
                throw new Error(`BRIA API error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            console.log('[BRIA API] Response received');

            // v2 API returns { result: { image_url, seed, structured_prompt }, request_id }
            if (data.result) {
                return {
                    images: [{
                        url: data.result.image_url,
                        width: 1024,
                        height: 1024,
                        content_type: 'image/png'
                    }],
                    seed: data.result.seed || seed || 0,
                    prompt,
                    structured_prompt: data.result.structured_prompt
                };
            }

            throw new Error('Unexpected API response format');
        } catch (error) {
            console.error('[BRIA API] Error:', error);
            throw error;
        }
    }

    /**
     * Generate using Fal.ai
     */
    private async generateWithFal(prompt: string, seed?: number): Promise<FiboResult> {
        try {
            const result = await fal.subscribe('fal-ai/bria/fibo', {
                input: {
                    prompt,
                    image_size: this.getSizeParamFal(this.imageSize) as 'square_hd' | 'square' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9',
                    num_inference_steps: this.qualitySteps,
                    guidance_scale: 5,
                    seed,
                },
                logs: true,
                onQueueUpdate: (update) => {
                    if (update.status === 'IN_PROGRESS' && update.logs) {
                        console.log('[FAL.AI]', update.logs.map(l => l.message).join('\n'));
                    }
                },
            });

            return result.data as unknown as FiboResult;
        } catch (error) {
            console.error('[FAL.AI] Error:', error);
            throw error;
        }
    }

    /**
     * Generate a complete sequence of shots with MAXIMUM consistency
     * 
     * Strategy for consistency:
     * 1. Generate first shot with full prompt → Get structured_prompt
     * 2. For each subsequent shot, use the SAME structured_prompt 
     *    but add camera angle as a refinement instruction
     * 3. Use the SAME seed for all shots
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
        let baseStructuredPrompt: string | undefined;

        console.log('[FIBO Sequence] Starting sequence generation');
        console.log('[FIBO Sequence] Using seed:', seed);
        console.log('[FIBO Sequence] Number of shots:', shots.length);

        for (let i = 0; i < shots.length; i++) {
            const shot = shots[i];
            onProgress(i, 'start');

            try {
                let result: FiboResult;

                if (i === 0) {
                    // FIRST SHOT: Full prompt to establish the subject
                    const fullPrompt = buildShotPrompt(baseDescription, shot, styleSettings);
                    console.log(`[FIBO] Shot 1/${shots.length}: Establishing base with full prompt`);
                    console.log(`[FIBO] Prompt: ${fullPrompt.substring(0, 150)}...`);

                    result = await this.generate(fullPrompt, seed);

                    // Save the structured_prompt for subsequent shots
                    if (result.structured_prompt) {
                        baseStructuredPrompt = result.structured_prompt;
                        console.log('[FIBO] Got structured_prompt, will use for consistency');
                    }
                } else {
                    // SUBSEQUENT SHOTS: Use structured_prompt + camera refinement
                    const cameraInstruction = `Change camera to: ${buildCameraInstruction(shot)}`;
                    console.log(`[FIBO] Shot ${i + 1}/${shots.length}: ${shot.name}`);
                    console.log(`[FIBO] Refinement: ${cameraInstruction}`);

                    if (baseStructuredPrompt) {
                        // Use the base structured prompt with camera angle refinement
                        result = await this.generate(cameraInstruction, seed, baseStructuredPrompt);
                    } else {
                        // Fallback: use full prompt
                        const fullPrompt = buildShotPrompt(baseDescription, shot, styleSettings);
                        result = await this.generate(fullPrompt, seed);
                    }
                }

                results.push(result);
                onProgress(i, 'complete', result);
            } catch (error) {
                console.error(`Error generating shot ${i}:`, error);
                onProgress(i, 'error');
                throw error;
            }
        }

        console.log('[FIBO Sequence] Complete! Generated', results.length, 'shots');
        return results;
    }

    private getSizeParamFal(size: string): string {
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
    provider: ApiProvider = 'bria'
): FiboAPI => {
    fiboInstance = new FiboAPI(apiKey, imageSize, qualitySteps, provider);
    return fiboInstance;
};

export const getFiboAPI = (): FiboAPI | null => fiboInstance;
