import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from 'react-native-paper';

export default function OTPScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { phoneNumber } = route.params; // Get phone number passed from RegisterScreen

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const inputs = useRef([]);

  // Timer countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Automatically focus the next input box
    if (text && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleBackspace = (e, index) => {
    // Move focus to the previous input box on backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };
  
  const handleVerify = () => {
      const enteredOtp = otp.join('');
      if (enteredOtp.length !== 6) {
          Alert.alert("Error", "Please enter the complete 6-digit code.");
          return;
      }
      // In a real app, you'd verify the OTP with your backend
      console.log("Verifying OTP:", enteredOtp);
      navigation.navigate('UserDetails');
  };

  const resendCode = () => {
    console.log("Resending code...");
    setTimer(30); // Reset timer
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>OTP Verification</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Enter Code</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit verification code to {phoneNumber}.
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputs.current[index] = ref)}
              style={styles.otpInput}
              keyboardType="number-pad"
              maxLength={1}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleBackspace(e, index)}
              value={digit}
            />
          ))}
        </View>
        
        <TouchableOpacity onPress={resendCode} disabled={timer > 0}>
          <Text style={[styles.resendText, { color: timer > 0 ? '#8E8E93' : '#7E57C2' }]}>
            Resend Code {timer > 0 ? `in ${timer}s` : ''}
          </Text>
        </TouchableOpacity>

        <Button mode="contained" onPress={handleVerify} style={styles.verifyButton}>
            Verify
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 15 },
  backButton: { padding: 8, marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  content: { flex: 1, padding: 24, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#E0E0E0', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#B0B0B0', textAlign: 'center', marginBottom: 40 },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 30 },
  otpInput: {
    width: 48,
    height: 52,
    borderWidth: 1,
    borderColor: '#3E3E3E',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 22,
    color: '#FFFFFF',
    backgroundColor: '#2C2C2E',
  },
  resendText: { fontSize: 16, fontWeight: 'bold', marginBottom: 30 },
  verifyButton: { width: '100%', paddingVertical: 8, backgroundColor: '#7E57C2' },
});