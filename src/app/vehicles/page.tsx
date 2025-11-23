'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { StarButton } from '@/components/ui/star-button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Car, Calendar, Gauge, X } from 'lucide-react';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';

export default function VehiclesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);

  const [formData, setFormData] = useState({
    customerId: '',
    vin: '',
    year: new Date().getFullYear(),
    make: '',
    model: '',
    color: '',
    licensePlate: '',
    mileage: '',
    notes: '',
  });

  const { data: vehicles, isLoading, refetch } = trpc.vehicle.getAll.useQuery({
    search: searchTerm,
    customerId: selectedCustomerId === 'all' ? undefined : selectedCustomerId,
  });

  const { data: customers } = trpc.customer.getAll.useQuery({
    limit: 100,
  });

  const createMutation = trpc.vehicle.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsAddDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = trpc.vehicle.update.useMutation({
    onSuccess: () => {
      refetch();
      setIsEditDialogOpen(false);
      setEditingVehicle(null);
      resetForm();
    },
  });

  const deleteMutation = trpc.vehicle.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      customerId: '',
      vin: '',
      year: new Date().getFullYear(),
      make: '',
      model: '',
      color: '',
      licensePlate: '',
      mileage: '',
      notes: '',
    });
  };

  const handleAdd = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEdit = (vehicle: any) => {
    setEditingVehicle(vehicle);
    setFormData({
      customerId: vehicle.customerId,
      vin: vehicle.vin || '',
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      color: vehicle.color || '',
      licensePlate: vehicle.licensePlate || '',
      mileage: vehicle.mileage?.toString() || '',
      notes: vehicle.notes || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      mileage: formData.mileage ? parseInt(formData.mileage) : undefined,
    });
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      updateMutation.mutate({
        id: editingVehicle.id,
        ...formData,
        mileage: formData.mileage ? parseInt(formData.mileage) : undefined,
      });
    }
  };

  return (
    <MainLayout>
      <div className="h-full bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20">
        {/* Header */}
        <div className="border-b bg-white/80 backdrop-blur-sm">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vehicles</h1>
              <p className="mt-1 text-gray-600">Manage vehicle inventory</p>
            </div>
            <StarButton onClick={handleAdd} variant="default">
              Add Vehicle
            </StarButton>
          </div>
        </div>

        <div className="p-8">
          {/* Search and Filters */}
          <Card className="mb-6 border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by make, model, VIN, or license plate..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Filter by customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customers?.customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="secondary" className="px-4 py-2">
                {vehicles?.length || 0} vehicles
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Vehicles Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Vehicle List</CardTitle>
            <CardDescription>
              View and manage all vehicles in your system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableSkeleton rows={5} columns={6} />
            ) : vehicles?.length === 0 ? (
              <EmptyState 
                icon={Car} 
                title="No vehicles yet" 
                description="Get started by adding your first vehicle" 
                actionLabel="Add Vehicle" 
                onAction={handleAdd} 
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>VIN / License</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Work Orders</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles?.map((vehicle) => (
                    <TableRow key={vehicle.id} className="hover:bg-gray-50/80 transition-all hover:shadow-sm cursor-pointer group">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </div>
                            {vehicle.color && (
                              <div className="text-sm text-gray-500">{vehicle.color}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {vehicle.customer.firstName} {vehicle.customer.lastName}
                        </div>
                        {vehicle.customer.phone && (
                          <div className="text-sm text-gray-500">{vehicle.customer.phone}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {vehicle.vin && (
                            <div className="font-mono text-xs">{vehicle.vin}</div>
                          )}
                          {vehicle.licensePlate && (
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs">
                                {vehicle.licensePlate}
                              </Badge>
                            </div>
                          )}
                          {!vehicle.vin && !vehicle.licensePlate && (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {vehicle.mileage && (
                          <div className="flex items-center gap-1 text-sm">
                            <Gauge className="h-3 w-3" />
                            {vehicle.mileage.toLocaleString()} mi
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {vehicle._count.workOrders} order(s)
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(vehicle)}
                            className="hover:scale-110 hover:border-blue-500 hover:text-blue-600 transition-all"
                            aria-label="Edit vehicle"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              handleDelete(
                                vehicle.id,
                                `${vehicle.year} ${vehicle.make} ${vehicle.model}`
                              )
                            }
                            className="hover:scale-110 hover:border-red-500 hover:text-red-600 transition-all"
                            aria-label="Delete vehicle"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add Vehicle Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
            <DialogDescription>
              Enter the vehicle information below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="customerId">Customer *</Label>
                <Select
                  value={formData.customerId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, customerId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.firstName} {customer.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: parseInt(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="make">Make *</Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) =>
                      setFormData({ ...formData, make: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vin">VIN</Label>
                  <Input
                    id="vin"
                    value={formData.vin}
                    onChange={(e) =>
                      setFormData({ ...formData, vin: e.target.value })
                    }
                    placeholder="17-character VIN"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licensePlate">License Plate</Label>
                  <Input
                    id="licensePlate"
                    value={formData.licensePlate}
                    onChange={(e) =>
                      setFormData({ ...formData, licensePlate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage">Mileage</Label>
                  <Input
                    id="mileage"
                    type="number"
                    min="0"
                    value={formData.mileage}
                    onChange={(e) =>
                      setFormData({ ...formData, mileage: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Spinner size="sm" className="mr-2" />}
                {createMutation.isPending ? 'Adding...' : 'Add Vehicle'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription>
              Update the vehicle information below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-customerId">Customer *</Label>
                <Select
                  value={formData.customerId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, customerId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.firstName} {customer.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-year">Year *</Label>
                  <Input
                    id="edit-year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: parseInt(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-make">Make *</Label>
                  <Input
                    id="edit-make"
                    value={formData.make}
                    onChange={(e) =>
                      setFormData({ ...formData, make: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-model">Model *</Label>
                  <Input
                    id="edit-model"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-vin">VIN</Label>
                  <Input
                    id="edit-vin"
                    value={formData.vin}
                    onChange={(e) =>
                      setFormData({ ...formData, vin: e.target.value })
                    }
                    placeholder="17-character VIN"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-licensePlate">License Plate</Label>
                  <Input
                    id="edit-licensePlate"
                    value={formData.licensePlate}
                    onChange={(e) =>
                      setFormData({ ...formData, licensePlate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-color">Color</Label>
                  <Input
                    id="edit-color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-mileage">Mileage</Label>
                  <Input
                    id="edit-mileage"
                    type="number"
                    min="0"
                    value={formData.mileage}
                    onChange={(e) =>
                      setFormData({ ...formData, mileage: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Spinner size="sm" className="mr-2" />}
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </div>
    </MainLayout>
  );
}
