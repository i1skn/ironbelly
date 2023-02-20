// module.exports = {
// root: true,
// extends: '@react-native-community',
// parser: '@typescript-eslint/parser',
// plugins: ['@typescript-eslint'],
// rules: {
// semi: 0,
// },
// }

module.exports = {
  root: true,
  env: {
    browser: true,
    amd: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['react', 'react-native', '@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    semi: ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-extra-semi': ['off'],
    'react-native/no-unused-styles': 2,
  },
}
