import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { AppSettings, Transaction } from '@/types';

export interface BackupPayload {
  version: 1;
  exportedAt: string;
  transactions: Transaction[];
  settings: AppSettings;
}

export async function writeAndShareFile(
  fileName: string,
  contents: string,
  mimeType: string,
): Promise<void> {
  const dir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? '';
  const path = `${dir}${fileName}`;
  await FileSystem.writeAsStringAsync(path, contents, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(path, { mimeType, dialogTitle: fileName });
  }
}

export function buildBackupPayload(
  transactions: Transaction[],
  settings: AppSettings,
): BackupPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    transactions,
    settings,
  };
}

export function parseBackupPayload(raw: string): BackupPayload | null {
  try {
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.transactions) || !data.settings) {
      return null;
    }
    return data as BackupPayload;
  } catch {
    return null;
  }
}
