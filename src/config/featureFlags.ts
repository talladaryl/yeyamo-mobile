export interface FeatureFlags {
  campaigns_enabled: boolean;
  ticketing_enabled: boolean;
  event_staff_enabled: boolean;
  promotions_enabled: boolean;
  partner_finance_enabled: boolean;
  ads_delivery_enabled: boolean;
}
const flag = (value: string | undefined, fallback = true) => value == null ? fallback : value.toLowerCase() === 'true';
export const FEATURE_FLAGS: FeatureFlags = {
  campaigns_enabled: flag(process.env.EXPO_PUBLIC_CAMPAIGNS_ENABLED),
  ticketing_enabled: flag(process.env.EXPO_PUBLIC_TICKETING_ENABLED),
  event_staff_enabled: flag(process.env.EXPO_PUBLIC_EVENT_STAFF_ENABLED),
  promotions_enabled: flag(process.env.EXPO_PUBLIC_PROMOTIONS_ENABLED),
  partner_finance_enabled: flag(process.env.EXPO_PUBLIC_PARTNER_FINANCE_ENABLED),
  ads_delivery_enabled: flag(process.env.EXPO_PUBLIC_ADS_DELIVERY_ENABLED),
};
export function useFeatureFlags() { return FEATURE_FLAGS; }
