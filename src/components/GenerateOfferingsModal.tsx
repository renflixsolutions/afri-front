// filepath: c:\Users\omond\WebstormProjects\afri-front\src\components\GenerateOfferingsModal.tsx
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/sonner';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CourseTimetableService from '@/services/api/CourseTimetableService';
import { CourseTimetable, GenerateOfferingsPayload } from '@/types/course-timetables';
import type { AxiosError } from 'axios';

interface GenerateOfferingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timetable: CourseTimetable;
}

const availableLanguages = ['French', 'Spanish', 'German', 'English', 'Chinese', 'Arabic'];

export default function GenerateOfferingsModal({ open, onOpenChange, timetable }: GenerateOfferingsModalProps) {
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['French', 'Spanish', 'German', 'English']);
  const [maxStudents, setMaxStudents] = useState<string>('20');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (selectedLanguages.length === 0) {
      toast.error('Please select at least one language');
      return;
    }

    const payload: GenerateOfferingsPayload = {
      languages: selectedLanguages,
    };

    if (maxStudents && parseInt(maxStudents) > 0) {
      payload.max_students_per_offering = parseInt(maxStudents);
    }

    setIsLoading(true);

    try {
      const response = await CourseTimetableService.generateOfferings(timetable.id, payload);
      toast.success(`Successfully generated ${response.data.total_offerings} course offerings`);
      queryClient.invalidateQueries({ queryKey: ['course-timetables'] });
      onOpenChange(false);
    } catch (err) {
      const error = err as AxiosError<{ errors?: Record<string, string[]> }>;
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error('Failed to generate course offerings');
      }
      console.error('Generate offerings error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguage = (language: string) => {
    setSelectedLanguages(prev =>
      prev.includes(language)
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  const levelCount = timetable.level_configs?.length || 6;
  const trackCount = timetable.tracks?.length || 0;
  const estimatedOfferings = selectedLanguages.length * levelCount * trackCount;

  const canGenerate = trackCount > 0 && levelCount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Course Offerings - {timetable.name}</DialogTitle>
        </DialogHeader>

        {!canGenerate && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please configure level configurations and tracks before generating offerings.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>Select Languages *</Label>
            <div className="grid grid-cols-2 gap-3">
              {availableLanguages.map((language) => (
                <div key={language} className="flex items-center space-x-2">
                  <Checkbox
                    id={language}
                    checked={selectedLanguages.includes(language)}
                    onCheckedChange={() => toggleLanguage(language)}
                  />
                  <label
                    htmlFor={language}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {language}
                  </label>
                </div>
              ))}
            </div>
            {errors.languages && (
              <p className="text-sm text-red-500">{errors.languages[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_students">Max Students Per Offering (Optional)</Label>
            <Input
              id="max_students"
              type="number"
              min="1"
              placeholder="Leave empty for unlimited"
              value={maxStudents}
              onChange={(e) => setMaxStudents(e.target.value)}
              className={errors.max_students_per_offering ? 'border-red-500' : ''}
            />
            {errors.max_students_per_offering && (
              <p className="text-sm text-red-500">{errors.max_students_per_offering[0]}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Set the maximum number of students that can enroll in each offering
            </p>
          </div>

          {canGenerate && (
            <Alert>
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-semibold">Estimated Offerings:</p>
                  <p className="text-sm">
                    {selectedLanguages.length} languages × {levelCount} levels × {trackCount} tracks =
                    <span className="font-bold text-primary ml-1">{estimatedOfferings} offerings</span>
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !canGenerate || selectedLanguages.length === 0}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Offerings
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

