import { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  MoreHorizontal,
  Trash2,
  Edit,
  Globe,
  Mail,
  Phone,
  MapPin,
  Building2,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";
import PartnerService from "@/services/api/PartnerService";
import { Partner } from "@/types/partners";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AddEditPartnerModal } from "@/components/AddEditPartnerModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Partners = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: partnersData, isLoading, error } = useQuery({
    queryKey: ['partners', currentPage],
    queryFn: async () => {
      console.log('Fetching partners from API...');
      const result = await PartnerService.getPartners(currentPage);
      console.log('Partners API response:', result);
      return result;
    },
  });

  useEffect(() => {
    if (error) {
      console.error('Partners error details:', error);
      toast.error("Failed to load partners");
    }
  }, [error]);

  const partners = partnersData?.data.data || [];
  const pagination = partnersData?.data;

  // Mutation for deleting a partner
  const deleteMutation = useMutation({
    mutationFn: (partnerId: string) => PartnerService.deletePartner(partnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast.success("Partner deleted successfully");
      setIsDeleteDialogOpen(false);
      setPartnerToDelete(null);
    },
    onError: (error) => {
      toast.error("Failed to delete partner");
      console.error('Delete error:', error);
    }
  });

  // Mutation for creating a partner
  const createMutation = useMutation({
    mutationFn: (data: FormData) => PartnerService.createPartner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      setIsAddModalOpen(false);
    },
    onError: (error) => {
      console.error('Create error:', error);
      throw error;
    }
  });

  // Mutation for updating a partner
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      PartnerService.updatePartner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      setIsEditModalOpen(false);
      setSelectedPartner(null);
    },
    onError: (error) => {
      console.error('Update error:', error);
      throw error;
    }
  });

  // Apply filters
  const filteredPartners = partners.filter((partner: Partner) => {
    const matchesSearch = partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (partner.type && partner.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (partner.country && partner.country.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = filterStatus === "all" ||
                         (filterStatus === "active" && partner.is_active) ||
                         (filterStatus === "inactive" && !partner.is_active);

    return matchesSearch && matchesStatus;
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditPartner = (partner: Partner, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPartner(partner);
    setIsEditModalOpen(true);
  };

  const handleDeletePartner = (partner: Partner, e: React.MouseEvent) => {
    e.stopPropagation();
    setPartnerToDelete(partner);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (partnerToDelete) {
      deleteMutation.mutate(partnerToDelete.id);
    }
  };

  const handleCreatePartner = async (partnerData: FormData) => {
    await createMutation.mutateAsync(partnerData);
  };

  const handleUpdatePartner = async (partnerData: FormData) => {
    if (selectedPartner) {
      await updateMutation.mutateAsync({
        id: selectedPartner.id,
        data: partnerData
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Partners</h1>
            <p className="text-muted-foreground mt-2">
              Manage your partner organizations and institutions
            </p>
          </div>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Add Partner
          </Button>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters Skeleton */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative md:col-span-2">
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Partners Table Skeleton */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Partners</h1>
            <p className="text-muted-foreground mt-2">
              Manage your partner organizations and institutions
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Partner
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination?.total || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Partners</CardTitle>
              <Building2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {partners.filter((p: Partner) => p.is_active).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Partners</CardTitle>
              <Building2 className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {partners.filter((p: Partner) => !p.is_active).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Partner Types</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(partners.filter((p: Partner) => p.type).map((p: Partner) => p.type)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search partners by name, type, or country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filterStatus !== "all" && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Partners Table */}
      <Card>
        <CardContent className="pt-6">
          {filteredPartners.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No partners found</h3>
              <p className="text-muted-foreground">
                {searchQuery || filterStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first partner"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Logo</TableHead>
                    <TableHead className="w-[250px]">Partner Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-10 w-10 rounded-lg" />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-3 w-28" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-16" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-8 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredPartners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No partners found</h3>
                        <p className="text-muted-foreground">
                          {searchQuery || filterStatus !== "all"
                            ? "Try adjusting your search or filters"
                            : "Get started by adding your first partner"}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPartners.map((partner: Partner) => (
                      <TableRow
                        key={partner.id}
                        className="hover:bg-muted/50"
                      >
                        <TableCell>
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          {partner.logo ? (
                            <img
                              src={partner.logo}
                              alt={partner.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{partner.name}</span>
                          {partner.website && (
                            <a
                              href={partner.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Globe className="h-3 w-3" />
                              Website
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {partner.type ? (
                          <Badge variant="outline" className="text-xs">
                            {partner.type}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {partner.country ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{partner.country}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs">
                          {partner.email && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span>{partner.email}</span>
                            </div>
                          )}
                          {partner.phone && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{partner.phone}</span>
                            </div>
                          )}
                          {!partner.email && !partner.phone && (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={partner.is_active ? "default" : "secondary"}
                          className={partner.is_active ? "bg-green-500" : ""}
                        >
                          {partner.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => handleEditPartner(partner, e)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => handleDeletePartner(partner, e)}
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
                Showing {pagination.from} to {pagination.to} of {pagination.total} partners
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
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
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Partner Modal */}
      <AddEditPartnerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleCreatePartner}
        mode="add"
      />

      {/* Edit Partner Modal */}
      <AddEditPartnerModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPartner(null);
        }}
        onSave={handleUpdatePartner}
        partner={selectedPartner ? {
          id: selectedPartner.id,
          name: selectedPartner.name,
          type: selectedPartner.type || '',
          country: selectedPartner.country || '',
          website: selectedPartner.website || '',
          email: selectedPartner.email || '',
          phone: selectedPartner.phone || '',
          logo: selectedPartner.logo || '',
          description: selectedPartner.description || '',
          is_active: selectedPartner.is_active,
        } : undefined}
        mode="edit"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the partner
              <strong> "{partnerToDelete?.name}"</strong> from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Partners;
