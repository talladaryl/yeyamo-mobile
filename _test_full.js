const { getDefaultConfig } = require('./node_modules/expo/metro-config');
const { withNativeWind } = require('./node_modules/nativewind/metro');
const Transformer = require('./node_modules/metro/src/DeltaBundler/Transformer').default;
const Cache = require('./node_modules/metro-cache').Cache;

async function test() {
  const cfg = getDefaultConfig(__dirname);
  const final = withNativeWind(cfg, { input: './global.css' });

  // Simulate exactly what Bundler constructor does
  final.cacheStores = [];
  final.cacheVersion = '1.0';
  final.watchFolders = [__dirname];

  try {
    const t = new Transformer(final, {
      getOrComputeSha1: (f) => Promise.resolve({ sha1: 'abc', content: null })
    });
    console.log('Transformer init: OK');
  } catch (e) {
    console.error('Transformer init ERROR:', e.message);
    console.error(e.stack.split('\n').slice(0,5).join('\n'));
  }
}

test();
