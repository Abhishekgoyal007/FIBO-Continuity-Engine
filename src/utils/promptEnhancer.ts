/**
 * Gemini Prompt Enhancement Service
 * 
 * Uses Google's Gemini API to enhance basic prompts into 
 * detailed, FIBO-optimized structured descriptions.
 */

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface EnhancementResult {
    enhanced: string;
    suggestions: string[];
    keywords: string[];
}

/**
 * Enhance a basic prompt using Gemini AI
 */
export async function enhancePrompt(
    basicPrompt: string,
    style: string,
    apiKey?: string
): Promise<EnhancementResult> {
    // If no API key, use a rule-based enhancement
    if (!apiKey) {
        return enhancePromptLocal(basicPrompt, style);
    }

    try {
        const systemPrompt = `You are an expert at creating detailed image generation prompts for FIBO, a professional AI image generator.

Your task is to take a simple prompt and expand it into a highly detailed, specific description that will generate consistent, professional images.

Rules:
1. Add specific material descriptions (glass, metal, fabric texture)
2. Include exact colors (not just "red" but "deep crimson red")
3. Describe the shape and proportions precisely
4. Add lighting details appropriate for the style
5. Include surface/background details
6. Keep it under 150 words
7. Make it suitable for product photography or character visualization
8. DO NOT include camera angles - those will be added separately

Style context: ${style}

Respond ONLY with the enhanced prompt, nothing else.`;

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
                    temperature: 0.7,
                    maxOutputTokens: 300,
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
 * Local rule-based prompt enhancement (fallback)
 */
function enhancePromptLocal(basicPrompt: string, style: string): EnhancementResult {
    const prompt = basicPrompt.toLowerCase();
    const enhancements: string[] = [];
    const suggestions: string[] = [];
    const keywords: string[] = [];

    // Start with the original prompt
    let enhanced = basicPrompt;

    // Add style-specific enhancements
    switch (style) {
        case 'photorealistic':
            enhancements.push('photorealistic', 'professional photography', '8K resolution', 'sharp focus', 'high detail');
            break;
        case 'cinematic':
            enhancements.push('cinematic lighting', 'film still', 'dramatic shadows', 'color graded');
            break;
        case 'product':
            enhancements.push('professional product photography', 'studio lighting', 'clean background', 'commercial quality');
            break;
        case 'anime':
            enhancements.push('anime style', 'vibrant colors', 'clean lines', 'detailed shading');
            break;
        case 'concept':
            enhancements.push('concept art', 'digital painting', 'artstation quality');
            break;
        case '3d':
            enhancements.push('3D render', 'octane render', 'volumetric lighting', 'subsurface scattering');
            break;
    }

    // Add material suggestions based on content
    if (prompt.includes('bottle') || prompt.includes('perfume') || prompt.includes('cologne')) {
        if (!prompt.includes('glass')) enhancements.push('crystal-clear glass');
        if (!prompt.includes('cap')) suggestions.push('Consider describing the cap material (gold, silver, wood)');
        keywords.push('bottle', 'fragrance', 'luxury');
    }

    if (prompt.includes('character') || prompt.includes('person') || prompt.includes('woman') || prompt.includes('man')) {
        if (!prompt.includes('skin')) enhancements.push('detailed skin texture');
        if (!prompt.includes('expression')) suggestions.push('Consider adding facial expression');
        keywords.push('character', 'portrait');
    }

    if (prompt.includes('watch') || prompt.includes('jewelry')) {
        enhancements.push('highly polished', 'reflective surfaces', 'intricate details');
        keywords.push('luxury', 'accessories');
    }

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

    if (!text.includes('lighting')) {
        suggestions.push('Consider adding specific lighting details');
    }
    if (!text.includes('texture')) {
        suggestions.push('Adding texture descriptions can improve realism');
    }
    if (!text.includes('background') && !text.includes('surface')) {
        suggestions.push('Describe the background or surface for better context');
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
        'lighting', 'shadows', 'reflections', 'texture'
    ];

    return commonKeywords.filter(kw => text.toLowerCase().includes(kw));
}

/**
 * Suggest improvements for a prompt
 */
export function suggestImprovements(prompt: string): string[] {
    const suggestions: string[] = [];
    const lower = prompt.toLowerCase();

    if (prompt.length < 20) {
        suggestions.push('Add more details for better results');
    }

    if (!lower.match(/color|colour|red|blue|green|gold|silver|black|white/)) {
        suggestions.push('Add specific color descriptions');
    }

    if (!lower.match(/glass|metal|fabric|leather|wood|plastic|ceramic/)) {
        suggestions.push('Describe materials and textures');
    }

    if (!lower.match(/on|against|with|background|surface/)) {
        suggestions.push('Describe the setting or background');
    }

    return suggestions;
}
