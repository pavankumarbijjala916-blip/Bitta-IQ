import React, { useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useBatteryStore, Battery } from '../../stores/batteryStore'
import { useAuthStore } from '../../stores/authStore'
import LinearGradient from 'react-native-linear-gradient'

const DashboardScreen = ({ navigation }: any) => {
  const { batteries, isLoading, fetchBatteries } = useBatteryStore()
  const { user, logout } = useAuthStore()

  useEffect(() => {
    fetchBatteries()
  }, [])

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'Good':
        return '#10b981'
      case 'Moderate':
        return '#f59e0b'
      case 'Poor':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  const healthStats = {
    good: batteries.filter(b => b.healthStatus === 'Good').length,
    moderate: batteries.filter(b => b.healthStatus === 'Moderate').length,
    poor: batteries.filter(b => b.healthStatus === 'Poor').length
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchBatteries}
            tintColor="#10b981"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.username}>{user?.email?.split('@')[0] || 'User'}</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              logout()
            }}
          >
            <Icon name="logout" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="check-circle"
            label="Good"
            count={healthStats.good}
            color="#10b981"
          />
          <StatCard
            icon="alert-circle"
            label="Moderate"
            count={healthStats.moderate}
            color="#f59e0b"
          />
          <StatCard
            icon="close-circle"
            label="Poor"
            count={healthStats.poor}
            color="#ef4444"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('RegisterBattery')}
          >
            <Icon name="plus-circle" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Add New Battery</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Batteries */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Batteries</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Monitor')}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#10b981" />
          ) : batteries.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="battery-unknown" size={60} color="#d1d5db" />
              <Text style={styles.emptyText}>No batteries registered yet</Text>
              <TouchableOpacity
                style={styles.emptyActionButton}
                onPress={() => navigation.navigate('RegisterBattery')}
              >
                <Text style={styles.emptyActionText}>Register Your First Battery</Text>
              </TouchableOpacity>
            </View>
          ) : (
            batteries.slice(0, 3).map((battery) => (
              <BatteryCard
                key={battery.id}
                battery={battery}
                onPress={() => navigation.navigate('BatteryDetails', { batteryId: battery.id })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const StatCard = ({ icon, label, count, color }: any) => (
  <LinearGradient
    colors={[color + '20', color + '05']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.statCard}
  >
    <Icon name={icon} size={32} color={color} />
    <Text style={styles.statCount}>{count}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </LinearGradient>
)

const BatteryCard = ({ battery, onPress }: { battery: Battery; onPress: () => void }) => (
  <TouchableOpacity style={styles.batteryCard} onPress={onPress}>
    <View style={styles.batteryCardHeader}>
      <View>
        <Text style={styles.batteryName}>{battery.serialNumber}</Text>
        <Text style={styles.batteryType}>{battery.batteryType}</Text>
      </View>
      <View
        style={[
          styles.healthBadge,
          {
            backgroundColor:
              battery.healthStatus === 'Good'
                ? '#d1fae5'
                : battery.healthStatus === 'Moderate'
                  ? '#fef3c7'
                  : '#fee2e2'
          }
        ]}
      >
        <Text
          style={[
            styles.healthBadgeText,
            {
              color:
                battery.healthStatus === 'Good'
                  ? '#10b981'
                  : battery.healthStatus === 'Moderate'
                    ? '#f59e0b'
                    : '#ef4444'
            }
          ]}
        >
          {battery.healthStatus}
        </Text>
      </View>
    </View>
    <View style={styles.batteryCardStats}>
      <StatItem icon="flash" label="Voltage" value={battery.voltage?.toFixed(2) + 'V'} />
      <StatItem icon="thermometer" label="Temp" value={battery.temperature?.toFixed(0) + '°C'} />
      <StatItem icon="sync-circle" label="Cycles" value={battery.chargeCycles?.toString()} />
    </View>
  </TouchableOpacity>
)

const StatItem = ({ icon, label, value }: any) => (
  <View style={styles.statItem}>
    <Icon name={icon} size={16} color="#6b7280" />
    <Text style={styles.statItemLabel}>{label}</Text>
    <Text style={styles.statItemValue}>{value}</Text>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24
  },
  greeting: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  logoutButton: {
    padding: 8
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  statCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4
  },
  section: {
    marginBottom: 24
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937'
  },
  viewAllLink: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500'
  },
  actionButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12
  },
  emptyActionButton: {
    marginTop: 16,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8
  },
  emptyActionText: {
    color: '#10b981',
    fontWeight: '600'
  },
  batteryCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  batteryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  batteryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937'
  },
  batteryType: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2
  },
  healthBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20
  },
  healthBadgeText: {
    fontSize: 12,
    fontWeight: '600'
  },
  batteryCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statItem: {
    alignItems: 'center'
  },
  statItemLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4
  },
  statItemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 2
  }
})

export default DashboardScreen
