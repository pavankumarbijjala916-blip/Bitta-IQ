import { useState } from 'react';
import { Settings as SettingsIcon, Mail, User } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChangePassword } from '@/components/common/ChangePassword';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Settings = () => {
  const { user } = useAuth();
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <SettingsIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-primary" />
                Account Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-foreground font-medium">{user?.email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-foreground font-medium">
                    {user?.user_metadata?.full_name || 'Not set'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Account Status</label>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-status-healthy animate-pulse" />
                  <span className="text-foreground font-medium">Active</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                <span className="text-foreground font-medium">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Loading...'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div style={{ animationDelay: '200ms' }}>
          <ChangePassword
            onSuccess={() => {
              setPasswordChangeSuccess(true);
              setTimeout(() => setPasswordChangeSuccess(false), 5000);
            }}
          />
        </div>

        {/* Security Tips */}
        <div className="bg-primary/5 rounded-xl border border-primary/20 p-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Security Recommendations</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="text-primary font-bold">✓</span>
                <span className="text-foreground">Use a strong, unique password with uppercase, lowercase, numbers, and special characters</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">✓</span>
                <span className="text-foreground">Change your password regularly (at least every 3 months)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">✓</span>
                <span className="text-foreground">Never share your password with anyone</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">✓</span>
                <span className="text-foreground">Log out from other devices if you suspect unauthorized access</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
