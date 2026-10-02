import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { AppData, Reading, Settings, Tenant, ThemeMode, defaultSettings, emptyData } from './types';

const STORAGE_KEY = 'tennet:data';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const finiteNumber = (value: unknown): number | undefined => {
  const n = typeof value === 'string' ? Number(value) : value;
  return typeof n === 'number' && Number.isFinite(n) ? n : undefined;
};

const validDate = (value: unknown): string | undefined =>
  typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : undefined;

function parseTenant(raw: unknown): Tenant | null {
  if (!isRecord(raw) || typeof raw.id !== 'string' || typeof raw.name !== 'string') return null;
  const unitRate = finiteNumber(raw.unitRate);
  const notes = typeof raw.notes === 'string' && raw.notes.trim() ? raw.notes.trim() : undefined;
  return { id: raw.id, name: raw.name.trim() || 'Unnamed tenant', unitRate, notes };
}

function parseReading(raw: unknown, tenantIds: Set<string>): Reading | null {
  if (!isRecord(raw) || typeof raw.id !== 'string' || typeof raw.tenantId !== 'string') return null;
  const value = finiteNumber(raw.value);
  const date = validDate(raw.date);
  if (value === undefined || !date || !tenantIds.has(raw.tenantId)) return null;
  return { id: raw.id, tenantId: raw.tenantId, date, value };
}

function parseSettings(raw: unknown): Settings {
  if (!isRecord(raw)) return { ...defaultSettings };
  const themeModes: ThemeMode[] = ['system', 'light', 'dark'];
  return {
    currencySymbol:
      typeof raw.currencySymbol === 'string' && raw.currencySymbol.trim()
        ? raw.currencySymbol.trim()
        : defaultSettings.currencySymbol,
    defaultUnitRate: finiteNumber(raw.defaultUnitRate) ?? defaultSettings.defaultUnitRate,
    themeMode: themeModes.includes(raw.themeMode as ThemeMode)
      ? (raw.themeMode as ThemeMode)
      : defaultSettings.themeMode,
  };
}

/** Validates and normalises untrusted data (storage or an imported backup). */
export function parseAppData(raw: unknown): AppData {
  if (!isRecord(raw) || !Array.isArray(raw.tenants) || !Array.isArray(raw.readings)) {
    throw new Error('This file is not a Tennet Manager backup.');
  }
  const tenants = raw.tenants.map(parseTenant).filter((t): t is Tenant => t !== null);
  const tenantIds = new Set(tenants.map(t => t.id));
  const readings = raw.readings
    .map(r => parseReading(r, tenantIds))
    .filter((r): r is Reading => r !== null);

  return {
    version: 1,
    updatedAt: validDate(raw.updatedAt) ?? new Date().toISOString(),
    tenants,
    readings,
    settings: parseSettings(raw.settings),
  };
}

export async function loadData(): Promise<AppData> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (!stored) return emptyData();
  try {
    return parseAppData(JSON.parse(stored));
  } catch {
    return emptyData();
  }
}

export async function saveData(data: AppData) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Writes a JSON backup and hands it to the system share sheet (or downloads it on web). */
export async function exportBackup(data: AppData) {
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `tennet-backup-${stamp}.json`;
  const json = JSON.stringify(data, null, 2);

  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    return;
  }

  const file = new File(Paths.cache, filename);
  if (file.exists) file.delete();
  file.create();
  file.write(json);

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device.');
  }
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Save Tennet Manager backup',
    UTI: 'public.json',
  });
}

/** Lets the user pick a backup file. Resolves `null` if the picker was dismissed. */
export async function pickBackup(): Promise<AppData | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled || !result.assets.length) return null;

  const response = await fetch(result.assets[0].uri);
  if (!response.ok) throw new Error('Unable to read the selected file.');

  let raw: unknown;
  try {
    raw = JSON.parse(await response.text());
  } catch {
    throw new Error('The selected file is not valid JSON.');
  }
  return parseAppData(raw);
}
