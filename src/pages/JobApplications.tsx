import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { Search, Eye, FileText, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import JobApplicationService from '@/services/api/JobApplicationService';
import { JobApplication, UpdateApplicationStatusRequest } from '@/types/jobs';
import JobApplicationViewModal from '@/components/JobApplicationViewModal';

export default function JobApplications() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Fetch applications
  const { data, isLoading } = useQuery({
    queryKey: ['job-applications', currentPage, statusFilter, searchQuery],
    queryFn: () => JobApplicationService.getApplications(currentPage, statusFilter || undefined),
  });

  const applications = data?.data?.data ?? [];
  const pagination = data?.data;

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (payload: UpdateApplicationStatusRequest) =>
      JobApplicationService.updateApplicationStatus(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      setIsViewModalOpen(false);
      setSelectedApplication(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update application status');
    }
  });

  const handleViewApplication = (application: JobApplication) => {
    setSelectedApplication(application);
    setIsViewModalOpen(true);
  };

  const handleStatusUpdate = async (id: string, status: 'pending' | 'shortlisted' | 'rejected', remarks?: string) => {
    await updateStatusMutation.mutateAsync({ id, status, remarks });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: React.ReactNode }> = {
      pending: { variant: 'secondary', icon: <Clock className="h-3 w-3 mr-1" /> },
      shortlisted: { variant: 'default', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      rejected: { variant: 'destructive', icon: <XCircle className="h-3 w-3 mr-1" /> },
    };

    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.icon}
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate stats
  const stats = {
    total: pagination?.total || 0,
    pending: applications.filter((app: JobApplication) => app.status === 'pending').length,
    shortlisted: applications.filter((app: JobApplication) => app.status === 'shortlisted').length,
    rejected: applications.filter((app: JobApplication) => app.status === 'rejected').length,
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Applications</h1>
          <p className="text-muted-foreground mt-2">Review and manage job applications from candidates</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Applications Card */}
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm">
          <div className="absolute inset-0 opacity-30">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="total-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#60A5FA', stopOpacity: 0.2}} />
                  <stop offset="100%" style={{stopColor: '#3B82F6', stopOpacity: 0.1}} />
                </linearGradient>
                <pattern id="total-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="2" fill="#60A5FA" opacity="0.3" />
                  <circle cx="0" cy="0" r="1.5" fill="#3B82F6" opacity="0.2" />
                  <circle cx="40" cy="0" r="1.5" fill="#3B82F6" opacity="0.2" />
                  <circle cx="0" cy="40" r="1.5" fill="#3B82F6" opacity="0.2" />
                  <circle cx="40" cy="40" r="1.5" fill="#3B82F6" opacity="0.2" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#total-grad)" />
              <rect width="100%" height="100%" fill="url(#total-pattern)" />
            </svg>
          </div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold mt-2">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-1">All submissions</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-md">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Review Card */}
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm">
          <div className="absolute inset-0 opacity-30">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="pending-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#FBBF24', stopOpacity: 0.2}} />
                  <stop offset="100%" style={{stopColor: '#F59E0B', stopOpacity: 0.1}} />
                </linearGradient>
                <pattern id="pending-pattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M0 25 L25 0 L50 25 L25 50 Z" fill="none" stroke="#FBBF24" strokeWidth="1.5" opacity="0.3" />
                  <circle cx="25" cy="25" r="3" fill="#F59E0B" opacity="0.2" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#pending-grad)" />
              <rect width="100%" height="100%" fill="url(#pending-pattern)" />
            </svg>
          </div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold mt-2">{stats.pending}</p>
                <p className="text-xs text-muted-foreground mt-1">Awaiting action</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shadow-md">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shortlisted Card */}
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm">
          <div className="absolute inset-0 opacity-30">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="shortlist-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#34D399', stopOpacity: 0.2}} />
                  <stop offset="100%" style={{stopColor: '#10B981', stopOpacity: 0.1}} />
                </linearGradient>
                <pattern id="shortlist-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                  <circle cx="30" cy="30" r="15" fill="none" stroke="#34D399" strokeWidth="1.5" opacity="0.3" />
                  <circle cx="30" cy="30" r="8" fill="none" stroke="#10B981" strokeWidth="1.5" opacity="0.3" />
                  <circle cx="30" cy="30" r="2" fill="#10B981" opacity="0.4" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#shortlist-grad)" />
              <rect width="100%" height="100%" fill="url(#shortlist-pattern)" />
            </svg>
          </div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Shortlisted</p>
                <p className="text-2xl font-bold mt-2">{stats.shortlisted}</p>
                <p className="text-xs text-muted-foreground mt-1">Top candidates</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shadow-md">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rejected Card */}
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm">
          <div className="absolute inset-0 opacity-30">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="reject-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#FB7185', stopOpacity: 0.2}} />
                  <stop offset="100%" style={{stopColor: '#F43F5E', stopOpacity: 0.1}} />
                </linearGradient>
                <pattern id="reject-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="40" y2="40" stroke="#FB7185" strokeWidth="1.5" opacity="0.3" />
                  <line x1="40" y1="0" x2="0" y2="40" stroke="#F43F5E" strokeWidth="1.5" opacity="0.3" />
                  <circle cx="20" cy="20" r="2" fill="#F43F5E" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#reject-grad)" />
              <rect width="100%" height="100%" fill="url(#reject-pattern)" />
            </svg>
          </div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold mt-2">{stats.rejected}</p>
                <p className="text-xs text-muted-foreground mt-1">Not suitable</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center shadow-md">
                <XCircle className="h-6 w-6 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by applicant name, email, or reference code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table with Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="">All Applications</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="mt-4">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No applications found</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Documents</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((application: JobApplication) => (
                        <TableRow key={application.id}>
                          <TableCell>
                            <span className="font-mono text-xs">{application.reference_code}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{application.applicant_name}</span>
                              <span className="text-xs text-muted-foreground">{application.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>{application.job.title}</TableCell>
                          <TableCell>{application.job.company}</TableCell>
                          <TableCell>{getStatusBadge(application.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(application.created_at)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              {application.application_documents?.length || 0}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewApplication(application)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.total > pagination.per_page && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {pagination.from} to {pagination.to} of {pagination.total} applications
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </Button>
                <div className="text-sm text-muted-foreground">
                  Page {pagination.current_page} of {pagination.last_page}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= pagination.last_page}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View/Edit Modal */}
      <JobApplicationViewModal
        application={selectedApplication}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedApplication(null);
        }}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}

