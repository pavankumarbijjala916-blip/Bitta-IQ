import 'expo-status-bar/build/ExpoStatusBar'
import React from 'react'
import { View, ActivityIndicator, Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import { useAuthStore } from './src/stores/authStore'

// Screens
import LoginScreen from './src/screens/auth/LoginScreen'
import RegisterScreen from './src/screens/auth/RegisterScreen'
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen'
import DashboardScreen from './src/screens/main/DashboardScreen'
import BatteryMonitorScreen from './src/screens/main/BatteryMonitorScreen'
import BatteryDetailsScreen from './src/screens/main/BatteryDetailsScreen'
import RegisterBatteryScreen from './src/screens/main/RegisterBatteryScreen'
import AlertsScreen from './src/screens/main/AlertsScreen'
import SettingsScreen from './src/screens/main/SettingsScreen'
import ChatbotScreen from './src/screens/main/ChatbotScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  )
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#9ca3af'
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Monitor" component={BatteryMonitorScreen} options={{ title: 'Monitor' }} />
      <Tab.Screen name="Alerts" component={AlertsScreen} options={{ title: 'Alerts' }} />
      <Tab.Screen name="Chat" component={ChatbotScreen} options={{ title: 'Assistant' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  )
}

function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="BatteryDetails" component={BatteryDetailsScreen} options={{ title: 'Battery Details', headerShown: true }} />
        <Stack.Screen name="RegisterBattery" component={RegisterBatteryScreen} options={{ title: 'Register Battery', headerShown: true }} />
      </Stack.Group>
    </Stack.Navigator>
  )
}

export default function App() {
  const { user, isLoading, initializeAuth } = useAuthStore()
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const init = async () => {
      try {
        await initializeAuth()
      } catch (err: any) {
        setError(err?.message || 'Initialization error')
      }
    }
    init()
  }, [initializeAuth])

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 }}>
        <Text style={{ fontSize: 16, color: '#dc2626', textAlign: 'center' }}>Error: {error}</Text>
      </View>
    )
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      {user ? <RootStack /> : <AuthStack />}
    </NavigationContainer>
  )
}
