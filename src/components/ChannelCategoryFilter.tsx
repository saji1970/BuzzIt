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
import {BuzzChannelCategory} from '../context/BuzzChannelContext';

interface ChannelCategoryFilterProps {
  categories: BuzzChannelCategory[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  selectedType: string;
  onTypeSelect: (type: string) => void;
}

const ChannelCategoryFilter: React.FC<ChannelCategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  selectedType,
  onTypeSelect,
}) => {
  const {theme} = useTheme();

  const contentTypes = [
    {id: 'all', name: 'All', emoji: '🎬', color: theme.colors.primary},
    {id: 'music_video', name: 'Music Videos', emoji: '🎵', color: '#FF6B6B'},
    {id: 'movie', name: 'Movies', emoji: '🎬', color: '#4ECDC4'},
    {id: 'song', name: 'Songs', emoji: '🎶', color: '#45B7D1'},
    {id: 'event_teaser', name: 'Events', emoji: '🎪', color: '#96CEB4'},
    {id: 'voice_snippet', name: 'Voice', emoji: '🎤', color: '#FFEAA7'},
    {id: 'announcement', name: 'Announcements', emoji: '📢', color: '#DDA0DD'},
  ];

  const renderCategoryButton = (category: BuzzChannelCategory, index: number) => {
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

  const renderTypeButton = (type: any, index: number) => {
    const isSelected = selectedType === type.id;
    
    return (
      <Animatable.View
        key={type.id}
        animation="fadeInLeft"
        delay={index * 100}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            {
              backgroundColor: isSelected ? type.color : theme.colors.surface,
              borderColor: isSelected ? type.color : theme.colors.border,
            },
          ]}
          onPress={() => onTypeSelect(type.id)}>
          <Text style={styles.typeEmoji}>{type.emoji}</Text>
          <Text
            style={[
              styles.typeName,
              {
                color: isSelected ? '#FFFFFF' : theme.colors.text,
              },
            ]}>
            {type.name}
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
          Categories
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}>
          {categories.map((category, index) => renderCategoryButton(category, index))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
          Content Types
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}>
          {contentTypes.map((type, index) => renderTypeButton(type, index))}
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
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  typeEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  typeName: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 4,
  },
});

export default ChannelCategoryFilter;
