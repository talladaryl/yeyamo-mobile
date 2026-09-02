import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Asset } from 'expo-asset';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const logoAnimationAsset = require('../../../assets/yeyamo_logo_animation.html');

export default function SplashScreen() {
  const router = useRouter();
  const hasNavigated = useRef(false);
  const [animationHtml, setAnimationHtml] = useState<string>();

  const continueToOnboarding = () => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    router.replace('/(onboarding)/step1');
  };

  useEffect(() => {
    let isMounted = true;

    const loadAnimation = async () => {
      const asset = await Asset.fromModule(logoAnimationAsset).downloadAsync();
      const response = await fetch(asset.localUri ?? asset.uri);
      const html = await response.text();

      if (isMounted) setAnimationHtml(html);
    };

    loadAnimation().catch((error) => {
      console.error('Unable to load the Yeyamo logo animation.', error);
    });

    const timer = setTimeout(continueToOnboarding, 30_000);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1 bg-white">
        <TouchableOpacity
          className="flex-1"
          onPress={continueToOnboarding}
          activeOpacity={1}
          accessibilityLabel="Commencer l'onboarding"
        >
          {animationHtml ? (
            <WebView
              pointerEvents="none"
              originWhitelist={['*']}
              source={{ html: animationHtml }}
              javaScriptEnabled
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              style={styles.animation}
            />
          ) : (
            <View className="flex-1 bg-white" />
          )}

          <View className="absolute bottom-6 left-0 right-0 items-center">
            <Text className="text-xs text-[#71717A]">Touchez pour continuer</Text>
          </View>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  animation: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
