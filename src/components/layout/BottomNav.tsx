import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Battery, Settings, BarChart2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function BottomNav() {
    const location = useLocation();
    const { user } = useAuth();

    // Don't show on non-authenticated routes or landing page
    if (!user || location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register-account' || location.pathname === '/reset-password' || location.pathname === '/forgot-password') {
        return null;
    }

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Monitor", href: "/monitor", icon: Battery },
        { name: "Analytics", href: "/analytics", icon: BarChart2 },
        { name: "Settings", href: "/settings", icon: Settings },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pb-safe">
            <nav className="flex items-center justify-around h-16 px-4">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <item.icon className={`h-5 w-5 ${isActive ? "fill-primary/20 bg-primary/10 rounded-full p-0.5" : ""}`} />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
