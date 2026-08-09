import type { Artwork, ArtworkMedia } from './artworks.types';
export function primaryArtworkMedia(media: ArtworkMedia[]): ArtworkMedia | undefined { return [...media].sort((a, b) => a.displayOrder - b.displayOrder).find((item) => item.mediaType === 'PRIMARY_IMAGE') ?? media[0]; }
export function dimensions(artwork: Artwork): string | null { const values = [artwork.width, artwork.height, artwork.depth].filter((value) => value !== null && value !== undefined); return values.length ? `${values.join(' × ')} cm` : null; }
