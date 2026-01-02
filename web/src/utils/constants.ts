import { Interest } from '../types/buzz';

// Default interests (from mobile app UserContext.tsx lines 89-103)
export const DEFAULT_INTERESTS: Interest[] = [
  { id: '1', name: 'Technology', category: 'Tech', emoji: '💻' },
  { id: '2', name: 'Music', category: 'Entertainment', emoji: '🎵' },
  { id: '3', name: 'Sports', category: 'Sports', emoji: '⚽' },
  { id: '4', name: 'Fashion', category: 'Lifestyle', emoji: '👗' },
  { id: '5', name: 'Food', category: 'Lifestyle', emoji: '🍕' },
  { id: '6', name: 'Travel', category: 'Lifestyle', emoji: '✈️' },
  { id: '7', name: 'Gaming', category: 'Entertainment', emoji: '🎮' },
  { id: '8', name: 'Art', category: 'Culture', emoji: '🎨' },
  { id: '9', name: 'Fitness', category: 'Health', emoji: '💪' },
  { id: '10', name: 'Movies', category: 'Entertainment', emoji: '🎬' },
  { id: '11', name: 'Books', category: 'Culture', emoji: '📚' },
  { id: '12', name: 'Photography', category: 'Creative', emoji: '📸' },
  { id: '13', name: 'Politics', category: 'Society', emoji: '🏛️' },
];

// Buzz content limits
export const BUZZ_CONTENT_MAX_LENGTH = 500;
export const BUZZ_CONTENT_MIN_LENGTH = 1;

// Media upload limits
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB in bytes
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/mov'];
export const ACCEPTED_MEDIA_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES];

// Poll options limits
export const MIN_POLL_OPTIONS = 2;
export const MAX_POLL_OPTIONS = 10;

// Buzz types
export const BUZZ_TYPES = {
  EVENT: 'event' as const,
  GOSSIP: 'gossip' as const,
  THOUGHT: 'thought' as const,
  POLL: 'poll' as const,
};

// Social platforms
export const SOCIAL_PLATFORMS = {
  FACEBOOK: 'facebook' as const,
  INSTAGRAM: 'instagram' as const,
  SNAPCHAT: 'snapchat' as const,
  TWITTER: 'twitter' as const,
};

// Platform display info
export const PLATFORM_INFO = {
  facebook: {
    name: 'Facebook',
    color: '#1877F2',
    icon: 'facebook',
  },
  instagram: {
    name: 'Instagram',
    color: '#E4405F',
    icon: 'instagram',
  },
  snapchat: {
    name: 'Snapchat',
    color: '#FFFC00',
    icon: 'snapchat',
  },
  twitter: {
    name: 'Twitter',
    color: '#1DA1F2',
    icon: 'twitter',
  },
};
