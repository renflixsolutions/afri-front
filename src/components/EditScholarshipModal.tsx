import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import ScholarshipService from '@/services/api/ScholarshipService';
import { Scholarship, UpdateScholarshipRequest } from '@/types/scholarships';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Minimize2 } from 'lucide-react';

interface EditScholarshipModalProps {
  scholarship: Scholarship | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditScholarshipModal({ scholarship, isOpen, onClose }: EditScholarshipModalProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [applicationDeadline, setApplicationDeadline] = useState<Date | null>(null);
  const [formData, setFormData] = useState<UpdateScholarshipRequest>({});
  const [descFullscreen, setDescFullscreen] = useState(false);
  const [reqFullscreen, setReqFullscreen] = useState(false);
  const [benefitsFullscreen, setBenefitsFullscreen] = useState(false);

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
      });
    }
  }, [scholarship]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScholarshipRequest }) =>
      ScholarshipService.updateScholarship(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scholarships'] });
      toast.success('Scholarship updated successfully');
      onClose();
    },
    onError: (error: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((error as any).response?.data?.message || 'Failed to update scholarship');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!scholarship) return;

    setIsLoading(true);
    try {
      await updateMutation.mutateAsync({ id: scholarship.id, data: formData });
    } finally {
      setIsLoading(false);
    }
  };

  if (!scholarship) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Scholarship</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country || ''}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                value={formData.institution || ''}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="level">Education Level</Label>
              <Input
                id="level"
                value={formData.level || ''}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="field_of_study">Field of Study</Label>
              <Input
                id="field_of_study"
                value={formData.field_of_study || ''}
                onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="application_deadline">Application Deadline</Label>
              {/* @ts-ignore */}
              <DatePicker
                id="application_deadline"
                selected={applicationDeadline}
                onChange={(date: Date | null) => {
                  setApplicationDeadline(date);
                  setFormData({ ...formData, application_deadline: date ? date.toISOString().split('T')[0] : '' });
                }}
                dateFormat="yyyy-MM-dd"
                className="w-full p-2 border rounded"
                placeholderText="Select a date"
              />
            </div>

            <div>
              <Label htmlFor="application_link">Application Link</Label>
              <Input
                id="application_link"
                type="url"
                value={formData.application_link || ''}
                onChange={(e) => setFormData({ ...formData, application_link: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Tabs defaultValue="editor" className="w-full">
                <TabsList>
                  <TabsTrigger value="editor">Editor</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="editor">
                  <div className={cn('relative w-full', { 'fullscreen-editor': descFullscreen })}>
                    {/* @ts-ignore */}
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <CKEditor
                      editor={ClassicEditor as any}
                      data={formData.description}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setFormData({ ...formData, description: data });
                      }}
                      config={{
                        toolbar: [
                          'heading', '|',
                          'bold', 'italic', 'link', '|',
                          'bulletedList', 'numberedList', '|',
                          'blockQuote', 'insertTable', '|',
                          'undo', 'redo'
                        ],
                        heading: {
                          options: [
                            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
                          ]
                        },
                        placeholder: 'Enter scholarship description...'
                      }}
                    />
                    {descFullscreen && (
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setDescFullscreen(false)}
                          className="rounded-full"
                        >
                          <Minimize2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="preview">
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: formData.description }} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="col-span-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Tabs defaultValue="editor" className="w-full">
                <TabsList>
                  <TabsTrigger value="editor">Editor</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="editor">
                  <div className={cn('relative w-full', { 'fullscreen-editor': reqFullscreen })}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <CKEditor
                      editor={ClassicEditor as any}
                      data={formData.requirements}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setFormData({ ...formData, requirements: data });
                      }}
                      config={{
                        toolbar: [
                          'heading', '|',
                          'bold', 'italic', 'link', '|',
                          'bulletedList', 'numberedList', '|',
                          'blockQuote', 'insertTable', 'mediaEmbed', '|',
                          'undo', 'redo'
                        ],
                        heading: {
                          options: [
                            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
                          ]
                        },
                        placeholder: 'Enter scholarship requirements...',
                        removePlugins: ['MediaEmbed'],
                        mediaEmbed: {
                          previewsInData: true
                        }
                      }}
                    />
                    {reqFullscreen && (
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setReqFullscreen(false)}
                          className="rounded-full"
                        >
                          <Minimize2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="preview">
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: formData.requirements }} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="col-span-2">
              <Label htmlFor="benefits">Benefits</Label>
              <Tabs defaultValue="editor" className="w-full">
                <TabsList>
                  <TabsTrigger value="editor">Editor</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="editor">
                  <div className={cn('relative w-full', { 'fullscreen-editor': benefitsFullscreen })}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <CKEditor
                      editor={ClassicEditor as any}
                      data={formData.benefits}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setFormData({ ...formData, benefits: data });
                      }}
                      config={{
                        toolbar: [
                          'heading', '|',
                          'bold', 'italic', 'link', '|',
                          'bulletedList', 'numberedList', '|',
                          'blockQuote', 'insertTable', 'mediaEmbed', '|',
                          'undo', 'redo'
                        ],
                        heading: {
                          options: [
                            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
                          ]
                        },
                        placeholder: 'Enter scholarship benefits...',
                        removePlugins: ['MediaEmbed'],
                        mediaEmbed: {
                          previewsInData: true
                        }
                      }}
                    />
                    {benefitsFullscreen && (
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setBenefitsFullscreen(false)}
                          className="rounded-full"
                        >
                          <Minimize2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="preview">
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: formData.benefits }} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_fully_funded"
                checked={formData.is_fully_funded || false}
                onCheckedChange={(checked) => setFormData({ ...formData, is_fully_funded: checked })}
              />
              <Label htmlFor="is_fully_funded" className="cursor-pointer">
                Fully Funded
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_published"
                checked={formData.is_published || false}
                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
              />
              <Label htmlFor="is_published" className="cursor-pointer">
                Published
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Scholarship'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
