import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  transactions: 'ap_transactions_v1',
  settings: 'ap_settings_v1',
} as const;

export async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}
