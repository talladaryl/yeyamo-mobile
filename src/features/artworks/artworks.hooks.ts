import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { toSpringPage } from '@/services/api/contracts';
import { artworksApi } from './artworks.api';
import { demoArtwork, demoArtworkDetail, demoArtworkOffer } from './artworks.demo';
import { artworkKeys } from './artworks.query-keys';
import type { ArtworkFilters, ArtworkOfferInput, ArtworkRequest } from './artworks.types';
const useDemo = () => useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
export function useArtworks(filters: ArtworkFilters = {}) { const demo = useDemo(); return useQuery({ queryKey: artworkKeys.list(filters), queryFn: () => demo ? Promise.resolve(toSpringPage([demoArtwork])) : artworksApi.list(filters) }); }
export function useArtwork(id?: string) { const demo = useDemo(); return useQuery({ queryKey: artworkKeys.detail(id ?? ''), enabled: Boolean(id), queryFn: () => demo ? Promise.resolve(demoArtworkDetail) : artworksApi.detail(id!) }); }
export function useArtworkHistory(id?: string) { const demo = useDemo(); return useQuery({ queryKey: artworkKeys.history(id ?? ''), enabled: Boolean(id), queryFn: () => demo ? Promise.resolve([]) : artworksApi.history(id!) }); }
export function useRelatedArtworks(id?: string) { const demo = useDemo(); return useQuery({ queryKey: artworkKeys.related(id ?? ''), enabled: Boolean(id), queryFn: () => demo ? Promise.resolve(toSpringPage([demoArtwork])) : artworksApi.related(id!) }); }
export function useArtworkOffer(id?: string) { const demo = useDemo(); return useQuery({ queryKey: artworkKeys.offer(id ?? ''), enabled: Boolean(id), retry: false, queryFn: () => demo ? Promise.resolve(demoArtworkOffer) : artworksApi.offer(id!) }); }
export function useCreateArtwork() { const client = useQueryClient(); const demo = useDemo(); return useMutation({ mutationFn: (input: ArtworkRequest) => demo ? Promise.resolve(demoArtworkDetail) : artworksApi.create(input), onSuccess: () => client.invalidateQueries({ queryKey: artworkKeys.all }) }); }
export function useCreateArtworkOffer() { const demo = useDemo(); return useMutation({ mutationFn: (input: ArtworkOfferInput) => demo ? Promise.resolve({ ...demoArtworkOffer, amount: input.amount ?? demoArtworkOffer.amount, currencyCode: input.currencyCode ?? demoArtworkOffer.currencyCode }) : artworksApi.createOffer(input) }); }
