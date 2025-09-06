import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  StatusBar, 
  TextInput,
  ScrollView 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // For navigation

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [contact1, setContact1] = useState('');
  const [contact2, setContact2] = useState('');
  const [contact3, setContact3] = useState('');

  const handleRegister = () => {
    if (phoneNumber.length < 10) {
      alert('Please enter a valid phone number.');
      return;
    }
    // In a real app, you would call your backend here to send an OTP
    console.log('Navigating to OTP screen with phone number:', phoneNumber);
    
    // Navigate to the OTP screen and pass the phone number as a parameter
    navigation.navigate('OTP', { phoneNumber: phoneNumber }); 
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Phone Number Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enter your phone number</Text>
          <Text style={styles.sectionSubtitle}>We'll send a verification code to this number.</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Phone number"
              placeholderTextColor="#8E8E93"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>
        </View>

        {/* Emergency Contacts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <Text style={styles.sectionSubtitle}>Add up to 3 contacts for emergency situations.</Text>
          
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="account" size={20} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Contact 1"
              placeholderTextColor="#8E8E93"
              keyboardType="phone-pad" // Assuming contacts are phone numbers
              value={contact1}
              onChangeText={setContact1}
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="account" size={20} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Contact 2"
              placeholderTextColor="#8E8E93"
              keyboardType="phone-pad"
              value={contact2}
              onChangeText={setContact2}
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="account" size={20} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Contact 3"
              placeholderTextColor="#8E8E93"
              keyboardType="phone-pad"
              value={contact3}
              onChangeText={setContact3}
            />
          </View>
        </View>
      </ScrollView>

      {/* Create Account Button */}
      <TouchableOpacity 
        style={styles.createAccountButton} 
        onPress={handleRegister}
      >
        <Text style={styles.createAccountButtonText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50, // Adjust for status bar
    paddingBottom: 15,
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E', // Subtle separator
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100, // Ensure content isn't hidden by button
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E', // Darker input background
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 55, // Consistent input height
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  createAccountButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: '#FFD60A', // Bright yellow button
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createAccountButtonText: {
    color: '#121212', // Dark text on yellow button
    fontSize: 18,
    fontWeight: 'bold',
  },
});