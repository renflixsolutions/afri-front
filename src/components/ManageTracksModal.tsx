// filepath: c:\Users\omond\WebstormProjects\afri-front\src\components\ManageTracksModal.tsx
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import CourseTimetableService from '@/services/api/CourseTimetableService';
import { CourseTimetable, CourseTrack, CourseScheduleItem } from '@/types/course-timetables';
import type { AxiosError } from 'axios';

interface ManageTracksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timetable: CourseTimetable;
}

const defaultTracks: CourseTrack[] = [
  {
    name: 'Morning Track',
    schedule: [
      { day: 'Monday', time: '9:00 AM - 11:00 AM', frequency: 'Weekly' },
      { day: 'Wednesday', time: '9:00 AM - 11:00 AM', frequency: 'Weekly' },
      { day: 'Friday', time: '9:00 AM - 11:00 AM', frequency: 'Weekly' },
    ]
  },
  {
    name: 'Evening Track',
    schedule: [
      { day: 'Tuesday', time: '6:00 PM - 8:00 PM', frequency: 'Weekly' },
      { day: 'Thursday', time: '6:00 PM - 8:00 PM', frequency: 'Weekly' },
    ]
  },
  {
    name: 'Weekend Track',
    schedule: [
      { day: 'Saturday', time: '10:00 AM - 2:00 PM', frequency: 'Weekly' },
    ]
  },
];

export default function ManageTracksModal({ open, onOpenChange, timetable }: ManageTracksModalProps) {
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  const [tracks, setTracks] = useState<CourseTrack[]>(
    timetable.tracks && timetable.tracks.length > 0
      ? timetable.tracks
      : defaultTracks
  );

  useEffect(() => {
    setTracks(
      timetable.tracks && timetable.tracks.length > 0
        ? timetable.tracks
        : defaultTracks
    );
  }, [timetable]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      await CourseTimetableService.updateTracks(timetable.id, { tracks });
      toast.success('Tracks updated successfully');
      queryClient.invalidateQueries({ queryKey: ['course-timetables'] });
      onOpenChange(false);
    } catch (err) {
      const error = err as AxiosError<{ errors?: Record<string, string[]> }>;
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error('Failed to update tracks');
      }
      console.error('Update tracks error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackChange = (trackIndex: number, field: 'name', value: string) => {
    setTracks(prev => {
      const updated = [...prev];
      updated[trackIndex] = { ...updated[trackIndex], [field]: value };
      return updated;
    });
  };

  const handleScheduleChange = (trackIndex: number, scheduleIndex: number, field: keyof CourseScheduleItem, value: string) => {
    setTracks(prev => {
      const updated = [...prev];
      const updatedSchedule = [...updated[trackIndex].schedule];
      updatedSchedule[scheduleIndex] = { ...updatedSchedule[scheduleIndex], [field]: value };
      updated[trackIndex] = { ...updated[trackIndex], schedule: updatedSchedule };
      return updated;
    });
  };

  const addTrack = () => {
    setTracks(prev => [...prev, {
      name: '',
      schedule: [{ day: '', time: '', frequency: 'Weekly' }]
    }]);
  };

  const removeTrack = (trackIndex: number) => {
    setTracks(prev => prev.filter((_, i) => i !== trackIndex));
  };

  const addScheduleItem = (trackIndex: number) => {
    setTracks(prev => {
      const updated = [...prev];
      updated[trackIndex] = {
        ...updated[trackIndex],
        schedule: [...updated[trackIndex].schedule, { day: '', time: '', frequency: 'Weekly' }]
      };
      return updated;
    });
  };

  const removeScheduleItem = (trackIndex: number, scheduleIndex: number) => {
    setTracks(prev => {
      const updated = [...prev];
      updated[trackIndex] = {
        ...updated[trackIndex],
        schedule: updated[trackIndex].schedule.filter((_, i) => i !== scheduleIndex)
      };
      return updated;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Course Tracks - {timetable.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            {tracks.map((track, trackIndex) => (
              <div key={trackIndex} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-lg">Track {trackIndex + 1}</h4>
                  {tracks.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTrack(trackIndex)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`track_name_${trackIndex}`}>Track Name *</Label>
                  <Input
                    id={`track_name_${trackIndex}`}
                    placeholder="e.g., Morning Track"
                    value={track.name}
                    onChange={(e) => handleTrackChange(trackIndex, 'name', e.target.value)}
                    className={errors[`tracks.${trackIndex}.name`] ? 'border-red-500' : ''}
                  />
                  {errors[`tracks.${trackIndex}.name`] && (
                    <p className="text-sm text-red-500">{errors[`tracks.${trackIndex}.name`][0]}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Schedule</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addScheduleItem(trackIndex)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Time Slot
                    </Button>
                  </div>

                  {track.schedule.map((scheduleItem, scheduleIndex) => (
                    <div key={scheduleIndex} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-4 space-y-2">
                        <Label htmlFor={`day_${trackIndex}_${scheduleIndex}`}>Day *</Label>
                        <Input
                          id={`day_${trackIndex}_${scheduleIndex}`}
                          placeholder="e.g., Monday"
                          value={scheduleItem.day}
                          onChange={(e) => handleScheduleChange(trackIndex, scheduleIndex, 'day', e.target.value)}
                        />
                      </div>
                      <div className="col-span-4 space-y-2">
                        <Label htmlFor={`time_${trackIndex}_${scheduleIndex}`}>Time *</Label>
                        <Input
                          id={`time_${trackIndex}_${scheduleIndex}`}
                          placeholder="9:00 AM - 11:00 AM"
                          value={scheduleItem.time}
                          onChange={(e) => handleScheduleChange(trackIndex, scheduleIndex, 'time', e.target.value)}
                        />
                      </div>
                      <div className="col-span-3 space-y-2">
                        <Label htmlFor={`frequency_${trackIndex}_${scheduleIndex}`}>Frequency *</Label>
                        <Input
                          id={`frequency_${trackIndex}_${scheduleIndex}`}
                          placeholder="Weekly"
                          value={scheduleItem.frequency}
                          onChange={(e) => handleScheduleChange(trackIndex, scheduleIndex, 'frequency', e.target.value)}
                        />
                      </div>
                      <div className="col-span-1">
                        {track.schedule.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeScheduleItem(trackIndex, scheduleIndex)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" onClick={addTrack} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Track
          </Button>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Tracks
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

