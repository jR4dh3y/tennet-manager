import { ThemeProvider } from '@react-navigation/native';
import * as SystemUI from 'expo-system-ui';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { enGB, registerTranslation } from 'react-native-paper-dates';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DataProvider, useData } from '../src/DataContext';
import { LOCALE } from '../src/lib/format';
import { darkTheme, lightTheme, navigationTheme } from '../src/theme';

registerTranslation(LOCALE, enGB);
SplashScreen.preventAutoHideAsync();

const modal = { presentation: 'modal' } as const;

function AppShell() {
  const { data, ready } = useData();
  const systemScheme = useColorScheme();
  const mode = data.settings.themeMode;
  const isDark = mode === 'dark' || (mode === 'system' && systemScheme === 'dark');
  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    // Keeps the root view (visible behind modals and during transitions) in sync with the theme.
    SystemUI.setBackgroundColorAsync(theme.colors.background);
  }, [theme]);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <PaperProvider theme={theme}>
      <ThemeProvider value={navigationTheme(theme)}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="tenant/[id]/index" />
          <Stack.Screen name="tenant/new" options={modal} />
          <Stack.Screen name="tenant/[id]/edit" options={modal} />
          <Stack.Screen name="reading/new" options={modal} />
          <Stack.Screen name="reading/[id]" options={modal} />
        </Stack>
      </ThemeProvider>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <DataProvider>
        <AppShell />
      </DataProvider>
    </SafeAreaProvider>
  );
}
