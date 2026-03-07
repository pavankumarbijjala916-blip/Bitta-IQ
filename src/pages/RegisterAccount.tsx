import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Battery, Mail, Lock, User, ArrowRight, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const RegisterAccount = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

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

  const passwordStrength = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (!passwordStrength.hasUpperCase) {
      toast.error('Password must contain at least one uppercase letter');
      return;
    }

    if (!passwordStrength.hasLowerCase) {
      toast.error('Password must contain at least one lowercase letter');
      return;
    }

    if (!passwordStrength.hasSpecialChar) {
      toast.error('Password must contain at least one special character (!@#$%^&* etc.)');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    const { error } = await signUp(email, password, name);
    
    setIsLoading(false);
    
    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('This email is already registered. Please sign in instead.');
      } else {
        toast.error(error.message || 'Failed to create account');
      }
      return;
    }
    
    toast.success('Account created successfully! Please verify your email to login.');
    
    // Clear form
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    
    // Redirect to login page after 2 seconds
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh pointer-events-none" aria-hidden />
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo & Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-glow mx-auto animate-pulse-glow ring-4 ring-primary/10">
            <Battery className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create Account</h1>
            <p className="text-muted-foreground mt-2 flex items-center justify-center gap-2">
              <Leaf className="h-4 w-4 text-primary" />
              Join BATT IQ today
            </p>
          </div>
        </div>

        {/* Register Card */}
        <div className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-elevated border border-border/80 p-8 hover-lift relative">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 ${
                    password && !passwordStrength.isValid
                      ? 'border-destructive'
                      : password && passwordStrength.isValid
                      ? 'border-status-healthy'
                      : ''
                  }`}
                />
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
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterAccount;
