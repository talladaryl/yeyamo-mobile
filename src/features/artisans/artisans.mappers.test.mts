import { mapArtisan } from './artisans.mappers.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const artisan = mapArtisan({
  id: '7b726e4d-98d9-4756-b967-b206d1b3ed2a', displayName: 'Atelier Wouri', story: 'Histoire',
  craftDescription: 'Poterie', yearsOfExperience: 12, countryCode: 'CM', adminLevel1Id: null,
  cityId: 'Douala', localityId: null, languages: ['fr'], specialties: [], acceptsCustomOrders: true,
  internationalShipping: false, verified: true,
});

assert(artisan.partnerId === '7b726e4d-98d9-4756-b967-b206d1b3ed2a', 'PublicResponse.id must map to partnerId');
assert(artisan.verificationStatus === 'VERIFIED', 'PublicResponse.verified must map to verificationStatus');
console.info('artisan public DTO mapping: PASS');
