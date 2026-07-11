import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSettings } from '@/contexts/SettingsContext';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Redirect, Tabs } from 'expo-router';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

function NativeTabLayout() {
  const { t, settings, isLoading } = useSettings();

  if (!isLoading && !settings.hasOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'chart.pie', selected: 'chart.pie.fill' }} />
        <Label>{t('dashboard')}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="income">
        <Icon
          sf={{
            default: 'arrow.down.circle',
            selected: 'arrow.down.circle.fill',
          }}
        />
        <Label>{t('income')}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="expense">
        <Icon
          sf={{
            default: 'arrow.up.circle',
            selected: 'arrow.up.circle.fill',
          }}
        />
        <Label>{t('expense')}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="analytics">
        <Icon
          sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }}
        />
        <Label>{t('analytics')}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} />
        <Label>{t('settings')}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const { t, settings, isLoading } = useSettings();
  const isIOS = Platform.OS === 'ios';
  const isWeb = Platform.OS === 'web';

  if (!isLoading && !settings.hasOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarLabelStyle: { fontFamily: 'Inter_500Medium', fontSize: 11 },
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: isIOS ? 'transparent' : colors.card,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: colors.border,
          elevation: 0,
          height: isWeb ? 84 : 64 + (isIOS ? 20 : 0),
          paddingTop: 8,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={colors.isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.card },
              ]}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('dashboard'),
          tabBarIcon: ({ color }) => (
            <Feather name="pie-chart" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="income"
        options={{
          title: t('income'),
          tabBarIcon: ({ color }) => (
            <Feather name="arrow-down-circle" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="expense"
        options={{
          title: t('expense'),
          tabBarIcon: ({ color }) => (
            <Feather name="arrow-up-circle" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: t('analytics'),
          tabBarIcon: ({ color }) => (
            <Feather name="bar-chart-2" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          tabBarIcon: ({ color }) => (
            <Feather name="settings" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
