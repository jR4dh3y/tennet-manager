import { router } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { Appbar, Button, HelperText, TextInput } from 'react-native-paper';
import { useData } from '../DataContext';
import { parseNumber } from '../lib/format';
import { Tenant } from '../types';
import Screen from './Screen';

/** Create (no `tenant`) or edit a tenant. */
export default function TenantForm({ tenant }: { tenant?: Tenant }) {
  const { data, addTenant, updateTenant } = useData();
  const { currencySymbol, defaultUnitRate } = data.settings;

  const [name, setName] = useState(tenant?.name ?? '');
  const [rate, setRate] = useState(tenant?.unitRate !== undefined ? String(tenant.unitRate) : '');
  const [notes, setNotes] = useState(tenant?.notes ?? '');
  const [touched, setTouched] = useState(false);

  const trimmedName = name.trim();
  const parsedRate = parseNumber(rate);
  const nameError = !trimmedName;
  const rateError = rate.trim() !== '' && (parsedRate === undefined || parsedRate < 0);
  const valid = !nameError && !rateError;

  const save = () => {
    setTouched(true);
    if (!valid) return;
    const values = { name: trimmedName, unitRate: parsedRate, notes: notes.trim() || undefined };
    if (tenant) {
      updateTenant(tenant.id, values);
      router.back();
    } else {
      const id = addTenant(values);
      router.replace({ pathname: '/tenant/[id]', params: { id } });
    }
  };

  return (
    <Screen
      title={tenant ? 'Edit tenant' : 'New tenant'}
      back
      modal
      actions={<Appbar.Action icon="check" accessibilityLabel="Save" onPress={save} disabled={!valid} />}
    >
      <View style={{ gap: 4 }}>
        <TextInput
          mode="outlined"
          label="Name"
          value={name}
          onChangeText={setName}
          onBlur={() => setTouched(true)}
          autoFocus={!tenant}
          autoCapitalize="words"
          returnKeyType="next"
          error={touched && nameError}
        />
        <HelperText type="error" visible={touched && nameError}>
          Name is required.
        </HelperText>

        <TextInput
          mode="outlined"
          label="Unit rate"
          value={rate}
          onChangeText={setRate}
          keyboardType="decimal-pad"
          placeholder={String(defaultUnitRate)}
          error={rateError}
          right={<TextInput.Affix text={`${currencySymbol}/unit`} />}
        />
        <HelperText type={rateError ? 'error' : 'info'}>
          {rateError
            ? 'Enter a valid, non-negative rate.'
            : `Leave blank to use the default rate (${currencySymbol}${defaultUnitRate}/unit).`}
        </HelperText>

        <TextInput
          mode="outlined"
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          style={{ minHeight: 110 }}
          placeholder="Room number, phone, deposit…"
        />
      </View>

      <Button mode="contained" icon="check" onPress={save} disabled={!valid} contentStyle={{ paddingVertical: 4 }}>
        {tenant ? 'Save changes' : 'Add tenant'}
      </Button>
    </Screen>
  );
}
