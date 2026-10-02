import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';

type StatCardProps = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  value: string;
  caption?: string;
  highlight?: boolean;
};

export default function StatCard({ icon, label, value, caption, highlight }: StatCardProps) {
  const theme = useTheme();
  const fg = highlight ? theme.colors.onPrimaryContainer : theme.colors.onSurface;
  return (
    <Card
      mode="contained"
      style={{
        flex: 1,
        minWidth: 150,
        backgroundColor: highlight ? theme.colors.primaryContainer : theme.colors.elevation.level2,
      }}
    >
      <Card.Content style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <MaterialCommunityIcons name={icon} size={16} color={highlight ? fg : theme.colors.primary} />
          <Text variant="labelLarge" style={{ color: highlight ? fg : theme.colors.onSurfaceVariant }} numberOfLines={1}>
            {label}
          </Text>
        </View>
        <Text variant="headlineSmall" style={{ color: fg, fontWeight: '700' }} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
        {caption ? (
          <Text variant="bodySmall" style={{ color: highlight ? fg : theme.colors.onSurfaceVariant }} numberOfLines={1}>
            {caption}
          </Text>
        ) : null}
      </Card.Content>
    </Card>
  );
}
