import { View, Text, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { mockFeedPosts } from '@/features/feed/mockData';
import { useState } from 'react';

const { width } = Dimensions.get('window');

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(24);
  const [comment, setComment] = useState('');
  
  const post = mockFeedPosts.find(p => p.id === Number(id)) || mockFeedPosts[0];

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      <Stack.Screen
        options={{
          presentation: 'modal',
          headerShown: true,
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
          headerTitle: 'Publication',
          headerTitleStyle: { fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="ml-2">
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity className="mr-2">
              <Ionicons name="ellipsis-horizontal" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Author Header */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center gap-3">
            <Image
              source={{ uri: post.author.avatar_url || '' }}
              style={{ width: 40, height: 40 }}
              className="rounded-full"
            />
            <View>
              <View className="flex-row items-center gap-1">
                <Text className="text-white font-semibold text-base">{post.author.display_name}</Text>
                {post.author.is_verified && (
                  <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
                )}
              </View>
              <Text className="text-[#A1A1AA] text-xs">{post.created_at}</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={20} color="#A1A1AA" />
          </TouchableOpacity>
        </View>

        {/* Post Image */}
        <Image
          source={{ uri: post.media[0]?.url || '' }}
          style={{ width, height: width * 1.25 }}
          contentFit="cover"
        />

        {/* Action Buttons */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={handleLike} className="flex-row items-center gap-1">
              <Ionicons 
                name={isLiked ? 'heart' : 'heart-outline'} 
                size={26} 
                color={isLiked ? '#EF4444' : '#FFFFFF'} 
              />
              <Text className="text-white font-semibold">{likesCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center gap-1">
              <Ionicons name="chatbubble-outline" size={24} color="#FFFFFF" />
              <Text className="text-white font-semibold">{post.comments_count}</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="paper-plane-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => setIsSaved(!isSaved)}>
            <Ionicons 
              name={isSaved ? 'bookmark' : 'bookmark-outline'} 
              size={24} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>

        {/* Caption */}
        <View className="px-4 pb-3">
          <Text className="text-white text-sm leading-5">
            <Text className="font-semibold">{post.author.display_name} </Text>
            {post.caption}
          </Text>
          {post.place_tag && (
            <TouchableOpacity 
              onPress={() => router.push(`/(places)/${post.place_tag?.id}`)}
              className="flex-row items-center gap-1 mt-2"
            >
              <Ionicons name="location-outline" size={14} color="#A1A1AA" />
              <Text className="text-[#A1A1AA] text-xs">{post.place_tag.name}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Comments Section */}
        <View className="px-4 pb-4">
          <Text className="text-white font-semibold text-base mb-4">
            Commentaires ({post.comments_count})
          </Text>

          {post.comments?.map((commentItem) => (
            <View key={commentItem.id} className="flex-row items-start gap-3 mb-4">
              <Image
                source={{ uri: commentItem.author.avatar_url || '' }}
                style={{ width: 32, height: 32 }}
                className="rounded-full"
              />
              <View className="flex-1">
                <View className="bg-[#161616] rounded-2xl px-3 py-2">
                  <View className="flex-row items-center gap-1 mb-1">
                    <Text className="text-white font-semibold text-sm">
                      {commentItem.author.display_name}
                    </Text>
                    {commentItem.author.is_verified && (
                      <Ionicons name="checkmark-circle" size={12} color="#3B82F6" />
                    )}
                  </View>
                  <Text className="text-white text-sm leading-5">{commentItem.text}</Text>
                </View>
                <View className="flex-row items-center gap-4 mt-1 ml-3">
                  <Text className="text-[#A1A1AA] text-xs">{commentItem.created_at}</Text>
                  <TouchableOpacity>
                    <Text className="text-[#A1A1AA] text-xs font-semibold">Répondre</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-row items-center gap-1">
                    <Ionicons 
                      name={commentItem.is_liked ? 'heart' : 'heart-outline'} 
                      size={12} 
                      color={commentItem.is_liked ? '#EF4444' : '#A1A1AA'} 
                    />
                    {commentItem.likes_count > 0 && (
                      <Text className="text-[#A1A1AA] text-xs">{commentItem.likes_count}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View className="h-20" />
      </ScrollView>

      {/* Comment Input - Fixed at bottom */}
      <View className="absolute bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-[#27272A] px-4 py-3">
        <View className="flex-row items-center gap-3">
          <Image
            source={{ uri: post.author.avatar_url || '' }}
            style={{ width: 32, height: 32 }}
            className="rounded-full"
          />
          <View className="flex-1 bg-[#161616] rounded-full px-4 py-2.5 flex-row items-center">
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Ajouter un commentaire..."
              placeholderTextColor="#52525B"
              className="flex-1 text-white text-sm"
            />
            {comment.length > 0 && (
              <TouchableOpacity onPress={() => setComment('')}>
                <Ionicons name="send" size={20} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
