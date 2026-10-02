import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Asset } from 'expo-asset';
import { GLView, type ExpoWebGLRenderingContext } from 'expo-gl';
import type { PickedMediaAsset } from '@/features/media/media.utils';
import { traceMediaRuntime } from '@/features/media/media.runtime-trace';
import { useThemeStore } from '@/features/theme/theme.store';

export type YeyamoImageFilter = 'original' | 'black-white' | 'warm' | 'cool' | 'high-contrast';

const FILTERS: { id: YeyamoImageFilter; label: string; value: number }[] = [
  { id: 'original', label: 'Original', value: 0 },
  { id: 'black-white', label: 'Noir & blanc', value: 1 },
  { id: 'warm', label: 'Chaud', value: 2 },
  { id: 'cool', label: 'Froid', value: 3 },
  { id: 'high-contrast', label: 'Contraste', value: 4 },
];

const VERTEX_SHADER = `
attribute vec2 position;
attribute vec2 texCoord;
varying vec2 uv;
void main() { gl_Position = vec4(position, 0.0, 1.0); uv = texCoord; }
`;

const FRAGMENT_SHADER = `
precision mediump float;
uniform sampler2D image;
uniform int filterMode;
varying vec2 uv;
void main() {
  vec4 pixel = texture2D(image, uv);
  vec3 color = pixel.rgb;
  if (filterMode == 1) { float gray = dot(color, vec3(0.299, 0.587, 0.114)); color = vec3(gray); }
  else if (filterMode == 2) { color = clamp(color * vec3(1.14, 1.03, 0.86), 0.0, 1.0); }
  else if (filterMode == 3) { color = clamp(color * vec3(0.88, 1.02, 1.15), 0.0, 1.0); }
  else if (filterMode == 4) { color = clamp((color - 0.5) * 1.38 + 0.5, 0.0, 1.0); }
  gl_FragColor = vec4(color, pixel.a);
}
`;

function shader(gl: ExpoWebGLRenderingContext, type: number, source: string) {
  const value = gl.createShader(type);
  if (!value) throw new Error('Impossible de créer le filtre graphique.');
  gl.shaderSource(value, source);
  gl.compileShader(value);
  if (!gl.getShaderParameter(value, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(value) ?? 'Filtre invalide.');
  return value;
}

export function YeyamoImageFilterEditor({ asset, onConfirm, onCancel }: {
  asset: PickedMediaAsset;
  onConfirm: (asset: PickedMediaAsset) => void;
  onCancel: () => void;
}) {
  const colors = useThemeStore((state) => state.colors);
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState<YeyamoImageFilter>('original');
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const glRef = useRef<ExpoWebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);

  const render = useCallback((selected: YeyamoImageFilter) => {
    const gl = glRef.current;
    const program = programRef.current;
    if (!gl || !program) return;
    gl.useProgram(program);
    gl.uniform1i(gl.getUniformLocation(program, 'filterMode'), FILTERS.find((item) => item.id === selected)?.value ?? 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.endFrameEXP();
  }, []);

  useEffect(() => render(filter), [filter, render]);

  const initialize = async (gl: ExpoWebGLRenderingContext) => {
    try {
      const program = gl.createProgram();
      if (!program) throw new Error('Impossible de préparer l’éditeur.');
      gl.attachShader(program, shader(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
      gl.attachShader(program, shader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'Éditeur indisponible.');
      gl.useProgram(program);

      const positions = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positions);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

      const coordinates = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, coordinates);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]), gl.STATIC_DRAW);
      const texCoord = gl.getAttribLocation(program, 'texCoord');
      gl.enableVertexAttribArray(texCoord);
      gl.vertexAttribPointer(texCoord, 2, gl.FLOAT, false, 0, 0);

      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const image = Asset.fromURI(asset.uri);
      await image.downloadAsync();
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image as unknown as TexImageSource);
      gl.uniform1i(gl.getUniformLocation(program, 'image'), 0);
      glRef.current = gl;
      programRef.current = program;
      setReady(true);
      render(filter);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'L’éditeur ne peut pas charger cette image.');
    }
  };

  const confirm = async () => {
    const gl = glRef.current;
    if (!gl || !ready || saving) return;
    if (filter === 'original') { onConfirm(asset); return; }
    setSaving(true);
    try {
      render(filter);
      const snapshot = await GLView.takeSnapshotAsync(gl, { format: 'jpeg', compress: 0.92, flip: false });
      if (typeof snapshot.uri !== 'string') throw new Error('Le filtre n’a pas pu être exporté.');
      traceMediaRuntime('MEDIA_FILTER_EXPORTED', { flow: 'image-editor', filter, sourceMimeType: asset.mimeType ?? 'unknown', targetMimeType: 'image/jpeg' });
      onConfirm({ ...asset, uri: snapshot.uri, mimeType: 'image/jpeg', fileName: `yeyamo-${filter}.jpg`, width: snapshot.width, height: snapshot.height, fileSize: null });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Le filtre n’a pas pu être enregistré.');
    } finally {
      setSaving(false);
    }
  };

  const previewWidth = Math.min(width - 32, 520);
  const ratio = asset.width > 0 && asset.height > 0 ? asset.height / asset.width : 1;
  const previewHeight = Math.min(460, Math.max(240, previewWidth * ratio));
  return <Modal visible transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent><View className="flex-1 items-center justify-center px-4" style={{ backgroundColor: colors.overlay }}>
    <View className="w-full overflow-hidden rounded-3xl border p-4" style={{ maxWidth: 560, backgroundColor: colors.background, borderColor: colors.border }}>
      <Text className="text-xl font-extrabold" style={{ color: colors.text }}>Ajuster la photo</Text>
      <Text className="mb-3 mt-1 text-sm" style={{ color: colors.textSecondary }}>Le filtre choisi sera réellement appliqué au fichier envoyé.</Text>
      <View className="items-center overflow-hidden rounded-2xl" style={{ backgroundColor: colors.elevated }}>
        <GLView style={{ width: previewWidth, height: previewHeight }} onContextCreate={(gl) => void initialize(gl)} />
        {!ready && !error ? <ActivityIndicator className="absolute inset-0" color={colors.primary} /> : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 14 }}>
        {FILTERS.map((item) => <TouchableOpacity key={item.id} onPress={() => setFilter(item.id)} className="rounded-full border px-4 py-2" style={{ borderColor: filter === item.id ? colors.primary : colors.border, backgroundColor: filter === item.id ? colors.accentSoft : colors.surface }} accessibilityState={{ selected: filter === item.id }}><Text className="text-sm font-semibold" style={{ color: colors.text }}>{item.label}</Text></TouchableOpacity>)}
      </ScrollView>
      {error ? <Text className="mb-3 text-sm" style={{ color: colors.primary }}>{error}</Text> : null}
      <View className="flex-row gap-3"><TouchableOpacity onPress={onCancel} className="flex-1 items-center rounded-xl border py-3" style={{ borderColor: colors.border }}><Text className="font-bold" style={{ color: colors.text }}>Annuler</Text></TouchableOpacity><TouchableOpacity onPress={() => void confirm()} disabled={!ready || saving} className="flex-1 items-center rounded-xl py-3" style={{ backgroundColor: colors.primary, opacity: !ready || saving ? 0.5 : 1 }}><Text className="font-bold text-white">{saving ? 'Export…' : 'Confirmer'}</Text></TouchableOpacity></View>
    </View>
  </View></Modal>;
}
