// filepath: c:\Users\omond\WebstormProjects\afri-front\src\pages\CourseTimetables.tsx
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { CalendarDays, Edit, MoreHorizontal, Plus, Trash2, CheckCircle2, Settings2, Layers, Target, Loader2 } from 'lucide-react';
import CourseTimetableService from '@/services/api/CourseTimetableService';
import { CourseTimetable } from '@/types/course-timetables';
import AddCourseTimetableModal from '@/components/AddCourseTimetableModal';
import EditCourseTimetableModal from '@/components/EditCourseTimetableModal';
import ManageLevelConfigsModal from '@/components/ManageLevelConfigsModal';
import ManageTracksModal from '@/components/ManageTracksModal';
import GenerateOfferingsModal from '@/components/GenerateOfferingsModal';
import type { AxiosError } from 'axios';

export default function CourseTimetables() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState<CourseTimetable | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLevelConfigOpen, setIsLevelConfigOpen] = useState(false);
  const [isTracksOpen, setIsTracksOpen] = useState(false);
  const [isOfferingsOpen, setIsOfferingsOpen] = useState(false);
  const [toDelete, setToDelete] = useState<CourseTimetable | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['course-timetables'],
    queryFn: async () => CourseTimetableService.getTimetables(),
  });

  const timetables = data?.data ?? [];

  const handleDeleteConfirm = async () => {
    if (!toDelete) return;

    setIsDeleting(true);
    try {
      await CourseTimetableService.deleteTimetable(toDelete.id);
      toast.success('Timetable deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['course-timetables'] });
      setIsDeleteOpen(false);
      setToDelete(null);
    } catch (err) {
      const error = err as AxiosError;
      toast.error('Failed to delete timetable');
      console.error('Delete timetable error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = (timetable: CourseTimetable) => {
    setToDelete(timetable);
    setIsDeleteOpen(true);
  };

  const handleEdit = (timetable: CourseTimetable) => {
    setSelectedTimetable(timetable);
    setIsEditOpen(true);
  };

  const handleManageLevels = (timetable: CourseTimetable) => {
    setSelectedTimetable(timetable);
    setIsLevelConfigOpen(true);
  };

  const handleManageTracks = (timetable: CourseTimetable) => {
    setSelectedTimetable(timetable);
    setIsTracksOpen(true);
  };

  const handleGenerateOfferings = (timetable: CourseTimetable) => {
    setSelectedTimetable(timetable);
    setIsOfferingsOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Course Timetables</h1>
          <p className="text-muted-foreground">Manage language course schedules and sessions</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Timetable
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Timetables</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : timetables.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Timetables Found</h3>
              <p className="text-muted-foreground mb-4">Create your first course timetable to get started</p>
              <Button onClick={() => setIsAddOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Timetable
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Registration Period</TableHead>
                  <TableHead>Classes Start</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Configurations</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timetables.map((timetable) => (
                  <TableRow key={timetable.id}>
                    <TableCell className="font-medium">{timetable.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(timetable.registration_start)}</div>
                        <div className="text-muted-foreground">to {formatDate(timetable.registration_end)}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(timetable.classes_start)}</TableCell>
                    <TableCell>
                      {timetable.is_active ? (
                        <Badge className="bg-green-500">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          {timetable.level_configs?.length || 0} Levels
                        </Badge>
                        <Badge variant="outline">
                          {timetable.tracks?.length || 0} Tracks
                        </Badge>
                        <Badge variant="outline">
                          {timetable.offerings?.length || 0} Offerings
                        </Badge>
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
                          <DropdownMenuItem onClick={() => handleEdit(timetable)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleManageLevels(timetable)}>
                            <Layers className="mr-2 h-4 w-4" />
                            Manage Levels
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleManageTracks(timetable)}>
                            <Settings2 className="mr-2 h-4 w-4" />
                            Manage Tracks
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleGenerateOfferings(timetable)}>
                            <Target className="mr-2 h-4 w-4" />
                            Generate Offerings
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(timetable)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Timetable Modal */}
      <AddCourseTimetableModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
      />

      {/* Edit Timetable Modal */}
      {selectedTimetable && (
        <EditCourseTimetableModal
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          timetable={selectedTimetable}
        />
      )}

      {/* Manage Level Configs Modal */}
      {selectedTimetable && (
        <ManageLevelConfigsModal
          open={isLevelConfigOpen}
          onOpenChange={setIsLevelConfigOpen}
          timetable={selectedTimetable}
        />
      )}

      {/* Manage Tracks Modal */}
      {selectedTimetable && (
        <ManageTracksModal
          open={isTracksOpen}
          onOpenChange={setIsTracksOpen}
          timetable={selectedTimetable}
        />
      )}

      {/* Generate Offerings Modal */}
      {selectedTimetable && (
        <GenerateOfferingsModal
          open={isOfferingsOpen}
          onOpenChange={setIsOfferingsOpen}
          timetable={selectedTimetable}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Timetable</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{toDelete?.name}"? This will also delete all associated level configs, tracks, and course offerings. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

