import { motion } from 'framer-motion';
import { Battery, CheckCircle, Wrench, Recycle, AlertTriangle, TrendingUp, Zap, QrCode, Gauge } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatsCard } from '@/components/common/StatsCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { AnimatedBatteryIcon } from '@/components/common/AnimatedBatteryIcon';
import { useBatteries } from '@/hooks/useBatteries';
import { useAlerts } from '@/hooks/useAlerts';
import { useMaintenanceCheck } from '@/hooks/useMaintenanceCheck';
import { EcoQuestWidget } from '@/components/gamification/EcoQuestWidget';
import { EcoImpactCard } from '@/components/dashboard/EcoImpactCard';
import { LiveBatteryCard } from '@/components/dashboard/LiveBatteryCard';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import batteriesHeroImage from '@/assets/batteries-hero.png';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

const Dashboard = () => {
  const { batteries, loading: batteriesLoading, getStats } = useBatteries();
  const { alerts, loading: alertsLoading } = useAlerts();
  useMaintenanceCheck(); // Auto-check for overdue maintenance

  const stats = getStats();
  const recentAlerts = alerts.filter((a) => !a.acknowledged).slice(0, 3);

  const pieData = [
    { name: 'Healthy', value: stats.healthy, color: 'hsl(152, 75%, 40%)' },
    { name: 'Repairable', value: stats.repairable, color: 'hsl(38, 92%, 50%)' },
    { name: 'Recyclable', value: stats.recyclable, color: 'hsl(0, 72%, 51%)' },
  ];

  const barData = batteries.slice(0, 8).map((b) => ({
    name: b.battery_id,
    soh: b.soh,
    status: b.status,
  }));

  const getBarColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'hsl(152, 75%, 40%)';
      case 'repairable':
        return 'hsl(38, 92%, 50%)';
      case 'recyclable':
        return 'hsl(0, 72%, 51%)';
      default:
        return 'hsl(152, 55%, 28%)';
    }
  };

  if (batteriesLoading || alertsLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <AppLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Live Battery Agent */}
        <LiveBatteryCard />

        {/* Hero Section with Image */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
          <div className="relative flex flex-col lg:flex-row items-center gap-8 p-8 lg:p-10">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-sm ring-1 ring-primary/20">
                  <TrendingUp className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Dashboard</span>
                  <h1 className="text-3xl lg:text-4xl font-bold text-foreground mt-1">
                    Battery Health Monitoring
                  </h1>
                </div>
              </div>
              <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                Track, analyze, and manage your battery fleet for optimal performance and sustainable disposal.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Link to="/register">
                  <Button size="lg" className="group shadow-sm hover:shadow-md">
                    <Zap className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
                    Register Battery
                  </Button>
                </Link>
                <Link to="/monitor">
                  <Button size="lg" variant="outline" className="shadow-sm hover:shadow-md">View All Batteries</Button>
                </Link>
              </div>
            </div>
            <div className="flex-shrink-0 w-full lg:w-auto lg:max-w-md">
              <img
                src={batteriesHeroImage}
                alt="Battery collection"
                className="w-full lg:w-80 h-auto rounded-xl shadow-md object-cover"
              />
            </div>
          </div>
        </motion.div>

        {/* Eco-Quest & Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Eco-Quest Widget */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <EcoQuestWidget />
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            <StatsCard
              title="Total Batteries"
              value={stats.total}
              icon={<Battery className="h-6 w-6" />}
              delay={0}
            />
            <StatsCard
              title="Healthy Batteries"
              value={stats.healthy}
              icon={<CheckCircle className="h-6 w-6" />}
              variant="healthy"
              delay={100}
            />
            <StatsCard
              title="Repairable Batteries"
              value={stats.repairable}
              icon={<Wrench className="h-6 w-6" />}
              variant="repairable"
              delay={200}
            />
            <StatsCard
              title="Recyclable Batteries"
              value={stats.recyclable}
              icon={<Recycle className="h-6 w-6" />}
              variant="recyclable"
              delay={300}
            />
            <StatsCard
              title="Avg. Charge (SoH)"
              value={`${stats.avgSoH}%`}
              icon={<Gauge className="h-6 w-6" />}
              delay={400}
            />
          </motion.div>
        </div>

        {/* Charts Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border/60 p-6 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up group" style={{ animationDelay: '200ms' }}>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <Battery className="h-4 w-4 text-primary" />
              </div>
              Battery Status Distribution
            </h2>
            <div className="h-64">
              {stats.total > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      animationBegin={300}
                      animationDuration={1000}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Battery className="h-12 w-12 mx-auto mb-2 opacity-40" />
                    <p>No batteries registered yet</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border/60 p-6 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up group" style={{ animationDelay: '300ms' }}>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              Battery Health Overview
            </h2>
            <div className="h-64">
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value}%`, 'SoH']}
                    />
                    <Bar
                      dataKey="soh"
                      radius={[4, 4, 0, 0]}
                      fill="hsl(152, 55%, 28%)"
                      animationBegin={500}
                      animationDuration={1000}
                    >
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-40" />
                    <p>No data to display</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Recent Batteries Preview */}
        <motion.div variants={itemVariants} className="bg-card/80 backdrop-blur-sm rounded-xl border border-border/60 p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Battery className="h-5 w-5 text-primary" />
              Recent Batteries
            </h2>
            <Link to="/monitor">
              <Button variant="ghost" size="sm" className="group">
                View All
                <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Button>
            </Link>
          </div>
          {batteries.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {batteries.slice(0, 4).map((battery, index) => (
                <div
                  key={battery.id}
                  className="p-4 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-card animate-fade-in group cursor-default"
                  style={{ animationDelay: `${500 + index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-foreground">{battery.battery_id}</span>
                    <AnimatedBatteryIcon soh={battery.soh} status={battery.status as 'healthy' | 'repairable' | 'recyclable'} size="sm" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium text-foreground">{battery.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">SoH</span>
                      <span className="font-bold text-foreground">{battery.soh}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    <StatusBadge status={battery.status as 'healthy' | 'repairable' | 'recyclable'} size="sm" />
                    <Link to={`/passport/${battery.id}`}>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" title="View Digital Passport">
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Battery className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p className="font-medium text-foreground">No batteries registered yet</p>
              <p className="text-sm">Register your first battery to get started</p>
              <Link to="/register">
                <Button className="mt-4">
                  <Zap className="h-4 w-4 mr-2" />
                  Register Battery
                </Button>
              </Link>
            </div>
          )}
        </motion.div>

        {/* Recent Alerts */}
        <motion.div variants={itemVariants} className="bg-card/80 backdrop-blur-sm rounded-xl border border-border/60 p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="relative">
                <AlertTriangle className="h-5 w-5 text-status-repairable" />
                {recentAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-status-recyclable animate-pulse" />
                )}
              </div>
              Recent Alerts
            </h2>
            <Link to="/alerts">
              <Button variant="ghost" size="sm" className="group">
                View All
                <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Button>
            </Link>
          </div>
          {recentAlerts.length > 0 ? (
            <div className="space-y-3">
              {recentAlerts.map((alert, index) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border hover:border-status-repairable/30 transition-all duration-300 hover:-translate-y-0.5 animate-fade-in group"
                  style={{ animationDelay: `${600 + index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full transition-transform duration-300 group-hover:scale-125 ${alert.severity === 'critical'
                        ? 'bg-status-recyclable animate-pulse'
                        : 'bg-status-repairable'
                        }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {alert.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <StatusBadge
                    status={
                      alert.severity === 'critical' ? 'recyclable' : 'repairable'
                    }
                    size="sm"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No active alerts - all systems running smoothly! 🎉
            </p>
          )}
        </motion.div>
      </motion.div>
    </AppLayout>
  );
};

export default Dashboard;
