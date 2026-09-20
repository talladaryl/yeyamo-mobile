import { useEffect, useState } from 'react';
import { Asset } from 'expo-asset';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

const logoAnimationAsset = require('../../../assets/yeyamo_logo_animation.html');

let staticLogoHtmlPromise: Promise<string> | undefined;

function loadStaticLogoHtml() {
  staticLogoHtmlPromise ??= Asset.fromModule(logoAnimationAsset)
    .downloadAsync()
    .then(async (asset) => {
      const response = await fetch(asset.localUri ?? asset.uri);
      const animationHtml = await response.text();
      const iconSource = animationHtml.match(/<img id="part-icon" src="([^"]+)"/i)?.[1];

      if (!iconSource) throw new Error('Yeyamo splash logo image was not found.');

      return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <style>
      html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: transparent; }
      body { display: flex; align-items: center; justify-content: center; }
      img { display: block; width: 100%; height: 100%; object-fit: contain; }
    </style>
  </head>
  <body><img src="${iconSource}" alt="Yeyamo"></body>
</html>`;
    });

  return staticLogoHtmlPromise;
}

interface StaticYeyamoSplashLogoProps {
  width?: number;
  height?: number;
}

/** Renders the exact splash pictogram only, without the splash animation. */
export function StaticYeyamoSplashLogo({ width = 116, height = 86 }: StaticYeyamoSplashLogoProps) {
  const [html, setHtml] = useState<string>();

  useEffect(() => {
    let active = true;

    void loadStaticLogoHtml()
      .then((value) => {
        if (active) setHtml(value);
      })
      .catch((error) => {
        console.error('Unable to load the static Yeyamo splash logo.', error);
      });

    return () => { active = false; };
  }, []);

  return (
    <View
      accessible
      accessibilityLabel="Yeyamo"
      accessibilityRole="image"
      style={{ width, height }}
    >
      {html ? (
        <WebView
          pointerEvents="none"
          originWhitelist={['*']}
          source={{ html }}
          javaScriptEnabled={false}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1, backgroundColor: 'transparent' }}
        />
      ) : null}
    </View>
  );
}
