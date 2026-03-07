import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Battery, Zap, Thermometer, RefreshCw, Gauge, MapPin, Image as ImageIcon, X } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { calculateSoH, getStatusFromSoH } from '@/data/mockData';
import { useBatteries } from '@/hooks/useBatteries';
import { useAuth } from '@/hooks/useAuth';
import { useAlerts } from '@/hooks/useAlerts';
import { notificationService } from '@/services/notificationService';
import { generateBatteryAlerts, generateStatusAlert } from '@/services/alertService';

const batteryTypes = ['Li-ion', 'Lead-Acid', 'NiMH', 'NiCd', 'LiFePO4'] as const;

const RegisterBattery = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addBattery } = useBatteries();
  const { createAlert } = useAlerts();
  const [formData, setFormData] = useState({
    batteryId: '',
    type: '' as typeof batteryTypes[number] | '',
    voltage: '',
    temperature: '',
    chargeCycles: '',
    capacity: '',
    location: '',
    image: undefined as string | undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error("Image size must be less than 10MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Create an image element to draw and compress via canvas
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800; // max width/height

          if (width > height && width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          } else if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.7 quality to guarantee it fits in DB safely
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

          setFormData(prev => ({ ...prev, image: compressedBase64 }));
          toast.success("Image uploaded successfully");
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.batteryId || !formData.type || !formData.voltage ||
      !formData.temperature || !formData.chargeCycles || !formData.capacity || !formData.location) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    const soh = calculateSoH(
      parseFloat(formData.voltage),
      parseFloat(formData.temperature),
      parseInt(formData.chargeCycles),
      parseFloat(formData.capacity)
    );
    const status = getStatusFromSoH(soh);

    try {
      const insertedBattery = await addBattery({
        batteryId: formData.batteryId,
        type: formData.type as typeof batteryTypes[number],
        voltage: parseFloat(formData.voltage),
        temperature: parseFloat(formData.temperature),
        chargeCycles: parseInt(formData.chargeCycles),
        capacity: parseFloat(formData.capacity),
        location: formData.location,
        soh,
        status,
        image: formData.image,
      });
      // Alerts table uses battery_id = batteries.id (UUID), not custom battery_id text
      const batteryUuid = insertedBattery?.id;
      if (!batteryUuid) {
        console.error('addBattery did not return id');
      }

      // Generate condition-based alerts
      console.log('Generating condition-based alerts...');
      const conditionAlerts = generateBatteryAlerts({
        batteryId: formData.batteryId,
        temperature: parseFloat(formData.temperature),
        voltage: parseFloat(formData.voltage),
        soh,
        chargeCycles: parseInt(formData.chargeCycles),
        type: formData.type,
        location: formData.location,
      });

      console.log('Condition alerts to create:', conditionAlerts);

      let alertCreationFailed = false;
      for (const alert of conditionAlerts) {
        try {
          if (batteryUuid) {
            console.log(`Creating alert: type=${alert.type}, severity=${alert.severity}`);
            await createAlert(batteryUuid, alert.type, alert.severity, alert.message);
            console.log(`✓ Created ${alert.type} alert for battery ${formData.batteryId}`);
          }
        } catch (alertError: any) {
          console.error(`Failed to create condition alert:`, alertError);
          alertCreationFailed = true;
        }
      }

      const statusAlert = generateStatusAlert(formData.batteryId, status, soh, formData.location, formData.type);
      console.log('Status alert to create:', statusAlert);
      try {
        if (batteryUuid) {
          console.log(`Creating status alert: type=${statusAlert.type}, severity=${statusAlert.severity}`);
          await createAlert(batteryUuid, statusAlert.type, statusAlert.severity, statusAlert.message);
          console.log(`✓ Created status alert for battery ${formData.batteryId}`);
        } else {
          alertCreationFailed = true;
        }
      } catch (alertError: any) {
        console.error(`Failed to create status alert:`, alertError);
        alertCreationFailed = true;
      }

      // Send email alert based on battery status
      if (user?.email) {
        const displayName = user.user_metadata?.full_name || user.email.split('@')[0];

        try {
          if (status === 'recyclable') {
            await notificationService.sendRecyclableBatteryAlert(
              user.email,
              displayName,
              formData.batteryId,
              formData.type,
              soh,
              formData.location
            );
            toast.success(alertCreationFailed
              ? 'Battery registered! (Alerts may not have been created)'
              : 'Battery registered! Alert sent to your email.');
          } else if (status === 'repairable') {
            await notificationService.sendRepairableBatteryAlert(
              user.email,
              displayName,
              formData.batteryId,
              formData.type,
              soh,
              formData.location
            );
            toast.success(alertCreationFailed
              ? 'Battery registered! (Alerts may not have been created)'
              : 'Battery registered! Maintenance recommendation sent to your email.');
          } else if (status === 'healthy') {
            await notificationService.sendHealthyBatteryAlert(
              user.email,
              displayName,
              formData.batteryId,
              formData.type,
              soh,
              formData.location
            );
            toast.success(alertCreationFailed
              ? 'Battery registered! (Alerts may not have been created)'
              : 'Battery registered! Confirmation email sent to your inbox.');
          }
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
          toast.success('Battery registered successfully! (Email notification failed, but alert stored in system)');
        }
      } else {
        toast.success('Battery registered successfully!');
      }

      navigate('/results', {
        state: {
          batteryId: formData.batteryId,
          type: formData.type,
          soh,
          status,
          voltage: parseFloat(formData.voltage),
          temperature: parseFloat(formData.temperature),
          chargeCycles: parseInt(formData.chargeCycles),
          capacity: parseFloat(formData.capacity),
          location: formData.location,
          image: formData.image,
        },
      });
    } catch (error: any) {
      console.error('Full error:', error);
      const errorMsg = error?.message || error?.code || 'Failed to register battery';
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        status: error?.status,
        hint: error?.hint,
      });
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">Register Battery</h1>
          <p className="text-muted-foreground mt-1">
            Enter battery details to calculate health status and get disposal recommendations
          </p>
        </div>

        <div className="bg-card/95 backdrop-blur-sm rounded-xl border border-border/80 p-6 md:p-8 shadow-card animate-fade-in hover-lift">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="batteryId" className="flex items-center gap-2">
                  <Battery className="h-4 w-4 text-primary" />
                  Battery ID
                </Label>
                <Input
                  id="batteryId"
                  placeholder="e.g., BAT-001"
                  value={formData.batteryId}
                  onChange={(e) => setFormData({ ...formData, batteryId: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Battery Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as typeof batteryTypes[number] })}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {batteryTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="voltage" className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Voltage (V)
                </Label>
                <Input
                  id="voltage"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 3.7"
                  value={formData.voltage}
                  onChange={(e) => setFormData({ ...formData, voltage: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature" className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-primary" />
                  Temperature (°C)
                </Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 25"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chargeCycles" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-primary" />
                  Charge Cycles
                </Label>
                <Input
                  id="chargeCycles"
                  type="number"
                  placeholder="e.g., 150"
                  value={formData.chargeCycles}
                  onChange={(e) => setFormData({ ...formData, chargeCycles: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity" className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-primary" />
                  Capacity (%)
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g., 85"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Location / Department
              </Label>
              <Input
                id="location"
                placeholder="e.g., Warehouse A"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                Product Image
              </Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="cursor-pointer file:cursor-pointer file:text-primary file:font-medium"
              />
              {formData.image && (
                <div className="mt-2 relative w-32 h-32 rounded-lg overflow-hidden border border-border">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: undefined })}
                    className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white hover:bg-black/70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Analyzing Battery...
                </span>
              ) : (
                'Register & Analyze Battery'
              )}
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default RegisterBattery;
