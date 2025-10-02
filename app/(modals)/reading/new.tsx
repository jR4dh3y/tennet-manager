import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Appbar, Button, HelperText, TextInput } from 'react-native-paper';
import { useData } from '../../../src/DataContext';
import Screen from '../../../src/components/Screen';

export default function NewReadingScreen() {
  const { data, addReading } = useData();
  const params = useLocalSearchParams();
  const tenantIdParam = params.tenantId;
  const tenantId = Array.isArray(tenantIdParam) ? tenantIdParam[0] ?? '' : tenantIdParam ?? '';
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [value, setValue] = useState('');

  const tenant = useMemo(() => data.tenants.find(t => t.id === tenantId), [tenantId, data.tenants]);

  const previousReading = useMemo(() => {
    if (!tenantId) return undefined;
    return data.readings
      .filter(r => r.tenantId === tenantId)
      .sort((a, b) => (a.date > b.date ? 1 : -1))
      .at(-1);
  }, [data.readings, tenantId]);

  const numericValue = Number(value);
  const hasNumberError = !value || Number.isNaN(numericValue);
  const consumption = !hasNumberError && previousReading ? numericValue - previousReading.value : undefined;
  const negativeUsage = consumption !== undefined && consumption < 0;

  const save = () => {
    if (!tenant || hasNumberError || negativeUsage) return;
    addReading({ tenantId, date: new Date(date).toISOString(), value: numericValue });
    router.back();
  };

  return (
    <Screen
      scroll
      title="New reading"
      subtitle={tenant ? `for ${tenant.name}` : undefined}
      onBack={() => router.back()}
      headerActions={
        <Appbar.Action
          icon="content-save"
          onPress={save}
          disabled={!tenant || hasNumberError || negativeUsage}
        />
      }
      contentContainerStyle={{ gap: 16 }}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ gap: 12 }}>
          <TextInput label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
          <TextInput label="Meter reading" value={value} onChangeText={setValue} keyboardType="decimal-pad" />
          {hasNumberError && <HelperText type="error">Enter a valid number</HelperText>}
          {previousReading ? (
            <HelperText type={negativeUsage ? 'error' : 'info'}>
              Previous reading: {previousReading.value} units on {new Date(previousReading.date).toLocaleDateString()}
            </HelperText>
          ) : (
            <HelperText type="info">This will be the first reading for this tenant.</HelperText>
          )}
          {consumption !== undefined && !negativeUsage ? (
            <HelperText type="info">Usage since last reading: {consumption} units</HelperText>
          ) : null}
          {negativeUsage && (
            <HelperText type="error">Reading must be greater than or equal to the previous reading.</HelperText>
          )}
          {!tenant && <HelperText type="error">Select a tenant to continue (open from tenant details).</HelperText>}
          <Button mode="contained" onPress={save} disabled={!tenant || hasNumberError || negativeUsage}>
            Save
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
