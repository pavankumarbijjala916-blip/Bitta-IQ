import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  FileText,
  Calendar,
  FileSpreadsheet,
  FileJson,
  Mail,
  Printer,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useBatteries } from '@/hooks/useBatteries';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  filterBatteriesByDateRange,
  generateReportCSV,
  generateReportJSON,
  generateReportHTML,
  generateReportPDF,
  generateReportExcel,
  downloadBlob,
  getReportFilename,
} from '@/services/reportService';
import { notificationService } from '@/services/notificationService';

const Reports = () => {
  const { user } = useAuth();
  const { batteries, loading, getStats } = useBatteries();
  const [reportType, setReportType] = useState('summary');
  const [format, setFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState('30d');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading reports data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const stats = getStats();
  const filteredBatteries = filterBatteriesByDateRange(batteries, dateRange);
  const filteredStats = {
    total: filteredBatteries.length,
    healthy: filteredBatteries.filter((b) => b.status === 'healthy').length,
    repairable: filteredBatteries.filter((b) => b.status === 'repairable').length,
    recyclable: filteredBatteries.filter((b) => b.status === 'recyclable').length,
  };

  const reportOptions = {
    reportType,
    dateRange,
    includeCharts,
    includeDetails,
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const filename = getReportFilename(format, reportType);
      if (format === 'csv') {
        const csv = generateReportCSV(filteredBatteries, filteredStats, reportOptions);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        downloadBlob(blob, filename);
      } else if (format === 'json') {
        const json = generateReportJSON(filteredBatteries, filteredStats, reportOptions);
        const blob = new Blob([json], { type: 'application/json' });
        downloadBlob(blob, filename);
      } else if (format === 'pdf') {
        const blob = generateReportPDF(filteredBatteries, filteredStats, reportOptions);
        downloadBlob(blob, filename);
      } else if (format === 'excel') {
        const blob = generateReportExcel(filteredBatteries, filteredStats, reportOptions);
        downloadBlob(blob, filename);
      } else {
        toast.error('Unsupported format');
        return;
      }
      toast.success('Report downloaded successfully');
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  // Open dialog to enter email
  const openEmailDialog = () => {
    if (user?.email) {
      setRecipientEmail(user.email);
    }
    setIsEmailDialogOpen(true);
  };

  const handleSendEmail = async () => {
    if (!recipientEmail) {
      toast.error('Please enter an email address');
      return;
    }

    setSendingEmail(true);
    try {
      const html = generateReportHTML(filteredBatteries, filteredStats, reportOptions);
      const subject = `BATT IQ Report – ${reportType} – ${new Date().toLocaleDateString()}`;
      const displayName = user?.user_metadata?.full_name || 'BATT IQ User';

      const ok = await notificationService.sendReportByEmail(
        recipientEmail,
        displayName,
        subject,
        html
      );

      if (ok) {
        toast.success(`Report email sent to ${recipientEmail}`);
        setIsEmailDialogOpen(false);
      } else {
        toast.error('Failed to send report. Ensure email service is running.');
      }
    } catch (err) {
      console.error('Email report failed:', err);
      toast.error('Failed to send report by email');
    } finally {
      setSendingEmail(false);
    }
  };

  const reportTemplates = [
    {
      id: 'summary',
      title: 'Summary Report',
      description: 'Overview of all batteries with key metrics',
      icon: FileText,
    },
    {
      id: 'detailed',
      title: 'Detailed Report',
      description: 'Comprehensive report with full battery details',
      icon: FileSpreadsheet,
    },
    {
      id: 'analytics',
      title: 'Analytics Report',
      description: 'Trends, charts, and statistical analysis',
      icon: FileText,
    },
    {
      id: 'health',
      title: 'Health Assessment',
      description: 'Detailed health analysis for each battery',
      icon: FileText,
    },
  ];

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
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              Reports & Export
            </h1>
            <p className="text-muted-foreground mt-2">
              Generate and export comprehensive battery reports
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Configuration */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Report Configuration</CardTitle>
                <CardDescription>Customize your report settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Report Type */}
                <div className="space-y-3">
                  <Label>Report Type</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {reportTemplates.map((template) => {
                      const Icon = template.icon;
                      return (
                        <motion.div
                          key={template.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <button
                            onClick={() => setReportType(template.id)}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${reportType === template.id
                              ? 'border-primary bg-primary/5 shadow-card'
                              : 'border-border hover:border-primary/30 hover:bg-secondary/50'
                              }`}
                          >
                            <Icon
                              className={`h-5 w-5 mb-2 ${reportType === template.id ? 'text-primary' : 'text-muted-foreground'
                                }`}
                            />
                            <h3 className="font-semibold text-foreground">{template.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.description}
                            </p>
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="all">All time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Export Format */}
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: 'pdf', icon: FileText, label: 'PDF' },
                      { value: 'excel', icon: FileSpreadsheet, label: 'Excel' },
                      { value: 'csv', icon: FileSpreadsheet, label: 'CSV' },
                      { value: 'json', icon: FileJson, label: 'JSON' },
                    ].map((fmt) => {
                      const Icon = fmt.icon;
                      return (
                        <motion.button
                          key={fmt.value}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setFormat(fmt.value)}
                          className={`p-3 rounded-lg border-2 transition-all duration-300 ${format === fmt.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30'
                            }`}
                        >
                          <Icon
                            className={`h-5 w-5 mx-auto mb-1 ${format === fmt.value ? 'text-primary' : 'text-muted-foreground'
                              }`}
                          />
                          <span
                            className={`text-xs font-medium ${format === fmt.value ? 'text-primary' : 'text-muted-foreground'
                              }`}
                          >
                            {fmt.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <Label>Report Options</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="charts"
                        checked={includeCharts}
                        onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                      />
                      <Label htmlFor="charts" className="cursor-pointer">
                        Include charts and graphs
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="details"
                        checked={includeDetails}
                        onCheckedChange={(checked) => setIncludeDetails(checked as boolean)}
                      />
                      <Label htmlFor="details" className="cursor-pointer">
                        Include detailed battery information
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preview & Actions */}
          <motion.div variants={itemVariants} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Report Preview</CardTitle>
                <CardDescription>Quick overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground mb-2">
                    Report preview ({dateRange}) · {filteredBatteries.length} battery(ies)
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-semibold text-foreground">{filteredStats.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Healthy</span>
                    <span className="font-semibold text-status-healthy">{filteredStats.healthy}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Repairable</span>
                    <span className="font-semibold text-status-repairable">
                      {filteredStats.repairable}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Recyclable</span>
                    <span className="font-semibold text-status-recyclable">
                      {filteredStats.recyclable}
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t border-border space-y-2">
                  <Button
                    onClick={handleExport}
                    className="w-full gap-2"
                    size="lg"
                    disabled={exporting}
                  >
                    {exporting ? (
                      <>
                        <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Export Report
                      </>
                    )}
                  </Button>

                  <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={openEmailDialog}
                      >
                        <Mail className="h-4 w-4" />
                        Email Report
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Email Report</DialogTitle>
                        <DialogDescription>
                          Enter the email address where you'd like to send the {reportType} report.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="email" className="text-left">
                            Recipient Email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="user@example.com"
                            value={recipientEmail}
                            onChange={(e) => setRecipientEmail(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSendEmail} disabled={sendingEmail}>
                          {sendingEmail ? (
                            <>
                              <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      const html = generateReportHTML(filteredBatteries, filteredStats, reportOptions);
                      const win = window.open('', '_blank');
                      if (win) {
                        win.document.write(html);
                        win.document.close();
                        win.print();
                        win.close();
                      }
                    }}
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>No recent reports</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default Reports;

