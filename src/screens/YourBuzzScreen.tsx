import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';

import {useTheme} from '../context/ThemeContext';
import {useUser, Buzz} from '../context/UserContext';
import {useAuth} from '../context/AuthContext';
import BuzzCard from '../components/BuzzCard';

const {width, height} = Dimensions.get('window');

interface YourBuzzScreenProps {
  visible: boolean;
  onClose: () => void;
}

const YourBuzzScreen: React.FC<YourBuzzScreenProps> = ({visible, onClose}) => {
  const {theme} = useTheme();
  const {user, buzzes, likeBuzz, shareBuzz} = useUser();
  const {user: authUser} = useAuth();
  const [userBuzzes, setUserBuzzes] = useState<Buzz[]>([]);
  const [selectedBuzz, setSelectedBuzz] = useState<Buzz | null>(null);

  useEffect(() => {
    if (visible && user) {
      loadUserBuzzes();
    }
  }, [visible, user, buzzes]);

  const loadUserBuzzes = () => {
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
  };

  const renderBuzz = ({item, index}: {item: Buzz; index: number}) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      style={styles.buzzContainer}>
      <BuzzCard
        buzz={item}
        onLike={() => likeBuzz(item.id)}
        onShare={() => shareBuzz(item.id)}
        onPress={() => setSelectedBuzz(item)}
        isFollowing={false}
      />
    </Animatable.View>
  );

  const renderEmptyState = () => (
    <View style={[styles.emptyState, {backgroundColor: theme.colors.background}]}>
      <Icon name="add-circle-outline" size={80} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyTitle, {color: theme.colors.text}]}>
        No Buzzes Yet!
      </Text>
      <Text style={[styles.emptySubtitle, {color: theme.colors.textSecondary}]}>
        Create your first buzz to share with the world
      </Text>
    </View>
  );

  const currentUser = user || authUser;

  if (!visible) return null;

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
        {/* Header */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              {currentUser?.avatar ? (
                <Image
                  source={{uri: currentUser.avatar}}
                  style={styles.headerAvatar}
                />
              ) : (
                <View style={[styles.headerAvatarPlaceholder, {backgroundColor: theme.colors.accent}]}>
                  <Text style={styles.headerAvatarText}>
                    {currentUser?.displayName?.charAt(0).toUpperCase() || 
                     currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerName}>
                  {currentUser?.displayName || currentUser?.username || 'Your Buzz'}
                </Text>
                <Text style={styles.headerSubtitle}>
                  {userBuzzes.length} {userBuzzes.length === 1 ? 'Buzz' : 'Buzzes'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}>
              <Icon name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Buzz List */}
        <FlatList
          data={userBuzzes}
          renderItem={renderBuzz}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />

        {/* Buzz Detail Modal */}
        {selectedBuzz && (
          <View style={styles.detailModal}>
            <View style={[styles.detailContent, {backgroundColor: theme.colors.surface}]}>
              <TouchableOpacity
                style={styles.detailCloseButton}
                onPress={() => setSelectedBuzz(null)}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <ScrollView style={styles.detailScroll}>
                <BuzzCard
                  buzz={selectedBuzz}
                  onLike={() => {
                    likeBuzz(selectedBuzz.id);
                    setSelectedBuzz(null);
                  }}
                  onShare={() => {
                    shareBuzz(selectedBuzz.id);
                    setSelectedBuzz(null);
                  }}
                  onPress={() => {}}
                  isFollowing={false}
                />
              </ScrollView>
            </View>
          </View>
        )}
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  headerAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  closeButton: {
    padding: 8,
  },
  listContainer: {
    padding: 15,
    paddingBottom: 100,
  },
  buzzContainer: {
    marginBottom: 15,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    minHeight: height * 0.5,
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
    paddingHorizontal: 40,
  },
  detailModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 12,
    padding: 16,
  },
  detailCloseButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 8,
  },
  detailScroll: {
    maxHeight: height * 0.7,
  },
});

export default YourBuzzScreen;

