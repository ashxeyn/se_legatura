// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Vibration
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface EmailVerificationScreenProps {
  onBackPress: () => void;
  onComplete: (verificationCode: string) => void;
  email: string;
  onResendOtp?: () => void;
}

const { width } = Dimensions.get('window');
const OTP_LENGTH = 6;

export default function EmailVerificationScreen({
  onBackPress,
  onComplete,
  email,
  onResendOtp
}: EmailVerificationScreenProps) {
  const [verificationCode, setVerificationCode] = useState<string[]>(new Array(OTP_LENGTH).fill(''));
  const [isComplete, setIsComplete] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Animation refs
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Input refs
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0 && !canResend) {
      timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [resendTimer, canResend]);

  // Auto-submit when all fields are filled
  useEffect(() => {
    const code = verificationCode.join('');
    if (code.length === OTP_LENGTH && !isComplete) {
      setIsComplete(true);
      handleVerification(code);
    }
  }, [verificationCode, isComplete]);

  const handleInputChange = useCallback((text: string, index: number) => {
    // Only allow numeric input
    const numericValue = text.replace(/[^0-9]/g, '');

    if (numericValue.length > 1) {
      // Handle paste scenario
      const pastedCode = numericValue.slice(0, OTP_LENGTH);
      const newCode = [...verificationCode];

      for (let i = 0; i < pastedCode.length && i < OTP_LENGTH; i++) {
        newCode[i] = pastedCode[i];
      }

      setVerificationCode(newCode);

      // Focus the next empty input or last input
      const nextIndex = Math.min(pastedCode.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
    } else {
      // Single character input
      const newCode = [...verificationCode];
      newCode[index] = numericValue;
      setVerificationCode(newCode);

      // Auto-focus next input
      if (numericValue && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  }, [verificationCode]);

  const handleKeyPress = useCallback((e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (verificationCode[index] === '' && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newCode = [...verificationCode];
        newCode[index] = '';
        setVerificationCode(newCode);
      }
    }
  }, [verificationCode]);

  const handleResendOtp = useCallback(async () => {
    if (!canResend || !onResendOtp) return;

    try {
      await onResendOtp();
      setResendTimer(60);
      setCanResend(false);

      // Reset form
      setVerificationCode(new Array(OTP_LENGTH).fill(''));
      setIsComplete(false);
      inputRefs.current[0]?.focus();

      Alert.alert(
        'Code Sent!',
        `A new verification code has been sent to ${email}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    }
  }, [canResend, onResendOtp, email]);

  const showErrorAnimation = useCallback(() => {
    Vibration.vibrate(100);
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [shakeAnim]);

  const handleVerification = useCallback(async (code: string) => {
    if (code.length !== OTP_LENGTH) {
      Alert.alert('Invalid Code', 'Please enter all 6 digits.');
      return;
    }

    setIsVerifying(true);

    try {
      // Show success animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      onComplete(code);
    } catch (error) {
      showErrorAnimation();
      setIsComplete(false);
      setIsVerifying(false);

      Alert.alert(
        'Verification Failed',
        'Invalid verification code. Please try again.',
        [{
          text: 'OK', onPress: () => {
            setVerificationCode(new Array(OTP_LENGTH).fill(''));
            inputRefs.current[0]?.focus();
          }
        }]
      );
    }
  }, [onComplete, scaleAnim, opacityAnim, showErrorAnimation]);

  const handleManualComplete = useCallback(() => {
    const code = verificationCode.join('');
    handleVerification(code);
  }, [verificationCode, handleVerification]);

  const formatEmail = (email: string) => {
    if (email.length <= 10) return email;
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 3) return email;
    const maskedLocal = localPart.slice(0, 2) + '***' + localPart.slice(-1);
    return `${maskedLocal}@${domain}`;
  };

  const codeLength = verificationCode.filter(digit => digit !== '').length;
  const isCodeComplete = codeLength === OTP_LENGTH;

  return (
    <SafeAreaView style={styles.container}>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBackPress}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back-ios" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Email Verification</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit code to{' '}
              <Text style={styles.emailText}>{formatEmail(email)}</Text>
            </Text>
          </View>

          {/* OTP Input Container */}
          <Animated.View
            style={[
              styles.otpContainer,
              { transform: [{ translateX: shakeAnim }] }
            ]}
          >
            {verificationCode.map((digit, index) => (
              <View key={index} style={styles.inputWrapper}>
                <TextInput
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.otpInput,
                    digit !== '' && styles.otpInputFilled,
                    isComplete && styles.otpInputSuccess
                  ]}
                  value={digit}
                  onChangeText={(text) => handleInputChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  autoFocus={index === 0}
                  selectTextOnFocus
                  editable={!isVerifying}
                />
                {digit !== '' && (
                  <View style={styles.inputDot} />
                )}
              </View>
            ))}
          </Animated.View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { width: `${(codeLength / OTP_LENGTH) * 100}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {codeLength} of {OTP_LENGTH} digits entered
            </Text>
          </View>

          {/* Resend Section */}
          <View style={styles.resendContainer}>
            {!canResend ? (
              <Text style={styles.timerText}>
                Resend code in {Math.floor(resendTimer / 60)}:{(resendTimer % 60).toString().padStart(2, '0')}
              </Text>
            ) : (
              <View style={styles.resendRow}>
                <Text style={styles.resendText}>Didn't receive the code? </Text>
                <TouchableOpacity
                  onPress={handleResendOtp}
                  style={styles.resendButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resendLink}>Resend</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Success Animation Overlay */}
        {isComplete && (
          <Animated.View
            style={[
              styles.successOverlay,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <View style={styles.successContent}>
              <View style={styles.successIconContainer}>
                <MaterialIcons name="check-circle" size={80} color="#10B981" />
              </View>
              <Text style={styles.successText}>Verification Complete!</Text>
              <Text style={styles.successSubtext}>Please wait a moment...</Text>
            </View>
          </Animated.View>
        )}

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              isCodeComplete && styles.continueButtonActive,
              isVerifying && styles.continueButtonLoading
            ]}
            onPress={handleManualComplete}
            disabled={!isCodeComplete || isVerifying}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.continueButtonText,
              isCodeComplete && styles.continueButtonTextActive
            ]}>
              {isVerifying ? 'Verifying...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 12,
    marginLeft: -12,
    borderRadius: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  titleContainer: {
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  emailText: {
    fontWeight: '600',
    color: '#3B82F6',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  otpInput: {
    width: (width - 80) / 6,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  otpInputFilled: {
    backgroundColor: '#EBF8FF',
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  otpInputSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  inputDot: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  timerText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#6B7280',
  },
  resendButton: {
    padding: 4,
  },
  resendLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  continueButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  continueButtonActive: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonLoading: {
    backgroundColor: '#93C5FD',
  },
  continueButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonTextActive: {
    color: '#FFFFFF',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successContent: {
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 16,
    color: '#6B7280',
  },
});