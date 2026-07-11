import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TouchableWithoutFeedback } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Button } from './ui/Button';

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  date: string; // YYYY-MM-DD
  onSelect: (date: string) => void;
}

export function DatePickerModal({ visible, onClose, date, onSelect }: DatePickerModalProps) {
  const colors = useColors();
  const initialDate = new Date(date || new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const y = currentMonth.getFullYear();
    const m = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onSelect(`${y}-${m}-${d}`);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modal, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
              <View style={styles.header}>
                <Pressable onPress={handlePrevMonth} style={styles.navButton}>
                  <Feather name="chevron-left" size={24} color={colors.foreground} />
                </Pressable>
                <Text style={[styles.title, { color: colors.foreground }]}>
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </Text>
                <Pressable onPress={handleNextMonth} style={styles.navButton}>
                  <Feather name="chevron-right" size={24} color={colors.foreground} />
                </Pressable>
              </View>

              <View style={styles.weekDays}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, i) => (
                  <Text key={i} style={[styles.weekDayText, { color: colors.mutedForeground }]}>
                    {day}
                  </Text>
                ))}
              </View>

              <View style={styles.daysGrid}>
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <View key={`empty-${i}`} style={styles.dayCell} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isSelected = 
                    currentMonth.getFullYear() === initialDate.getFullYear() &&
                    currentMonth.getMonth() === initialDate.getMonth() &&
                    day === initialDate.getDate();

                  return (
                    <Pressable
                      key={day}
                      style={[
                        styles.dayCell,
                        isSelected && { backgroundColor: colors.primary, borderRadius: 20 },
                      ]}
                      onPress={() => handleSelectDay(day)}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          { color: isSelected ? colors.primaryForeground : colors.foreground },
                        ]}
                      >
                        {day}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Button title="Close" onPress={onClose} variant="ghost" style={{ marginTop: 16 }} />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    width: '100%',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  navButton: {
    padding: 8,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
  },
});
