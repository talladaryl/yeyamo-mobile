import { useMutation } from '@tanstack/react-query';
import { adsApi, type ClickTrackingPayload, type ConversionTrackingPayload, type ImpressionTrackingPayload } from './ads.api';
import { FEATURE_FLAGS } from '@/config/featureFlags';

const impressedDeliveries = new Set<string>();
const clickedDeliveries = new Set<string>();
export const adKeys = { all: ['ads'] as const, tracking: () => ['ads', 'tracking'] as const };

export function useTrackAdImpression() {
  return useMutation({ mutationKey: [...adKeys.tracking(), 'impression'], retry: false, mutationFn: async (payload: ImpressionTrackingPayload) => { if (!FEATURE_FLAGS.ads_delivery_enabled || impressedDeliveries.has(payload.deliveryId)) return; impressedDeliveries.add(payload.deliveryId); try { await adsApi.trackImpression(payload); } catch (error) { impressedDeliveries.delete(payload.deliveryId); throw error; } } });
}
export function useTrackAdClick() {
  return useMutation({ mutationKey: [...adKeys.tracking(), 'click'], retry: false, mutationFn: async (payload: ClickTrackingPayload) => { if (!FEATURE_FLAGS.ads_delivery_enabled || clickedDeliveries.has(payload.deliveryId)) return; clickedDeliveries.add(payload.deliveryId); try { await adsApi.trackClick(payload); } catch (error) { clickedDeliveries.delete(payload.deliveryId); throw error; } } });
}
export function useTrackAdConversion() {
  return useMutation({ mutationKey: [...adKeys.tracking(), 'conversion'], retry: false, mutationFn: (payload: ConversionTrackingPayload) => FEATURE_FLAGS.ads_delivery_enabled ? adsApi.trackConversion(payload) : Promise.resolve() });
}
