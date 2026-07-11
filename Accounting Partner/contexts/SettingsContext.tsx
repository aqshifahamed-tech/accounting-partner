import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as Crypto from 'expo-crypto';
import type {
  AccentKey,
  AppSettings,
  DateFormatKey,
  LanguageKey,
  ThemeMode,
} from '@/types';
import { readJSON, STORAGE_KEYS, writeJSON } from '@/utils/storage';
import { translate } from '@/utils/i18n';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  accent: 'ocean',
  dynamicColors: true,
  currency: 'INR',
  dateFormat: 'DD/MM/YYYY',
  language: 'en',
  notificationsEnabled: false,
  hasOnboarded: false,
  security: {
    biometricEnabled: false,
    pinEnabled: false,
    pinHash: null,
    autoLockMinutes: 0,
  },
};

interface SettingsContextValue {
  settings: AppSettings;
  isLoading: boolean;
  setTheme: (theme: ThemeMode) => void;
  setAccent: (accent: AccentKey) => void;
  setDynamicColors: (value: boolean) => void;
  setCurrency: (code: string) => void;
  setDateFormat: (format: DateFormatKey) => void;
  setLanguage: (language: LanguageKey) => void;
  setNotificationsEnabled: (value: boolean) => void;
  setBiometricEnabled: (value: boolean) => Promise<void>;
  setPin: (pin: string | null) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  setAutoLockMinutes: (minutes: number) => void;
  completeOnboarding: () => void;
  t: (key: string) => string;
  replaceAllSettings: (next: AppSettings) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await readJSON<AppSettings>(
        STORAGE_KEYS.settings,
        DEFAULT_SETTINGS,
      );
      setSettings({
        ...DEFAULT_SETTINGS,
        ...stored,
        security: { ...DEFAULT_SETTINGS.security, ...stored.security },
      });
      setIsLoading(false);
    })();
  }, []);

  const persist = useCallback((next: AppSettings) => {
    setSettings(next);
    void writeJSON(STORAGE_KEYS.settings, next);
  }, []);

  const setTheme = useCallback(
    (theme: ThemeMode) => persist({ ...settings, theme }),
    [settings, persist],
  );
  const setAccent = useCallback(
    (accent: AccentKey) => persist({ ...settings, accent }),
    [settings, persist],
  );
  const setDynamicColors = useCallback(
    (dynamicColors: boolean) => persist({ ...settings, dynamicColors }),
    [settings, persist],
  );
  const setCurrency = useCallback(
    (currency: string) => persist({ ...settings, currency }),
    [settings, persist],
  );
  const setDateFormat = useCallback(
    (dateFormat: DateFormatKey) => persist({ ...settings, dateFormat }),
    [settings, persist],
  );
  const setLanguage = useCallback(
    (language: LanguageKey) => persist({ ...settings, language }),
    [settings, persist],
  );
  const setNotificationsEnabled = useCallback(
    (notificationsEnabled: boolean) =>
      persist({ ...settings, notificationsEnabled }),
    [settings, persist],
  );
  const setAutoLockMinutes = useCallback(
    (autoLockMinutes: number) =>
      persist({
        ...settings,
        security: { ...settings.security, autoLockMinutes },
      }),
    [settings, persist],
  );
  const setBiometricEnabled = useCallback(
    async (biometricEnabled: boolean) => {
      persist({
        ...settings,
        security: { ...settings.security, biometricEnabled },
      });
    },
    [settings, persist],
  );
  const setPin = useCallback(
    async (pin: string | null) => {
      const pinHash = pin
        ? await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            pin,
          )
        : null;
      persist({
        ...settings,
        security: {
          ...settings.security,
          pinHash,
          pinEnabled: !!pinHash,
        },
      });
    },
    [settings, persist],
  );
  const verifyPin = useCallback(
    async (pin: string) => {
      if (!settings.security.pinHash) return false;
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        pin,
      );
      return hash === settings.security.pinHash;
    },
    [settings.security.pinHash],
  );
  const completeOnboarding = useCallback(
    () => persist({ ...settings, hasOnboarded: true }),
    [settings, persist],
  );
  const replaceAllSettings = useCallback(
    (next: AppSettings) => persist(next),
    [persist],
  );

  const t = useCallback(
    (key: string) => translate(settings.language, key),
    [settings.language],
  );

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      isLoading,
      setTheme,
      setAccent,
      setDynamicColors,
      setCurrency,
      setDateFormat,
      setLanguage,
      setNotificationsEnabled,
      setBiometricEnabled,
      setPin,
      verifyPin,
      setAutoLockMinutes,
      completeOnboarding,
      t,
      replaceAllSettings,
    }),
    [
      settings,
      isLoading,
      setTheme,
      setAccent,
      setDynamicColors,
      setCurrency,
      setDateFormat,
      setLanguage,
      setNotificationsEnabled,
      setBiometricEnabled,
      setPin,
      verifyPin,
      setAutoLockMinutes,
      completeOnboarding,
      t,
      replaceAllSettings,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return ctx;
}

export { DEFAULT_SETTINGS };
