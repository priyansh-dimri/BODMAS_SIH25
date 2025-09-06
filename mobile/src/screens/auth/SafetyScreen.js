import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SafetyScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.content}>
        {/* Shield Icon */}
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="shield-check" size={40} color="#22A60A" />
        </View>

        {/* Titles */}
        <Text style={styles.title}>Secure Your App</Text>
        <Text style={styles.subtitle}>
          Choose how you want to secure your app. You can use a 4-digit PIN or biometric lock.
        </Text>

        {/* Buttons */}
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={() => alert('Set up PIN pressed!')}
        >
          {/* Icon color updated for contrast */}
          <MaterialCommunityIcons name="dialpad" size={24} color="#FFFFFF" /> 
          <Text style={styles.primaryButtonText}>Set up PIN</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={() => alert('Set up Biometric Lock pressed!')}
        >
          <MaterialCommunityIcons name="fingerprint" size={24} color="#E0E0E0" />
          <Text style={styles.secondaryButtonText}>Set up Biometric Lock</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3E3E3E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7E57C2',
    paddingVertical: 16,
    borderRadius: 30,
    width: '100%',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF', // << UPDATED to white for better contrast
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3E3E3E',
    paddingVertical: 16,
    borderRadius: 30,
    width: '100%',
  },
  secondaryButtonText: {
    color: '#E0E0E0',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});