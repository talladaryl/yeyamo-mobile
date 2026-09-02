import { apiPost } from '@/services/api/client';
import type { ClickRequest, ConversionRequest, ImpressionRequest } from './types';

export interface ImpressionTrackingPayload { deliveryId: string; impressionTrackingToken: string; viewedAt?: string; viewDurationMs?: number }
export interface ClickTrackingPayload { deliveryId: string; clickTrackingToken: string; clickedAt?: string }
export interface ConversionTrackingPayload { deliveryId: string; convertedAt?: string; conversionType: string; conversionValue?: number | null }

export const adsApi = {
  trackImpression: ({ impressionTrackingToken, viewedAt, viewDurationMs }: ImpressionTrackingPayload) =>
    apiPost<void>('/ads/impressions', { impressionToken: impressionTrackingToken, viewedAt: viewedAt ?? new Date().toISOString(), viewDurationMs: viewDurationMs ?? 1_000 } satisfies ImpressionRequest),
  trackClick: ({ clickTrackingToken, clickedAt }: ClickTrackingPayload) =>
    apiPost<void>('/ads/clicks', { clickToken: clickTrackingToken, clickedAt: clickedAt ?? new Date().toISOString() } satisfies ClickRequest),
  trackConversion: ({ deliveryId, convertedAt, conversionType, conversionValue }: ConversionTrackingPayload) =>
    apiPost<void>('/ads/conversions', { deliveryId, convertedAt: convertedAt ?? new Date().toISOString(), conversionType, conversionValue: conversionValue ?? null } satisfies ConversionRequest),
};
