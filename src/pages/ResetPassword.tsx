import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Battery, Lock, Leaf, ArrowRight, CheckCircle, Eye, EyeOff, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { auth } from '@/lib/firebase';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import batteriesHeroImage from '@/assets/batteries-hero.png';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [canReset, setCanReset] = useState(false);
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(window.location.search);
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    const checkCode = async () => {
      if (!oobCode) {
        setCanReset(false);
        setIsCheckingSession(false);
        return;
      }
      try {
        await verifyPasswordResetCode(auth, oobCode);
        setCanReset(true);
      } catch (error) {
        console.error('Invalid or expired action code', error);
        setCanReset(false);
      } finally {
        setIsCheckingSession(false);
      }
    };
    checkCode();
  }, [oobCode]);

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

  const passwordStrength = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!passwordStrength.isValid) {
      toast.error('Password must contain uppercase, lowercase, special character, and be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!oobCode) {
      toast.error('Invalid reset link. Please request a new one.');
      return;
    }

    setIsLoading(true);

    try {
      await confirmPasswordReset(auth, oobCode, password);

      setIsSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!canReset) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh pointer-events-none" aria-hidden />
        <div className="w-full max-w-md bg-card/95 backdrop-blur-sm rounded-2xl shadow-elevated border border-border/80 p-8 text-center space-y-6 animate-fade-in hover-lift relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mx-auto">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Invalid or expired link</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              This password reset link is invalid or has expired. Request a new link from the Forgot Password page.
            </p>
          </div>
          <Link to="/forgot-password" className="block">
            <Button className="w-full gap-2">
              <Mail className="h-4 w-4" />
              Send new reset link
            </Button>
          </Link>
          <Link to="/login" className="block text-sm text-primary hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero flex relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh pointer-events-none" aria-hidden />
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/10" />

        <div className="absolute inset-0 flex items-center justify-center p-12">
          <img
            src={batteriesHeroImage}
            alt="Battery collection"
            className="w-full max-w-lg h-auto rounded-2xl shadow-elevated animate-float object-cover"
          />
        </div>

        <div className="absolute top-20 left-20 w-20 h-20 rounded-full bg-status-healthy/20 animate-pulse" />
        <div className="absolute bottom-32 right-24 w-16 h-16 rounded-full bg-primary/20 animate-bounce-subtle" />
      </div>

      {/* Right Side - Reset Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Logo & Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary shadow-glow mx-auto animate-pulse-glow ring-4 ring-primary/10">
              <Battery className="h-10 w-10 text-primary-foreground" />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <h1 className="text-3xl font-bold text-foreground">Create New Password</h1>
              <p className="text-muted-foreground mt-2 flex items-center justify-center gap-2">
                <Leaf className="h-4 w-4 text-primary animate-bounce-subtle" />
                You came from the email link — enter your new password below
              </p>
            </div>
          </div>

          {/* Reset Card */}
          <div className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-elevated border border-border/80 p-8 animate-fade-in-up hover-lift" style={{ animationDelay: '200ms' }}>
            {isSuccess ? (
              <div className="space-y-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-status-healthy/10 animate-bounce">
                  <CheckCircle className="h-8 w-8 text-status-healthy" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Password Reset Successful!</h2>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Your password has been updated. Redirecting to login...
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm text-foreground">
                  <strong>How to change your password:</strong> Type your new password in the two fields below, then click "Reset Password". You will then be able to sign in with this new password.
                </div>
                <p className="text-sm text-muted-foreground">
                  Choose a strong password (see requirements below).
                </p>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">New Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors duration-300 group-focus-within:text-primary" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`pl-10 pr-10 transition-all duration-300 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] ${
                        password && !passwordStrength.isValid
                          ? 'border-status-recyclable'
                          : password && passwordStrength.isValid
                          ? 'border-status-healthy'
                          : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Password Requirements */}
                  {password && (
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
                  <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors duration-300 group-focus-within:text-primary" />
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`pl-10 pr-10 transition-all duration-300 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] ${
                        confirmPassword && password !== confirmPassword
                          ? 'border-status-recyclable'
                          : confirmPassword && password === confirmPassword
                          ? 'border-status-healthy'
                          : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-status-recyclable">Passwords do not match</p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-xs text-status-healthy">Passwords match ✓</p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="xl"
                  className="w-full gap-2 group"
                  disabled={isLoading || !passwordStrength.isValid || password !== confirmPassword}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Resetting...
                    </span>
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  <Link
                    to="/login"
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Back to Login
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

