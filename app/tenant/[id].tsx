import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { useLocalSearchParams, Link, router } from 'expo-router';
import { Appbar, Button, Divider, FAB, List, Text, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useData } from '../../src/DataContext';
import Screen from '../../src/components/Screen';

export default function TenantScreen() {
  const params = useLocalSearchParams();
  const id = String(params.id);
  const { data, updateTenant, deleteTenant } = useData();
  const insets = useSafeAreaInsets();
  const tenant = data.tenants.find(t => t.id === id);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(tenant?.name ?? '');
  const [rateInput, setRateInput] = useState(String(tenant?.unitRate ?? data.settings.defaultUnitRate));
  const [notes, setNotes] = useState(tenant?.notes ?? '');

  const readings = useMemo(
    () =>
      data.readings
        .filter(r => r.tenantId === id)
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [data.readings, id]
  );

  const readingSummaries = useMemo(() => {
    return readings.map((reading, index) => {
      const next = readings[index + 1];
      const delta = next ? Math.max(0, reading.value - next.value) : undefined;
      return { reading, consumption: delta };
    });
  }, [readings]);

  if (!tenant) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text>Tenant not found</Text>
          <Button mode="text" onPress={() => router.back()} style={{ marginTop: 12 }}>
            Go back
          </Button>
        </View>
      </Screen>
    );
  }

  const save = () => {
    updateTenant(id, { name, unitRate: Number(rateInput), notes });
    setEditing(false);
  };

  const confirmDelete = () => {
    Alert.alert('Delete Tenant', 'This will remove tenant and all readings.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteTenant(id);
          router.back();
        },
      },
    ]);
  };

  const lastTwo = readings.slice(0, 2);
  const consumption = lastTwo.length === 2 ? Math.max(0, lastTwo[0].value - lastTwo[1].value) : undefined;
  const effectiveRate = Number(tenant.unitRate ?? data.settings.defaultUnitRate) || 0;
  const cost = consumption !== undefined ? consumption * effectiveRate : undefined;

  return (
    <Screen withPadding={false}>
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={tenant.name} />
          {editing ? (
            <Appbar.Action icon="content-save" onPress={save} />
          ) : (
            <Appbar.Action icon="pencil" onPress={() => setEditing(true)} />
          )}
          <Appbar.Action icon="delete" onPress={confirmDelete} />
        </Appbar.Header>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 120 + insets.bottom,
            paddingTop: 16,
            gap: 16,
          }}
        >
          {editing ? (
            <View style={{ gap: 12 }}>
              <TextInput label="Name" value={name} onChangeText={setName} />
              <TextInput
                label="Unit Rate"
                value={rateInput}
                onChangeText={setRateInput}
                keyboardType="decimal-pad"
              />
              <TextInput label="Notes" value={notes} onChangeText={setNotes} multiline />
              <Button mode="contained" onPress={save}>
                Save
              </Button>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              <Text variant="titleMedium">Rate: {effectiveRate}</Text>
              {consumption !== undefined ? (
                <Text>
                  Last consumption: {consumption} units — Est. {data.settings.currencySymbol}
                  {cost?.toFixed(2)}
                </Text>
              ) : (
                <Text>Add at least two readings to see consumption</Text>
              )}
              {tenant.notes ? <Text>{tenant.notes}</Text> : null}
            </View>
          )}

          <Divider />
          <List.Section>
            <List.Subheader>Readings</List.Subheader>
            {readingSummaries.length === 0 ? (
              <List.Item
                title="No readings yet"
                description="Add the first reading"
                left={p => <List.Icon {...p} icon="flash" style={[p.style, { marginRight: 12 }]} />}
              />
            ) : (
              readingSummaries.map(({ reading, consumption }) => (
                <Link key={reading.id} href={{ pathname: '/reading/[id]', params: { id: reading.id } }} asChild>
                  <List.Item
                    title={`${new Date(reading.date).toLocaleDateString()} — ${reading.value} units`}
                    description={
                      consumption !== undefined
                        ? `Used ${consumption} units since last reading`
                        : 'First recorded reading'
                    }
                    left={p => <List.Icon {...p} icon="counter" style={[p.style, { marginRight: 12 }]} />}
                    right={p => <List.Icon {...p} icon="pencil" style={[p.style, { marginLeft: 12 }]} />}
                  />
                </Link>
              ))
            )}
          </List.Section>
        </ScrollView>

        <Link href={{ pathname: '/reading/new', params: { tenantId: id } }} asChild>
          <FAB icon="plus" style={{ position: 'absolute', right: 16, bottom: 16 + insets.bottom }} onPress={() => {}} />
        </Link>
      </View>
    </Screen>
  );
}
