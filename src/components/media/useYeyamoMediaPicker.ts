import * as ImagePicker from 'expo-image-picker';
import type { PickedMediaAsset } from '@/features/media/media.utils';

type MediaPickerOptions = Omit<NonNullable<Parameters<typeof ImagePicker.launchImageLibraryAsync>[0]>, 'mediaTypes'> & {
  mediaTypes?: NonNullable<Parameters<typeof ImagePicker.launchImageLibraryAsync>[0]>['mediaTypes'];
};

export type YeyamoMediaPickResult =
  | { cancelled: true }
  | { cancelled: false; assets: PickedMediaAsset[] };

export class YeyamoMediaPickerError extends Error {
  constructor(
    public readonly code: 'MEDIA_LIBRARY_PERMISSION_DENIED' | 'CAMERA_PERMISSION_DENIED' | 'MEDIA_PICKER_UNAVAILABLE',
    message: string,
  ) {
    super(message);
  }
}

/** Shared picker with distinct permission and picker-availability failures. */
export function useYeyamoMediaPicker() {
  const pickFromLibrary = async (options: MediaPickerOptions = {}): Promise<YeyamoMediaPickResult> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) throw new YeyamoMediaPickerError(
      'MEDIA_LIBRARY_PERMISSION_DENIED',
      permission.canAskAgain
        ? 'Autorisez l’accès à votre galerie pour sélectionner un média.'
        : 'L’accès à votre galerie est désactivé. Autorisez-le dans les réglages de votre appareil.',
    );
    try {
      const result = await ImagePicker.launchImageLibraryAsync(options);
      return result.canceled ? { cancelled: true } : { cancelled: false, assets: result.assets };
    } catch {
      throw new YeyamoMediaPickerError('MEDIA_PICKER_UNAVAILABLE', 'Le sélecteur de médias ne peut pas être ouvert pour le moment.');
    }
  };

  const takePhoto = async (options: NonNullable<Parameters<typeof ImagePicker.launchCameraAsync>[0]> = {}): Promise<YeyamoMediaPickResult> => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) throw new YeyamoMediaPickerError(
      'CAMERA_PERMISSION_DENIED',
      permission.canAskAgain
        ? 'Autorisez l’accès à l’appareil photo pour prendre une image.'
        : 'L’accès à l’appareil photo est désactivé. Autorisez-le dans les réglages de votre appareil.',
    );
    try {
      const result = await ImagePicker.launchCameraAsync(options);
      return result.canceled ? { cancelled: true } : { cancelled: false, assets: result.assets };
    } catch {
      throw new YeyamoMediaPickerError('MEDIA_PICKER_UNAVAILABLE', 'L’appareil photo ne peut pas être ouvert pour le moment.');
    }
  };

  return { pickFromLibrary, takePhoto };
}
