import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

const AlertsScreen = () => {
  const [alerts, setAlerts] = useState([
    {
      id: '1',
      type: 'health',
      title: 'Battery Health Alert',
      message: 'Battery SN-001 showing signs of degradation',
      severity: 'warning',
      timestamp: new Date(Date.now() - 3600000),
      read: false
    },
    {
      id: '2',
      type: 'temperature',
      title: 'High Temperature Warning',
      message: 'Battery SN-002 temperature exceeds safe threshold',
      severity: 'critical',
      timestamp: new Date(Date.now() - 7200000),
      read: false
    },
    {
      id: '3',
      type: 'maintenance',
      title: 'Maintenance Recommended',
      message: 'Battery SN-003 has reached 500 charge cycles',
      severity: 'info',
      timestamp: new Date(Date.now() - 86400000),
      read: true
    }
  ])

  const markAsRead = (id: string) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, read: true } : alert
    ))
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#ef4444'
      case 'warning':
        return '#f59e0b'
      case 'info':
        return '#3b82f6'
      default:
        return '#6b7280'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'alert-circle'
      case 'warning':
        return 'alert'
      case 'info':
        return 'information'
      default:
        return 'circle'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(hours / 24)

    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const renderAlert = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.alertItem, !item.read && styles.unreadAlert]}
      onPress={() => markAsRead(item.id)}
    >
      <Icon
        name={getSeverityIcon(item.severity)}
        size={24}
        color={getSeverityColor(item.severity)}
      />
      <View style={styles.alertContent}>
        <Text style={styles.alertTitle}>{item.title}</Text>
        <Text style={styles.alertMessage}>{item.message}</Text>
        <Text style={styles.alertTime}>{formatTime(item.timestamp)}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  )

  const unreadCount = alerts.filter(a => !a.read).length

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Alerts</Text>
          {unreadCount > 0 && (
            <Text style={styles.unreadCount}>{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity>
            <Text style={styles.markAllRead}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {alerts.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="checkbox-marked-circle" size={80} color="#10b981" />
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptyText}>You have no alerts at this time</Text>
        </View>
      ) : (
        <FlatList
          data={alerts}
          renderItem={renderAlert}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
        />
      )}
    </SafeAreaView>
  )
}

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
  unreadCount: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2
  },
  markAllRead: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500'
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  alertItem: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  unreadAlert: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac'
  },
  alertContent: {
    flex: 1,
    gap: 4
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937'
  },
  alertMessage: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16
  },
  alertTime: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
    marginTop: 2
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4
  }
})

export default AlertsScreen
