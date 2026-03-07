import { Battery, Alert, DashboardStats } from '@/types/battery';

export const mockBatteries: Battery[] = [
  {
    id: 'BAT-001',
    type: 'Li-ion',
    voltage: 3.7,
    temperature: 25,
    chargeCycles: 150,
    capacity: 92,
    location: 'Warehouse A',
    soh: 92,
    status: 'healthy',
    lastUpdated: new Date('2024-12-24T10:30:00'),
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'BAT-002',
    type: 'Lead-Acid',
    voltage: 12.4,
    temperature: 28,
    chargeCycles: 450,
    capacity: 68,
    location: 'Warehouse B',
    soh: 68,
    status: 'repairable',
    lastUpdated: new Date('2024-12-24T09:15:00'),
    createdAt: new Date('2023-06-20'),
  },
  {
    id: 'BAT-003',
    type: 'Li-ion',
    voltage: 3.2,
    temperature: 35,
    chargeCycles: 890,
    capacity: 45,
    location: 'Lab 1',
    soh: 45,
    status: 'recyclable',
    lastUpdated: new Date('2024-12-24T08:45:00'),
    createdAt: new Date('2022-03-10'),
  },
  {
    id: 'BAT-004',
    type: 'LiFePO4',
    voltage: 3.3,
    temperature: 22,
    chargeCycles: 200,
    capacity: 88,
    location: 'Warehouse A',
    soh: 88,
    status: 'healthy',
    lastUpdated: new Date('2024-12-23T16:20:00'),
    createdAt: new Date('2024-02-28'),
  },
  {
    id: 'BAT-005',
    type: 'NiMH',
    voltage: 1.2,
    temperature: 30,
    chargeCycles: 600,
    capacity: 55,
    location: 'Lab 2',
    soh: 55,
    status: 'repairable',
    lastUpdated: new Date('2024-12-23T14:00:00'),
    createdAt: new Date('2023-08-15'),
  },
  {
    id: 'BAT-006',
    type: 'Lead-Acid',
    voltage: 11.8,
    temperature: 42,
    chargeCycles: 1200,
    capacity: 28,
    location: 'Warehouse C',
    soh: 28,
    status: 'recyclable',
    lastUpdated: new Date('2024-12-22T11:30:00'),
    createdAt: new Date('2021-11-05'),
  },
  {
    id: 'BAT-007',
    type: 'Li-ion',
    voltage: 3.6,
    temperature: 24,
    chargeCycles: 80,
    capacity: 96,
    location: 'Lab 1',
    soh: 96,
    status: 'healthy',
    lastUpdated: new Date('2024-12-24T11:00:00'),
    createdAt: new Date('2024-09-01'),
  },
  {
    id: 'BAT-008',
    type: 'NiCd',
    voltage: 1.1,
    temperature: 33,
    chargeCycles: 750,
    capacity: 62,
    location: 'Warehouse B',
    soh: 62,
    status: 'repairable',
    lastUpdated: new Date('2024-12-21T09:45:00'),
    createdAt: new Date('2023-02-14'),
  },
];

export const mockAlerts: Alert[] = [
  {
    id: 'ALT-001',
    batteryId: 'BAT-006',
    type: 'high_temperature',
    severity: 'critical',
    message: 'Battery BAT-006 temperature exceeds safe threshold (42°C)',
    timestamp: new Date('2024-12-24T10:15:00'),
    acknowledged: false,
  },
  {
    id: 'ALT-002',
    batteryId: 'BAT-003',
    type: 'critical_soh',
    severity: 'critical',
    message: 'Battery BAT-003 State of Health critically low (45%)',
    timestamp: new Date('2024-12-24T08:30:00'),
    acknowledged: false,
  },
  {
    id: 'ALT-003',
    batteryId: 'BAT-006',
    type: 'low_voltage',
    severity: 'warning',
    message: 'Battery BAT-006 voltage below optimal range (11.8V)',
    timestamp: new Date('2024-12-23T15:20:00'),
    acknowledged: true,
  },
  {
    id: 'ALT-004',
    batteryId: 'BAT-002',
    type: 'maintenance_due',
    severity: 'warning',
    message: 'Battery BAT-002 scheduled for maintenance check',
    timestamp: new Date('2024-12-22T10:00:00'),
    acknowledged: true,
  },
  {
    id: 'ALT-005',
    batteryId: 'BAT-005',
    type: 'high_temperature',
    severity: 'warning',
    message: 'Battery BAT-005 temperature elevated (30°C)',
    timestamp: new Date('2024-12-21T14:45:00'),
    acknowledged: true,
  },
];

export const getDashboardStats = (batteries: Battery[]): DashboardStats => {
  return {
    total: batteries.length,
    healthy: batteries.filter(b => b.status === 'healthy').length,
    repairable: batteries.filter(b => b.status === 'repairable').length,
    recyclable: batteries.filter(b => b.status === 'recyclable').length,
  };
};

export const calculateSoH = (
  voltage: number,
  temperature: number,
  chargeCycles: number,
  capacity: number
): number => {
  // Simplified SoH calculation for demo purposes
  let soh = capacity;
  
  // Adjust for temperature (optimal is 20-25°C)
  if (temperature > 35) soh -= (temperature - 35) * 2;
  if (temperature < 10) soh -= (10 - temperature) * 1.5;
  
  // Adjust for charge cycles
  if (chargeCycles > 500) soh -= (chargeCycles - 500) * 0.02;
  
  return Math.max(0, Math.min(100, Math.round(soh)));
};

export const getStatusFromSoH = (soh: number): Battery['status'] => {
  if (soh >= 70) return 'healthy';
  if (soh >= 40) return 'repairable';
  return 'recyclable';
};
