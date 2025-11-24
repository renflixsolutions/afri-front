import React, { useState } from 'react';
import { usePaymentTransactions } from '../hooks/usePaymentTransactions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, CheckCircle, XCircle, Search, Eye, DollarSign, FileSpreadsheet } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const formatAmount = (amount: string | number, currency: string) => `${currency} ${parseFloat(amount as string).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
const formatDate = (date: string) => new Date(date).toLocaleString();

const PaymentTransactionsList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState(null);
  const { transactions, summary, pagination, loading, error } = usePaymentTransactions(page);

  // Filter transactions by search
  const filteredTransactions = transactions.filter(tx =>
    tx.user_email.toLowerCase().includes(search.toLowerCase()) ||
    tx.reference.toLowerCase().includes(search.toLowerCase()) ||
    tx.description.toLowerCase().includes(search.toLowerCase())
  );

  // Stats from financial_summary
  const financial = summary?.financial_summary;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground mt-2">View and manage payment transactions</p>
        </div>
      </div>

      {/* Stats Cards */}
      {financial && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <Card className="relative overflow-hidden border-none bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total Payments</p>
                  <p className="text-xl font-bold mt-1">{financial.total_payments}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">All transactions</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-md">
                  <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-none bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-xl font-bold mt-1">{formatAmount(financial.total_amount, 'KES')}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Sum of all payments</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-md">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-none bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Successful Amount</p>
                  <p className="text-xl font-bold mt-1">{formatAmount(financial.successful_amount, 'KES')}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Completed payments</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-md">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-none bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Failed Amount</p>
                  <p className="text-xl font-bold mt-1">{formatAmount(financial.failed_amount, 'KES')}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Unsuccessful payments</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-md">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* Add more filters here if needed */}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>User Email</TableHead>
                  <TableHead>User Phone</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map(tx => (
                  <TableRow key={tx.reference}>
                    <TableCell>{tx.reference}</TableCell>
                    <TableCell>
                      <Badge variant={tx.payment_status === 'successful' ? 'success' : tx.payment_status === 'failed' ? 'destructive' : 'secondary'}>
                        {tx.payment_status || tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatAmount(tx.amount, tx.currency)}</TableCell>
                    <TableCell>{tx.user_email}</TableCell>
                    <TableCell>{tx.user_phone}</TableCell>
                    <TableCell>{formatDate(tx.created_at)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => setSelectedTx(tx)}>
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

      {/* Pagination */}
      {pagination && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button disabled={!pagination.prev_page_url} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span>Page {pagination.current_page} of {pagination.last_page}</span>
          <Button disabled={!pagination.next_page_url} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}

      {/* Transaction Details Modal */}
      <Dialog open={!!selectedTx} onOpenChange={open => !open && setSelectedTx(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              Transaction Details
              {selectedTx && (
                selectedTx.payment_status === 'successful' ? <CheckCircle className="h-6 w-6 text-green-600" aria-label="Successful" /> :
                selectedTx.payment_status === 'failed' ? <XCircle className="h-6 w-6 text-red-600" aria-label="Failed" /> :
                <Calendar className="h-6 w-6 text-yellow-500" aria-label="Pending" />
              )}
            </DialogTitle>
            <DialogDescription>Full details for this payment transaction.</DialogDescription>
          </DialogHeader>
          {selectedTx && (
            <div className="space-y-8 py-2">
              {/* Key Info Section */}
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border-b pb-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">Reference</span>
                  <div className="flex items-center gap-2 font-mono text-lg font-bold">
                    {selectedTx.reference}
                    <Button variant="ghost" size="icon" aria-label="Copy Reference" onClick={() => navigator.clipboard.writeText(selectedTx.reference)}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h8m-8-4h8M4 6h16M4 6v12a2 2 0 002 2h12a2 2 0 002-2V6" /></svg>
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">Status</span>
                  <Badge variant={selectedTx.payment_status === 'successful' ? 'success' : selectedTx.payment_status === 'failed' ? 'destructive' : 'secondary'} className="text-base px-3 py-1">
                    {selectedTx.payment_status || selectedTx.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">Amount</span>
                  <div className="flex items-center gap-2 font-bold text-lg">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    {formatAmount(selectedTx.amount, selectedTx.currency)}
                  </div>
                </div>
              </div>
              {/* User Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">User Email</span>
                  <div className="flex items-center gap-2 text-base">
                    {selectedTx.user_email}
                    <Button variant="ghost" size="icon" aria-label="Copy Email" onClick={() => navigator.clipboard.writeText(selectedTx.user_email)}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h8m-8-4h8M4 6h16M4 6v12a2 2 0 002 2h12a2 2 0 002-2V6" /></svg>
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">User Phone</span>
                  <div className="text-base">{selectedTx.user_phone}</div>
                </div>
              </div>
              {/* Transaction Details Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">Description</span>
                  <div className="text-base">{selectedTx.description}</div>
                </div>
                {selectedTx.payment_method && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground">Payment Method</span>
                    <div className="text-base">{selectedTx.payment_method}</div>
                  </div>
                )}
                {selectedTx.fee && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground">Transaction Fee</span>
                    <div className="text-base">{formatAmount(selectedTx.fee, selectedTx.currency)}</div>
                  </div>
                )}
                {selectedTx.error_message && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground">Error Message</span>
                    <div className="text-base text-red-600">{selectedTx.error_message}</div>
                  </div>
                )}
              </div>
              {/* Timestamps Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">Created At</span>
                  <div className="text-base">{formatDate(selectedTx.created_at)}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">Updated At</span>
                  <div className="text-base">{formatDate(selectedTx.updated_at)}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentTransactionsList;
