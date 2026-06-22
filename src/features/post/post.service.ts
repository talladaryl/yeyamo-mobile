import * as ImagePicker from 'expo-image-picker';
import { postApi } from './post.api';
import type { CreatePostPayload } from './types';

export const postService = {
  async pickMedia(type: 'image' | 'video') {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:
        type === 'video'
          ? ImagePicker.MediaTypeOptions.Videos
          : ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: type === 'image',
      quality: 0.85,
      videoMaxDuration: 60,
    });

    if (result.canceled) return null;
    return result.assets;
  },

  async uploadAsset(uri: string, mimeType: string, fileName: string) {
    const formData = new FormData();
    // React Native FormData accepts { uri, type, name }
    formData.append('file', { uri, type: mimeType, name: fileName } as unknown as Blob);
    const { data } = await postApi.uploadMedia(formData);
    return data;
  },

  async createPost(payload: CreatePostPayload) {
    const { data } = await postApi.createPost(payload);
    return data;
  },
};
