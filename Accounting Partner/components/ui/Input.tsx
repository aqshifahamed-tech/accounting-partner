import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, Platform } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  ({ label, error, leftIcon, style, ...props }, ref) => {
    const colors = useColors();

    return (
      <View style={styles.container}>
        {label && (
          <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
        )}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.card,
              borderColor: error ? colors.destructive : colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <TextInput
            ref={ref}
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.input,
              { color: colors.foreground },
              style,
            ]}
            {...props}
          />
        </View>
        {error && (
          <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  leftIcon: {
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    paddingHorizontal: 16,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  error: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
