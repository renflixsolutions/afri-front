import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import {
  Search,
  Eye,
  Plus,
  GraduationCap,
  MapPin,
  Building,
  Calendar,
  DollarSign,
  Users,
  BookOpen,
  Trash2,
  ExternalLink
} from 'lucide-react';
import ScholarshipService from '@/services/api/ScholarshipService';
import { Scholarship } from '@/types/scholarships';
import AddScholarshipModal from '@/components/AddScholarshipModal';
import ScholarshipViewEditModal from '@/components/ScholarshipViewEditModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function Scholarships() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [fundingFilter, setFundingFilter] = useState<string>('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [isViewEditModalOpen, setIsViewEditModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [scholarshipToDelete, setScholarshipToDelete] = useState<Scholarship | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch scholarships
  const { data, isLoading } = useQuery({
    queryKey: ['scholarships', currentPage, searchQuery, countryFilter, levelFilter, fundingFilter],
    queryFn: () => ScholarshipService.getScholarships(currentPage, {
      search: searchQuery || undefined,
      country: countryFilter || undefined,
      level: levelFilter || undefined,
      funding_type: fundingFilter && fundingFilter !== 'all' ? (fundingFilter as any) : undefined,
    }),
  });

  const scholarships = data?.data?.data ?? [];
  const pagination = data?.data;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => ScholarshipService.deleteScholarship(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scholarships'] });
      toast.success('Scholarship deleted successfully');
      setIsDeleteDialogOpen(false);
      setScholarshipToDelete(null);
    },
    onError: (error: unknown) => {
      let message = 'Failed to delete scholarship';
      if (typeof error === 'object' && error !== null) {
        const maybeMessage = (error as { response?: { data?: { message?: unknown } } }).response?.data?.message;
        if (typeof maybeMessage === 'string' && maybeMessage.trim()) message = maybeMessage;
      }
      toast.error(message);
    }
  });

  const handleView = (scholarship: Scholarship) => {
    setSelectedScholarship(scholarship);
    setModalMode('view');
    setIsViewEditModalOpen(true);
  };

  const handleDeleteClick = (scholarship: Scholarship) => {
    setScholarshipToDelete(scholarship);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (scholarshipToDelete) {
      deleteMutation.mutate(scholarshipToDelete.id);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Stats
  const stats = {
    total: pagination?.total || 0,
    fullyFunded: scholarships.filter((s: Scholarship) => s.is_fully_funded).length,
    published: scholarships.filter((s: Scholarship) => s.is_published).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scholarships</h1>
          <p className="text-muted-foreground mt-2">Manage scholarship opportunities for students</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Scholarship
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm">
          <div className="absolute inset-0 opacity-30">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="total-scholarships-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#8B5CF6', stopOpacity: 0.2}} />
                  <stop offset="100%" style={{stopColor: '#7C3AED', stopOpacity: 0.1}} />
                </linearGradient>
                <pattern id="total-scholarships-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="2" fill="#8B5CF6" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#total-scholarships-grad)" />
              <rect width="100%" height="100%" fill="url(#total-scholarships-pattern)" />
            </svg>
          </div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Scholarships</p>
                <p className="text-2xl font-bold mt-2">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-1">All opportunities</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center shadow-md">
                <GraduationCap className="h-6 w-6 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm">
          <div className="absolute inset-0 opacity-30">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="funded-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#10B981', stopOpacity: 0.2}} />
                  <stop offset="100%" style={{stopColor: '#059669', stopOpacity: 0.1}} />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#funded-grad)" />
            </svg>
          </div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fully Funded</p>
                <p className="text-2xl font-bold mt-2">{stats.fullyFunded}</p>
                <p className="text-xs text-muted-foreground mt-1">Full coverage</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shadow-md">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm">
          <div className="absolute inset-0 opacity-30">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="published-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#3B82F6', stopOpacity: 0.2}} />
                  <stop offset="100%" style={{stopColor: '#2563EB', stopOpacity: 0.1}} />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#published-grad)" />
            </svg>
          </div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-bold mt-2">{stats.published}</p>
                <p className="text-xs text-muted-foreground mt-1">Live opportunities</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-md">
                <BookOpen className="h-6 w-6 text-blue-600" />
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
                placeholder="Search scholarships..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Input
              placeholder="Filter by country..."
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
            />
            <Input
              placeholder="Filter by level..."
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
            />
            <Select value={fundingFilter} onValueChange={setFundingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Funding type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="fully_funded">Fully funded</SelectItem>
                <SelectItem value="partially_funded">Partially funded</SelectItem>
                <SelectItem value="not_funded">Not funded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Scholarships Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : scholarships.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No scholarships found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Funding</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scholarships.map((scholarship: Scholarship) => (
                    <TableRow key={scholarship.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{scholarship.title}</span>
                          {scholarship.partner && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Users className="h-3 w-3" />
                              {scholarship.partner.name}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{scholarship.country || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{scholarship.institution || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {scholarship.level || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(scholarship.application_deadline)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {scholarship.is_fully_funded ? (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                            Fully Funded
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Partial</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {scholarship.is_published ? (
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleView(scholarship)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {scholarship.application_link && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(scholarship.application_link!, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteClick(scholarship)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.total > pagination.per_page && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {pagination.from} to {pagination.to} of {pagination.total} scholarships
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

      {/* Modals */}
      <AddScholarshipModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <ScholarshipViewEditModal
        scholarship={selectedScholarship}
        isOpen={isViewEditModalOpen}
        mode={modalMode}
        onClose={() => {
          setIsViewEditModalOpen(false);
          setSelectedScholarship(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scholarship?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{scholarshipToDelete?.title}"? This action cannot be undone.
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
