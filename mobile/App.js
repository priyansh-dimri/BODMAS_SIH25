import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from './src/store/authStore.js';

// Import your two main navigators
import AuthStack from './src/navigation/AuthStack';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import { PaperProvider } from 'react-native-paper'; // Import PaperProvider

export default function App() {
  // Get the authentication state from your global store
  const { isAuthenticated } = useAuthStore();

  return (
    <PaperProvider>
      <NavigationContainer>
        {/* Conditionally render the correct navigator */}
        {isAuthenticated ? <MainTabNavigator /> : <AuthStack />}
      </NavigationContainer>
    </PaperProvider>
  );
}