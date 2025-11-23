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
import { Plus, Search, Eye, Edit, Trash2, FileText, Calendar, DollarSign, X } from 'lucide-react';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-orange-100 text-orange-800',
};

export default function EstimatesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);

  const [formData, setFormData] = useState({
    customerId: '',
    workOrderId: '',
    description: '',
    notes: '',
    validUntil: '',
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

  const { data: estimates, isLoading, refetch } = trpc.estimate.getAll.useQuery({
    status: statusFilter !== 'ALL' ? statusFilter as any : undefined,
  });

  const { data: selectedDetails, refetch: refetchDetails } = trpc.estimate.getById.useQuery(
    { id: selectedEstimate?.id || '' },
    { enabled: !!selectedEstimate }
  );

  const { data: customers } = trpc.customer.getAll.useQuery({ limit: 1000 });
  const { data: services } = trpc.service.getAll.useQuery({});
  const { data: parts } = trpc.part.getAll.useQuery({});

  const createMutation = trpc.estimate.create.useMutation({
    onSuccess: (estimate) => {
      refetch();
      setIsAddDialogOpen(false);
      setSelectedEstimate(estimate);
      setIsDetailsDialogOpen(true);
      resetForm();
    },
  });

  const updateMutation = trpc.estimate.update.useMutation({
    onSuccess: () => {
      refetch();
      if (selectedEstimate) {
        refetchDetails();
      }
    },
  });

  const deleteMutation = trpc.estimate.delete.useMutation({
    onSuccess: () => {
      refetch();
      if (isDetailsDialogOpen) {
        setIsDetailsDialogOpen(false);
        setSelectedEstimate(null);
      }
    },
  });

  const addServiceMutation = trpc.estimate.addService.useMutation({
    onSuccess: () => {
      refetchDetails();
      refetch();
      resetServiceForm();
    },
  });

  const removeServiceMutation = trpc.estimate.removeService.useMutation({
    onSuccess: () => {
      refetchDetails();
      refetch();
    },
  });

  const addPartMutation = trpc.estimate.addPart.useMutation({
    onSuccess: () => {
      refetchDetails();
      refetch();
      resetPartForm();
    },
  });

  const removePartMutation = trpc.estimate.removePart.useMutation({
    onSuccess: () => {
      refetchDetails();
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      customerId: '',
      workOrderId: '',
      description: '',
      notes: '',
      validUntil: '',
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

  const handleAdd = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleViewDetails = (estimate: any) => {
    setSelectedEstimate(estimate);
    setIsDetailsDialogOpen(true);
  };

  const handleDelete = async (id: string, estimateNumber: string) => {
    if (confirm(`Are you sure you want to delete ${estimateNumber}?`)) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      workOrderId: formData.workOrderId || undefined,
      validUntil: formData.validUntil ? new Date(formData.validUntil) : undefined,
    });
  };

  const handleUpdateStatus = (status: string) => {
    if (selectedEstimate) {
      updateMutation.mutate({
        id: selectedEstimate.id,
        status: status as any,
      });
    }
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEstimate) {
      addServiceMutation.mutate({
        estimateId: selectedEstimate.id,
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
    if (selectedEstimate) {
      addPartMutation.mutate({
        estimateId: selectedEstimate.id,
        partId: partFormData.partId,
        quantity: parseInt(partFormData.quantity),
        price: parseFloat(partFormData.price),
        notes: partFormData.notes || undefined,
      });
    }
  };

  const filteredEstimates = estimates?.filter((est) =>
    est.estimateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${est.customer.firstName} ${est.customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="h-full bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20">
        {/* Header */}
        <div className="border-b bg-white/80 backdrop-blur-sm">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Estimates</h1>
              <p className="mt-1 text-gray-600">Create and manage customer estimates</p>
            </div>
            <StarButton onClick={handleAdd} variant="default">
              New Estimate
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
                  placeholder="Search by estimate number or customer..."
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
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="secondary" className="px-4 py-2">
                {filteredEstimates?.length || 0} estimates
              </Badge>
            </div>
          </CardContent>
        </Card>

          {/* Estimates Table */}
          <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Estimates</CardTitle>
            <CardDescription>
              Manage repair estimates and quotes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableSkeleton rows={5} columns={6} />
            ) : filteredEstimates?.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No estimates yet"
                description="Get started by creating your first estimate"
                actionLabel="New Estimate"
                onAction={handleAdd}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estimate #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEstimates?.map((estimate) => (
                    <TableRow
                      key={estimate.id}
                      className="hover:bg-gray-50/80 transition-all hover:shadow-sm cursor-pointer group"
                      onClick={() => handleViewDetails(estimate)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{estimate.estimateNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{estimate.customer.firstName} {estimate.customer.lastName}</div>
                          <div className="text-sm text-gray-500">{estimate.customer.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span className="font-medium">{estimate.total.toFixed(2)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(statusColors[estimate.status], estimate.status === 'SENT' && 'animate-pulse')}>
                          {estimate.status === 'SENT' && (
                            <span className="relative flex h-2 w-2 mr-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                          )}
                          {estimate.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {new Date(estimate.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(estimate.id, estimate.estimateNumber)}
                            className="hover:scale-110 hover:border-red-500 hover:text-red-600 transition-all"
                            aria-label="Delete estimate"
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

        {/* Add Estimate Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Estimate</DialogTitle>
            <DialogDescription>
              Start a new customer estimate
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
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.firstName} {customer.lastName} - {customer.phone}
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
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) =>
                    setFormData({ ...formData, validUntil: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
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
                {createMutation.isPending ? 'Creating...' : 'Create Estimate'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Estimate Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Estimate Details</DialogTitle>
            <DialogDescription>
              {selectedDetails?.estimateNumber}
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
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SENT">Sent</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Customer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div className="font-medium">{selectedDetails.customer.firstName} {selectedDetails.customer.lastName}</div>
                    <div>{selectedDetails.customer.phone}</div>
                    <div>{selectedDetails.customer.email}</div>
                    <div className="text-gray-500">
                      {selectedDetails.customer.address}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Services */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedDetails.services.map((es) => (
                      <div key={es.id} className="flex items-center justify-between border-b pb-2">
                        <div className="flex-1">
                          <div className="font-medium">{es.service.name}</div>
                          <div className="text-sm text-gray-500">
                            {es.laborHours} hrs × ${es.price.toFixed(2)} × {es.quantity}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="font-medium">${(es.price * es.quantity).toFixed(2)}</div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeServiceMutation.mutate({ id: es.id, estimateId: selectedDetails.id })}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <form onSubmit={handleAddService} className="space-y-3 border-t pt-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
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
                        </div>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Quantity"
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
                          placeholder="Labor Hours"
                          value={serviceFormData.laborHours}
                          onChange={(e) => setServiceFormData({ ...serviceFormData, laborHours: e.target.value })}
                          required
                        />
                        <Button type="submit" disabled={addServiceMutation.isPending} className="w-full">
                          {addServiceMutation.isPending ? 'Adding...' : 'Add Service'}
                        </Button>
                      </div>
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
                    {selectedDetails.parts.map((ep) => (
                      <div key={ep.id} className="flex items-center justify-between border-b pb-2">
                        <div className="flex-1">
                          <div className="font-medium">{ep.part.name}</div>
                          <div className="text-sm text-gray-500">
                            ${ep.price.toFixed(2)} × {ep.quantity}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="font-medium">${(ep.price * ep.quantity).toFixed(2)}</div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removePartMutation.mutate({ id: ep.id, estimateId: selectedDetails.id })}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <form onSubmit={handleAddPart} className="space-y-3 border-t pt-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
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
                              {parts?.map((part) => (
                                <SelectItem key={part.id} value={part.id}>
                                  {part.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Quantity"
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
                        <Button type="submit" disabled={addPartMutation.isPending} className="col-span-2 w-full">
                          {addPartMutation.isPending ? 'Adding...' : 'Add Part'}
                        </Button>
                      </div>
                    </form>
                  </div>
                </CardContent>
              </Card>

              {/* Totals */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">${selectedDetails.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax (8%):</span>
                      <span className="font-medium">${selectedDetails.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 text-lg font-bold">
                      <span>Total:</span>
                      <span>${selectedDetails.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
