/**
 * Consistency Validator
 * 
 * Analyzes generated images for visual consistency across a sequence.
 * Uses color histogram comparison and structural analysis to detect
 * inconsistencies in character/scene appearance.
 */

export interface ConsistencyResult {
    overall: number;
    colorPalette: number;
    structure: number;
    lighting: number;
    details: {
        colorVariance: number;
        brightnessVariance: number;
        dominantColors: string[];
    };
    issues: string[];
    recommendations: string[];
}

export interface ImageAnalysis {
    histogram: number[];
    brightness: number;
    dominantColors: string[];
    colorVariance: number;
}

/**
 * Analyze a single image and extract color/brightness features
 */
export async function analyzeImage(imageUrl: string): Promise<ImageAnalysis> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            // Scale down for faster processing
            const maxSize = 256;
            const scale = Math.min(maxSize / img.width, maxSize / img.height);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Calculate color histogram (simplified: 16 bins per channel)
            const histogram = new Array(48).fill(0);
            let totalBrightness = 0;
            const colorCounts: Record<string, number> = {};

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Histogram bins (16 per channel)
                histogram[Math.floor(r / 16)] += 1;
                histogram[16 + Math.floor(g / 16)] += 1;
                histogram[32 + Math.floor(b / 16)] += 1;

                // Brightness (average of RGB)
                totalBrightness += (r + g + b) / 3;

                // Dominant colors (quantize to 32 levels)
                const qr = Math.floor(r / 32) * 32;
                const qg = Math.floor(g / 32) * 32;
                const qb = Math.floor(b / 32) * 32;
                const colorKey = `rgb(${qr},${qg},${qb})`;
                colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
            }

            // Normalize histogram
            const totalPixels = (data.length / 4);
            for (let i = 0; i < histogram.length; i++) {
                histogram[i] /= totalPixels;
            }

            // Get top 5 dominant colors
            const sortedColors = Object.entries(colorCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([color]) => color);

            // Calculate color variance
            const avgBrightness = totalBrightness / totalPixels;
            let variance = 0;
            for (let i = 0; i < data.length; i += 4) {
                const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                variance += Math.pow(brightness - avgBrightness, 2);
            }
            variance /= totalPixels;

            resolve({
                histogram,
                brightness: avgBrightness,
                dominantColors: sortedColors,
                colorVariance: Math.sqrt(variance)
            });
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        img.src = imageUrl;
    });
}

/**
 * Compare two histograms using histogram intersection
 */
function compareHistograms(hist1: number[], hist2: number[]): number {
    let intersection = 0;
    for (let i = 0; i < hist1.length; i++) {
        intersection += Math.min(hist1[i], hist2[i]);
    }
    return intersection; // 0 to 1, higher is more similar
}

/**
 * Calculate color palette similarity
 */
function compareDominantColors(colors1: string[], colors2: string[]): number {
    const set1 = new Set(colors1);
    const matches = colors2.filter(c => set1.has(c)).length;
    return matches / Math.max(colors1.length, colors2.length);
}

/**
 * Validate consistency across multiple images
 */
export async function validateSequenceConsistency(
    imageUrls: string[],
    onProgress?: (current: number, total: number) => void
): Promise<ConsistencyResult> {
    if (imageUrls.length < 2) {
        return {
            overall: 100,
            colorPalette: 100,
            structure: 100,
            lighting: 100,
            details: {
                colorVariance: 0,
                brightnessVariance: 0,
                dominantColors: []
            },
            issues: [],
            recommendations: []
        };
    }

    const analyses: ImageAnalysis[] = [];
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Analyze all images
    for (let i = 0; i < imageUrls.length; i++) {
        onProgress?.(i + 1, imageUrls.length);
        try {
            const analysis = await analyzeImage(imageUrls[i]);
            analyses.push(analysis);
        } catch (error) {
            console.error(`Failed to analyze image ${i}:`, error);
            // Push a placeholder analysis
            analyses.push({
                histogram: new Array(48).fill(1 / 48),
                brightness: 128,
                dominantColors: [],
                colorVariance: 50
            });
        }
    }

    // Compare each image to all others
    const histogramScores: number[] = [];
    const colorScores: number[] = [];
    const brightnessValues: number[] = [];

    for (let i = 0; i < analyses.length; i++) {
        brightnessValues.push(analyses[i].brightness);

        for (let j = i + 1; j < analyses.length; j++) {
            histogramScores.push(compareHistograms(analyses[i].histogram, analyses[j].histogram));
            colorScores.push(compareDominantColors(analyses[i].dominantColors, analyses[j].dominantColors));
        }
    }

    // Calculate average scores
    const avgHistogramScore = histogramScores.reduce((a, b) => a + b, 0) / histogramScores.length;
    const avgColorScore = colorScores.reduce((a, b) => a + b, 0) / colorScores.length;

    // Calculate brightness variance
    const avgBrightness = brightnessValues.reduce((a, b) => a + b, 0) / brightnessValues.length;
    const brightnessVariance = brightnessValues.reduce((sum, v) => sum + Math.pow(v - avgBrightness, 2), 0) / brightnessValues.length;
    const normalizedBrightnessScore = Math.max(0, 100 - Math.sqrt(brightnessVariance));

    // Calculate color variance across all images
    const allVariances = analyses.map(a => a.colorVariance);
    const avgColorVariance = allVariances.reduce((a, b) => a + b, 0) / allVariances.length;

    // Collect all dominant colors
    const allDominantColors = new Set<string>();
    analyses.forEach(a => a.dominantColors.forEach(c => allDominantColors.add(c)));

    // Generate scores (0-100 scale, clamped)
    const colorPaletteScore = Math.min(100, Math.max(0, avgColorScore * 100));
    const structureScore = Math.min(100, Math.max(0, avgHistogramScore * 100));
    const lightingScore = Math.min(100, Math.max(0, normalizedBrightnessScore));

    // Overall score (weighted average, clamped)
    const overallScore = Math.min(100, Math.max(0,
        colorPaletteScore * 0.4 + structureScore * 0.35 + lightingScore * 0.25
    ));

    // Detect issues
    if (colorPaletteScore < 60) {
        issues.push('Color palette varies significantly between frames');
        recommendations.push('Consider using a fixed color palette in style settings');
    }

    if (lightingScore < 70) {
        issues.push('Lighting/brightness inconsistent across sequence');
        recommendations.push('Lock lighting direction and intensity in shot parameters');
    }

    if (structureScore < 50) {
        issues.push('Overall visual structure differs between frames');
        recommendations.push('Ensure character description remains constant across shots');
    }

    if (overallScore >= 80) {
        recommendations.push('✨ Excellent consistency! Sequence is production-ready');
    } else if (overallScore >= 60) {
        recommendations.push('Good consistency with minor variations');
    }

    return {
        overall: Math.round(Math.min(100, overallScore)),
        colorPalette: Math.round(Math.min(100, colorPaletteScore)),
        structure: Math.round(Math.min(100, structureScore)),
        lighting: Math.round(Math.min(100, lightingScore)),
        details: {
            colorVariance: Math.round(avgColorVariance),
            brightnessVariance: Math.round(Math.sqrt(brightnessVariance)),
            dominantColors: Array.from(allDominantColors).slice(0, 5)
        },
        issues,
        recommendations
    };
}

/**
 * Get a simple consistency score label
 */
export function getConsistencyLabel(score: number): {
    label: string;
    color: string;
    emoji: string;
} {
    if (score >= 85) {
        return { label: 'Excellent', color: '#10b981', emoji: '🎯' };
    } else if (score >= 70) {
        return { label: 'Good', color: '#6366f1', emoji: '✓' };
    } else if (score >= 50) {
        return { label: 'Fair', color: '#f59e0b', emoji: '⚠️' };
    } else {
        return { label: 'Needs Work', color: '#ef4444', emoji: '❌' };
    }
}
