// Feature configuration for Buzz it app
// These settings can be controlled by admin through web panel

const defaultFeatures = {
  // User Management Features
  userRegistration: true,
  userLogin: true,
  mobileVerification: false, // Disabled by default
  emailVerification: false,
  
  // Content Features
  buzzCreation: true,
  buzzLikes: true,
  buzzComments: true,
  buzzShares: true,
  buzzMedia: true,
  
  // Channel Features
  channelCreation: true,
  channelSubscription: true,
  channelContent: true,
  channelLiveStreaming: true,
  
  // Radio Features
  radioCreation: true,
  radioSubscription: true,
  radioStreaming: true,
  radioPlaylist: true,
  
  // Social Features
  userFollowing: true,
  userBlocking: true,
  socialMediaSharing: true,
  userProfiles: true,
  
  // Admin Features
  adminDashboard: true,
  contentModeration: true,
  userModeration: true,
  analytics: true,
  
  // Subscription Features
  premiumChannels: false,
  premiumRadio: false,
  subscriptionRequired: false,
  
  // App Features
  pushNotifications: true,
  darkMode: true,
  themes: true,
  search: true,
  filters: true,
};

// Feature categories for admin panel organization
const featureCategories = {
  userManagement: {
    name: 'User Management',
    features: ['userRegistration', 'userLogin', 'mobileVerification', 'emailVerification'],
    description: 'Control user registration and authentication features'
  },
  content: {
    name: 'Content Features',
    features: ['buzzCreation', 'buzzLikes', 'buzzComments', 'buzzShares', 'buzzMedia'],
    description: 'Control content creation and interaction features'
  },
  channels: {
    name: 'Channel Features',
    features: ['channelCreation', 'channelSubscription', 'channelContent', 'channelLiveStreaming'],
    description: 'Control channel-related features'
  },
  radio: {
    name: 'Radio Features',
    features: ['radioCreation', 'radioSubscription', 'radioStreaming', 'radioPlaylist'],
    description: 'Control radio-related features'
  },
  social: {
    name: 'Social Features',
    features: ['userFollowing', 'userBlocking', 'socialMediaSharing', 'userProfiles'],
    description: 'Control social interaction features'
  },
  subscription: {
    name: 'Subscription Features',
    features: ['premiumChannels', 'premiumRadio', 'subscriptionRequired'],
    description: 'Control premium and subscription features'
  },
  app: {
    name: 'App Features',
    features: ['pushNotifications', 'darkMode', 'themes', 'search', 'filters'],
    description: 'Control general app features'
  }
};

// Feature descriptions for admin panel
const featureDescriptions = {
  userRegistration: 'Allow new users to register accounts',
  userLogin: 'Allow users to login to existing accounts',
  mobileVerification: 'Require mobile number verification for registration',
  emailVerification: 'Require email verification for registration',
  buzzCreation: 'Allow users to create buzzes',
  buzzLikes: 'Allow users to like buzzes',
  buzzComments: 'Allow users to comment on buzzes',
  buzzShares: 'Allow users to share buzzes',
  buzzMedia: 'Allow users to attach media to buzzes',
  channelCreation: 'Allow users to create channels',
  channelSubscription: 'Allow users to subscribe to channels',
  channelContent: 'Allow users to create channel content',
  channelLiveStreaming: 'Allow live streaming in channels',
  radioCreation: 'Allow users to create radio stations',
  radioSubscription: 'Allow users to subscribe to radio stations',
  radioStreaming: 'Allow radio streaming',
  radioPlaylist: 'Allow radio playlist management',
  userFollowing: 'Allow users to follow other users',
  userBlocking: 'Allow users to block other users',
  socialMediaSharing: 'Allow sharing to external social media',
  userProfiles: 'Allow users to customize profiles',
  premiumChannels: 'Enable premium channel subscriptions',
  premiumRadio: 'Enable premium radio subscriptions',
  subscriptionRequired: 'Require subscription for app access',
  pushNotifications: 'Send push notifications to users',
  darkMode: 'Enable dark mode theme',
  themes: 'Allow users to choose themes',
  search: 'Enable search functionality',
  filters: 'Enable content filtering'
};

module.exports = {
  defaultFeatures,
  featureCategories,
  featureDescriptions
};
