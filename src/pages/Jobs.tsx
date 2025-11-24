import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import {
  Search,
  Eye,
  Plus,
  Briefcase,
  MapPin,
  Building,
  Calendar,
  DollarSign,
  Users,
  Clock,
  Trash2,
  MoreHorizontal,
  EyeIcon
} from 'lucide-react';
import JobService from '@/services/api/JobService';
import { Job } from '@/types/jobs';
import { AddJobModal2, JobFormData } from '@/components/AddJobModal2';
import { JobViewEditModal } from '@/components/JobViewEditModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Jobs() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isViewEditModalOpen, setIsViewEditModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch jobs
  const { data, isLoading } = useQuery({
    queryKey: ['jobs', currentPage, searchQuery, jobTypeFilter, categoryFilter, levelFilter],
    queryFn: () => JobService.getJobs({
      page: currentPage,
      search: searchQuery || undefined,
      job_type: jobTypeFilter || undefined,
      category: categoryFilter || undefined,
      level: levelFilter || undefined,
    }),
  });

  const jobs = data?.data?.data ?? [];
  const pagination = data?.data;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => JobService.deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job deleted successfully');
      setIsDeleteDialogOpen(false);
      setJobToDelete(null);
    },
    onError: (error: unknown) => {
      let message = 'Failed to delete job';
      if (typeof error === 'object' && error !== null) {
        const maybeMessage = (error as { response?: { data?: { message?: unknown } } }).response?.data?.message;
        if (typeof maybeMessage === 'string' && maybeMessage.trim()) message = maybeMessage;
      }
      toast.error(message);
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Job> }) => JobService.updateJob(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job updated successfully');
      setIsViewEditModalOpen(false);
      setSelectedJob(null);
    },
    onError: (_error) => {
      toast.error('Failed to update job');
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: JobFormData) => JobService.createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job created successfully');
      setIsAddModalOpen(false);
    },
    onError: (_error) => {
      toast.error('Failed to create job');
    }
  });

  const handleView = (job: Job) => {
    setSelectedJob(job);
    setModalMode('view');
    setIsViewEditModalOpen(true);
  };

  const handleDeleteClick = (job: Job) => {
    setJobToDelete(job);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (jobToDelete) {
      deleteMutation.mutate(jobToDelete.id);
    }
  };

  const handleSaveJob = async (updatedJob: Partial<Job>) => {
    if (selectedJob) {
      await updateMutation.mutateAsync({
        id: selectedJob.id,
        data: updatedJob
      });
    }
  };

  const handleCreateJob = async (jobData: JobFormData) => {
    await createMutation.mutateAsync(jobData);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatSalaryRange = (job: Job) => {
    return `${job.salary_currency} ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-green-500';
      case 'closed':
        return 'bg-red-500';
      case 'draft':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Extract unique filter values
  const jobTypes = Array.from(new Set(jobs.map((job: Job) => job.job_type)));
  const categories = Array.from(new Set(jobs.map((job: Job) => job.category)));
  const levels = Array.from(new Set(jobs.map((job: Job) => job.level)));

  // Stats
  const stats = {
    total: pagination?.total || 0,
    open: jobs.filter((j: Job) => j.status === 'open').length,
    featured: jobs.filter((j: Job) => j.featured).length,
    applications: jobs.reduce((sum: number, j: Job) => sum + j.applications_count, 0),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Opportunities</h1>
          <p className="text-muted-foreground mt-2">Manage job postings and opportunities</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Job
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-none bg-white/70 backdrop-blur-sm">
          <div className="absolute inset-0 opacity-60">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="total-jobs-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#8B5CF6', stopOpacity: 0.4}} />
                  <stop offset="100%" style={{stopColor: '#7C3AED', stopOpacity: 0.3}} />
                </linearGradient>
                <pattern id="total-jobs-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="2" fill="#8B5CF6" opacity="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#total-jobs-grad)" />
              <rect width="100%" height="100%" fill="url(#total-jobs-pattern)" />
            </svg>
          </div>
          <CardContent className="p-4 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Jobs</p>
                <p className="text-xl font-bold mt-1">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-0.5">All opportunities</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center shadow-md">
                <Briefcase className="h-5 w-5 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-none bg-white/70 backdrop-blur-sm">
          <div className="absolute inset-0 opacity-60">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="open-positions-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#10B981', stopOpacity: 0.4}} />
                  <stop offset="100%" style={{stopColor: '#059669', stopOpacity: 0.3}} />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#open-positions-grad)" />
            </svg>
          </div>
          <CardContent className="p-4 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Open Positions</p>
                <p className="text-xl font-bold mt-1">{stats.open}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Active hiring</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shadow-md">
                <Clock className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-none bg-white/70 backdrop-blur-sm">
          <div className="absolute inset-0 opacity-60">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="applications-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#3B82F6', stopOpacity: 0.4}} />
                  <stop offset="100%" style={{stopColor: '#2563EB', stopOpacity: 0.3}} />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#applications-grad)" />
            </svg>
          </div>
          <CardContent className="p-4 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Applications</p>
                <p className="text-xl font-bold mt-1">{stats.applications}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Candidate interest</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-md">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={jobTypeFilter || undefined} onValueChange={(value) => setJobTypeFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                {jobTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter || undefined} onValueChange={(value) => setCategoryFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={levelFilter || undefined} onValueChange={(value) => setLevelFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardContent className="pt-6">
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No jobs found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Salary Range</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Applications</TableHead>
                    <TableHead>Closing Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-16" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-16" />
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-8 mx-auto" />
                            <Skeleton className="h-3 w-12 mx-auto" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-8 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    jobs.map((job: Job) => (
                      <TableRow key={job.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{job.title}</span>
                              {job.featured && (
                                <Badge variant="default" className="bg-yellow-500">
                                  Featured
                                </Badge>
                              )}
                            </div>
                            {job.partner && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Building className="h-3 w-3" />
                                <span>{job.partner.name}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div className="flex flex-col">
                              <span className="text-sm">{job.location}</span>
                              <span className="text-xs text-muted-foreground">{job.country}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {job.job_type}
                            </Badge>
                            {job.is_remote && (
                              <Badge variant="outline" className="bg-blue-50">
                                Remote
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{job.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>{formatSalaryRange(job)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(job.status)}`}>
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{job.applications_count}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Eye className="h-3 w-3" />
                              <span>{job.views_count}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {formatDate(job.closing_date)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(job)}>
                                <EyeIcon className="h-4 w-4 mr-2" />
                                View / Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(job)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {pagination.from} to {pagination.to} of {pagination.total} jobs
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                    .filter(page => {
                      return page === 1 ||
                             page === pagination.last_page ||
                             Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, index, array) => {
                      const prevPage = array[index - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;

                      return (
                        <>
                          {showEllipsis && (
                            <span key={`ellipsis-${page}`} className="px-2">...</span>
                          )}
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        </>
                      );
                    })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.last_page}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <JobViewEditModal
        job={selectedJob}
        isOpen={isViewEditModalOpen}
        onClose={() => {
          setIsViewEditModalOpen(false);
          setSelectedJob(null);
        }}
        onSave={handleSaveJob}
        mode={modalMode}
      />

      <AddJobModal2
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleCreateJob}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job posting
              <strong> "{jobToDelete?.title}"</strong> and remove it from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
