import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { Avatar, Button, Card, Chip, FAB, Searchbar, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import EmptyState from '../../src/components/EmptyState';
import Panel from '../../src/components/Panel';
import Screen, { SCREEN_PADDING } from '../../src/components/Screen';
import { useData } from '../../src/DataContext';
import { formatMoney, formatRate, formatRelativeDay, formatUnits, initials } from '../../src/lib/format';
import { summarizeTenants, TenantSummary } from '../../src/lib/readings';

type SortOption = 'recent' | 'name';

const FAB_CLEARANCE = 88;

export default function TenantsScreen() {
  const theme = useTheme();
  const { data } = useData();
  const symbol = data.settings.currencySymbol;
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('recent');

  const summaries = useMemo(() => summarizeTenants(data), [data]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? summaries.filter(
          ({ tenant }) => tenant.name.toLowerCase().includes(q) || tenant.notes?.toLowerCase().includes(q)
        )
      : summaries;
    const byName = (a: TenantSummary, b: TenantSummary) => a.tenant.name.localeCompare(b.tenant.name);
    return [...filtered].sort((a, b) => {
      if (sort === 'name') return byName(a, b);
      const da = a.latest?.date ?? '';
      const db = b.latest?.date ?? '';
      return da === db ? byName(a, b) : da < db ? 1 : -1;
    });
  }, [summaries, query, sort]);

  const renderItem = ({ item }: { item: TenantSummary }) => {
    const { tenant, latest, lastUsage, lastBill, rate, overdue } = item;
    return (
      <Panel
        onPress={() => router.push({ pathname: '/tenant/[id]', params: { id: tenant.id } })}
      >
        <Card.Title
          title={tenant.name}
          titleVariant="titleMedium"
          subtitle={tenant.notes || formatRate(rate, symbol)}
          subtitleStyle={{ color: theme.colors.onSurfaceVariant }}
          left={props => (
            <Avatar.Text
              {...props}
              label={initials(tenant.name)}
              style={{ backgroundColor: theme.colors.primaryContainer }}
              color={theme.colors.onPrimaryContainer}
            />
          )}
          right={() =>
            lastBill !== undefined ? (
              <View style={{ alignItems: 'flex-end', paddingRight: 16 }}>
                <Text variant="titleMedium" style={{ fontWeight: '700' }}>
                  {formatMoney(lastBill, symbol)}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  last bill
                </Text>
              </View>
            ) : null
          }
        />
        <Card.Content style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {latest ? (
            <Chip
              compact
              icon={overdue ? 'clock-alert-outline' : 'calendar-check'}
              style={overdue ? { backgroundColor: theme.colors.tertiaryContainer } : undefined}
              textStyle={overdue ? { color: theme.colors.onTertiaryContainer } : undefined}
            >
              {formatRelativeDay(latest.date)}
            </Chip>
          ) : (
            <Chip compact icon="flash-off">
              No readings yet
            </Chip>
          )}
          {latest ? (
            <Chip compact icon="counter">
              {formatUnits(latest.value)}
            </Chip>
          ) : null}
          {lastUsage !== undefined ? (
            <Chip compact icon="trending-up">
              +{formatUnits(lastUsage)}
            </Chip>
          ) : null}
        </Card.Content>
      </Panel>
    );
  };

  return (
    <Screen
      title="Tenants"
      inTabs
      scroll={false}
      overlay={
        data.tenants.length > 0 ? (
          <FAB
            icon="account-plus"
            label="Add tenant"
            style={{ position: 'absolute', right: SCREEN_PADDING, bottom: SCREEN_PADDING }}
            onPress={() => router.push('/tenant/new')}
          />
        ) : null
      }
    >
      <FlatList
        data={visible}
        keyExtractor={item => item.tenant.id}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: SCREEN_PADDING, paddingTop: 4, paddingBottom: FAB_CLEARANCE, gap: 12 }}
        ListHeaderComponent={
          data.tenants.length > 0 ? (
            <View style={{ gap: 12, marginBottom: 4 }}>
              <Searchbar
                placeholder="Search name or notes"
                value={query}
                onChangeText={setQuery}
                style={{ backgroundColor: theme.colors.elevation.level3 }}
              />
              <SegmentedButtons
                value={sort}
                onValueChange={value => setSort(value as SortOption)}
                density="small"
                buttons={[
                  { value: 'recent', label: 'Recent', icon: 'history' },
                  { value: 'name', label: 'A–Z', icon: 'sort-alphabetical-ascending' },
                ]}
              />
            </View>
          ) : null
        }
        ListEmptyComponent={
          data.tenants.length === 0 ? (
            <EmptyState
              icon="account-group-outline"
              title="No tenants yet"
              message="Add a tenant to start tracking their meter readings."
              action={
                <Button mode="contained" icon="account-plus" onPress={() => router.push('/tenant/new')}>
                  Add tenant
                </Button>
              }
            />
          ) : (
            <EmptyState icon="account-search-outline" title="No matches" message={`Nothing matches “${query.trim()}”.`} />
          )
        }
      />
    </Screen>
  );
}
