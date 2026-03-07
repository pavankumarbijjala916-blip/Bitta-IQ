# Alert System Testing Guide

## Current Status ✅

The alert system has been successfully implemented with the following features:

### ✅ Completed Implementations
1. **Condition-Based Alert Generation** (`src/services/alertService.ts`)
   - Temperature thresholds by battery type
   - Voltage thresholds by battery type
   - SoH (State of Health) level checks
   - Charge cycle monitoring
   - Customizable severity levels (warning/critical)

2. **Database Alert Storage** (updated `src/pages/RegisterBattery.tsx`)
   - Creates persistent alerts in Supabase `alerts` table
   - Links alerts to specific batteries via `battery_id`
   - Associates alerts with users via `user_id`
   - Stores alert metadata (type, severity, message, timestamp)

3. **Battery Registration Integration**
   - Automatically generates alerts on battery registration
   - Creates both condition-based and status alerts
   - Independent of email service (alerts stored regardless of email success)

4. **Email Service Infrastructure**
   - Backend service listening on `http://localhost:5001`
   - Logs emails locally in `email-service/logs/`
   - Ready to integrate with SendGrid for production

5. **Real-time Alert Display** (`src/pages/Alerts.tsx`)
   - Displays all user alerts from database
   - Real-time updates via Supabase subscriptions
   - Acknowledge/dismiss functionality
   - Alert count badge

## How to Test

### Test Setup
Before testing, ensure:
- ✅ Dev server running: `http://localhost:8083`
- ✅ Email service running: `http://localhost:5001`
- ✅ Logged in as a user
- ✅ Ready to register a battery

### Test Case 1: Register Battery with Low Temperature Alert
**Objective:** Verify temperature alert generation

1. **Navigate to Register Battery page**
   - URL: `http://localhost:8083/register-battery`

2. **Fill in form with high temperature:**
   ```
   Battery ID:        BAT-TEMP-001
   Type:              Li-ion
   Voltage:           3.5 V
   Temperature:       45°C  ← ABOVE CRITICAL (Li-ion critical = 45°C)
   Charge Cycles:     100
   Capacity:          85 %
   Location:          Lab 1
   ```

3. **Expected Results:**
   - ✅ Battery successfully registered
   - ✅ Email notification sent (to email service)
   - ✅ SUCCESS toast message with "Battery registered!"
   - ✅ Redirected to Results page
   - ✅ Alerts page shows high_temperature alert with CRITICAL severity

4. **Verification Steps:**
   ```bash
   # Check database alert
   curl http://localhost:8083/api/alerts  # If endpoint exists
   
   # OR manually verify in Supabase SQL editor:
   SELECT * FROM alerts WHERE battery_id = 'BAT-TEMP-001';
   # Should see high_temperature alert with severity='critical'
   
   # Check email service logs
   curl http://localhost:5001/api/notifications/logs | jq
   # Should show email for battery registration
   ```

### Test Case 2: Register Battery with Low Voltage Alert
**Objective:** Verify voltage alert generation

1. **Fill in form with low voltage:**
   ```
   Battery ID:        BAT-VOLT-001
   Type:              Li-ion
   Voltage:           2.8 V   ← BELOW THRESHOLD (Li-ion threshold = 3.0V)
   Temperature:       25°C
   Charge Cycles:     200
   Capacity:          80 %
   Location:          Warehouse A
   ```

2. **Expected Results:**
   - ✅ Battery successfully registered
   - ✅ Alerts page shows low_voltage alert with WARNING severity

### Test Case 3: Register Battery with Critical SoH Alert
**Objective:** Verify SoH alert generation

1. **Fill in form with low capacity (triggers critical SoH):**
   ```
   Battery ID:        BAT-SOH-001
   Type:              Lead-Acid
   Voltage:           11.8 V
   Temperature:       30°C
   Charge Cycles:     900  ← HIGH CYCLES
   Capacity:          20 %
   Location:          Warehouse B
   ```

   **Note:** The calculateSoH() function will compute SoH based on these parameters.
   It will likely be low due to high charge cycles.

2. **Expected Results:**
   - ✅ Battery successfully registered
   - ✅ Alerts page shows critical_soh alert with CRITICAL severity

### Test Case 4: Register Healthy Battery
**Objective:** Verify status alert for healthy battery

1. **Fill in form with optimal parameters:**
   ```
   Battery ID:        BAT-HEALTHY-001
   Type:              Li-ion
   Voltage:           3.7 V
   Temperature:       22°C
   Charge Cycles:     50
   Capacity:          95 %
   Location:          Lab 1
   ```

2. **Expected Results:**
   - ✅ Battery successfully registered with HEALTHY status
   - ✅ Alerts page shows maintenance_due alert (status registration)
   - ✅ Message mentions battery is HEALTHY

### Test Case 5: Multiple Conditions Alert
**Objective:** Verify multiple alerts created for single battery

1. **Fill in form that triggers MULTIPLE alert conditions:**
   ```
   Battery ID:        BAT-MULTI-001
   Type:              Li-ion
   Voltage:           2.5 V      ← LOW (< 3.0 threshold)
   Temperature:       48°C       ← HIGH (> 45 critical)
   Charge Cycles:     850        ← HIGH (> 800)
   Capacity:          25 %       ← LOW (SoH will be < 30)
   Location:          Warehouse C
   ```

2. **Expected Results:**
   - ✅ Battery successfully registered
   - ✅ MULTIPLE alerts visible on Alerts page:
     - high_temperature (CRITICAL)
     - low_voltage (WARNING)
     - critical_soh (CRITICAL)
     - maintenance_due (WARNING)

### Test Case 6: Alert Display & Interaction
**Objective:** Verify Alerts page functionality

1. **After registering batteries, navigate to Alerts page**
   - URL: `http://localhost:8083/alerts`

2. **Verify display:**
   - ✅ All alerts from multiple batteries shown
   - ✅ Alert count badge in header (next to "Alerts")
   - ✅ Alert icons colored by severity (red=critical, yellow=warning)
   - ✅ Alert messages readable and informative
   - ✅ Battery ID shown in alert details

3. **Test interaction:**
   - ✅ Click "Acknowledge" button → Alert marked as acknowledged
   - ✅ Click "Dismiss" button → Alert removed from list
   - ✅ "Acknowledge All" button acknowledges all unacknowledged alerts

### Test Case 7: Email Service Logging
**Objective:** Verify email service receives and logs requests

1. **After battery registration, check email service:**
   ```bash
   # Check email service logs endpoint
   curl http://localhost:5001/api/notifications/logs | jq '.'
   ```

2. **Expected Response:**
   ```json
   {
     "success": true,
     "count": 3,
     "logs": [
       {
         "timestamp": "2024-12-26T15:30:45.123Z",
         "to": "user@example.com",
         "subject": "Battery BAT-TEMP-001 Registered - CRITICAL ALERT",
         "templateType": "recyclable_battery_alert",
         "htmlPreview": "..."
       },
       // ... more email entries
     ]
   }
   ```

3. **Check local log file:**
   ```bash
   # See today's emails log file
   cat email-service/logs/2024-12-26-emails.json | jq '.'
   ```

## Expected Alert Thresholds

### Temperature Thresholds (°C)
| Battery Type | Warning | Critical |
|---|---|---|
| Li-ion | 35 | 45 |
| LiFePO4 | 40 | 55 |
| Lead-Acid | 40 | 50 |
| NiMH | 40 | 50 |
| NiCd | 45 | 55 |

### Voltage Thresholds (V)
| Battery Type | Minimum Voltage |
|---|---|
| Li-ion | 3.0 V |
| LiFePO4 | 3.0 V |
| Lead-Acid | 11.5 V |
| NiMH | 1.0 V |
| NiCd | 1.0 V |

### SoH Thresholds
| Condition | SoH Range | Severity |
|---|---|---|
| Critical | < 30% | CRITICAL |
| Declining | 30-40% | WARNING |
| Healthy | > 70% | OK |
| Repairable | 40-70% | CONSIDER ACTION |

### Charge Cycles Threshold
- Maintenance Due: > 800 cycles (WARNING severity)

## Database Verification

### Query Supabase to Verify Alerts
1. **Connect to Supabase SQL Editor**
2. **Check alerts table:**
   ```sql
   -- Get all alerts for current user
   SELECT * FROM alerts 
   WHERE user_id = 'YOUR_USER_ID' 
   ORDER BY created_at DESC;
   
   -- Verify alert structure
   SELECT 
     id,
     battery_id,
     type as alert_type,
     severity,
     acknowledged,
     created_at
   FROM alerts
   ORDER BY created_at DESC
   LIMIT 20;
   ```

### Check in Browser Developer Tools
1. **Open DevTools (F12)**
2. **Go to Console tab**
3. **Check for errors:**
   ```javascript
   // Should see messages like:
   // ✓ Created high_temperature alert for battery BAT-TEMP-001
   // ✓ Created status alert for battery BAT-TEMP-001
   ```

## Troubleshooting

### Alerts Not Appearing
**Symptom:** Battery registered successfully, but no alerts on Alerts page

1. **Check browser console for errors:**
   - F12 → Console → Look for "Error fetching alerts"
   - Check Supabase errors

2. **Verify Supabase connection:**
   ```bash
   # In browser console
   const { data, error } = await supabase.from('alerts').select('*').limit(1);
   console.log(data, error);
   ```

3. **Check database directly:**
   - Log into Supabase dashboard
   - Go to SQL Editor
   - Run: `SELECT COUNT(*) FROM alerts;`
   - If count is 0, alerts not being created

### Email Service Not Responding
**Symptom:** "Failed to send email notification" error

1. **Verify service is running:**
   ```bash
   curl http://localhost:5001/health
   # Should respond with: {"status":"ok","message":"Email service is running"}
   ```

2. **Check process:**
   ```bash
   netstat -ano | findstr ":5001"
   # Should show LISTENING
   ```

3. **Restart service:**
   ```bash
   # Kill old process
   taskkill /PID 1128 /F
   
   # Start fresh
   cd email-service
   npm start
   ```

### Supabase Real-time Not Updating
**Symptom:** Alerts page doesn't update when new battery registered

1. **Check Supabase channel subscription:**
   ```javascript
   // In browser console
   supabase.getChannels()  // Should show 'alerts-changes' channel
   ```

2. **Force refresh:**
   ```javascript
   // In browser console
   location.reload();
   ```

## Performance Notes

- ✅ Alerts created asynchronously (non-blocking)
- ✅ Database operations are fast for < 1000 alerts
- ✅ Real-time subscriptions work for multiple users
- ✅ Email service doesn't block alert creation

## Next Steps

After successful testing:
1. Deploy to production with real SendGrid API key
2. Set up alert notification preferences for users (email digest, real-time, etc.)
3. Implement alert filtering/search on Alerts page
4. Add alert export functionality (CSV, PDF)
5. Create alert history dashboard
6. Implement recurring/scheduled alerts based on conditions
