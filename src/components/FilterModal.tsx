import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '../context/ThemeContext';

const {width} = Dimensions.get('window');

export interface Interest {
  id: string;
  name: string;
  emoji: string;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  interests: Interest[];
  selectedInterestIds: string[];
  onToggleInterest: (interestId: string) => void;
  onClearAll: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  interests,
  selectedInterestIds,
  onToggleInterest,
  onClearAll,
}) => {
  const {theme} = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, {backgroundColor: theme.colors.surface}]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, {color: theme.colors.text}]}>Filter by Interests</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Clear All Button */}
          {selectedInterestIds.length > 0 && (
            <TouchableOpacity
              style={[styles.clearButton, {backgroundColor: theme.colors.primary + '20'}]}
              onPress={onClearAll}>
              <Icon name="clear-all" size={20} color={theme.colors.primary} />
              <Text style={[styles.clearButtonText, {color: theme.colors.primary}]}>
                Clear All ({selectedInterestIds.length})
              </Text>
            </TouchableOpacity>
          )}

          {/* Interests List */}
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.interestsContainer}>
              {interests.map((interest) => {
                const isSelected = selectedInterestIds.includes(interest.id);
                return (
                  <TouchableOpacity
                    key={interest.id}
                    style={[
                      styles.interestChip,
                      {
                        backgroundColor: isSelected
                          ? theme.colors.primary
                          : theme.colors.border + '40',
                        borderColor: isSelected ? theme.colors.primary : 'transparent',
                      },
                    ]}
                    onPress={() => onToggleInterest(interest.id)}
                    activeOpacity={0.7}>
                    <Text style={styles.interestEmoji}>{interest.emoji}</Text>
                    <Text
                      style={[
                        styles.interestText,
                        {color: isSelected ? '#FFFFFF' : theme.colors.text},
                      ]}>
                      {interest.name}
                    </Text>
                    {isSelected && (
                      <Icon name="check-circle" size={18} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Apply Button */}
          <TouchableOpacity
            style={[styles.applyButton, {backgroundColor: theme.colors.primary}]}
            onPress={onClose}>
            <Text style={styles.applyButtonText}>
              Apply {selectedInterestIds.length > 0 ? `(${selectedInterestIds.length})` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
    gap: 8,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    maxHeight: 400,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 8,
  },
  interestEmoji: {
    fontSize: 16,
  },
  interestText: {
    fontSize: 14,
    fontWeight: '600',
  },
  applyButton: {
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 10,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FilterModal;
