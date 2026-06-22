import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Button } from '@/components/ui/Button';
import { postService } from '@/features/post/post.service';
import { useCreatePost, useUploadMedia } from '@/features/post/usePost';

type PostType = 'image' | 'video';

export default function CreateScreen() {
  const router = useRouter();
  const [selectedUri, setSelectedUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [mediaType, setMediaType] = useState<PostType>('image');

  const { mutate: uploadMedia, isPending: isUploading } = useUploadMedia();
  const { mutate: createPost, isPending: isPosting } = useCreatePost();

  const handlePick = async (type: PostType) => {
    setMediaType(type);
    const assets = await postService.pickMedia(type);
    if (assets?.[0]?.uri) {
      setSelectedUri(assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!selectedUri) {
      Alert.alert('No media selected', 'Please pick an image or video first.');
      return;
    }

    const ext = selectedUri.split('.').pop() ?? 'jpg';
    const mime = mediaType === 'video' ? `video/${ext}` : `image/${ext}`;
    const fileName = `upload_${Date.now()}.${ext}`;

    const uploaded = await postService.uploadAsset(selectedUri, mime, fileName);

    createPost(
      { type: mediaType, caption: caption.trim() || undefined, media_ids: [uploaded.id] },
      {
        onSuccess: () => {
          setSelectedUri(null);
          setCaption('');
          router.replace('/(tabs)');
        },
        onError: () => Alert.alert('Error', 'Failed to post. Please try again.'),
      },
    );
  };

  const isBusy = isUploading || isPosting;

  return (
    <SafeScreen>
      <View className="flex-1 px-6 pt-6">
        <Text className="text-white text-2xl font-bold mb-6">Create Post</Text>

        {/* Media type selector */}
        <View className="flex-row gap-3 mb-6">
          {(['image', 'video'] as PostType[]).map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => handlePick(type)}
              className={`flex-1 py-4 rounded-2xl items-center border ${
                mediaType === type && selectedUri
                  ? 'border-[#7C3AED] bg-[#7C3AED]/10'
                  : 'border-[#27272A] bg-[#161616]'
              }`}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 28 }}>{type === 'image' ? '🖼️' : '🎬'}</Text>
              <Text className="text-[#A1A1AA] text-sm mt-1 capitalize">{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Preview */}
        {selectedUri && mediaType === 'image' ? (
          <Image
            source={{ uri: selectedUri }}
            style={{ width: '100%', height: 240, borderRadius: 16 }}
            contentFit="cover"
            className="mb-4"
          />
        ) : selectedUri && mediaType === 'video' ? (
          <View className="w-full h-60 bg-[#161616] rounded-2xl items-center justify-center mb-4">
            <Text style={{ fontSize: 48 }}>🎬</Text>
            <Text className="text-[#A1A1AA] text-sm mt-2">Video selected</Text>
          </View>
        ) : null}

        {/* Caption */}
        <TextInput
          className="bg-[#1F1F1F] text-white rounded-xl px-4 py-3 text-base border border-[#27272A] mb-6"
          placeholder="Write a caption..."
          placeholderTextColor="#52525B"
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={500}
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />

        {isBusy ? (
          <ActivityIndicator color="#7C3AED" />
        ) : (
          <Button
            label={selectedUri ? 'Share Post' : 'Pick Media First'}
            onPress={handlePost}
            disabled={!selectedUri}
          />
        )}
      </View>
    </SafeScreen>
  );
}
