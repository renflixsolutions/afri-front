import { useState } from 'react';
import { usePaymentTransactions } from '@/hooks/usePaymentTransactions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, CheckCircle, XCircle, Search, Eye, DollarSign, FileSpreadsheet } from 'lucide-react';

export default function Payments() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { transactions, summary, pagination, loading, error } = usePaymentTransactions(page);

  // Filter transactions by search
  const filteredTransactions = transactions.filter(tx =>
    tx.user_name.toLowerCase().includes(search.toLowerCase()) ||
    tx.reference.toLowerCase().includes(search.toLowerCase()) ||
    tx.description.toLowerCase().includes(search.toLowerCase())
  );

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
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <Card className="relative overflow-hidden border-none bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total Transactions</p>
                  <p className="text-xl font-bold mt-1">{summary.total_transactions}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">All payments</p>
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
                  <p className="text-xs font-medium text-muted-foreground">Successful</p>
                  <p className="text-xl font-bold mt-1">{summary.status_breakdown.successful}</p>
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
                  <p className="text-xs font-medium text-muted-foreground">Failed</p>
                  <p className="text-xl font-bold mt-1">{summary.status_breakdown.failed}</p>
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
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.id}</TableCell>
                    <TableCell>{tx.transaction_type}</TableCell>
                    <TableCell>{tx.reference}</TableCell>
                    <TableCell>
                      <Badge variant={tx.payment_status === 'successful' ? 'success' : tx.payment_status === 'failed' ? 'destructive' : 'secondary'}>
                        {tx.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell>{tx.amount} {tx.currency}</TableCell>
                    <TableCell>{tx.user_name}</TableCell>
                    <TableCell>{tx.created_at}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
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
    </div>
  );
}

