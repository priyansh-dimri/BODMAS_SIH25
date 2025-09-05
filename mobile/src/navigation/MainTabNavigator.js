import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import SafetyScreen from '../screens/auth/SafetyScreen';


const PlaceholderScreen = () => <View style={{ flex: 1, backgroundColor: '#121212' }} />;

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Safety"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#ffffff', // Active icon and label color (green)
        tabBarInactiveTintColor: '#8E8E93', // Inactive icon and label color (grey)
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={PlaceholderScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.activeTab]}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={focused ? '#121212' : color} />
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Map" 
        component={PlaceholderScreen} 
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.activeTab]}>
              <Ionicons name={focused ? 'map' : 'map-outline'} size={size} color={focused ? '#121212' : color} />
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Safety" 
        component={SafetyScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.activeTab]}>
              <MaterialCommunityIcons 
                name="shield-check" 
                size={30} 
                color={focused ? '#121212' : '#8E8E93'} 
              />
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={PlaceholderScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.activeTab]}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={focused ? '#121212' : color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1E1E1E',
    borderTopWidth: 0,
    height: 90,
    paddingBottom: 10,
    paddingTop: 10,
  },
  tabIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#ccb3ff', 
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -25 }],
    shadowColor: "#ddccff", 
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
});