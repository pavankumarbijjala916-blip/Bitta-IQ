# 🚀 QUICK START - Get Emails Working

## 3 Simple Steps:

### Step 1: Install Email Service Dependencies
Open PowerShell/Terminal and run:
```bash
cd email-service
npm install
cd ..
```

### Step 2: Run Email Service (Terminal 1)
```bash
cd email-service
npm start
```
You should see:
```
🚀 Email Service started on port 5001
✅ Ready to send emails!
```

### Step 3: Run Main App (Terminal 2)
```bash
npm run dev
```

---

## Now Test It!

1. Go to http://localhost:5173
2. Register/Login to your account
3. Click "Register Battery"
4. Fill in battery details and submit
5. **Check your email:** 99230040495@klu.ac.in

You should receive an email within 1-2 minutes with:
- ✅ Battery status (Healthy/Repairable/Recyclable)
- 📋 Battery details (ID, Type, SoH, Location)
- 🎯 Recommended actions

---

## 🔧 Troubleshooting

**Email Service won't start?**
- Make sure you're in the `email-service/` directory
- Run: `npm install` to install missing packages
- Check that Node.js is installed: `node --version`

**Connection Refused?**
- Email service might be down. Run `npm start` in `email-service/` directory

**Port 5001 Already in Use?**
- Edit `email-service/.env` and change `PORT=5002` (or another number)
- Update frontend `.env`: `VITE_NOTIFICATION_API_URL=http://localhost:5002`

**Still not getting emails?**
1. Check email service terminal for error messages
2. Verify 99230040495@klu.ac.in is correct and active
3. Check spam/junk folder
4. Check browser console (F12) for logs

---

## Files Overview

```
project/
├── email-service/
│   ├── server.js          ← Email service backend
│   ├── package.json       ← Dependencies
│   └── .env              ← SendGrid credentials
├── src/
│   └── services/
│       └── notificationService.ts  ← Email functions
└── .env                   ← Main app config
```

---

## Environment Setup

Your emails are already configured! 

**Frontend (.env):**
- `VITE_NOTIFICATION_API_URL=http://localhost:5001`

**Backend (email-service/.env):**
- `SENDGRID_API_KEY=Your SendGrid API Key`
- `SENDGRID_FROM_EMAIL=99230040495@klu.ac.in`

---

## What Gets Emailed?

After registering a battery, you automatically get one of these emails:

### ✅ Healthy Battery
- Status: Equipment is in excellent condition
- Action: Continue normal usage
- Recommendations: Regular monitoring

### 🔧 Repairable Battery  
- Status: Equipment shows degradation
- Action: Schedule maintenance/repair
- Recommendations: Service at certified facility

### ⚠️ Recyclable Battery
- Status: End-of-life reached
- Action: Schedule recycling immediately
- Recommendations: Safe storage + facility contact

---

## Support

If emails still aren't working:
1. Check browser console: F12 → Console tab
2. Check email service logs in PowerShell
3. Verify SendGrid credentials are correct
4. Ask for help with full error messages!
