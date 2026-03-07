import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useAuthStore } from '../../stores/authStore'

const SettingsScreen = () => {
  const { user, logout } = useAuthStore()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Sign Out',
        onPress: async () => {
          setIsLoading(true)
          try {
            await logout()
          } catch (error) {
            Alert.alert('Error', 'Failed to sign out')
          } finally {
            setIsLoading(false)
          }
        },
        style: 'destructive'
      }
    ])
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <SettingItem
            icon="account-circle"
            label="Email Address"
            value={user?.email}
            rightContent={<Icon name="chevron-right" size={20} color="#d1d5db" />}
          />

          <SettingItem
            icon="lock"
            label="Change Password"
            value="Update your password"
            rightContent={<Icon name="chevron-right" size={20} color="#d1d5db" />}
          />

          <SettingItem
            icon="delete-account"
            label="Delete Account"
            value="Remove your account"
            isDestructive={true}
            rightContent={<Icon name="chevron-right" size={20} color="#ef4444" />}
          />
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <SettingItem
            icon="bell"
            label="Push Notifications"
            value="Receive push notifications"
            rightContent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#d1d5db', true: '#10b981' }}
              />
            }
          />

          <SettingItem
            icon="email"
            label="Email Alerts"
            value="Receive email alerts"
            rightContent={
              <Switch
                value={emailAlerts}
                onValueChange={setEmailAlerts}
                trackColor={{ false: '#d1d5db', true: '#10b981' }}
              />
            }
          />
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <SettingItem
            icon="palette"
            label="App Theme"
            value="Light"
            rightContent={<Icon name="chevron-right" size={20} color="#d1d5db" />}
          />

          <SettingItem
            icon="translate"
            label="Language"
            value="English"
            rightContent={<Icon name="chevron-right" size={20} color="#d1d5db" />}
          />
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <SettingItem
            icon="information"
            label="App Version"
            value="1.0.0"
          />

          <SettingItem
            icon="file-document"
            label="Privacy Policy"
            rightContent={<Icon name="chevron-right" size={20} color="#d1d5db" />}
          />

          <SettingItem
            icon="file-document"
            label="Terms of Service"
            rightContent={<Icon name="chevron-right" size={20} color="#d1d5db" />}
          />

          <SettingItem
            icon="help-circle"
            label="Help & Support"
            rightContent={<Icon name="chevron-right" size={20} color="#d1d5db" />}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, isLoading && { opacity: 0.6 }]}
          onPress={handleLogout}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#ef4444" />
          ) : (
            <>
              <Icon name="logout" size={20} color="#ef4444" />
              <Text style={styles.logoutButtonText}>Sign Out</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const SettingItem = ({ icon, label, value, rightContent, isDestructive }: any) => (
  <TouchableOpacity
    style={[
      styles.settingItem,
      isDestructive && styles.destructiveItem
    ]}
  >
    <Icon
      name={icon}
      size={20}
      color={isDestructive ? '#ef4444' : '#6b7280'}
      style={styles.itemIcon}
    />
    <View style={styles.itemContent}>
      <Text style={[styles.itemLabel, isDestructive && styles.destructiveLabel]}>
        {label}
      </Text>
      {value && (
        <Text style={[styles.itemValue, isDestructive && styles.destructiveValue]}>
          {value}
        </Text>
      )}
    </View>
    <View style={styles.itemRight}>
      {rightContent}
    </View>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20
  },
  header: {
    marginBottom: 24
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden'
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  destructiveItem: {
    borderTopColor: '#fee2e2'
  },
  itemIcon: {
    marginRight: 12
  },
  itemContent: {
    flex: 1,
    gap: 2
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937'
  },
  destructiveLabel: {
    color: '#ef4444'
  },
  itemValue: {
    fontSize: 13,
    color: '#6b7280'
  },
  destructiveValue: {
    color: '#fca5a5'
  },
  itemRight: {
    marginLeft: 12
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginVertical: 20
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444'
  }
})

export default SettingsScreen
