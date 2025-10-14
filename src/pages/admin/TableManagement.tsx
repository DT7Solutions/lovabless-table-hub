import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

export default function TableManagement() {
  const { tables } = useData();
  const [viewMode, setViewMode] = useState<'floor' | 'list'>('floor');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success/20 border-success text-success';
      case 'occupied': return 'bg-destructive/20 border-destructive text-destructive';
      case 'reserved': return 'bg-info/20 border-info text-info';
      case 'cleaning': return 'bg-warning/20 border-warning text-warning';
      default: return 'bg-muted';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available': return <Badge className="bg-success">Available</Badge>;
      case 'occupied': return <Badge variant="destructive">Occupied</Badge>;
      case 'reserved': return <Badge className="bg-info">Reserved</Badge>;
      case 'cleaning': return <Badge className="bg-warning">Cleaning</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Table Management</h1>
          <p className="text-muted-foreground">Manage restaurant tables and seating</p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-muted p-1 rounded-lg">
            <Button
              variant={viewMode === 'floor' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('floor')}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Floor Plan
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4 mr-2" />
              List View
            </Button>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Add Table
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Table</DialogTitle>
              </DialogHeader>
              <TableForm onClose={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{tables.length}</div>
            <p className="text-sm text-muted-foreground">Total Tables</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-success">
              {tables.filter(t => t.status === 'available').length}
            </div>
            <p className="text-sm text-muted-foreground">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">
              {tables.filter(t => t.status === 'occupied').length}
            </div>
            <p className="text-sm text-muted-foreground">Occupied</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-info">
              {tables.filter(t => t.status === 'reserved').length}
            </div>
            <p className="text-sm text-muted-foreground">Reserved</p>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-success" />
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-destructive" />
              <span className="text-sm">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-info" />
              <span className="text-sm">Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-warning" />
              <span className="text-sm">Cleaning</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'floor' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tables.map(table => (
            <Card
              key={table.id}
              className={`cursor-pointer hover:shadow-lg transition-all border-2 ${getStatusColor(table.status)}`}
            >
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold mb-2">
                  {table.tableNumber}
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {table.seats} seats
                </div>
                <div className="text-xs font-medium">
                  {table.location}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4 font-medium">Table Number</th>
                    <th className="p-4 font-medium">Capacity</th>
                    <th className="p-4 font-medium">Location</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map(table => (
                    <tr key={table.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-semibold">Table {table.tableNumber}</td>
                      <td className="p-4">{table.seats} seats</td>
                      <td className="p-4">{table.location}</td>
                      <td className="p-4">{getStatusBadge(table.status)}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm" className="text-destructive">Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TableForm({ onClose }: { onClose: () => void }) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Success",
      description: "Table added successfully",
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="tableNumber">Table Number *</Label>
        <Input id="tableNumber" required />
      </div>

      <div>
        <Label htmlFor="capacity">Capacity *</Label>
        <Select required>
          <SelectTrigger>
            <SelectValue placeholder="Select capacity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 seats</SelectItem>
            <SelectItem value="4">4 seats</SelectItem>
            <SelectItem value="6">6 seats</SelectItem>
            <SelectItem value="8">8 seats</SelectItem>
            <SelectItem value="10">10+ seats</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="location">Location *</Label>
        <Select required>
          <SelectTrigger>
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="main">Main Hall</SelectItem>
            <SelectItem value="garden">Garden</SelectItem>
            <SelectItem value="private">Private Room</SelectItem>
            <SelectItem value="outdoor">Outdoor Patio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">Add Table</Button>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  );
}
