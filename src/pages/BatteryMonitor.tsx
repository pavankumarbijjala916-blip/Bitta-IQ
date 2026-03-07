import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Filter, Battery, Zap, MapPin, RefreshCw, BarChart3, QrCode } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SoHProgressBar } from '@/components/common/SoHProgressBar';
import { AnimatedBatteryIcon } from '@/components/common/AnimatedBatteryIcon';
import { useBatteries } from '@/hooks/useBatteries';
import { BatteryStatus } from '@/types/battery';
import { cn, calculateNextCheckDate } from '@/lib/utils';
import batteriesHeroImage from '@/assets/batteries-hero.png';

const BatteryMonitor = () => {
  const navigate = useNavigate();
  const { batteries, loading, refetch } = useBatteries();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BatteryStatus | 'all'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredBatteries = useMemo(() => {
    return batteries.filter((battery) => {
      const matchesSearch =
        battery.battery_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (battery.location?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        battery.type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || battery.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [batteries, searchQuery, statusFilter]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/5 to-status-healthy/5 border border-border">
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-20">
            <img src={batteriesHeroImage} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="relative p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-card animate-float">
                <Battery className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Battery Monitoring</h1>
                <p className="text-muted-foreground">View and manage all registered batteries</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, location, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BatteryStatus | 'all')}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="healthy">🟢 Reusable</SelectItem>
                <SelectItem value="repairable">🟡 Repairable</SelectItem>
                <SelectItem value="recyclable">🔴 Recyclable</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => navigate('/comparison')} className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Compare
            </Button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead>Battery</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>State of Health</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBatteries.length > 0 ? (
                  filteredBatteries.map((battery, index) => (
                    <TableRow
                      key={battery.id}
                      onClick={() => navigate(`/battery/${battery.id}`)}
                      className="hover:bg-secondary/30 cursor-pointer transition-colors"
                      style={{
                        animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                      }}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <AnimatedBatteryIcon soh={battery.soh} status={battery.status as BatteryStatus} size="sm" animate={false} />
                          {battery.battery_id}
                        </div>
                      </TableCell>
                      <TableCell><div className="flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-muted-foreground" />{battery.type}</div></TableCell>
                      <TableCell><div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />{battery.location || '-'}</div></TableCell>
                      <TableCell className="min-w-[180px]">
                        <SoHProgressBar soh={battery.soh} status={battery.status as BatteryStatus} size="sm" showLabel={false} animate={false} />
                        <span className={cn("text-xs font-semibold mt-1 block", battery.status === 'healthy' && 'text-status-healthy', battery.status === 'repairable' && 'text-status-repairable', battery.status === 'recyclable' && 'text-status-recyclable')}>{battery.soh}%</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <StatusBadge status={battery.status as BatteryStatus} size="sm" />
                          <span className="text-[10px] text-muted-foreground mt-1">
                            Next Check: {calculateNextCheckDate(battery.status, battery.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm flex items-center justify-between gap-2">
                        {new Date(battery.updated_at).toLocaleDateString()}
                        <Link to={`/passport/${battery.id}`} onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" title="View Digital Passport">
                            <QrCode className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center gap-4 text-muted-foreground">
                        <Battery className="h-12 w-12 opacity-40" />
                        <p className="font-medium text-foreground">No batteries found</p>
                        <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>Clear filters</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden flex flex-col divide-y divide-border">
            {filteredBatteries.length > 0 ? (
              filteredBatteries.map((battery, index) => (
                <div
                  key={battery.id}
                  onClick={() => navigate(`/battery/${battery.id}`)}
                  className="p-4 hover:bg-secondary/30 cursor-pointer transition-colors space-y-4"
                  style={{ animation: `fadeIn 0.3s ease-out ${index * 0.05}s both` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 font-medium text-base">
                      <AnimatedBatteryIcon soh={battery.soh} status={battery.status as BatteryStatus} size="sm" animate={false} />
                      {battery.battery_id}
                    </div>
                    <StatusBadge status={battery.status as BatteryStatus} size="sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2"><Zap className="h-4 w-4" />{battery.type}</div>
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{battery.location || 'Unknown'}</div>
                  </div>

                  <div className="bg-secondary/30 rounded-lg p-3">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs text-muted-foreground font-medium">State of Health</span>
                      <span className={cn("text-sm font-bold", battery.status === 'healthy' && 'text-status-healthy', battery.status === 'repairable' && 'text-status-repairable', battery.status === 'recyclable' && 'text-status-recyclable')}>{battery.soh}%</span>
                    </div>
                    <SoHProgressBar soh={battery.soh} status={battery.status as BatteryStatus} size="sm" showLabel={false} animate={false} />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-muted-foreground">
                      Updated: {new Date(battery.updated_at).toLocaleDateString()}
                    </span>
                    <Link to={`/passport/${battery.id}`} onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-primary hover:text-primary">
                        <QrCode className="h-3.5 w-3.5" /> Passport
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center gap-4 text-muted-foreground py-16 px-4 text-center">
                <Battery className="h-12 w-12 opacity-40" />
                <p className="font-medium text-foreground">No batteries found</p>
                <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>Clear filters</Button>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center justify-between text-sm text-muted-foreground">
          <p>Showing <span className="font-semibold text-foreground">{filteredBatteries.length}</span> of <span className="font-semibold text-foreground">{batteries.length}</span> batteries</p>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
};

export default BatteryMonitor;
