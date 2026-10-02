import React from 'react';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type SectionProps = {
  title: string;
  /** Right-aligned element next to the title, e.g. a count or a text button. */
  aside?: React.ReactNode;
  children: React.ReactNode;
};

export default function Section({ title, aside, children }: SectionProps) {
  const theme = useTheme();
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 28 }}>
        <Text variant="titleSmall" style={{ color: theme.colors.onSurfaceVariant, letterSpacing: 0.4 }}>
          {title.toUpperCase()}
        </Text>
        {aside}
      </View>
      {children}
    </View>
  );
}
