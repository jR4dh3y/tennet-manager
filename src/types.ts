export type UUID = string;

export type Reading = {
  id: UUID;
  tenantId: UUID;
  date: string; // ISO 8601
  value: number; // meter reading units
};

export type Tenant = {
  id: UUID;
  name: string;
  unitRate?: number; // cost per unit
  notes?: string;
};

export type Settings = {
  currencySymbol: string; // e.g. ₹, $, £
  defaultUnitRate: number;
  themeMode?: 'light' | 'dark';
};

export type AppData = {
  version: 1;
  updatedAt: string;
  tenants: Tenant[];
  readings: Reading[];
  settings: Settings;
};

export const emptyData = (): AppData => ({
  version: 1,
  updatedAt: new Date().toISOString(),
  tenants: [],
  readings: [],
  settings: {
    currencySymbol: '₹',
    defaultUnitRate: 7,
    themeMode: 'light',
  },
});
