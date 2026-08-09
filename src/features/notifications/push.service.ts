import { v4 as uuidv4 } from 'uuid';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { router, type Href } from 'expo-router';
import { secureStore } from '@/services/storage/secure-store';
import { notificationsApi } from './notifications.api';

type NotificationsModule = typeof import('expo-notifications');

let notificationHandlerConfigured = false;

function supportsNativeNotifications(): boolean {
  return Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
}

async function loadNotifications(): Promise<NotificationsModule | null> {
  if (!supportsNativeNotifications()) return null;
  const notifications = await import('expo-notifications');
  if (!notificationHandlerConfigured) {
    notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    notificationHandlerConfigured = true;
  }
  return notifications;
}

async function configureAndroidChannels(notifications: NotificationsModule) {
  if (Platform.OS !== 'android') return;
  const channels: Array<[string, string, number]> = [
    ['default', 'YeYamo', notifications.AndroidImportance.DEFAULT],
    ['messages', 'Messages', notifications.AndroidImportance.HIGH],
    ['social', 'Activité sociale', notifications.AndroidImportance.DEFAULT],
    ['bookings', 'Réservations', notifications.AndroidImportance.HIGH],
    ['tickets', 'Billets', notifications.AndroidImportance.HIGH],
    ['events', 'Événements', notifications.AndroidImportance.DEFAULT],
    ['promotions', 'Promotions', notifications.AndroidImportance.DEFAULT],
    ['security', 'Sécurité', notifications.AndroidImportance.MAX],
  ];
  await Promise.all(channels.map(([id, name, importance]) =>
    notifications.setNotificationChannelAsync(id, {
      name,
      importance,
      sound: importance >= notifications.AndroidImportance.HIGH ? 'default' : undefined,
      vibrationPattern: importance >= notifications.AndroidImportance.HIGH ? [0, 250, 150, 250] : undefined,
    })));
}

export async function getStableDeviceId(): Promise<string> {
  const existing = await secureStore.get(secureStore.KEYS.DEVICE_ID);
  if (existing) return existing;
  const deviceId = uuidv4();
  await secureStore.set(secureStore.KEYS.DEVICE_ID, deviceId);
  return deviceId;
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) return null;
  const notifications = await loadNotifications();
  if (!notifications) return null;
  await configureAndroidChannels(notifications);
  const existing = await notifications.getPermissionsAsync();
  const permission = existing.status === 'granted'
    ? existing
    : await notifications.requestPermissionsAsync();
  if (permission.status !== 'granted') return null;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) throw new Error('Expo projectId introuvable');
  return (await notifications.getExpoPushTokenAsync({ projectId })).data;
}

export async function synchronizePushToken(): Promise<void> {
  try {
    const token = await registerForPushNotificationsAsync();
    if (!token) return;
    const deviceId = await getStableDeviceId();
    await notificationsApi.registerPushToken({
      token,
      platform: Platform.OS === 'android' ? 'ANDROID' : 'IOS',
      deviceId,
      appVersion: Constants.expoConfig?.version ?? 'unknown',
    });
    await secureStore.set(secureStore.KEYS.EXPO_PUSH_TOKEN, token);
  } catch {
    // Push is best-effort and must never block authentication.
  }
}

export async function unregisterCurrentPushToken(): Promise<void> {
  const deviceId = await secureStore.get(secureStore.KEYS.DEVICE_ID);
  if (deviceId) await notificationsApi.unregisterPushToken(deviceId);
  await secureStore.remove(secureStore.KEYS.EXPO_PUSH_TOKEN);
}

export async function subscribeToNotificationEvents(
  onReceived: () => void,
): Promise<() => void> {
  const notifications = await loadNotifications();
  if (!notifications) return () => undefined;
  const received = notifications.addNotificationReceivedListener(onReceived);
  const response = notifications.addNotificationResponseReceivedListener((event) => {
    handleNotificationNavigation(event.notification.request.content.data);
  });
  const lastResponse = notifications.getLastNotificationResponse();
  if (lastResponse?.notification) {
    handleNotificationNavigation(lastResponse.notification.request.content.data);
  }
  return () => {
    received.remove();
    response.remove();
  };
}

export async function subscribeToPushTokenChanges(): Promise<() => void> {
  const notifications = await loadNotifications();
  if (!notifications) return () => undefined;
  const subscription = notifications.addPushTokenListener(() => void synchronizePushToken());
  return () => subscription.remove();
}

export function handleNotificationNavigation(data: Record<string, unknown> | undefined) {
  if (!data) return;
  const type = typeof data.type === 'string' ? data.type : '';
  const id = typeof data.targetId === 'string' ? data.targetId : undefined;
  const routes: Record<string, Href | undefined> = {
    MESSAGE_RECEIVED: id ? (`/(chat)/${id}` as Href) : undefined,
    EVENT_REMINDER: id ? (`/(events)/${id}` as Href) : undefined,
    TICKET_PURCHASED: id ? (`/(profile)/ticket/${id}` as Href) : undefined,
    BOOKING_CONFIRMED: '/(profile)/reservations',
    BOOKING_CANCELLED: '/(profile)/reservations',
    CAMPAIGN_APPROVED: id ? (`/(partner-dashboard)/campaign/${id}` as Href) : undefined,
    CAMPAIGN_REJECTED: id ? (`/(partner-dashboard)/campaign/${id}` as Href) : undefined,
    FOLLOW_RECEIVED: id ? (`/(profile)/${id}` as Href) : undefined,
  };
  const route = routes[type];
  if (route) router.push(route);
}
