import Constants from 'expo-constants';
import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Card, HelperText, List, SegmentedButtons, Snackbar, Text, TextInput, useTheme } from 'react-native-paper';
import ConfirmDialog from '../../src/components/ConfirmDialog';
import Panel from '../../src/components/Panel';
import Screen from '../../src/components/Screen';
import Section from '../../src/components/Section';
import { useData } from '../../src/DataContext';
import { formatDate, parseNumber } from '../../src/lib/format';
import { exportBackup, pickBackup } from '../../src/storage';
import { AppData, ThemeMode } from '../../src/types';

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : 'Something went wrong.');

export default function SettingsScreen() {
  const theme = useTheme();
  const { data, updateSettings, replaceData } = useData();
  const { settings } = data;

  const [currency, setCurrency] = useState(settings.currencySymbol);
  const [rate, setRate] = useState(String(settings.defaultUnitRate));
  const [pendingImport, setPendingImport] = useState<AppData | null>(null);
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);
  const [message, setMessage] = useState('');

  const parsedRate = parseNumber(rate);
  const currencyError = !currency.trim();
  const rateError = parsedRate === undefined || parsedRate < 0;
  const dirty = currency.trim() !== settings.currencySymbol || parsedRate !== settings.defaultUnitRate;

  const saveBilling = () => {
    if (currencyError || rateError) return;
    updateSettings({ currencySymbol: currency.trim(), defaultUnitRate: parsedRate });
    setCurrency(currency.trim());
    setMessage('Billing defaults saved');
  };

  const runExport = async () => {
    setBusy('export');
    try {
      await exportBackup(data);
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const runImport = async () => {
    setBusy('import');
    try {
      const incoming = await pickBackup();
      if (incoming) setPendingImport(incoming);
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const applyImport = () => {
    if (!pendingImport) return;
    replaceData(pendingImport);
    setCurrency(pendingImport.settings.currencySymbol);
    setRate(String(pendingImport.settings.defaultUnitRate));
    setMessage(`Imported ${pendingImport.tenants.length} tenants and ${pendingImport.readings.length} readings`);
  };

  return (
    <Screen
      title="Settings"
      inTabs
      overlay={
        <>
          <ConfirmDialog
            visible={!!pendingImport}
            title="Replace all data?"
            message={
              pendingImport
                ? `This backup has ${pendingImport.tenants.length} tenants and ${pendingImport.readings.length} readings. Your current data will be replaced.`
                : ''
            }
            confirmLabel="Replace"
            destructive
            onDismiss={() => setPendingImport(null)}
            onConfirm={applyImport}
          />
          <Snackbar visible={!!message} onDismiss={() => setMessage('')} duration={3000}>
            {message}
          </Snackbar>
        </>
      }
    >
      <Section title="Appearance">
        <SegmentedButtons
          value={settings.themeMode}
          onValueChange={value => updateSettings({ themeMode: value as ThemeMode })}
          buttons={[
            { value: 'system', label: 'System', icon: 'theme-light-dark' },
            { value: 'light', label: 'Light', icon: 'white-balance-sunny' },
            { value: 'dark', label: 'Dark', icon: 'weather-night' },
          ]}
        />
      </Section>

      <Section title="Billing defaults">
        <Panel>
          <Card.Content style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TextInput
                mode="outlined"
                label="Currency"
                value={currency}
                onChangeText={setCurrency}
                maxLength={3}
                error={currencyError}
                style={{ width: 104 }}
              />
              <TextInput
                mode="outlined"
                label="Default unit rate"
                value={rate}
                onChangeText={setRate}
                keyboardType="decimal-pad"
                error={rateError}
                right={<TextInput.Affix text="/unit" />}
                style={{ flex: 1 }}
              />
            </View>
            <HelperText type={rateError || currencyError ? 'error' : 'info'}>
              {currencyError
                ? 'Enter a currency symbol.'
                : rateError
                  ? 'Enter a valid, non-negative rate.'
                  : 'Used for tenants without a custom rate.'}
            </HelperText>
            <Button
              mode="contained"
              onPress={saveBilling}
              disabled={!dirty || currencyError || rateError}
              style={{ alignSelf: 'flex-end' }}
            >
              Save
            </Button>
          </Card.Content>
        </Panel>
      </Section>

      <Section title="Backup">
        <Panel>
          <List.Item
            title="Export backup"
            description="Save all tenants and readings as a JSON file"
            left={props => <List.Icon {...props} icon="export-variant" />}
            right={props => (busy === 'export' ? <List.Icon {...props} icon="dots-horizontal" /> : null)}
            onPress={busy ? undefined : runExport}
          />
          <List.Item
            title="Restore from backup"
            description="Replace current data with a JSON backup"
            left={props => <List.Icon {...props} icon="import" />}
            right={props => (busy === 'import' ? <List.Icon {...props} icon="dots-horizontal" /> : null)}
            onPress={busy ? undefined : runImport}
          />
        </Panel>
      </Section>

      <Section title="About">
        <Panel>
          <Card.Content style={{ gap: 6 }}>
            <Text variant="titleMedium">Tennet Manager {Constants.expoConfig?.version ?? ''}</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Last change {formatDate(data.updatedAt)}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Your data stays on this device and is never uploaded. Export a backup regularly to keep it safe.
            </Text>
          </Card.Content>
        </Panel>
      </Section>
    </Screen>
  );
}
