import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Battery,
  Calendar,
  MapPin,
  Zap,
  TrendingUp,
  AlertTriangle,
  Download,
  Edit,
  History,
  Activity,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SoHProgressBar } from '@/components/common/SoHProgressBar';
import { AnimatedBatteryIcon } from '@/components/common/AnimatedBatteryIcon';
import { useBatteries } from '@/hooks/useBatteries';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BatteryDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { batteries, deleteBattery } = useBatteries();

  const battery = batteries.find((b) => b.id === id);

  if (!battery) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <Battery className="h-16 w-16 text-muted-foreground opacity-40" />
          <h2 className="text-2xl font-bold text-foreground">Battery not found</h2>
          <p className="text-muted-foreground">The battery you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/monitor')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Monitor
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Generate mock historical data
  const historicalData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      soh: Math.max(0, battery.soh + Math.floor(Math.random() * 10) - 5),
    };
  });

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

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this battery? This action cannot be undone.')) {
      try {
        await deleteBattery(battery.id);
        toast.success('Battery deleted successfully');
        navigate('/monitor');
      } catch (error) {
        console.error('Failed to delete battery:', error);
        toast.error('Failed to delete battery');
      }
    }
  };

  return (
    <AppLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/monitor')}
              className="group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <AnimatedBatteryIcon
                  soh={battery.soh}
                  status={battery.status as 'healthy' | 'repairable' | 'recyclable'}
                  size="lg"
                />
                {battery.battery_id}
              </h1>
              <p className="text-muted-foreground mt-1">Battery Details & Analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="destructive" className="gap-2" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                State of Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-foreground">{battery.soh}%</div>
                <SoHProgressBar
                  soh={battery.soh}
                  status={battery.status as 'healthy' | 'repairable' | 'recyclable'}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <StatusBadge
                  status={battery.status as 'healthy' | 'repairable' | 'recyclable'}
                  size="lg"
                />
                <p className="text-sm text-muted-foreground">
                  {battery.status === 'healthy' && 'Battery is in good condition'}
                  {battery.status === 'repairable' && 'Battery requires maintenance'}
                  {battery.status === 'recyclable' && 'Battery should be recycled'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-foreground">{battery.type}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Battery Information</CardTitle>
                    <CardDescription>Detailed battery specifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {battery.image && (
                        <div className="col-span-2 mb-4">
                          <p className="text-sm text-muted-foreground mb-2">Battery Image</p>
                          <div className="rounded-lg overflow-hidden border border-border">
                            <img
                              src={battery.image}
                              alt={`Battery ${battery.battery_id}`}
                              className="w-full h-48 object-cover"
                            />
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Battery ID</p>
                        <p className="font-semibold text-foreground">{battery.battery_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Type</p>
                        <p className="font-semibold text-foreground">{battery.type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Location
                        </p>
                        <p className="font-semibold text-foreground">
                          {battery.location || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Registered
                        </p>
                        <p className="font-semibold text-foreground">
                          {new Date(battery.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Health Trend</CardTitle>
                    <CardDescription>SoH progression over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="date"
                          stroke="hsl(var(--muted-foreground))"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          domain={[0, 100]}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="soh"
                          stroke="hsl(152, 55%, 28%)"
                          strokeWidth={3}
                          dot={{ fill: 'hsl(152, 55%, 28%)', r: 4 }}
                          name="SoH %"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common actions for this battery</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" className="gap-2">
                      <Edit className="h-4 w-4" />
                      Update Status
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      Export Report
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Create Alert
                    </Button>
                    {battery.status === 'recyclable' && (
                      <Button variant="destructive" className="gap-2">
                        <Battery className="h-4 w-4" />
                        Schedule Recycling
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Historical Data</CardTitle>
                  <CardDescription>Complete history of battery health measurements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {historicalData.slice(-10).reverse().map((entry, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border hover:bg-secondary transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{entry.date}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">SoH</span>
                          <Badge variant="outline" className="font-semibold">
                            {entry.soh}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Related Alerts</CardTitle>
                  <CardDescription>Alerts associated with this battery</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-40" />
                    <p>No alerts for this battery</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </AppLayout>
  );
};

export default BatteryDetails;

