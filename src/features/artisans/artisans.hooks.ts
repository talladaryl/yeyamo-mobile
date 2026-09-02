import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { toSpringPage } from '@/services/api/contracts';
import { artworksApi } from '@/features/artworks/artworks.api';
import { demoArtworks } from '@/features/artworks/artworks.demo';
import { artisansApi } from './artisans.api';
import { demoArtisan, demoArtisans } from './artisans.demo';
import { artisanKeys } from './artisans.query-keys';
import type { ArtisanFilters } from './artisans.types';
const useDemo = () => useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
export function useArtisans(filters: ArtisanFilters = {}) { const demo = useDemo(); return useQuery({ queryKey: artisanKeys.list(filters), queryFn: () => demo ? Promise.resolve(toSpringPage(demoArtisans)) : artisansApi.list(filters) }); }
export function useArtisan(id?: string) { const demo = useDemo(); return useQuery({ queryKey: artisanKeys.detail(id ?? ''), enabled: Boolean(id), queryFn: () => demo ? Promise.resolve(demoArtisans.find((item) => item.partnerId === id) ?? demoArtisan) : artisansApi.detail(id!) }); }
export function useArtisanSpecialties() { const demo = useDemo(); return useQuery({ queryKey: artisanKeys.specialties(), queryFn: () => demo ? Promise.resolve(demoArtisans.flatMap((item) => item.specialties).filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index)) : artisansApi.specialties() }); }
export function useArtisanArtworks(id?: string) { const demo = useDemo(); return useQuery({ queryKey: artisanKeys.artworks(id ?? ''), enabled: Boolean(id), queryFn: () => demo ? Promise.resolve(toSpringPage(demoArtworks.filter((item) => item.artisanPartnerId === id))) : artworksApi.byArtisan(id!) }); }
export function useMyArtisan() { const demo = useDemo(); return useQuery({ queryKey: [...artisanKeys.all, 'me'], queryFn: () => demo ? Promise.resolve(demoArtisan) : artisansApi.myProfile() }); }
export function useCreateMyArtisan() { const demo = useDemo(); return useMutation({ mutationFn: (input: import('./artisans.api').ArtisanProfileInput) => demo ? Promise.reject(new Error('Compte démo')) : artisansApi.createMyProfile(input) }); }
