// filepath: c:\Users\omond\WebstormProjects\afri-front\src\components\EditCourseTimetableModal.tsx
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';
import CourseTimetableService from '@/services/api/CourseTimetableService';
import { CourseTimetable, CreateTimetablePayload } from '@/types/course-timetables';
import type { AxiosError } from 'axios';

interface EditCourseTimetableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timetable: CourseTimetable;
}

export default function EditCourseTimetableModal({ open, onOpenChange, timetable }: EditCourseTimetableModalProps) {
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<CreateTimetablePayload>({
    name: timetable.name,
    registration_start: timetable.registration_start.split('T')[0],
    registration_end: timetable.registration_end.split('T')[0],
    classes_start: timetable.classes_start.split('T')[0],
    is_active: timetable.is_active,
  });

  useEffect(() => {
    setFormData({
      name: timetable.name,
      registration_start: timetable.registration_start.split('T')[0],
      registration_end: timetable.registration_end.split('T')[0],
      classes_start: timetable.classes_start.split('T')[0],
      is_active: timetable.is_active,
    });
  }, [timetable]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      await CourseTimetableService.updateTimetable(timetable.id, formData);
      toast.success('Timetable updated successfully');
      queryClient.invalidateQueries({ queryKey: ['course-timetables'] });
      onOpenChange(false);
    } catch (err) {
      const error = err as AxiosError<{ errors?: Record<string, string[]> }>;
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error('Failed to update timetable');
      }
      console.error('Update timetable error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof CreateTimetablePayload, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Course Timetable</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Timetable Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Spring 2026 Session"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="registration_start">Registration Start *</Label>
              <Input
                id="registration_start"
                type="date"
                value={formData.registration_start}
                onChange={(e) => handleChange('registration_start', e.target.value)}
                className={errors.registration_start ? 'border-red-500' : ''}
              />
              {errors.registration_start && (
                <p className="text-sm text-red-500">{errors.registration_start[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration_end">Registration End *</Label>
              <Input
                id="registration_end"
                type="date"
                value={formData.registration_end}
                onChange={(e) => handleChange('registration_end', e.target.value)}
                className={errors.registration_end ? 'border-red-500' : ''}
              />
              {errors.registration_end && (
                <p className="text-sm text-red-500">{errors.registration_end[0]}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="classes_start">Classes Start Date *</Label>
            <Input
              id="classes_start"
              type="date"
              value={formData.classes_start}
              onChange={(e) => handleChange('classes_start', e.target.value)}
              className={errors.classes_start ? 'border-red-500' : ''}
            />
            {errors.classes_start && (
              <p className="text-sm text-red-500">{errors.classes_start[0]}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange('is_active', checked)}
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Set as Active (will deactivate other timetables)
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Timetable
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

