import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { Link } from 'expo-router';
import { Button, Card, Chip, Divider, Text } from 'react-native-paper';
import { useData } from '../../src/DataContext';
import Screen from '../../src/components/Screen';

export default function OverviewScreen() {
  const { data, exportToFile, importFromFile } = useData();

  const totalTenants = data.tenants.length;
  const totalReadings = data.readings.length;
  const lastUpdated = data.updatedAt ? new Date(data.updatedAt) : undefined;

  const recentReadings = useMemo(() => {
    return [...data.readings]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 5);
  }, [data.readings]);

  const overdueTenants = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const lastReadingByTenant = new Map<string, Date>();
    data.readings.forEach(reading => {
      const current = lastReadingByTenant.get(reading.tenantId);
      const readingDate = new Date(reading.date);
      if (!current || current < readingDate) {
        lastReadingByTenant.set(reading.tenantId, readingDate);
      }
    });

    return data.tenants.filter(tenant => {
      const last = lastReadingByTenant.get(tenant.id);
      if (!last) return true;
      return last < thirtyDaysAgo;
    });
  }, [data.tenants, data.readings]);

  return (
    <Screen scroll title="">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingRight: 20 }}
      >
        <Card mode="contained" style={{ minWidth: 200 }}>
          <Card.Title title="Tenants Managed" />
          <Card.Content>
            <Text variant="displaySmall">{totalTenants}</Text>
          </Card.Content>
        </Card>
        <Card mode="contained" style={{ minWidth: 200 }}>
          <Card.Title title="Readings logged" />
          <Card.Content>
            <Text variant="displaySmall">{totalReadings}</Text>
          </Card.Content>
        </Card>
        <Card mode="contained" style={{ minWidth: 200 }}>
          <Card.Title title="Last updated" />
          <Card.Content>
            <Text variant="displaySmall">
              {lastUpdated ? lastUpdated.toLocaleDateString() : 'Never'}
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      <View style={{ gap: 12 }}>
        <Text variant="titleMedium">Quick actions</Text>
        <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/tenant/new" asChild>
            <Button mode="contained">
              Add tenant
            </Button>
          </Link>
          <Link href={{ pathname: '/reading/new' }} asChild>
            <Button mode="outlined">
              Log reading
            </Button>
          </Link>
        </View>
      </View>

      <Divider style={{ marginVertical: 8 }} />

      <View style={{ gap: 12 }}>
        <Text variant="titleMedium">Recent readings</Text>
        {recentReadings.length === 0 ? (
          <Card mode="outlined">
            <Card.Content>
              <Text variant="bodyMedium">No readings yet. Log your first meter reading to populate this list.</Text>
            </Card.Content>
          </Card>
        ) : (
          recentReadings.map(reading => {
            const tenant = data.tenants.find(t => t.id === reading.tenantId);
            return (
              <Card key={reading.id} mode="elevated">
                <Card.Title
                  title={tenant?.name ?? 'Unknown tenant'}
                  subtitle={`Recorded ${new Date(reading.date).toLocaleDateString()}`}
                  right={() => (
                    <Chip compact style={{ alignSelf: 'center', marginRight: 12 }}>
                      {reading.value} units
                    </Chip>
                  )}
                />
              </Card>
            );
          })
        )}
      </View>

      <View style={{ gap: 12 }}>
        <Text variant="titleMedium">Needs attention</Text>
        {overdueTenants.length === 0 ? (
          <Card mode="outlined">
            <Card.Content>
              <Text variant="bodyMedium">All tenants have recent readings. Great job!</Text>
            </Card.Content>
          </Card>
        ) : (
          overdueTenants.map(tenant => (
            <Card key={tenant.id} mode="outlined">
              <Card.Title
                title={tenant.name}
                subtitle={tenant.notes ?? 'No notes yet'}
                right={() => (
                  <Link href={{ pathname: '/reading/new', params: { tenantId: tenant.id } }} asChild>
                    <Button
                      mode="contained-tonal"
                      style={{ marginRight: 12, alignSelf: 'center' }}
                      contentStyle={{ gap: 6 }}
                    >
                      Log reading
                    </Button>
                  </Link>
                )}
              />
            </Card>
          )))
        }
      </View>
    </Screen>
  );
}
