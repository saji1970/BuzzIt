import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

import {useTheme} from '../context/ThemeContext';
import {useUser, Interest} from '../context/UserContext';

interface InterestFilterProps {
  onFilterChange: (interestIds: string[]) => void;
  selectedInterests: string[];
}

const InterestFilter: React.FC<InterestFilterProps> = ({
  onFilterChange,
  selectedInterests,
}) => {
  const {theme} = useTheme();
  const {interests} = useUser();

  const toggleInterest = (interestId: string) => {
    const isSelected = selectedInterests.includes(interestId);
    if (isSelected) {
      onFilterChange(selectedInterests.filter(id => id !== interestId));
    } else {
      onFilterChange([...selectedInterests, interestId]);
    }
  };

  const clearFilters = () => {
    onFilterChange([]);
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.surface}]}>
      <View style={styles.header}>
        <Text style={[styles.title, {color: theme.colors.text}]}>
          Filter by Interest
        </Text>
        {selectedInterests.length > 0 && (
          <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
            <Text style={[styles.clearText, {color: theme.colors.primary}]}>
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}>
        {interests.map((interest, index) => {
          const isSelected = selectedInterests.includes(interest.id);
          return (
            <Animatable.View
              key={interest.id}
              animation="fadeInRight"
              delay={index * 100}>
              <TouchableOpacity
                style={[
                  styles.interestButton,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.primary
                      : theme.colors.background,
                    borderColor: isSelected
                      ? theme.colors.primary
                      : theme.colors.border,
                  },
                ]}
                onPress={() => toggleInterest(interest.id)}>
                <Text style={styles.interestEmoji}>{interest.emoji}</Text>
                <Text
                  style={[
                    styles.interestName,
                    {
                      color: isSelected
                        ? '#FFFFFF'
                        : theme.colors.text,
                    },
                  ]}>
                  {interest.name}
                </Text>
                {isSelected && (
                  <Icon
                    name="check"
                    size={12}
                    color="#FFFFFF"
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            </Animatable.View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContainer: {
    paddingRight: 15,
  },
  interestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  interestEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  interestName: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 4,
  },
});

export default InterestFilter;
