import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import ReactSelect from "react-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { regionService } from "@/services/api/RegionService";
import ProjectService from "@/services/api/ProjectService";
import {
  CalendarIcon,
  Building2,
  MapPin,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Fingerprint,
  UserCheck,
  Wallet,
  Plus,
  UsersRound,
  Shuffle,
  Equal,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

const projectDetailsSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  sponsor: z.string().min(2, "Sponsor name is required"),
  country_id: z.string().min(1, "Country is required"),
  location_id: z.string().min(1, "Location is required"),
  sub_location_id: z.string().min(1, "Sub-location is required"),
});

const cycleDetailsSchema = z.object({
  cycle_name: z.string().min(3, "Cycle name must be at least 3 characters"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  max_slots: z.number().min(1, "Max slots must be at least 1"),
  registration_types: z.array(z.string()).min(1, "Select at least one registration type"),
  account_types: z.array(z.string()).min(1, "Select at least one account type"),
  type: z.string().min(1, "Distribution type is required"),
  amount: z.number().min(0, "Amount must be positive"),
  max_members: z.number().min(1, "Max members must be at least 1"),
  max_left_fingerprints: z.number().min(0, "Max left fingerprints must be 0 or more"),
  max_right_fingerprints: z.number().min(0, "Max right fingerprints must be 0 or more"),
  is_student: z.boolean(),
});

type ProjectDetailsData = z.infer<typeof projectDetailsSchema>;
type CycleDetailsData = z.infer<typeof cycleDetailsSchema>;

interface NewProjectWizardProps {
  onProjectCreated: () => void;
  children?: React.ReactNode;
}

export const NewProjectWizard = ({ onProjectCreated, children }: NewProjectWizardProps) => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [projectData, setProjectData] = useState<ProjectDetailsData | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Get active country from localStorage
  const activeCountryId = localStorage.getItem('selectedCountry') || user?.countries[0]?.id || '';

  // Step 1 Form
  const {
    register: registerProject,
    handleSubmit: handleSubmitProject,
    formState: { errors: projectErrors },
    setValue: setProjectValue,
    watch: watchProject,
    control: controlProject,
  } = useForm<ProjectDetailsData>({
    resolver: zodResolver(projectDetailsSchema),
    defaultValues: {
      country_id: activeCountryId,
    },
  });

  // Step 2 Form
  const {
    register: registerCycle,
    handleSubmit: handleSubmitCycle,
    formState: { errors: cycleErrors },
    setValue: setCycleValue,
    watch: watchCycle,
  } = useForm<CycleDetailsData>({
    resolver: zodResolver(cycleDetailsSchema),
    defaultValues: {
      registration_types: [],
      account_types: [],
      max_slots: 100,
      max_members: 5,
      max_left_fingerprints: 2,
      max_right_fingerprints: 2,
      amount: 0,
      is_student: false,
    },
  });

  const selectedLocationId = watchProject("location_id");
  const startDate = watchCycle("start_date");
  const endDate = watchCycle("end_date");
  const registrationTypes = watchCycle("registration_types") || [];
  const accountTypes = watchCycle("account_types") || [];
  const distributionType = watchCycle("type");

  // Fetch locations for the active country
  const { data: locationsData } = useQuery({
    queryKey: ['locations', activeCountryId],
    queryFn: () => regionService.listLocations(activeCountryId, 1),
    enabled: !!activeCountryId && open,
  });

  // Fetch sub-locations for selected location
  const { data: subLocationsData } = useQuery({
    queryKey: ['sublocations', selectedLocationId],
    queryFn: () => regionService.listSubLocations(selectedLocationId, 1),
    enabled: !!selectedLocationId && open,
  });

  const locations = Array.isArray(locationsData?.data?.data)
    ? locationsData.data.data
    : Array.isArray(locationsData?.data)
    ? locationsData.data
    : [];
  const subLocations = Array.isArray(subLocationsData?.data?.data)
    ? subLocationsData.data.data
    : Array.isArray(subLocationsData?.data)
    ? subLocationsData.data
    : [];

  const onProjectDetailsSubmit = (data: ProjectDetailsData) => {
    setProjectData(data);
    setCurrentStep(2);
  };

  const onCycleDetailsSubmit = async (cycleData: CycleDetailsData) => {
    if (!projectData) return;

    setIsLoading(true);
    try {
      // Submit all data in one request
      const payload = {
        name: projectData.name,
        description: projectData.description,
        sponsor: projectData.sponsor,
        country_id: projectData.country_id,
        location_id: projectData.location_id,
        sub_location_id: projectData.sub_location_id,
        cycle_name: cycleData.cycle_name,
        start_date: cycleData.start_date,
        end_date: cycleData.end_date,
        max_slots: cycleData.max_slots,
        registration_types: cycleData.registration_types,
        account_types: cycleData.account_types,
        type: cycleData.type,
        amount: cycleData.amount,
        max_members: cycleData.max_members,
        max_left_fingerprints: cycleData.max_left_fingerprints,
        max_right_fingerprints: cycleData.max_right_fingerprints,
        is_student: cycleData.is_student,
      };

      console.log('Submitting project:', payload);

      const response = await ProjectService.createProjectWithCycle(payload);

      if (!response.status) {
        throw new Error(response.message || "Failed to create project");
      }

      toast({
        title: "Success",
        description: "Project and first cycle created successfully",
      });

      setOpen(false);
      setCurrentStep(1);
      setProjectData(null);
      onProjectCreated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleRegistrationTypeToggle = (typeId: string) => {
    const current = registrationTypes;
    const updated = current.includes(typeId)
      ? current.filter((id) => id !== typeId)
      : [...current, typeId];
    setCycleValue("registration_types", updated);
  };

  const handleAccountTypeToggle = (typeId: string) => {
    const current = accountTypes;
    const updated = current.includes(typeId)
      ? current.filter((id) => id !== typeId)
      : [...current, typeId];
    setCycleValue("account_types", updated);
  };

  const handleInteractOutside = (e: Event) => {
    e.preventDefault();
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-primary hover:bg-primary-hover shadow-primary-glow">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent 
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={handleInteractOutside}
      >
        <div className={cn(isShaking && "animate-shake")}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {currentStep === 1 ? (
                <>
                  <Building2 className="h-5 w-5 text-primary" />
                  Create New Project
                </>
              ) : (
                <>
                  <Clock className="h-5 w-5 text-primary" />
                  Create First Cycle
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {currentStep === 1
                ? "Enter the project details to get started"
                : "Set up the first distribution cycle for this project"}
            </DialogDescription>
          </DialogHeader>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 my-4">
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full",
              currentStep === 1 ? "bg-primary text-primary-foreground" : "bg-success text-success-foreground"
            )}>
              {currentStep === 1 ? "1" : <CheckCircle2 className="h-5 w-5" />}
            </div>
            <div className={cn("h-1 w-16", currentStep === 2 ? "bg-primary" : "bg-muted")} />
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full",
              currentStep === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              2
            </div>
          </div>

          {/* Step 1: Project Details */}
          {currentStep === 1 && (
            <form onSubmit={handleSubmitProject(onProjectDetailsSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Project Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Community Health Project"
                  {...registerProject("name")}
                />
                {projectErrors.name && (
                  <p className="text-sm text-destructive">{projectErrors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the project goals and objectives..."
                  rows={3}
                  {...registerProject("description")}
                />
                {projectErrors.description && (
                  <p className="text-sm text-destructive">{projectErrors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sponsor">
                  Sponsor <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="sponsor"
                  placeholder="e.g., Health NGO"
                  {...registerProject("sponsor")}
                />
                {projectErrors.sponsor && (
                  <p className="text-sm text-destructive">{projectErrors.sponsor.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Country
                </Label>
                <Input
                  value={user?.countries.find(c => c.id === activeCountryId)?.name || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Country is set based on your active selection</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location_id">
                    Location <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="location_id"
                    control={controlProject}
                    render={({ field }) => (
                      <ReactSelect
                        {...field}
                        options={locations.map(loc => ({ value: loc.id, label: loc.name }))}
                        value={locations.find(loc => loc.id === field.value) ? { value: field.value, label: locations.find(loc => loc.id === field.value)!.name } : null}
                        onChange={(option) => {
                          field.onChange(option?.value || "");
                          setProjectValue("sub_location_id", "");
                        }}
                        placeholder="Select location"
                        isClearable
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{
                          control: (base) => ({
                            ...base,
                            minHeight: '40px',
                            borderColor: 'hsl(var(--input))',
                            '&:hover': { borderColor: 'hsl(var(--input))' }
                          }),
                          menu: (base) => ({ ...base, zIndex: 100 }),
                        }}
                      />
                    )}
                  />
                  {projectErrors.location_id && (
                    <p className="text-sm text-destructive">{projectErrors.location_id.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sub_location_id">
                    Sub-Location <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="sub_location_id"
                    control={controlProject}
                    render={({ field }) => (
                      <ReactSelect
                        {...field}
                        options={subLocations.map(sub => ({ value: sub.id, label: sub.name }))}
                        value={subLocations.find(sub => sub.id === field.value) ? { value: field.value, label: subLocations.find(sub => sub.id === field.value)!.name } : null}
                        onChange={(option) => field.onChange(option?.value || "")}
                        placeholder="Select sub-location"
                        isClearable
                        isDisabled={!selectedLocationId}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{
                          control: (base) => ({
                            ...base,
                            minHeight: '40px',
                            borderColor: 'hsl(var(--input))',
                            '&:hover': { borderColor: 'hsl(var(--input))' }
                          }),
                          menu: (base) => ({ ...base, zIndex: 100 }),
                        }}
                      />
                    )}
                  />
                  {projectErrors.sub_location_id && (
                    <p className="text-sm text-destructive">{projectErrors.sub_location_id.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" className="gap-2">
                  Next: Create Cycle
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 2: Cycle Details */}
          {currentStep === 2 && (
            <form onSubmit={handleSubmitCycle(onCycleDetailsSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cycle_name">
                  Cycle Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cycle_name"
                  placeholder="e.g., Q1 2025 Distribution"
                  {...registerCycle("cycle_name")}
                />
                {cycleErrors.cycle_name && (
                  <p className="text-sm text-destructive">{cycleErrors.cycle_name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    <CalendarIcon className="inline h-4 w-4 mr-1" />
                    Start Date <span className="text-destructive">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(new Date(startDate), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate ? new Date(startDate) : undefined}
                        onSelect={(date) => {
                          const formattedDate = date ? format(date, "yyyy-MM-dd") : "";
                          setCycleValue("start_date", formattedDate);
                          // Reset end date if it's before the new start date
                          if (date && endDate && new Date(endDate) < date) {
                            setCycleValue("end_date", "");
                          }
                        }}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  {cycleErrors.start_date && (
                    <p className="text-sm text-destructive">{cycleErrors.start_date.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    <CalendarIcon className="inline h-4 w-4 mr-1" />
                    End Date <span className="text-destructive">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(new Date(endDate), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate ? new Date(endDate) : undefined}
                        onSelect={(date) => setCycleValue("end_date", date ? format(date, "yyyy-MM-dd") : "")}
                        disabled={(date) => startDate ? date < new Date(startDate) : false}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  {cycleErrors.end_date && (
                    <p className="text-sm text-destructive">{cycleErrors.end_date.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_slots">
                  <Users className="inline h-4 w-4 mr-1" />
                  Max Slots <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="max_slots"
                  type="number"
                  {...registerCycle("max_slots", { valueAsNumber: true })}
                />
                {cycleErrors.max_slots && (
                  <p className="text-sm text-destructive">{cycleErrors.max_slots.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  <UserCheck className="inline h-4 w-4 mr-1" />
                  Registration Types <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "1", label: "House Hold", icon: Home },
                    { id: "2", label: "Individual", icon: UserCheck },
                    { id: "3", label: "Simplified", icon: Users },
                  ].map((type) => {
                    const Icon = type.icon;
                    const isSelected = registrationTypes.includes(type.id);
                    return (
                      <label
                        key={type.id}
                        htmlFor={`reg-${type.id}`}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <Checkbox
                          id={`reg-${type.id}`}
                          checked={isSelected}
                          onCheckedChange={() => handleRegistrationTypeToggle(type.id)}
                        />
                        <Icon className={cn("h-4 w-4", isSelected && "text-primary")} />
                        <span className={cn("font-medium flex-1", isSelected && "text-primary")}>
                          {type.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {cycleErrors.registration_types && (
                  <p className="text-sm text-destructive">{cycleErrors.registration_types.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  <Wallet className="inline h-4 w-4 mr-1" />
                  Account Types <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "1", label: "Food", icon: Users },
                    { id: "2", label: "Cash", icon: DollarSign },
                    { id: "3", label: "Mobile Money", icon: Wallet },
                  ].map((type) => {
                    const Icon = type.icon;
                    const isSelected = accountTypes.includes(type.id);
                    return (
                      <label
                        key={type.id}
                        htmlFor={`acc-${type.id}`}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <Checkbox
                          id={`acc-${type.id}`}
                          checked={isSelected}
                          onCheckedChange={() => handleAccountTypeToggle(type.id)}
                        />
                        <Icon className={cn("h-4 w-4", isSelected && "text-primary")} />
                        <span className={cn("font-medium flex-1", isSelected && "text-primary")}>
                          {type.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {cycleErrors.account_types && (
                  <p className="text-sm text-destructive">{cycleErrors.account_types.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">
                    Distribution Type <span className="text-destructive">*</span>
                  </Label>
                  <Select onValueChange={(value) => {
                    setCycleValue("type", value);
                    if (value === "3") {
                      setCycleValue("amount", 0);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Fixed</SelectItem>
                      <SelectItem value="2">By Family Size</SelectItem>
                      <SelectItem value="3">Random</SelectItem>
                    </SelectContent>
                  </Select>
                  {cycleErrors.type && (
                    <p className="text-sm text-destructive">{cycleErrors.type.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    disabled={distributionType === "3"}
                    {...registerCycle("amount", { valueAsNumber: true })}
                    className={cn(distributionType === "3" && "opacity-50 cursor-not-allowed")}
                  />
                  {cycleErrors.amount && (
                    <p className="text-sm text-destructive">{cycleErrors.amount.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_members">
                    <UsersRound className="inline h-4 w-4 mr-1" />
                    Max Members
                  </Label>
                  <Input
                    id="max_members"
                    type="number"
                    {...registerCycle("max_members", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_left_fingerprints">
                    <Fingerprint className="inline h-4 w-4 mr-1" />
                    Left Prints
                  </Label>
                  <Input
                    id="max_left_fingerprints"
                    type="number"
                    {...registerCycle("max_left_fingerprints", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_right_fingerprints">
                    <Fingerprint className="inline h-4 w-4 mr-1" />
                    Right Prints
                  </Label>
                  <Input
                    id="max_right_fingerprints"
                    type="number"
                    {...registerCycle("max_right_fingerprints", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_student"
                  onCheckedChange={(checked) => setCycleValue("is_student", checked)}
                />
                <Label htmlFor="is_student" className="font-normal cursor-pointer">
                  Student Distribution
                </Label>
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={handleBack} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button type="submit" disabled={isLoading} className="gap-2">
                  {isLoading ? "Creating..." : "Create Project"}
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
