'use client';

import { useState, useMemo } from 'react';
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
import { Plus, Search, Eye, Edit, Trash2, ClipboardList, Calendar, DollarSign, X, User, Car } from 'lucide-react';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

export default function WorkOrdersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<any>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);

  const [formData, setFormData] = useState({
    customerId: '',
    vehicleId: '',
    assignedToId: '',
    description: '',
    customerNotes: '',
    internalNotes: '',
  });

  const [serviceFormData, setServiceFormData] = useState({
    serviceId: '',
    quantity: '1',
    price: '',
    laborHours: '',
    notes: '',
  });

  const [partFormData, setPartFormData] = useState({
    partId: '',
    quantity: '1',
    price: '',
    notes: '',
  });

  const { data: workOrders, isLoading, refetch } = trpc.workOrder.getAll.useQuery({
    status: statusFilter !== 'ALL' ? statusFilter as any : undefined,
  });

  const { data: selectedDetails, refetch: refetchDetails } = trpc.workOrder.getById.useQuery(
    { id: selectedWorkOrder?.id || '' },
    { enabled: !!selectedWorkOrder }
  );

  const { data: customers } = trpc.customer.getAll.useQuery({});
  const { data: vehicles } = trpc.vehicle.getAll.useQuery({});
  const { data: users } = trpc.auth.getUsers.useQuery();
  const { data: services } = trpc.service.getAll.useQuery({});
  const { data: parts } = trpc.part.getAll.useQuery({});

  const createMutation = trpc.workOrder.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsAddDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = trpc.workOrder.update.useMutation({
    onSuccess: () => {
      refetch();
      if (selectedWorkOrder) {
        refetchDetails();
      }
      setIsEditDialogOpen(false);
      setEditingWorkOrder(null);
      resetForm();
    },
  });

  const deleteMutation = trpc.workOrder.delete.useMutation({
    onSuccess: () => {
      refetch();
      if (isDetailsDialogOpen) {
        setIsDetailsDialogOpen(false);
        setSelectedWorkOrder(null);
      }
    },
  });

  const addServiceMutation = trpc.workOrder.addService.useMutation({
    onSuccess: () => {
      refetchDetails();
      resetServiceForm();
    },
  });

  const removeServiceMutation = trpc.workOrder.removeService.useMutation({
    onSuccess: () => {
      refetchDetails();
    },
  });

  const addPartMutation = trpc.workOrder.addPart.useMutation({
    onSuccess: () => {
      refetchDetails();
      resetPartForm();
    },
  });

  const removePartMutation = trpc.workOrder.removePart.useMutation({
    onSuccess: () => {
      refetchDetails();
    },
  });

  const resetForm = () => {
    setFormData({
      customerId: '',
      vehicleId: '',
      assignedToId: '',
      description: '',
      customerNotes: '',
      internalNotes: '',
    });
  };

  const resetServiceForm = () => {
    setServiceFormData({
      serviceId: '',
      quantity: '1',
      price: '',
      laborHours: '',
      notes: '',
    });
  };

  const resetPartForm = () => {
    setPartFormData({
      partId: '',
      quantity: '1',
      price: '',
      notes: '',
    });
  };

  const customerVehicles = useMemo(() => {
    if (!formData.customerId || !vehicles) return [];
    return vehicles.filter((v) => v.customerId === formData.customerId);
  }, [formData.customerId, vehicles]);

  const handleAdd = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEdit = (workOrder: any) => {
    setEditingWorkOrder(workOrder);
    setFormData({
      customerId: workOrder.customerId,
      vehicleId: workOrder.vehicleId,
      assignedToId: workOrder.assignedToId || '',
      description: workOrder.description || '',
      customerNotes: workOrder.customerNotes || '',
      internalNotes: workOrder.internalNotes || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleViewDetails = (workOrder: any) => {
    setSelectedWorkOrder(workOrder);
    setIsDetailsDialogOpen(true);
  };

  const handleDelete = async (id: string, workOrderNumber: string) => {
    if (confirm(`Are you sure you want to delete ${workOrderNumber}?`)) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWorkOrder) {
      updateMutation.mutate({
        id: editingWorkOrder.id,
        assignedToId: formData.assignedToId || undefined,
        description: formData.description,
        customerNotes: formData.customerNotes,
        internalNotes: formData.internalNotes,
      });
    }
  };

  const handleUpdateStatus = (status: string) => {
    if (selectedWorkOrder) {
      updateMutation.mutate({
        id: selectedWorkOrder.id,
        status: status as any,
      });
    }
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedWorkOrder) {
      addServiceMutation.mutate({
        workOrderId: selectedWorkOrder.id,
        serviceId: serviceFormData.serviceId,
        quantity: parseInt(serviceFormData.quantity),
        price: parseFloat(serviceFormData.price),
        laborHours: parseFloat(serviceFormData.laborHours),
        notes: serviceFormData.notes || undefined,
      });
    }
  };

  const handleAddPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedWorkOrder) {
      addPartMutation.mutate({
        workOrderId: selectedWorkOrder.id,
        partId: partFormData.partId,
        quantity: parseInt(partFormData.quantity),
        price: parseFloat(partFormData.price),
        notes: partFormData.notes || undefined,
      });
    }
  };

  const filteredWorkOrders = workOrders?.filter((wo) =>
    wo.workOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${wo.customer.firstName} ${wo.customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wo.vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wo.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = useMemo(() => {
    if (!selectedDetails) return 0;
    const servicesTotal = selectedDetails.services.reduce((sum, s) => sum + (s.price * s.quantity), 0);
    const partsTotal = selectedDetails.parts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    return servicesTotal + partsTotal;
  }, [selectedDetails]);

  return (
    <MainLayout>
      <div className="h-full bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20">
        {/* Header */}
        <div className="border-b bg-white/80 backdrop-blur-sm">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Work Orders</h1>
              <p className="mt-1 text-gray-600">Manage repair jobs and service requests</p>
            </div>
            <StarButton onClick={handleAdd} variant="default">
              New Work Order
            </StarButton>
          </div>
        </div>

        <div className="p-8">
          {/* Filters */}
          <Card className="mb-6 border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by work order number, customer, or vehicle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="secondary" className="px-4 py-2">
                {filteredWorkOrders?.length || 0} work orders
              </Badge>
            </div>
          </CardContent>
        </Card>

          {/* Work Orders Table */}
          <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Work Orders</CardTitle>
            <CardDescription>
              Track and manage repair work orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableSkeleton rows={5} columns={7} />
            ) : filteredWorkOrders?.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No work orders yet"
                description="Get started by creating your first work order"
                actionLabel="New Work Order"
                onAction={handleAdd}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Work Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkOrders?.map((wo) => (
                    <TableRow
                      key={wo.id}
                      className="hover:bg-gray-50/80 transition-all hover:shadow-sm cursor-pointer group"
                      onClick={() => handleViewDetails(wo)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ClipboardList className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{wo.workOrderNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-gray-400" />
                          <div>
                            <div className="font-medium">{wo.customer.firstName} {wo.customer.lastName}</div>
                            <div className="text-sm text-gray-500">{wo.customer.phone}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Car className="h-3 w-3 text-gray-400" />
                          <div>
                            <div className="font-medium">
                              {wo.vehicle.year} {wo.vehicle.make} {wo.vehicle.model}
                            </div>
                            <div className="text-sm text-gray-500">{wo.vehicle.licensePlate}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {wo.assignedTo ? (
                          <span className="text-sm">{wo.assignedTo.name}</span>
                        ) : (
                          <span className="text-gray-400">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(statusColors[wo.status], wo.status === 'IN_PROGRESS' && 'animate-pulse')}>
                          {wo.status === 'IN_PROGRESS' && (
                            <span className="relative flex h-2 w-2 mr-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                          )}
                          {wo.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {new Date(wo.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(wo)}
                            className="hover:scale-110 hover:border-blue-500 hover:text-blue-600 transition-all"
                            aria-label="Edit work order"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(wo.id, wo.workOrderNumber)}
                            className="hover:scale-110 hover:border-red-500 hover:text-red-600 transition-all"
                            aria-label="Delete work order"
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

        {/* Add Work Order Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Work Order</DialogTitle>
            <DialogDescription>
              Start a new repair work order
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="customerId">Customer *</Label>
                <Select
                  value={formData.customerId}
                  onValueChange={(value) => {
                    setFormData({ ...formData, customerId: value, vehicleId: '' });
                  }}
                >
                  <SelectTrigger id="customerId">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.customers && customers.customers.length > 0 ? (
                      customers.customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.firstName} {customer.lastName} - {customer.phone}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-gray-500">No customers available</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleId">Vehicle *</Label>
                <Select
                  value={formData.vehicleId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, vehicleId: value })
                  }
                  required
                  disabled={!formData.customerId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {customerVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedToId">Assign To</Label>
                <Select
                  value={formData.assignedToId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, assignedToId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                    {users?.filter(u => u.role === 'TECHNICIAN' || u.role === 'ADMIN').map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} - {user.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerNotes">Customer Notes</Label>
                <Textarea
                  id="customerNotes"
                  value={formData.customerNotes}
                  onChange={(e) =>
                    setFormData({ ...formData, customerNotes: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="internalNotes">Internal Notes</Label>
                <Textarea
                  id="internalNotes"
                  value={formData.internalNotes}
                  onChange={(e) =>
                    setFormData({ ...formData, internalNotes: e.target.value })
                  }
                  rows={2}
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
                {createMutation.isPending ? 'Creating...' : 'Create Work Order'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Work Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Work Order</DialogTitle>
            <DialogDescription>
              Update work order information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-assignedToId">Assign To</Label>
                <Select
                  value={formData.assignedToId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, assignedToId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                    {users?.filter(u => u.role === 'TECHNICIAN' || u.role === 'ADMIN').map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} - {user.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-customerNotes">Customer Notes</Label>
                <Textarea
                  id="edit-customerNotes"
                  value={formData.customerNotes}
                  onChange={(e) =>
                    setFormData({ ...formData, customerNotes: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-internalNotes">Internal Notes</Label>
                <Textarea
                  id="edit-internalNotes"
                  value={formData.internalNotes}
                  onChange={(e) =>
                    setFormData({ ...formData, internalNotes: e.target.value })
                  }
                  rows={2}
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

      {/* Work Order Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Work Order Details</DialogTitle>
            <DialogDescription>
              {selectedDetails?.workOrderNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedDetails && (
            <div className="space-y-6">
              {/* Status Update */}
              <div className="flex items-center gap-4">
                <Label>Status:</Label>
                <Select
                  value={selectedDetails.status}
                  onValueChange={handleUpdateStatus}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Customer & Vehicle Info */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Customer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      <div className="font-medium">{selectedDetails.customer.firstName} {selectedDetails.customer.lastName}</div>
                      <div>{selectedDetails.customer.phone}</div>
                      <div>{selectedDetails.customer.email}</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Vehicle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      <div className="font-medium">
                        {selectedDetails.vehicle.year} {selectedDetails.vehicle.make} {selectedDetails.vehicle.model}
                      </div>
                      <div>VIN: {selectedDetails.vehicle.vin}</div>
                      <div>Plate: {selectedDetails.vehicle.licensePlate}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Services */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedDetails.services.map((ws) => (
                      <div key={ws.id} className="flex items-center justify-between border-b pb-2">
                        <div className="flex-1">
                          <div className="font-medium">{ws.service.name}</div>
                          <div className="text-sm text-gray-500">
                            {ws.laborHours} hrs × ${ws.price.toFixed(2)} × {ws.quantity}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="font-medium">${(ws.price * ws.quantity).toFixed(2)}</div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeServiceMutation.mutate({ id: ws.id })}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <form onSubmit={handleAddService} className="grid grid-cols-5 gap-2">
                      <Select
                        value={serviceFormData.serviceId}
                        onValueChange={(value) => {
                          const service = services?.find(s => s.id === value);
                          setServiceFormData({
                            ...serviceFormData,
                            serviceId: value,
                            price: service?.defaultPrice.toString() || '',
                            laborHours: service?.laborHours.toString() || '',
                          });
                        }}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services?.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={serviceFormData.quantity}
                        onChange={(e) => setServiceFormData({ ...serviceFormData, quantity: e.target.value })}
                        required
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={serviceFormData.price}
                        onChange={(e) => setServiceFormData({ ...serviceFormData, price: e.target.value })}
                        required
                      />
                      <Input
                        type="number"
                        step="0.5"
                        placeholder="Hours"
                        value={serviceFormData.laborHours}
                        onChange={(e) => setServiceFormData({ ...serviceFormData, laborHours: e.target.value })}
                        required
                      />
                      <Button type="submit" disabled={addServiceMutation.isPending}>
                        Add
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>

              {/* Parts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Parts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedDetails.parts.map((wp) => (
                      <div key={wp.id} className="flex items-center justify-between border-b pb-2">
                        <div className="flex-1">
                          <div className="font-medium">{wp.part.name}</div>
                          <div className="text-sm text-gray-500">
                            ${wp.price.toFixed(2)} × {wp.quantity}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="font-medium">${(wp.price * wp.quantity).toFixed(2)}</div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removePartMutation.mutate({ id: wp.id })}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <form onSubmit={handleAddPart} className="grid grid-cols-4 gap-2">
                      <Select
                        value={partFormData.partId}
                        onValueChange={(value) => {
                          const part = parts?.find(p => p.id === value);
                          setPartFormData({
                            ...partFormData,
                            partId: value,
                            price: part?.price.toString() || '',
                          });
                        }}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select part" />
                        </SelectTrigger>
                        <SelectContent>
                          {parts?.filter(p => p.quantityInStock > 0).map((part) => (
                            <SelectItem key={part.id} value={part.id}>
                              {part.name} (Stock: {part.quantityInStock})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={partFormData.quantity}
                        onChange={(e) => setPartFormData({ ...partFormData, quantity: e.target.value })}
                        required
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={partFormData.price}
                        onChange={(e) => setPartFormData({ ...partFormData, price: e.target.value })}
                        required
                      />
                      <Button type="submit" disabled={addPartMutation.isPending}>
                        Add
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>

              {/* Total */}
              <div className="flex justify-end">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total Amount</div>
                  <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
    </MainLayout>
  );
}
