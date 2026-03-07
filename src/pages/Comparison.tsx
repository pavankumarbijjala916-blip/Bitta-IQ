import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Battery,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Zap,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SoHProgressBar } from '@/components/common/SoHProgressBar';
import { AnimatedBatteryIcon } from '@/components/common/AnimatedBatteryIcon';
import { useBatteries } from '@/hooks/useBatteries';
import { BatteryStatus } from '@/types/battery';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const Comparison = () => {
  const { batteries } = useBatteries();
  const [selectedBatteries, setSelectedBatteries] = useState<string[]>([]);
  const [comparisonView, setComparisonView] = useState<'table' | 'chart' | 'radar'>('table');

  const selectedBatteryData = useMemo(() => {
    return batteries.filter((b) => selectedBatteries.includes(b.id));
  }, [batteries, selectedBatteries]);

  const toggleBattery = (batteryId: string) => {
    setSelectedBatteries((prev) =>
      prev.includes(batteryId)
        ? prev.filter((id) => id !== batteryId)
        : prev.length < 5
          ? [...prev, batteryId]
          : prev
    );
  };

  const comparisonData = selectedBatteryData.map((battery) => ({
    name: battery.battery_id,
    soh: battery.soh,
    status: battery.status,
  }));

  const radarData = selectedBatteryData.map((battery) => ({
    battery: battery.battery_id,
    'SoH': battery.soh,
    'Health Score': battery.soh,
    'Status': battery.status === 'healthy' ? 100 : battery.status === 'repairable' ? 50 : 0,
  }));

  const avgSoH =
    selectedBatteryData.length > 0
      ? Math.round(
          selectedBatteryData.reduce((sum, b) => sum + b.soh, 0) / selectedBatteryData.length
        )
      : 0;

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
              Battery Comparison
            </h1>
            <p className="text-muted-foreground mt-2">
              Compare multiple batteries side by side
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={comparisonView} onValueChange={(v) => setComparisonView(v as any)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="table">Table View</SelectItem>
                <SelectItem value="chart">Chart View</SelectItem>
                <SelectItem value="radar">Radar View</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Battery Selection */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Select Batteries to Compare</CardTitle>
              <CardDescription>
                Select up to 5 batteries (Selected: {selectedBatteries.length}/5)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {batteries.map((battery) => {
                  const isSelected = selectedBatteries.includes(battery.id);
                  return (
                    <motion.button
                      key={battery.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleBattery(battery.id)}
                      disabled={!isSelected && selectedBatteries.length >= 5}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-card'
                          : 'border-border hover:border-primary/30 hover:bg-secondary/50'
                      } ${!isSelected && selectedBatteries.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AnimatedBatteryIcon
                            soh={battery.soh}
                            status={battery.status as BatteryStatus}
                            size="sm"
                          />
                          <span className="font-semibold text-foreground">{battery.battery_id}</span>
                        </div>
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <X className="h-3 w-3 text-primary-foreground" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-border" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{battery.type}</span>
                        <StatusBadge status={battery.status as BatteryStatus} size="sm" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Comparison Results */}
        {selectedBatteries.length > 0 && (
          <>
            {/* Summary Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Batteries Compared
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-foreground">
                    {selectedBatteries.length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Average SoH
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-foreground">{avgSoH}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Health Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {avgSoH >= 80 ? (
                      <TrendingUp className="h-8 w-8 text-status-healthy" />
                    ) : avgSoH >= 50 ? (
                      <Minus className="h-8 w-8 text-status-repairable" />
                    ) : (
                      <TrendingDown className="h-8 w-8 text-status-recyclable" />
                    )}
                    <span className="text-2xl font-bold text-foreground">
                      {avgSoH >= 80 ? 'Good' : avgSoH >= 50 ? 'Fair' : 'Poor'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Comparison View */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Comparison Results</CardTitle>
                  <CardDescription>
                    Detailed side-by-side comparison of selected batteries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {comparisonView === 'table' && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                              Battery
                            </th>
                            <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                              Type
                            </th>
                            <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                              SoH
                            </th>
                            <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                              Status
                            </th>
                            <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedBatteryData.map((battery) => (
                            <tr
                              key={battery.id}
                              className="border-b border-border hover:bg-secondary/30 transition-colors"
                            >
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <AnimatedBatteryIcon
                                    soh={battery.soh}
                                    status={battery.status as BatteryStatus}
                                    size="sm"
                                  />
                                  <span className="font-medium text-foreground">
                                    {battery.battery_id}
                                  </span>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <Zap className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-foreground">{battery.type}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="space-y-1">
                                  <SoHProgressBar
                                    soh={battery.soh}
                                    status={battery.status as BatteryStatus}
                                    size="sm"
                                  />
                                  <span className="text-sm font-semibold text-foreground">
                                    {battery.soh}%
                                  </span>
                                </div>
                              </td>
                              <td className="p-3">
                                <StatusBadge status={battery.status as BatteryStatus} size="sm" />
                              </td>
                              <td className="p-3">
                                <Link to={`/battery/${battery.id}`}>
                                  <Button variant="ghost" size="sm">
                                    View Details
                                  </Button>
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {comparisonView === 'chart' && (
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparisonData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                          <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                          />
                          <Legend />
                          <Bar
                            dataKey="soh"
                            fill="hsl(152, 55%, 28%)"
                            radius={[8, 8, 0, 0]}
                            name="State of Health (%)"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {comparisonView === 'radar' && (
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis
                            dataKey="battery"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <Radar
                            name="SoH"
                            dataKey="SoH"
                            stroke="hsl(152, 55%, 28%)"
                            fill="hsl(152, 55%, 28%)"
                            fillOpacity={0.6}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        {selectedBatteries.length === 0 && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="py-16 text-center">
                <Battery className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No batteries selected
                </h3>
                <p className="text-muted-foreground">
                  Select batteries from above to start comparing
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </AppLayout>
  );
};

export default Comparison;

