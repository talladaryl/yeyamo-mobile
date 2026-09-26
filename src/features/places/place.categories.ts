import type { PlaceCategoryReference } from './places.api';

/**
 * The category endpoint is the only production source. Keeping the mapping
 * here makes both public and partner forms apply the same active-only rule.
 */
export function toActivePlaceCategoryOptions(categories: readonly PlaceCategoryReference[]) {
  return categories
    .filter((category) => category.active)
    .map((category) => ({ label: category.name, value: String(category.id) }));
}
