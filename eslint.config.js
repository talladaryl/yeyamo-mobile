const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  globalIgnores(['.expo/*', 'dist/*', 'node_modules/*', '_test*']),
  expoConfig,
  {
    rules: {
      'react/no-unescaped-entities': 'off',
    },
  },
]);
