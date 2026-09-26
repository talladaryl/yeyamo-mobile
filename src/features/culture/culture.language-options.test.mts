import { toCultureLanguageOptions } from './culture.language-options.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

// Exact JSON field names emitted by CultureDtos.LanguageResponse.
const options = toCultureLanguageOptions([
  { code: 'fr', name: 'Français', nativeName: 'Français', countryCodes: ['CM'], writingSystem: 'Latin', status: 'ACTIVE', description: null, speakerEstimate: null, verified: false },
  { code: 'en', name: 'English', nativeName: 'English', countryCodes: ['CM'], writingSystem: 'Latin', status: 'ACTIVE', description: null, speakerEstimate: null, verified: false },
]);

assert(options.length === 2, 'The language selector must receive two options');
assert(options[0]?.value === 'fr' && options[0].label === 'Français', 'French must map to the form option');
assert(options[1]?.value === 'en' && options[1].label === 'English', 'English must map to the form option');

console.info('culture language response -> selector options: PASS');
