import React from 'react';
import { ScrollView, View, ViewStyle } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  withPadding?: boolean;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  headerActions?: React.ReactNode;
};

export default function Screen({
  children,
  scroll = false,
  style,
  contentContainerStyle,
  withPadding = true,
  title,
  subtitle,
  onBack,
  headerActions,
}: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const hasTopBar = !!(title || subtitle || onBack || headerActions);
  const headerBackground = theme.colors.surface;
  const headerRippleColor = theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  const baseStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
  };

  const horizontalPadding = withPadding ? 20 : 0;
  const contentTopPadding = hasTopBar
    ? withPadding
      ? 16
      : 0
    : (withPadding ? insets.top + 16 : insets.top);
  const bottomPadding = (withPadding ? 24 : 0) + insets.bottom;

  if (scroll) {
    const paddedContentStyle: ViewStyle = {
      paddingHorizontal: horizontalPadding,
      paddingBottom: (withPadding ? 32 : 0) + insets.bottom,
      paddingTop: contentTopPadding,
      gap: withPadding ? 16 : undefined,
    };

    return (
      <View style={[baseStyle, style]}>
        {hasTopBar ? (
          <Appbar.Header
            mode="center-aligned"
            statusBarHeight={insets.top}
            style={{ backgroundColor: headerBackground }}
          >
            {onBack ? <Appbar.BackAction onPress={onBack} rippleColor={headerRippleColor} /> : null}
            <Appbar.Content title={title} subtitle={subtitle} />
            {headerActions ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>{headerActions}</View>
            ) : null}
          </Appbar.Header>
        ) : null}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[paddedContentStyle, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[baseStyle, style]}>
      {hasTopBar ? (
        <Appbar.Header
          mode="center-aligned"
          statusBarHeight={insets.top}
          style={{ backgroundColor: headerBackground }}
        >
          {onBack ? <Appbar.BackAction onPress={onBack} rippleColor={headerRippleColor} /> : null}
          <Appbar.Content title={title} subtitle={subtitle} />
          {headerActions ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>{headerActions}</View>
          ) : null}
        </Appbar.Header>
      ) : null}
      <View
        style={{
          flex: 1,
          paddingHorizontal: horizontalPadding,
          paddingBottom: bottomPadding,
          paddingTop: contentTopPadding,
        }}
      >
        {children}
      </View>
    </View>
  );
}
