import React, { useMemo } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';

import { DataProvider, useData } from '../src/DataContext';

function AppProviders() {
  const {
    data: { settings },
  } = useData();
  const systemColorScheme = useColorScheme();
  const preferredMode = settings.themeMode ?? (systemColorScheme === 'dark' ? 'dark' : 'light');
  const isDark = preferredMode === 'dark';

  const theme = useMemo(() => (isDark ? MD3DarkTheme : MD3LightTheme), [isDark]);

  return (
    <PaperProvider theme={theme}>
      <StatusBar style={isDark ? 'light' : 'dark'} animated />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(modals)" options={{ presentation: 'modal' }} />
        <Stack.Screen name="reading" />
        <Stack.Screen name="tenant" />
      </Stack>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <DataProvider>
          <AppProviders />
        </DataProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
