export type BatteryStatus = 'healthy' | 'repairable' | 'recyclable';

export interface Battery {
  id: string;
  type: 'Li-ion' | 'Lead-Acid' | 'NiMH' | 'NiCd' | 'LiFePO4';
  voltage: number;
  temperature: number;
  chargeCycles: number;
  capacity: number;
  location: string;
  soh: number;
  status: BatteryStatus;
  lastUpdated: Date;
  createdAt: Date;
  image?: string; // Base64 encoded image
}

export interface Alert {
  id: string;
  batteryId: string;
  type: 'high_temperature' | 'low_voltage' | 'critical_soh' | 'maintenance_due';
  severity: 'warning' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface DashboardStats {
  total: number;
  healthy: number;
  repairable: number;
  recyclable: number;
}
