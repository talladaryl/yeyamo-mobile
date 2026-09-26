import { isAdministrativeDescendant } from './country.geography.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

// Mirrors the Country Config migration hierarchy selected by the mobile UI.
const parents = new Map<string, string | null>([
  ['centre', null],
  ['mfoundi', 'centre'],
]);

assert(isAdministrativeDescendant('mfoundi', 'centre', parents), 'Centre must include cities attached to Mfoundi');
assert(isAdministrativeDescendant('mfoundi', 'mfoundi', parents), 'Mfoundi must include Yaoundé directly');
assert(!isAdministrativeDescendant('mfoundi', 'littoral', parents), 'Littoral must not include Yaoundé');

console.info('country geography Centre -> Mfoundi -> Yaounde: PASS');
