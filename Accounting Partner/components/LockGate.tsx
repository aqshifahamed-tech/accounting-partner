import React, { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLock } from '@/contexts/LockContext';
import { useColors } from '@/hooks/useColors';
import * as Haptics from 'expo-haptics';

const PIN_LENGTH = 4;

export function LockGate({ children }: { children: React.ReactNode }) {
  const { isLocked, hasLockConfigured, biometricAvailable, unlockWithBiometrics, unlockWithPin } =
    useLock();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [attemptedBiometric, setAttemptedBiometric] = useState(false);

  useEffect(() => {
    if (isLocked && biometricAvailable && !attemptedBiometric && Platform.OS !== 'web') {
      setAttemptedBiometric(true);
      void unlockWithBiometrics();
    }
    if (!isLocked) {
      setAttemptedBiometric(false);
      setPin('');
      setError(false);
    }
  }, [isLocked, biometricAvailable, attemptedBiometric, unlockWithBiometrics]);

  if (!isLocked || !hasLockConfigured) {
    return <>{children}</>;
  }

  const handleDigit = async (digit: string) => {
    if (pin.length >= PIN_LENGTH) return;
    const next = pin + digit;
    setPin(next);
    setError(false);
    if (next.length === PIN_LENGTH) {
      const ok = await unlockWithPin(next);
      if (!ok) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        setError(true);
        setTimeout(() => setPin(''), 300);
      }
    }
  };

  const handleDelete = () => {
    setPin((p) => p.slice(0, -1));
    setError(false);
  };

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={[styles.container, { paddingTop: insets.top + 60 }]}
    >
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Feather name="lock" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Accounting Partner</Text>
        <Text style={styles.subtitle}>
          {biometricAvailable
            ? 'Use biometrics or enter your PIN to continue'
            : 'Enter your PIN to continue'}
        </Text>
      </View>

      <View style={styles.dotsRow}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < pin.length && styles.dotFilled,
              error && styles.dotError,
            ]}
          />
        ))}
      </View>

      <View style={styles.keypad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <Pressable
            key={digit}
            style={({ pressed }) => [
              styles.key,
              pressed && styles.keyPressed,
            ]}
            onPress={() => handleDigit(digit)}
            testID={`pin-key-${digit}`}
          >
            <Text style={styles.keyText}>{digit}</Text>
          </Pressable>
        ))}
        {biometricAvailable && Platform.OS !== 'web' ? (
          <Pressable
            style={({ pressed }) => [
              styles.key,
              pressed && styles.keyPressed,
            ]}
            onPress={() => unlockWithBiometrics()}
            testID="pin-key-biometric"
          >
            <Feather name="smartphone" size={22} color="#FFFFFF" />
          </Pressable>
        ) : (
          <View style={styles.key} />
        )}
        <Pressable
          style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
          onPress={() => handleDigit('0')}
          testID="pin-key-0"
        >
          <Text style={styles.keyText}>0</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
          onPress={handleDelete}
          testID="pin-key-delete"
        >
          <Feather name="delete" size={22} color="#FFFFFF" />
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 44,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  dotFilled: {
    backgroundColor: '#FFFFFF',
  },
  dotError: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FF6B6B',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 264,
    justifyContent: 'space-between',
  },
  key: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  keyPressed: {
    backgroundColor: 'rgba(255,255,255,0.24)',
  },
  keyText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    color: '#FFFFFF',
  },
});
