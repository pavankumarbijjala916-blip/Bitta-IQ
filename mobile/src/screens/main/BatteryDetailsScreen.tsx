import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import LinearGradient from 'react-native-linear-gradient'
import { useBatteryStore, Battery } from '../../stores/batteryStore'

const BatteryDetailsScreen = ({ route, navigation }: any) => {
  const { batteryId } = route.params
  const { batteries } = useBatteryStore()
  const [battery, setBattery] = useState<Battery | null>(null)

  useEffect(() => {
    const foundBattery = batteries.find(b => b.id === batteryId)
    setBattery(foundBattery || null)
  }, [batteryId, batteries])

  if (!battery) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#10b981" />
      </SafeAreaView>
    )
  }

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

  const healthColor = getHealthColor(battery.healthStatus)

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.headerSection}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Battery Details</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Battery Card */}
        <LinearGradient
          colors={[healthColor + '20', healthColor + '05']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.batteryCard}
        >
          <View style={styles.batteryCardContent}>
            <Icon name="battery" size={60} color={healthColor} />
            <View style={styles.batteryCardText}>
              <Text style={styles.batteryModel}>{battery.serialNumber}</Text>
              <Text style={styles.batteryManufacturer}>{battery.manufacturerId || 'Unknown'}</Text>
              <Text style={styles.batteryType}>{battery.batteryType}</Text>
            </View>
          </View>
          <View
            style={[
              styles.healthBadge,
              { backgroundColor: healthColor }
            ]}
          >
            <Icon name="heart" size={20} color="#fff" />
            <Text style={styles.healthText}>{battery.healthStatus}</Text>
          </View>
        </LinearGradient>

        {/* Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <SpecItem icon="flash" label="Voltage" value={battery.voltage?.toFixed(2) + ' V'} />
          <SpecItem icon="thermometer" label="Temperature" value={battery.temperature?.toFixed(0) + ' °C'} />
          <SpecItem icon="sync-circle" label="Charge Cycles" value={battery.chargeCycles?.toString()} />
          <SpecItem icon="battery-charging" label="Capacity" value={battery.capacity?.toFixed(0) + ' %'} />
        </View>

        {/* Assessment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assessment</Text>
          <AssessmentItem
            icon="calendar"
            label="Last Assessed"
            value={battery.lastAssessmentDate ? new Date(battery.lastAssessmentDate).toLocaleDateString() : 'Not assessed'}
          />
          <AssessmentItem
            icon="information"
            label="Status"
            value={battery.healthStatus === 'Good' ? 'Battery is in good condition' : battery.healthStatus === 'Moderate' ? 'Battery showing signs of wear. Monitor closely.' : 'Battery critically degraded. Consider replacement.'}
          />
        </View>

        {/* Recommendation */}
        <View style={[styles.section, styles.recommendationSection]}>
          <View style={styles.recommendationHeader}>
            <Icon name="lightbulb-on" size={24} color="#f59e0b" />
            <Text style={styles.recommendationTitle}>Recommendation</Text>
          </View>
          <Text style={styles.recommendationText}>
            {battery.healthStatus === 'Good'
              ? 'Your battery is performing well. Continue regular monitoring.'
              : battery.healthStatus === 'Moderate'
                ? 'Consider extending battery life through proper usage practices. Temperature control is important.'
                : 'This battery has reached end-of-life. Please arrange for proper recycling or replacement.'}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="pencil" size={20} color="#3b82f6" />
            <Text style={styles.actionButtonText}>Edit Details</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]}>
            <Icon name="trash-can" size={20} color="#ef4444" />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete Battery</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const SpecItem = ({ icon, label, value }: any) => (
  <View style={styles.specItem}>
    <View style={styles.specItemLeft}>
      <Icon name={icon} size={20} color="#10b981" />
      <Text style={styles.specItemLabel}>{label}</Text>
    </View>
    <Text style={styles.specItemValue}>{value}</Text>
  </View>
)

const AssessmentItem = ({ icon, label, value }: any) => (
  <View style={styles.assessmentItem}>
    <View style={styles.assessmentItemLeft}>
      <Icon name={icon} size={20} color="#6b7280" />
      <Text style={styles.assessmentItemLabel}>{label}</Text>
    </View>
    <Text style={styles.assessmentItemValue}>{value}</Text>
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
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  batteryCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  batteryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16
  },
  batteryCardText: {
    flex: 1
  },
  batteryModel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  batteryManufacturer: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4
  },
  batteryType: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2
  },
  healthBadge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  healthText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  specItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  specItemLabel: {
    fontSize: 14,
    color: '#6b7280'
  },
  specItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937'
  },
  assessmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  assessmentItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 0.4
  },
  assessmentItemLabel: {
    fontSize: 14,
    color: '#6b7280'
  },
  assessmentItemValue: {
    fontSize: 13,
    color: '#374151',
    flex: 0.6,
    textAlign: 'right'
  },
  recommendationSection: {
    backgroundColor: '#fffbeb',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b'
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e'
  },
  recommendationText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
    gap: 8
  },
  actionButtonText: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 14
  },
  deleteButton: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2'
  },
  deleteButtonText: {
    color: '#ef4444'
  }
})

export default BatteryDetailsScreen
