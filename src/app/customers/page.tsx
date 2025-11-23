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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin, Users, X } from 'lucide-react';

export default function CustomersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [previousCursors, setPreviousCursors] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
  });

  const limit = 10;
  const { data, isLoading, refetch } = trpc.customer.getAll.useQuery({
    limit,
    search: searchTerm,
    cursor,
  });

  const createMutation = trpc.customer.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsAddDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = trpc.customer.update.useMutation({
    onSuccess: () => {
      refetch();
      setIsEditDialogOpen(false);
      setEditingCustomer(null);
      resetForm();
    },
  });

  const deleteMutation = trpc.customer.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      notes: '',
    });
  };

  const handleAdd = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    setFormData({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email || '',
      phone: customer.phone,
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      zipCode: customer.zipCode || '',
      notes: customer.notes || '',
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
    createMutation.mutate(formData);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      updateMutation.mutate({
        id: editingCustomer.id,
        ...formData,
      });
    }
  };

  const handleNextPage = () => {
    if (data?.nextCursor) {
      setPreviousCursors([...previousCursors, cursor || '']);
      setCursor(data.nextCursor);
    }
  };

  const handlePreviousPage = () => {
    if (previousCursors.length > 0) {
      const newPreviousCursors = [...previousCursors];
      const previousCursor = newPreviousCursors.pop();
      setPreviousCursors(newPreviousCursors);
      setCursor(previousCursor || undefined);
    }
  };

  const hasNextPage = !!data?.nextCursor;
  const hasPreviousPage = previousCursors.length > 0;

  return (
    <MainLayout>
      <div className="h-full bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20">
        {/* Header */}
        <div className="border-b bg-white/80 backdrop-blur-sm">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
              <p className="mt-1 text-gray-600">Manage your customer database</p>
            </div>
            <StarButton onClick={handleAdd} variant="default">
              Add Customer
            </StarButton>
          </div>
        </div>

        <div className="p-8">
          {/* Search and Stats */}
          <Card className="mb-6 border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by name, phone, or email..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCursor(undefined);
                      setPreviousCursors([]);
                    }}
                    className="pl-10 pr-10"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setCursor(undefined);
                        setPreviousCursors([]);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Badge variant="secondary" className="px-4 py-2">
                  {data?.customers.length || 0} customers
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Customers Table */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Customer List</CardTitle>
              <CardDescription>
                View and manage all customers in your system
              </CardDescription>
            </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableSkeleton rows={5} columns={5} />
            ) : data?.customers.length === 0 ? (
              <EmptyState 
                icon={Users} 
                title="No customers yet" 
                description="Get started by adding your first customer" 
                actionLabel="Add Customer" 
                onAction={handleAdd} 
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Vehicles</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.customers.map((customer) => (
                      <TableRow key={customer.id} className="hover:bg-gray-50/80 transition-all hover:shadow-sm cursor-pointer group">
                        <TableCell>
                          <div className="font-medium">
                            {customer.firstName} {customer.lastName}
                          </div>
                          {customer.notes && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {customer.notes}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {customer.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {customer.phone}
                              </div>
                            )}
                            {customer.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {customer.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {customer.city || customer.state ? (
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3" />
                              {customer.city}
                              {customer.city && customer.state && ', '}
                              {customer.state}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {customer.vehicles.length} vehicle(s)
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(customer)}
                              className="hover:scale-110 hover:border-blue-500 hover:text-blue-600 transition-all"
                              aria-label="Edit customer"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                handleDelete(
                                  customer.id,
                                  `${customer.firstName} ${customer.lastName}`
                                )
                              }
                              className="hover:scale-110 hover:border-red-500 hover:text-red-600 transition-all"
                              aria-label="Delete customer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {(hasNextPage || hasPreviousPage) && (
                  <div className="mt-4 flex items-center justify-end">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handlePreviousPage}
                        disabled={!hasPreviousPage}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleNextPage}
                        disabled={!hasNextPage}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Add Customer Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Enter the customer's information below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) =>
                      setFormData({ ...formData, zipCode: e.target.value })
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
                {createMutation.isPending ? 'Adding...' : 'Add Customer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update the customer's information below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName">First Name *</Label>
                  <Input
                    id="edit-firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Last Name *</Label>
                  <Input
                    id="edit-lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone *</Label>
                  <Input
                    id="edit-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-city">City</Label>
                  <Input
                    id="edit-city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-state">State</Label>
                  <Input
                    id="edit-state"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-zipCode">ZIP Code</Label>
                  <Input
                    id="edit-zipCode"
                    value={formData.zipCode}
                    onChange={(e) =>
                      setFormData({ ...formData, zipCode: e.target.value })
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
