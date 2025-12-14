// filepath: c:\Users\omond\WebstormProjects\afri-front\src\components\ManageLevelConfigsModal.tsx
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';
import CourseTimetableService from '@/services/api/CourseTimetableService';
import { CourseTimetable, CourseLevelConfig } from '@/types/course-timetables';
import type { AxiosError } from 'axios';

interface ManageLevelConfigsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timetable: CourseTimetable;
}

const defaultLevels: CourseLevelConfig[] = [
  { level: 'A1', duration_weeks: 8, total_sessions: 24, total_hours: 48 },
  { level: 'A2', duration_weeks: 8, total_sessions: 24, total_hours: 48 },
  { level: 'B1', duration_weeks: 10, total_sessions: 30, total_hours: 60 },
  { level: 'B2', duration_weeks: 10, total_sessions: 30, total_hours: 60 },
  { level: 'C1', duration_weeks: 12, total_sessions: 36, total_hours: 72 },
  { level: 'C2', duration_weeks: 12, total_sessions: 36, total_hours: 72 },
];

export default function ManageLevelConfigsModal({ open, onOpenChange, timetable }: ManageLevelConfigsModalProps) {
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  const [levels, setLevels] = useState<CourseLevelConfig[]>(
    timetable.level_configs && timetable.level_configs.length > 0
      ? timetable.level_configs
      : defaultLevels
  );

  useEffect(() => {
    setLevels(
      timetable.level_configs && timetable.level_configs.length > 0
        ? timetable.level_configs
        : defaultLevels
    );
  }, [timetable]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      await CourseTimetableService.updateLevelConfigs(timetable.id, { levels });
      toast.success('Level configurations updated successfully');
      queryClient.invalidateQueries({ queryKey: ['course-timetables'] });
      onOpenChange(false);
    } catch (err) {
      const error = err as AxiosError<{ errors?: Record<string, string[]> }>;
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error('Failed to update level configurations');
      }
      console.error('Update level configs error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLevelChange = (index: number, field: keyof CourseLevelConfig, value: string | number) => {
    setLevels(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Level Configurations - {timetable.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {levels.map((level, index) => (
              <div key={level.level} className="border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-lg">Level {level.level}</h4>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`duration_${index}`}>Duration (weeks) *</Label>
                    <Input
                      id={`duration_${index}`}
                      type="number"
                      min="1"
                      value={level.duration_weeks}
                      onChange={(e) => handleLevelChange(index, 'duration_weeks', parseInt(e.target.value))}
                      className={errors[`levels.${index}.duration_weeks`] ? 'border-red-500' : ''}
                    />
                    {errors[`levels.${index}.duration_weeks`] && (
                      <p className="text-sm text-red-500">{errors[`levels.${index}.duration_weeks`][0]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`sessions_${index}`}>Total Sessions *</Label>
                    <Input
                      id={`sessions_${index}`}
                      type="number"
                      min="1"
                      value={level.total_sessions}
                      onChange={(e) => handleLevelChange(index, 'total_sessions', parseInt(e.target.value))}
                      className={errors[`levels.${index}.total_sessions`] ? 'border-red-500' : ''}
                    />
                    {errors[`levels.${index}.total_sessions`] && (
                      <p className="text-sm text-red-500">{errors[`levels.${index}.total_sessions`][0]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`hours_${index}`}>Total Hours *</Label>
                    <Input
                      id={`hours_${index}`}
                      type="number"
                      min="1"
                      value={level.total_hours}
                      onChange={(e) => handleLevelChange(index, 'total_hours', parseInt(e.target.value))}
                      className={errors[`levels.${index}.total_hours`] ? 'border-red-500' : ''}
                    />
                    {errors[`levels.${index}.total_hours`] && (
                      <p className="text-sm text-red-500">{errors[`levels.${index}.total_hours`][0]}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Configurations
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

