/**
 * Auto-Regeneration Module
 * 
 * Automatically regenerates shots that don't meet consistency thresholds.
 * Uses the consistency validator to identify problematic frames and
 * triggers targeted regeneration with adjusted parameters.
 */

import { validateSequenceConsistency, analyzeImage } from './consistency';
import type { FiboResult } from '../api/fibo';

export interface RegenerationResult {
    shotIndex: number;
    originalScore: number;
    newScore: number;
    improved: boolean;
    attempts: number;
}

export interface RegenerationConfig {
    minConsistencyScore: number;
    maxAttempts: number;
    onProgress?: (message: string) => void;
    onShotRegenerated?: (index: number, result: FiboResult) => void;
}

const DEFAULT_CONFIG: RegenerationConfig = {
    minConsistencyScore: 70,
    maxAttempts: 2,
};

/**
 * Identify which shots have consistency issues compared to the sequence
 */
export async function identifyInconsistentShots(
    imageUrls: string[]
): Promise<{
    inconsistentIndices: number[];
    avgScore: number;
    perShotScores: number[];
}> {
    if (imageUrls.length < 2) {
        return {
            inconsistentIndices: [],
            avgScore: 100,
            perShotScores: [100]
        };
    }

    // Analyze all images
    const analyses = await Promise.all(
        imageUrls.map(url => analyzeImage(url).catch(() => null))
    );

    const validAnalyses = analyses.filter(a => a !== null);
    if (validAnalyses.length < 2) {
        return {
            inconsistentIndices: [],
            avgScore: 100,
            perShotScores: imageUrls.map(() => 100)
        };
    }

    // Calculate average histogram as baseline
    const avgHistogram = new Array(48).fill(0);
    for (const analysis of validAnalyses) {
        if (analysis) {
            for (let i = 0; i < 48; i++) {
                avgHistogram[i] += analysis.histogram[i] / validAnalyses.length;
            }
        }
    }

    // Calculate average brightness
    const avgBrightness = validAnalyses.reduce((sum, a) => sum + (a?.brightness || 0), 0) / validAnalyses.length;

    // Score each image against the average
    const perShotScores: number[] = [];
    const inconsistentIndices: number[] = [];

    for (let i = 0; i < analyses.length; i++) {
        const analysis = analyses[i];
        if (!analysis) {
            perShotScores.push(50); // Default score for failed analysis
            inconsistentIndices.push(i);
            continue;
        }

        // Calculate histogram similarity to average
        let histogramScore = 0;
        for (let j = 0; j < 48; j++) {
            histogramScore += Math.min(analysis.histogram[j], avgHistogram[j]);
        }
        histogramScore *= 100;

        // Calculate brightness deviation
        const brightnessDev = Math.abs(analysis.brightness - avgBrightness);
        const brightnessScore = Math.max(0, 100 - brightnessDev);

        // Combined score
        const combinedScore = histogramScore * 0.6 + brightnessScore * 0.4;
        perShotScores.push(Math.round(combinedScore));

        if (combinedScore < 60) {
            inconsistentIndices.push(i);
        }
    }

    const avgScore = perShotScores.reduce((a, b) => a + b, 0) / perShotScores.length;

    return {
        inconsistentIndices,
        avgScore: Math.round(avgScore),
        perShotScores
    };
}

/**
 * Suggest improvements for inconsistent shots
 */
export function getSuggestions(perShotScores: number[]): string[] {
    const suggestions: string[] = [];

    const lowScoreCount = perShotScores.filter(s => s < 60).length;
    const mediumScoreCount = perShotScores.filter(s => s >= 60 && s < 80).length;

    if (lowScoreCount > perShotScores.length / 2) {
        suggestions.push('Consider simplifying your character description for more consistency');
        suggestions.push('Try using a fixed color palette in Style Settings');
    }

    if (mediumScoreCount > 0) {
        suggestions.push('Lock lighting direction to maintain consistent shadows');
        suggestions.push('Use the same seed for all regeneration attempts');
    }

    if (lowScoreCount === 0 && mediumScoreCount === 0) {
        suggestions.push('🎯 Excellent! Your sequence has strong visual consistency');
    }

    return suggestions;
}

/**
 * Calculate per-shot consistency scores for detailed analysis
 */
export async function getDetailedShotAnalysis(
    imageUrls: string[]
): Promise<{
    index: number;
    score: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    dominantColors: string[];
    brightness: number;
}[]> {
    const analyses = await Promise.all(
        imageUrls.map(async (url, index) => {
            try {
                const analysis = await analyzeImage(url);

                // Calculate individual score based on color variance
                const varianceScore = Math.max(0, 100 - analysis.colorVariance);

                let status: 'excellent' | 'good' | 'fair' | 'poor';
                if (varianceScore >= 85) status = 'excellent';
                else if (varianceScore >= 70) status = 'good';
                else if (varianceScore >= 50) status = 'fair';
                else status = 'poor';

                return {
                    index,
                    score: Math.round(varianceScore),
                    status,
                    dominantColors: analysis.dominantColors,
                    brightness: Math.round(analysis.brightness)
                };
            } catch {
                return {
                    index,
                    score: 0,
                    status: 'poor' as const,
                    dominantColors: [],
                    brightness: 0
                };
            }
        })
    );

    return analyses;
}
