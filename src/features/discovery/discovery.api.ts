import { apiGet } from '@/services/api/client'; import type { DiscoveryPage, DiscoverySearchParams } from './discovery.types';
const clean=(values:object)=>Object.fromEntries(Object.entries(values).filter(([,value])=>value!==undefined&&value!==null&&value!==''));
export const discoveryApi={
  search:(params:DiscoverySearchParams)=>apiGet<DiscoveryPage>('/discovery/search',{params:clean(params)}),
  trending:(params:Omit<DiscoverySearchParams,'q'|'cultureType'|'languageCode'>={})=>apiGet<DiscoveryPage>('/discovery/trending',{params:clean(params)}),
};
