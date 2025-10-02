import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, Card, Switch, Text, TextInput } from 'react-native-paper';
import { useData } from '../../src/DataContext';
import Screen from '../../src/components/Screen';

export default function SettingsTab() {
  const { data, updateSettings, exportToFile, importFromFile } = useData();
  const [currencySymbol, setCurrencySymbol] = useState(data.settings.currencySymbol);
  const [defaultUnitRate, setDefaultUnitRate] = useState(String(data.settings.defaultUnitRate));
  const [shareTotals, setShareTotals] = useState(true);
  const [darkMode, setDarkMode] = useState(data.settings.themeMode === 'dark');

  useEffect(() => {
    setCurrencySymbol(data.settings.currencySymbol);
    setDefaultUnitRate(String(data.settings.defaultUnitRate));
    setDarkMode(data.settings.themeMode === 'dark');
  }, [data.settings.currencySymbol, data.settings.defaultUnitRate, data.settings.themeMode]);

  const persist = () => {
    updateSettings({
      currencySymbol: currencySymbol || data.settings.currencySymbol,
      defaultUnitRate: Number(defaultUnitRate) || data.settings.defaultUnitRate,
    });
  };
  return (
    <Screen
      scroll
      title=""
      >
      <Card mode="elevated">
        <Card.Title title="Billing defaults" />
        <Card.Content style={{ gap: 12 }}>
          <TextInput
            label="Currency symbol"
            value={currencySymbol}
            onChangeText={setCurrencySymbol}
            maxLength={3}
          />
          <TextInput
            label="Default unit rate"
            value={defaultUnitRate}
            onChangeText={setDefaultUnitRate}
            keyboardType="decimal-pad"
          />
          <Button mode="contained" onPress={persist}>
            Save changes
          </Button>
        </Card.Content>
      </Card>

      <Card mode="elevated">
        <Card.Title title="Appearance" />
        <Card.Content style={{ gap: 12 }}>
          <Button
            mode={darkMode ? 'contained' : 'outlined'}
            style={{ alignSelf: 'stretch' }}
            contentStyle={{ paddingVertical: 6 }}
            onPress={() => {
              const nextValue = !darkMode;
              setDarkMode(nextValue);
              updateSettings({ themeMode: nextValue ? 'dark' : 'light' });
            }}
          >
            {darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          </Button>
        </Card.Content>
      </Card>

      <Card mode="elevated">
        <Card.Title title="Exports"/>
        <Card.Content style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="bodyMedium">Include totals in exported message</Text>
            <Switch value={shareTotals} onValueChange={setShareTotals} />
          </View>
          <Button
            icon="share-variant"
            mode="contained"
            contentStyle={{ gap: 6 }}
            onPress={async () => {
              await exportToFile({ includeSummary: shareTotals });
            }}
          >
            Share data snapshot
          </Button>
          <Button
            icon="file-import"
            mode="outlined"
            contentStyle={{ gap: 6 }}
            onPress={async () => {
              await importFromFile();
            }}
          >
            Import from JSON
          </Button>
        </Card.Content>
      </Card>

      <Card mode="outlined">
        <Card.Title title="About" />
        <Card.Content style={{ gap: 6 }}>
          <Text variant="bodyMedium">Version 1.0.0</Text>
          <Text variant="bodyMedium">
            Updated {data.updatedAt ? new Date(data.updatedAt).toLocaleString() : 'never'}
          </Text>
          <Text variant="bodySmall" style={{ opacity: 0.7 }}>
            Data is stored locally on this device using secure AsyncStorage. Use exports to keep backups.
          </Text>
        </Card.Content>
      </Card>
    </Screen>
  );
}
