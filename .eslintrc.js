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
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    semi: 0,
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-extra-semi': ['off'],
  },
}
