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
import { Plus, Search, Eye, Edit, Trash2, Receipt, Calendar, DollarSign, CreditCard, X, Printer } from 'lucide-react';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  UNPAID: 'bg-red-100 text-red-800',
  PARTIAL: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-orange-100 text-orange-800',
};

export default function InvoicesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const [formData, setFormData] = useState({
    workOrderId: '',
    dueDate: '',
    notes: '',
  });

  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'CASH',
  });

  const { data: invoices, isLoading, refetch } = trpc.invoice.getAll.useQuery({
    status: statusFilter !== 'ALL' ? statusFilter as any : undefined,
  });

  const { data: selectedDetails, refetch: refetchDetails } = trpc.invoice.getById.useQuery(
    { id: selectedInvoice?.id || '' },
    { enabled: !!selectedInvoice }
  );

  const { data: workOrders } = trpc.workOrder.getAll.useQuery({ status: 'COMPLETED' });

  const createMutation = trpc.invoice.createFromWorkOrder.useMutation({
    onSuccess: (invoice) => {
      refetch();
      setIsCreateDialogOpen(false);
      setSelectedInvoice(invoice);
      setIsDetailsDialogOpen(true);
      resetForm();
    },
  });

  const recordPaymentMutation = trpc.invoice.recordPayment.useMutation({
    onSuccess: () => {
      refetch();
      refetchDetails();
      setIsPaymentDialogOpen(false);
      resetPaymentData();
    },
  });

  const updateMutation = trpc.invoice.update.useMutation({
    onSuccess: () => {
      refetch();
      if (selectedInvoice) {
        refetchDetails();
      }
    },
  });

  const deleteMutation = trpc.invoice.delete.useMutation({
    onSuccess: () => {
      refetch();
      if (isDetailsDialogOpen) {
        setIsDetailsDialogOpen(false);
        setSelectedInvoice(null);
      }
    },
  });

  const resetForm = () => {
    setFormData({
      workOrderId: '',
      dueDate: '',
      notes: '',
    });
  };

  const resetPaymentData = () => {
    setPaymentData({
      amount: '',
      paymentMethod: 'CASH',
    });
  };

  const handleCreate = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleViewDetails = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsDetailsDialogOpen(true);
  };

  const handleRecordPayment = () => {
    if (selectedInvoice) {
      const remainingBalance = selectedInvoice.total - selectedInvoice.amountPaid;
      setPaymentData({
        amount: remainingBalance.toFixed(2),
        paymentMethod: 'CASH',
      });
      setIsPaymentDialogOpen(true);
    }
  };

  const handleDelete = async (id: string, invoiceNumber: string) => {
    if (confirm(`Are you sure you want to delete ${invoiceNumber}?`)) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const handlePrint = (invoice: any) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    // Calculate balance
    const balance = (invoice.total || 0) - (invoice.amountPaid || 0);

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #0066FF; }
            .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .info-box { flex: 1; }
            .info-box h3 { margin: 0 0 10px 0; color: #333; }
            .info-box p { margin: 5px 0; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f5f5f5; font-weight: bold; }
            .totals { text-align: right; margin-top: 20px; }
            .totals p { margin: 8px 0; }
            .total-amount { font-size: 18px; font-weight: bold; color: #0066FF; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; }
            .status-paid { background: #dcfce7; color: #166534; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-overdue { background: #fee2e2; color: #991b1b; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE</h1>
            <p>Invoice #${invoice.invoiceNumber}</p>
          </div>
          
          <div class="info-section">
            <div class="info-box">
              <h3>Bill To:</h3>
              <p><strong>${invoice.customer?.firstName || ''} ${invoice.customer?.lastName || ''}</strong></p>
              <p>${invoice.customer?.email || ''}</p>
              <p>${invoice.customer?.phone || ''}</p>
            </div>
            <div class="info-box">
              <h3>Invoice Details:</h3>
              <p><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}</p>
              ${invoice.dueDate ? `<p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>` : ''}
              <p><strong>Status:</strong> <span class="status status-${invoice.status.toLowerCase()}">${invoice.status}</span></p>
            </div>
          </div>

          ${invoice.workOrder ? `
            <div style="margin-bottom: 20px;">
              <h3>Work Order: ${invoice.workOrder.workOrderNumber}</h3>
              <p><strong>Vehicle:</strong> ${invoice.workOrder.vehicle?.year || ''} ${invoice.workOrder.vehicle?.make || ''} ${invoice.workOrder.vehicle?.model || ''}</p>
            </div>
          ` : ''}

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${(() => {
                const items = [];
                // Add services
                if (invoice.workOrder?.services) {
                  invoice.workOrder.services.forEach((s: any) => {
                    items.push(`
                      <tr>
                        <td>${s.service?.name || s.description || 'Service'}</td>
                        <td>${s.quantity}</td>
                        <td>$${s.price.toFixed(2)}</td>
                        <td>$${(s.price * s.quantity).toFixed(2)}</td>
                      </tr>
                    `);
                  });
                }
                // Add parts
                if (invoice.workOrder?.parts) {
                  invoice.workOrder.parts.forEach((p: any) => {
                    items.push(`
                      <tr>
                        <td>${p.part?.name || p.description || 'Part'}</td>
                        <td>${p.quantity}</td>
                        <td>$${p.price.toFixed(2)}</td>
                        <td>$${(p.price * p.quantity).toFixed(2)}</td>
                      </tr>
                    `);
                  });
                }
                return items.length > 0 ? items.join('') : '<tr><td colspan="4" style="text-align: center; color: #999;">No items</td></tr>';
              })()}
            </tbody>
          </table>

          <div class="totals">
            <p><strong>Subtotal:</strong> $${(invoice.subtotal || 0).toFixed(2)}</p>
            <p><strong>Tax:</strong> $${(invoice.tax || 0).toFixed(2)}</p>
            <p class="total-amount"><strong>Total:</strong> $${(invoice.total || 0).toFixed(2)}</p>
            <p><strong>Amount Paid:</strong> $${(invoice.amountPaid || 0).toFixed(2)}</p>
            <p class="total-amount"><strong>Balance Due:</strong> $${balance.toFixed(2)}</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
    });
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInvoice) {
      recordPaymentMutation.mutate({
        id: selectedInvoice.id,
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod as any,
      });
    }
  };

  const handleUpdateStatus = (status: string) => {
    if (selectedInvoice) {
      updateMutation.mutate({
        id: selectedInvoice.id,
        status: status as any,
      });
    }
  };

  const filteredInvoices = invoices?.filter((inv) =>
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${inv.customer.firstName} ${inv.customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="h-full bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20">
        {/* Header */}
        <div className="border-b bg-white/80 backdrop-blur-sm">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
              <p className="mt-1 text-gray-600">Manage invoices and payments</p>
            </div>
            <StarButton onClick={handleCreate} variant="default">
              Create Invoice
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
                  placeholder="Search by invoice number or customer..."
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
                  <SelectItem value="UNPAID">Unpaid</SelectItem>
                  <SelectItem value="PARTIAL">Partial</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="secondary" className="px-4 py-2">
                {filteredInvoices?.length || 0} invoices
              </Badge>
            </div>
          </CardContent>
        </Card>

          {/* Invoices Table */}
          <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>
              Track invoices and payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableSkeleton rows={5} columns={8} />
            ) : filteredInvoices?.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No invoices yet"
                description="Get started by creating your first invoice"
                actionLabel="Create Invoice"
                onAction={handleCreate}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Work Order</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices?.map((invoice) => {
                    const balance = invoice.total - invoice.amountPaid;
                    return (
                      <TableRow
                        key={invoice.id}
                        className="hover:bg-gray-50/80 transition-all hover:shadow-sm cursor-pointer group"
                        onClick={() => handleViewDetails(invoice)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{invoice.invoiceNumber}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{invoice.customer.firstName} {invoice.customer.lastName}</div>
                            <div className="text-sm text-gray-500">{invoice.customer.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {invoice.workOrder?.workOrderNumber || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span className="font-medium">{invoice.total.toFixed(2)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-green-600">
                              ${invoice.amountPaid.toFixed(2)}
                            </div>
                            {balance > 0 && (
                              <div className="text-xs text-red-600">
                                ${balance.toFixed(2)} due
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(statusColors[invoice.status], (invoice.status === 'UNPAID' || invoice.status === 'PARTIAL') && 'animate-pulse')}>
                            {(invoice.status === 'UNPAID' || invoice.status === 'PARTIAL') && (
                              <span className="relative flex h-2 w-2 mr-1.5">
                                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", invoice.status === 'UNPAID' ? 'bg-red-400' : 'bg-yellow-400')}></span>
                                <span className={cn("relative inline-flex rounded-full h-2 w-2", invoice.status === 'UNPAID' ? 'bg-red-500' : 'bg-yellow-500')}></span>
                              </span>
                            )}
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {invoice.dueDate ? (
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {new Date(invoice.dueDate).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handlePrint(invoice)}
                              className="hover:scale-110 hover:border-blue-500 hover:text-blue-600 transition-all"
                              aria-label="Print receipt"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDelete(invoice.id, invoice.invoiceNumber)}
                              className="hover:scale-110 hover:border-red-500 hover:text-red-600 transition-all"
                              aria-label="Delete invoice"
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

        {/* Create Invoice Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Invoice from Work Order</DialogTitle>
            <DialogDescription>
              Select a completed work order to generate an invoice
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitCreate}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="workOrderId">Work Order *</Label>
                <Select
                  value={formData.workOrderId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, workOrderId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select completed work order" />
                  </SelectTrigger>
                  <SelectContent>
                    {workOrders?.map((wo) => (
                      <SelectItem key={wo.id} value={wo.id}>
                        {wo.workOrderNumber} - {wo.customer.firstName} {wo.customer.lastName} - {wo.vehicle.make} {wo.vehicle.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
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
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Spinner size="sm" className="mr-2" />}
                {createMutation.isPending ? 'Creating...' : 'Create Invoice'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invoice Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              {selectedDetails?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedDetails && (
            <div className="space-y-6">
              {/* Status & Actions */}
              <div className="flex items-center justify-between">
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
                      <SelectItem value="UNPAID">Unpaid</SelectItem>
                      <SelectItem value="PARTIAL">Partial</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="OVERDUE">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {selectedDetails.status !== 'PAID' && (
                  <Button onClick={handleRecordPayment}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Record Payment
                  </Button>
                )}
              </div>

              {/* Customer & Work Order Info */}
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
                {selectedDetails.workOrder && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Work Order</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1 text-sm">
                        <div className="font-medium">{selectedDetails.workOrder.workOrderNumber}</div>
                        <div>
                          {selectedDetails.workOrder.vehicle.year} {selectedDetails.workOrder.vehicle.make} {selectedDetails.workOrder.vehicle.model}
                        </div>
                        <div className="text-gray-500">
                          {selectedDetails.workOrder.vehicle.licensePlate}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Services */}
              {selectedDetails.workOrder && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedDetails.workOrder.services.map((ws: any) => (
                        <div key={ws.id} className="flex justify-between text-sm">
                          <div>
                            <div className="font-medium">{ws.service.name}</div>
                            <div className="text-gray-500">
                              {ws.laborHours} hrs × ${ws.price.toFixed(2)} × {ws.quantity}
                            </div>
                          </div>
                          <div className="font-medium">${(ws.price * ws.quantity).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Parts */}
              {selectedDetails.workOrder && selectedDetails.workOrder.parts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Parts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedDetails.workOrder.parts.map((wp: any) => (
                        <div key={wp.id} className="flex justify-between text-sm">
                          <div>
                            <div className="font-medium">{wp.part.name}</div>
                            <div className="text-gray-500">
                              ${wp.price.toFixed(2)} × {wp.quantity}
                            </div>
                          </div>
                          <div className="font-medium">${(wp.price * wp.quantity).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

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
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Amount Paid:</span>
                      <span className="font-medium">${selectedDetails.amountPaid.toFixed(2)}</span>
                    </div>
                    {selectedDetails.total - selectedDetails.amountPaid > 0 && (
                      <div className="flex justify-between border-t pt-2 text-lg font-bold text-red-600">
                        <span>Balance Due:</span>
                        <span>${(selectedDetails.total - selectedDetails.amountPaid).toFixed(2)}</span>
                      </div>
                    )}
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

      {/* Record Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Enter payment details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitPayment}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={paymentData.amount}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, amount: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select
                  value={paymentData.paymentMethod}
                  onValueChange={(value) =>
                    setPaymentData({ ...paymentData, paymentMethod: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                    <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                    <SelectItem value="CHECK">Check</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPaymentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={recordPaymentMutation.isPending}>
                {recordPaymentMutation.isPending && <Spinner size="sm" className="mr-2" />}
                {recordPaymentMutation.isPending ? 'Recording...' : 'Record Payment'}
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
