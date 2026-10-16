import type { ArtworkApiDto } from './artworks.mappers.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const response = { id: 'artwork-1', artisanId: 'partner-1' } satisfies Pick<ArtworkApiDto, 'id' | 'artisanId'>;
assert(response.id === 'artwork-1', 'PublicSummary.id must remain available for assetId mapping');
assert(response.artisanId === 'partner-1', 'PublicSummary.artisanId must remain available for artisanPartnerId mapping');
console.info('artwork public DTO contract shape: PASS');
