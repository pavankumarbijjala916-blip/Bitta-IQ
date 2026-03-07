/**
 * Alert Service - Generates alerts based on battery conditions
 */

export interface BatteryAnalysis {
  batteryId: string;
  temperature: number;
  voltage: number;
  soh: number;
  chargeCycles: number;
  type: string;
  location: string;
}

export interface GeneratedAlert {
  type: 'high_temperature' | 'low_voltage' | 'critical_soh' | 'maintenance_due';
  severity: 'warning' | 'critical';
  message: string;
}

/**
 * Define temperature thresholds by battery type (in Celsius)
 */
const TEMPERATURE_THRESHOLDS: Record<string, { warning: number; critical: number }> = {
  'Li-ion': { warning: 35, critical: 45 },
  'LiFePO4': { warning: 40, critical: 55 },
  'Lead-Acid': { warning: 40, critical: 50 },
  'NiMH': { warning: 40, critical: 50 },
  'NiCd': { warning: 45, critical: 55 },
};

/**
 * Define voltage thresholds by battery type (in Volts)
 * These are minimum acceptable voltage levels
 */
const VOLTAGE_THRESHOLDS: Record<string, number> = {
  'Li-ion': 3.0,
  'LiFePO4': 3.0,
  'Lead-Acid': 11.5,
  'NiMH': 1.0,
  'NiCd': 1.0,
};

/**
 * Generate condition-based alerts for a battery
 */
export const generateBatteryAlerts = (battery: BatteryAnalysis): GeneratedAlert[] => {
  const alerts: GeneratedAlert[] = [];

  // Check for high temperature
  const tempThreshold = TEMPERATURE_THRESHOLDS[battery.type];
  if (tempThreshold) {
    if (battery.temperature > tempThreshold.critical) {
      alerts.push({
        type: 'high_temperature',
        severity: 'critical',
        message: `Battery ${battery.batteryId} temperature critically high (${battery.temperature}°C). Immediate action needed to prevent thermal runaway.`,
      });
    } else if (battery.temperature > tempThreshold.warning) {
      alerts.push({
        type: 'high_temperature',
        severity: 'warning',
        message: `Battery ${battery.batteryId} temperature elevated (${battery.temperature}°C). Monitor closely to prevent overheating.`,
      });
    }
  }

  // Check for low voltage
  const voltageThreshold = VOLTAGE_THRESHOLDS[battery.type];
  if (voltageThreshold && battery.voltage < voltageThreshold) {
    alerts.push({
      type: 'low_voltage',
      severity: 'warning',
      message: `Battery ${battery.batteryId} voltage below optimal range (${battery.voltage}V). May indicate degradation or discharge.`,
    });
  }

  // Check for critical SoH
  if (battery.soh < 30) {
    alerts.push({
      type: 'critical_soh',
      severity: 'critical',
      message: `Battery ${battery.batteryId} State of Health critically low (${battery.soh}%). Ready for recycling. Located at: ${battery.location}.`,
    });
  } else if (battery.soh < 40) {
    alerts.push({
      type: 'critical_soh',
      severity: 'warning',
      message: `Battery ${battery.batteryId} State of Health declining (${battery.soh}%). Evaluate for repair or recycling soon.`,
    });
  }

  // Check for maintenance due (based on charge cycles)
  if (battery.chargeCycles > 800) {
    alerts.push({
      type: 'maintenance_due',
      severity: 'warning',
      message: `Battery ${battery.batteryId} has reached ${battery.chargeCycles} charge cycles. Schedule maintenance or replacement.`,
    });
  }

  return alerts;
};

/**
 * Generate a registration status alert
 */
export const generateStatusAlert = (
  batteryId: string,
  status: 'healthy' | 'repairable' | 'recyclable',
  soh: number,
  location: string,
  type: string
): GeneratedAlert => {
  switch (status) {
    case 'healthy':
      return {
        type: 'maintenance_due', // Using as status notification
        severity: 'warning',
        message: `${type} battery ${batteryId} registered as HEALTHY (SoH: ${soh}%). Location: ${location}. Suitable for continued use.`,
      };
    case 'repairable':
      return {
        type: 'maintenance_due',
        severity: 'warning',
        message: `${type} battery ${batteryId} registered as REPAIRABLE (SoH: ${soh}%). Location: ${location}. Consider repair or refurbishment.`,
      };
    case 'recyclable':
      return {
        type: 'critical_soh',
        severity: 'critical',
        message: `${type} battery ${batteryId} registered as RECYCLABLE (SoH: ${soh}%). Location: ${location}. Ready for proper disposal.`,
      };
    default:
      // Fallback for unknown status
      return {
        type: 'maintenance_due',
        severity: 'warning',
        message: `${type} battery ${batteryId} registered with status: ${status} (SoH: ${soh}%). Location: ${location}.`,
      };
  }
};
