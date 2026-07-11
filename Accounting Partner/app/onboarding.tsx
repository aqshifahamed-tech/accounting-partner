import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/Button';
import Animated, { FadeIn, FadeInRight, SlideInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const STEPS = [
  {
    title: 'Accounting Partner',
    subtitle: 'Your Private Financial Command Center',
    description: 'Track your income and expenses with absolute precision and clarity.',
    icon: 'briefcase',
  },
  {
    title: '100% Offline & Secure',
    subtitle: 'Your Data Stays Yours',
    description: 'No accounts, no cloud sync, no tracking. Everything is stored locally on your device and can be secured with biometrics.',
    icon: 'shield',
  },
  {
    title: 'Let\'s Get Started',
    subtitle: 'Setup your preferences',
    description: 'You can always change these later in Settings.',
    icon: 'settings',
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const { settings, completeOnboarding, setCurrency, setDateFormat } = useSettings();
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      completeOnboarding();
    }
  };

  const currentStep = STEPS[step];

  return (
    <LinearGradient
      colors={[colors.background, colors.card]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View 
            key={`icon-${step}`}
            entering={FadeIn.duration(500)}
            style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}
          >
            <Feather name={currentStep.icon as any} size={48} color={colors.primary} />
          </Animated.View>

          <Animated.View key={`text-${step}`} entering={SlideInRight.duration(400).springify()}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {currentStep.title}
            </Text>
            <Text style={[styles.subtitle, { color: colors.primary }]}>
              {currentStep.subtitle}
            </Text>
            <Text style={[styles.description, { color: colors.mutedForeground }]}>
              {currentStep.description}
            </Text>

            {step === 2 && (
              <Animated.View entering={FadeIn.delay(300)} style={styles.preferences}>
                <View style={[styles.prefCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.prefLabel, { color: colors.foreground }]}>Currency</Text>
                  <Text style={[styles.prefValue, { color: colors.primary }]}>{settings.currency}</Text>
                </View>
                <View style={[styles.prefCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.prefLabel, { color: colors.foreground }]}>Date Format</Text>
                  <Text style={[styles.prefValue, { color: colors.primary }]}>{settings.dateFormat}</Text>
                </View>
              </Animated.View>
            )}
          </Animated.View>
        </View>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: i === step ? colors.primary : colors.border },
                  i === step && styles.dotActive
                ]}
              />
            ))}
          </View>
          
          <Button
            title={step === STEPS.length - 1 ? 'Enter Dashboard' : 'Continue'}
            onPress={handleNext}
            size="lg"
            style={styles.button}
            icon={step === STEPS.length - 1 ? <Feather name="arrow-right" size={20} color={colors.primaryForeground} /> : undefined}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    marginBottom: 12,
    lineHeight: 40,
  },
  subtitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    marginBottom: 16,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  preferences: {
    marginTop: 32,
    gap: 12,
  },
  prefCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  prefLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
  },
  prefValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
  },
  button: {
    width: '100%',
  },
});
