import { useColorScheme } from 'react-native';
import colors, { ACCENT_PRESETS } from '@/constants/colors';
import { useSettings } from '@/contexts/SettingsContext';

/**
 * Returns the design tokens for the current color scheme, honoring the
 * user's theme preference (light/dark/system) and accent choice from
 * Settings. Falls back to system scheme + default accent when Settings
 * isn't available yet (e.g. during initial load).
 */
export function useColors() {
  const systemScheme = useColorScheme();
  const { settings } = useSettings();

  const resolvedScheme =
    settings.theme === 'system' ? systemScheme : settings.theme;

  const palette =
    resolvedScheme === 'dark' && 'dark' in colors ? colors.dark : colors.light;

  const accentPreset = settings.dynamicColors
    ? ACCENT_PRESETS[settings.accent]
    : undefined;

  return {
    ...palette,
    ...(accentPreset
      ? {
          primary: accentPreset.primary,
          accent: accentPreset.accent,
          gradientStart: accentPreset.gradientStart,
          gradientEnd: accentPreset.gradientEnd,
        }
      : {}),
    radius: colors.radius,
    isDark: resolvedScheme === 'dark',
  };
}
