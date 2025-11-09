import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';

import {useTheme} from '../context/ThemeContext';
import {RadioChannelCategory} from '../context/RadioChannelContext';

interface RadioCategoryFilterProps {
  categories: RadioChannelCategory[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  selectedFilter: string;
  onFilterSelect: (filter: string) => void;
}

const RadioCategoryFilter: React.FC<RadioCategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  selectedFilter,
  onFilterSelect,
}) => {
  const {theme} = useTheme();

  const filterOptions = [
    {id: 'all', name: 'All', icon: 'radio', color: theme.colors.primary},
    {id: 'live', name: 'Live', icon: 'fiber-manual-record', color: '#2ECC71'},
    {id: 'scheduled', name: 'Scheduled', icon: 'schedule', color: '#F39C12'},
  ];

  const renderCategoryButton = (category: RadioChannelCategory, index: number) => {
    const isSelected = selectedCategory === category.id;
    
    return (
      <Animatable.View
        key={category.id}
        animation="fadeInRight"
        delay={index * 100}>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            {
              backgroundColor: isSelected ? category.color : theme.colors.surface,
              borderColor: isSelected ? category.color : theme.colors.border,
            },
          ]}
          onPress={() => onCategorySelect(category.id)}>
          <Text style={styles.categoryEmoji}>{category.emoji}</Text>
          <Text
            style={[
              styles.categoryName,
              {
                color: isSelected ? '#FFFFFF' : theme.colors.text,
              },
            ]}>
            {category.name}
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
  };

  const renderFilterButton = (filter: any, index: number) => {
    const isSelected = selectedFilter === filter.id;
    
    return (
      <Animatable.View
        key={filter.id}
        animation="fadeInLeft"
        delay={index * 100}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: isSelected ? filter.color : theme.colors.surface,
              borderColor: isSelected ? filter.color : theme.colors.border,
            },
          ]}
          onPress={() => onFilterSelect(filter.id)}>
          <Icon
            name={filter.icon}
            size={16}
            color={isSelected ? '#FFFFFF' : filter.color}
          />
          <Text
            style={[
              styles.filterName,
              {
                color: isSelected ? '#FFFFFF' : theme.colors.text,
              },
            ]}>
            {filter.name}
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
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.surface}]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
          Filter by Status
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}>
          {filterOptions.map((filter, index) => renderFilterButton(filter, index))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
          Categories
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}>
          {categories.map((category, index) => renderCategoryButton(category, index))}
        </ScrollView>
      </View>
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
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  scrollContainer: {
    paddingRight: 15,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  filterName: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  checkIcon: {
    marginLeft: 4,
  },
});

export default RadioCategoryFilter;
