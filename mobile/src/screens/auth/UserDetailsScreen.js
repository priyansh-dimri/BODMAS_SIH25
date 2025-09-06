import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';

export default function UserDetailsScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { login } = useAuthStore();

  const handleFinish = () => {
    if (!name || !email) {
      Alert.alert('Error', 'Please fill in all details.');
      return;
    }
    // In a real app, you would save these details to your backend
    console.log("Saving user details:", { name, email });
    login(); // This logs the user in and switches the navigator to the main app
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Tell us about you</Text>
        <Text style={styles.subtitle}>Let's get your profile set up.</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#8E8E93"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#8E8E93"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Button mode="contained" onPress={handleFinish} style={styles.finishButton}>
          Complete Setup
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A' },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#E0E0E0', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#B0B0B0', textAlign: 'center', marginBottom: 40 },
  input: {
    backgroundColor: '#2C2C2E',
    color: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  finishButton: { width: '100%', paddingVertical: 8, backgroundColor: '#7E57C2', marginTop: 20 },
});