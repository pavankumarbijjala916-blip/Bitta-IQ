/**
 * Simple Email Service using SendGrid
 * Run this with: node email-service.js
 * This backend service handles all email sending for the BATT IQ application
 */

import express from 'express';
import cors from 'cors';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@batt-iq.app';

if (!SENDGRID_API_KEY) {
  console.error('❌ SENDGRID_API_KEY is not set!');
  console.error('Add SENDGRID_API_KEY to your .env file');
  process.exit(1);
}

sgMail.setApiKey(SENDGRID_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Root and Health check endpoints
app.get('/', (req, res) => {
  res.send('Bitta-IQ Backend Server is Running 🚀');
});

app.get('/health', (req, res) => {
  res.json({ status: 'Server running' });
});

// Notifications API base info endpoint (for browser tests)
app.get('/api/notifications', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Notifications API is running. Use POST /api/notifications/email to send emails.'
  });
});

// Send email endpoint
app.post('/api/notifications/email', async (req, res) => {
  try {
    const { email, subject, htmlContent, recipientName } = req.body;

    // Validate required fields
    if (!email || !subject || !htmlContent) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, subject, htmlContent'
      });
    }

    console.log(`📧 Sending email to: ${email}`);
    console.log(`📋 Subject: ${subject}`);

    // Send email via SendGrid
    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: subject,
      html: htmlContent,
      replyTo: FROM_EMAIL,
    };

    await sgMail.send(msg);

    console.log(`✅ Email sent successfully to: ${email}`);

    res.json({
      success: true,
      message: `Email sent to ${email}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    console.error('Error details:', error.response?.body || error);

    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message,
    });
  }
});

// Send report email endpoint (alias for notifications/email but specific for reports)
app.post('/api/reports/email', async (req, res) => {
  // Reuse the same logic, just ensure subject/htmlContent are present
  // This endpoint matches what the frontend ReportService tries to call first
  try {
    const { email, subject, htmlContent } = req.body;

    if (!email || !subject || !htmlContent) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields for report: email, subject, htmlContent'
      });
    }

    console.log(`📧 Sending REPORT to: ${email}`);

    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: subject,
      html: htmlContent,
      replyTo: FROM_EMAIL,
    };

    await sgMail.send(msg);

    console.log(`✅ Report sent successfully to: ${email}`);

    res.json({
      success: true,
      message: `Report sent to ${email}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Report sending failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send report',
      error: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Email Service started on port', PORT);
  console.log('📧 SendGrid configured with email:', FROM_EMAIL);
  console.log('✅ Ready to send emails!');
  console.log('\nEndpoints:');
  console.log(`  GET  http://localhost:${PORT}/health`);
  console.log(`  POST http://localhost:${PORT}/api/notifications/email`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n📍 Email service stopped');
  process.exit(0);
});
