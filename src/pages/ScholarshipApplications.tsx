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
import {
  Search,
  Eye,
  FileText,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  UserCheck
} from 'lucide-react';
import ScholarshipApplicationService from '@/services/api/ScholarshipApplicationService';
import { ScholarshipApplication } from '@/types/scholarships';
import ScholarshipApplicationViewModal from '@/components/ScholarshipApplicationViewModal';

export default function ScholarshipApplications() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedApplication, setSelectedApplication] = useState<ScholarshipApplication | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Fetch applications
  const { data, isLoading } = useQuery({
    queryKey: ['scholarship-applications', currentPage, statusFilter],
    queryFn: () => ScholarshipApplicationService.getApplications(currentPage, {
      status: statusFilter || undefined,
    }),
  });

  const applications = data?.data?.data ?? [];
  const pagination = data?.data;

  const handleViewApplication = (application: ScholarshipApplication) => {
    setSelectedApplication(application);
    setIsViewModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: React.ReactNode }> = {
      pending: { variant: 'secondary', icon: <Clock className="h-3 w-3 mr-1" /> },
      under_review: { variant: 'outline', icon: <FileText className="h-3 w-3 mr-1" /> },
      shortlisted: { variant: 'default', icon: <UserCheck className="h-3 w-3 mr-1" /> },
      accepted: { variant: 'default', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
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
    pending: applications.filter((app: ScholarshipApplication) => app.status === 'pending').length,
    under_review: applications.filter((app: ScholarshipApplication) => app.status === 'under_review').length,
    shortlisted: applications.filter((app: ScholarshipApplication) => app.status === 'shortlisted').length,
    accepted: applications.filter((app: ScholarshipApplication) => app.status === 'accepted').length,
    rejected: applications.filter((app: ScholarshipApplication) => app.status === 'rejected').length,
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered applications based on search
  const filteredApplications = searchQuery
    ? applications.filter((app: ScholarshipApplication) =>
        app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.application_ref.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : applications;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scholarship Applications</h1>
          <p className="text-muted-foreground mt-2">Review and manage scholarship applications</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm">
          <div className="absolute inset-0 opacity-30">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="total-apps-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#8B5CF6', stopOpacity: 0.2}} />
                  <stop offset="100%" style={{stopColor: '#7C3AED', stopOpacity: 0.1}} />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#total-apps-grad)" />
            </svg>
          </div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold mt-2">{stats.total}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center shadow-md">
                <Users className="h-5 w-5 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm">
          <div className="absolute inset-0 opacity-30">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="pending-apps-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#FBBF24', stopOpacity: 0.2}} />
                  <stop offset="100%" style={{stopColor: '#F59E0B', stopOpacity: 0.1}} />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#pending-apps-grad)" />
            </svg>
          </div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold mt-2">{stats.pending}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shadow-md">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm">
          <div className="absolute inset-0 opacity-30">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="review-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#60A5FA', stopOpacity: 0.2}} />
                  <stop offset="100%" style={{stopColor: '#3B82F6', stopOpacity: 0.1}} />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#review-grad)" />
            </svg>
          </div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Under Review</p>
                <p className="text-2xl font-bold mt-2">{stats.under_review}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-md">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm">
          <div className="absolute inset-0 opacity-30">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="accepted-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#34D399', stopOpacity: 0.2}} />
                  <stop offset="100%" style={{stopColor: '#10B981', stopOpacity: 0.1}} />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#accepted-grad)" />
            </svg>
          </div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold mt-2">{stats.accepted}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shadow-md">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm">
          <div className="absolute inset-0 opacity-30">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="rejected-apps-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#FB7185', stopOpacity: 0.2}} />
                  <stop offset="100%" style={{stopColor: '#F43F5E', stopOpacity: 0.1}} />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#rejected-apps-grad)" />
            </svg>
          </div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold mt-2">{stats.rejected}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center shadow-md">
                <XCircle className="h-5 w-5 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
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
              <TabsTrigger value="under_review">Under Review</TabsTrigger>
              <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="mt-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No applications found</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Scholarship</TableHead>
                        <TableHead>Institution</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Documents</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((application: ScholarshipApplication) => (
                        <TableRow key={application.id}>
                          <TableCell>
                            <span className="font-mono text-xs">{application.application_ref}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{application.full_name}</span>
                              <span className="text-xs text-muted-foreground">{application.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{application.opportunity.title}</span>
                              <span className="text-xs text-muted-foreground">{application.opportunity.level}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{application.opportunity.institution}</TableCell>
                          <TableCell>{getStatusBadge(application.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(application.submitted_at)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              {application.student_application_documents?.length || 0}
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

      {/* View Modal */}
      <ScholarshipApplicationViewModal
        application={selectedApplication}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedApplication(null);
        }}
      />
    </div>
  );
}

