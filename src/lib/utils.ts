import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateNextCheckDate(status: string, lastUpdated: Date | string): Date {
  const date = new Date(lastUpdated);

  if (status === 'healthy') {
    // 6 months for healthy batteries
    date.setMonth(date.getMonth() + 6);
  } else if (status === 'repairable') {
    // 1 month for repairable batteries
    date.setMonth(date.getMonth() + 1);
  } else {
    // Immediate for recyclable (or return today/past date to indicate overdue)
    // We'll set it to the same date to imply immediate action
  }

  return date;
}

export function calculateEcoImpact(batteries: any[]) {
  // Constants
  const CO2_PER_KWH_MANUFACTURING = 150; // kg CO2 saved by not manufacturing a new battery
  const TREES_PER_TON_CO2 = 50; // Approximated trees needed to offset 1 ton of CO2

  let totalCapacityKWh = 0;

  batteries.forEach(battery => {
    // Assuming capacity is in Ah and nominal voltage is around 3.7V - 12V depending on type.
    // Simplifying: Use the 'capacity' field if it exists, or estimate.
    // If capacity is in mAh, convert to Ah.
    const capacityAh = battery.capacity / 1000;
    const voltage = battery.voltage || 12; // Default to 12V if missing

    const kwh = (capacityAh * voltage) / 1000;
    totalCapacityKWh += kwh;
  });

  const co2SavedKg = totalCapacityKWh * CO2_PER_KWH_MANUFACTURING;
  const treesPlanted = (co2SavedKg / 1000) * TREES_PER_TON_CO2;

  return {
    co2SavedKg: Math.round(co2SavedKg * 100) / 100, // Round to 2 decimals
    treesPlanted: Math.max(1, Math.round(treesPlanted)) // Always show at least 1 tree for positivity
  };
}

export function predictBatteryLife(type: string, chargeCycles: number, soh: number): { daysRemaining: number, failureDate: Date, confidence: number } {
  // AI Prediction Model Simulation

  // 1. Determine Max Cycles based on chemistry
  let maxCycles = 1000;
  switch (type) {
    case 'LiFePO4': maxCycles = 2000; break;
    case 'Li-ion': maxCycles = 1000; break;
    case 'Lead-Acid': maxCycles = 300; break;
    case 'NiMH': maxCycles = 500; break;
    default: maxCycles = 800;
  }

  // 2. Adjust Max Cycles based on current SoH (History of stress)
  // If SoH is lower than expected for the cycle count, reduce max cycles
  const expectedSoH = 100 - (chargeCycles / maxCycles * 20); // deeply simplified linear degradation
  const healthFactor = soh / expectedSoH;

  const adjustedMaxCycles = maxCycles * (healthFactor > 1 ? 1.1 : healthFactor); // Bonus if treated well

  // 3. Calculate Remaining Cycles
  const remainingCycles = Math.max(0, adjustedMaxCycles - chargeCycles);

  // 4. Estimate Daily Usage (Mocking usage pattern if not available)
  // In a real app, we'd average the last 30 days of usage logs.
  const estDailyCycles = 0.8; // conservative estimate

  const daysRemaining = Math.max(0, Math.round(remainingCycles / estDailyCycles));

  const failureDate = new Date();
  failureDate.setDate(failureDate.getDate() + daysRemaining);

  // 5. Calculate Confidence Score
  // Confidence drops as battery gets older or if data is weird
  let confidence = 0.85;
  if (chargeCycles < 50) confidence = 0.5; // Too new to tell
  if (soh < 50) confidence = 0.95; // Pretty sure it's dying

  return {
    daysRemaining,
    failureDate,
    confidence: Math.round(confidence * 100)
  };
}
