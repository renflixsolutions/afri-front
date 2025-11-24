import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { EyeIcon, MoreHorizontal, Plus, Trash2, GraduationCap, Layers, Search, Calendar, Tag } from 'lucide-react';
import LanguageCourseService from '@/services/api/LanguageCourseService';
import { LanguageCourse } from '@/types/language-courses';
import AddLanguageCourseModal from '@/components/AddLanguageCourseModal';
import LanguageCourseViewEditModal from '@/components/LanguageCourseViewEditModal';
import type { AxiosError } from 'axios';

export default function LanguageCourses() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selected, setSelected] = useState<LanguageCourse | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [toDelete, setToDelete] = useState<LanguageCourse | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['language-courses', currentPage, searchQuery],
    queryFn: async () => LanguageCourseService.getCourses(currentPage, searchQuery),
  });

  useEffect(() => {
    if (error) {
      console.error('Language courses error:', error);
      toast.error('Failed to load language courses');
    }
  }, [error]);

  const courses = data?.data?.data ?? [];
  const pagination = data?.data;

  const createMutation = useMutation({
    mutationFn: (payload: Partial<LanguageCourse>) => LanguageCourseService.createCourse(payload),
    onSuccess: () => {
      toast.success('Course created successfully');
      queryClient.invalidateQueries({ queryKey: ['language-courses'] });
      setIsAddOpen(false);
    },
    onError: (err: AxiosError<{ errors?: Record<string, string[]> }>) => {
      if (err.response?.status !== 422) toast.error('Failed to create course');
      console.error('Create course error:', err);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<LanguageCourse> }) => LanguageCourseService.updateCourse(id, payload),
    onSuccess: () => {
      toast.success('Course updated successfully');
      queryClient.invalidateQueries({ queryKey: ['language-courses'] });
    },
    onError: (err: AxiosError<{ errors?: Record<string, string[]> }>) => {
      if (err.response?.status !== 422) toast.error('Failed to update course');
      console.error('Update course error:', err);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => LanguageCourseService.deleteCourse(id),
    onSuccess: () => {
      toast.success('Course deleted');
      queryClient.invalidateQueries({ queryKey: ['language-courses'] });
      setIsDeleteOpen(false);
      setToDelete(null);
    },
    onError: (err: AxiosError) => {
      toast.error('Failed to delete course');
      console.error('Delete course error:', err);
    }
  });

  const handleCreate = async (payload: Partial<LanguageCourse>) => {
    await createMutation.mutateAsync(payload);
  };

  const handleSave = async (payload: Partial<LanguageCourse>) => {
    if (selected) {
      await updateMutation.mutateAsync({ id: selected.id, payload });
    }
  };

  const handleView = (course: LanguageCourse) => {
    setSelected(course);
    setIsViewOpen(true);
  };

  const formatPrice = (n: number | undefined) => typeof n === 'number' ? n.toLocaleString() : '-';

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Language Courses</h1>
          <p className="text-muted-foreground mt-2">Manage language courses, pricing and bundles</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Course</Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by language, title or level..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No courses found</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Title</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Bundles</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((c: LanguageCourse) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{c.title}</span>
                          <span className="text-xs text-muted-foreground">{c.description}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm"><GraduationCap className="h-4 w-4 text-muted-foreground" />{c.language}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs"><Layers className="h-3 w-3 mr-1" />{c.level}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" />{c.duration_weeks} weeks</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm"><Tag className="h-4 w-4 text-muted-foreground" />{formatPrice(c.price)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{c.bundles?.length ?? 0} bundle(s)</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(c)}><EyeIcon className="h-4 w-4 mr-2" />View / Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => { setToDelete(c); setIsDeleteOpen(true); }}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
              <div className="text-sm text-muted-foreground">Page {pagination.current_page} of {Math.ceil(pagination.total / pagination.per_page)}</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => handlePageChange(currentPage - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={courses.length < pagination.per_page} onClick={() => handlePageChange(currentPage + 1)}>Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <AddLanguageCourseModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSave={handleCreate} />
      <LanguageCourseViewEditModal course={selected} isOpen={isViewOpen} onClose={() => { setIsViewOpen(false); setSelected(null); }} onSave={handleSave} />

      {/* Delete dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete course?</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete "{toDelete?.title}"? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => toDelete && deleteMutation.mutate(toDelete.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
