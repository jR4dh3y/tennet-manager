import { router } from 'expo-router';
import React from 'react';
import { Button } from 'react-native-paper';
import EmptyState from './EmptyState';
import Screen from './Screen';

export default function NotFound({ what }: { what: string }) {
  return (
    <Screen title={`${what} not found`} back>
      <EmptyState
        icon="help-circle-outline"
        title={`${what} not found`}
        message="It may have been deleted."
        action={
          <Button mode="contained-tonal" onPress={() => router.back()}>
            Go back
          </Button>
        }
      />
    </Screen>
  );
}
