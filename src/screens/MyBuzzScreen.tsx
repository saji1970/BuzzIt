import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import {useTheme} from '../context/ThemeContext';
import {useUser, Buzz} from '../context/UserContext';
import {useAuth} from '../context/AuthContext';
import BuzzCard from '../components/BuzzCard';
import ScreenContainer from '../components/ScreenContainer';
import BuzzDetailScreen from './BuzzDetailScreen';

const MyBuzzScreen: React.FC = () => {
  const navigation = useNavigation();
  const {theme} = useTheme();
  const {user, buzzes, likeBuzz, shareBuzz} = useUser();
  const {user: authUser} = useAuth();
  const [userBuzzes, setUserBuzzes] = useState<Buzz[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBuzz, setSelectedBuzz] = useState<Buzz | null>(null);

  const loadUserBuzzes = useCallback(() => {
    try {
      const currentUserId = user?.id || authUser?.id;
      if (!currentUserId || !buzzes) {
        setUserBuzzes([]);
        return;
      }

      // Get all buzzes from the current user
      const myBuzzes = buzzes.filter(buzz => buzz.userId === currentUserId);
      
      // Sort by creation date (newest first)
      const sortedBuzzes = myBuzzes.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      setUserBuzzes(sortedBuzzes);
      console.log('Loaded user buzzes:', sortedBuzzes.length);
    } catch (error) {
      console.error('Error loading user buzzes:', error);
      setUserBuzzes([]);
    }
  }, [user, authUser, buzzes]);

  useEffect(() => {
    loadUserBuzzes();
  }, [loadUserBuzzes]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadUserBuzzes();
    }, [loadUserBuzzes])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadUserBuzzes();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleBuzzPress = (buzz: Buzz) => {
    setSelectedBuzz(buzz);
  };

  const handleCloseDetail = () => {
    setSelectedBuzz(null);
  };

  const renderBuzz = ({item, index}: {item: Buzz; index: number}) => (
    <View style={styles.buzzContainer}>
      <BuzzCard
        buzz={item}
        onLike={() => likeBuzz(item.id)}
        onShare={() => shareBuzz(item.id)}
        onPress={() => handleBuzzPress(item)}
        isFollowing={false}
      />
    </View>
  );

  const renderEmptyState = () => {
    const currentUser = user || authUser;
    return (
      <View style={[styles.emptyState, {backgroundColor: theme.colors.background}]}>
        <Icon name="add-circle-outline" size={80} color={theme.colors.textSecondary} />
        <Text style={[styles.emptyTitle, {color: theme.colors.text}]}>
          No Buzzes Yet!
        </Text>
        <Text style={[styles.emptySubtitle, {color: theme.colors.textSecondary}]}>
          Create your first buzz to share with the world
        </Text>
        <TouchableOpacity
          style={[styles.createButton, {backgroundColor: theme.colors.primary}]}
          onPress={() => navigation.navigate('Create' as never)}>
          <Icon name="add" size={24} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Create Buzz</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const currentUser = user || authUser;

  return (
    <ScreenContainer
      title="My Buzz"
      subtitle={`${userBuzzes.length} ${userBuzzes.length === 1 ? 'Buzz' : 'Buzzes'}`}
      floatingHeader={true}>
      <FlatList
        data={userBuzzes}
        renderItem={renderBuzz}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContainer,
          userBuzzes.length === 0 && styles.emptyListContainer,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      />

      {/* Buzz Detail Modal */}
      {selectedBuzz && (
        <BuzzDetailScreen
          buzz={selectedBuzz}
          onClose={handleCloseDetail}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 15,
    paddingBottom: 100,
  },
  emptyListContainer: {
    flex: 1,
  },
  buzzContainer: {
    marginBottom: 15,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyBuzzScreen;

