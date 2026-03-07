import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useAuthStore } from '../../stores/authStore'

const RegisterScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register, isLoading, error, clearError } = useAuthStore()

  const validatePassword = (pwd: string) => {
    const hasUppercase = /[A-Z]/.test(pwd)
    const hasLowercase = /[a-z]/.test(pwd)
    const hasNumber = /\d/.test(pwd)
    const hasSpecial = /[!@#$%^&*]/.test(pwd)
    const isLongEnough = pwd.length >= 8

    return {
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecial,
      isLongEnough,
      isValid: hasUppercase && hasLowercase && hasNumber && hasSpecial && isLongEnough
    }
  }

  const passwordValidation = validatePassword(password)

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !displayName) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match')
      return
    }

    if (!passwordValidation.isValid) {
      Alert.alert('Error', 'Password does not meet requirements')
      return
    }

    try {
      await register(email, password, displayName)
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'An error occurred')
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Icon name="alert-circle" size={20} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <Icon name="account" size={20} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor="#d1d5db"
              value={displayName}
              onChangeText={setDisplayName}
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Icon name="email" size={20} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#d1d5db"
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
              keyboardType="email-address"
            />
          </View>
        </View>

        {/* Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Icon name="lock" size={20} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor="#d1d5db"
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={isLoading}>
              <Icon
                name={showPassword ? 'eye' : 'eye-off'}
                size={20}
                color="#9ca3af"
                style={styles.inputIcon}
              />
            </TouchableOpacity>
          </View>

          {/* Password Requirements */}
          <View style={styles.requirementsBox}>
            <RequirementItem 
              met={passwordValidation.isLongEnough}
              text="At least 8 characters"
            />
            <RequirementItem 
              met={passwordValidation.hasUppercase}
              text="One uppercase letter"
            />
            <RequirementItem 
              met={passwordValidation.hasLowercase}
              text="One lowercase letter"
            />
            <RequirementItem 
              met={passwordValidation.hasNumber}
              text="One number"
            />
            <RequirementItem 
              met={passwordValidation.hasSpecial}
              text="One special character (!@#$%)"
            />
          </View>
        </View>

        {/* Confirm Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputWrapper}>
            <Icon name="lock" size={20} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor="#d1d5db"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!isLoading}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              <Icon
                name={showConfirmPassword ? 'eye' : 'eye-off'}
                size={20}
                color="#9ca3af"
                style={styles.inputIcon}
              />
            </TouchableOpacity>
          </View>
          {confirmPassword && password !== confirmPassword && (
            <Text style={styles.mismatchText}>Passwords do not match</Text>
          )}
        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={[
            styles.registerButton,
            (!passwordValidation.isValid || isLoading) && styles.buttonDisabled
          ]}
          onPress={handleRegister}
          disabled={!passwordValidation.isValid || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        {/* Sign In Link */}
        <View style={styles.signinSection}>
          <Text style={styles.signinText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()} disabled={isLoading}>
            <Text style={styles.signinLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
  <View style={styles.requirementItem}>
    <Icon
      name={met ? 'check-circle' : 'circle-outline'}
      size={16}
      color={met ? '#10b981' : '#d1d5db'}
    />
    <Text style={[styles.requirementText, met && styles.requirementMet]}>
      {text}
    </Text>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 12
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center'
  },
  errorText: {
    color: '#dc2626',
    marginLeft: 8,
    flex: 1
  },
  inputGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb'
  },
  inputIcon: {
    marginRight: 8
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937'
  },
  requirementsBox: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginTop: 8
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  requirementText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#6b7280'
  },
  requirementMet: {
    color: '#10b981',
    fontWeight: '500'
  },
  mismatchText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 4
  },
  registerButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  buttonDisabled: {
    opacity: 0.6
  },
  signinSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20
  },
  signinText: {
    color: '#6b7280',
    fontSize: 14
  },
  signinLink: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600'
  }
})

export default RegisterScreen
