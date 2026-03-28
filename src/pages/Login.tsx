import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Battery, Mail, Lock, ArrowRight, Leaf, Zap, Recycle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import batteriesHeroImage from '@/assets/batteries-hero.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

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
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!passwordStrength.isValid) {
      toast.error('Password must contain uppercase, lowercase, special character, and be at least 8 characters');
      return;
    }

    setIsLoading(true);
    
    const { error } = await signIn(email, password);
    
    setIsLoading(false);
    
    if (error) {
      const msg = error.message || '';
      if (msg.includes('Invalid login credentials')) {
        toast.error('Invalid email or password. Please check and try again.');
      } else if (msg.includes('Email not confirmed')) {
        toast.error('Please verify your email address before signing in.');
      } else if (
        msg.toLowerCase().includes('failed to fetch') ||
        msg.toLowerCase().includes('networkerror') ||
        msg.toLowerCase().includes('fetch') ||
        msg.toLowerCase().includes('load failed') ||
        msg.toLowerCase().includes('err_name_not_resolved')
      ) {
        toast.error(
          '⚠️ Cannot connect to the server. The backend service may be temporarily down. Please try again later or contact support.',
          { duration: 6000 }
        );
      } else {
        toast.error(msg || 'Failed to sign in. Please try again.');
      }
      return;
    }
    
    toast.success('Welcome back!');
    navigate('/dashboard');
  };

  const features = [
    { icon: Zap, text: 'Real-time monitoring' },
    { icon: Recycle, text: 'Smart disposal recommendations' },
    { icon: Shield, text: 'Secure data management' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="min-h-screen gradient-hero flex relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh pointer-events-none" aria-hidden />
      {/* Left Side - Hero Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="hidden lg:flex flex-1 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/10" />
        
        {/* Floating Battery Image */}
        <motion.div
          variants={itemVariants}
          className="absolute inset-0 flex items-center justify-center p-12"
        >
          <motion.img
            src={batteriesHeroImage}
            alt="Battery collection"
            className="w-full max-w-lg h-auto rounded-2xl shadow-elevated object-cover"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          variants={itemVariants}
          className="absolute top-20 left-20 w-20 h-20 rounded-full bg-status-healthy/20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          variants={itemVariants}
          className="absolute bottom-32 right-24 w-16 h-16 rounded-full bg-primary/20"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
        />
        <motion.div
          variants={itemVariants}
          className="absolute top-1/3 right-16 w-12 h-12 rounded-full bg-status-repairable/20"
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />

        {/* Bottom Feature Cards */}
        <motion.div
          variants={itemVariants}
          className="absolute bottom-8 left-8 right-8 flex gap-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.text}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.15 }}
              whileHover={{ scale: 1.03, y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex-1 bg-card/90 backdrop-blur-md rounded-xl p-4 border border-border/80 shadow-card hover:shadow-md transition-shadow duration-300"
            >
              <feature.icon className="h-6 w-6 text-primary mb-2" />
              <span className="text-sm font-medium text-foreground">{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Right Side - Login Form */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 flex items-center justify-center p-6 lg:p-12"
      >
        <div className="w-full max-w-md space-y-8">
          {/* Logo & Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl gradient-primary shadow-md mx-auto ring-2 ring-primary/20">
              <Battery className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">BATT IQ</h1>
              <p className="text-muted-foreground mt-3 text-sm lg:text-base flex items-center justify-center gap-2">
                <Leaf className="h-4 w-4 text-primary" />
                Sustainable Battery Management
              </p>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-card/90 backdrop-blur-md rounded-2xl shadow-lg border border-border/60 p-8 lg:p-10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors duration-300 group-focus-within:text-primary" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 transition-all duration-300 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors duration-300 group-focus-within:text-primary" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 transition-all duration-300 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] ${
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

                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                size="xl"
                className="w-full gap-2 group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link
                  to="/register-account"
                  className="font-medium text-primary hover:underline transition-all duration-300 hover:text-primary/80"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
