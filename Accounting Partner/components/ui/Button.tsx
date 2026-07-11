import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  icon?: React.ReactNode;
}

export function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const colors = useColors();

  const getBgColor = (pressed: boolean) => {
    if (disabled) return colors.muted;
    switch (variant) {
      case 'primary': return pressed ? colors.primary + 'E6' : colors.primary;
      case 'secondary': return pressed ? colors.secondary + 'E6' : colors.secondary;
      case 'destructive': return pressed ? colors.destructive + 'E6' : colors.destructive;
      case 'outline': return pressed ? colors.muted : 'transparent';
      case 'ghost': return pressed ? colors.muted : 'transparent';
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.mutedForeground;
    switch (variant) {
      case 'primary': return colors.primaryForeground;
      case 'secondary': return colors.secondaryForeground;
      case 'destructive': return colors.destructiveForeground;
      case 'outline': return colors.primary;
      case 'ghost': return colors.primary;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        { backgroundColor: getBgColor(pressed) },
        variant === 'outline' && { borderWidth: 1, borderColor: colors.border },
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={[styles.text, styles[`text_${size}`], { color: getTextColor() }, textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  sm: { paddingVertical: 8, paddingHorizontal: 16 },
  md: { paddingVertical: 14, paddingHorizontal: 24 },
  lg: { paddingVertical: 18, paddingHorizontal: 32 },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontFamily: 'Inter_600SemiBold',
  },
  text_sm: { fontSize: 13 },
  text_md: { fontSize: 15 },
  text_lg: { fontSize: 17 },
});
