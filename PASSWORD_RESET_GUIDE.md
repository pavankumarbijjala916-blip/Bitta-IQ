# Password Management & Security Guide

## Overview
BATT IQ now includes comprehensive password management features allowing users to:
- Reset forgotten passwords
- Change passwords while logged in
- Maintain strong security practices

## Features Implemented

### 1. **Forgot Password Flow**
**Route:** `/forgot-password`
- Users who forget their password can request a reset link
- Email containing a secure reset link is sent to their registered email
- Users have a set time to click the link before it expires

**User Flow:**
1. Navigate to Login page
2. Click "Forgot password?" link
3. Enter registered email address
4. Click "Send Reset Link"
5. Check email for reset link
6. Click link in email
7. Set new password on reset page
8. Redirected back to login
9. Sign in with new password

### 2. **Reset Password Page** 
**Route:** `/reset-password`
- Accessed via email link (automatic redirect)
- Users set a new password with validation
- Passwords must meet security requirements:
  - Minimum 8 characters
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one special character (!@#$%^&* etc.)

**Features:**
- Real-time password strength indicator
- Password visibility toggle (eye icon)
- Confirm password validation
- Success message with visual feedback

### 3. **Change Password Feature**
**Route:** `/settings`
- Available when user is logged in
- Allows users to change password at any time
- Same password requirements as reset flow
- Current password field for verification

**Features:**
- Located in Settings page
- Accessible from navbar (Settings menu)
- Current password verification required
- Real-time validation feedback
- Success toast notification

### 4. **Settings Page**
**Route:** `/settings` (Protected route)
- View account information:
  - Email address
  - Full name
  - Account status
  - Member since date
- Change password directly from this page
- Security recommendations

## Technical Details

### New Files Created

1. **`src/pages/ForgotPassword.tsx`**
   - Forgot password request form
   - Email submission handler
   - Success confirmation message

2. **`src/pages/ResetPassword.tsx`**
   - Password reset form
   - Password validation
   - Form submission handler

3. **`src/pages/Settings.tsx`**
   - User settings and account info
   - Integrates ChangePassword component

4. **`src/components/common/ChangePassword.tsx`**
   - Reusable component for password changes
   - Used in Settings page
   - Can be used elsewhere if needed

### Updated Files

1. **`src/App.tsx`**
   - Added imports for new pages
   - Added three new routes:
     - `/forgot-password` (public)
     - `/reset-password` (public)
     - `/settings` (protected)

2. **`src/pages/Login.tsx`**
   - Added "Forgot password?" link
   - Link positioned below password field
   - Navigates to `/forgot-password`

3. **`src/components/layout/Navbar.tsx`**
   - Added Settings link to both desktop and mobile menus
   - Updated logout functionality
   - Import added for Settings icon

### API Endpoints Used

All functionality uses Supabase Auth APIs:

**Password Reset Request:**
```
supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`
})
```

**Password Update:**
```
supabase.auth.updateUser({
  password: newPassword
})
```

## Security Features

### Password Requirements
- **Minimum length:** 8 characters
- **Complexity:**
  - Uppercase letters (A-Z)
  - Lowercase letters (a-z)
  - Special characters (!@#$%^&*)
- **Validation:** Real-time with visual feedback

### Security Best Practices Implemented
1. Email verification for password resets
2. No password stored in plain text
3. Secure password transmission via Supabase
4. Session management for logged-in users
5. Automatic redirect for unauthenticated reset attempts

### Email Link Security
- Reset links have expiration time (set by Supabase)
- Links are one-time use (auto-invalidated after use)
- Links redirect to reset page with token

## User Authentication Flow

### Forgot Password Journey
```
User clicks "Forgot password?" on Login
    ↓
ForgotPassword page loads
    ↓
User enters email and clicks "Send Reset Link"
    ↓
Email sent by Supabase with reset link
    ↓
User clicks link in email
    ↓
ResetPassword page loads with auth token
    ↓
User enters new password
    ↓
Password validation checks pass
    ↓
Password updated in Supabase
    ↓
Success message displayed
    ↓
User redirected to Login
    ↓
User signs in with new password
```

### Change Password Journey (Logged In)
```
User clicks Settings in navbar
    ↓
Settings page loads
    ↓
User finds "Change Password" section
    ↓
User enters current password (verification)
    ↓
User enters new password
    ↓
User confirms new password
    ↓
Validation checks pass
    ↓
Password updated in Supabase
    ↓
Success toast notification
    ↓
User remains logged in
```

## Routes Summary

| Route | Access | Purpose |
|-------|--------|---------|
| `/login` | Public | Sign in to account |
| `/forgot-password` | Public | Request password reset email |
| `/reset-password` | Public* | Reset password via email link |
| `/register-account` | Public | Create new account |
| `/dashboard` | Protected | Main dashboard |
| `/settings` | Protected | Account settings & change password |
| `/register` | Protected | Register new battery |
| `/monitor` | Protected | View all batteries |
| `/alerts` | Protected | View alerts |

*Public but requires email token in URL

## Testing the Feature

### Test Forgot Password:
1. Go to `/login`
2. Click "Forgot password?"
3. Enter any email (test with your email for real testing)
4. Check for reset link (Supabase will send to configured email)
5. Click link
6. Set new password
7. Redirect to login

### Test Change Password:
1. Log in to account
2. Click Settings in navbar
3. Scroll to "Change Password" section
4. Fill in current password
5. Enter new password (meeting requirements)
6. Confirm password
7. Click "Change Password"
8. Toast notification shows success

### Test Password Validation:
1. Navigate to any password field
2. Type password less than 8 characters → ✗ Red
3. Add uppercase letter → ✓ Green checkmark appears
4. Continue adding requirements one by one
5. Visual feedback updates in real-time

## Environment Variables Required

The following environment variables should already be configured:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

## Troubleshooting

### "Invalid Reset Token"
- Reset link has expired (use forgot password again)
- Link was already used (request new reset)
- Token malformed in URL

### "Password Update Failed"
- Password doesn't meet requirements
- User session has expired (log in again)
- Supabase connection issue (check internet)

### Email Not Received
- Check spam/junk folder
- Verify email address is correct
- Check Supabase email configuration
- Try requesting reset again

## Next Steps / Future Enhancements

1. **Two-Factor Authentication (2FA)**
   - SMS or app-based authentication
   - Enhanced security for sensitive operations

2. **Activity Log**
   - Track login history
   - Monitor password changes
   - Detect suspicious activity

3. **Password History**
   - Prevent reusing recent passwords
   - Security best practice

4. **Biometric Authentication**
   - Fingerprint login (mobile)
   - Face recognition (mobile)

5. **Account Recovery Options**
   - Multiple backup email addresses
   - Recovery codes
   - Security questions

## Support & Documentation

For issues or questions:
1. Check browser console (F12) for errors
2. Review Supabase dashboard for auth logs
3. Verify environment variables are set
4. Check email configuration in Supabase

---

**Last Updated:** January 2026
**Version:** 1.0
**Status:** Production Ready
