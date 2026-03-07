# 📱 Password Management Features - Visual Guide

## Overview Map

```
LOGIN PAGE (Public)
│
├─ "Forgot password?" link
│  │
│  └─► FORGOT PASSWORD PAGE (/forgot-password)
│     │
│     ├─ Enter Email
│     ├─ Click "Send Reset Link"
│     │
│     └─► EMAIL RECEIVED
│        │
│        └─► Click Link in Email
│           │
│           └─► RESET PASSWORD PAGE (/reset-password)
│              │
│              ├─ Create New Password
│              ├─ Real-time validation
│              ├─ Confirm Password
│              │
│              └─► Success! Redirected to Login
│                 │
│                 └─► Sign in with new password ✓
│
└─ NAVBAR
   │
   ├─ "Settings" link (Logged In)
   │  │
   │  └─► SETTINGS PAGE (/settings)
   │     │
   │     ├─ View Account Info
   │     ├─ Email
   │     ├─ Full Name
   │     ├─ Account Status
   │     │
   │     └─► CHANGE PASSWORD COMPONENT
   │        │
   │        ├─ Current Password
   │        ├─ New Password
   │        ├─ Confirm Password
   │        │
   │        └─► Success! Password Changed ✓
   │
   └─ "Logout" link (Actual logout function)
```

---

## User Flows

### Flow 1: Forgot Password (Step by Step)

```
┌─────────────────────────────────────┐
│     LOGIN PAGE                      │
│                                     │
│ Email: [_________________]          │
│ Password: [_____________]           │
│                                     │
│ [Sign In Button]                    │
│                                     │
│ Forgot password? ← Click here       │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ FORGOT PASSWORD PAGE                │
│ (/forgot-password)                  │
│                                     │
│ Reset Password                      │
│                                     │
│ Please enter your email address     │
│ and we'll send you a link to        │
│ reset your password                 │
│                                     │
│ Email: [you@example.com]            │
│                                     │
│ [Send Reset Link Button]            │
│                                     │
│ Remember your password? Sign in     │
└─────────────────────────────────────┘
                 │
                 ▼
         [Process Request]
                 │
                 ▼
┌─────────────────────────────────────┐
│     ✓ CHECK YOUR EMAIL              │
│                                     │
│ We've sent a password reset link    │
│ to you@example.com                  │
│                                     │
│ Next steps:                         │
│ 1. Open the email                   │
│ 2. Click the reset link             │
│ 3. Enter your new password          │
│ 4. Confirm and submit               │
│ 5. Sign in with new password        │
│                                     │
│ Didn't receive? Try another email   │
│                                     │
│ [Back to Login Button]              │
└─────────────────────────────────────┘
```

### Flow 2: Reset Password from Email

```
┌─────────────────────────────────────┐
│      EMAIL RECEIVED                 │
│                                     │
│ From: BATT IQ <noreply@...>        │
│ Subject: Reset Your Password        │
│                                     │
│ [Click here to reset password] ←┐   │
│                                     │
└─────────────────────────────────────┘
                 │
                 └──────────┐
                            ▼
            ┌──────────────────────────────────┐
            │  RESET PASSWORD PAGE             │
            │  (/reset-password)               │
            │                                  │
            │ Create New Password              │
            │ Secure your account              │
            │                                  │
            │ New Password:                    │
            │ [••••••••] [👁]                  │
            │                                  │
            │ Requirements:                    │
            │ ✓ At least 8 characters         │
            │ ✓ Uppercase letter (A-Z)        │
            │ ✓ Lowercase letter (a-z)        │
            │ ✓ Special character (!@#$%)     │
            │                                  │
            │ Confirm Password:                │
            │ [••••••••] [👁]                  │
            │ Passwords match ✓               │
            │                                  │
            │ [Reset Password Button]          │
            │                                  │
            │ [Back to Login]                  │
            └──────────────────────────────────┘
                            │
                            ▼
                   [Submit Request]
                            │
                            ▼
            ┌──────────────────────────────────┐
            │ ✓ PASSWORD RESET SUCCESSFUL!     │
            │                                  │
            │ Your password has been updated.  │
            │ Redirecting to login...          │
            │                                  │
            └──────────────────────────────────┘
                            │
                            ▼
            ┌──────────────────────────────────┐
            │ LOGIN PAGE                       │
            │                                  │
            │ Email: [your_email]              │
            │ Password: [your_new_password] ✓  │
            │                                  │
            │ [Sign In Button]                 │
            │                                  │
            │ Forgot password?                 │
            └──────────────────────────────────┘
```

### Flow 3: Change Password (Logged In)

```
┌──────────────────────────────────┐
│      NAVBAR                      │
│                                  │
│ BATT IQ ───── [Settings] [Logout]│
│               ↓                   │
│               Click              │
│                                  │
└──────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────┐
│ SETTINGS PAGE (/settings)        │
│                                  │
│ ⚙️ Settings                      │
│ Manage your account & preferences│
│                                  │
│ ACCOUNT INFORMATION:             │
│ ├─ Email: user@example.com       │
│ ├─ Name: John Doe                │
│ ├─ Status: Active 🟢             │
│ └─ Member Since: Jan 1, 2024     │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ 🔐 CHANGE PASSWORD            │ │
│ │                               │ │
│ │ Update your password to keep  │ │
│ │ your account secure           │ │
│ │                               │ │
│ │ Current Password:             │ │
│ │ [••••••••] [👁]               │ │
│ │                               │ │
│ │ New Password:                 │ │
│ │ [••••••••] [👁]               │ │
│ │                               │ │
│ │ Requirements:                 │ │
│ │ ✓ At least 8 characters       │ │
│ │ ○ Uppercase letter (A-Z)      │ │
│ │ ○ Lowercase letter (a-z)      │ │
│ │ ○ Special character (!@#$%)   │ │
│ │                               │ │
│ │ Confirm Password:             │ │
│ │ [••••••••] [👁]               │ │
│ │                               │ │
│ │ [Change Password Button]       │ │
│ └──────────────────────────────┘ │
│                                  │
│ SECURITY RECOMMENDATIONS:        │
│ ✓ Use a strong, unique password  │
│ ✓ Change password every 3 months │
│ ✓ Never share your password      │
│ ✓ Log out from other devices     │
│                                  │
└──────────────────────────────────┘
```

---

## UI Components

### Password Input with Validation

```
PASSWORD FIELD:

🔒 New Password: [MyBatteryPass123!] [👁 show]
                 
Real-time Requirements Check:
✓ At least 8 characters (Met)
✓ Uppercase letter (Met)
✓ Lowercase letter (Met)
✓ Special character (Met)

Result: ✅ Password is strong!
```

### Email Sent Confirmation

```
┌─────────────────────────────────┐
│ ✓ CHECK YOUR EMAIL              │
│                                 │
│ ✅ (success icon spinning)      │
│                                 │
│ We've sent a password reset link│
│ to you@example.com              │
│                                 │
│ Next steps:                     │
│ 1. Open the email               │
│ 2. Click the reset link         │
│ 3. Enter your new password      │
│ 4. Sign in with new password    │
│                                 │
│ Didn't receive email?           │
│ Check spam folder or            │
│ [Try another email]             │
│                                 │
│ [Back to Login]                 │
└─────────────────────────────────┘
```

### Success Toast Notification

```
┌────────────────────────────────┐
│ ✓ Password changed successfully│
│                                │
│ Your password has been updated │
└────────────────────────────────┘
```

---

## Color Coding

### Password Validation States

```
🟢 GREEN - Requirement met
  ✓ Uppercase letter detected

🔴 RED - Requirement not met
  ✗ Need special character

⚪ GRAY - Not checked yet
  ○ Special character (!@#$%)

🟡 YELLOW - In progress
  Loading password strength...
```

### Input Field Borders

```
🟢 GREEN BORDER - Password is valid
   [••••••••] ← Strong password

🔴 RED BORDER - Password is invalid
   [••••••••] ← Doesn't meet requirements

⚪ NEUTRAL - Default state
   [••••••••] ← Enter password
```

---

## Navigation Links

### Before Features
```
Login Page
  └─ Only: "Sign In" and "Create Account"
```

### After Features
```
Login Page
  ├─ "Sign In" button
  ├─ "Create Account" link
  └─ "Forgot password?" link ✨ NEW

Navbar (Logged In)
  ├─ Dashboard
  ├─ Register Battery
  ├─ Monitor
  ├─ Alerts
  ├─ "Settings" link ✨ NEW
  └─ "Logout" button (Fixed to actually logout)

Settings Page (/settings) ✨ NEW
  ├─ Account Information
  ├─ Change Password ✨ NEW
  └─ Security Recommendations
```

---

## Form States

### Initial State (Empty)
```
Email Address: [________________]         Submit button: ENABLED
Filled: NO
Status: Ready to enter data
```

### Validating State
```
Email Address: [you@example.c]            Submit button: DISABLED
                🔄 (spinning)
Status: Checking format...
```

### Valid State
```
Email Address: [you@example.com] ✓        Submit button: ENABLED
Status: Valid, ready to submit
```

### Invalid State
```
Email Address: [invalid.email]  ✗         Submit button: DISABLED
Status: Invalid email format
```

---

## Mobile Responsive Design

### Desktop View (1024px+)
```
┌────────────────────────────────────┐
│ BATT IQ | Dashboard | Register     │
│         Monitor | Alerts | Settings │
├────────────────────────────────────┤
│                                    │
│  [Form or Content Area]            │
│                                    │
│  [Settings / Change Password]      │
│                                    │
└────────────────────────────────────┘
```

### Tablet View (768px - 1023px)
```
┌──────────────────────────────┐
│ BATT IQ │ [Menu Icon]        │
├──────────────────────────────┤
│                              │
│  [Form or Content Area]      │
│                              │
│  [Settings / Change Password]│
│                              │
└──────────────────────────────┘
```

### Mobile View (< 768px)
```
┌──────────────────┐
│ BATT IQ│[☰ Menu] │
├──────────────────┤
│ Dashboard        │
│ Register Battery │
│ Monitor          │
│ Alerts           │
│ Settings ✨ NEW  │
│ Logout           │
├──────────────────┤
│                  │
│ [Form]           │
│                  │
│ Settings View    │
│ Change Password  │
│                  │
└──────────────────┘
```

---

## Accessibility Features

- ♿ **Labels:** All inputs have associated labels
- ⌨️ **Keyboard Navigation:** Tab through all fields
- 👁️ **Visibility Toggle:** Show/hide password with eye icon
- 🎨 **Color Contrast:** WCAG AA compliant
- 🔊 **Error Messages:** Clear, descriptive text
- 📱 **Touch Friendly:** Buttons sized for mobile
- 🌐 **Screen Readers:** Proper ARIA attributes

---

## Loading & Waiting States

### Forgot Password Submit
```
┌─────────────────────────────────┐
│ [SENDING RESET EMAIL...]        │
│ ⏳ Please wait...               │
│                                 │
│ (spinning loader animation)     │
│       ⟳ ⟴ ⟵                    │
│                                 │
└─────────────────────────────────┘
```

### Password Reset Submit
```
┌─────────────────────────────────┐
│ [RESETTING...]                  │
│ ⏳ Updating your password...    │
│                                 │
│ (spinning loader animation)     │
│       ⟳ ⟴ ⟵                    │
│                                 │
└─────────────────────────────────┘
```

### Change Password Submit
```
┌─────────────────────────────────┐
│ [UPDATING...]                   │
│ ⏳ Changing your password...    │
│                                 │
│ (spinning loader animation)     │
│       ⟳ ⟴ ⟵                    │
│                                 │
└─────────────────────────────────┘
```

---

**Visual Design:** Consistent with BATT IQ branding
**Colors:** Green (healthy), Orange (warning), Red (error)
**Typography:** Outfit font family
**Spacing:** Tailwind CSS spacing scale
**Animations:** Smooth transitions and fade-ins
**Icons:** Lucide React icons throughout

---

**Last Updated:** January 28, 2026
**Version:** 1.0
