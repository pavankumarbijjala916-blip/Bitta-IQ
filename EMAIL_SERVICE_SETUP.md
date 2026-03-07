# Email Service Setup Guide - BATT IQ

This email service handles all email notifications for the BATT IQ application using SendGrid.

## Quick Start

### Step 1: Install Dependencies
Navigate to the email-service directory and install required packages:

```bash
cd email-service
npm install
```

This will install:
- `express` - Web framework
- `cors` - Cross-origin support
- `@sendgrid/mail` - SendGrid email client
- `dotenv` - Environment variables

### Step 2: Configure Environment

The `.env` file in `email-service/` is already configured with your SendGrid credentials.

Verify it contains:
```
PORT=5001
SENDGRID_API_KEY=UX1TJHEX9YRS4P98Q5MCDQ4B
SENDGRID_FROM_EMAIL=99230040495@klu.ac.in
```

### Step 3: Start the Email Service

Run the email service:

```bash
npm start
```

Or with auto-reload during development:
```bash
npm run dev
```

You should see:
```
🚀 Email Service started on port 5001
📧 SendGrid configured with email: 99230040495@klu.ac.in
✅ Ready to send emails!
```

### Step 4: Test the Service

In a new terminal, test if the email service is running:

```bash
curl http://localhost:5001/health
```

Expected response:
```json
{"status":"ok","message":"Email service is running"}
```

### Step 5: Start the Main App

In another terminal, start the main BATT IQ application:

```bash
npm run dev
```

## How It Works

1. **User registers a battery** in the BATT IQ app
2. **Frontend calculates battery status** (Healthy/Repairable/Recyclable)
3. **Frontend sends email request** to the email service at `http://localhost:5001/api/notifications/email`
4. **Email service uses SendGrid** to send the actual email
5. **User receives email** based on battery status

## Email Service API Endpoint

### Send Email
```
POST http://localhost:5001/api/notifications/email
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "subject": "Battery Status Alert",
  "htmlContent": "<html>...</html>",
  "recipientName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent to user@example.com",
  "timestamp": "2026-01-28T10:30:00.000Z"
}
```

## Troubleshooting

### Email Not Sending
1. Check if email service is running on port 5001
2. Verify `.env` file has correct SENDGRID_API_KEY
3. Check console logs for error messages
4. Ensure main app is pointing to `http://localhost:5001`

### Connection Refused Error
- Make sure email service is running: `npm start` in `email-service/` directory
- Check if port 5001 is being used by another process

### SendGrid API Key Error
- Verify the API key is active in SendGrid dashboard
- Check that the API key has "Mail Send" permissions

## Running Multiple Services

You need 3 terminals:

**Terminal 1 - Email Service:**
```bash
cd email-service
npm start
```

**Terminal 2 - Main App:**
```bash
npm run dev
```

**Terminal 3 - Browser (Optional):**
```bash
# To monitor email logs in console
curl http://localhost:5173
```

## Environment Variables

### Frontend (.env)
```
VITE_NOTIFICATION_API_URL=http://localhost:5001
VITE_NOTIFICATION_API_KEY=any-key
```

### Backend (email-service/.env)
```
PORT=5001
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@batt-iq.app
```

## Email Templates

The following emails are sent based on battery status:

1. **Healthy Battery** - ✅ Confirmation that battery is in good condition
2. **Repairable Battery** - 🔧 Recommendation to schedule maintenance
3. **Recyclable Battery** - ⚠️ Alert to schedule recycling immediately

## Next Steps

1. Verify email service is running on port 5001
2. Register a battery in the main app
3. Check your email inbox for the status notification
4. Check browser console for email logs

---

**Need Help?**
- Check browser console: F12 → Console tab
- Check email service logs in your terminal
- Ensure SendGrid API key is valid and active
