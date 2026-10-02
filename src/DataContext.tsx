import { randomUUID } from 'expo-crypto';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { loadData, saveData } from './storage';
import { AppData, Reading, Settings, Tenant, emptyData } from './types';

type DataContextValue = {
  data: AppData;
  ready: boolean;
  addTenant: (tenant: Omit<Tenant, 'id'>) => string;
  updateTenant: (id: string, changes: Partial<Omit<Tenant, 'id'>>) => void;
  deleteTenant: (id: string) => void;
  addReading: (reading: Omit<Reading, 'id'>) => string;
  updateReading: (id: string, changes: Partial<Omit<Reading, 'id'>>) => void;
  deleteReading: (id: string) => void;
  updateSettings: (changes: Partial<Settings>) => void;
  replaceData: (next: AppData) => void;
};

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData);
  const [ready, setReady] = useState(false);
  // Skip persisting the state we just loaded from disk.
  const dirty = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadData()
      .catch(() => emptyData())
      .then(loaded => {
        if (cancelled) return;
        setData(loaded);
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !dirty.current) return;
    saveData(data).catch(error => console.warn('Failed to save data', error));
  }, [data, ready]);

  // Functional updates so rapid successive mutations never overwrite each other.
  const mutate = useCallback((fn: (prev: AppData) => Omit<AppData, 'updatedAt'>) => {
    dirty.current = true;
    setData(prev => ({ ...fn(prev), updatedAt: new Date().toISOString() }));
  }, []);

  const value = useMemo<DataContextValue>(
    () => ({
      data,
      ready,
      addTenant: tenant => {
        const id = randomUUID();
        mutate(prev => ({ ...prev, tenants: [...prev.tenants, { ...tenant, id }] }));
        return id;
      },
      updateTenant: (id, changes) =>
        mutate(prev => ({
          ...prev,
          tenants: prev.tenants.map(t => (t.id === id ? { ...t, ...changes } : t)),
        })),
      deleteTenant: id =>
        mutate(prev => ({
          ...prev,
          tenants: prev.tenants.filter(t => t.id !== id),
          readings: prev.readings.filter(r => r.tenantId !== id),
        })),
      addReading: reading => {
        const id = randomUUID();
        mutate(prev => ({ ...prev, readings: [...prev.readings, { ...reading, id }] }));
        return id;
      },
      updateReading: (id, changes) =>
        mutate(prev => ({
          ...prev,
          readings: prev.readings.map(r => (r.id === id ? { ...r, ...changes } : r)),
        })),
      deleteReading: id =>
        mutate(prev => ({ ...prev, readings: prev.readings.filter(r => r.id !== id) })),
      updateSettings: changes =>
        mutate(prev => ({ ...prev, settings: { ...prev.settings, ...changes } })),
      replaceData: next => mutate(() => next),
    }),
    [data, ready, mutate]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
