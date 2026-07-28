import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'YeYamo',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  if (!Device.isDevice) {
    throw new Error(
      'Les notifications push doivent être testées sur un appareil compatible.'
    );
  }

  const existingPermissions =
    await Notifications.getPermissionsAsync();

  let finalStatus = existingPermissions.status;

  if (finalStatus !== 'granted') {
    const requestedPermissions =
      await Notifications.requestPermissionsAsync();

    finalStatus = requestedPermissions.status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    throw new Error('Expo projectId introuvable');
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  return token.data;
}