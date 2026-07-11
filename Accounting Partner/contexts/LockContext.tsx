import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useSettings } from '@/contexts/SettingsContext';

interface LockContextValue {
  isLocked: boolean;
  hasLockConfigured: boolean;
  biometricAvailable: boolean;
  unlockWithBiometrics: () => Promise<boolean>;
  unlockWithPin: (pin: string) => Promise<boolean>;
  lockNow: () => void;
}

const LockContext = createContext<LockContextValue | null>(null);

export function LockProvider({ children }: { children: React.ReactNode }) {
  const { settings, isLoading, verifyPin } = useSettings();
  const [isLocked, setIsLocked] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const backgroundedAt = useRef<number | null>(null);

  const hasLockConfigured =
    settings.security.biometricEnabled || settings.security.pinEnabled;

  useEffect(() => {
    if (Platform.OS === 'web') {
      setBiometricAvailable(false);
      return;
    }
    (async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(hasHardware && isEnrolled);
    })();
  }, []);

  useEffect(() => {
    if (isLoading || initialized) return;
    setIsLocked(hasLockConfigured);
    setInitialized(true);
  }, [isLoading, initialized, hasLockConfigured]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (!hasLockConfigured) return;
      if (state === 'background' || state === 'inactive') {
        backgroundedAt.current = Date.now();
      } else if (state === 'active' && backgroundedAt.current) {
        const elapsedMinutes =
          (Date.now() - backgroundedAt.current) / 60000;
        const threshold = settings.security.autoLockMinutes;
        if (threshold === -1) {
          // never auto-lock on resume
        } else if (elapsedMinutes >= threshold) {
          setIsLocked(true);
        }
        backgroundedAt.current = null;
      }
    });
    return () => sub.remove();
  }, [hasLockConfigured, settings.security.autoLockMinutes]);

  const unlockWithBiometrics = useCallback(async () => {
    if (Platform.OS === 'web') return false;
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Accounting Partner',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });
      if (result.success) {
        setIsLocked(false);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const unlockWithPin = useCallback(
    async (pin: string) => {
      const valid = await verifyPin(pin);
      if (valid) setIsLocked(false);
      return valid;
    },
    [verifyPin],
  );

  const lockNow = useCallback(() => {
    if (hasLockConfigured) setIsLocked(true);
  }, [hasLockConfigured]);

  const value = useMemo<LockContextValue>(
    () => ({
      isLocked: initialized ? isLocked : false,
      hasLockConfigured,
      biometricAvailable,
      unlockWithBiometrics,
      unlockWithPin,
      lockNow,
    }),
    [
      initialized,
      isLocked,
      hasLockConfigured,
      biometricAvailable,
      unlockWithBiometrics,
      unlockWithPin,
      lockNow,
    ],
  );

  return <LockContext.Provider value={value}>{children}</LockContext.Provider>;
}

export function useLock(): LockContextValue {
  const ctx = useContext(LockContext);
  if (!ctx) {
    throw new Error('useLock must be used within LockProvider');
  }
  return ctx;
}
