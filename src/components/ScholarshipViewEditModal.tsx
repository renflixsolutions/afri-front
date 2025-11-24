/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Scholarship, UpdateScholarshipRequest } from '@/types/scholarships';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import {
  MapPin,
  Building,
  GraduationCap,
  Calendar,
  ExternalLink,
  Save,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';
import ScholarshipService from '@/services/api/ScholarshipService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ScholarshipViewEditModalProps {
  scholarship: Scholarship | null;
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'edit';
}

export default function ScholarshipViewEditModal({ scholarship, isOpen, onClose, mode: initialMode }: ScholarshipViewEditModalProps) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [applicationDeadline, setApplicationDeadline] = useState<Date | null>(null);
  const [formData, setFormData] = useState<UpdateScholarshipRequest>({});
  const [descFullscreen, setDescFullscreen] = useState(false);
  const [reqFullscreen, setReqFullscreen] = useState(false);
  const [benefitsFullscreen, setBenefitsFullscreen] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  useEffect(() => {
    if (scholarship) {
      const deadlineDate = scholarship.application_deadline ? new Date(scholarship.application_deadline) : null;
      setApplicationDeadline(deadlineDate);
      setFormData({
        title: scholarship.title,
        country: scholarship.country || '',
        institution: scholarship.institution || '',
        level: scholarship.level || '',
        field_of_study: scholarship.field_of_study || '',
        description: scholarship.description || '',
        requirements: scholarship.requirements || '',
        benefits: scholarship.benefits || '',
        application_deadline: scholarship.application_deadline || '',
        is_fully_funded: scholarship.is_fully_funded,
        is_published: scholarship.is_published,
        application_link: scholarship.application_link || '',
        funding_type: scholarship.funding_type || (scholarship.is_fully_funded ? 'fully_funded' : 'partially_funded'),
      });
    } else {
      setApplicationDeadline(null);
      setFormData({});
    }
    setMode(initialMode);
    setErrors({});
  }, [scholarship, initialMode]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScholarshipRequest }) =>
      ScholarshipService.updateScholarship(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scholarships'] });
      toast.success('Scholarship updated successfully');
      setMode('view');
    },
    onError: (error: unknown) => {
      const message = (typeof error === 'object' && error && (error as any).response?.data?.message) || 'Failed to update scholarship';
      toast.error(message);
    }
  });

  const validate = (): boolean => {
    if (mode !== 'edit') return true;
    const e: Partial<Record<string, string>> = {};
    if (!formData.title?.trim()) e.title = 'Title is required';
    if (!formData.description?.trim()) e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!scholarship) return;
    if (!validate()) {
      toast.error('Please fill required fields');
      return;
    }
    setIsLoading(true);
    try {
      await updateMutation.mutateAsync({ id: scholarship.id, data: formData });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (scholarship) {
      setFormData({
        title: scholarship.title,
        country: scholarship.country || '',
        institution: scholarship.institution || '',
        level: scholarship.level || '',
        field_of_study: scholarship.field_of_study || '',
        description: scholarship.description || '',
        requirements: scholarship.requirements || '',
        benefits: scholarship.benefits || '',
        application_deadline: scholarship.application_deadline || '',
        is_fully_funded: scholarship.is_fully_funded,
        is_published: scholarship.is_published,
        application_link: scholarship.application_link || '',
      });
      setApplicationDeadline(scholarship.application_deadline ? new Date(scholarship.application_deadline) : null);
    }
    setMode('view');
    setErrors({});
  };

  if (!scholarship) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{scholarship.title}</DialogTitle>
              <DialogDescription>
                {mode === 'view' ? 'View scholarship details' : 'Edit scholarship details'}
              </DialogDescription>
            </div>
            {mode === 'view' && (
              <Button onClick={() => setMode('edit')} variant="outline">
                Edit Scholarship
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Meta & Fields */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div className="space-y-3">
              {/* Country & Institution */}
              <div className="space-y-1">
                <Label className="text-xs">Country</Label>
                {mode === 'edit' ? (
                  <Input
                    value={formData.country || ''}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Country"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{scholarship.country || 'N/A'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Institution</Label>
                {mode === 'edit' ? (
                  <Input
                    value={formData.institution || ''}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="Institution"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{scholarship.institution || 'N/A'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Education Level</Label>
                {mode === 'edit' ? (
                  <Input
                    value={formData.level || ''}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    placeholder="Level"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline" className="text-xs">{scholarship.level || 'N/A'}</Badge>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Field of Study</Label>
                {mode === 'edit' ? (
                  <Input
                    value={formData.field_of_study || ''}
                    onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
                    placeholder="Field of study"
                  />
                ) : (
                  <div className="text-sm">{scholarship.field_of_study || 'N/A'}</div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {/* Application Deadline */}
              <div className="space-y-1">
                <Label className="text-xs">Application Deadline</Label>
                {mode === 'edit' ? (
                  <div className="space-y-2">
                    <DatePicker
                      selected={applicationDeadline}
                      onChange={(date: Date | null) => {
                        setApplicationDeadline(date);
                        setFormData({ ...formData, application_deadline: date ? date.toISOString().split('T')[0] : '' });
                      }}
                      placeholderText="Select a deadline"
                      dateFormat="yyyy-MM-dd"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(scholarship.application_deadline)}</span>
                  </div>
                )}
              </div>

              {/* Application Link */}
              <div className="space-y-1">
                <Label className="text-xs">Application Link</Label>
                {mode === 'edit' ? (
                  <Input
                    type="url"
                    value={formData.application_link || ''}
                    onChange={(e) => setFormData({ ...formData, application_link: e.target.value })}
                    placeholder="https://example.com/apply"
                  />
                ) : (
                  scholarship.application_link ? (
                    <Button variant="outline" onClick={() => window.open(scholarship.application_link!, '_blank')} className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Application Link
                    </Button>
                  ) : (
                    <div className="text-sm text-muted-foreground">N/A</div>
                  )
                )}
              </div>

              {/* Funding Type */}
              <div className="space-y-1">
                <Label className="text-xs">Funding Type</Label>
                {mode === 'edit' ? (
                  <Select
                    value={formData.funding_type || undefined}
                    onValueChange={(val: 'fully_funded' | 'partially_funded' | 'not_funded') => {
                      setFormData({
                        ...formData,
                        funding_type: val,
                        is_fully_funded: val === 'fully_funded',
                      });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select funding type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fully_funded">Fully funded</SelectItem>
                      <SelectItem value="partially_funded">Partially funded</SelectItem>
                      <SelectItem value="not_funded">Not funded</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm">
                    {scholarship.funding_type ? (
                      <Badge variant="outline" className="text-xs">
                        {scholarship.funding_type.replace('_', ' ')}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-3 gap-2 p-2 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_fully_funded" className="text-xs">Fully Funded</Label>
                  <Switch
                    id="is_fully_funded"
                    checked={formData.is_fully_funded || false}
                    disabled={mode !== 'edit'}
                    onCheckedChange={(c) =>
                      setFormData({
                        ...formData,
                        is_fully_funded: c,
                        funding_type: c ? 'fully_funded' : (formData.funding_type === 'fully_funded' ? 'partially_funded' : formData.funding_type),
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_published" className="text-xs">Published</Label>
                  <Switch id="is_published" checked={formData.is_published || false} disabled={mode !== 'edit'} onCheckedChange={(c) => setFormData({ ...formData, is_published: c })} />
                </div>
              </div>
            </div>
          </div>

          {/* Rich Text Sections */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-4">
              <div className="space-y-2">
                <div className={cn('rich-editor', descFullscreen && 'fullscreen', errors.description && 'border-red-500')}>
                  {mode === 'edit' && (
                    <div className="rich-editor__topbar flex items-center justify-between">
                      <span className="rich-editor__title">Description</span>
                      <Button variant="outline" size="sm" onClick={() => setDescFullscreen(v => !v)}>
                        {descFullscreen ? (<><Minimize2 className="h-4 w-4 mr-2" /> Exit fullscreen</>) : (<><Maximize2 className="h-4 w-4 mr-2" /> Fullscreen</>)}
                      </Button>
                    </div>
                  )}
                  {mode === 'edit' ? (
                    <CKEditor
                      editor={ClassicEditor as any}
                      data={formData.description || ''}
                      onChange={(_event: unknown, editor: { getData: () => string }) => {
                        const data = editor.getData();
                        setFormData({ ...formData, description: data });
                      }}
                      config={{ toolbar: ['heading','|','bold','italic','link','bulletedList','numberedList','|','undo','redo'] }}
                    />
                  ) : (
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: scholarship.description || '' }} />
                  )}
                  {mode === 'edit' && <div className="rich-editor__hint">Pro tip: Use fullscreen for distraction-free writing.</div>}
                </div>
                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
              </div>
            </TabsContent>

            <TabsContent value="requirements" className="mt-4">
              <div className="space-y-2">
                <div className={cn('rich-editor', reqFullscreen && 'fullscreen')}>
                  {mode === 'edit' && (
                    <div className="rich-editor__topbar flex items-center justify-between">
                      <span className="rich-editor__title">Requirements</span>
                      <Button variant="outline" size="sm" onClick={() => setReqFullscreen(v => !v)}>
                        {reqFullscreen ? (<><Minimize2 className="h-4 w-4 mr-2" /> Exit fullscreen</>) : (<><Maximize2 className="h-4 w-4 mr-2" /> Fullscreen</>)}
                      </Button>
                    </div>
                  )}
                  {mode === 'edit' ? (
                    <CKEditor
                      editor={ClassicEditor as any}
                      data={formData.requirements || ''}
                      onChange={(_event: unknown, editor: { getData: () => string }) => {
                        const data = editor.getData();
                        setFormData({ ...formData, requirements: data });
                      }}
                      config={{ toolbar: ['heading','|','bold','italic','link','bulletedList','numberedList','|','undo','redo'] }}
                    />
                  ) : (
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: scholarship.requirements || '' }} />
                  )}
                  {mode === 'edit' && <div className="rich-editor__hint">Pro tip: Use fullscreen for distraction-free writing.</div>}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="benefits" className="mt-4">
              <div className="space-y-2">
                <div className={cn('rich-editor', benefitsFullscreen && 'fullscreen')}>
                  {mode === 'edit' && (
                    <div className="rich-editor__topbar flex items-center justify-between">
                      <span className="rich-editor__title">Benefits</span>
                      <Button variant="outline" size="sm" onClick={() => setBenefitsFullscreen(v => !v)}>
                        {benefitsFullscreen ? (<><Minimize2 className="h-4 w-4 mr-2" /> Exit fullscreen</>) : (<><Maximize2 className="h-4 w-4 mr-2" /> Fullscreen</>)}
                      </Button>
                    </div>
                  )}
                  {mode === 'edit' ? (
                    <CKEditor
                      editor={ClassicEditor as any}
                      data={formData.benefits || ''}
                      onChange={(_event: unknown, editor: { getData: () => string }) => {
                        const data = editor.getData();
                        setFormData({ ...formData, benefits: data });
                      }}
                      config={{ toolbar: ['heading','|','bold','italic','link','bulletedList','numberedList','|','undo','redo'] }}
                    />
                  ) : (
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: scholarship.benefits || '' }} />
                  )}
                  {mode === 'edit' && <div className="rich-editor__hint">Pro tip: Use fullscreen for distraction-free writing.</div>}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          {mode === 'edit' ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
