import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable, Platform, Alert, Share } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';
import { useColors } from '@/hooks/useColors';
import { useSettings } from '@/contexts/SettingsContext';
import { useTransactions } from '@/contexts/TransactionsContext';
import { useLock } from '@/contexts/LockContext';
import { ACCENT_PRESETS } from '@/constants/colors';
import { CURRENCIES } from '@/constants/currencies';
import { LANGUAGE_LABELS } from '@/utils/i18n';
import { buildBackupPayload, parseBackupPayload, writeAndShareFile } from '@/utils/backup';
import { transactionsToCsv } from '@/utils/csv';
import { buildReportHtml } from '@/utils/pdf';
import { getCategoryBreakdown } from '@/hooks/useAnalytics';
import { Button } from '@/components/ui/Button';

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { 
    settings, t, setTheme, setAccent, setDynamicColors, setCurrency, 
    setDateFormat, setLanguage, setNotificationsEnabled, setBiometricEnabled, 
    setPin, setAutoLockMinutes, replaceAllSettings 
  } = useSettings();
  const { transactions, replaceAll } = useTransactions();
  const { biometricAvailable } = useLock();

  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const handleExportBackup = async () => {
    try {
      const payload = buildBackupPayload(transactions, settings);
      const fileName = `AP_Backup_${new Date().toISOString().split('T')[0]}.json`;
      await writeAndShareFile(fileName, JSON.stringify(payload, null, 2), 'application/json');
    } catch (e) {
      Alert.alert('Error', 'Failed to export backup');
    }
  };

  const handleRestoreBackup = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (result.canceled || !result.assets[0]) return;
      
      const fileUri = result.assets[0].uri;
      const res = await fetch(fileUri);
      const text = await res.text();
      
      const payload = parseBackupPayload(text);
      if (!payload) {
        Alert.alert('Error', 'Invalid backup file format');
        return;
      }

      Alert.alert(
        'Restore Backup',
        'This will replace all your current data and settings. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Restore', 
            style: 'destructive',
            onPress: async () => {
              await replaceAll(payload.transactions);
              replaceAllSettings(payload.settings);
              Alert.alert('Success', 'Backup restored successfully');
            }
          }
        ]
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to read backup file');
    }
  };

  const handleExportCSV = async () => {
    try {
      const csv = transactionsToCsv(transactions, settings.dateFormat);
      const fileName = `AP_Transactions_${new Date().toISOString().split('T')[0]}.csv`;
      await writeAndShareFile(fileName, csv, 'text/csv');
    } catch (e) {
      Alert.alert('Error', 'Failed to export CSV');
    }
  };

  const handleExportPDF = async () => {
    try {
      const incomeBreakdown = getCategoryBreakdown(transactions, 'income');
      const expenseBreakdown = getCategoryBreakdown(transactions, 'expense');
      
      const totalIncome = incomeBreakdown.reduce((sum, b) => sum + b.total, 0);
      const totalExpense = expenseBreakdown.reduce((sum, b) => sum + b.total, 0);

      const html = buildReportHtml({
        title: 'Accounting Partner - Full Report',
        subtitle: `All time transactions`,
        currency: settings.currency,
        dateFormat: settings.dateFormat,
        totalIncome,
        totalExpense,
        profitLoss: totalIncome - totalExpense,
        transactionCount: transactions.length,
        incomeBreakdown,
        expenseBreakdown,
        transactions,
      });

      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to export PDF');
    }
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Check out Accounting Partner - the premium, 100% offline personal finance app.',
        url: 'https://accountingpartner.app'
      });
    } catch (e) {
      // ignore
    }
  };

  const Section = ({ title, icon, id, children }: any) => {
    const isExpanded = expandedSection === id;
    return (
      <View style={[styles.section, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <Pressable 
          style={styles.sectionHeader} 
          onPress={() => toggleSection(id)}
        >
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.primary + '15' }]}>
              <Feather name={icon} size={18} color={colors.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
          </View>
          <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={colors.mutedForeground} />
        </Pressable>
        {isExpanded && <View style={styles.sectionContent}>{children}</View>}
      </View>
    );
  };

  const SettingRow = ({ label, children }: any) => (
    <View style={styles.settingRow}>
      <Text style={[styles.settingLabel, { color: colors.foreground }]}>{label}</Text>
      {children}
    </View>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100, paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.screenTitle, { color: colors.foreground }]}>{t('settings')}</Text>

      <Section id="appearance" title={t('appearance')} icon="layout">
        <SettingRow label="Theme">
          <View style={styles.segmentedControl}>
            {(['light', 'dark', 'system'] as const).map(theme => (
              <Pressable
                key={theme}
                style={[
                  styles.segment,
                  settings.theme === theme ? { backgroundColor: colors.primary } : { backgroundColor: colors.muted }
                ]}
                onPress={() => setTheme(theme)}
              >
                <Text style={[
                  styles.segmentText,
                  settings.theme === theme ? { color: colors.primaryForeground } : { color: colors.mutedForeground }
                ]}>
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </SettingRow>

        <SettingRow label="Dynamic Colors">
          <Switch 
            value={settings.dynamicColors} 
            onValueChange={setDynamicColors} 
            trackColor={{ true: colors.primary }}
          />
        </SettingRow>

        {settings.dynamicColors && (
          <View style={styles.accentGrid}>
            {Object.entries(ACCENT_PRESETS).map(([key, preset]) => (
              <Pressable
                key={key}
                style={[
                  styles.accentSwatch,
                  { backgroundColor: preset.primary },
                  settings.accent === key && { borderWidth: 2, borderColor: colors.foreground }
                ]}
                onPress={() => setAccent(key as any)}
              >
                {settings.accent === key && <Feather name="check" size={16} color="#fff" />}
              </Pressable>
            ))}
          </View>
        )}
      </Section>

      <Section id="security" title={t('security')} icon="shield">
        {biometricAvailable && (
          <SettingRow label="Biometric Unlock">
            <Switch 
              value={settings.security.biometricEnabled} 
              onValueChange={setBiometricEnabled}
              trackColor={{ true: colors.primary }}
            />
          </SettingRow>
        )}
        <SettingRow label="PIN Protection">
          <Switch 
            value={settings.security.pinEnabled} 
            onValueChange={async (val) => {
              if (val) {
                // In a real app, we'd show a PIN setup modal here. 
                // For now, we'll set a default '1234' just to demonstrate functionality without full nested navigation flows.
                Alert.alert('Setup PIN', 'Defaulting to 1234 for demo purposes.');
                await setPin('1234');
              } else {
                await setPin(null);
              }
            }}
            trackColor={{ true: colors.primary }}
          />
        </SettingRow>
        <SettingRow label="Auto-Lock Timer">
          <View style={styles.segmentedControl}>
            {[
              { l: 'Immed.', v: 0 },
              { l: '1m', v: 1 },
              { l: 'Never', v: -1 }
            ].map(opt => (
              <Pressable
                key={opt.l}
                style={[
                  styles.segment,
                  settings.security.autoLockMinutes === opt.v ? { backgroundColor: colors.primary } : { backgroundColor: colors.muted }
                ]}
                onPress={() => setAutoLockMinutes(opt.v)}
              >
                <Text style={[
                  styles.segmentText,
                  settings.security.autoLockMinutes === opt.v ? { color: colors.primaryForeground } : { color: colors.mutedForeground }
                ]}>
                  {opt.l}
                </Text>
              </Pressable>
            ))}
          </View>
        </SettingRow>
      </Section>

      <Section id="general" title={t('general')} icon="settings">
        <SettingRow label="Currency">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxWidth: 200 }}>
            {CURRENCIES.map(c => (
              <Pressable
                key={c.code}
                style={[
                  styles.segment,
                  settings.currency === c.code ? { backgroundColor: colors.primary } : { backgroundColor: colors.muted },
                  { marginRight: 8, paddingHorizontal: 12 }
                ]}
                onPress={() => setCurrency(c.code)}
              >
                <Text style={[
                  styles.segmentText,
                  settings.currency === c.code ? { color: colors.primaryForeground } : { color: colors.mutedForeground }
                ]}>
                  {c.code}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </SettingRow>
        
        <SettingRow label="Date Format">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxWidth: 200 }}>
            {(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] as const).map(fmt => (
              <Pressable
                key={fmt}
                style={[
                  styles.segment,
                  settings.dateFormat === fmt ? { backgroundColor: colors.primary } : { backgroundColor: colors.muted },
                  { marginRight: 8, paddingHorizontal: 12 }
                ]}
                onPress={() => setDateFormat(fmt)}
              >
                <Text style={[
                  styles.segmentText,
                  settings.dateFormat === fmt ? { color: colors.primaryForeground } : { color: colors.mutedForeground }
                ]}>
                  {fmt}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </SettingRow>

        <SettingRow label="Language">
          <View style={styles.segmentedControl}>
            {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
              <Pressable
                key={code}
                style={[
                  styles.segment,
                  settings.language === code ? { backgroundColor: colors.primary } : { backgroundColor: colors.muted }
                ]}
                onPress={() => setLanguage(code as any)}
              >
                <Text style={[
                  styles.segmentText,
                  settings.language === code ? { color: colors.primaryForeground } : { color: colors.mutedForeground }
                ]}>
                  {code.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
        </SettingRow>
      </Section>

      <Section id="data" title="Data & Export" icon="database">
        <View style={styles.actionGrid}>
          <Button title="Backup Data" icon={<Feather name="download" size={16} color={colors.primary} />} variant="outline" onPress={handleExportBackup} />
          <Button title="Restore Data" icon={<Feather name="upload" size={16} color={colors.primary} />} variant="outline" onPress={handleRestoreBackup} />
          <Button title="Export CSV" icon={<Feather name="file-text" size={16} color={colors.primary} />} variant="outline" onPress={handleExportCSV} />
          <Button title="Export PDF" icon={<Feather name="file" size={16} color={colors.primary} />} variant="outline" onPress={handleExportPDF} />
        </View>
      </Section>

      <Section id="about" title={t('about')} icon="info">
        <View style={styles.aboutContent}>
          <View style={[styles.logoPlaceholder, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.logoText, { color: colors.primary }]}>AP</Text>
          </View>
          <Text style={[styles.appName, { color: colors.foreground }]}>Accounting Partner</Text>
          <Text style={[styles.appVersion, { color: colors.mutedForeground }]}>Version 1.0.0</Text>
          <Text style={[styles.appDeveloper, { color: colors.mutedForeground }]}>Developed by MI. AQSHIF AHAMED</Text>
          
          <View style={styles.aboutActions}>
            <Button title="Share App" variant="secondary" onPress={handleShareApp} style={{ flex: 1 }} />
            <Button title="Rate App" variant="secondary" onPress={() => Linking.openURL('https://accountingpartner.app')} style={{ flex: 1 }} />
          </View>
        </View>
      </Section>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    marginBottom: 24,
  },
  section: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  sectionContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segment: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  segmentText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  accentGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  accentSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionGrid: {
    gap: 12,
    paddingTop: 16,
  },
  aboutContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
  },
  appName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    marginBottom: 4,
  },
  appVersion: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    marginBottom: 8,
  },
  appDeveloper: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    marginBottom: 24,
  },
  aboutActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
});
