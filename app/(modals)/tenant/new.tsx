import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Appbar, Button, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import { useData } from '../../../src/DataContext';
import Screen from '../../../src/components/Screen';

export default function NewTenantScreen() {
  const { addTenant, data } = useData();
  const [name, setName] = useState('');
  const [unitRate, setUnitRate] = useState(String(data.settings.defaultUnitRate));
  const [notes, setNotes] = useState('');

  const save = () => {
    if (!name.trim()) return;
    addTenant({ name: name.trim(), unitRate: Number(unitRate), notes });
    router.back();
  };

  return (
    <Screen
      scroll
      title="New tenant"
      onBack={() => router.back()}
      headerActions={<Appbar.Action icon="content-save" onPress={save} disabled={!name.trim()} />}
      contentContainerStyle={{ gap: 16 }}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ gap: 12 }}>
          <TextInput label="Name" value={name} onChangeText={setName} />
          <TextInput label="Unit rate" value={unitRate} onChangeText={setUnitRate} keyboardType="decimal-pad" />
          <TextInput label="Notes" value={notes} onChangeText={setNotes} multiline />
          <Button mode="contained" onPress={save} disabled={!name.trim()}>
            Save
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
