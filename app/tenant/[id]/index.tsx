import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Appbar, Card, Divider, FAB, List, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ConfirmDialog from '../../../src/components/ConfirmDialog';
import EmptyState from '../../../src/components/EmptyState';
import NotFound from '../../../src/components/NotFound';
import Panel from '../../../src/components/Panel';
import Screen, { SCREEN_PADDING } from '../../../src/components/Screen';
import Section from '../../../src/components/Section';
import StatCard from '../../../src/components/StatCard';
import { useData } from '../../../src/DataContext';
import { formatDate, formatMoney, formatRate, formatRelativeDay, formatUnits } from '../../../src/lib/format';
import { readingHistory, tenantRate } from '../../../src/lib/readings';
import { useRetained } from '../../../src/lib/useRetained';

export default function TenantScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, deleteTenant } = useData();
  const tenant = useRetained(data.tenants.find(t => t.id === id));
  const [confirmDelete, setConfirmDelete] = useState(false);

  const history = useMemo(() => readingHistory(data.readings, id), [data.readings, id]);

  if (!tenant) return <NotFound what="Tenant" />;

  const symbol = data.settings.currencySymbol;
  const rate = tenantRate(tenant, data);
  const [latest] = history;
  const lastUsage = latest?.usage;

  return (
    <Screen
      title={tenant.name}
      back
      contentStyle={{ paddingBottom: 96 + insets.bottom }}
      actions={
        <>
          <Appbar.Action
            icon="pencil-outline"
            accessibilityLabel="Edit tenant"
            onPress={() => router.push({ pathname: '/tenant/[id]/edit', params: { id: tenant.id } })}
          />
          <Appbar.Action icon="delete-outline" accessibilityLabel="Delete tenant" onPress={() => setConfirmDelete(true)} />
        </>
      }
      overlay={
        <>
          <FAB
            icon="counter"
            label="Log reading"
            style={{ position: 'absolute', right: SCREEN_PADDING, bottom: SCREEN_PADDING + insets.bottom }}
            onPress={() => router.push({ pathname: '/reading/new', params: { tenantId: tenant.id } })}
          />
          <ConfirmDialog
            visible={confirmDelete}
            title={`Delete ${tenant.name}?`}
            message={`This removes the tenant and all ${history.length} of their readings. This cannot be undone.`}
            confirmLabel="Delete"
            destructive
            onDismiss={() => setConfirmDelete(false)}
            onConfirm={() => {
              deleteTenant(tenant.id);
              router.back();
            }}
          />
        </>
      }
    >
      <View style={{ gap: 12 }}>
        <StatCard
          highlight
          icon="cash"
          label="Latest bill"
          value={lastUsage !== undefined ? formatMoney(lastUsage * rate, symbol) : '—'}
          caption={
            lastUsage !== undefined
              ? `${formatUnits(lastUsage)} × ${formatRate(rate, symbol)}`
              : 'Needs two readings to calculate'
          }
        />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <StatCard
            icon="counter"
            label="Meter"
            value={latest ? formatUnits(latest.reading.value) : '—'}
            caption={latest ? formatRelativeDay(latest.reading.date) : 'No readings yet'}
          />
          <StatCard
            icon="tag-outline"
            label="Rate"
            value={formatRate(rate, symbol)}
            caption={tenant.unitRate === undefined ? 'Default rate' : 'Custom rate'}
          />
        </View>
      </View>

      {tenant.notes ? (
        <Section title="Notes">
          <Panel>
            <Card.Content>
              <Text variant="bodyMedium">{tenant.notes}</Text>
            </Card.Content>
          </Panel>
        </Section>
      ) : null}

      <Section
        title="Reading history"
        aside={<Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>{history.length}</Text>}
      >
        <Panel>
          {history.length === 0 ? (
            <EmptyState icon="counter" title="No readings yet" message="Log the current meter value to get started." />
          ) : (
            history.map(({ reading, usage }, index) => (
              <React.Fragment key={reading.id}>
                {index > 0 ? <Divider horizontalInset /> : null}
                <List.Item
                  title={formatUnits(reading.value)}
                  description={formatDate(reading.date)}
                  onPress={() => router.push({ pathname: '/reading/[id]', params: { id: reading.id } })}
                  left={props => <List.Icon {...props} icon="flash-outline" />}
                  right={() => (
                    <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                      {usage !== undefined ? (
                        <>
                          <Text variant="titleSmall">{formatMoney(usage * rate, symbol)}</Text>
                          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            +{formatUnits(usage)}
                          </Text>
                        </>
                      ) : (
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          First reading
                        </Text>
                      )}
                    </View>
                  )}
                />
              </React.Fragment>
            ))
          )}
        </Panel>
      </Section>
    </Screen>
  );
}
