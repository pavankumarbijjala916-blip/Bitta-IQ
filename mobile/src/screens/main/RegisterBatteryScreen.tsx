import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useBatteryStore } from '../../stores/batteryStore'
import { useAuthStore } from '../../stores/authStore'

const RegisterBatteryScreen = ({ navigation }: any) => {
  const { addBattery, isLoading } = useBatteryStore()
  const { user } = useAuthStore()

  const [batteryType, setBatteryType] = useState('Li-ion')
  const [manufacturerId, setManufacturerId] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [voltage, setVoltage] = useState('')
  const [temperature, setTemperature] = useState('')
  const [chargeCycles, setChargeCycles] = useState('')
  const [capacity, setCapacity] = useState('')

  const handleAddBattery = async () => {
    if (!serialNumber || !voltage || !temperature || !chargeCycles || !capacity) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    try {
      await addBattery({
        userId: user?.uid || '',
        manufacturerId,
        batteryType: batteryType as any,
        serialNumber,
        voltage: parseFloat(voltage),
        temperature: parseFloat(temperature),
        chargeCycles: parseInt(chargeCycles),
        capacity: parseFloat(capacity),
        healthStatus: 'Good', // Default
        lastAssessmentDate: new Date()
      })

      Alert.alert('Success', 'Battery registered successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ])
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to register battery')
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Register Battery</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Battery Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Battery Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Battery Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={batteryType}
                onValueChange={setBatteryType}
                style={styles.picker}
              >
                <Picker.Item label="Lithium Ion (Li-ion)" value="Li-ion" />
                <Picker.Item label="Lead-Acid" value="Lead-Acid" />
                <Picker.Item label="Nickel-Metal Hydride (NiMH)" value="NiMH" />
                <Picker.Item label="Lithium Iron Phosphate (LiFePO4)" value="LiFePO4" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Manufacturer</Text>
            <View style={styles.inputWrapper}>
              <Icon name="factory" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g., Samsung, Tesla, LG"
                placeholderTextColor="#d1d5db"
                value={manufacturerId}
                onChangeText={setManufacturerId}
                editable={!isLoading}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Serial Number *</Text>
            <View style={styles.inputWrapper}>
              <Icon name="barcode" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g., SN-123456"
                placeholderTextColor="#d1d5db"
                value={serialNumber}
                onChangeText={setSerialNumber}
                editable={!isLoading}
              />
            </View>
          </View>
        </View>

        {/* Battery Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specifications</Text>

          <View style={styles.twoColumnGrid}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Voltage (V) *</Text>
              <View style={styles.inputWrapper}>
                <Icon name="flash" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 3.7"
                  placeholderTextColor="#d1d5db"
                  value={voltage}
                  onChangeText={setVoltage}
                  editable={!isLoading}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Temperature (°C) *</Text>
              <View style={styles.inputWrapper}>
                <Icon name="thermometer" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 25"
                  placeholderTextColor="#d1d5db"
                  value={temperature}
                  onChangeText={setTemperature}
                  editable={!isLoading}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>

          <View style={styles.twoColumnGrid}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Charge Cycles *</Text>
              <View style={styles.inputWrapper}>
                <Icon name="sync-circle" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 250"
                  placeholderTextColor="#d1d5db"
                  value={chargeCycles}
                  onChangeText={setChargeCycles}
                  editable={!isLoading}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Capacity (%) *</Text>
              <View style={styles.inputWrapper}>
                <Icon name="battery-charging-100" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 85"
                  placeholderTextColor="#d1d5db"
                  value={capacity}
                  onChangeText={setCapacity}
                  editable={!isLoading}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Icon name="information" size={20} color="#3b82f6" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.infoTitle}>What's Next?</Text>
            <Text style={styles.infoText}>
              After registration, our AI will assess your battery health and provide recommendations.
            </Text>
          </View>
        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={[styles.registerButton, isLoading && styles.buttonDisabled]}
          onPress={handleAddBattery}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <View style={styles.registerButtonContent}>
              <Icon name="plus" size={20} color="#fff" />
              <Text style={styles.registerButtonText}>Register Battery</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12
  },
  inputGroup: {
    marginBottom: 12
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    overflow: 'hidden'
  },
  picker: {
    height: 50,
    color: '#1f2937'
  },
  twoColumnGrid: {
    flexDirection: 'row',
    gap: 12
  },
  infoBox: {
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6'
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af'
  },
  infoText: {
    fontSize: 13,
    color: '#1e40af',
    marginTop: 2,
    lineHeight: 18
  },
  registerButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonDisabled: {
    opacity: 0.6
  },
  registerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
})

export default RegisterBatteryScreen
