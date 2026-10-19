import type { CultureRecipeDetails, CultureRecipeIngredient, CultureRecipeStep } from './culture.types';

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
export interface RichRecipeDetails extends Omit<CultureRecipeDetails, 'ingredients' | 'steps'> {
  ingredients: RichRecipeIngredient[];
  steps: RichRecipeStep[];
  cookTimeMinutes?: number | null;
  restTimeMinutes?: number | null;
  difficulty?: RecipeDifficulty | null;
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
