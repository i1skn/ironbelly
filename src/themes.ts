import { Appearance } from 'react-native'
import Config from 'react-native-config'
import {
  yellow,
  blue,
  blueGrey,
  grey,
  green,
  deepOrange,
  white,
  black,
  red,
} from 'src/common/colors'
import {
  useTheme as useThemedStyles,
  registerThemes,
} from 'react-native-themed-styles'

export interface Theme {
  black: string
  white: string
  primaryUltraLight: string
  primaryLight: string
  primary: string
  primaryDark: string
  primaryUltraDark: string

  onPrimary: string

  secondaryUltraLight: string
  secondaryLight: string
  secondary: string
  secondaryDark: string
  secondaryUltraDark: string

  background: string
  onBackground: string

  surface: string
  onSurface: string

  warning: string
  warningLight: string
  success: string
  link: string
  placeholder: string

  heroGradientStart: string
  heroGradientEnd: string
  onHero: string
}

export type ThemeName = 'light' | 'dark'

const base = {
  black,
  white,
}

const dark: Theme = {
  ...base,
  primaryUltraLight: yellow[200],
  primaryLight: yellow[300],
  primary: yellow[500],
  primaryDark: yellow[800],
  primaryUltraDark: yellow[900],

  onPrimary: blueGrey[900],

  secondaryUltraLight: yellow[200],
  secondaryLight: yellow[300],
  secondary: yellow[500],
  secondaryDark: yellow[800],
  secondaryUltraDark: yellow[900],

  background: black,
  onBackground: blueGrey[100],

  surface: '#111111',
  onSurface: blueGrey[100],

  warning: red[500],
  warningLight: red[300],
  success: green.A700,
  link: yellow[600],
  placeholder: blueGrey[600],

  heroGradientStart: slightlyTransparent(grey[900]),
  heroGradientEnd: black,
  onHero: yellow[500],
}

const light: Theme = {
  ...base,
  primaryUltraLight: yellow[200],
  primaryLight: yellow[300],
  primary: yellow[500],
  primaryDark: yellow[800],
  primaryUltraDark: yellow[900],

  onPrimary: blueGrey[900],

  secondaryUltraLight: blue[200],
  secondaryLight: blue[300],
  secondary: blue[500],
  secondaryDark: blue[800],
  secondaryUltraDark: blue[900],

  background: grey[100],
  onBackground: blueGrey[900],

  surface: white,
  onSurface: blueGrey[900],

  warning: deepOrange[500],
  warningLight: deepOrange[300],
  success: green.A700,
  link: blue[500],
  placeholder: blueGrey[300],

  heroGradientStart: yellow[400],
  heroGradientEnd: yellow[600],
  onHero: grey[900],
}

function slightlyTransparent(color: string) {
  return `${color}aa`
}

function getCurrentThemeName(): ThemeName {
  return Config.DEMO_MODE ? 'dark' : Appearance.getColorScheme() ?? 'dark'
}

const styleSheetFactory = registerThemes({ light, dark }, () =>
  getCurrentThemeName(),
)

export { styleSheetFactory, light, dark, slightlyTransparent, useThemedStyles }

declare module 'styled-components' {
  export interface DefaultTheme {
    placeholder: string
  }
}
