const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  globalIgnores(['.expo/*', 'dist/*', 'node_modules/*', '_test*']),
  expoConfig,
  {
    rules: {
      'react/no-unescaped-entities': 'off',
      // Expo/React Native Animated and imperative native hooks intentionally expose
      // stable mutable handles. These React Compiler checks currently report those
      // supported native patterns as errors; standard Hooks rules remain enabled.
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
    },
  },
]);
