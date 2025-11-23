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
import { Plus, Search, Edit, Trash2, Wrench, DollarSign, Clock, X } from 'lucide-react';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';

export default function ServicesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    defaultPrice: '',
    laborHours: '',
  });

  const { data: services, isLoading, refetch } = trpc.service.getAll.useQuery({});

  const createMutation = trpc.service.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsAddDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = trpc.service.update.useMutation({
    onSuccess: () => {
      refetch();
      setIsEditDialogOpen(false);
      setEditingService(null);
      resetForm();
    },
  });

  const deleteMutation = trpc.service.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const toggleActiveMutation = trpc.service.update.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      defaultPrice: '',
      laborHours: '',
    });
  };

  const handleAdd = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      defaultPrice: service.defaultPrice.toString(),
      laborHours: service.laborHours.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const handleToggleActive = async (service: any) => {
    await toggleActiveMutation.mutateAsync({
      id: service.id,
      isActive: !service.isActive,
    });
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      defaultPrice: parseFloat(formData.defaultPrice),
      laborHours: parseFloat(formData.laborHours),
    });
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      updateMutation.mutate({
        id: editingService.id,
        ...formData,
        defaultPrice: parseFloat(formData.defaultPrice),
        laborHours: parseFloat(formData.laborHours),
      });
    }
  };

  const filteredServices = services?.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="h-full bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20">
        {/* Header */}
        <div className="border-b bg-white/80 backdrop-blur-sm">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Services</h1>
              <p className="mt-1 text-gray-600">Manage service catalog and pricing</p>
            </div>
            <StarButton onClick={handleAdd} variant="default">
              Add Service
            </StarButton>
          </div>
        </div>

        <div className="p-8">
          {/* Search */}
          <Card className="mb-6 border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search services..."
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
              <Badge variant="secondary" className="px-4 py-2">
                {filteredServices?.length || 0} services
              </Badge>
            </div>
          </CardContent>
        </Card>

          {/* Services Table */}
          <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Service Catalog</CardTitle>
            <CardDescription>
              Manage your shop's service offerings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableSkeleton rows={5} columns={6} />
            ) : filteredServices?.length === 0 ? (
              <EmptyState 
                icon={Wrench} 
                title="No services yet" 
                description="Get started by adding your first service" 
                actionLabel="Add Service" 
                onAction={handleAdd} 
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Labor Hours</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices?.map((service) => (
                    <TableRow key={service.id} className="hover:bg-gray-50/80 transition-all hover:shadow-sm cursor-pointer group">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-gray-400" />
                          <div className="font-medium">{service.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md truncate text-sm text-gray-600">
                          {service.description || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span className="font-medium">
                            {service.defaultPrice.toFixed(2)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{service.laborHours} hrs</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(service)}
                        >
                          <Badge variant={service.isActive ? 'default' : 'secondary'}>
                            {service.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(service)}
                            className="hover:scale-110 hover:border-blue-500 hover:text-blue-600 transition-all"
                            aria-label="Edit service"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(service.id, service.name)}
                            className="hover:scale-110 hover:border-red-500 hover:text-red-600 transition-all"
                            aria-label="Delete service"
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

        {/* Add Service Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>
              Enter the service information below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultPrice">Price *</Label>
                  <Input
                    id="defaultPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.defaultPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultPrice: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="laborHours">Labor Hours *</Label>
                  <Input
                    id="laborHours"
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.laborHours}
                    onChange={(e) =>
                      setFormData({ ...formData, laborHours: e.target.value })
                    }
                    required
                  />
                </div>
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
                {createMutation.isPending ? 'Adding...' : 'Add Service'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update the service information below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Service Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-defaultPrice">Price *</Label>
                  <Input
                    id="edit-defaultPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.defaultPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultPrice: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-laborHours">Labor Hours *</Label>
                  <Input
                    id="edit-laborHours"
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.laborHours}
                    onChange={(e) =>
                      setFormData({ ...formData, laborHours: e.target.value })
                    }
                    required
                  />
                </div>
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
