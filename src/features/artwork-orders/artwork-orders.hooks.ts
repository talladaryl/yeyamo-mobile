import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { artworkOrdersApi } from './artwork-orders.api';
import type { ArtworkOrder, CreateArtworkOrderInput } from './artwork-orders.types';
const keys = { all: ['artwork-orders'] as const, mine: () => [...keys.all, 'mine'] as const, detail: (id: string) => [...keys.all, 'detail', id] as const, artisan: () => [...keys.all, 'artisan'] as const };
export function useArtworkOrders() { const isBackend = useAuthStore((state) => state.sessionMode === 'backend'); return useQuery({ queryKey: keys.mine(), queryFn: artworkOrdersApi.mine, enabled: isBackend }); }
export function useArtworkOrder(id?: string) { const isBackend = useAuthStore((state) => state.sessionMode === 'backend'); return useQuery({ queryKey: keys.detail(id ?? ''), queryFn: () => artworkOrdersApi.detail(id!), enabled: Boolean(id) && isBackend }); }
export function useCreateArtworkOrder() { const client = useQueryClient(); return useMutation({ mutationFn: (input: CreateArtworkOrderInput) => artworkOrdersApi.create(input), onSuccess: () => client.invalidateQueries({ queryKey: keys.mine() }) }); }
export function useCancelArtworkOrder() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, reason }: { id: string; reason: string }) => artworkOrdersApi.cancel(id, reason), onSuccess: () => client.invalidateQueries({ queryKey: keys.all }) }); }
export function useArtisanOrders() { const isBackend = useAuthStore((state) => state.sessionMode === 'backend'); return useQuery({ queryKey: keys.artisan(), queryFn: artworkOrdersApi.artisan, enabled: isBackend }); }
export function useArtisanOrder(id?: string) { const isBackend = useAuthStore((state) => state.sessionMode === 'backend'); return useQuery({ queryKey: [...keys.artisan(), id ?? ''], queryFn: () => artworkOrdersApi.artisanDetail(id!), enabled: Boolean(id) && isBackend }); }
export function useUpdateArtisanOrder() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, status, reason }: { id: string; status: ArtworkOrder['status']; reason: string }) => artworkOrdersApi.artisanStatus(id, status, reason), onSuccess: () => client.invalidateQueries({ queryKey: keys.all }) }); }
