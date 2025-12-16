import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, Eye, DollarSign, Users, TrendingUp, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import CourseFeeService from '@/services/api/CourseFeeService';
import { CourseFeePayment, CourseFeeFilters } from '@/types/course-fees';

const formatAmount = (amount: string) => `KES ${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export default function CourseFees() {
  const [page, setPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<CourseFeePayment | null>(null);
  const [filters, setFilters] = useState<CourseFeeFilters>({
    per_page: 15,
  });

  const { data: statsData } = useQuery({
    queryKey: ['course-fee-statistics'],
    queryFn: () => CourseFeeService.getCourseFeeStatistics(),
  });

  const stats = statsData?.data;

  const { data, isLoading } = useQuery({
    queryKey: ['course-fees', page, filters],
    queryFn: () => CourseFeeService.getCourseFees(page, filters),
  });

  const courseFees = data?.data?.course_fees ?? [];
  const pagination = data?.data?.pagination;

  const handleFilterChange = (key: keyof CourseFeeFilters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value === 'all' ? undefined : value }));
    setPage(1);
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'full':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Fully Paid</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Partial</Badge>;
      case 'pending':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Fee Payments</h1>
          <p className="text-muted-foreground mt-2">Manage and track student course fee payments</p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold mt-1">{stats.overview.total_students}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Fully Paid</p>
                  <p className="text-2xl font-bold mt-1 text-green-600">{stats.overview.fully_paid}</p>
                  <p className="text-xs text-muted-foreground mt-1">100% collected</p>
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
                  <p className="text-xs font-medium text-muted-foreground">Partially Paid</p>
                  <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.overview.partially_paid}</p>
                  <p className="text-xs text-muted-foreground mt-1">≥50% paid</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold mt-1 text-red-600">{stats.overview.pending}</p>
                  <p className="text-xs text-muted-foreground mt-1">&lt;50% paid</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Collection Rate</p>
                  <p className="text-2xl font-bold mt-1">{stats.financial.collection_rate.toFixed(1)}%</p>
                  <p className="text-xs text-green-600 mt-1">{formatAmount(stats.financial.total_collected)}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Financial Summary */}
      {stats && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Overview
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Expected Fees</p>
                <p className="text-2xl font-bold text-blue-900">{formatAmount(stats.financial.total_fees)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Collected</p>
                <p className="text-2xl font-bold text-green-600">{formatAmount(stats.financial.total_collected)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                <p className="text-2xl font-bold text-orange-600">{formatAmount(stats.financial.total_balance)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              value={filters.payment_status || 'all'}
              onValueChange={(value) => handleFilterChange('payment_status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Status</SelectItem>
                <SelectItem value="full">Fully Paid</SelectItem>
                <SelectItem value="partial">Partially Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.is_eligible === undefined ? 'all' : filters.is_eligible.toString()}
              onValueChange={(value) => handleFilterChange('is_eligible', value === 'all' ? 'all' : value === 'true')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Class Eligibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="true">Eligible for Class</SelectItem>
                <SelectItem value="false">Not Eligible</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.per_page?.toString() || '15'}
              onValueChange={(value) => setFilters(prev => ({ ...prev, per_page: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : courseFees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Course Fees Found</h3>
              <p className="text-muted-foreground">No student payments match your filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course/Bundle</TableHead>
                  <TableHead>Total Fee</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Eligible</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courseFees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{fee.student.name}</p>
                        <p className="text-xs text-muted-foreground">{fee.student.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{fee.course_details.name}</p>
                        <Badge variant="outline" className="mt-1 text-xs">{fee.course_details.type}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{formatAmount(fee.fee_summary.total_fee)}</TableCell>
                    <TableCell className="text-green-600 font-semibold">
                      {formatAmount(fee.fee_summary.amount_paid)}
                      <p className="text-xs text-muted-foreground">{fee.fee_summary.percentage_paid}%</p>
                    </TableCell>
                    <TableCell className="text-orange-600 font-semibold">{formatAmount(fee.fee_summary.balance)}</TableCell>
                    <TableCell>{getPaymentStatusBadge(fee.fee_summary.payment_status)}</TableCell>
                    <TableCell>
                      {fee.eligibility.is_eligible_for_class ? (
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Eligible
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Not Eligible
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => setSelectedPayment(fee)}>
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

      {/* Payment Details Modal */}
      <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Course Fee Payment Details</DialogTitle>
            <DialogDescription>Complete payment information for student enrollment</DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold mb-3 text-blue-900">Student Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-blue-600">Name</p>
                    <p className="text-sm font-semibold">{selectedPayment.student.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">Email</p>
                    <p className="text-sm">{selectedPayment.student.email}</p>
                  </div>
                  {selectedPayment.student.phone && (
                    <div>
                      <p className="text-xs text-blue-600">Phone</p>
                      <p className="text-sm">{selectedPayment.student.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-blue-600">Enrollment ID</p>
                    <p className="text-sm font-mono">{selectedPayment.enrollment_id}</p>
                  </div>
                </div>
              </div>

              {/* Course Details */}
              <div>
                <h3 className="font-semibold mb-3">Course Details</h3>
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-lg">{selectedPayment.course_details.name}</p>
                      <Badge variant="outline" className="mt-2">{selectedPayment.course_details.type}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Due Date</p>
                      <p className="font-semibold">{formatDate(selectedPayment.due_date)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fee Summary */}
              <div>
                <h3 className="font-semibold mb-3">Fee Summary</h3>
                <div className="grid grid-cols-2 gap-4 border rounded-lg p-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Fee</p>
                    <p className="text-lg font-bold">{formatAmount(selectedPayment.fee_summary.total_fee)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Amount Paid</p>
                    <p className="text-lg font-bold text-green-600">{formatAmount(selectedPayment.fee_summary.amount_paid)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Balance</p>
                    <p className="text-lg font-bold text-orange-600">{formatAmount(selectedPayment.fee_summary.balance)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Payment Status</p>
                    <div className="mt-1">{getPaymentStatusBadge(selectedPayment.fee_summary.payment_status)}</div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Percentage Paid</p>
                    <p className="text-lg font-bold">{selectedPayment.fee_summary.percentage_paid}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Minimum Required</p>
                    <p className="text-lg font-bold">{formatAmount(selectedPayment.fee_summary.minimum_required)}</p>
                  </div>
                </div>
              </div>

              {/* Eligibility */}
              <div className={`border rounded-lg p-4 ${selectedPayment.eligibility.is_eligible_for_class ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <h3 className="font-semibold mb-3">Class Eligibility</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Can Attend Class</p>
                    <div className="mt-1">
                      {selectedPayment.eligibility.is_eligible_for_class ? (
                        <Badge className="bg-green-500">Yes</Badge>
                      ) : (
                        <Badge variant="destructive">No</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">First Installment</p>
                    <div className="mt-1">
                      {selectedPayment.eligibility.first_installment_paid ? (
                        <Badge className="bg-green-500">Paid</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Second Installment</p>
                    <div className="mt-1">
                      {selectedPayment.eligibility.second_installment_paid ? (
                        <Badge className="bg-green-500">Paid</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Installments */}
              <div>
                <h3 className="font-semibold mb-3">Installments</h3>
                <div className="space-y-3">
                  {selectedPayment.installments.map((installment) => (
                    <div key={installment.installment_number} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">Installment {installment.installment_number}</p>
                          <p className="text-lg font-bold text-green-600 mt-1">{formatAmount(installment.amount)}</p>
                          {installment.paid_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Paid on {formatDate(installment.paid_at)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {installment.status === 'paid' ? (
                            <Badge className="bg-green-500">Paid</Badge>
                          ) : installment.status === 'failed' ? (
                            <Badge variant="destructive">Failed</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                          {installment.payment_reference && (
                            <p className="text-xs text-muted-foreground mt-2 font-mono">
                              {installment.payment_reference.substring(0, 13)}...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Link */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-3">Payment Link</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedPayment.payment_link}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded text-sm font-mono bg-white"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(selectedPayment.payment_link)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedPayment.payment_link, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Next Action */}
              <div className={`border rounded-lg p-4 ${selectedPayment.next_action.can_attend_class ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <h3 className="font-semibold mb-2">Next Action</h3>
                <p className="text-sm">{selectedPayment.next_action.message}</p>
                {selectedPayment.next_action.action_required && (
                  <Badge variant="destructive" className="mt-2">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Action Required
                  </Badge>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

