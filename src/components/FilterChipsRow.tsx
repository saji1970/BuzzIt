import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '../context/ThemeContext';

export interface FilterChip {
  id: string;
  label: string;
  icon?: string;
  emoji?: string;
}

interface FilterChipsRowProps {
  label?: string;
  chips: FilterChip[];
  selectedChipIds: string[];
  onChipPress: (chipId: string) => void;
  onClearAll?: () => void;
}

const FilterChipsRow: React.FC<FilterChipsRowProps> = ({
  label = 'Filter by interest',
  chips,
  selectedChipIds,
  onChipPress,
  onClearAll,
}) => {
  const {theme} = useTheme();

  return (
    <View style={styles.container}>
      {/* Label and Clear Button */}
      <View style={styles.header}>
        <Text style={[styles.label, {color: theme.colors.textSecondary}]}>
          {label}
        </Text>
        {selectedChipIds.length > 0 && onClearAll && (
          <TouchableOpacity onPress={onClearAll} activeOpacity={0.7}>
            <Text style={[styles.clearText, {color: theme.colors.primary}]}>
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Chips Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}>
        {chips.map((chip, index) => {
          const isSelected = selectedChipIds.includes(chip.id);
          return (
            <TouchableOpacity
              key={chip.id}
              style={[
                styles.chip,
                index === 0 && styles.firstChip,
                isSelected
                  ? {backgroundColor: theme.colors.primary}
                  : {
                      backgroundColor: theme.colors.surface,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                    },
              ]}
              onPress={() => onChipPress(chip.id)}
              activeOpacity={0.8}>
              {/* Icon or Emoji */}
              {chip.emoji ? (
                <Text style={styles.emoji}>{chip.emoji}</Text>
              ) : chip.icon ? (
                <Icon
                  name={chip.icon}
                  size={16}
                  color={isSelected ? '#FFFFFF' : theme.colors.primary}
                />
              ) : null}

              {/* Label */}
              <Text
                style={[
                  styles.chipLabel,
                  {color: isSelected ? '#FFFFFF' : theme.colors.text},
                ]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    height: 32,
    gap: 6,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  firstChip: {
    marginLeft: 0,
  },
  emoji: {
    fontSize: 14,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default FilterChipsRow;
