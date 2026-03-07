# 🔐 Password Reset & Change - Quick Start Guide

## What's New?

You now have three password management options:

### 1️⃣ **Forgot Password** (When logged out)
- Click "Forgot password?" on the login page
- Enter your email
- You'll receive a reset link
- Click the link and set your new password

### 2️⃣ **Reset Password** (Via email link)
- Automatically accessed when you click the email link
- Set your new password with requirements:
  - 8+ characters
  - Uppercase + lowercase letters
  - Special character (!@#$%^&* etc.)

### 3️⃣ **Change Password** (When logged in)
- Click "Settings" in the top navbar
- Scroll to "Change Password" section
- Enter your current password
- Set your new password
- Confirm it matches
- Click "Change Password"

---

## Password Security Requirements

✅ **Your password must have:**
- **Length:** At least 8 characters
- **Uppercase:** At least one A-Z
- **Lowercase:** At least one a-z
- **Special Character:** At least one of these: `!@#$%^&*()_+-=[]{}';:"\\|,.<>/?`

📝 **Example strong password:** `MyBatteryPass123!`

---

## Navigation Guide

### From Login Page
```
Login Page
    ↓
Click "Forgot password?" link
    ↓
Enter email → Click "Send Reset Link"
    ↓
Check email for reset link
    ↓
Click link in email
    ↓
ResetPassword page opens
    ↓
Set new password
    ↓
Redirected to Login
    ↓
Sign in with new password
```

### From Dashboard (Logged In)
```
Dashboard/Any page
    ↓
Click "Settings" in navbar
    ↓
Settings page loads
    ↓
Scroll to "Change Password" section
    ↓
Fill in form (3 fields)
    ↓
Click "Change Password"
    ↓
Success! Back in Settings
```

---

## New Pages Added

| Page | URL | Access | Purpose |
|------|-----|--------|---------|
| Forgot Password | `/forgot-password` | Public | Request password reset email |
| Reset Password | `/reset-password` | Public* | Set new password via email link |
| Settings | `/settings` | Logged In | Account info & change password |

*Need email token link to access

---

## Features

### ✨ User Experience
- 🔍 Real-time password validation with visual feedback
- 👁️ Show/hide password icons
- ✓ Confirmation that passwords match
- 📧 Email delivery confirmation
- 🔄 Auto-redirect after password reset

### 🔒 Security
- 🔐 Strong password requirements enforced
- 📧 Secure email-based password reset
- 🛡️ One-time use reset links
- ⏱️ Reset links expire after time limit
- 🔑 Current password required to change password (when logged in)

### 📱 Responsive Design
- 💻 Desktop and mobile friendly
- 📲 Works on all screen sizes
- 🎨 Consistent with BATT IQ branding

---

## Troubleshooting

### ❌ "Password must contain..."
Your password doesn't meet requirements. Check the requirements checklist:
- [ ] At least 8 characters long?
- [ ] Has uppercase letter (A-Z)?
- [ ] Has lowercase letter (a-z)?
- [ ] Has special character (!@#$%^&*)?

### ❌ "Passwords do not match"
The new password and confirm password fields don't match exactly. Retype carefully.

### ❌ "Email not received"
- Check spam/junk folder
- Wait a few minutes
- Try requesting reset again
- Make sure email address is correct

### ❌ "Invalid reset token"
- Reset link has expired (request a new one)
- Link was already used (request a new one)
- Try copying the link directly into browser address bar

---

## Step-by-Step Examples

### Example 1: Forgot Your Password

**Step 1:** On login page, enter your email  
**Step 2:** Click "Forgot password?" link  
**Step 3:** Enter your email and click "Send Reset Link"  
**Step 4:** Check your email for a link from BATT IQ  
**Step 5:** Click the link in the email  
**Step 6:** On reset page, enter your new password:
```
New Password: MyNewPass123!
(Must have uppercase, lowercase, and special char)
```
**Step 7:** Confirm password by typing it again  
**Step 8:** Click "Reset Password"  
**Step 9:** You'll see "Password Reset Successful!"  
**Step 10:** Go back to login and sign in with your new password  

### Example 2: Change Password (Logged In)

**Step 1:** Click "Settings" in the top navbar  
**Step 2:** Find the "Change Password" section  
**Step 3:** Enter your current password (verification)  
**Step 4:** Enter your new password:
```
MyNewBattPass456!
```
**Step 5:** Type it again in "Confirm Password" field  
**Step 6:** Click "Change Password"  
**Step 7:** You'll see "Password changed successfully!"  
**Step 8:** You remain logged in with your new password  

---

## Security Tips 🛡️

1. **Use a unique password** - Don't use the same password as other accounts
2. **Use a Passphrase** - Consider: `BatteryCheck@2024Battery`
3. **Never share your password** - BATT IQ team will never ask for it
4. **Change regularly** - Update password every 3 months
5. **Avoid common words** - Don't use "password123" or "123456"

---

## Common Passwords to Avoid ❌

- ❌ password123
- ❌ 123456
- ❌ qwerty
- ❌ admin
- ❌ letmein
- ❌ Your birth date
- ❌ Pet's name
- ❌ Same as email prefix

---

## Contact Support

If you encounter issues:
1. Check browser console (F12 → Console tab) for error messages
2. Verify your internet connection
3. Try clearing browser cache (Ctrl+Shift+Delete)
4. Try in a different browser
5. Contact support with error message

---

## Files Modified

New files created:
- ✨ `src/pages/ForgotPassword.tsx`
- ✨ `src/pages/ResetPassword.tsx`
- ✨ `src/pages/Settings.tsx`
- ✨ `src/components/common/ChangePassword.tsx`
- ✨ `PASSWORD_RESET_GUIDE.md` (Full technical guide)

Files updated:
- 🔄 `src/App.tsx` (Added new routes)
- 🔄 `src/pages/Login.tsx` (Added "Forgot password?" link)
- 🔄 `src/components/layout/Navbar.tsx` (Added Settings & proper logout)

---

## Testing Checklist

- [ ] Can click "Forgot password?" on login page
- [ ] Forgot password form accepts email
- [ ] Reset password page loads from email link
- [ ] Password validation shows in real-time
- [ ] Can change password in Settings when logged in
- [ ] Password requirements display correctly
- [ ] Show/hide password toggle works
- [ ] Success messages appear
- [ ] Redirects work correctly

---

**Status:** ✅ Complete & Ready to Use  
**Last Updated:** January 2026  
**Version:** 1.0

Enjoy secure password management! 🔐
