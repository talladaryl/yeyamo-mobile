import { toActivePlaceCategoryOptions } from './place.categories.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

// Exact field shape returned by GET /api/v1/categories after the reference
// data migration. This is deliberately not a runtime fallback.
const options = toActivePlaceCategoryOptions([
  { id: 1, name: 'Hôtel', active: true },
  { id: 2, name: 'Restaurant', active: true },
  { id: 3, name: 'Culture', active: true },
  { id: 4, name: 'Loisir', active: true },
  { id: 5, name: 'Commerce', active: true },
  { id: 6, name: 'Nature', active: true },
  { id: 7, name: 'Inactive', active: false },
]);

assert(options.length === 6, 'The selector must expose every active backend category');
assert(options[0]?.label === 'Hôtel' && options[0]?.value === '1', 'The backend ID must be retained by the partner selector');
assert(!options.some((option) => option.label === 'Inactive'), 'Inactive categories must not be selectable');

console.info('place categories response -> selector options: PASS');
