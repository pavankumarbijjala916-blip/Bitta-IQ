import React, { useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  FlatList
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useBatteryStore, Battery } from '../../stores/batteryStore'

const BatteryMonitorScreen = ({ navigation }: any) => {
  const { batteries, isLoading, fetchBatteries } = useBatteryStore()

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

  const renderBatteryItem = ({ item }: { item: Battery }) => (
    <TouchableOpacity
      style={styles.batteryItem}
      onPress={() => navigation.navigate('BatteryDetails', { batteryId: item.id })}
    >
      <View style={styles.batteryItemContent}>
        <View style={styles.batteryInfo}>
          <View style={styles.batteryHeader}>
            <Icon name="battery" size={24} color={getHealthColor(item.healthStatus)} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.batteryItemName}>{item.serialNumber}</Text>
              <Text style={styles.batteryItemType}>{item.batteryType}</Text>
            </View>
            <View
              style={[
                styles.healthIndicator,
                {
                  backgroundColor: getHealthColor(item.healthStatus)
                }
              ]}
            >
              <Text style={styles.healthIndicatorText}>{item.healthStatus}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatBadge icon="flash" label="V" value={item.voltage?.toFixed(2)} />
            <StatBadge icon="thermometer" label="°C" value={item.temperature?.toFixed(0)} />
            <StatBadge icon="sync-circle" label="Cycles" value={item.chargeCycles?.toString()} />
            <StatBadge icon="battery-charging" label="Cap" value={item.capacity?.toFixed(0) + '%'} />
          </View>
        </View>
      </View>

      <Icon name="chevron-right" size={24} color="#d1d5db" />
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Battery Monitor</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('RegisterBattery')}
        >
          <Icon name="plus-circle" size={24} color="#10b981" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : batteries.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="battery-question" size={80} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No Batteries Found</Text>
          <Text style={styles.emptyText}>
            Register your first battery to start monitoring
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('RegisterBattery')}
          >
            <Icon name="plus" size={20} color="#fff" />
            <Text style={styles.emptyButtonText}>Register Battery</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={batteries}
          renderItem={renderBatteryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchBatteries}
              tintColor="#10b981"
            />
          }
        />
      )}
    </SafeAreaView>
  )
}

const StatBadge = ({ icon, label, value }: any) => (
  <View style={styles.statBadge}>
    <Icon name={icon} size={14} color="#6b7280" />
    <Text style={styles.statBadgeLabel}>{label}</Text>
    <Text style={styles.statBadgeValue}>{value}</Text>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  addButton: {
    padding: 8
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  batteryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  batteryItemContent: {
    flex: 1
  },
  batteryInfo: {
    gap: 12
  },
  batteryHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  batteryItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937'
  },
  batteryItemType: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2
  },
  healthIndicator: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginLeft: 'auto'
  },
  healthIndicatorText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600'
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap'
  },
  statBadge: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  statBadgeLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2
  },
  statBadgeValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8
  },
  emptyButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    gap: 8
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14
  }
})

export default BatteryMonitorScreen
