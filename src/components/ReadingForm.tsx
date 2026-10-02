import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Appbar, Button, Card, HelperText, Menu, Text, TextInput, useTheme } from 'react-native-paper';
import { DatePickerInput } from 'react-native-paper-dates';
import { useData } from '../DataContext';
import { LOCALE, formatDate, formatMoney, formatUnits, parseNumber, startOfDay, toStoredDate } from '../lib/format';
import { neighbours, tenantRate } from '../lib/readings';
import { Reading } from '../types';
import ConfirmDialog from './ConfirmDialog';
import EmptyState from './EmptyState';
import Screen from './Screen';

type ReadingFormProps = {
  /** Existing reading to edit. */
  reading?: Reading;
  /** Preselected tenant for a new reading. */
  tenantId?: string;
};

export default function ReadingForm({ reading, tenantId: initialTenantId }: ReadingFormProps) {
  const theme = useTheme();
  const { data, addReading, updateReading, deleteReading } = useData();

  const [tenantId, setTenantId] = useState(reading?.tenantId ?? initialTenantId ?? '');
  const [date, setDate] = useState<Date | undefined>(() =>
    reading ? new Date(reading.date) : startOfDay(new Date())
  );
  const [value, setValue] = useState(reading ? String(reading.value) : '');
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const tenant = data.tenants.find(t => t.id === tenantId);
  const sortedTenants = useMemo(
    () => [...data.tenants].sort((a, b) => a.name.localeCompare(b.name)),
    [data.tenants]
  );

  const storedDate = date ? toStoredDate(date) : undefined;
  const { previous, next } = useMemo(
    () =>
      tenant && storedDate
        ? neighbours(data.readings, tenant.id, storedDate, reading?.id)
        : { previous: undefined, next: undefined },
    [data.readings, tenant, storedDate, reading?.id]
  );

  if (data.tenants.length === 0) {
    return (
      <Screen title="Log reading" back modal>
        <EmptyState
          icon="account-plus-outline"
          title="Add a tenant first"
          message="Readings belong to a tenant. Create one, then log their meter."
          action={
            <Button mode="contained" icon="account-plus" onPress={() => router.replace('/tenant/new')}>
              Add tenant
            </Button>
          }
        />
      </Screen>
    );
  }

  const numericValue = parseNumber(value);
  const valueError = value.trim() !== '' && (numericValue === undefined || numericValue < 0);
  const belowPrevious = numericValue !== undefined && previous !== undefined && numericValue < previous.value;
  const aboveNext = numericValue !== undefined && next !== undefined && numericValue > next.value;
  const valid = !!tenant && !!storedDate && numericValue !== undefined && !valueError && !belowPrevious && !aboveNext;

  const usage = numericValue !== undefined && previous && !belowPrevious ? numericValue - previous.value : undefined;
  const rate = tenant ? tenantRate(tenant, data) : 0;

  const save = () => {
    if (!valid || !tenant || !storedDate || numericValue === undefined) return;
    if (reading) {
      updateReading(reading.id, { tenantId: tenant.id, date: storedDate, value: numericValue });
    } else {
      addReading({ tenantId: tenant.id, date: storedDate, value: numericValue });
    }
    router.back();
  };

  let valueHelper: { text: string; error: boolean } | undefined;
  if (valueError) valueHelper = { text: 'Enter a valid meter value.', error: true };
  else if (belowPrevious && previous)
    valueHelper = {
      text: `Must be at least ${formatUnits(previous.value)} (reading on ${formatDate(previous.date)}).`,
      error: true,
    };
  else if (aboveNext && next)
    valueHelper = {
      text: `Must be at most ${formatUnits(next.value)} (reading on ${formatDate(next.date)}).`,
      error: true,
    };
  else if (previous)
    valueHelper = { text: `Previous: ${formatUnits(previous.value)} on ${formatDate(previous.date)}`, error: false };
  else if (tenant) valueHelper = { text: 'This will be the first reading for this tenant.', error: false };

  return (
    <Screen
      title={reading ? 'Edit reading' : 'Log reading'}
      back
      modal
      actions={
        <>
          {reading ? (
            <Appbar.Action icon="delete-outline" accessibilityLabel="Delete reading" onPress={() => setConfirmDelete(true)} />
          ) : null}
          <Appbar.Action icon="check" accessibilityLabel="Save" onPress={save} disabled={!valid} />
        </>
      }
      overlay={
        <ConfirmDialog
          visible={confirmDelete}
          title="Delete reading?"
          message="This reading will be removed permanently."
          confirmLabel="Delete"
          destructive
          onDismiss={() => setConfirmDelete(false)}
          onConfirm={() => {
            if (!reading) return;
            deleteReading(reading.id);
            router.back();
          }}
        />
      }
    >
      <View style={{ gap: 4 }}>
        <Menu
          visible={menuOpen}
          onDismiss={() => setMenuOpen(false)}
          anchorPosition="bottom"
          anchor={
            <Pressable
              onPress={() => setMenuOpen(true)}
              disabled={!!reading}
              accessibilityRole="button"
              accessibilityLabel="Choose tenant"
            >
              <View pointerEvents="none">
                <TextInput
                  mode="outlined"
                  label="Tenant"
                  value={tenant?.name ?? ''}
                  placeholder="Choose a tenant"
                  editable={false}
                  right={reading ? undefined : <TextInput.Icon icon="menu-down" />}
                />
              </View>
            </Pressable>
          }
        >
          {sortedTenants.map(t => (
            <Menu.Item
              key={t.id}
              title={t.name}
              leadingIcon={t.id === tenantId ? 'check' : 'account-outline'}
              onPress={() => {
                setTenantId(t.id);
                setMenuOpen(false);
              }}
            />
          ))}
        </Menu>
        <HelperText type="info" visible={!tenant}>
          Choose who this reading is for.
        </HelperText>

        <DatePickerInput
          mode="outlined"
          locale={LOCALE}
          label="Date"
          value={date}
          onChange={setDate}
          inputMode="start"
          validRange={{ endDate: new Date() }}
          saveLabel="Select"
          withDateFormatInLabel={false}
          startWeekOnMonday
        />

        <TextInput
          mode="outlined"
          label="Meter reading"
          value={value}
          onChangeText={setValue}
          keyboardType="decimal-pad"
          autoFocus={!reading && !!tenant}
          error={!!valueHelper?.error}
          right={<TextInput.Affix text="units" />}
          style={{ marginTop: 20 }}
        />
        <HelperText type={valueHelper?.error ? 'error' : 'info'} visible={!!valueHelper}>
          {valueHelper?.text ?? ' '}
        </HelperText>
      </View>

      {usage !== undefined ? (
        <Card mode="contained" style={{ backgroundColor: theme.colors.secondaryContainer }}>
          <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
            <View>
              <Text variant="labelMedium" style={{ color: theme.colors.onSecondaryContainer }}>
                Usage since previous
              </Text>
              <Text variant="titleLarge" style={{ color: theme.colors.onSecondaryContainer, fontWeight: '700' }}>
                {formatUnits(usage)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text variant="labelMedium" style={{ color: theme.colors.onSecondaryContainer }}>
                Estimated bill
              </Text>
              <Text variant="titleLarge" style={{ color: theme.colors.onSecondaryContainer, fontWeight: '700' }}>
                {formatMoney(usage * rate, data.settings.currencySymbol)}
              </Text>
            </View>
          </Card.Content>
        </Card>
      ) : null}

      <Button mode="contained" icon="check" onPress={save} disabled={!valid} contentStyle={{ paddingVertical: 4 }}>
        {reading ? 'Save changes' : 'Save reading'}
      </Button>
    </Screen>
  );
}
