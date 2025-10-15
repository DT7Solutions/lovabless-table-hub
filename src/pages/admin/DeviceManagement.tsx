import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Tablet } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useData } from '@/contexts/DataContext';
import { Device, DeviceStatus } from '@/types';

const mockWaiters = [
  { id: '1', name: 'Rajesh Kumar' },
  { id: '2', name: 'Priya Sharma' },
  { id: '3', name: 'Vikram Singh' },
  { id: '4', name: 'Anjali Verma' },
];

export default function DeviceManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  // Mock devices data
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      serialNumber: 'TAB-001',
      deviceModel: 'Samsung Galaxy Tab A8',
      status: 'active',
      assignedWaiterId: '1',
      assignmentDate: '2024-01-15',
      notes: 'Primary device for morning shift',
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      serialNumber: 'TAB-002',
      deviceModel: 'iPad 9th Gen',
      status: 'active',
      assignedWaiterId: '2',
      assignmentDate: '2024-01-15',
      notes: 'Evening shift tablet',
      createdAt: '2024-01-01'
    },
    {
      id: '3',
      serialNumber: 'TAB-003',
      deviceModel: 'Samsung Galaxy Tab A8',
      status: 'inactive',
      notes: 'Spare device',
      createdAt: '2024-01-01'
    },
    {
      id: '4',
      serialNumber: 'TAB-004',
      deviceModel: 'iPad 9th Gen',
      status: 'maintenance',
      notes: 'Screen repair needed',
      createdAt: '2024-01-05'
    },
  ]);

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         device.deviceModel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getWaiterName = (waiterId?: string) => {
    const waiter = mockWaiters.find(w => w.id === waiterId);
    return waiter?.name || 'Unassigned';
  };

  const handleDelete = (deviceId: string) => {
    if (confirm('Are you sure you want to delete this device?')) {
      setDevices(devices.filter(d => d.id !== deviceId));
      toast({
        title: "Success",
        description: "Device deleted successfully",
      });
    }
  };

  const handleEdit = (device: Device) => {
    setEditingDevice(device);
    setIsAddDialogOpen(true);
  };

  const getStatusBadge = (status: DeviceStatus) => {
    const variants: Record<DeviceStatus, { variant: any; label: string }> = {
      active: { variant: 'default', label: 'Active' },
      inactive: { variant: 'secondary', label: 'Inactive' },
      maintenance: { variant: 'destructive', label: 'Maintenance' },
    };
    const { variant, label } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const availableDevicesCount = devices.filter(d => d.status === 'active' && !d.assignedWaiterId).length;
  const assignedDevicesCount = devices.filter(d => d.assignedWaiterId).length;
  const maintenanceCount = devices.filter(d => d.status === 'maintenance').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Device Management</h1>
          <p className="text-muted-foreground">Manage tablets and devices for waiters</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) setEditingDevice(null);
        }}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingDevice ? 'Edit Device' : 'Add New Device'}</DialogTitle>
            </DialogHeader>
            <DeviceForm 
              onClose={() => {
                setIsAddDialogOpen(false);
                setEditingDevice(null);
              }}
              devices={devices}
              setDevices={setDevices}
              editingDevice={editingDevice}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{devices.length}</div>
            <p className="text-sm text-muted-foreground">Total Devices</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{assignedDevicesCount}</div>
            <p className="text-sm text-muted-foreground">Assigned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{availableDevicesCount}</div>
            <p className="text-sm text-muted-foreground">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{maintenanceCount}</div>
            <p className="text-sm text-muted-foreground">In Maintenance</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by serial number or model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Devices Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="p-4 font-medium">Device ID</th>
                  <th className="p-4 font-medium">Serial Number</th>
                  <th className="p-4 font-medium">Model</th>
                  <th className="p-4 font-medium">Assigned Waiter</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Assignment Date</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Tablet className="h-12 w-12 opacity-20" />
                        <p>No devices found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDevices.map(device => (
                    <tr key={device.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Tablet className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-sm">{device.id}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium">{device.serialNumber}</span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {device.deviceModel}
                      </td>
                      <td className="p-4">
                        <span className={device.assignedWaiterId ? 'font-medium' : 'text-muted-foreground'}>
                          {getWaiterName(device.assignedWaiterId)}
                        </span>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(device.status)}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {device.assignmentDate 
                          ? new Date(device.assignmentDate).toLocaleDateString()
                          : '-'
                        }
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEdit(device)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(device.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface DeviceFormProps {
  onClose: () => void;
  devices: Device[];
  setDevices: React.Dispatch<React.SetStateAction<Device[]>>;
  editingDevice: Device | null;
}

function DeviceForm({ onClose, devices, setDevices, editingDevice }: DeviceFormProps) {
  const [serialNumber, setSerialNumber] = useState(editingDevice?.serialNumber || '');
  const [deviceModel, setDeviceModel] = useState(editingDevice?.deviceModel || '');
  const [status, setStatus] = useState<DeviceStatus>(editingDevice?.status || 'active');
  const [assignedWaiterId, setAssignedWaiterId] = useState(editingDevice?.assignedWaiterId || '');
  const [notes, setNotes] = useState(editingDevice?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: Check for duplicate serial numbers
    const isDuplicate = devices.some(
      d => d.serialNumber.toLowerCase() === serialNumber.toLowerCase() && d.id !== editingDevice?.id
    );

    if (isDuplicate) {
      toast({
        title: "Error",
        description: "A device with this serial number already exists",
        variant: "destructive",
      });
      return;
    }

    // Validation: Check if waiter is already assigned to another device
    if (assignedWaiterId) {
      const alreadyAssigned = devices.find(
        d => d.assignedWaiterId === assignedWaiterId && d.status === 'active' && d.id !== editingDevice?.id
      );

      if (alreadyAssigned) {
        const waiter = mockWaiters.find(w => w.id === assignedWaiterId);
        toast({
          title: "Warning",
          description: `${waiter?.name} is already assigned to device ${alreadyAssigned.serialNumber}. They will be reassigned to this device.`,
        });
      }
    }

    if (editingDevice) {
      // Update existing device
      setDevices(devices.map(d => 
        d.id === editingDevice.id 
          ? {
              ...d,
              serialNumber,
              deviceModel,
              status,
              assignedWaiterId: assignedWaiterId || undefined,
              assignmentDate: assignedWaiterId ? new Date().toISOString().split('T')[0] : undefined,
              notes,
            }
          : d
      ));
      toast({
        title: "Success",
        description: "Device updated successfully",
      });
    } else {
      // Add new device
      const newDevice: Device = {
        id: String(devices.length + 1),
        serialNumber,
        deviceModel,
        status,
        assignedWaiterId: assignedWaiterId || undefined,
        assignmentDate: assignedWaiterId ? new Date().toISOString().split('T')[0] : undefined,
        notes,
        createdAt: new Date().toISOString(),
      };

      setDevices([...devices, newDevice]);
      toast({
        title: "Success",
        description: "Device added successfully",
      });
    }

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="serialNumber">Serial Number *</Label>
        <Input
          id="serialNumber"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          placeholder="e.g., TAB-001"
          required
        />
      </div>

      <div>
        <Label htmlFor="deviceModel">Device Model *</Label>
        <Input
          id="deviceModel"
          value={deviceModel}
          onChange={(e) => setDeviceModel(e.target.value)}
          placeholder="e.g., Samsung Galaxy Tab A8"
          required
        />
      </div>

      <div>
        <Label htmlFor="status">Status *</Label>
        <Select value={status} onValueChange={(value: DeviceStatus) => setStatus(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="assignedWaiter">Assign to Waiter (Optional)</Label>
        <Select value={assignedWaiterId} onValueChange={setAssignedWaiterId}>
          <SelectTrigger>
            <SelectValue placeholder="Select waiter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Unassigned</SelectItem>
            {mockWaiters.map(waiter => (
              <SelectItem key={waiter.id} value={waiter.id}>
                {waiter.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="notes">Notes / Comments</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes about this device..."
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {editingDevice ? 'Update Device' : 'Add Device'}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
