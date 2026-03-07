import { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ChangePasswordProps {
  onSuccess?: () => void;
}

export const ChangePassword: React.FC<ChangePasswordProps> = ({ onSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Password validation function
  const validatePassword = (pwd: string) => {
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);
    const isLongEnough = pwd.length >= 8;

    return {
      hasUpperCase,
      hasLowerCase,
      hasSpecialChar,
      isLongEnough,
      isValid: hasUpperCase && hasLowerCase && hasSpecialChar && isLongEnough,
    };
  };

  const passwordStrength = validatePassword(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!passwordStrength.isValid) {
      toast.error('Password must contain uppercase, lowercase, special character, and be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setIsLoading(true);

    try {
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error(error.message || 'Failed to change password');
        return;
      }

      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-card">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-2">
            <Lock className="h-5 w-5 text-primary" />
            Change Password
          </h2>
          <p className="text-sm text-muted-foreground">
            Update your password to keep your account secure
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-foreground">Current Password</Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors duration-300 group-focus-within:text-primary" />
              <Input
                id="current-password"
                type={showCurrent ? 'text' : 'password'}
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pl-10 pr-10 transition-all duration-300 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-foreground">New Password</Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors duration-300 group-focus-within:text-primary" />
              <Input
                id="new-password"
                type={showNew ? 'text' : 'password'}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`pl-10 pr-10 transition-all duration-300 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] ${
                  newPassword && !passwordStrength.isValid
                    ? 'border-status-recyclable'
                    : newPassword && passwordStrength.isValid
                    ? 'border-status-healthy'
                    : ''
                }`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password Requirements */}
            {newPassword && (
              <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
                <p className="font-medium text-foreground">Password requirements:</p>
                <div className="space-y-1">
                  <div className={`flex items-center gap-2 ${passwordStrength.isLongEnough ? 'text-status-healthy' : 'text-muted-foreground'}`}>
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${passwordStrength.isLongEnough ? 'bg-status-healthy border-status-healthy' : 'border-muted-foreground'}`}>
                      {passwordStrength.isLongEnough && <span className="text-xs text-white font-bold">✓</span>}
                    </span>
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-2 ${passwordStrength.hasUpperCase ? 'text-status-healthy' : 'text-muted-foreground'}`}>
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${passwordStrength.hasUpperCase ? 'bg-status-healthy border-status-healthy' : 'border-muted-foreground'}`}>
                      {passwordStrength.hasUpperCase && <span className="text-xs text-white font-bold">✓</span>}
                    </span>
                    <span>One uppercase letter (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-2 ${passwordStrength.hasLowerCase ? 'text-status-healthy' : 'text-muted-foreground'}`}>
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${passwordStrength.hasLowerCase ? 'bg-status-healthy border-status-healthy' : 'border-muted-foreground'}`}>
                      {passwordStrength.hasLowerCase && <span className="text-xs text-white font-bold">✓</span>}
                    </span>
                    <span>One lowercase letter (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-2 ${passwordStrength.hasSpecialChar ? 'text-status-healthy' : 'text-muted-foreground'}`}>
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${passwordStrength.hasSpecialChar ? 'bg-status-healthy border-status-healthy' : 'border-muted-foreground'}`}>
                      {passwordStrength.hasSpecialChar && <span className="text-xs text-white font-bold">✓</span>}
                    </span>
                    <span>One special character (!@#$%^&* etc.)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-foreground">Confirm New Password</Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors duration-300 group-focus-within:text-primary" />
              <Input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`pl-10 pr-10 transition-all duration-300 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] ${
                  confirmPassword && newPassword !== confirmPassword
                    ? 'border-status-recyclable'
                    : confirmPassword && newPassword === confirmPassword
                    ? 'border-status-healthy'
                    : ''
                }`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-status-recyclable">Passwords do not match</p>
            )}
            {confirmPassword && newPassword === confirmPassword && (
              <p className="text-xs text-status-healthy flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Passwords match
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              isLoading ||
              !passwordStrength.isValid ||
              newPassword !== confirmPassword ||
              !currentPassword
            }
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Updating...
              </span>
            ) : (
              'Change Password'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};
