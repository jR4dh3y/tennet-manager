import { DarkTheme as NavDark, DefaultTheme as NavLight, Theme as NavTheme } from '@react-navigation/native';
import { MD3DarkTheme, MD3LightTheme, MD3Theme } from 'react-native-paper';

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#3A4FB0',
    onPrimary: '#FFFFFF',
    primaryContainer: '#DDE1FF',
    onPrimaryContainer: '#0E1A5C',
    secondary: '#5A5D72',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#DFE1F9',
    onSecondaryContainer: '#171B2C',
    tertiary: '#835400',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#FFDDB3',
    onTertiaryContainer: '#2A1800',
    background: '#F8F8FD',
    onBackground: '#1A1B23',
    surface: '#F8F8FD',
    onSurface: '#1A1B23',
    surfaceVariant: '#E2E2EF',
    onSurfaceVariant: '#45464F',
    outline: '#767680',
    outlineVariant: '#C6C6D0',
    inverseSurface: '#2F3038',
    inverseOnSurface: '#F1F0F7',
    inversePrimary: '#B8C3FF',
    elevation: {
      level0: 'transparent',
      level1: '#F0F1FA',
      level2: '#EAECF8',
      level3: '#E4E7F6',
      level4: '#E2E5F5',
      level5: '#DEE2F3',
    },
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#B8C3FF',
    onPrimary: '#1F2F86',
    primaryContainer: '#34479E',
    onPrimaryContainer: '#DDE1FF',
    secondary: '#C3C5DD',
    onSecondary: '#2C2F42',
    secondaryContainer: '#36394F',
    onSecondaryContainer: '#DFE1F9',
    tertiary: '#FFB951',
    onTertiary: '#462A00',
    tertiaryContainer: '#643F00',
    onTertiaryContainer: '#FFDDB3',
    background: '#10131F',
    onBackground: '#E3E1EC',
    surface: '#10131F',
    onSurface: '#E3E1EC',
    surfaceVariant: '#2C2F3E',
    onSurfaceVariant: '#C6C5D4',
    outline: '#8F8F9E',
    outlineVariant: '#45475A',
    inverseSurface: '#E3E1EC',
    inverseOnSurface: '#2F3038',
    inversePrimary: '#3A4FB0',
    elevation: {
      level0: 'transparent',
      level1: '#171B2B',
      level2: '#1B2033',
      level3: '#20263C',
      level4: '#222840',
      level5: '#252C46',
    },
  },
};

export function navigationTheme(theme: MD3Theme): NavTheme {
  const base = theme.dark ? NavDark : NavLight;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.elevation.level2,
      text: theme.colors.onSurface,
      border: theme.colors.outlineVariant,
      notification: theme.colors.error,
    },
  };
}
