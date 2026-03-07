// Notification Service
import { notificationOperations } from '@/integrations/firebase/operations';
import axios from 'axios';
import type { Notification, NotificationType, NotificationChannel } from '@/types/enhanced';

interface EmailNotificationPayload {
  email: string;
  subject: string;
  htmlContent: string;
  recipientName: string;
  batteryId?: string;
  assessmentId?: string;
}

// Base URL for email API - always use relative path so Vite proxy handles the
// HTTP → HTTP request. Absolute http:// URLs are blocked by browsers on HTTPS pages.
const NOTIFICATION_API_URL = import.meta.env.VITE_NOTIFICATION_API_URL || '/api/notifications';
const NOTIFICATION_API_KEY = import.meta.env.VITE_NOTIFICATION_API_KEY || '';

// Simple local email logging system
const localEmailLog: Array<{
  timestamp: string;
  to: string;
  subject: string;
  content: string;
}> = [];

// Function to log emails locally (for development/testing)
const logEmailLocally = (to: string, subject: string, htmlContent: string) => {
  const emailEntry = {
    timestamp: new Date().toISOString(),
    to,
    subject,
    content: htmlContent,
  };
  localEmailLog.push(emailEntry);

  // Store in localStorage for persistence
  if (typeof window !== 'undefined') {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('battiq_email_logs') || '[]');
      existingLogs.push(emailEntry);
      // Keep only last 50 emails
      const recentLogs = existingLogs.slice(-50);
      localStorage.setItem('battiq_email_logs', JSON.stringify(recentLogs));
    } catch (err) {
      console.log('Could not save to localStorage:', err);
    }
  }

  console.log('📧 EMAIL LOG:', {
    to,
    subject,
    timestamp: new Date().toLocaleString(),
    preview: htmlContent.substring(0, 100) + '...',
  });
};

export const notificationService = {
  // Create and send in-app notification
  async sendInAppNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<string> {
    const urgentTypes: NotificationType[] = ['disposal_recommendation', 'system_alert'];
    const notification: Omit<Notification, 'id' | 'createdAt'> = {
      userId,
      type,
      title,
      message,
      priority: urgentTypes.includes(type) ? 'urgent' : 'normal',
      data,
      channels: ['in-app'],
      read: false,
    };

    return await notificationOperations.create(notification);
  },

  // Send email notification
  async sendEmailNotification(
    email: string,
    displayName: string,
    subject: string,
    templateType: 'health_report' | 'disposal_recommendation' | 'assessment_complete' | 'alert',
    templateData: Record<string, any>
  ): Promise<boolean> {
    try {
      const htmlContent = this.generateEmailTemplate(templateType, templateData);

      // Log email locally for debugging/testing
      logEmailLocally(email, subject, htmlContent);

      // Try to send via API if URL is configured (API key optional for local email service)
      if (NOTIFICATION_API_URL) {
        try {
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (NOTIFICATION_API_KEY) headers['X-API-Key'] = NOTIFICATION_API_KEY;
          const response = await axios.post(
            `${NOTIFICATION_API_URL}/email`,
            {
              email,
              subject,
              htmlContent,
              recipientName: displayName,
              templateType,
              data: templateData,
            },
            { headers, timeout: 5000 }
          );

          console.log('✅ Email sent via API:', email);
          return response.data?.success ?? true;
        } catch (apiError) {
          console.warn('⚠️ API email send failed:', apiError);
          // Continue with local logging as fallback
        }
      } else {
        console.log('ℹ️ Notification API URL not configured. Email logged locally.');
        console.log('📧 To send emails, set VITE_NOTIFICATION_API_URL (e.g. http://localhost:5001/api/notifications) and run the email-service.');
      }

      // Return success since email was logged locally
      return true;
    } catch (error) {
      console.error('❌ Email notification error:', error);
      return false;
    }
  },

  /** Send a report email with custom HTML body (e.g. from reportService.generateReportHTML). Uses backend /api/reports/email or fallback to /api/notifications/email. */
  async sendReportByEmail(
    email: string,
    displayName: string,
    subject: string,
    htmlContent: string
  ): Promise<boolean> {
    try {
      logEmailLocally(email, subject, htmlContent);

      const reportUrl = '/api/reports/email';
      const fallbackUrl = '/api/notifications/email';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (NOTIFICATION_API_KEY) headers['X-API-Key'] = NOTIFICATION_API_KEY;
      const payload = { email, subject, htmlContent, recipientName: displayName };

      try {
        const response = await axios.post(reportUrl, payload, { headers, timeout: 10000 });
        return response.data?.success ?? true;
      } catch (reportErr) {
        try {
          const response = await axios.post(fallbackUrl, { ...payload, templateType: 'report' }, { headers, timeout: 10000 });
          return response.data?.success ?? true;
        } catch (fallbackErr) {
          console.warn('⚠️ Report email API failed:', reportErr, fallbackErr);
        }
      }
      return true;
    } catch (error) {
      console.error('❌ Report email error:', error);
      return false;
    }
  },

  // Send push notification (FCM)
  async sendPushNotification(
    deviceToken: string,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<boolean> {
    try {
      const response = await axios.post(
        `${NOTIFICATION_API_URL}/push`,
        {
          deviceToken,
          title,
          message,
          data,
        },
        {
          headers: {
            'X-API-Key': import.meta.env.VITE_NOTIFICATION_API_KEY,
          },
        }
      );

      return response.data.success;
    } catch (error) {
      console.error('Push notification failed:', error);
      return false;
    }
  },

  // Batch send notifications
  async sendBatch(
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<number> {
    let successCount = 0;

    for (const userId of userIds) {
      try {
        await this.sendInAppNotification(userId, type, title, message, data);
        successCount++;
      } catch (error) {
        console.error(`Failed to notify user ${userId}:`, error);
      }
    }

    return successCount;
  },

  // Generate health report email
  async sendHealthReport(
    email: string,
    displayName: string,
    batteryId: string,
    healthStatus: string,
    confidence: number,
    recommendations: string
  ): Promise<boolean> {
    return this.sendEmailNotification(
      email,
      displayName,
      '🔋 Your Battery Health Assessment Report',
      'health_report',
      {
        displayName,
        batteryId,
        healthStatus,
        confidence: Math.round(confidence * 100),
        recommendations,
        timestamp: new Date().toLocaleDateString(),
      }
    );
  },

  // Generate disposal recommendation email
  async sendDisposalRecommendation(
    email: string,
    displayName: string,
    batteryId: string,
    method: string,
    reasoning: string,
    facilityName?: string
  ): Promise<boolean> {
    return this.sendEmailNotification(
      email,
      displayName,
      '♻️ Battery Disposal Recommendation',
      'disposal_recommendation',
      {
        displayName,
        batteryId,
        method,
        reasoning,
        facilityName: facilityName || 'Nearest certified facility',
        timestamp: new Date().toLocaleDateString(),
      }
    );
  },

  // Send recyclable battery alert
  async sendRecyclableBatteryAlert(
    email: string,
    displayName: string,
    batteryId: string,
    batteryType: string,
    soh: number,
    location: string
  ): Promise<boolean> {
    return this.sendEmailNotification(
      email,
      displayName,
      '⚠️ Recyclable Battery Alert - Immediate Action Required',
      'alert',
      {
        displayName,
        message: `
          <h2 style="color: #ff6b6b; margin-bottom: 15px;">Battery Recyclable Status Detected</h2>
          <p>A battery has been registered with <strong>recyclable</strong> status and requires immediate action:</p>
          <ul style="line-height: 1.8; margin: 15px 0;">
            <li><strong>Battery ID:</strong> ${batteryId}</li>
            <li><strong>Battery Type:</strong> ${batteryType}</li>
            <li><strong>State of Health (SoH):</strong> ${soh.toFixed(1)}%</li>
            <li><strong>Location:</strong> ${location}</li>
          </ul>
          <p style="color: #ff6b6b; font-weight: bold; margin-top: 20px;">⚠️ This battery should be safely stored and scheduled for recycling at a certified facility as soon as possible.</p>
          <p style="margin-top: 15px;">Visit our system to:</p>
          <ul>
            <li>View detailed assessment results</li>
            <li>Find nearby certified recycling facilities</li>
            <li>Schedule disposal pickup</li>
          </ul>
        `,
        timestamp: new Date().toLocaleDateString(),
      }
    );
  },

  // Send healthy battery confirmation
  async sendHealthyBatteryAlert(
    email: string,
    displayName: string,
    batteryId: string,
    batteryType: string,
    soh: number,
    location: string
  ): Promise<boolean> {
    return this.sendEmailNotification(
      email,
      displayName,
      '✅ Healthy Battery Registered - No Action Required',
      'alert',
      {
        displayName,
        message: `
          <h2 style="color: #2d6a4f; margin-bottom: 15px;">Battery Health Status: Excellent ✅</h2>
          <p>Your battery has been registered and assessed as <strong>HEALTHY</strong>. Great news!</p>
          <ul style="line-height: 1.8; margin: 15px 0;">
            <li><strong>Battery ID:</strong> ${batteryId}</li>
            <li><strong>Battery Type:</strong> ${batteryType}</li>
            <li><strong>State of Health (SoH):</strong> ${soh.toFixed(1)}%</li>
            <li><strong>Location:</strong> ${location}</li>
          </ul>
          <p style="color: #2d6a4f; font-weight: bold; margin-top: 20px;">✅ Your battery is in excellent condition and is safe for continued use.</p>
          <p style="margin-top: 15px;">Recommendations:</p>
          <ul>
            <li>Continue normal usage - no action needed</li>
            <li>Monitor battery performance regularly</li>
            <li>Use optimal charging practices to maintain health</li>
            <li>Schedule periodic health assessments (annually)</li>
          </ul>
        `,
        timestamp: new Date().toLocaleDateString(),
      }
    );
  },

  // Send repairable battery alert
  async sendRepairableBatteryAlert(
    email: string,
    displayName: string,
    batteryId: string,
    batteryType: string,
    soh: number,
    location: string
  ): Promise<boolean> {
    return this.sendEmailNotification(
      email,
      displayName,
      '🔧 Repairable Battery Alert - Maintenance Recommended',
      'alert',
      {
        displayName,
        message: `
          <h2 style="color: #ff8c42; margin-bottom: 15px;">Battery Status: Repairable (⚠️ Action Recommended)</h2>
          <p>Your battery has been registered with <strong>repairable</strong> status. It can still be used but maintenance is recommended:</p>
          <ul style="line-height: 1.8; margin: 15px 0;">
            <li><strong>Battery ID:</strong> ${batteryId}</li>
            <li><strong>Battery Type:</strong> ${batteryType}</li>
            <li><strong>State of Health (SoH):</strong> ${soh.toFixed(1)}%</li>
            <li><strong>Location:</strong> ${location}</li>
          </ul>
          <p style="color: #ff8c42; font-weight: bold; margin-top: 20px;">🔧 This battery shows signs of degradation and should be repaired or refurbished before continued use.</p>
          <p style="margin-top: 15px;">Recommended Actions:</p>
          <ul>
            <li>Schedule maintenance or repair at a certified facility</li>
            <li>Consider battery refurbishment to extend lifespan</li>
            <li>Avoid heavy-duty usage until repaired</li>
            <li>Replace protective components if damaged</li>
            <li>Monitor performance closely during continued use</li>
          </ul>
        `,
        timestamp: new Date().toLocaleDateString(),
      }
    );
  },

  // Send maintenance reminder
  async sendMaintenanceReminder(
    email: string,
    displayName: string,
    batteryId: string,
    batteryType: string,
    status: string,
    dueDate: string
  ): Promise<boolean> {
    return this.sendEmailNotification(
      email,
      displayName,
      '📅 Maintenance Required: Battery Check Overdue',
      'alert',
      {
        displayName,
        message: `
          <h2 style="color: #d63384; margin-bottom: 15px;">Maintenance Confirmation Required</h2>
          <p>This is a reminder that a scheduled health check for your battery is <strong>overdue</strong>.</p>
          <ul style="line-height: 1.8; margin: 15px 0;">
            <li><strong>Battery ID:</strong> ${batteryId}</li>
            <li><strong>Type:</strong> ${batteryType}</li>
            <li><strong>Current Status:</strong> ${status.toUpperCase()}</li>
            <li><strong>Scheduled Due Date:</strong> ${dueDate}</li>
          </ul>
          <p style="color: #d63384; font-weight: bold; margin-top: 20px;">📅 Please perform a health assessment immediately to ensure safe operation.</p>
          <p style="margin-top: 15px;">Actions Required:</p>
          <ul>
            <li>Inspect battery for physical damage</li>
            <li>Measure current voltage and temperature</li>
            <li>Update battery status in BATT IQ</li>
          </ul>
        `,
        timestamp: new Date().toLocaleDateString(),
      }
    );
  },
  generateEmailTemplate(
    templateType: 'health_report' | 'disposal_recommendation' | 'assessment_complete' | 'alert',
    data: Record<string, any>
  ): string {
    const baseStyles = `
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .card { background: #f5f5f5; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
      .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
      .footer { background: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #666; }
    `;

    switch (templateType) {
      case 'health_report':
        return `
          <html>
            <head><style>${baseStyles}</style></head>
            <body>
              <div class="header"><h1>🔋 Battery Health Report</h1></div>
              <div class="container">
                <p>Hi ${data.displayName},</p>
                <p>Your battery assessment for <strong>${data.batteryId}</strong> is complete!</p>
                <div class="card">
                  <h3>Health Status: <span style="color: ${data.healthStatus === 'good' ? 'green' : data.healthStatus === 'moderate' ? 'orange' : 'red'};">${data.healthStatus.toUpperCase()}</span></h3>
                  <p><strong>Confidence:</strong> ${data.confidence}%</p>
                  <p><strong>Recommendations:</strong></p>
                  <p>${data.recommendations}</p>
                </div>
                <a href="https://batt-iq.app/results" class="button">View Detailed Report</a>
                <div class="footer">
                  <p>BATT IQ - Battery Intelligence & Quality System</p>
                  <p>Date: ${data.timestamp}</p>
                </div>
              </div>
            </body>
          </html>
        `;

      case 'disposal_recommendation':
        return `
          <html>
            <head><style>${baseStyles}</style></head>
            <body>
              <div class="header"><h1>♻️ Disposal Recommendation</h1></div>
              <div class="container">
                <p>Hi ${data.displayName},</p>
                <p>Based on the assessment of battery <strong>${data.batteryId}</strong>, we recommend:</p>
                <div class="card">
                  <h3>${data.method.toUpperCase()}</h3>
                  <p>${data.reasoning}</p>
                  <p><strong>Facility:</strong> ${data.facilityName}</p>
                </div>
                <p>Responsible disposal protects the environment and recovers valuable materials.</p>
                <a href="https://batt-iq.app/recommendations" class="button">Find Facilities</a>
                <div class="footer">
                  <p>BATT IQ - Battery Intelligence & Quality System</p>
                  <p>Date: ${data.timestamp}</p>
                </div>
              </div>
            </body>
          </html>
        `;

      case 'assessment_complete':
        return `
          <html>
            <head><style>${baseStyles}</style></head>
            <body>
              <div class="header"><h1>✅ Assessment Complete</h1></div>
              <div class="container">
                <p>Hi ${data.displayName},</p>
                <p>Your battery assessment has been completed successfully.</p>
                <div class="card">
                  <p>Battery ID: ${data.batteryId}</p>
                  <p>Status: ${data.status}</p>
                </div>
                <a href="https://batt-iq.app/results" class="button">View Results</a>
                <div class="footer">
                  <p>BATT IQ - Battery Intelligence & Quality System</p>
                </div>
              </div>
            </body>
          </html>
        `;

      case 'alert':
        return `
          <html>
            <head><style>${baseStyles}</style></head>
            <body>
              <div class="header" style="background: #ff6b6b;"><h1>⚠️ Alert</h1></div>
              <div class="container">
                <p>Hi ${data.displayName},</p>
                <div class="card">${data.message}</div>
                <a href="https://batt-iq.app/alerts" class="button">View Alert Details</a>
                <div class="footer">
                  <p>BATT IQ - Battery Intelligence & Quality System</p>
                </div>
              </div>
            </body>
          </html>
        `;

      default:
        return '<p>Notification from BATT IQ</p>';
    }
  },

  // Get notification preferences for user
  async getPreferences(userId: string) {
    try {
      if (!NOTIFICATION_API_URL) {
        console.warn('⚠️ Notification API URL not configured');
        return null;
      }

      const response = await axios.get(
        `${NOTIFICATION_API_URL}/preferences/${userId}`,
        {
          headers: {
            'X-API-Key': NOTIFICATION_API_KEY,
          },
          timeout: 5000,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
      return null;
    }
  },

  // Update notification preferences
  async updatePreferences(
    userId: string,
    preferences: {
      emailEnabled: boolean;
      pushEnabled: boolean;
      inAppEnabled: boolean;
      frequency: 'instant' | 'daily' | 'weekly';
    }
  ) {
    try {
      if (!NOTIFICATION_API_URL) {
        console.warn('⚠️ Notification API URL not configured');
        return false;
      }

      await axios.put(
        `${NOTIFICATION_API_URL}/preferences/${userId}`,
        preferences,
        {
          headers: {
            'X-API-Key': NOTIFICATION_API_KEY,
          },
          timeout: 5000,
        }
      );
      return true;
    } catch (error) {
      console.error('Failed to update preferences:', error);
      return false;
    }
  },

  // Get email logs (for development/debugging)
  getEmailLogs() {
    if (typeof window !== 'undefined') {
      try {
        const logs = JSON.parse(localStorage.getItem('battiq_email_logs') || '[]');
        return logs;
      } catch (err) {
        console.error('Failed to retrieve email logs:', err);
        return [];
      }
    }
    return localEmailLog;
  },

  // Clear email logs
  clearEmailLogs() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('battiq_email_logs');
      } catch (err) {
        console.error('Failed to clear email logs:', err);
      }
    }
    localEmailLog.length = 0;
  },

};
