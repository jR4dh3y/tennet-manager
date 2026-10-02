import { AppData, Reading, Tenant } from '../types';
import { dayKey, daysSince } from './format';

/** Readings are due again after this many days. */
export const READING_INTERVAL_DAYS = 30;

/** Oldest first; same-day readings are ordered by meter value. */
export const byDateAsc = (a: Reading, b: Reading) => {
  const ka = dayKey(a.date);
  const kb = dayKey(b.date);
  if (ka !== kb) return ka < kb ? -1 : 1;
  return a.value - b.value;
};

export const byDateDesc = (a: Reading, b: Reading) => byDateAsc(b, a);

export function tenantRate(tenant: Tenant, data: AppData) {
  return tenant.unitRate ?? data.settings.defaultUnitRate;
}

export type ReadingEntry = {
  reading: Reading;
  /** Units consumed since the previous reading, if there is one. */
  usage?: number;
};

/** A tenant's readings, newest first, each paired with the usage since the one before it. */
export function readingHistory(readings: Reading[], tenantId: string): ReadingEntry[] {
  const sorted = readings.filter(r => r.tenantId === tenantId).sort(byDateAsc);
  return sorted
    .map((reading, i) => ({
      reading,
      usage: i > 0 ? Math.max(0, reading.value - sorted[i - 1].value) : undefined,
    }))
    .reverse();
}

export type TenantSummary = {
  tenant: Tenant;
  rate: number;
  latest?: Reading;
  /** Usage between the two most recent readings. */
  lastUsage?: number;
  /** `lastUsage` priced at the tenant's rate. */
  lastBill?: number;
  readingCount: number;
  overdue: boolean;
};

export function summarizeTenants(data: AppData): TenantSummary[] {
  const grouped = new Map<string, Reading[]>();
  for (const reading of data.readings) {
    const list = grouped.get(reading.tenantId);
    if (list) list.push(reading);
    else grouped.set(reading.tenantId, [reading]);
  }

  return data.tenants.map(tenant => {
    const readings = (grouped.get(tenant.id) ?? []).sort(byDateDesc);
    const [latest, previous] = readings;
    const rate = tenantRate(tenant, data);
    const lastUsage = latest && previous ? Math.max(0, latest.value - previous.value) : undefined;
    return {
      tenant,
      rate,
      latest,
      lastUsage,
      lastBill: lastUsage !== undefined ? lastUsage * rate : undefined,
      readingCount: readings.length,
      overdue: !latest || daysSince(latest.date) >= READING_INTERVAL_DAYS,
    };
  });
}

/**
 * Finds the readings that bound a (new or edited) reading on the given day,
 * so the form can enforce a monotonically increasing meter.
 */
export function neighbours(readings: Reading[], tenantId: string, dateIso: string, excludeId?: string) {
  const key = dayKey(dateIso);
  const others = readings
    .filter(r => r.tenantId === tenantId && r.id !== excludeId)
    .sort(byDateAsc);
  const previous = others.filter(r => dayKey(r.date) <= key).at(-1);
  const next = others.find(r => dayKey(r.date) > key);
  return { previous, next };
}
