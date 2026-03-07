/**
 * Simple Email Service for BATT IQ
 * This service logs emails locally and optionally sends via SendGrid if configured
 * Run with: node server.js
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Email logs storage
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Try to initialize SendGrid if valid API key is provided
let sgMail = null;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@batt-iq.app';

if (SENDGRID_API_KEY && SENDGRID_API_KEY.startsWith('SG.')) {
  try {
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(SENDGRID_API_KEY);
    console.log('✅ SendGrid initialized with API key');
  } catch (err) {
    console.warn('⚠️ SendGrid initialization failed:', err.message);
  }
} else if (SENDGRID_API_KEY) {
  console.warn('⚠️ Invalid SendGrid API key format (must start with "SG.")');
  console.log('📧 Email service will log emails locally instead');
}

// Middleware – allow all origins for flexible deployment
app.use(cors({
  origin: (origin, callback) => {
    // Allow all origins for the deployed frontend to communicate with the backend
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-API-Key', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Email service is running',
    sendgridConfigured: !!sgMail
  });
});

// Send email endpoint
app.post('/api/notifications/email', async (req, res) => {
  try {
    const { email, subject, htmlContent, recipientName, templateType } = req.body;

    // Validate required fields
    if (!email || !subject || !htmlContent) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, subject, htmlContent'
      });
    }

    console.log(`\n📧 Email Request Received:`);
    console.log(`   To: ${email}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Type: ${templateType || 'custom'}`);

    // Log email to file
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      to: email,
      recipientName,
      subject,
      templateType,
      htmlPreview: htmlContent.substring(0, 200) + '...',
    };

    const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}-emails.json`);
    let existingLogs = [];
    try {
      if (fs.existsSync(logFile)) {
        existingLogs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
      }
    } catch (err) {
      console.warn('Could not read existing logs:', err.message);
    }

    existingLogs.push(logEntry);
    fs.writeFileSync(logFile, JSON.stringify(existingLogs, null, 2));

    let sendgridResult = false;
    let errorMsg = '';

    // Try to send via SendGrid if configured
    if (sgMail) {
      try {
        const msg = {
          to: email,
          from: FROM_EMAIL,
          subject: subject,
          html: htmlContent,
          replyTo: FROM_EMAIL,
        };

        await sgMail.send(msg);
        console.log(`✅ Email sent successfully via SendGrid to: ${email}`);
        sendgridResult = true;
      } catch (sendgridError) {
        console.warn(`⚠️ SendGrid send failed:`, sendgridError.message);
        errorMsg = sendgridError.message;
      }
    } else {
      console.log(`✅ Email logged locally (SendGrid not configured)`);
    }

    res.json({
      success: true,
      message: `Email processed for ${email}`,
      sendgridSent: sendgridResult,
      loggedLocally: true,
      timestamp,
      error: errorMsg || undefined,
    });

  } catch (error) {
    console.error('❌ Error processing email:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to process email',
      error: error.message,
    });
  }
});

// Send report email (same as /email but explicit for reports – accepts full HTML body)
app.post('/api/reports/email', async (req, res) => {
  try {
    const { email, subject, htmlContent, recipientName } = req.body;

    if (!email || !subject || !htmlContent) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, subject, htmlContent',
      });
    }

    console.log('\n📧 Report Email Request:');
    console.log('   To:', email);
    console.log('   Subject:', subject);

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      to: email,
      recipientName,
      subject,
      type: 'report',
      htmlPreview: htmlContent.substring(0, 200) + '...',
    };

    const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}-emails.json`);
    let existingLogs = [];
    try {
      if (fs.existsSync(logFile)) {
        existingLogs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
      }
    } catch (err) {
      console.warn('Could not read existing logs:', err.message);
    }
    existingLogs.push(logEntry);
    fs.writeFileSync(logFile, JSON.stringify(existingLogs, null, 2));

    let sendgridResult = false;
    let errorMsg = '';

    if (sgMail) {
      try {
        await sgMail.send({
          to: email,
          from: FROM_EMAIL,
          subject,
          html: htmlContent,
          replyTo: FROM_EMAIL,
        });
        console.log('✅ Report email sent via SendGrid to:', email);
        sendgridResult = true;
      } catch (sendgridError) {
        console.warn('⚠️ SendGrid send failed:', sendgridError.message);
        errorMsg = sendgridError.message;
      }
    } else {
      console.log('✅ Report email logged locally (SendGrid not configured)');
    }

    res.json({
      success: true,
      message: `Report email processed for ${email}`,
      sendgridSent: sendgridResult,
      loggedLocally: true,
      timestamp,
      error: errorMsg || undefined,
    });
  } catch (error) {
    console.error('❌ Report email error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to process report email',
      error: error.message,
    });
  }
});

// In-memory telemetry storage (for demo purposes)
let latestTelemetry = null;
let lastReceivedAt = 0; // Timestamp when last data was received

// Telemetry endpoint - Python Agent pushes data here
app.post('/api/telemetry', (req, res) => {
  try {
    const data = req.body;
    console.log('📥 POST /api/telemetry received:', data); // Added log
    lastReceivedAt = Date.now();
    latestTelemetry = {
      ...data,
      serverTime: new Date().toISOString()
    };
    console.log('✅ Updated latestTelemetry:', latestTelemetry.percent + '%'); // Added log
    res.json({ success: true, timestamp: latestTelemetry.serverTime });
  } catch (error) {
    console.error('Telemetry error:', error.message);
    res.status(500).json({ success: false });
  }
});

// Telemetry endpoint - Frontend reads data here
app.get('/api/telemetry', (req, res) => {
  const isConnected = (Date.now() - lastReceivedAt) < 30000; // 30 seconds tolerance

  res.json({
    success: true,
    data: latestTelemetry,
    connected: isConnected
  });
});

// Get email logs endpoint
app.get('/api/notifications/logs', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(logsDir, `${today}-emails.json`);

    let logs = [];
    if (fs.existsSync(logFile)) {
      logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    }

    res.json({
      success: true,
      count: logs.length,
      logs: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 ================================');
  console.log('   Email Service Started');
  console.log('🚀 ================================');
  console.log(`📍 Port: ${PORT}`);
  console.log(`📧 From Email: ${FROM_EMAIL}`);
  console.log(`💾 Logs Directory: ${logsDir}`);
  console.log(`🔧 SendGrid: ${sgMail ? 'Configured ✅' : 'Not Configured ⚠️'}`);
  console.log('\n📌 Endpoints:');
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   POST http://localhost:${PORT}/api/notifications/email`);
  console.log(`   POST http://localhost:${PORT}/api/reports/email`);
  console.log(`   GET  http://localhost:${PORT}/api/notifications/logs`);
  console.log('\n✅ Ready to receive email requests!\n');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n📍 Email service stopped gracefully');
  process.exit(0);
});

// Global Error Handlers to prevent crashes
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION:', err);
  // Keep running if possible, but log it
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION at:', promise, 'reason:', reason);
});
