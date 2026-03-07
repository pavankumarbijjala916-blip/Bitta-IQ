// Enhanced types for BATT IQ v2.0
// Battery Health Monitoring System

// ========== Authentication & User Types ==========
export type UserRole = 'admin' | 'operator' | 'user';
export type Permission = 'view_all' | 'manage_users' | 'configure_system' | 'generate_reports' | 'manage_batteries';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  mfaEnabled: boolean;
  profileImage?: string;
  organization?: string;
  phone?: string;
  active: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'es' | 'fr' | 'de';
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    summary: 'instant' | 'daily' | 'weekly';
  };
  defaultView: string;
  timezone: string;
}

// ========== Battery Types ==========
export type BatteryType = 'Li-ion' | 'Lead-Acid' | 'NiMH' | 'NiCd' | 'LiFePO4' | 'Solid-State';
export type BatteryStatus = 'good' | 'moderate' | 'poor';
export type BatteryCondition = 'new' | 'healthy' | 'degraded' | 'critical' | 'end-of-life';

export interface BatterySpecifications {
  voltage: number; // Nominal voltage (V)
  capacity: number; // mAh or Ah
  chemistry: string;
  weight?: number; // grams
  size?: string;
  manufacturingDate?: Date;
  warrantyExpiry?: Date;
}

export interface BatteryMetrics {
  voltage: number; // Current voltage reading
  temperature: number; // Current temperature (°C)
  chargeCycles: number; // Total charge/discharge cycles
  stateOfHealth: number; // Percentage (0-100%)
  stateOfCharge?: number; // Current charge percentage
  internalResistance?: number; // Ohms
  estimatedRemainingLife?: number; // Days
}

export interface Battery {
  id: string;
  userId: string;
  manufacturerId: string;
  type: BatteryType;
  serialNumber: string;
  batchNumber?: string;
  specifications: BatterySpecifications;
  currentMetrics: BatteryMetrics;
  status: BatteryStatus;
  condition: BatteryCondition;
  location?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  lastAssessmentDate?: Date;
  metadata?: Record<string, any>;
}

// ========== Assessment & ML Prediction Types ==========
export interface AssessmentInput {
  batteryId: string;
  voltage: number;
  temperature: number;
  chargeCycles: number;
  capacity: number;
  usageDurationDays?: number;
  environmentalConditions?: {
    humidity?: number;
    ambientTemp?: number;
    vibration?: string;
  };
  notes?: string;
}

export interface MLPrediction {
  prediction: BatteryStatus;
  confidence: number; // 0-1
  probabilities: {
    good: number;
    moderate: number;
    poor: number;
  };
  featureImportance: {
    voltage: number;
    temperature: number;
    chargeCycles: number;
    capacity: number;
  };
  modelVersion: string;
  timestamp: Date;
}

export interface Assessment {
  id: string;
  batteryId: string;
  userId: string;
  inputData: AssessmentInput;
  mlPrediction: MLPrediction;
  healthCategory: BatteryStatus;
  recommendation: DisposalRecommendation;
  reportGenerated: boolean;
  notificationSent: boolean;
  assessmentDate: Date;
  createdAt: Date;
  metadata?: Record<string, any>;
}

// ========== Recommendations & Reports ==========
export type DisposalMethod = 'repair' | 'refurbish' | 'recycle' | 'safe-disposal' | 'research';
export type ReportType = 'individual' | 'fleet' | 'environmental' | 'trend-analysis';

export interface DisposalRecommendation {
  method: DisposalMethod;
  reasoning: string;
  estimatedValue?: number;
  recommendedFacility?: {
    name: string;
    location: string;
    contact: string;
    certifications: string[];
  };
  urgency: 'immediate' | 'soon' | 'scheduled';
  environmentalImpact?: string;
  cost?: number;
}

export interface Report {
  id: string;
  userId: string;
  assessmentId?: string;
  type: ReportType;
  title: string;
  content: string;
  metadata: {
    batteryCount?: number;
    dateRange?: { start: Date; end: Date };
    includeCharts: boolean;
    includeRecommendations: boolean;
  };
  generatedAt: Date;
  expiresAt?: Date;
  fileUrl?: string;
  format: 'pdf' | 'html' | 'json';
}

// ========== Notification & Alert Types ==========
export type NotificationType = 'health_alert' | 'maintenance_reminder' | 'disposal_recommendation' | 'report_ready' | 'system_alert';
export type NotificationChannel = 'in-app' | 'email' | 'push' | 'sms';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  data?: {
    batteryId?: string;
    assessmentId?: string;
    reportId?: string;
    actionUrl?: string;
  };
  channels: NotificationChannel[];
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  title: string;
  messageTemplate: string;
  channels: NotificationChannel[];
  priority: NotificationPriority;
  variables: string[]; // e.g., ["batteryId", "healthStatus", "recommendation"]
}

// ========== Chatbot Types ==========
export type Intent =
  | 'check_battery_health'
  | 'battery_parameters'
  | 'disposal_guidance'
  | 'safe_usage'
  | 'system_help'
  | 'report_request'
  | 'eco_quest'
  | 'password_reset'
  | 'email_issue'
  | 'faq'
  | 'other';

export interface ChatMessage {
  id: string;
  conversationId: string;
  userId: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  metadata?: {
    intent?: Intent;
    confidence?: number;
  };
}

export interface ChatbotResponse {
  text: string;
  intent: Intent;
  confidence: number;
  suggestions?: string[];
  actionableLinks?: { label: string; url: string }[];
  quickReplies?: string[];
}

export interface ChatIntent {
  id: string;
  name: Intent;
  keywords: string[];
  responseTemplates: string[];
  category: string;
  enabled: boolean;
}

export interface ChatFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  views: number;
  helpful: number;
  notHelpful: number;
}

// ========== Analytics & Dashboard Types ==========
export interface DashboardStats {
  totalBatteries: number;
  healthy: number;
  moderate: number;
  poor: number;
  totalAssessments: number;
  averageSoH: number;
  lastUpdateTime: Date;
}

export interface FleetAnalytics {
  period: 'day' | 'week' | 'month' | 'year';
  totalBatteries: number;
  healthDistribution: {
    good: number;
    moderate: number;
    poor: number;
  };
  averageAge: number;
  averageCycles: number;
  predictedRecyclingNeeded: number;
  environmentalImpact: {
    wasteReduced: number; // kg
    materialsRecovered: number; // kg
    co2Prevented: number; // kg
  };
}

export interface HealthTrend {
  date: Date;
  batteryId: string;
  soh: number;
  status: BatteryStatus;
  prediction: number;
}

// ========== Configuration Types ==========
export interface SystemConfig {
  mlModelVersion: string;
  apiEndpoints: Record<string, string>;
  thresholds: {
    healthyThreshold: number;
    moderateThreshold: number;
    poorThreshold: number;
    criticalTemperature: number;
    lowVoltageThreshold: number;
  };
  updateFrequency: number; // minutes
  retentionPolicy: {
    assessmentRetentionDays: number;
    reportRetentionDays: number;
  };
  lastUpdated: Date;
}

// ========== API Response Types ==========
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface MLPredictionResponse extends ApiResponse<MLPrediction> { }

export interface AssessmentResponse extends ApiResponse<Assessment> { }

// ========== Form Input Types ==========
export interface BatteryRegistrationForm {
  type: BatteryType;
  serialNumber: string;
  manufacturerId: string;
  voltage: number;
  capacity: number;
  location: string;
  notes?: string;
}

export interface AssessmentForm {
  batteryId: string;
  voltage: number;
  temperature: number;
  chargeCycles: number;
  capacity: number;
  environmentalConditions?: {
    humidity?: number;
    ambientTemp?: number;
    vibration?: string;
  };
  notes?: string;
}

// ========== Error Types ==========
export interface BatchError {
  batchId: string;
  message: string;
  code: string;
  timestamp: Date;
}

export class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Not authorized to perform this action') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class ResourceNotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = 'ResourceNotFoundError';
  }
}
