import { demoRecipeFixtures, getDemoRecipe } from './recipe.demo.ts';
import { formatScaledQuantity, isScalableQuantity } from './recipe.types.ts';
import { recipeCountryCatalog } from '../country/recipe-country-catalog.ts';

function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }

assert(recipeCountryCatalog.length > 180, 'Cuisine must expose a complete local ISO country catalog');
assert(recipeCountryCatalog.some((country) => country.code === 'CM' && country.flag === '🇨🇲'), 'Cameroon and its flag must be local');
assert(demoRecipeFixtures.every((recipe) => recipe.id.startsWith('demo-recipe-')), 'Demo IDs must be explicitly isolated');
assert(getDemoRecipe('demo-recipe-ndole')?.details.steps.length === 5, 'The complete demo recipe must support guided cooking');
assert(getDemoRecipe('demo-recipe-minimal')?.details.heroMediaUrl == null, 'The minimal fixture must cover the missing-image state');
const rice = getDemoRecipe('demo-recipe-jollof')!.details.ingredients[0];
assert(isScalableQuantity(rice), 'The structured demo quantity must be scalable');
assert(formatScaledQuantity(rice, 2) === '1200', 'A structured quantity must scale deterministically');
const ambiguous = getDemoRecipe('demo-recipe-minimal')!.details.ingredients[0];
assert(!isScalableQuantity(ambiguous) && formatScaledQuantity(ambiguous, 2) === ambiguous.quantity, 'Ambiguous text quantities must never be multiplied');

console.info('recipe demo isolation, countries, guided data and safe scaling: PASS');
