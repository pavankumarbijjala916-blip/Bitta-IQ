# Email Service & Alert System Configuration Guide

## Overview

The BATT IQ Battery Management System includes an integrated alert system that:
1. **Creates condition-based alerts** when batteries match alert criteria
2. **Sends email notifications** to users about battery status
3. **Stores alerts in database** for persistent tracking and history
4. **Displays alerts in real-time** on the Alerts page

## Alert Creation Flow

### 1. Battery Registration Flow
When a battery is registered via the "Register Battery" page:

```
User Submits Form
    ↓
Calculate SoH (State of Health)
    ↓
Determine Status (healthy/repairable/recyclable)
    ↓
ADD BATTERY to Supabase ✓
    ↓
GENERATE CONDITION-BASED ALERTS ✓ (NEW)
    - Check temperature thresholds
    - Check voltage thresholds
    - Check SoH levels
    - Check charge cycles
    ↓
CREATE ALERTS in Supabase 'alerts' table ✓ (NEW)
    ↓
SEND EMAIL NOTIFICATION (existing)
    - Via backend email service on port 5001
    ↓
REDIRECT to Results Page
```

### 2. Alert Types Generated

#### Temperature Alerts
- **Threshold varies by battery type** (Li-ion: 35°C warning, 45°C critical)
- Triggered when temperature exceeds thresholds
- Severity: `warning` or `critical`

#### Voltage Alerts
- **Type-specific minimum voltage requirements** (Li-ion: 3.0V)
- Triggered when voltage falls below threshold
- Severity: `warning`

#### SoH (State of Health) Alerts
- **Critical SoH**: < 30% → critical severity
- **Declining SoH**: 30-40% → warning severity
- Triggered on battery registration if thresholds met

#### Maintenance Due Alerts
- **Charge cycle threshold**: > 800 cycles
- **Status-based**: Recyclable/Repairable status
- Severity: `warning`

### 3. Alert Storage in Supabase

Alerts are stored in the `alerts` table with:
- `id`: Unique identifier (UUID)
- `user_id`: Owner of the alert
- `battery_id`: Associated battery
- `type`: Alert type (high_temperature, low_voltage, critical_soh, maintenance_due)
- `severity`: Alert severity (warning, critical)
- `message`: Human-readable description
- `acknowledged`: Boolean flag for user interaction
- `created_at`: Timestamp

## Email Service Configuration

### Current Setup (Testing/Development)

The email service is configured to:
1. **Listen on `http://localhost:5001`**
2. **Accept POST requests** to `/api/notifications/email`
3. **Log emails locally** to `email-service/logs/` directory (since SendGrid API key is invalid)
4. **Return success response** regardless of SendGrid status

This is perfect for **development and testing** where you want to verify that:
- Email requests are being made
- Email content is correct
- The system integrates properly

### To View Logged Emails

1. **Via the email-service logs directory:**
   ```bash
   cat email-service/logs/2024-12-26-emails.json
   ```

2. **Via the email service logs endpoint:**
   ```bash
   curl http://localhost:5001/api/notifications/logs
   ```

### Production Setup: SendGrid Configuration

To send **actual emails** in production:

1. **Get a SendGrid API Key:**
   - Sign up at https://sendgrid.com
   - Create an API key from the Settings page
   - Key format: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx...`

2. **Update environment variables:**
   - **Frontend (.env):**
     ```dotenv
     VITE_SENDGRID_API_KEY=SG.your-actual-key-here
     VITE_SENDGRID_FROM_EMAIL=your-email@company.com
     ```
   
   - **Backend (email-service/.env):**
     ```dotenv
     SENDGRID_API_KEY=SG.your-actual-key-here
     SENDGRID_FROM_EMAIL=your-email@company.com
     ```

3. **Restart the email service:**
   ```bash
   cd email-service
   npm install  # Install @sendgrid/mail if not already installed
   node server.js
   ```

4. **Verify SendGrid is working:**
   ```bash
   curl http://localhost:5001/health
   # Should show: {"status":"ok","sendgridConfigured":true}
   ```

### Alternative: Nodemailer Setup

If you prefer to use **Nodemailer** (Gmail, Outlook, etc.):

1. Update `email-service/server.js` to use Nodemailer instead of SendGrid
2. Example configuration for Gmail:
   ```javascript
   const nodemailer = require('nodemailer');
   const transporter = nodemailer.createTransport({
     service: 'gmail',
     auth: {
       user: process.env.EMAIL_USER,
       pass: process.env.EMAIL_APP_PASSWORD
     }
   });
   ```

3. Update `.env` with credentials

## Running the System

### Start Email Service (Terminal 1)
```bash
cd email-service
npm start
# Server runs on http://localhost:5001
```

### Start Frontend Dev Server (Terminal 2)
```bash
npm run dev
# Vite dev server on http://localhost:5173
```

### Register a Battery
1. Navigate to http://localhost:5173
2. Login with test credentials
3. Click "Register Battery"
4. Fill in battery parameters:
   - Battery ID: BAT-TEST-001
   - Type: Li-ion
   - Voltage: 3.2 (triggers low_voltage alert)
   - Temperature: 40 (triggers high_temperature alert)
   - Charge Cycles: 150
   - Capacity: 60 (results in low SoH, triggers critical_soh alert)
   - Location: Lab 1
5. Click "Register & Analyze Battery"

### Verify Alerts Created
1. Navigate to the **Alerts** page
2. Should see alerts listed:
   - High temperature warning
   - Low voltage warning
   - Critical SoH alert
   - Status alert

### Verify Email Logged
1. Check email service logs:
   ```bash
   curl http://localhost:5001/api/notifications/logs | jq
   ```
   OR
   ```bash
   cat email-service/logs/$(date +%Y-%m-%d)-emails.json | jq
   ```

2. Should see email entry with:
   - Recipient email
   - Subject line
   - Battery status message

## Database Schema: alerts table

```sql
CREATE TABLE alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  battery_id VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX alerts_user_id_idx ON alerts(user_id);
CREATE INDEX alerts_battery_id_idx ON alerts(battery_id);
```

## Alert Service API (`src/services/alertService.ts`)

### generateBatteryAlerts()
Analyzes battery parameters and returns condition-based alerts.

```typescript
const alerts = generateBatteryAlerts({
  batteryId: 'BAT-001',
  temperature: 45,
  voltage: 3.0,
  soh: 25,
  chargeCycles: 850,
  type: 'Li-ion',
  location: 'Warehouse A'
});
// Returns: [high_temperature alert, critical_soh alert, maintenance_due alert]
```

### generateStatusAlert()
Creates a registration status alert based on battery health classification.

```typescript
const statusAlert = generateStatusAlert(
  'BAT-001',
  'recyclable',
  25,
  'Warehouse A',
  'Li-ion'
);
// Returns: critical SoH alert for recyclable status
```

## Troubleshooting

### Alerts Not Appearing on Alerts Page
1. **Check Supabase alerts table:**
   - Verify table exists and has correct schema
   - Check user_id filters are working correctly
   - Verify real-time subscription is active

2. **Check browser console for errors:**
   - Navigate to DevTools → Console Tab
   - Look for useAlerts or Supabase errors

3. **Test createAlert directly:**
   ```bash
   # In browser console
   const { createAlert } = useAlerts();
   await createAlert('BAT-TEST-001', 'high_temperature', 'warning', 'Test alert');
   ```

### Email Service Not Responding
1. **Check if service is running:**
   ```bash
   curl http://localhost:5001/health
   ```

2. **Check console logs:**
   ```bash
   cd email-service && npm start
   # Look for "✅ Ready to receive email requests!"
   ```

3. **Check VITE_NOTIFICATION_API_URL:**
   - Should be `http://localhost:5001`
   - Verify in browser console: `import.meta.env.VITE_NOTIFICATION_API_URL`

### SendGrid API Key Invalid
- Check that key format is correct (must start with `SG.`)
- Current setup logs emails locally instead - this is fine for testing
- To enable SendGrid, obtain a real API key and update `.env` files

## Files Modified/Created

- **NEW:** `src/services/alertService.ts` - Alert generation logic
- **UPDATED:** `src/pages/RegisterBattery.tsx` - Creates alerts on battery registration
- **EXISTING:** `src/hooks/useAlerts.tsx` - Alert management hook
- **EXISTING:** `src/pages/Alerts.tsx` - Alert display page
- **EXISTING:** `email-service/server.js` - Email service backend

## Next Steps

1. ✅ Register a battery and verify alerts creation
2. ✅ Check Alerts page population
3. ✅ Verify email logging in email-service
4. 🔄 Configure with real SendGrid key for production
5. 🔄 Set up email service auto-start on deployment
6. 🔄 Implement email digest/summary feature (optional)
