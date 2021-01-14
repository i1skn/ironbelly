import { Appearance } from 'react-native'
import {
  orange,
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

const primary = yellow
const secondary = blue

const base = {
  black,
}

const dark: Theme = {
  ...base,
  primaryUltraLight: primary[200],
  primaryLight: primary[300],
  primary: primary[500],
  primaryDark: primary[800],
  primaryUltraDark: primary[900],

  onPrimary: blueGrey[900],

  secondaryUltraLight: secondary[200],
  secondaryLight: secondary[300],
  secondary: secondary[500],
  secondaryDark: secondary[800],
  secondaryUltraDark: secondary[900],

  background: black,
  onBackground: blueGrey[100],

  surface: '#111111',
  onSurface: blueGrey[100],

  warning: red[500],
  warningLight: orange[300],
  success: green.A700,
  link: blue[500],
  placeholder: blueGrey[600],

  heroGradientStart: slightlyTransparent(grey[900]),
  heroGradientEnd: black,
  onHero: primary[500],
}

const light: Theme = {
  ...base,
  primaryUltraLight: primary[200],
  primaryLight: primary[300],
  primary: primary[500],
  primaryDark: primary[800],
  primaryUltraDark: primary[900],

  onPrimary: blueGrey[900],

  secondaryUltraLight: secondary[200],
  secondaryLight: secondary[300],
  secondary: secondary[500],
  secondaryDark: secondary[800],
  secondaryUltraDark: secondary[900],

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
  // return Appearance.getColorScheme() ?? 'light'
  return 'light'
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
