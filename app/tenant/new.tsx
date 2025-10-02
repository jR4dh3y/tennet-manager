import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Appbar, Button, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import { useData } from '../../src/DataContext';
import Screen from '../../src/components/Screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NewTenantScreen() {
  const { addTenant, data } = useData();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [unitRate, setUnitRate] = useState(String(data.settings.defaultUnitRate));
  const [notes, setNotes] = useState('');

  const save = () => {
    if (!name.trim()) return;
    addTenant({ name: name.trim(), unitRate: Number(unitRate), notes });
    router.back();
  };

  return (
    <Screen withPadding={false}>
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="New Tenant" />
          <Appbar.Action icon="content-save" onPress={save} />
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
            <TextInput label="Name" value={name} onChangeText={setName} />
            <TextInput label="Unit Rate" value={unitRate} onChangeText={setUnitRate} keyboardType="decimal-pad" />
            <TextInput label="Notes" value={notes} onChangeText={setNotes} multiline />
            <Button mode="contained" onPress={save} disabled={!name.trim()}>
              Save
            </Button>
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}
