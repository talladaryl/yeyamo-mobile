import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { toSpringPage } from '@/services/api/contracts';
import { artworksApi } from './artworks.api';
import { demoArtwork, demoArtworks, demoArtworkDetail, demoArtworkHistories, demoArtworkOffer, demoArtworkOfferFor } from './artworks.demo';
import { artworkKeys } from './artworks.query-keys';
import type { ArtworkFilters, ArtworkOfferInput, ArtworkRequest } from './artworks.types';
const useDemo=()=>useAuthStore((state)=>state.sessionMode?.startsWith('demo-')??false);
const findArtwork=(id?:string)=>demoArtworks.find((item)=>item.assetId===id)??demoArtwork;
export function useArtworks(filters:ArtworkFilters={}){const demo=useDemo();return useQuery({queryKey:artworkKeys.list(filters),queryFn:()=>demo?Promise.resolve(toSpringPage(demoArtworks.filter((item)=>(!filters.artisanId||item.artisanPartnerId===filters.artisanId)&&(!filters.search||item.title.toLowerCase().includes(filters.search.toLowerCase()))))):artworksApi.list(filters)});}
export function useArtwork(id?:string){const demo=useDemo();return useQuery({queryKey:artworkKeys.detail(id??''),enabled:Boolean(id),queryFn:()=>demo?Promise.resolve(demoArtworkDetail(findArtwork(id))):artworksApi.detail(id!)});}
export function useArtworkHistory(id?:string){const demo=useDemo();return useQuery({queryKey:artworkKeys.history(id??''),enabled:Boolean(id),queryFn:()=>demo?Promise.resolve(demoArtworkHistories(findArtwork(id))):artworksApi.history(id!)});}
export function useRelatedArtworks(id?:string){const demo=useDemo();return useQuery({queryKey:artworkKeys.related(id??''),enabled:Boolean(id),queryFn:()=>demo?Promise.resolve(toSpringPage(demoArtworks.filter((item)=>item.assetId!==id).slice(0,8))):artworksApi.related(id!)});}
export function useArtworkOffer(id?:string){const demo=useDemo();return useQuery({queryKey:artworkKeys.offer(id??''),enabled:Boolean(id),retry:false,queryFn:()=>demo?Promise.resolve(demoArtworkOfferFor(findArtwork(id))):artworksApi.offer(id!)});}
export function useCreateArtwork(){const client=useQueryClient();const demo=useDemo();return useMutation({mutationFn:(input:ArtworkRequest)=>demo?Promise.resolve(demoArtworkDetail(demoArtwork)):artworksApi.create(input),onSuccess:()=>client.invalidateQueries({queryKey:artworkKeys.all})});}
export function useCreateArtworkOffer(){const demo=useDemo();return useMutation({mutationFn:(input:ArtworkOfferInput)=>demo?Promise.resolve({...demoArtworkOffer,amount:input.amount??demoArtworkOffer.amount,currencyCode:input.currencyCode??demoArtworkOffer.currencyCode}):artworksApi.createOffer(input)});}
