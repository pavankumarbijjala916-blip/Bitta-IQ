import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  List,
  Bell,
  Menu,
  X,
  Battery,
  LogOut,
  Zap,
  Settings,
  FileText,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const navLinks = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/register', label: 'Register Battery', icon: PlusCircle },
  { path: '/monitor', label: 'Monitor', icon: List },
  { path: '/analytics', label: 'Analytics', icon: Battery },
  { path: '/comparison', label: 'Compare', icon: Zap },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-card/95 backdrop-blur-xl shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow group-hover:shadow-elevated transition-all duration-300 ease-smooth group-hover:scale-105 ring-2 ring-primary/10">
              <Battery className="h-5 w-5 text-primary-foreground transition-transform duration-300 group-hover:scale-110" />
              <Zap className="absolute -top-1 -right-1 h-4 w-4 text-status-repairable opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-bounce-subtle" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-foreground">
                BATT IQ
              </span>
              <span className="block text-[10px] text-muted-foreground -mt-1">
                Sustainable Monitoring
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link, index) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 overflow-hidden group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <link.icon className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-200",
                    !isActive && "group-hover:scale-105"
                  )} />
                  <span className="relative whitespace-nowrap">
                    {link.label}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-foreground/20" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/reports">
              <Button variant="ghost" size="sm" className="gap-2 group">
                <FileText className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                Reports
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="ghost" size="sm" className="gap-2 group">
                <Settings className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                Settings
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="gap-2 group" onClick={handleLogout}>
              <LogOut className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-all duration-300 active:scale-95"
          >
            <div className="relative w-5 h-5">
              <Menu className={cn(
                "absolute inset-0 h-5 w-5 transition-all duration-300",
                isOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
              )} />
              <X className={cn(
                "absolute inset-0 h-5 w-5 transition-all duration-300",
                isOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
              )} />
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={cn(
          "md:hidden transition-all duration-300 ease-out",
          isOpen ? "max-h-[calc(100vh-5rem)] overflow-y-auto opacity-100 py-4" : "max-h-0 overflow-hidden opacity-0 py-0"
        )}>
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            {navLinks.map((link, index) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 animate-slide-in-left",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
            <Link
              to="/reports"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-300 animate-slide-in-left"
              style={{ animationDelay: '200ms' }}
            >
              <FileText className="h-5 w-5" />
              Reports
            </Link>
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-300 animate-slide-in-left"
              style={{ animationDelay: '250ms' }}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-300 animate-slide-in-left text-left w-full"
              style={{ animationDelay: '250ms' }}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
