import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Calendar,
  Download,
  Filter,
  Battery,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useBatteries } from '@/hooks/useBatteries';
import { StatsCard } from '@/components/common/StatsCard';

const Analytics = () => {
  const { batteries, getStats } = useBatteries();
  const [timeRange, setTimeRange] = useState('30d');
  const [chartType, setChartType] = useState('line');

  const stats = getStats();

  // Generate mock trend data
  const generateTrendData = (days: number) => {
    const data = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        healthy: Math.floor(Math.random() * 10) + stats.healthy - 5,
        repairable: Math.floor(Math.random() * 5) + stats.repairable - 2,
        recyclable: Math.floor(Math.random() * 3) + stats.recyclable - 1,
        total: Math.floor(Math.random() * 15) + stats.total - 7,
      });
    }
    return data;
  };

  const trendData = generateTrendData(timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90);

  const statusDistribution = [
    { name: 'Healthy', value: stats.healthy, color: 'hsl(152, 75%, 40%)' },
    { name: 'Repairable', value: stats.repairable, color: 'hsl(38, 92%, 50%)' },
    { name: 'Recyclable', value: stats.recyclable, color: 'hsl(0, 72%, 51%)' },
  ];

  const batteryTypeData = batteries.reduce((acc, battery) => {
    const type = battery.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeChartData = Object.entries(batteryTypeData).map(([type, count]) => ({
    name: type,
    value: count,
  }));

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
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-card">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              Analytics & Insights
            </h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive battery health analytics and trends
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Batteries"
            value={stats.total}
            icon={<Battery className="h-6 w-6" />}
            delay={0}
          />
          <StatsCard
            title="Avg. Health"
            value={`${Math.round((stats.healthy / stats.total) * 100) || 0}%`}
            icon={<Activity className="h-6 w-6" />}
            variant="healthy"
            delay={100}
          />
          <StatsCard
            title="Growth Rate"
            value="+12%"
            icon={<TrendingUp className="h-6 w-6" />}
            variant="repairable"
            delay={200}
          />
          <StatsCard
            title="Recycling Rate"
            value={`${Math.round((stats.recyclable / stats.total) * 100) || 0}%`}
            icon={<TrendingDown className="h-6 w-6" />}
            variant="recyclable"
            delay={300}
          />
        </motion.div>

        {/* Charts Section */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends" className="gap-2">
              <LineChartIcon className="h-4 w-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="distribution" className="gap-2">
              <PieChartIcon className="h-4 w-4" />
              Distribution
            </TabsTrigger>
            <TabsTrigger value="types" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Types
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Battery Health Trends</CardTitle>
                      <CardDescription>Status distribution over time</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={chartType === 'line' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setChartType('line')}
                      >
                        <LineChartIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={chartType === 'area' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setChartType('area')}
                      >
                        <AreaChartIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    {chartType === 'line' ? (
                      <RechartsLineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="healthy"
                          stroke="hsl(152, 75%, 40%)"
                          strokeWidth={3}
                          dot={{ fill: 'hsl(152, 75%, 40%)', r: 4 }}
                          name="Healthy"
                        />
                        <Line
                          type="monotone"
                          dataKey="repairable"
                          stroke="hsl(38, 92%, 50%)"
                          strokeWidth={3}
                          dot={{ fill: 'hsl(38, 92%, 50%)', r: 4 }}
                          name="Repairable"
                        />
                        <Line
                          type="monotone"
                          dataKey="recyclable"
                          stroke="hsl(0, 72%, 51%)"
                          strokeWidth={3}
                          dot={{ fill: 'hsl(0, 72%, 51%)', r: 4 }}
                          name="Recyclable"
                        />
                      </RechartsLineChart>
                    ) : (
                      <AreaChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="healthy"
                          stackId="1"
                          stroke="hsl(152, 75%, 40%)"
                          fill="hsl(152, 75%, 40%)"
                          fillOpacity={0.6}
                          name="Healthy"
                        />
                        <Area
                          type="monotone"
                          dataKey="repairable"
                          stackId="1"
                          stroke="hsl(38, 92%, 50%)"
                          fill="hsl(38, 92%, 50%)"
                          fillOpacity={0.6}
                          name="Repairable"
                        />
                        <Area
                          type="monotone"
                          dataKey="recyclable"
                          stackId="1"
                          stroke="hsl(0, 72%, 51%)"
                          fill="hsl(0, 72%, 51%)"
                          fillOpacity={0.6}
                          name="Recyclable"
                        />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                  <CardDescription>Current battery status breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1000}
                      >
                        {statusDistribution.map((entry, index) => (
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
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="types" className="space-y-4">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Battery Types</CardTitle>
                  <CardDescription>Distribution by battery type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={typeChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="value" fill="hsl(152, 55%, 28%)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Insights Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-status-healthy/20 bg-status-healthy/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-status-healthy">
                <TrendingUp className="h-5 w-5" />
                Positive Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Battery health has improved by 12% over the last 30 days. Continue monitoring
                repairable batteries to maximize their lifespan.
              </p>
            </CardContent>
          </Card>

          <Card className="border-status-repairable/20 bg-status-repairable/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-status-repairable">
                <Activity className="h-5 w-5" />
                Action Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {stats.repairable} batteries require attention. Schedule maintenance to prevent
                further degradation.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
};

export default Analytics;

