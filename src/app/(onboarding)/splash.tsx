import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useEventListener } from 'expo';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Logo } from '@/components/ui/Logo';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const hasNavigated = useRef(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [canSkip, setCanSkip] = useState(false);

  const goToStep1 = () => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    router.replace('/(onboarding)/step1');
  };

  const player = useVideoPlayer(
    require('../../../assets/intro-video.mp4'),
    (player) => {
      player.loop = false;
      player.play();
    }
  );

  useEventListener(player, 'statusChange', ({ status }) => {
    if (status === 'readyToPlay') {
      setVideoLoaded(true);
    } else if (status === 'error') {
      handleVideoError();
    }
  });

  useEventListener(player, 'playToEnd', () => {
    goToStep1();
  });

  useEffect(() => {
    // Permettre de skip aprÃ¨s 2 secondes
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, 2000);

    return () => clearTimeout(skipTimer);
  }, []);

  const handleSkip = () => {
    goToStep1();
  };

  const handleVideoError = () => {
    setVideoError(true);
    // Fallback vers animation statique aprÃ¨s 2 secondes
    setTimeout(() => {
      goToStep1();
    }, 2000);
  };

  if (videoError) {
    // Fallback vers logo statique
    return (
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Logo size="xlarge" />
          <Text style={styles.title}>Yeyamo</Text>
          <Text style={styles.subtitle}>
            Yeyamo, je dÃ©couvre{'\n'}mon pays
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* VidÃ©o d'intro */}
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
      />

      <View style={styles.centerBrand}>
        <Logo size="large" />
      </View>

      {/* Overlay avec bouton skip */}
      {canSkip && (
        <View style={styles.overlay}>
          <TouchableOpacity 
            onPress={handleSkip}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Passer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading indicator si vidÃ©o pas encore chargÃ©e */}
      {!videoLoaded && !videoError && (
        <View style={styles.loadingContainer}>
          <Logo size="large" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  video: {
    width: width,
    height: height,
    backgroundColor: '#0A0A0A',
  },
  centerBrand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 50,
    paddingRight: 20,
  },
  skipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
    marginTop: 24,
    letterSpacing: 2,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
});

