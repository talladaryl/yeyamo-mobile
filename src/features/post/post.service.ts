import * as ImagePicker from 'expo-image-picker';
import { postApi } from './post.api';
import type { CreatePostPayload } from './types';
import { toMediaFormData } from '@/features/media/media.utils';

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
    const formData = await toMediaFormData({
      uri,
      mimeType,
      fileName,
      type: mimeType.startsWith('video/') ? 'video' : 'image',
      width: 0,
      height: 0,
    }, 'post-service');
    const { data } = await postApi.uploadMedia(formData);
    return data;
  },

  async createPost(payload: CreatePostPayload) {
    const { data } = await postApi.createPost(payload);
    return data;
  },
};
