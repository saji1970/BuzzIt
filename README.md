# Buzz it 🔥

A vibrant social media app for creating buzz around events, promotions, and gossip. Built with React Native and TypeScript.

## Features

- **Create Buzz**: Share your thoughts with images and videos
- **Interest-Based Feed**: Get personalized content based on your interests
- **Social Sharing**: Share your buzzes to other social media platforms
- **Customizable Themes**: Choose from multiple vibrant UI themes
- **User Profiles**: Create and manage your profile with interests
- **Real-time Interactions**: Like, comment, and share buzzes

## Screenshots

The app features a modern, peppy UI with:
- Gradient headers and vibrant colors
- Smooth animations and transitions
- Card-based layout for buzzes
- Customizable theme system
- Intuitive navigation

## Installation

1. **Prerequisites**
   - Node.js (v16 or higher)
   - React Native CLI
   - Android Studio (for Android)
   - Xcode (for iOS)

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Run the App**
   ```bash
   # For Android
   npm run android
   
   # For iOS
   npm run ios
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── BuzzCard.tsx    # Individual buzz display
│   └── InterestFilter.tsx # Interest filtering
├── context/            # React Context providers
│   ├── ThemeContext.tsx # Theme management
│   └── UserContext.tsx  # User state management
└── screens/            # Main app screens
    ├── HomeScreen.tsx  # Feed screen
    ├── CreateBuzzScreen.tsx # Create buzz
    ├── ProfileScreen.tsx # User profile
    └── SettingsScreen.tsx # App settings
```

## Key Features

### 🎨 Theme System
- 5 different themes: Default, Neon, Sunset, Ocean, Forest
- Persistent theme selection
- Dynamic color switching

### 👤 User Management
- Profile creation and editing
- Interest-based content filtering
- User statistics tracking

### 📱 Social Features
- Create buzzes with text, images, and videos
- Interest-based content discovery
- Social media sharing integration
- Like and share functionality

### 🔧 Technical Features
- TypeScript for type safety
- React Navigation for routing
- AsyncStorage for data persistence
- React Native Reanimated for animations
- Image picker for media selection

## Dependencies

- **Navigation**: React Navigation
- **UI**: React Native Elements, React Native Paper
- **Media**: React Native Image Picker, React Native Video
- **Sharing**: React Native Share
- **Storage**: AsyncStorage
- **Animations**: React Native Animatable, React Native Reanimated
- **Gradients**: React Native Linear Gradient

## Getting Started

1. Create your profile and select your interests
2. Start creating buzzes with text, images, or videos
3. Customize your app theme in Settings
4. Share your buzzes to other social platforms
5. Discover content based on your interests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
