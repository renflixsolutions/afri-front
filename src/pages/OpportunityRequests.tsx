// filepath: c:\Users\omond\WebstormProjects\afri-front\src\pages\OpportunityRequests.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Eye,
  FileText,
  User,
  Calendar,
  Clock
} from 'lucide-react';
import OpportunityRequestService from '@/services/api/OpportunityRequestService';
import { OpportunityRequest } from '@/types/opportunity-requests';
import { OpportunityRequestViewModal } from '@/components/OpportunityRequestViewModal';

export default function OpportunityRequests() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<OpportunityRequest | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Fetch opportunity requests
  const { data, isLoading } = useQuery({
    queryKey: ['opportunity-requests', currentPage, searchQuery],
    queryFn: () => OpportunityRequestService.getOpportunityRequests({
      page: currentPage,
      search: searchQuery || undefined,
    }),
  });

  const requests = data?.data?.data ?? [];
  const pagination = data?.data;

  const handleView = (request: OpportunityRequest) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500';
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Stats
  const stats = {
    total: pagination?.total || 0,
    pending: requests.filter((r: OpportunityRequest) => r.status === 'pending').length,
    approved: requests.filter((r: OpportunityRequest) => r.status === 'approved').length,
    rejected: requests.filter((r: OpportunityRequest) => r.status === 'rejected').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Opportunity Requests</h1>
          <p className="text-muted-foreground mt-2">Manage opportunity requests from users</p>
        </div>
      </div>

      {/* Stats Cards */}
      {/*<div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">*/}
      {/*  <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-none bg-white/70 backdrop-blur-sm">*/}
      {/*    <CardContent className="p-4 relative z-10">*/}
      {/*      <div className="flex items-center justify-between">*/}
      {/*        <div>*/}
      {/*          <p className="text-xs font-medium text-muted-foreground">Total Requests</p>*/}
      {/*          <p className="text-xl font-bold mt-1">{stats.total}</p>*/}
      {/*        </div>*/}
      {/*        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-md">*/}
      {/*          <FileText className="h-5 w-5 text-blue-600" />*/}
      {/*        </div>*/}
      {/*      </div>*/}
      {/*    </CardContent>*/}
      {/*  </Card>*/}

      {/*  <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-none bg-white/70 backdrop-blur-sm">*/}
      {/*    <CardContent className="p-4 relative z-10">*/}
      {/*      <div className="flex items-center justify-between">*/}
      {/*        <div>*/}
      {/*          <p className="text-xs font-medium text-muted-foreground">Pending</p>*/}
      {/*          <p className="text-xl font-bold mt-1">{stats.pending}</p>*/}
      {/*        </div>*/}
      {/*        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow-md">*/}
      {/*          <Clock className="h-5 w-5 text-yellow-600" />*/}
      {/*        </div>*/}
      {/*      </div>*/}
      {/*    </CardContent>*/}
      {/*  </Card>*/}

      {/*  <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-none bg-white/70 backdrop-blur-sm">*/}
      {/*    <CardContent className="p-4 relative z-10">*/}
      {/*      <div className="flex items-center justify-between">*/}
      {/*        <div>*/}
      {/*          <p className="text-xs font-medium text-muted-foreground">Approved</p>*/}
      {/*          <p className="text-xl font-bold mt-1">{stats.approved}</p>*/}
      {/*        </div>*/}
      {/*        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-md">*/}
      {/*          <User className="h-5 w-5 text-green-600" />*/}
      {/*        </div>*/}
      {/*      </div>*/}
      {/*    </CardContent>*/}
      {/*  </Card>*/}

      {/*  <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-none bg-white/70 backdrop-blur-sm">*/}
      {/*    <CardContent className="p-4 relative z-10">*/}
      {/*      <div className="flex items-center justify-between">*/}
      {/*        <div>*/}
      {/*          <p className="text-xs font-medium text-muted-foreground">Rejected</p>*/}
      {/*          <p className="text-xl font-bold mt-1">{stats.rejected}</p>*/}
      {/*        </div>*/}
      {/*        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-md">*/}
      {/*          <FileText className="h-5 w-5 text-red-600" />*/}
      {/*        </div>*/}
      {/*      </div>*/}
      {/*    </CardContent>*/}
      {/*  </Card>*/}
      {/*</div>*/}

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requester</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No opportunity requests found
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.user.full_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(request.status)} text-white`}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(request.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(request)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.last_page}
          >
            Next
          </Button>
        </div>
      )}

      {/* View Modal */}
      {selectedRequest && (
        <OpportunityRequestViewModal
          request={selectedRequest}
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedRequest(null);
          }}
        />
      )}
    </div>
  );
}
