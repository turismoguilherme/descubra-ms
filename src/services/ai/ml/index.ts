/**
 * 🧠 GUATÁ MACHINE LEARNING - Exports
 * Exporta todos os serviços de machine learning
 */

export { guataMLService } from './guataMLService';
export type { LearningInteraction, FeedbackData, LearningMetrics } from './guataMLService';

export { PreferenceLearningService } from './preferenceLearningService';
export type { UserPreferences } from './preferenceLearningService';

export { QualityLearningService } from './qualityLearningService';
export type { QualityImprovement } from './qualityLearningService';

export { PatternDetectionService } from './patternDetectionService';
export type { DetectedPattern } from './patternDetectionService';

export { SupabaseMLIntegration } from './supabaseMLIntegration';
export { MLCacheService } from './mlCacheService';


