import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { Share } from 'react-native';
import { AppData, emptyData } from './types';

const STORAGE_KEY = 'tennet:data';

let seedPromise: Promise<void> | null = null;

async function seedStorageWithDefaults() {
  const existing = await AsyncStorage.getItem(STORAGE_KEY);
  if (existing) return;
  const initial = emptyData();
  const seeded = { ...initial, updatedAt: new Date().toISOString() } as AppData;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
}

async function ensureSeeded() {
  if (!seedPromise) {
    seedPromise = seedStorageWithDefaults();
  }
  try {
    await seedPromise;
  } catch (error) {
    seedPromise = null;
    throw error;
  }
}

export async function ensureDataFile() {
  await ensureSeeded();
}

export async function loadData(): Promise<AppData> {
  await ensureSeeded();
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return emptyData();
  }
  try {
    const parsed = JSON.parse(stored) as AppData;
    return parsed;
  } catch (error) {
    return emptyData();
  }
}

export async function saveData(data: AppData) {
  const updated = { ...data, updatedAt: new Date().toISOString() } as AppData;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export async function exportData(data: AppData, options?: { includeSummary?: boolean }) {
  const serialized = JSON.stringify(data, null, 2);
  const summary = options?.includeSummary
    ? `TentTenn Snapshot\n• Tenants: ${data.tenants.length}\n• Readings: ${data.readings.length}\n• Updated: ${data.updatedAt ? new Date(data.updatedAt).toLocaleString() : 'never'}\n\n`
    : '';
  await Share.share({ message: `${summary}${serialized}` });
}

export async function importData(): Promise<AppData | null> {
  const res = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (res.canceled || !res.assets?.length) {
    return null;
  }

  const fileUri = res.assets[0].uri;
  const response = await fetch(fileUri);
  if (!response.ok) {
    throw new Error('Unable to read selected file');
  }
  const content = await response.text();

  const parsed = JSON.parse(content) as AppData;
  if (!parsed || typeof parsed !== 'object' || !('version' in parsed)) {
    throw new Error('Invalid data file');
  }

  await saveData(parsed);
  return parsed;
}
