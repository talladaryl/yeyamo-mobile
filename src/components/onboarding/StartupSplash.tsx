import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Asset } from 'expo-asset';
import { WebView } from 'react-native-webview';

const animation = require('../../../assets/yeyamo_logo_animation.html');

export function StartupSplash() {
  const [html, setHtml] = useState<string>();
  useEffect(() => {
    let active = true;
    void Asset.fromModule(animation).downloadAsync().then((asset) => fetch(asset.localUri ?? asset.uri)).then((response) => response.text()).then((value) => { if (active) setHtml(value); }).catch(() => undefined);
    return () => { active = false; };
  }, []);
  return <View style={styles.container}>{html ? <WebView pointerEvents="none" originWhitelist={['*']} source={{ html }} javaScriptEnabled scrollEnabled={false} style={styles.web} /> : null}</View>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#FFFFFF' }, web: { flex: 1, backgroundColor: '#FFFFFF' } });
