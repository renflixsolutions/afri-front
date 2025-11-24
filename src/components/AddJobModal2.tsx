/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import {
  Save,
  X,
  Check,
  ChevronsUpDown,
  Maximize2,
  Minimize2
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import PartnerService from "@/services/api/PartnerService";
import { Partner } from "@/types/partners";

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (jobData: JobFormData) => Promise<void>;
}

export interface JobFormData {
  title: string;
  country: string;
  location: string;
  job_type: string;
  category: string;
  level: string;
  description: string;
  responsibilities: string;
  requirements: string;
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  is_remote: boolean;
  is_published: boolean;
  featured: boolean;
  status: string;
  closing_date: string;
  published_at: string;
  expires_at: string;
  partner_id?: string;
}

const initialFormData: JobFormData = {
  title: '',
  country: '',
  location: '',
  job_type: 'Full-time',
  category: '',
  level: 'Mid-level',
  description: '',
  responsibilities: '',
  requirements: '',
  salary_min: 0,
  salary_max: 0,
  salary_currency: 'USD',
  is_remote: false,
  is_published: true,
  featured: false,
  status: 'open',
  closing_date: '',
  published_at: '',
  expires_at: '',
  partner_id: ''
};

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

const jobCategories = [
  "Technology",
  "Marketing",
  "Sales",
  "Finance",
  "Human Resources",
  "Operations",
  "Design",
  "Engineering",
  "Product Management",
  "Customer Service",
  "Legal",
  "Healthcare",
  "Education",
  "Consulting",
  "Research",
  "Data Science",
  "DevOps",
  "Quality Assurance",
  "Project Management",
  "Business Development",
  "Content Creation",
  "Digital Marketing",
  "E-commerce",
  "Logistics",
  "Supply Chain",
  "Real Estate",
  "Construction",
  "Manufacturing",
  "Agriculture",
  "Energy",
  "Environmental",
  "Non-profit",
  "Government",
  "Media",
  "Entertainment",
  "Sports",
  "Tourism",
  "Hospitality",
  "Retail",
  "Transportation"
];

export function AddJobModal({ isOpen, onClose, onSave }: AddJobModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<JobFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof JobFormData, string>>>({});
  const [closingDate, setClosingDate] = useState<Date | null>(null);
  const [publishedDate, setPublishedDate] = useState<Date | null>(null);
  const [expiresDate, setExpiresDate] = useState<Date | null>(null);
  const [countryOpen, setCountryOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnerOpen, setPartnerOpen] = useState(false);
  const [partnerSearch, setPartnerSearch] = useState('');
  // Fullscreen toggles per editor tab
  const [descFullscreen, setDescFullscreen] = useState(false);
  const [respFullscreen, setRespFullscreen] = useState(false);
  const [reqFullscreen, setReqFullscreen] = useState(false);

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen, partnerSearch]);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData(initialFormData);
      setErrors({});
      setClosingDate(null);
      setPublishedDate(null);
      setExpiresDate(null);
      setPartnerSearch("");
      setPartnerOpen(false);
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof JobFormData, string>> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.job_type.trim()) newErrors.job_type = 'Job type is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.level.trim()) newErrors.level = 'Level is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.responsibilities.trim()) newErrors.responsibilities = 'Responsibilities are required';
    if (!formData.requirements.trim()) newErrors.requirements = 'Requirements are required';
    // Salary is optional: if provided, validate positivity, currency, and logical range
    const min = formData.salary_min;
    const max = formData.salary_max;
    const hasSalary = min > 0 || max > 0;
    if (min < 0) newErrors.salary_min = 'Minimum salary cannot be negative';
    if (max < 0) newErrors.salary_max = 'Maximum salary cannot be negative';
    if (hasSalary) {
      if (!formData.salary_currency.trim()) newErrors.salary_currency = 'Currency is required when salary is provided';
      if (min > 0 && max > 0 && max < min) newErrors.salary_max = 'Maximum salary must be greater than minimum';
    }
    if (!formData.closing_date) newErrors.closing_date = 'Closing date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      toast.error("Failed to create job");
      console.error('Error creating job:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Job</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new job posting
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Software Engineer"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={categoryOpen}
                    className={`w-full justify-between ${errors.category ? 'border-red-500' : ''}`}
                  >
                    {formData.category
                      ? jobCategories.find((category) => category === formData.category)
                      : "Select category..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search category..." />
                    <CommandList>
                      <CommandEmpty>No category found.</CommandEmpty>
                      <CommandGroup>
                        {jobCategories.map((category) => (
                          <CommandItem
                            key={category}
                            value={category}
                            onSelect={(currentValue) => {
                              setFormData({ ...formData, category: currentValue === formData.category ? "" : currentValue });
                              setCategoryOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.category === category ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {category}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
            </div>
          </div>

          {/* Location Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={countryOpen}
                    className={`w-full justify-between ${errors.country ? 'border-red-500' : ''}`}
                  >
                    {formData.country
                      ? countries.find((country) => country === formData.country)
                      : "Select country..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search country..." />
                    <CommandList>
                      <CommandEmpty>No country found.</CommandEmpty>
                      <CommandGroup>
                        {countries.map((country) => (
                          <CommandItem
                            key={country}
                            value={country}
                            onSelect={(currentValue) => {
                              setFormData({ ...formData, country: currentValue === formData.country ? "" : currentValue });
                              setCountryOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.country === country ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {country}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.country && <p className="text-xs text-red-500">{errors.country}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Berlin"
                className={errors.location ? 'border-red-500' : ''}
              />
              {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
            </div>
          </div>

          {/* Job Type and Level */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job_type">Job Type *</Label>
              <Select value={formData.job_type} onValueChange={(value) => setFormData({ ...formData, job_type: value })}>
                <SelectTrigger className={errors.job_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
              {errors.job_type && <p className="text-xs text-red-500">{errors.job_type}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level *</Label>
              <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                <SelectTrigger className={errors.level ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entry-level">Entry-level</SelectItem>
                  <SelectItem value="Junior">Junior</SelectItem>
                  <SelectItem value="Mid-level">Mid-level</SelectItem>
                  <SelectItem value="Senior">Senior</SelectItem>
                  <SelectItem value="Lead">Lead</SelectItem>
                  <SelectItem value="Executive">Executive</SelectItem>
                </SelectContent>
              </Select>
              {errors.level && <p className="text-xs text-red-500">{errors.level}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Salary Information */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary_min">Min Salary</Label>
              <Input
                id="salary_min"
                type="number"
                value={formData.salary_min || ''}
                onChange={(e) => setFormData({ ...formData, salary_min: Number(e.target.value) })}
                placeholder="e.g., 2500"
                className={errors.salary_min ? 'border-red-500' : ''}
              />
              {errors.salary_min && <p className="text-xs text-red-500">{errors.salary_min}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary_max">Max Salary</Label>
              <Input
                id="salary_max"
                type="number"
                value={formData.salary_max || ''}
                onChange={(e) => setFormData({ ...formData, salary_max: Number(e.target.value) })}
                placeholder="e.g., 4000"
                className={errors.salary_max ? 'border-red-500' : ''}
              />
              {errors.salary_max && <p className="text-xs text-red-500">{errors.salary_max}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary_currency">Currency</Label>
              <Select value={formData.salary_currency} onValueChange={(value) => setFormData({ ...formData, salary_currency: value })}>
                <SelectTrigger className={errors.salary_currency ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="KES">KES</SelectItem>
                  <SelectItem value="NGN">NGN</SelectItem>
                  <SelectItem value="ZAR">ZAR</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="AUD">AUD</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                  <SelectItem value="CHF">CHF</SelectItem>
                  <SelectItem value="CNY">CNY</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                </SelectContent>
              </Select>
              {errors.salary_currency && <p className="text-xs text-red-500">{errors.salary_currency}</p>}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="closing_date" className="block">Closing Date *</Label>
              {/* @ts-expect-error: react-datepicker complex overload typing */}
              <DatePicker
                id="closing_date"
                selected={closingDate}
                onChange={(date) => {
                  // react-datepicker onChange can provide Date | [Date, Date] | null depending on props
                  const selectedDate: Date | null = Array.isArray(date) ? (date[0] ?? null) : (date as Date | null);
                  setClosingDate(selectedDate);
                  setFormData({ ...formData, closing_date: selectedDate ? selectedDate.toISOString().split('T')[0] : '' });
                }}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select closing date"
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.closing_date ? 'border-red-500' : ''}`}
              />
              {errors.closing_date && <p className="text-xs text-red-500">{errors.closing_date}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="published_at" className="block">Published Date</Label>
              {/* @ts-expect-error: react-datepicker complex overload typing */}
              <DatePicker
                id="published_at"
                selected={publishedDate}
                onChange={(date) => {
                  const selectedDate: Date | null = Array.isArray(date) ? (date[0] ?? null) : (date as Date | null);
                  setPublishedDate(selectedDate);
                  setFormData({ ...formData, published_at: selectedDate ? selectedDate.toISOString().split('T')[0] : '' });
                }}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select published date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires_at" className="block">Expires Date</Label>
              {/* @ts-expect-error: react-datepicker complex overload typing */}
              <DatePicker
                id="expires_at"
                selected={expiresDate}
                onChange={(date) => {
                  const selectedDate: Date | null = Array.isArray(date) ? (date[0] ?? null) : (date as Date | null);
                  setExpiresDate(selectedDate);
                  setFormData({ ...formData, expires_at: selectedDate ? selectedDate.toISOString().split('T')[0] : '' });
                }}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select expires date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focusVisible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {/* Partner */}
          <div className="space-y-2">
            <Label htmlFor="partner_id">Partner (Optional)</Label>
            <Popover open={partnerOpen} onOpenChange={setPartnerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={partnerOpen}
                  className="w-full justify-between"
                >
                  {formData.partner_id
                    ? partners.find((partner) => partner.id === formData.partner_id)?.name || "Select partner..."
                    : "Select partner..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search partners..." value={partnerSearch} onValueChange={setPartnerSearch} />
                  <CommandList>
                    <CommandEmpty>No partners found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          setFormData({ ...formData, partner_id: "" });
                          setPartnerOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            !formData.partner_id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        None
                      </CommandItem>
                      {partners.map((partner) => (
                        <CommandItem
                          key={partner.id}
                          value={partner.name}
                          onSelect={() => {
                            setFormData({ ...formData, partner_id: partner.id });
                            setPartnerOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.partner_id === partner.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {partner.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <Label htmlFor="is_remote">Remote</Label>
              <Switch
                id="is_remote"
                checked={formData.is_remote}
                onCheckedChange={(checked) => setFormData({ ...formData, is_remote: checked })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="featured">Featured</Label>
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="is_published">Published</Label>
              <Switch
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
              />
            </div>
          </div>

          {/* Tabs for Description, Responsibilities, Requirements */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description *</TabsTrigger>
              <TabsTrigger value="responsibilities">Responsibilities *</TabsTrigger>
              <TabsTrigger value="requirements">Requirements *</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-4">
              <div className="space-y-2">
                <div className={cn("rich-editor", descFullscreen && "fullscreen", errors.description ? "border-red-500" : "")}>
                  <div className="rich-editor__topbar">
                    <span className="rich-editor__title">Description</span>
                    <Button variant="outline" size="sm" onClick={() => setDescFullscreen((v) => !v)}>
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
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setFormData({ ...formData, description: data });
                    }}
                    config={{
                      toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'undo', 'redo']
                    }}
                  />
                  <div className="rich-editor__hint">Pro tip: Drag the bottom edge to resize. Use fullscreen for distraction‑free writing.</div>
                </div>
                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
              </div>
            </TabsContent>

            <TabsContent value="responsibilities" className="mt-4">
              <div className="space-y-2">
                <div className={cn("rich-editor", respFullscreen && "fullscreen", errors.responsibilities ? "border-red-500" : "")}>
                  <div className="rich-editor__topbar">
                    <span className="rich-editor__title">Responsibilities</span>
                    <Button variant="outline" size="sm" onClick={() => setRespFullscreen((v) => !v)}>
                      {respFullscreen ? (
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
                    data={formData.responsibilities}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setFormData({ ...formData, responsibilities: data });
                    }}
                    config={{
                      toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'undo', 'redo']
                    }}
                  />
                  <div className="rich-editor__hint">Pro tip: Drag the bottom edge to resize. Use fullscreen for distraction‑free writing.</div>
                </div>
                {errors.responsibilities && <p className="text-xs text-red-500">{errors.responsibilities}</p>}
              </div>
            </TabsContent>

            <TabsContent value="requirements" className="mt-4">
              <div className="space-y-2">
                <div className={cn("rich-editor", reqFullscreen && "fullscreen", errors.requirements ? "border-red-500" : "")}>
                  <div className="rich-editor__topbar">
                    <span className="rich-editor__title">Requirements</span>
                    <Button variant="outline" size="sm" onClick={() => setReqFullscreen((v) => !v)}>
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
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setFormData({ ...formData, requirements: data });
                    }}
                    config={{
                      toolbar: ['heading', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'link', 'bulletedList', 'numberedList', '|', 'codeBlock', '|', 'undo', 'redo']
                    }}
                  />
                  <div className="rich-editor__hint">Pro tip: Drag the bottom edge to resize. Use fullscreen for distraction‑free writing.</div>
                </div>
                {errors.requirements && <p className="text-xs text-red-500">{errors.requirements}</p>}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Creating...' : 'Create Job'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Alias export to match existing imports elsewhere
export { AddJobModal as AddJobModal2 };