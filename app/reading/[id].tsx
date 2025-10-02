import React, { useMemo, useState } from 'react';
import { Alert, View, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Appbar, Button, HelperText, Text, TextInput } from 'react-native-paper';
import { useData } from '../../src/DataContext';
import Screen from '../../src/components/Screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditReadingScreen() {
  const params = useLocalSearchParams();
  const idParam = params.id;
  const id = Array.isArray(idParam) ? idParam[0] ?? '' : idParam ?? '';
  const { data, updateReading, deleteReading } = useData();
  const reading = data.readings.find(r => r.id === id);
  const insets = useSafeAreaInsets();

  const tenant = reading ? data.tenants.find(t => t.id === reading.tenantId) : undefined;

  const tenantReadings = useMemo(() => {
    if (!reading) return [];
    return data.readings
      .filter(r => r.tenantId === reading.tenantId)
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [data.readings, reading]);

  const index = reading ? tenantReadings.findIndex(r => r.id === reading.id) : -1;
  const previous = index > 0 ? tenantReadings[index - 1] : undefined;
  const next = index >= 0 && index < tenantReadings.length - 1 ? tenantReadings[index + 1] : undefined;

  const [date, setDate] = useState(() => (reading ? reading.date.slice(0, 10) : new Date().toISOString().slice(0, 10)));
  const [value, setValue] = useState(() => (reading ? String(reading.value) : ''));

  if (!reading) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text>Reading not found.</Text>
          <Button mode="text" onPress={() => router.back()} style={{ marginTop: 12 }}>
            Go back
          </Button>
        </View>
      </Screen>
    );
  }

  const numericValue = Number(value);
  const hasNumberError = !value || Number.isNaN(numericValue);
  const consumption = !hasNumberError && previous ? numericValue - previous.value : undefined;
  const negativeUsage = consumption !== undefined && consumption < 0;
  const exceedsNext = !hasNumberError && next ? numericValue > next.value : false;

  const save = () => {
    if (hasNumberError || negativeUsage || exceedsNext) return;
    updateReading(reading.id, {
      date: new Date(date).toISOString(),
      value: numericValue,
    });
    router.back();
  };

  const confirmDelete = () => {
    Alert.alert('Delete reading', 'This reading will be removed permanently.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteReading(reading.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen withPadding={false}>
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={`Edit Reading${tenant ? ` • ${tenant.name}` : ''}`} />
          <Appbar.Action icon="content-save" onPress={save} disabled={hasNumberError || negativeUsage || exceedsNext} />
          <Appbar.Action icon="delete" onPress={confirmDelete} />
        </Appbar.Header>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 32 + insets.bottom,
            paddingTop: 16,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ gap: 12 }}>
            <TextInput label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
            <TextInput label="Meter reading" value={value} onChangeText={setValue} keyboardType="decimal-pad" />
            {hasNumberError && <HelperText type="error">Enter a valid number</HelperText>}
            {previous ? (
              <HelperText type={negativeUsage ? 'error' : 'info'}>
                Previous reading: {previous.value} units on {new Date(previous.date).toLocaleDateString()}
              </HelperText>
            ) : (
              <HelperText type="info">This is the first reading for this tenant.</HelperText>
            )}
            {consumption !== undefined && !negativeUsage ? (
              <HelperText type="info">Usage since last reading: {consumption} units</HelperText>
            ) : null}
            {negativeUsage && <HelperText type="error">Reading must be greater than or equal to the previous reading.</HelperText>}
            {exceedsNext && next ? (
              <HelperText type="error">
                Reading must be less than or equal to the next reading ({next.value} units on {new Date(next.date).toLocaleDateString()}).
              </HelperText>
            ) : null}
            <Button mode="contained" onPress={save} disabled={hasNumberError || negativeUsage || exceedsNext}>
              Save changes
            </Button>
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}
