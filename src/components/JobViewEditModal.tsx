/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Job } from "@/types/jobs";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Building2,
  Save,
  X,
  ChevronsUpDown,
  Check,
  Maximize2,
  Minimize2
} from "lucide-react";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import PartnerService from "@/services/api/PartnerService";
import { Partner } from "@/types/partners";

interface JobViewEditModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedJob: Partial<Job> & { partner_id?: string }) => Promise<void>;
  mode: 'view' | 'edit';
}

// Country and category options (same as AddJobModal for consistency)
const countries = ["Afghanistan","Albania","Algeria","Argentina","Australia","Austria","Bangladesh","Belgium","Brazil","Bulgaria","Canada","Chile","China","Colombia","Croatia","Czech Republic","Denmark","Egypt","Finland","France","Germany","Greece","Hungary","Iceland","India","Indonesia","Ireland","Israel","Italy","Japan","Jordan","Kenya","South Korea","Lebanon","Malaysia","Mexico","Morocco","Netherlands","New Zealand","Nigeria","Norway","Pakistan","Peru","Philippines","Poland","Portugal","Romania","Russia","Saudi Arabia","Singapore","South Africa","Spain","Sweden","Switzerland","Thailand","Turkey","Ukraine","United Arab Emirates","United Kingdom","United States","Vietnam"];

const jobCategories = ["Technology","Marketing","Sales","Finance","Human Resources","Operations","Design","Engineering","Product Management","Customer Service","Legal","Healthcare","Education","Consulting","Research","Data Science","DevOps","Quality Assurance","Project Management","Business Development","Content Creation","Digital Marketing","E-commerce","Logistics","Supply Chain","Real Estate","Construction","Manufacturing","Agriculture","Energy","Environmental","Non-profit","Government","Media","Entertainment","Sports","Tourism","Hospitality","Retail","Transportation"];

export function JobViewEditModal({ job, isOpen, onClose, onSave, mode: initialMode }: JobViewEditModalProps) {
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Job> & { partner_id?: string }>({});
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [closingDate, setClosingDate] = useState<Date | null>(null);
  const [publishedDate, setPublishedDate] = useState<Date | null>(null);
  const [expiresDate, setExpiresDate] = useState<Date | null>(null);
  const [countryOpen, setCountryOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnerOpen, setPartnerOpen] = useState(false);
  const [partnerSearch, setPartnerSearch] = useState('');
  // Rich editor fullscreen toggles
  const [descFullscreen, setDescFullscreen] = useState(false);
  const [respFullscreen, setRespFullscreen] = useState(false);
  const [reqFullscreen, setReqFullscreen] = useState(false);

  useEffect(() => {
    if (job) {
      // Initialize form data from job
      setFormData({ ...job, partner_id: job.partner?.id });
      // Parse dates
      setClosingDate(job.closing_date ? new Date(job.closing_date) : null);
      setPublishedDate(job.published_at ? new Date(job.published_at) : null);
      setExpiresDate(job.expires_at ? new Date(job.expires_at) : null);
    } else {
      setFormData({});
      setClosingDate(null);
      setPublishedDate(null);
      setExpiresDate(null);
    }
    setMode(initialMode);
    setErrors({});
  }, [job, initialMode]);

  useEffect(() => {
    if (mode === 'edit' && isOpen) {
      const fetchPartners = async () => {
        try {
          const response = await PartnerService.getPartners(1, partnerSearch);
          setPartners(response.data.data);
        } catch (error) {
          console.error('Failed to fetch partners:', error);
        }
      };
      fetchPartners();
    }
  }, [mode, isOpen, partnerSearch]);

  const validateForm = (): boolean => {
    if (mode !== 'edit') return true;
    const newErrors: Partial<Record<string, string>> = {};
    // Required fields
    if (!formData.title?.trim()) newErrors.title = 'Title is required';
    if (!formData.country?.trim()) newErrors.country = 'Country is required';
    if (!formData.location?.trim()) newErrors.location = 'Location is required';
    if (!formData.job_type?.trim()) newErrors.job_type = 'Job type is required';
    if (!formData.category?.trim()) newErrors.category = 'Category is required';
    if (!formData.level?.trim()) newErrors.level = 'Level is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (!formData.responsibilities?.trim()) newErrors.responsibilities = 'Responsibilities are required';
    if (!formData.requirements?.trim()) newErrors.requirements = 'Requirements are required';
    // Salary validation (optional)
    const min = formData.salary_min ?? 0;
    const max = formData.salary_max ?? 0;
    const hasSalary = min > 0 || max > 0;
    if (min < 0) newErrors.salary_min = 'Minimum salary cannot be negative';
    if (max < 0) newErrors.salary_max = 'Maximum salary cannot be negative';
    if (hasSalary) {
      if (!formData.salary_currency?.trim()) newErrors.salary_currency = 'Currency is required when salary provided';
      if (min > 0 && max > 0 && max < min) newErrors.salary_max = 'Max salary must be greater than min';
    }
    if (!formData.closing_date) newErrors.closing_date = 'Closing date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!onSave || !job) return;
    if (!validateForm()) {
      toast.error('Please correct validation errors');
      return;
    }
    setIsLoading(true);
    try {
      await onSave(formData);
      setMode('view');
    } catch (error) {
      console.error('Error updating job:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (job) {
      setFormData({ ...job, partner_id: job.partner?.id });
      setClosingDate(job.closing_date ? new Date(job.closing_date) : null);
      setPublishedDate(job.published_at ? new Date(job.published_at) : null);
      setExpiresDate(job.expires_at ? new Date(job.expires_at) : null);
    }
    setMode('view');
    setErrors({});
  };

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{job.title}</DialogTitle>
              <DialogDescription>
                {mode === 'view' ? 'View job details' : 'Edit job details'}
              </DialogDescription>
            </div>
            {mode === 'view' && (
              <Button onClick={() => setMode('edit')} variant="outline">
                Edit Job
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Meta Information & Editable Fields */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div className="space-y-3">
              {/* Location + Country */}
              <div className="space-y-1">
                <Label className="text-xs">Location / Country</Label>
                {mode === 'edit' ? (
                  <div className="flex gap-2">
                    <Input
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Location"
                      className={cn('h-8', errors.location && 'border-red-500')}
                    />
                    <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={countryOpen}
                          className={cn('h-8 justify-between w-40', errors.country && 'border-red-500')}
                        >
                          {formData.country || 'Country'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-0">
                        <Command>
                          <CommandInput placeholder="Search country..." />
                          <CommandList>
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                              {countries.map(c => (
                                <CommandItem
                                  key={c}
                                  value={c}
                                  onSelect={(val) => {
                                    setFormData({ ...formData, country: val });
                                    setCountryOpen(false);
                                  }}
                                >
                                  <Check className={cn('mr-2 h-4 w-4', formData.country === c ? 'opacity-100' : 'opacity-0')} />
                                  {c}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{job.location}, {job.country}</span>
                  </div>
                )}
                {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
                {errors.country && <p className="text-xs text-red-500">{errors.country}</p>}
              </div>

              {/* Job Type */}
              <div className="space-y-1">
                <Label className="text-xs">Job Type</Label>
                {mode === 'edit' ? (
                  <Select value={formData.job_type || ''} onValueChange={(v) => setFormData({ ...formData, job_type: v })}>
                    <SelectTrigger className={cn('h-8', errors.job_type && 'border-red-500')}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{job.job_type}</span>
                    {job.is_remote && <Badge variant="outline" className="text-xs">Remote</Badge>}
                  </div>
                )}
                {errors.job_type && <p className="text-xs text-red-500">{errors.job_type}</p>}
              </div>

              {/* Partner */}
              <div className="space-y-1">
                <Label className="text-xs">Partner</Label>
                {mode === 'edit' ? (
                  <Popover open={partnerOpen} onOpenChange={setPartnerOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={partnerOpen} className="h-8 w-full justify-between">
                        {formData.partner_id ? partners.find(p => p.id === formData.partner_id)?.name || 'Select partner' : 'Select partner'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search partners..." value={partnerSearch} onValueChange={setPartnerSearch} />
                        <CommandList>
                          <CommandEmpty>No partners found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem onSelect={() => { setFormData({ ...formData, partner_id: '' }); setPartnerOpen(false); }}>
                              <Check className={cn('mr-2 h-4 w-4', !formData.partner_id ? 'opacity-100' : 'opacity-0')} />
                              None
                            </CommandItem>
                            {partners.map(p => (
                              <CommandItem key={p.id} value={p.name} onSelect={() => { setFormData({ ...formData, partner_id: p.id }); setPartnerOpen(false); }}>
                                <Check className={cn('mr-2 h-4 w-4', formData.partner_id === p.id ? 'opacity-100' : 'opacity-0')} />
                                {p.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{job.partner?.name || 'N/A'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-3">
              {/* Salary */}
              <div className="space-y-1">
                <Label className="text-xs">Salary Range</Label>
                {mode === 'edit' ? (
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      value={formData.salary_min ?? ''}
                      onChange={(e) => setFormData({ ...formData, salary_min: Number(e.target.value) })}
                      placeholder="Min"
                      className={cn('h-8 w-24', errors.salary_min && 'border-red-500')}
                    />
                    <span>-</span>
                    <Input
                      type="number"
                      value={formData.salary_max ?? ''}
                      onChange={(e) => setFormData({ ...formData, salary_max: Number(e.target.value) })}
                      placeholder="Max"
                      className={cn('h-8 w-24', errors.salary_max && 'border-red-500')}
                    />
                    <Select value={formData.salary_currency || ''} onValueChange={(v) => setFormData({ ...formData, salary_currency: v })}>
                      <SelectTrigger className={cn('h-8 w-24', errors.salary_currency && 'border-red-500')}>
                        <SelectValue placeholder="Cur" />
                      </SelectTrigger>
                      <SelectContent>
                        {['USD','EUR','GBP','KES','NGN','ZAR','CAD','AUD','JPY','CHF','CNY','INR'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{`${job.salary_currency} ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`}</span>
                  </div>
                )}
                {errors.salary_min && <p className="text-xs text-red-500">{errors.salary_min}</p>}
                {errors.salary_max && <p className="text-xs text-red-500">{errors.salary_max}</p>}
                {errors.salary_currency && <p className="text-xs text-red-500">{errors.salary_currency}</p>}
              </div>

              {/* Closing / Dates */}
              <div className="space-y-1">
                <Label className="text-xs">Dates</Label>
                {mode === 'edit' ? (
                  <div className="grid grid-cols-3 gap-2">
                    {/* @ts-expect-error - react-datepicker complex overload typing */}
                    <DatePicker
                      selected={closingDate}
                      onChange={(d) => {
                        const selected: Date | null = Array.isArray(d) ? (d[0] ?? null) : (d as Date | null);
                        setClosingDate(selected);
                        setFormData({ ...formData, closing_date: selected ? selected.toISOString().split('T')[0] : '' });
                      }}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Closing"
                      className={cn('h-8 text-xs w-full rounded-md border px-2', errors.closing_date && 'border-red-500')}
                    />
                    {/* @ts-expect-error - react-datepicker complex overload typing */}
                    <DatePicker
                      selected={publishedDate}
                      onChange={(d) => {
                        const selected: Date | null = Array.isArray(d) ? (d[0] ?? null) : (d as Date | null);
                        setPublishedDate(selected);
                        setFormData({ ...formData, published_at: selected ? selected.toISOString().split('T')[0] : '' });
                      }}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Published"
                      className="h-8 text-xs w-full rounded-md border px-2"
                    />
                    {/* @ts-expect-error - react-datepicker complex overload typing */}
                    <DatePicker
                      selected={expiresDate}
                      onChange={(d) => {
                        const selected: Date | null = Array.isArray(d) ? (d[0] ?? null) : (d as Date | null);
                        setExpiresDate(selected);
                        setFormData({ ...formData, expires_at: selected ? selected.toISOString().split('T')[0] : '' });
                      }}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Expires"
                      className="h-8 text-xs w-full rounded-md border px-2"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-1"><Calendar className="h-3 w-3 text-muted-foreground" />Closes: {new Date(job.closing_date).toLocaleDateString()}</div>
                    {job.published_at && <div className="flex items-center gap-1"><Calendar className="h-3 w-3 text-muted-foreground" />Published: {new Date(job.published_at).toLocaleDateString()}</div>}
                    {job.expires_at && <div className="flex items-center gap-1"><Calendar className="h-3 w-3 text-muted-foreground" />Expires: {new Date(job.expires_at).toLocaleDateString()}</div>}
                  </div>
                )}
                {errors.closing_date && <p className="text-xs text-red-500">{errors.closing_date}</p>}
              </div>

              {/* Category & Level */}
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1 flex-1">
                    <Label className="text-xs">Category</Label>
                    {mode === 'edit' ? (
                      <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" role="combobox" aria-expanded={categoryOpen} className={cn('h-8 justify-between', errors.category && 'border-red-500')}>
                            {formData.category || 'Select category'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-0">
                          <Command>
                            <CommandInput placeholder="Search category..." />
                            <CommandList>
                              <CommandEmpty>No category found.</CommandEmpty>
                              <CommandGroup>
                                {jobCategories.map(cat => (
                                  <CommandItem key={cat} value={cat} onSelect={(v) => { setFormData({ ...formData, category: v }); setCategoryOpen(false); }}>
                                    <Check className={cn('mr-2 h-4 w-4', formData.category === cat ? 'opacity-100' : 'opacity-0')} />
                                    {cat}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <Badge variant="outline" className="text-xs">{job.category}</Badge>
                    )}
                    {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <Label className="text-xs">Level</Label>
                    {mode === 'edit' ? (
                      <Select value={formData.level || ''} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                        <SelectTrigger className={cn('h-8', errors.level && 'border-red-500')}>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {['Entry-level','Junior','Mid-level','Senior','Lead','Executive'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline" className="text-xs">{job.level}</Badge>
                    )}
                    {errors.level && <p className="text-xs text-red-500">{errors.level}</p>}
                  </div>
                </div>
              </div>

              {/* Status & Toggles */}
              <div className="grid grid-cols-4 gap-2 p-2 border rounded-lg">
                <div className="flex flex-col justify-center">
                  <Label className="text-xs mb-1">Status</Label>
                  {mode === 'edit' ? (
                    <Select value={formData.status || ''} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={cn('text-xs', job.status === 'open' ? 'bg-green-500' : job.status === 'closed' ? 'bg-red-500' : 'bg-gray-500')}>{job.status}</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_remote" className="text-xs">Remote</Label>
                  <Switch id="is_remote" checked={formData.is_remote || false} disabled={mode !== 'edit'} onCheckedChange={(c) => setFormData({ ...formData, is_remote: c })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="featured" className="text-xs">Featured</Label>
                  <Switch id="featured" checked={formData.featured || false} disabled={mode !== 'edit'} onCheckedChange={(c) => setFormData({ ...formData, featured: c })} />
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
              <TabsTrigger value="responsibilities">Responsibilities</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-4">
              <div className="space-y-2">
                <div className={cn("rich-editor", descFullscreen && "fullscreen", errors.description && 'border-red-500')}>
                  {mode === 'edit' && (
                    <div className="rich-editor__topbar flex items-center justify-between">
                      <span className="rich-editor__title">Description</span>
                      <Button variant="outline" size="sm" onClick={() => setDescFullscreen(v => !v)}>
                        {descFullscreen ? <><Minimize2 className="h-4 w-4 mr-2" /> Exit fullscreen</> : <><Maximize2 className="h-4 w-4 mr-2" /> Fullscreen</>}
                      </Button>
                    </div>
                  )}
                  {mode === 'edit' ? (
                    <CKEditor
                      editor={ClassicEditor as any}
                      data={formData.description || ''}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setFormData({ ...formData, description: data });
                      }}
                      config={{ toolbar: ['heading','|','bold','italic','link','bulletedList','numberedList','|','undo','redo'] }}
                    />
                  ) : (
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: job.description }} />
                  )}
                  {mode === 'edit' && <div className="rich-editor__hint">Pro tip: Use fullscreen for distraction-free writing.</div>}
                </div>
                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
              </div>
            </TabsContent>

            <TabsContent value="responsibilities" className="mt-4">
              <div className="space-y-2">
                <div className={cn("rich-editor", respFullscreen && "fullscreen", errors.responsibilities && 'border-red-500')}>
                  {mode === 'edit' && (
                    <div className="rich-editor__topbar flex items-center justify-between">
                      <span className="rich-editor__title">Responsibilities</span>
                      <Button variant="outline" size="sm" onClick={() => setRespFullscreen(v => !v)}>
                        {respFullscreen ? <><Minimize2 className="h-4 w-4 mr-2" /> Exit fullscreen</> : <><Maximize2 className="h-4 w-4 mr-2" /> Fullscreen</>}
                      </Button>
                    </div>
                  )}
                  {mode === 'edit' ? (
                    <CKEditor
                      editor={ClassicEditor as any}
                      data={formData.responsibilities || ''}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setFormData({ ...formData, responsibilities: data });
                      }}
                      config={{ toolbar: ['heading','|','bold','italic','link','bulletedList','numberedList','|','undo','redo'] }}
                    />
                  ) : (
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: job.responsibilities }} />
                  )}
                  {mode === 'edit' && <div className="rich-editor__hint">Pro tip: Use fullscreen for distraction-free writing.</div>}
                </div>
                {errors.responsibilities && <p className="text-xs text-red-500">{errors.responsibilities}</p>}
              </div>
            </TabsContent>

            <TabsContent value="requirements" className="mt-4">
              <div className="space-y-2">
                <div className={cn("rich-editor", reqFullscreen && "fullscreen", errors.requirements && 'border-red-500')}>
                  {mode === 'edit' && (
                    <div className="rich-editor__topbar flex items-center justify-between">
                      <span className="rich-editor__title">Requirements</span>
                      <Button variant="outline" size="sm" onClick={() => setReqFullscreen(v => !v)}>
                        {reqFullscreen ? <><Minimize2 className="h-4 w-4 mr-2" /> Exit fullscreen</> : <><Maximize2 className="h-4 w-4 mr-2" /> Fullscreen</>}
                      </Button>
                    </div>
                  )}
                  {mode === 'edit' ? (
                    <CKEditor
                      editor={ClassicEditor as any}
                      data={formData.requirements || ''}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setFormData({ ...formData, requirements: data });
                      }}
                      config={{ toolbar: ['heading','|','bold','italic','link','bulletedList','numberedList','|','undo','redo'] }}
                    />
                  ) : (
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: job.requirements }} />
                  )}
                  {mode === 'edit' && <div className="rich-editor__hint">Pro tip: Use fullscreen for distraction-free writing.</div>}
                </div>
                {errors.requirements && <p className="text-xs text-red-500">{errors.requirements}</p>}
              </div>
            </TabsContent>
          </Tabs>

          {/* Job Stats (view-only) */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold">{job.views_count}</div>
              <div className="text-xs text-muted-foreground">Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{job.applications_count}</div>
              <div className="text-xs text-muted-foreground">Applications</div>
            </div>
            <div className="text-center">
              <Badge className={job.status === 'open' ? 'bg-green-500' : job.status === 'closed' ? 'bg-red-500' : 'bg-gray-500'}>
                {job.status}
              </Badge>
              <div className="text-xs text-muted-foreground mt-1">Status</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">
                {job.is_remote ? 'Yes' : 'No'}
              </div>
              <div className="text-xs text-muted-foreground">Remote</div>
            </div>
          </div>
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
