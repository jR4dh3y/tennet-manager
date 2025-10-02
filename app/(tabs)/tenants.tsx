import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Avatar,
  Card,
  Chip,
  FAB,
  Searchbar,
  SegmentedButtons,
  Text,
  useTheme,
} from 'react-native-paper';
import { useData } from '../../src/DataContext';
import Screen from '../../src/components/Screen';

const sortOptions = [
  { value: 'name', label: 'Alphabetical', icon: 'sort-alphabetical-variant' },
  { value: 'recent', label: 'Recent activity', icon: 'history' },
] as const;

type SortOption = (typeof sortOptions)[number]['value'];

export default function TenantsScreen() {
  const { data } = useData();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('recent');

  const latestReadingByTenant = useMemo(() => {
    const sorted = [...data.readings].sort((a, b) => (a.date < b.date ? 1 : -1));
    const map = new Map<string, { value: number; date: string; previousValue?: number }>();
    sorted.forEach(reading => {
      const existing = map.get(reading.tenantId);
      if (!existing) {
        map.set(reading.tenantId, { value: reading.value, date: reading.date });
      } else if (existing.previousValue === undefined) {
        map.set(reading.tenantId, { ...existing, previousValue: reading.value });
      }
    });
    return map;
  }, [data.readings]);

  const tenants = useMemo(() => {
    const filtered = data.tenants.filter(tenant =>
      tenant.name.toLowerCase().includes(query.trim().toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      if (sort === 'name') {
        return a.name.localeCompare(b.name);
      }
      const aReading = latestReadingByTenant.get(a.id)?.date ?? '';
      const bReading = latestReadingByTenant.get(b.id)?.date ?? '';
      if (aReading === bReading) {
        return a.name.localeCompare(b.name);
      }
      return aReading > bReading ? -1 : 1;
    });

    return sorted;
  }, [data.tenants, query, sort, latestReadingByTenant]);

  return (
    <Screen withPadding={false} title="">
      <View
        style={{
          paddingTop: 16,
          paddingHorizontal: 20,
          paddingBottom: 12,
          backgroundColor: theme.colors.surfaceVariant,
        }}
      >
        <Searchbar
          placeholder="Search tenants"
          value={query}
          onChangeText={setQuery}
          style={{ marginBottom: 12 }}
        />
        <SegmentedButtons
          value={sort}
          onValueChange={value => setSort(value as SortOption)}
          buttons={sortOptions.map(option => ({
            value: option.value,
            label: option.label,
            icon: option.icon,
          }))}
        />
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={tenants}
        keyExtractor={item => item.id}
  contentContainerStyle={{ padding: 20, paddingBottom: 120 + insets.bottom, gap: 12 }}
        renderItem={({ item }) => {
          const reading = latestReadingByTenant.get(item.id);
          const lastSeen = reading
            ? new Date(reading.date).toLocaleDateString()
            : 'No readings yet';
          const usageSinceLast = reading && reading.previousValue !== undefined
            ? Math.max(0, reading.value - reading.previousValue)
            : undefined;
          return (
            <Link href={{ pathname: '/tenant/[id]', params: { id: item.id } }} asChild>
              <Card mode="elevated">
                <Card.Title
                  title={item.name}
                  subtitle={item.notes || undefined}
                  left={props => <Avatar.Icon {...props} icon="account" />}
                  right={props => (
                    <View style={{ alignItems: 'flex-end', justifyContent: 'center', paddingRight: 12 }}>
                      <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
                        Last reading
                      </Text>
                      <Text variant="labelMedium" style={{ opacity: 0.7 }}>
                        {lastSeen}
                      </Text>
                    </View>
                  )}
                />
                <Card.Content style={{ gap: 8 }}>
                  <Text variant="bodyMedium">
                    Unit rate: {item.unitRate ?? data.settings.defaultUnitRate}{' '}
                    {data.settings.currencySymbol}/unit
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                    {reading ? (
                      <Chip icon="flash" compact>
                        {reading.value} units total
                      </Chip>
                    ) : (
                      <Chip icon="flash-off" compact>
                        Awaiting first reading
                      </Chip>
                    )}
                    {usageSinceLast !== undefined ? (
                      <Chip icon="chart-line" compact>
                        +{usageSinceLast} units last period
                      </Chip>
                    ) : null}
                    {item.notes ? <Chip icon="note" compact>Notes</Chip> : null}
                  </View>
                </Card.Content>
              </Card>
            </Link>
          );
        }}
        ListEmptyComponent={() => (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 48 }}>
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>
              No tenants yet
            </Text>
            <Text variant="bodyMedium" style={{ opacity: 0.7, textAlign: 'center', paddingHorizontal: 24 }}>
              Create your first tenant to begin tracking consumption.
            </Text>
          </View>
        )}
      />

      <Link href={{ pathname: '/tenant/new' }} asChild>
        <FAB
          icon="account-plus"
          style={{ position: 'absolute', right: 20, bottom: 24 + insets.bottom }}
          onPress={() => {}}
        />
      </Link>
    </Screen>
  );
}
