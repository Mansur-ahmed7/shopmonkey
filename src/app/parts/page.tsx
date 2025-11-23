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
import { Plus, Search, Edit, Trash2, Package, DollarSign, AlertTriangle, X } from 'lucide-react';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';

export default function PartsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    partNumber: '',
    description: '',
    price: '',
    cost: '',
    quantityInStock: '',
    minStockLevel: '',
  });

  const { data: parts, isLoading, refetch } = trpc.part.getAll.useQuery({});

  const createMutation = trpc.part.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsAddDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = trpc.part.update.useMutation({
    onSuccess: () => {
      refetch();
      setIsEditDialogOpen(false);
      setEditingPart(null);
      resetForm();
    },
  });

  const deleteMutation = trpc.part.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      partNumber: '',
      description: '',
      price: '',
      cost: '',
      quantityInStock: '',
      minStockLevel: '',
    });
  };

  const handleAdd = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEdit = (part: any) => {
    setEditingPart(part);
    setFormData({
      name: part.name,
      partNumber: part.partNumber || '',
      description: part.description || '',
      price: part.price.toString(),
      cost: part.cost?.toString() || '',
      quantityInStock: part.quantityInStock.toString(),
      minStockLevel: part.minStockLevel.toString(),
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
      price: parseFloat(formData.price),
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      quantityInStock: parseInt(formData.quantityInStock),
      minStockLevel: parseInt(formData.minStockLevel),
    });
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPart) {
      updateMutation.mutate({
        id: editingPart.id,
        ...formData,
        price: parseFloat(formData.price),
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        quantityInStock: parseInt(formData.quantityInStock),
        minStockLevel: parseInt(formData.minStockLevel),
      });
    }
  };

  const filteredParts = parts?.filter((part) =>
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="h-full bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20">
        {/* Header */}
        <div className="border-b bg-white/80 backdrop-blur-sm">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Parts Inventory</h1>
              <p className="mt-1 text-gray-600">Manage parts and stock levels</p>
            </div>
            <StarButton onClick={handleAdd} variant="default">
              Add Part
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
                  placeholder="Search by name, part number, or description..."
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
                {filteredParts?.length || 0} parts
              </Badge>
            </div>
          </CardContent>
        </Card>

          {/* Parts Table */}
          <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Parts Inventory</CardTitle>
            <CardDescription>
              Track parts availability and pricing
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableSkeleton rows={5} columns={7} />
            ) : filteredParts?.length === 0 ? (
              <EmptyState 
                icon={Package} 
                title="No parts yet" 
                description="Get started by adding your first part" 
                actionLabel="Add Part" 
                onAction={handleAdd} 
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part Name</TableHead>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParts?.map((part) => {
                    const isLowStock = part.quantityInStock <= part.minStockLevel;
                    const margin = part.cost ? ((part.price - part.cost) / part.price * 100) : null;
                    
                    return (
                      <TableRow key={part.id} className="hover:bg-gray-50/80 transition-all hover:shadow-sm cursor-pointer group">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium">{part.name}</div>
                              {part.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {part.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {part.partNumber || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span className="font-medium">
                              {part.price.toFixed(2)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {part.cost ? (
                            <div className="text-sm">
                              <div>${part.cost.toFixed(2)}</div>
                              {margin !== null && (
                                <div className="text-xs text-gray-500">
                                  {margin.toFixed(0)}% margin
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{part.quantityInStock}</div>
                            <div className="text-xs text-gray-500">
                              Min: {part.minStockLevel}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isLowStock ? (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Low Stock
                            </Badge>
                          ) : (
                            <Badge variant="default">In Stock</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(part)}
                              className="hover:scale-110 hover:border-blue-500 hover:text-blue-600 transition-all"
                              aria-label="Edit part"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDelete(part.id, part.name)}
                              className="hover:scale-110 hover:border-red-500 hover:text-red-600 transition-all"
                              aria-label="Delete part"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add Part Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Part</DialogTitle>
            <DialogDescription>
              Enter the part information below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Part Name *</Label>
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
                  <Label htmlFor="partNumber">Part Number</Label>
                  <Input
                    id="partNumber"
                    value={formData.partNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, partNumber: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Selling Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={(e) =>
                      setFormData({ ...formData, cost: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantityInStock">Quantity in Stock *</Label>
                  <Input
                    id="quantityInStock"
                    type="number"
                    min="0"
                    value={formData.quantityInStock}
                    onChange={(e) =>
                      setFormData({ ...formData, quantityInStock: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStockLevel">Minimum Stock Level *</Label>
                  <Input
                    id="minStockLevel"
                    type="number"
                    min="0"
                    value={formData.minStockLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, minStockLevel: e.target.value })
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
                {createMutation.isPending ? 'Adding...' : 'Add Part'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Part Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Part</DialogTitle>
            <DialogDescription>
              Update the part information below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Part Name *</Label>
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
                  <Label htmlFor="edit-partNumber">Part Number</Label>
                  <Input
                    id="edit-partNumber"
                    value={formData.partNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, partNumber: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Selling Price *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cost">Cost</Label>
                  <Input
                    id="edit-cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={(e) =>
                      setFormData({ ...formData, cost: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-quantityInStock">Quantity in Stock *</Label>
                  <Input
                    id="edit-quantityInStock"
                    type="number"
                    min="0"
                    value={formData.quantityInStock}
                    onChange={(e) =>
                      setFormData({ ...formData, quantityInStock: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-minStockLevel">Minimum Stock Level *</Label>
                  <Input
                    id="edit-minStockLevel"
                    type="number"
                    min="0"
                    value={formData.minStockLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, minStockLevel: e.target.value })
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
