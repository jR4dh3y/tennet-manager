import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Button, Card, List, Text, useTheme } from 'react-native-paper';
import EmptyState from '../../src/components/EmptyState';
import Panel from '../../src/components/Panel';
import Screen from '../../src/components/Screen';
import Section from '../../src/components/Section';
import StatCard from '../../src/components/StatCard';
import { useData } from '../../src/DataContext';
import { formatMoney, formatRelativeDay, formatUnits } from '../../src/lib/format';
import { READING_INTERVAL_DAYS, readingHistory, summarizeTenants } from '../../src/lib/readings';

const RECENT_LIMIT = 5;

export default function OverviewScreen() {
  const theme = useTheme();
  const { data } = useData();
  const symbol = data.settings.currencySymbol;

  const summaries = useMemo(() => summarizeTenants(data), [data]);
  const overdue = summaries.filter(s => s.overdue);
  const totalUsage = summaries.reduce((sum, s) => sum + (s.lastUsage ?? 0), 0);
  const totalBill = summaries.reduce((sum, s) => sum + (s.lastBill ?? 0), 0);

  const recent = useMemo(() => {
    const names = new Map(data.tenants.map(t => [t.id, t.name]));
    return data.tenants
      .flatMap(t => readingHistory(data.readings, t.id))
      .sort((a, b) => (a.reading.date < b.reading.date ? 1 : -1))
      .slice(0, RECENT_LIMIT)
      .map(entry => ({ ...entry, tenantName: names.get(entry.reading.tenantId) ?? 'Unknown tenant' }));
  }, [data.tenants, data.readings]);

  if (data.tenants.length === 0) {
    return (
      <Screen title="Overview" inTabs>
        <Panel>
          <EmptyState
            icon="home-lightning-bolt-outline"
            title="Welcome to Tennet Manager"
            message="Track each tenant's electricity meter and see what they owe at a glance. Start by adding your first tenant."
            action={
              <Button mode="contained" icon="account-plus" onPress={() => router.push('/tenant/new')}>
                Add tenant
              </Button>
            }
          />
        </Panel>
      </Screen>
    );
  }

  return (
    <Screen title="Overview" inTabs>
      <View style={{ gap: 12 }}>
        <StatCard
          highlight
          icon="cash"
          label="Latest bills"
          value={formatMoney(totalBill, symbol)}
          caption="Usage between each tenant's last two readings"
        />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <StatCard icon="flash" label="Latest usage" value={formatUnits(totalUsage)} />
          <StatCard
            icon="account-group"
            label="Tenants"
            value={String(data.tenants.length)}
            caption={`${data.readings.length} readings`}
          />
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Button
          mode="contained"
          icon="counter"
          style={{ flex: 1 }}
          contentStyle={{ paddingVertical: 4 }}
          onPress={() => router.push('/reading/new')}
        >
          Log reading
        </Button>
        <Button
          mode="outlined"
          icon="account-plus"
          style={{ flex: 1 }}
          contentStyle={{ paddingVertical: 4 }}
          onPress={() => router.push('/tenant/new')}
        >
          Add tenant
        </Button>
      </View>

      <Section
        title="Due for a reading"
        aside={<Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>{overdue.length}</Text>}
      >
        {overdue.length === 0 ? (
          <Panel>
            <Card.Title
              title="All caught up"
              subtitle={`Every tenant has a reading from the last ${READING_INTERVAL_DAYS} days.`}
              subtitleNumberOfLines={2}
              subtitleStyle={{ color: theme.colors.onSurfaceVariant }}
              left={props => <List.Icon {...props} icon="check-circle" color={theme.colors.primary} />}
            />
          </Panel>
        ) : (
          <Panel>
            {overdue.map(({ tenant, latest }) => (
              <List.Item
                key={tenant.id}
                title={tenant.name}
                description={latest ? `Last reading: ${formatRelativeDay(latest.date)}` : 'No readings yet'}
                onPress={() => router.push({ pathname: '/tenant/[id]', params: { id: tenant.id } })}
                left={props => <List.Icon {...props} icon="clock-alert-outline" color={theme.colors.tertiary} />}
                right={() => (
                  <Button
                    compact
                    mode="text"
                    icon="plus"
                    onPress={() => router.push({ pathname: '/reading/new', params: { tenantId: tenant.id } })}
                  >
                    Log
                  </Button>
                )}
              />
            ))}
          </Panel>
        )}
      </Section>

      <Section title="Recent readings">
        {recent.length === 0 ? (
          <Panel>
            <EmptyState icon="counter" title="No readings yet" message="Log a meter reading to see it here." />
          </Panel>
        ) : (
          <Panel>
            {recent.map(({ reading, usage, tenantName }) => (
              <List.Item
                key={reading.id}
                title={tenantName}
                description={formatRelativeDay(reading.date)}
                onPress={() => router.push({ pathname: '/reading/[id]', params: { id: reading.id } })}
                left={props => <List.Icon {...props} icon="flash-outline" />}
                right={() => (
                  <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                    <Text variant="titleSmall">{formatUnits(reading.value)}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {usage !== undefined ? `+${formatUnits(usage)}` : 'First reading'}
                    </Text>
                  </View>
                )}
              />
            ))}
          </Panel>
        )}
      </Section>
    </Screen>
  );
}
