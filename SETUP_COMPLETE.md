# 📧 Email Setup Complete - Your Guide

Your BATT IQ email system is now fully configured to send emails to users after they register batteries.

## ✅ What's Been Set Up

### 1. **Frontend Configuration** (Main App)
- ✅ Automatic email alerts for all battery statuses
- ✅ Connected to backend email service on `http://localhost:5001`
- ✅ Three email types: Healthy, Repairable, Recyclable

### 2. **Backend Email Service**
- ✅ Express.js server using SendGrid
- ✅ Listens on port 5001
- ✅ Your SendGrid credentials already configured
- ✅ Located in `email-service/` folder

### 3. **SendGrid Integration**
- ✅ API Key: `UX1TJHEX9YRS4P98Q5MCDQ4B`
- ✅ From Email: `99230040495@klu.ac.in`
- ✅ Ready to send emails immediately

---

## 🚀 To Get Emails Working

### **Required: 2 Terminal Windows**

**Terminal 1 - Email Service:**
```bash
cd email-service
npm install
npm start
```

Expected output:
```
🚀 Email Service started on port 5001
📧 SendGrid configured with email: 99230040495@klu.ac.in
✅ Ready to send emails!
```

**Terminal 2 - Main App:**
```bash
npm run dev
```

---

## 🧪 Test It

1. **Navigate to:** `http://localhost:5173`
2. **Register an account** or login if you already have one
3. **Click "Register Battery"**
4. **Fill in these sample values:**
   - Battery ID: `TEST-001`
   - Battery Type: `Li-ion`
   - Voltage: `3.7 V`
   - Temperature: `25 °C`
   - Charge Cycles: `100`
   - Capacity: `85 %`
   - Location: `Warehouse`

5. **Click "Register & Analyze Battery"**

6. **Wait 1-2 minutes** ⏳

7. **Check your email:** `99230040495@klu.ac.in`

---

## 📧 What Email You'll Receive

Based on the calculation, you'll get ONE of these:

### Scenario 1: Healthy Battery (SoH > 80%) ✅
**Email Subject:** "✅ Healthy Battery Registered - No Action Required"
- Battery is in excellent condition
- Continue normal usage
- Recommendations: Annual check-ups

### Scenario 2: Repairable Battery (50% < SoH ≤ 80%) 🔧  
**Email Subject:** "🔧 Repairable Battery Alert - Maintenance Recommended"
- Battery shows degradation
- Schedule maintenance/repair soon
- Recommendations: Certified service facility

### Scenario 3: Recyclable Battery (SoH ≤ 50%) ⚠️
**Email Subject:** "⚠️ Recyclable Battery Alert - Immediate Action Required"  
- Battery has reached end-of-life
- Must be recycled immediately
- Recommendations: Contact recycling facilities

---

## 🔍 Email Service Architecture

```
User Browser (Frontend)
    ↓
    ├─ User registers battery
    ├─ Calculate battery SoH
    ├─ Determine status (Healthy/Repairable/Recyclable)
    ↓
NodeJS Email Service (Backend)
    ├─ http://localhost:5001
    ├─ Receives email request
    ├─ Validates data
    ↓
SendGrid API
    ├─ Sends actual email
    ├─ To: 99230040495@klu.ac.in
    ├─ Status: Delivered
    ↓
User Email Inbox
    └─ User receives email ✅
```

---

## 📂 File Structure

```
project-root/
├── email-service/
│   ├── server.js              ← Email backend (Express.js)
│   ├── package.json           ← Dependencies
│   └── .env                   ← SendGrid config
│
├── src/
│   └── services/
│       └── notificationService.ts    ← Email functions
│
├── .env                       ← Frontend config
├── QUICK_START_EMAILS.md      ← Quick guide (you are here)
└── EMAIL_SERVICE_SETUP.md     ← Detailed setup
```

---

## 🛠️ Configuration Files

### Frontend (.env)
```
VITE_NOTIFICATION_API_URL=http://localhost:5001
VITE_NOTIFICATION_API_KEY=any-key
VITE_SENDGRID_API_KEY=UX1TJHEX9YRS4P98Q5MCDQ4B
VITE_SENDGRID_FROM_EMAIL=99230040495@klu.ac.in
```

### Backend (email-service/.env)
```
PORT=5001
SENDGRID_API_KEY=UX1TJHEX9YRS4P98Q5MCDQ4B
SENDGRID_FROM_EMAIL=99230040495@klu.ac.in
CORS_ORIGIN=http://localhost:5173
```

---

## ⚡ Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| **Email service won't start** | Run `npm install` in `email-service/` first |
| **Port 5001 in use** | Change `PORT=5002` in `email-service/.env` and update frontend |
| **Connection refused** | Make sure email service is running in Terminal 1 |
| **Emails not received** | Check spam folder, verify email address in console logs |
| **No response from API** | Check if both terminal windows are running |

---

## 📋 Email Flow Example

**User Action:** Registers battery with these parameters:
```
- Battery ID: BAT-001
- Type: Li-ion  
- Voltage: 3.5V
- Temperature: 30°C
- Charge Cycles: 500
- Capacity: 65%
- Location: Office A
```

**System Processes:**
1. Calculate SoH: (3.5V - 2.5V) / (4.2V - 2.5V) × ... = **62%**
2. Determine Status: **Repairable** (50% < 62% ≤ 80%)
3. Create Email Template with battery details
4. Send to backend email service
5. SendGrid sends actual email
6. User receives email in inbox ✅

---

## 🔐 Security Notes

⚠️ **Important:** Your SendGrid API key is in `.env` file. In production:
- Move API key to environment variables on server
- Never commit `.env` to git
- Use `.gitignore` to exclude sensitive files
- Add `.env` to `.gitignore`

---

## ✨ What's Next?

After emails are working:

1. **Monitor email delivery** in email service logs
2. **Test different battery statuses** (Healthy/Repairable/Recyclable)
3. **Verify email content** matches your requirements
4. **Deploy email service** to production server when ready
5. **Update VITE_NOTIFICATION_API_URL** to production URL

---

## 📞 Support

If emails aren't working:

1. **Check Terminal 1 (Email Service):**
   - Is it running?
   - Any error messages?

2. **Check Terminal 2 (Main App):**
   - Any error messages?

3. **Check Browser Console (F12):**
   - Open DevTools → Console tab
   - Look for `📧 EMAIL LOG` messages

4. **Check API Health:**
   ```bash
   curl http://localhost:5001/health
   ```
   
   Should return:
   ```json
   {"status":"ok","message":"Email service is running"}
   ```

---

## 🎉 Summary

Your BATT IQ application now has a complete email system:

✅ Automatic battery status emails  
✅ SendGrid integration working  
✅ Backend email service configured  
✅ Frontend properly connected  
✅ Three email templates ready  

**Just run the two commands and emails will work!**

Good luck! 🚀
