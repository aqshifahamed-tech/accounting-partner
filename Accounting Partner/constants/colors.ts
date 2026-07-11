/**
 * Accounting Partner design tokens.
 * Brand: deep navy blue -> emerald green, matching the app logo.
 */

const colors = {
  light: {
    text: '#0B1E3D',
    tint: '#1E4FD8',

    background: '#F4F6FB',
    foreground: '#0B1E3D',

    card: '#FFFFFF',
    cardForeground: '#0B1E3D',

    primary: '#1E4FD8',
    primaryForeground: '#FFFFFF',

    secondary: '#EAF0FF',
    secondaryForeground: '#0B1E3D',

    muted: '#EEF1F6',
    mutedForeground: '#6B7684',

    accent: '#00B37E',
    accentForeground: '#FFFFFF',

    destructive: '#FF4D4F',
    destructiveForeground: '#FFFFFF',

    border: '#E3E8F0',
    input: '#E3E8F0',

    income: '#00B37E',
    expense: '#FF4D4F',

    gradientStart: '#1E4FD8',
    gradientEnd: '#00B37E',
  },

  dark: {
    text: '#EAF0FF',
    tint: '#5C8CFF',

    background: '#070E1F',
    foreground: '#EAF0FF',

    card: '#101B33',
    cardForeground: '#EAF0FF',

    primary: '#5C8CFF',
    primaryForeground: '#04122C',

    secondary: '#182444',
    secondaryForeground: '#EAF0FF',

    muted: '#141F3A',
    mutedForeground: '#8C9AB8',

    accent: '#22D3A6',
    accentForeground: '#04122C',

    destructive: '#FF6B6B',
    destructiveForeground: '#FFFFFF',

    border: '#1E2A4A',
    input: '#1E2A4A',

    income: '#22D3A6',
    expense: '#FF6B6B',

    gradientStart: '#12306E',
    gradientEnd: '#0B4B3C',
  },

  radius: 18,
};

export const ACCENT_PRESETS: Record<
  string,
  { primary: string; accent: string; gradientStart: string; gradientEnd: string }
> = {
  ocean: {
    primary: '#1E4FD8',
    accent: '#00B37E',
    gradientStart: '#1E4FD8',
    gradientEnd: '#00B37E',
  },
  emerald: {
    primary: '#00875F',
    accent: '#4ADE80',
    gradientStart: '#00875F',
    gradientEnd: '#4ADE80',
  },
  violet: {
    primary: '#6D3EE0',
    accent: '#B98CFF',
    gradientStart: '#6D3EE0',
    gradientEnd: '#B98CFF',
  },
  sunset: {
    primary: '#E0563E',
    accent: '#FFB020',
    gradientStart: '#E0563E',
    gradientEnd: '#FFB020',
  },
  royal: {
    primary: '#0B2E6B',
    accent: '#D4AF37',
    gradientStart: '#0B2E6B',
    gradientEnd: '#D4AF37',
  },
};

export default colors;
