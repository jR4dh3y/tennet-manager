import 'react-native-get-random-values';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppData, Reading, Tenant, emptyData } from './types';
import { loadData, saveData, exportData as doExport, importData as doImport } from './storage';

type DataContextValue = {
  data: AppData;
  addTenant: (tenant: Omit<Tenant, 'id'>) => void;
  updateTenant: (id: string, changes: Partial<Tenant>) => void;
  deleteTenant: (id: string) => void;
  addReading: (reading: Omit<Reading, 'id'>) => void;
  updateReading: (id: string, changes: Partial<Reading>) => void;
  deleteReading: (id: string) => void;
  updateSettings: (changes: Partial<AppData['settings']>) => void;
  importFromFile: () => Promise<void>;
  exportToFile: (options?: { includeSummary?: boolean }) => Promise<void>;
};

const DataContext = createContext<DataContextValue | undefined>(undefined);

const applyDefaults = (incoming: AppData): AppData => {
  const template = emptyData();
  return {
    ...template,
    ...incoming,
    tenants: incoming.tenants ?? [],
    readings: incoming.readings ?? [],
    settings: {
      ...template.settings,
      ...(incoming.settings ?? {}),
    },
  };
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(emptyData());

  useEffect(() => {
    (async () => {
      const loaded = await loadData();
      setData(applyDefaults(loaded));
    })();
  }, []);

  const persist = async (next: AppData) => {
    const normalized = applyDefaults(next);
    setData(normalized);
    await saveData(normalized);
  };

  const addTenant = (tenant: Omit<Tenant, 'id'>) => {
    const t: Tenant = { id: uuidv4(), ...tenant };
    persist({ ...data, tenants: [...data.tenants, t] });
  };

  const updateTenant = (id: string, changes: Partial<Tenant>) => {
    persist({
      ...data,
      tenants: data.tenants.map(t => (t.id === id ? { ...t, ...changes } : t)),
    });
  };

  const deleteTenant = (id: string) => {
    persist({
      ...data,
      tenants: data.tenants.filter(t => t.id !== id),
      readings: data.readings.filter(r => r.tenantId !== id),
    });
  };

  const addReading = (reading: Omit<Reading, 'id'>) => {
    const r: Reading = { id: uuidv4(), ...reading };
    persist({ ...data, readings: [...data.readings, r] });
  };

  const updateReading = (id: string, changes: Partial<Reading>) => {
    persist({
      ...data,
      readings: data.readings.map(r => (r.id === id ? { ...r, ...changes } : r)),
    });
  };

  const deleteReading = (id: string) => {
    persist({ ...data, readings: data.readings.filter(r => r.id !== id) });
  };

  const importFromFile = async () => {
    const incoming = await doImport();
    if (incoming) setData(applyDefaults(incoming));
  };

  const exportToFile = async (options?: { includeSummary?: boolean }) => {
    await doExport(data, options);
  };

  const updateSettings = (changes: Partial<AppData['settings']>) => {
    persist({ ...data, settings: { ...data.settings, ...changes } });
  };

  const value = useMemo(
    () => ({
      data,
      addTenant,
      updateTenant,
      deleteTenant,
      addReading,
      updateReading,
      deleteReading,
      updateSettings,
      importFromFile,
      exportToFile,
    }),
    [data]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
