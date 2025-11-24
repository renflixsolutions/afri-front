/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import ScholarshipService from '@/services/api/ScholarshipService';
import { CreateScholarshipRequest } from '@/types/scholarships';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import PartnerService from '@/services/api/PartnerService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddScholarshipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddScholarshipModal({ isOpen, onClose }: AddScholarshipModalProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [applicationDeadline, setApplicationDeadline] = useState<Date | null>(null);
  const [descFullscreen, setDescFullscreen] = useState(false);
  const [reqFullscreen, setReqFullscreen] = useState(false);
  const [benefitsFullscreen, setBenefitsFullscreen] = useState(false);
  const [institutionOpen, setInstitutionOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [levelOpen, setLevelOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [fieldOpen, setFieldOpen] = useState(false);
  const [selectedField, setSelectedField] = useState('');
  const [formData, setFormData] = useState<CreateScholarshipRequest>({
    title: '',
    country: '',
    institution: '',
    level: '',
    field_of_study: '',
    description: '',
    requirements: '',
    benefits: '',
    application_deadline: '',
    is_fully_funded: false,
    is_published: false,
    application_link: '',
    funding_type: 'partially_funded',
  });

  const countries = [
    "Afghanistan",
    "Albania",
    "Algeria",
    "Argentina",
    "Australia",
    "Austria",
    "Bangladesh",
    "Belgium",
    "Brazil",
    "Bulgaria",
    "Canada",
    "Chile",
    "China",
    "Colombia",
    "Croatia",
    "Czech Republic",
    "Denmark",
    "Egypt",
    "Finland",
    "France",
    "Germany",
    "Greece",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Ireland",
    "Israel",
    "Italy",
    "Japan",
    "Jordan",
    "Kenya",
    "South Korea",
    "Lebanon",
    "Malaysia",
    "Mexico",
    "Morocco",
    "Netherlands",
    "New Zealand",
    "Nigeria",
    "Norway",
    "Pakistan",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Romania",
    "Russia",
    "Saudi Arabia",
    "Singapore",
    "South Africa",
    "Spain",
    "Sweden",
    "Switzerland",
    "Thailand",
    "Turkey",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "Vietnam"
  ];
  const educationLevels = ['Bachelor', 'Master', 'PhD', 'Diploma', 'Certificate'];
  const fieldsOfStudy = ['Engineering', 'Medicine', 'Business', 'Arts', 'Science', 'Law', 'Education', 'Agriculture'];

  const { data: partners } = useQuery({
    queryKey: ['partners'],
    queryFn: () => PartnerService.getPartners(),
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        country: '',
        institution: '',
        level: '',
        field_of_study: '',
        description: '',
        requirements: '',
        benefits: '',
        application_deadline: '',
        is_fully_funded: false,
        is_published: false,
        application_link: '',
        funding_type: 'partially_funded',
      });
      setApplicationDeadline(null);
      setSelectedInstitution('');
      setSelectedCountry('');
      setSelectedLevel('');
      setSelectedField('');
    }
  }, [isOpen]);

  const createMutation = useMutation({
    mutationFn: (data: CreateScholarshipRequest) => ScholarshipService.createScholarship(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scholarships'] });
      toast.success('Scholarship created successfully');
      onClose();
    },
    onError: (error: unknown) => {
      let message = 'Failed to create scholarship';
      if (typeof error === 'object' && error !== null) {
        const maybeResponse = (error as { response?: { data?: { message?: unknown } } }).response;
        const maybeMessage = maybeResponse?.data?.message;
        if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
          message = maybeMessage;
        }
      }
      toast.error(message);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a scholarship title');
      return;
    }

    setIsLoading(true);
    try {
      await createMutation.mutateAsync(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Scholarship</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., African Development Bank Scholarship Program 2025"
                required
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={countryOpen}
                    className="w-full justify-between"
                  >
                    {selectedCountry || "Select country..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search country..." />
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {countries.map((country) => (
                        <CommandItem
                          key={country}
                          onSelect={() => {
                            setSelectedCountry(country);
                            setFormData({ ...formData, country: country });
                            setCountryOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCountry === country ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {country}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="institution">Institution</Label>
              <Popover open={institutionOpen} onOpenChange={setInstitutionOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={institutionOpen}
                    className="w-full justify-between"
                  >
                    {selectedInstitution || "Select institution..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search institution..." />
                    <CommandEmpty>No institution found.</CommandEmpty>
                    <CommandGroup>
                      {partners?.data?.data?.map((partner) => (
                        <CommandItem
                          key={partner.id}
                          onSelect={() => {
                            setSelectedInstitution(partner.name);
                            setFormData({ ...formData, institution: partner.name });
                            setInstitutionOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedInstitution === partner.name ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {partner.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="level">Education Level</Label>
              <Popover open={levelOpen} onOpenChange={setLevelOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={levelOpen}
                    className="w-full justify-between"
                  >
                    {selectedLevel || "Select education level..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search education level..." />
                    <CommandEmpty>No education level found.</CommandEmpty>
                    <CommandGroup>
                      {educationLevels.map((level) => (
                        <CommandItem
                          key={level}
                          onSelect={() => {
                            setSelectedLevel(level);
                            setFormData({ ...formData, level: level });
                            setLevelOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedLevel === level ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {level}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="field_of_study">Field of Study</Label>
              <Popover open={fieldOpen} onOpenChange={setFieldOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={fieldOpen}
                    className="w-full justify-between"
                  >
                    {selectedField || "Select field of study..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search field of study..." />
                    <CommandEmpty>No field of study found.</CommandEmpty>
                    <CommandGroup>
                      {fieldsOfStudy.map((field) => (
                        <CommandItem
                          key={field}
                          onSelect={() => {
                            setSelectedField(field);
                            setFormData({ ...formData, field_of_study: field });
                            setFieldOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedField === field ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {field}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <div className="space-y-2">
                <Label htmlFor="application_deadline" className="block">Application Deadline</Label>
                <DatePicker
                  id="application_deadline"
                  selected={applicationDeadline}
                  onChange={(date: Date | null) => {
                    setApplicationDeadline(date);
                    setFormData({ ...formData, application_deadline: date ? date.toISOString().split('T')[0] : '' });
                  }}
                  placeholderText="Select a deadline"
                  dateFormat="yyyy-MM-dd"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="application_link">Application Link</Label>
              <Input
                id="application_link"
                type="url"
                value={formData.application_link}
                onChange={(e) => setFormData({ ...formData, application_link: e.target.value })}
                placeholder="https://example.com/apply"
              />
            </div>

            <div>
              <Label className="block">Funding Type</Label>
              <Select
                value={formData.funding_type}
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
            </div>

            <div className="col-span-2">
              <Tabs defaultValue="description" className="w-full">
                <TabsList>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="requirements">Requirements</TabsTrigger>
                  <TabsTrigger value="benefits">Benefits</TabsTrigger>
                </TabsList>
                <TabsContent value="description">
                  <div className="space-y-2">
                    <div className={cn("rich-editor", descFullscreen && "fullscreen")}>
                      <div className="rich-editor__topbar">
                        <span className="rich-editor__title">Description</span>
                        <Button variant="outline" size="sm" onClick={() => setDescFullscreen(v => !v)}>
                          {descFullscreen ? (
                            <>
                              <Minimize2 className="h-4 w-4 mr-2" /> Exit fullscreen
                            </>
                          ) : (
                            <>
                              <Maximize2 className="h-4 w-4 mr-2" /> Fullscreen
                            </>
                          )}
                        </Button>
                      </div>
                      <CKEditor
                        editor={ClassicEditor as any}
                        data={formData.description}
                        onChange={(_event: unknown, editor: { getData: () => string }) => {
                          const data = editor.getData();
                          setFormData({ ...formData, description: data });
                        }}
                        config={{
                          toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'undo', 'redo'],
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
                      <div className="rich-editor__hint">Pro tip: Drag the bottom edge to resize. Use fullscreen for distraction-free writing.</div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="requirements">
                  <div className="space-y-2">
                    <div className={cn("rich-editor", reqFullscreen && "fullscreen")}>
                      <div className="rich-editor__topbar">
                        <span className="rich-editor__title">Requirements</span>
                        <Button variant="outline" size="sm" onClick={() => setReqFullscreen(v => !v)}>
                          {reqFullscreen ? (
                            <>
                              <Minimize2 className="h-4 w-4 mr-2" /> Exit fullscreen
                            </>
                          ) : (
                            <>
                              <Maximize2 className="h-4 w-4 mr-2" /> Fullscreen
                            </>
                          )}
                        </Button>
                      </div>
                      <CKEditor
                        editor={ClassicEditor as any}
                        data={formData.requirements}
                        onChange={(_event: unknown, editor: { getData: () => string }) => {
                          const data = editor.getData();
                          setFormData({ ...formData, requirements: data });
                        }}
                        config={{
                          toolbar: ['heading', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'link', 'bulletedList', 'numberedList', '|', 'undo', 'redo'],
                          heading: {
                            options: [
                              { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                              { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                              { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                              { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
                            ]
                          },
                          placeholder: 'Enter scholarship requirements...'
                        }}
                      />
                      <div className="rich-editor__hint">Pro tip: Drag the bottom edge to resize. Use fullscreen for distraction-free writing.</div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="benefits">
                  <div className="space-y-2">
                    <div className={cn("rich-editor", benefitsFullscreen && "fullscreen")}>
                      <div className="rich-editor__topbar">
                        <span className="rich-editor__title">Benefits</span>
                        <Button variant="outline" size="sm" onClick={() => setBenefitsFullscreen(v => !v)}>
                          {benefitsFullscreen ? (
                            <>
                              <Minimize2 className="h-4 w-4 mr-2" /> Exit fullscreen
                            </>
                          ) : (
                            <>
                              <Maximize2 className="h-4 w-4 mr-2" /> Fullscreen
                            </>
                          )}
                        </Button>
                      </div>
                      <CKEditor
                        editor={ClassicEditor as any}
                        data={formData.benefits}
                        onChange={(_event: unknown, editor: { getData: () => string }) => {
                          const data = editor.getData();
                          setFormData({ ...formData, benefits: data });
                        }}
                        config={{
                          toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'undo', 'redo'],
                          heading: {
                            options: [
                              { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                              { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                              { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                              { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
                            ]
                          },
                          placeholder: 'Enter scholarship benefits...'
                        }}
                      />
                      <div className="rich-editor__hint">Pro tip: Drag the bottom edge to resize. Use fullscreen for distraction-free writing.</div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_fully_funded"
                checked={formData.is_fully_funded}
                onCheckedChange={(checked) => {
                  setFormData({
                    ...formData,
                    is_fully_funded: checked,
                    funding_type: checked ? 'fully_funded' : (formData.funding_type === 'fully_funded' ? 'partially_funded' : formData.funding_type),
                  });
                }}
              />
              <Label htmlFor="is_fully_funded" className="cursor-pointer">
                Fully Funded
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_published"
                checked={formData.is_published}
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
              {isLoading ? 'Creating...' : 'Create Scholarship'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
