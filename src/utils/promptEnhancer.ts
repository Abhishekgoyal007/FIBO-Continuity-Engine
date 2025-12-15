/**
 * ENHANCED Gemini Prompt Enhancement Service
 * 
 * Uses Google's Gemini API to enhance basic prompts into 
 * detailed, FIBO-optimized structured descriptions.
 * 
 * ENHANCED with better style understanding and hackathon-winning prompts!
 */

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface EnhancementResult {
    enhanced: string;
    suggestions: string[];
    keywords: string[];
}

/**
 * Enhance a basic prompt using Gemini AI - ENHANCED VERSION
 */
export async function enhancePrompt(
    basicPrompt: string,
    style: string,
    apiKey?: string
): Promise<EnhancementResult> {
    // If no API key, use enhanced rule-based enhancement
    if (!apiKey) {
        return enhancePromptLocal(basicPrompt, style);
    }

    try {
        const systemPrompt = `You are a world-class prompt engineer specializing in creating stunning AI image generation prompts for FIBO, a professional multi-frame consistency engine.

Your task is to transform a simple idea into a breathtakingly detailed, production-quality image description. You are creating prompts that could win a hackathon for visual quality.

CRITICAL RULES:
1. Add SPECIFIC material descriptions (brushed metal, frosted glass, matte ceramic, iridescent shell)
2. Include PRECISE colors (not "red" but "rich burgundy with subtle crimson undertones")
3. Describe EXACT shape, proportions, and visual weight
4. Add PROFESSIONAL lighting setup (three-point lighting, rim lights, soft boxes)
5. Include surface/background with texture and atmosphere
6. Add QUALITY modifiers: 8K, RAW photo, DSLR quality, masterpiece
7. Make it suitable for award-winning product photography or character visualization
8. DO NOT include camera angles - those are added separately
9. Keep total length between 80-150 words
10. Write as a single flowing description, not a list

Style context: ${style}

Transform even simple prompts into magazine-cover worthy descriptions.`;

        const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${systemPrompt}\n\nOriginal prompt: "${basicPrompt}"\n\nEnhanced prompt:`
                    }]
                }],
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 400,
                }
            }),
        });

        if (!response.ok) {
            console.warn('Gemini API failed, using local enhancement');
            return enhancePromptLocal(basicPrompt, style);
        }

        const data = await response.json();
        const enhancedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        return {
            enhanced: enhancedText.trim(),
            suggestions: extractSuggestions(enhancedText),
            keywords: extractKeywords(enhancedText),
        };
    } catch (error) {
        console.error('Gemini enhancement failed:', error);
        return enhancePromptLocal(basicPrompt, style);
    }
}

/**
 * ENHANCED Local rule-based prompt enhancement (fallback)
 * Now with hackathon-winning prompt additions!
 */
function enhancePromptLocal(basicPrompt: string, style: string): EnhancementResult {
    const prompt = basicPrompt.toLowerCase();
    const enhancements: string[] = [];
    const suggestions: string[] = [];
    const keywords: string[] = [];

    // Start with the original prompt
    let enhanced = basicPrompt;

    // Add style-specific ENHANCED enhancements
    switch (style) {
        case 'photorealistic':
            enhancements.push(
                'photorealistic',
                'professional photography',
                '8K UHD resolution',
                'RAW photo quality',
                'DSLR captured',
                'sharp focus throughout',
                'high dynamic range',
                'professional color grading'
            );
            break;
        case 'cinematic':
            enhancements.push(
                'cinematic masterpiece',
                'anamorphic lens bokeh',
                '35mm film grain',
                'dramatic chiaroscuro lighting',
                'Hollywood color grading',
                'shallow depth of field'
            );
            break;
        case 'product':
            enhancements.push(
                'professional product photography',
                'commercial advertisement quality',
                'studio lighting setup',
                'perfectly lit',
                'clean gradient background',
                'magazine cover worthy',
                'sharp product details'
            );
            break;
        case 'anime':
            enhancements.push(
                'anime masterpiece',
                'Studio Ghibli quality',
                'vibrant saturated colors',
                'clean crisp linework',
                'beautiful cel shading',
                'expressive character design'
            );
            break;
        case 'concept':
            enhancements.push(
                'professional concept art',
                'artstation HQ trending',
                'digital painting masterpiece',
                'matte painting quality',
                'detailed environment design'
            );
            break;
        case '3d':
            enhancements.push(
                '3D render masterpiece',
                'Octane render quality',
                'Cinema 4D professional',
                'volumetric lighting',
                'subsurface scattering',
                'ray traced reflections'
            );
            break;
    }

    // Add ENHANCED material suggestions based on content
    if (prompt.includes('bottle') || prompt.includes('perfume') || prompt.includes('cologne')) {
        if (!prompt.includes('glass')) enhancements.push('crystal-clear premium glass with subtle refractions');
        if (!prompt.includes('cap')) suggestions.push('Consider describing the cap material (polished gold, brushed silver, exotic wood)');
        enhancements.push('luxury fragrance aesthetic');
        keywords.push('bottle', 'fragrance', 'luxury', 'premium');
    }

    if (prompt.includes('character') || prompt.includes('person') || prompt.includes('woman') || prompt.includes('man')) {
        if (!prompt.includes('skin')) enhancements.push('detailed natural skin texture with subtle pores');
        if (!prompt.includes('expression')) suggestions.push('Add specific facial expression for emotional impact');
        enhancements.push('professional portrait lighting');
        keywords.push('character', 'portrait', 'human');
    }

    if (prompt.includes('watch') || prompt.includes('jewelry') || prompt.includes('ring')) {
        enhancements.push('highly polished surface', 'micro-detailed craftsmanship', 'luxurious reflective surfaces');
        keywords.push('luxury', 'accessories', 'craftsmanship');
    }

    if (prompt.includes('car') || prompt.includes('vehicle') || prompt.includes('automobile')) {
        enhancements.push('automotive photography', 'showroom lighting', 'reflective paint finish');
        keywords.push('automotive', 'vehicle', 'transportation');
    }

    if (prompt.includes('food') || prompt.includes('dish') || prompt.includes('cuisine')) {
        enhancements.push('food photography', 'appetizing presentation', 'steam and freshness');
        keywords.push('food', 'culinary', 'gourmet');
    }

    // Add universal quality boosters
    enhancements.push('masterpiece quality');
    enhancements.push('award-winning');

    // Build enhanced prompt
    enhanced = `${basicPrompt}, ${enhancements.join(', ')}`;

    return {
        enhanced,
        suggestions,
        keywords,
    };
}

/**
 * Extract suggestions from enhanced prompt
 */
function extractSuggestions(text: string): string[] {
    const suggestions: string[] = [];

    if (!text.includes('lighting') && !text.includes('light')) {
        suggestions.push('💡 Add specific lighting details for more control');
    }
    if (!text.includes('texture') && !text.includes('material')) {
        suggestions.push('🎨 Material/texture descriptions improve realism');
    }
    if (!text.includes('background') && !text.includes('surface') && !text.includes('scene')) {
        suggestions.push('🖼️ Describe the setting for better context');
    }
    if (text.split(' ').length < 30) {
        suggestions.push('📝 More details = more control over the output');
    }

    return suggestions;
}

/**
 * Extract keywords from text
 */
function extractKeywords(text: string): string[] {
    const commonKeywords = [
        'glass', 'metal', 'gold', 'silver', 'crystal', 'marble', 'wood',
        'elegant', 'luxury', 'premium', 'professional', 'studio',
        'lighting', 'shadows', 'reflections', 'texture', 'detailed',
        'photorealistic', 'cinematic', 'masterpiece', 'award-winning'
    ];

    return commonKeywords.filter(kw => text.toLowerCase().includes(kw));
}

/**
 * ENHANCED: Suggest improvements for a prompt
 */
export function suggestImprovements(prompt: string): string[] {
    const suggestions: string[] = [];
    const lower = prompt.toLowerCase();

    if (prompt.length < 20) {
        suggestions.push('✍️ Add more details for better control');
    }

    if (!lower.match(/color|colour|red|blue|green|gold|silver|black|white|crimson|azure|amber/)) {
        suggestions.push('🎨 Add specific color descriptions');
    }

    if (!lower.match(/glass|metal|fabric|leather|wood|plastic|ceramic|crystal|matte|glossy/)) {
        suggestions.push('🏛️ Describe materials and textures');
    }

    if (!lower.match(/on|against|with|background|surface|scene|environment/)) {
        suggestions.push('🌍 Describe the setting or background');
    }

    if (!lower.match(/lighting|light|shadow|glow|illuminat/)) {
        suggestions.push('💡 Add lighting description for mood');
    }

    return suggestions.slice(0, 3); // Max 3 suggestions
}
