import React from 'react';
import { Card, useTheme } from 'react-native-paper';

type PanelProps = {
  onPress?: () => void;
  children: React.ReactNode;
};

/** Flat tonal surface for grouped content; clips list-item ripples to its rounded corners. */
export default function Panel({ onPress, children }: PanelProps) {
  const theme = useTheme();
  return (
    <Card
      mode="contained"
      onPress={onPress}
      style={{ backgroundColor: theme.colors.elevation.level1 }}
      contentStyle={{ overflow: 'hidden', borderRadius: theme.roundness * 3 }}
    >
      {children}
    </Card>
  );
}
