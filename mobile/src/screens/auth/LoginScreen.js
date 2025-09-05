import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login } = useAuthStore(); // Get the login function from your store

  const handleLogin = () => {
    // In a real app, you'd verify credentials here
    console.log('Simulating successful login...');
    login(); // This will set isAuthenticated to true
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Button mode="contained" onPress={handleLogin} style={styles.button}>
        Simulate Login
      </Button>
      <Button
        mode="text"
        onPress={() => navigation.navigate('Register')}
        textColor="#FFD60A"
      >
        Don't have an account? Register
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 24,
  },
  title: {
    fontSize: 28,
    color: 'white',
    marginBottom: 40,
  },
  button: {
    width: '100%',
    paddingVertical: 8,
    marginBottom: 16,
  },
});