import { router } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenProps = {
  title: string;
  /** Show a back button that pops the current route. */
  back?: boolean;
  actions?: React.ReactNode;
  /** Wrap children in a padded ScrollView. Set false to manage scrolling yourself (e.g. FlatList). */
  scroll?: boolean;
  /** Screens rendered inside the tab navigator: the tab bar already owns the bottom inset. */
  inTabs?: boolean;
  /** Presented as an iOS sheet, which does not sit under the status bar. */
  modal?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  /** Rendered outside the scroll area (FABs, snackbars, dialogs). */
  overlay?: React.ReactNode;
  children: React.ReactNode;
};

export const SCREEN_PADDING = 16;

export default function Screen({
  title,
  back,
  actions,
  scroll = true,
  inTabs,
  modal,
  contentStyle,
  overlay,
  children,
}: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bottomInset = inTabs ? 0 : insets.bottom;
  const sheet = modal && Platform.OS === 'ios';

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header
        mode="small"
        elevated={false}
        statusBarHeight={sheet ? 0 : insets.top}
        style={{ backgroundColor: theme.colors.background }}
      >
        {back ? <Appbar.BackAction onPress={() => router.back()} /> : null}
        <Appbar.Content
          title={title}
          titleStyle={inTabs ? { fontSize: 26, fontWeight: '700', letterSpacing: -0.4 } : undefined}
        />
        {actions}
      </Appbar.Header>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              { padding: SCREEN_PADDING, paddingBottom: SCREEN_PADDING * 2 + bottomInset, gap: 20 },
              contentStyle,
            ]}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
        )}
      </KeyboardAvoidingView>
      {overlay}
    </View>
  );
}
