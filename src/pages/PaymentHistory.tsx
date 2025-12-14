import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Eye, DollarSign, FileSpreadsheet, Clock, Download } from 'lucide-react';
import PaymentHistoryService from '@/services/api/PaymentHistoryService';
import { Payment, PaymentHistoryFilters } from '@/types/payment-history';

const formatAmount = (amount: string, currency: string) => `${currency} ${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
const formatDate = (date: string) => new Date(date).toLocaleString();

export default function PaymentHistory() {
  const [page, setPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [filters, setFilters] = useState<PaymentHistoryFilters>({
    per_page: 15,
  });

  const { data: statsData } = useQuery({
    queryKey: ['payment-statistics'],
    queryFn: () => PaymentHistoryService.getPaymentStatistics(),
  });

  const stats = statsData?.data;

  const { data, isLoading } = useQuery({
    queryKey: ['payment-history', page, filters],
    queryFn: () => PaymentHistoryService.getPaymentHistory(page, filters),
  });

  const payments = data?.data?.payments ?? [];
  const pagination = data?.data?.pagination;

  const handleFilterChange = (key: keyof PaymentHistoryFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value === 'all' ? undefined : value }));
    setPage(1);
  };

  const handleExport = () => {
    const url = PaymentHistoryService.exportPaymentHistory(filters);
    window.open(url, '_blank');
    toast.success('Payment history export started');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'cancelled':
        return <Badge variant="outline"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getGatewayBadge = (gateway: string) => {
    const colors: Record<string, string> = {
      pesapal: 'bg-blue-500',
      flutterwave: 'bg-orange-500',
      mpesa: 'bg-green-500',
    };
    return <Badge className={colors[gateway] || 'bg-gray-500'}>{gateway.toUpperCase()}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment History</h1>
          <p className="text-muted-foreground mt-2">View and track all your payment transactions</p>
        </div>
        <Button onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {stats?.overview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total Payments</p>
                  <p className="text-2xl font-bold mt-1">{stats.overview.total_payments}</p>
                  <p className="text-xs text-green-600 mt-1">{stats.overview.successful_payments} successful</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total Amount Paid</p>
                  <p className="text-2xl font-bold mt-1">{formatAmount(stats.overview.total_amount_paid, stats.overview.currency)}</p>
                  <p className="text-xs text-muted-foreground mt-1">All payments</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Successful</p>
                  <p className="text-2xl font-bold mt-1 text-green-600">{stats.overview.successful_payments}</p>
                  <p className="text-xs text-muted-foreground mt-1">Completed</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.overview.pending_payments}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatAmount(stats.overview.pending_amount, stats.overview.currency)}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.gateway || 'all'} onValueChange={(value) => handleFilterChange('gateway', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Gateways" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Gateways</SelectItem>
                <SelectItem value="pesapal">Pesapal</SelectItem>
                <SelectItem value="flutterwave">Flutterwave</SelectItem>
                <SelectItem value="mpesa">M-Pesa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.module || 'all'} onValueChange={(value) => handleFilterChange('module', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Modules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                <SelectItem value="job">Job Application</SelectItem>
                <SelectItem value="scholarship">Scholarship</SelectItem>
                <SelectItem value="course">Language Course</SelectItem>
                <SelectItem value="opportunity">Opportunity</SelectItem>
                <SelectItem value="application_fee">Application Fee</SelectItem>
                <SelectItem value="service_plan">Service Plan</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="From Date"
              value={filters.from_date || ''}
              onChange={(e) => handleFilterChange('from_date', e.target.value)}
            />

            <Input
              type="date"
              placeholder="To Date"
              value={filters.to_date || ''}
              onChange={(e) => handleFilterChange('to_date', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Payments Found</h3>
              <p className="text-muted-foreground">No payment transactions match your filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Gateway</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-xs">{payment.reference.substring(0, 13)}...</TableCell>
                    <TableCell>{getGatewayBadge(payment.gateway)}</TableCell>
                    <TableCell className="font-semibold">{formatAmount(payment.amount, payment.currency)}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="max-w-xs truncate">{payment.description}</TableCell>
                    <TableCell className="text-sm">{formatDate(payment.created_at)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => setSelectedPayment(payment)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {pagination && pagination.last_page > 1 && (
        <div className="flex justify-center items-center gap-4">
          <Button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            variant="outline"
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          <Button
            disabled={page >= pagination.last_page}
            onClick={() => setPage(page + 1)}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}

      <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              Payment Details
              {selectedPayment && getStatusBadge(selectedPayment.status)}
            </DialogTitle>
            <DialogDescription>Complete transaction information</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              {/* Payer Information */}
              {(selectedPayment.user_name || selectedPayment.user_email || selectedPayment.user_phone) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 text-blue-900">Payer Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedPayment.user_name && (
                      <div>
                        <p className="text-xs text-blue-600">Name</p>
                        <p className="text-sm font-semibold">{selectedPayment.user_name}</p>
                      </div>
                    )}
                    {selectedPayment.user_email && (
                      <div>
                        <p className="text-xs text-blue-600">Email</p>
                        <p className="text-sm">{selectedPayment.user_email}</p>
                      </div>
                    )}
                    {selectedPayment.user_phone && (
                      <div>
                        <p className="text-xs text-blue-600">Phone</p>
                        <p className="text-sm">{selectedPayment.user_phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Reference</p>
                  <p className="font-mono text-sm font-bold">{selectedPayment.reference}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Provider Reference</p>
                  <p className="font-mono text-sm">{selectedPayment.provider_reference || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="text-lg font-bold">{formatAmount(selectedPayment.amount, selectedPayment.currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Gateway</p>
                  <div className="mt-1">{getGatewayBadge(selectedPayment.gateway)}</div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payment Method</p>
                  <p className="text-sm font-semibold">{selectedPayment.payment_method}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm">{selectedPayment.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="text-sm">{selectedPayment.description}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created At</p>
                  <p className="text-sm">{formatDate(selectedPayment.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Updated At</p>
                  <p className="text-sm">{formatDate(selectedPayment.updated_at)}</p>
                </div>
              </div>

              {selectedPayment.items && selectedPayment.items.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Payment Items</h3>
                  <div className="space-y-3">
                    {selectedPayment.items.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">{item.module_name}</p>
                              <Badge variant="outline" className="mt-1">{item.module}</Badge>
                              {item.item_details && (
                                <div className="mt-2 text-sm text-muted-foreground">
                                  {Object.entries(item.item_details).map(([key, value]) => (
                                    <div key={key}>
                                      <span className="font-medium">{key}:</span> {String(value)}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{formatAmount(item.amount, selectedPayment.currency)}</p>
                              {getStatusBadge(item.status)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {selectedPayment.pesapal_data && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Pesapal Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Order Tracking ID</p>
                      <p className="font-mono">{selectedPayment.pesapal_data.order_tracking_id}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">IPN ID</p>
                      <p className="font-mono">{selectedPayment.pesapal_data.ipn_id}</p>
                    </div>
                    {selectedPayment.pesapal_data.pesapal_status && (
                      <>
                        <div>
                          <p className="text-muted-foreground">Status Code</p>
                          <p>{selectedPayment.pesapal_data.pesapal_status.payment_status_code}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Confirmation Code</p>
                          <p className="font-mono">{selectedPayment.pesapal_data.pesapal_status.confirmation_code}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

