import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Battery, Mail, ArrowLeft, Leaf, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import batteriesHeroImage from '@/assets/batteries-hero.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message || 'Failed to send reset email');
        return;
      }

      setIsSubmitted(true);
      toast.success('Check your email for password reset instructions!');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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
            <Link to="/login" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to Login</span>
            </Link>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary shadow-glow mx-auto animate-pulse-glow ring-4 ring-primary/10">
              <Battery className="h-10 w-10 text-primary-foreground" />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <h1 className="text-3xl font-bold text-foreground">Reset Password</h1>
              <p className="text-muted-foreground mt-2 flex items-center justify-center gap-2">
                <Leaf className="h-4 w-4 text-primary animate-bounce-subtle" />
                Regain access to BATT IQ
              </p>
            </div>
          </div>

          {/* Reset Card */}
          <div className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-elevated border border-border/80 p-8 animate-fade-in-up hover-lift" style={{ animationDelay: '200ms' }}>
            {isSubmitted ? (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-status-healthy/10 animate-bounce">
                    <CheckCircle className="h-8 w-8 text-status-healthy" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Check your email</h2>
                    <p className="text-muted-foreground mt-2 text-sm">
                      We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>
                    </p>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-lg p-4 space-y-3 border border-primary/20">
                  <p className="text-sm font-medium text-foreground">Next steps:</p>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="font-bold text-primary">1.</span>
                      <span>Open the email we sent you</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-primary">2.</span>
                      <span>Click the reset password link</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-primary">3.</span>
                      <span>Enter your new password</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-primary">4.</span>
                      <span>Sign in with your new password</span>
                    </li>
                  </ol>
                </div>

                <div className="pt-4 space-y-3">
                  <p className="text-sm text-muted-foreground text-center">
                    Didn't receive the email? Check your spam folder or{' '}
                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setEmail('');
                      }}
                      className="font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      try another email
                    </button>
                  </p>
                </div>

                <Link to="/login" className="block">
                  <Button className="w-full gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors duration-300 group-focus-within:text-primary" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 transition-all duration-300 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="xl"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  Remember your password?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Sign in
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

export default ForgotPassword;
