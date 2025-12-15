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
// ENHANCED Camera Angle to Instructions Mapping
// More precise and detailed descriptions for better AI understanding
// ============================================

const getCameraAngleInstruction = (angle: number): string => {
    const normalizedAngle = ((angle % 360) + 360) % 360;

    // ULTRA-PRECISE angle descriptions with explicit rotation degrees
    // Format: explicit degree + turntable reference + detailed view description
    if (normalizedAngle === 0) {
        return 'EXACT FRONT VIEW at precisely 0 degrees rotation, camera positioned directly in front of subject, subject facing directly toward camera, looking straight at viewer, perfect frontal symmetry';
    }
    if (normalizedAngle === 45) {
        return 'THREE-QUARTER FRONT VIEW at exactly 45 degrees rotation clockwise, camera positioned between front and left side, classic 3/4 portrait angle, subject turned 45 degrees to their right';
    }
    if (normalizedAngle === 90) {
        return 'EXACT LEFT PROFILE at precisely 90 degrees rotation, perfect side view, camera positioned at exact left side of subject, showing only left side of face/body, nose pointing left in frame';
    }
    if (normalizedAngle === 135) {
        return 'THREE-QUARTER BACK VIEW from left at 135 degrees rotation, camera positioned between left side and back, showing back of head/body with partial left profile visible';
    }
    if (normalizedAngle === 180) {
        return 'EXACT BACK VIEW at precisely 180 degrees rotation, camera positioned directly behind subject, showing only the back of head/body, subject facing away from camera';
    }
    if (normalizedAngle === 225) {
        return 'THREE-QUARTER BACK VIEW from right at 225 degrees rotation, camera positioned between back and right side, showing back with partial right profile visible';
    }
    if (normalizedAngle === 270) {
        return 'EXACT RIGHT PROFILE at precisely 270 degrees rotation, perfect side view, camera positioned at exact right side of subject, showing only right side of face/body, nose pointing right in frame';
    }
    if (normalizedAngle === 315) {
        return 'THREE-QUARTER FRONT VIEW from right at 315 degrees rotation, camera positioned between right side and front, classic 3/4 portrait from right side';
    }

    // For non-standard angles, provide interpolated precise description
    if (normalizedAngle > 0 && normalizedAngle < 45) {
        return `SLIGHT LEFT ROTATION at ${normalizedAngle} degrees from front, mostly frontal with subtle left turn`;
    }
    if (normalizedAngle > 45 && normalizedAngle < 90) {
        return `STRONG THREE-QUARTER LEFT at ${normalizedAngle} degrees, between 3/4 view and side profile`;
    }
    if (normalizedAngle > 90 && normalizedAngle < 135) {
        return `REAR LEFT OBLIQUE at ${normalizedAngle} degrees, past side profile toward back`;
    }
    if (normalizedAngle > 135 && normalizedAngle < 180) {
        return `APPROACHING BACK VIEW from left at ${normalizedAngle} degrees, nearly full back view`;
    }
    if (normalizedAngle > 180 && normalizedAngle < 225) {
        return `APPROACHING BACK VIEW from right at ${normalizedAngle} degrees, nearly full back view`;
    }
    if (normalizedAngle > 225 && normalizedAngle < 270) {
        return `REAR RIGHT OBLIQUE at ${normalizedAngle} degrees, past right profile toward front`;
    }
    if (normalizedAngle > 270 && normalizedAngle < 315) {
        return `STRONG THREE-QUARTER RIGHT at ${normalizedAngle} degrees, between side profile and 3/4 front`;
    }
    if (normalizedAngle > 315 && normalizedAngle < 360) {
        return `SLIGHT RIGHT ROTATION at ${normalizedAngle} degrees from front, mostly frontal with subtle right turn`;
    }

    return 'FRONT VIEW at 0 degrees, subject facing camera directly';
};

const getCameraHeightInstruction = (height: number): string => {
    if (height <= -30) return 'extreme low angle, dramatic upward view, worm\'s eye perspective';
    if (height <= -15) return 'low angle shot, looking up at subject, powerful perspective';
    if (height <= -5) return 'slightly low angle, subtle upward tilt';
    if (height >= 30) return 'extreme high angle, bird\'s eye view, looking down dramatically';
    if (height >= 15) return 'high angle shot, looking down at subject';
    if (height >= 5) return 'slightly elevated camera, subtle downward tilt';
    return 'eye level camera, straight on perspective';
};

const getFovInstruction = (fov: number): string => {
    if (fov <= 20) return 'telephoto 135mm lens, compressed perspective, shallow depth of field';
    if (fov <= 35) return '85mm portrait lens, flattering perspective, beautiful bokeh';
    if (fov <= 50) return '50mm standard lens, natural perspective like human eye';
    if (fov <= 70) return '35mm lens, slight wide angle, environmental context';
    if (fov <= 90) return '24mm wide angle lens, expansive view, environmental portrait';
    return '16mm ultra-wide lens, dramatic distortion, immersive perspective';
};

const getFramingInstruction = (framing: Shot['framing']): string => {
    switch (framing) {
        case 'full': return 'full body shot, head to toe visible, complete figure in frame';
        case 'cowboy': return 'cowboy shot, mid-thigh to head, classic western framing';
        case 'medium': return 'medium shot, waist up framing, conversational distance';
        case 'closeup': return 'close-up shot, face and shoulders, intimate detail';
        case 'extreme-closeup': return 'extreme close-up, tight on face, dramatic detail shot';
        default: return 'medium shot, balanced framing';
    }
};

// ============================================
// ENHANCED Style Prompt Additions
// More comprehensive style descriptions for better results
// ============================================

const getStyleEnhancement = (style: StyleSettings['style']): string => {
    switch (style) {
        case 'photorealistic':
            return 'photorealistic, ultra-realistic photography, 8K UHD resolution, RAW photo, DSLR quality, sharp focus, high dynamic range, professional color grading, fine skin detail, natural imperfections';
        case 'cinematic':
            return 'cinematic film still, anamorphic lens, 35mm film grain, dramatic chiaroscuro lighting, color graded like a Hollywood movie, shallow depth of field, lens flares, atmospheric haze';
        case 'anime':
            return 'anime art style, Studio Ghibli quality, vibrant saturated colors, clean crisp linework, cel shading, expressive eyes, detailed hair strands, beautiful color harmony';
        case 'concept':
            return 'professional concept art, digital painting, artstation trending, matte painting quality, detailed environment, atmospheric perspective, dynamic composition';
        case '3d':
            return '3D render, Octane render quality, Cinema 4D, volumetric lighting, subsurface scattering, ray traced reflections, ambient occlusion, hyperrealistic materials';
        case 'product':
            return 'professional product photography, commercial advertisement quality, perfectly lit studio shot, clean white/gradient background, precise shadows, magazine-worthy, sharp focus on product details';
        default:
            return 'professional quality, highly detailed';
    }
};

const getLightingEnhancement = (lightingType: string): string => {
    switch (lightingType) {
        case 'natural': return 'natural daylight illumination, soft window light, organic shadows';
        case 'golden': return 'golden hour sunlight, warm orange glow, long soft shadows, magical lighting';
        case 'studio': return 'professional three-point studio lighting, key light with fill, rim light separation';
        case 'dramatic': return 'dramatic Rembrandt lighting, strong shadows, high contrast, cinematic mood';
        case 'neon': return 'neon lighting, cyberpunk glow, vibrant color spill, electric atmosphere';
        case 'moonlight': return 'cool moonlight, blue hour tones, mysterious nocturnal atmosphere';
        case 'overcast': return 'soft diffused overcast lighting, even illumination, no harsh shadows';
        case 'backlit': return 'backlit silhouette edge, rim lighting, glowing outline, dramatic separation';
        default: return 'professional lighting';
    }
};

const getPaletteEnhancement = (palette: StyleSettings['colorPalette']): string => {
    switch (palette) {
        case 'warm': return 'warm color palette, amber and gold tones, cozy earthy colors';
        case 'cool': return 'cool color palette, blue and teal tones, serene atmosphere';
        case 'neon': return 'neon color palette, high saturation, electric pinks and blues, synthwave vibes';
        case 'muted': return 'muted desaturated colors, pastel tones, subtle color harmony';
        case 'monochrome': return 'monochromatic color scheme, single color family, sophisticated limited palette';
        case 'auto':
        default:
            return '';
    }
};

// ============================================
// ENHANCED Negative Prompt for Quality
// ============================================

const getEnhancedNegativePrompt = (style: StyleSettings['style']): string => {
    // Base quality negatives
    const baseNegatives = [
        'blurry', 'low quality', 'pixelated', 'jpeg artifacts', 'compression artifacts',
        'watermark', 'text', 'logo', 'signature', 'username',
        'cropped', 'out of frame', 'poorly drawn', 'bad anatomy',
        'distorted proportions', 'duplicate', 'clone', 'mutation',
        'deformed', 'ugly', 'disfigured', 'missing limbs', 'extra limbs',
        'floating limbs', 'disconnected limbs', 'long neck', 'elongated body'
    ];

    // ULTRA-STRICT Consistency-focused negatives (prevent ANY variations between frames)
    const consistencyNegatives = [
        // Character changes
        'different character', 'different person', 'changed identity',
        'different face shape', 'different facial features', 'different expression',
        'different eyes', 'different eye color', 'different eye shape',
        'different nose', 'different mouth', 'different lips',
        'different skin tone', 'different age appearance',
        // Hair changes
        'different hair', 'changed hairstyle', 'different hair color', 'different hair length',
        // Clothing changes  
        'different clothes', 'changed outfit', 'different clothing color',
        'different accessories', 'missing accessories', 'extra accessories',
        // Body changes
        'different body proportions', 'different body type', 'different height',
        'different musculature', 'different build',
        // Style/lighting changes
        'different art style', 'changed colors', 'different color palette',
        'different lighting', 'different shadow direction', 'different background',
        // Pose changes (unless camera angle change)
        'different arm positions', 'different leg positions', 'different stance',
        // Wrong camera angle
        'wrong angle', 'incorrect viewpoint', 'misaligned camera'
    ];

    const styleSpecificNegatives: Record<string, string[]> = {
        photorealistic: ['cartoon', 'anime', 'painting', 'illustration', 'CGI', 'fake', 'plastic skin', 'airbrushed'],
        cinematic: ['amateur', 'home video', 'phone camera', 'snapshot', 'overexposed', 'underexposed', 'flat lighting'],
        anime: ['photorealistic', 'photograph', '3D render', 'realistic', 'western cartoon', 'realistic skin texture'],
        concept: ['photograph', 'amateur art', 'MS Paint', 'low effort', 'rough sketch'],
        '3d': ['2D', 'flat', 'hand drawn', 'sketch', 'painting', 'cel shaded'],
        product: ['cluttered background', 'distracting elements', 'unprofessional', 'amateur lighting', 'harsh shadows']
    };

    const styleNegs = styleSpecificNegatives[style] || [];
    return [...baseNegatives, ...consistencyNegatives, ...styleNegs].join(', ');
};

// ============================================
// Build Base Prompt (without camera specifics)
// ============================================

export const buildBasePrompt = (
    baseDescription: string,
    styleSettings: StyleSettings
): string => {
    const parts: string[] = [];

    // Core subject description with fixed identity
    parts.push(`[SUBJECT] ${baseDescription.trim()}`);

    // Enhanced style modifiers
    parts.push(getStyleEnhancement(styleSettings.style));

    // Lighting (if specified and not auto)
    const lightingMod = getLightingEnhancement(styleSettings.lightingType);
    if (lightingMod) parts.push(lightingMod);

    // Color palette (if specified and not auto)
    const paletteMod = getPaletteEnhancement(styleSettings.colorPalette);
    if (paletteMod) parts.push(paletteMod);

    // Quality boosters
    parts.push('masterpiece quality');
    parts.push('award-winning');
    parts.push('highly detailed');
    parts.push('sharp focus');
    parts.push('high resolution 8K');

    // STRONG Consistency modifiers (critical for multi-frame turnaround)
    parts.push('[CONSISTENCY] fixed character identity');
    parts.push('exact same face across all angles');
    parts.push('consistent body proportions');
    parts.push('identical clothing design');
    parts.push('same color palette throughout');
    parts.push('uniform lighting setup');
    parts.push('suitable for character turnaround sheet');

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
// FIBO API Client - ENHANCED
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
    async generate(
        prompt: string,
        seed?: number,
        structuredPrompt?: string,
        negativePrompt?: string
    ): Promise<FiboResult> {
        // Demo mode - return placeholder images
        if (this.provider === 'demo' || !this.apiKey) {
            return this.generateDemo();
        }

        if (this.provider === 'bria') {
            return this.generateWithBria(prompt, seed, structuredPrompt, negativePrompt);
        }

        // Fal.ai
        return this.generateWithFal(prompt, seed, negativePrompt);
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
     * ENHANCED with negative prompts and better consistency
     */
    private async generateWithBria(
        prompt: string,
        seed?: number,
        structuredPrompt?: string,
        negativePrompt?: string
    ): Promise<FiboResult> {
        try {
            console.log('[BRIA API] Sending request...');
            console.log('[BRIA API] Has structured_prompt:', !!structuredPrompt);

            const requestBody: Record<string, unknown> = {
                model_version: 'FIBO',
                aspect_ratio: getAspectRatio(this.imageSize),
                num_steps: Math.max(30, this.qualitySteps), // Minimum 30 steps for quality
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

            // Add negative prompt if provided
            if (negativePrompt) {
                requestBody.negative_prompt = negativePrompt;
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
                // Log structured_prompt for debugging
                if (data.result.structured_prompt) {
                    console.log('[BRIA API] ✓ Got structured_prompt:',
                        typeof data.result.structured_prompt === 'string'
                            ? data.result.structured_prompt.substring(0, 200) + '...'
                            : JSON.stringify(data.result.structured_prompt).substring(0, 200) + '...'
                    );
                } else {
                    console.log('[BRIA API] ⚠ No structured_prompt in response');
                }

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
     * Generate using Fal.ai with enhanced options
     */
    private async generateWithFal(
        prompt: string,
        seed?: number,
        negativePrompt?: string
    ): Promise<FiboResult> {
        try {
            const result = await fal.subscribe('fal-ai/bria/fibo', {
                input: {
                    prompt,
                    negative_prompt: negativePrompt,
                    image_size: this.getSizeParamFal(this.imageSize) as 'square_hd' | 'square' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9',
                    num_inference_steps: Math.max(30, this.qualitySteps),
                    guidance_scale: 7, // Increased for better prompt adherence
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
     * ENHANCED STRATEGY:
     * 1. Generate first shot with enhanced full prompt + negative prompt → Get structured_prompt
     * 2. For each subsequent shot, use the SAME structured_prompt + precise camera refinement
     * 3. Use the SAME seed for all shots to ensure consistency
     * 4. Include negative prompts to avoid quality issues
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

        // Generate enhanced negative prompt based on style
        const negativePrompt = getEnhancedNegativePrompt(styleSettings.style);

        console.log('[FIBO Sequence] Starting ENHANCED sequence generation');
        console.log('[FIBO Sequence] Using seed:', seed);
        console.log('[FIBO Sequence] Number of shots:', shots.length);
        console.log('[FIBO Sequence] Style:', styleSettings.style);
        console.log('[FIBO Sequence] Negative prompt length:', negativePrompt.length);

        for (let i = 0; i < shots.length; i++) {
            const shot = shots[i];
            onProgress(i, 'start');

            try {
                let result: FiboResult;

                if (i === 0) {
                    // FIRST SHOT: Enhanced full prompt to establish the subject
                    const fullPrompt = buildShotPrompt(baseDescription, shot, styleSettings);
                    console.log(`[FIBO] Shot 1/${shots.length}: Establishing base with enhanced prompt`);
                    console.log(`[FIBO] Prompt preview: ${fullPrompt.substring(0, 200)}...`);

                    result = await this.generate(fullPrompt, seed, undefined, negativePrompt);

                    // Save the structured_prompt for subsequent shots
                    if (result.structured_prompt) {
                        baseStructuredPrompt = result.structured_prompt;
                        console.log('[FIBO] ✓ Got structured_prompt, will use for maximum consistency');
                    }
                } else {
                    // SUBSEQUENT SHOTS: Modify structured_prompt JSON to change camera angle
                    console.log(`[FIBO] Shot ${i + 1}/${shots.length}: ${shot.name}`);
                    console.log(`[FIBO] Camera angle: ${shot.cameraAngle}°`);

                    if (baseStructuredPrompt) {
                        // Parse and modify the structured_prompt JSON to update camera angle
                        let modifiedStructuredPrompt = baseStructuredPrompt;

                        try {
                            // If it's a JSON string, parse it
                            const structuredJson = typeof baseStructuredPrompt === 'string'
                                ? JSON.parse(baseStructuredPrompt)
                                : baseStructuredPrompt;

                            // Update camera angle in the structured prompt
                            if (structuredJson) {
                                // Common FIBO structured prompt fields for camera
                                structuredJson.camera_angle = shot.cameraAngle;
                                structuredJson.camera = structuredJson.camera || {};
                                structuredJson.camera.angle = shot.cameraAngle;
                                structuredJson.camera.horizontal_angle = shot.cameraAngle;

                                // Map angle to descriptive text
                                const angleDescriptions: Record<number, string> = {
                                    0: 'front view',
                                    45: 'three-quarter front left view',
                                    90: 'side profile left view',
                                    135: 'three-quarter back left view',
                                    180: 'back view',
                                    225: 'three-quarter back right view',
                                    270: 'side profile right view',
                                    315: 'three-quarter front right view'
                                };

                                // Find closest angle description
                                const closestAngle = Object.keys(angleDescriptions)
                                    .map(Number)
                                    .reduce((prev, curr) =>
                                        Math.abs(curr - shot.cameraAngle) < Math.abs(prev - shot.cameraAngle) ? curr : prev
                                    );

                                structuredJson.camera.view = angleDescriptions[closestAngle] || `${shot.cameraAngle} degree view`;
                                structuredJson.camera.height = shot.cameraHeight;
                                structuredJson.camera.fov = shot.fov;

                                modifiedStructuredPrompt = JSON.stringify(structuredJson);
                                console.log('[FIBO] Modified structured_prompt with camera angle:', shot.cameraAngle);
                            }
                        } catch (e) {
                            console.log('[FIBO] structured_prompt is not JSON, using as refinement');
                        }

                        // Generate with modified structured prompt - STRONG camera instruction
                        const cameraInstruction = buildCameraInstruction(shot);

                        // Build a stronger prompt that explicitly emphasizes the camera angle
                        // especially for back views which AI tends to ignore
                        let shotPrompt = cameraInstruction;

                        // Add VERY STRONG emphasis for back view angles (135-225 degrees)
                        const normalizedAngle = ((shot.cameraAngle % 360) + 360) % 360;
                        if (normalizedAngle >= 135 && normalizedAngle <= 225) {
                            shotPrompt = `CRITICAL: BACK VIEW ONLY. Show the BACK of the character, NOT the front. Subject facing AWAY from camera. ${cameraInstruction}. The camera is BEHIND the subject. Do NOT show the face. Show only the back of the head and body.`;
                        } else if (normalizedAngle >= 60 && normalizedAngle <= 120) {
                            shotPrompt = `SIDE PROFILE VIEW. ${cameraInstruction}. Subject facing sideways, not toward camera.`;
                        } else if (normalizedAngle >= 240 && normalizedAngle <= 300) {
                            shotPrompt = `SIDE PROFILE VIEW from right. ${cameraInstruction}. Subject facing sideways, not toward camera.`;
                        }

                        // Add angle-specific negative prompts for stronger effect
                        let angleNegativePrompt = negativePrompt;
                        if (normalizedAngle >= 135 && normalizedAngle <= 225) {
                            angleNegativePrompt = `front view, face visible, eyes visible, looking at camera, facing camera, frontal view, ${negativePrompt}`;
                        }

                        result = await this.generate(
                            `${shotPrompt}. Keep exactly the same character identity, clothing, and style.`,
                            seed,
                            modifiedStructuredPrompt,
                            angleNegativePrompt
                        );
                    } else {
                        // Fallback: use full prompt with consistency modifiers
                        console.log('[FIBO] Warning: No structured_prompt, using full prompt fallback');
                        const fullPrompt = buildShotPrompt(baseDescription, shot, styleSettings) +
                            ', same character, identical design, consistent appearance, do not change any features';
                        result = await this.generate(fullPrompt, seed, undefined, negativePrompt);
                    }
                }

                results.push(result);
                onProgress(i, 'complete', result);
                console.log(`[FIBO] ✓ Shot ${i + 1} complete`);

            } catch (error) {
                console.error(`[FIBO] ✗ Error generating shot ${i + 1}:`, error);
                onProgress(i, 'error');
                throw error;
            }
        }

        console.log('[FIBO Sequence] ✓ Complete! Generated', results.length, 'shots with enhanced consistency');
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
