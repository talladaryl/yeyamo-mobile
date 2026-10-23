import type { CultureRecipeDetails, CultureRecipeIngredient, CultureRecipeStep, RecipeDifficultyCode } from './culture.types';

export type RecipeDifficulty = 'Facile' | 'Intermédiaire' | 'Avancée';

export interface RichRecipeIngredient extends CultureRecipeIngredient {
  id?: string;
  group?: string | null;
  optional?: boolean;
  substitution?: string | null;
  quantityValue?: number | null;
}

export interface RichRecipeStep extends CultureRecipeStep {
  id?: string;
  title?: string | null;
  durationMinutes?: number | null;
  temperature?: string | null;
  ingredientIds?: string[];
  equipment?: string[];
  mediaUrl?: string | null;
  mediaType?: 'image' | 'video' | null;
  expectedResult?: string | null;
  tip?: string | null;
  safetyNote?: string | null;
}

/** Optional extension understood by the frontend. Real responses remain valid
 * while the additive backend contract is awaiting approval. */
export interface RichRecipeDetails extends Omit<CultureRecipeDetails, 'ingredients' | 'steps' | 'difficulty' | 'equipment' | 'tips' | 'variants' | 'accompaniments' | 'safetyNotes'> {
  ingredients: RichRecipeIngredient[];
  steps: RichRecipeStep[];
  cookTimeMinutes?: number | null;
  restTimeMinutes?: number | null;
  difficulty?: RecipeDifficulty | null;
  heroMediaId?: string | null;
  videoMediaId?: string | null;
  heroMediaUrl?: string | null;
  videoUrl?: string | null;
  equipment?: string[];
  preparationAhead?: string | null;
  tips?: string[];
  variants?: string[];
  accompaniments?: string[];
  plating?: string | null;
  storage?: string | null;
  reheating?: string | null;
  safetyNotes?: string[];
}

const DIFFICULTY_LABELS: Record<RecipeDifficultyCode, RecipeDifficulty> = { SIMPLE: 'Facile', INTERMEDIAIRE: 'Intermédiaire', AVANCE: 'Avancée' };
const lines = (value?: string | null) => value?.split(/\r?\n/).map((item) => item.trim()).filter(Boolean) ?? [];

export function adaptRecipeDetails(details: CultureRecipeDetails): RichRecipeDetails {
  return {
    ...details,
    difficulty: details.difficulty ? DIFFICULTY_LABELS[details.difficulty] : null,
    equipment: details.equipment?.map((item) => item.name) ?? [],
    tips: lines(details.tips), variants: lines(details.variants), accompaniments: lines(details.accompaniments), safetyNotes: lines(details.safetyNotes),
    ingredients: details.ingredients.map((item) => ({ ...item, group: item.groupName, substitution: item.substitutionNotes })),
    steps: details.steps.map((step) => ({ ...step, temperature: step.temperatureValue == null ? null : `${step.temperatureValue} °${step.temperatureUnit ?? 'C'}` })),
  };
}

export interface DemoRecipe {
  id: string;
  countryCode: string;
  countryName: string;
  category: string;
  title: string;
  region?: string;
  community?: string;
  summary?: string;
  history?: string;
  origin?: string;
  details: RichRecipeDetails;
}

export function isScalableQuantity(ingredient: RichRecipeIngredient): ingredient is RichRecipeIngredient & { quantityValue: number } {
  return typeof ingredient.quantityValue === 'number' && Number.isFinite(ingredient.quantityValue);
}

export function formatScaledQuantity(ingredient: RichRecipeIngredient, ratio: number) {
  if (!isScalableQuantity(ingredient)) return ingredient.quantity;
  const scaled = ingredient.quantityValue * ratio;
  return Number.isInteger(scaled) ? String(scaled) : scaled.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
}
