export type Reading = {
  id: string;
  tenantId: string;
  /** ISO 8601 timestamp, stored at local noon so the calendar day survives timezone shifts. */
  date: string;
  /** Cumulative meter value. */
  value: number;
};

export type Tenant = {
  id: string;
  name: string;
  /** Cost per unit. Falls back to `Settings.defaultUnitRate` when unset. */
  unitRate?: number;
  notes?: string;
};

export type ThemeMode = 'system' | 'light' | 'dark';

export type Settings = {
  currencySymbol: string;
  defaultUnitRate: number;
  themeMode: ThemeMode;
};

export type AppData = {
  version: 1;
  updatedAt: string;
  tenants: Tenant[];
  readings: Reading[];
  settings: Settings;
};

export const defaultSettings: Settings = {
  currencySymbol: '₹',
  defaultUnitRate: 7,
  themeMode: 'system',
};

export const emptyData = (): AppData => ({
  version: 1,
  updatedAt: new Date().toISOString(),
  tenants: [],
  readings: [],
  settings: { ...defaultSettings },
});
