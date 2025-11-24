import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import ReactSelect from "react-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { staffService } from "@/services/api/StaffService";
import { RegionService } from "@/services/api/RegionService";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Eye, EyeOff, User, Mail, Lock, Phone, MapPin, Users } from "lucide-react";
import { Country, RegionLocation, SubLocation } from "@/types/regions";
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z.object({
  full_name: z.string().min(1, "Full name is required").max(255),
  username: z.string().min(1, "Username is required").max(20),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  password: z.string().min(4, "Password must be at least 6 characters"),
  password_confirmation: z.string().min(4, "Password confirmation is required"),
  phone: z.string().max(15).optional().or(z.literal("")),
  address: z.string().max(255).optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).optional(),
  country_name: z.string().min(1, "Country is required"),
  location_name: z.string().min(1, "Location is required"),
  sub_location_name: z.string().min(1, "Sub-location is required"),
  role_id: z.string().min(1, "Role is required"),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

type FormData = z.infer<typeof formSchema>;

interface AddStaffDialogProps {
  children?: React.ReactNode;
  onStaffAdded?: () => void;
}

export default function AddStaffDialog({ children, onStaffAdded }: AddStaffDialogProps) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [locations, setLocations] = useState<RegionLocation[]>([]);
  const [subLocations, setSubLocations] = useState<SubLocation[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingSubLocations, setLoadingSubLocations] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState("");
  const [locationSearchTerm, setLocationSearchTerm] = useState("");
  const [subLocationSearchTerm, setSubLocationSearchTerm] = useState("");
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    control,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      username: "",
      email: "",
      password: "",
      password_confirmation: "",
      phone: "",
      address: "",
      gender: undefined,
      country_name: "",
      location_name: "",
      sub_location_name: "",
      role_id: "",
    },
  });

  const countryName = watch("country_name");
  const locationName = watch("location_name");

  // Update selectedCountryId when country name changes
  useEffect(() => {
    if (countryName) {
      const country = countries.find(c => c.name === countryName);
      if (country) {
        setSelectedCountryId(country.id);
      }
    } else {
      setSelectedCountryId("");
      // Clear dependent fields when country is cleared
      setValue("location_name", "");
      setValue("sub_location_name", "");
    }
  }, [countryName, countries, setValue]);

  // Update selectedLocationId when location name changes
  useEffect(() => {
    if (locationName) {
      const location = locations.find(l => l.name === locationName);
      if (location) {
        setSelectedLocationId(location.id);
      }
    } else {
      setSelectedLocationId("");
      // Clear dependent field when location is cleared
      setValue("sub_location_name", "");
    }
  }, [locationName, locations, setValue]);

  // Load/search countries with debouncing
  useEffect(() => {
    const loadCountries = async () => {
      const regionService = new RegionService();
      try {
        setLoadingCountries(true);
        const response = countrySearchTerm
          ? await regionService.searchCountries(countrySearchTerm, 1)
          : await regionService.listCountries(1);
        setCountries(response.data || []);
      } catch (error) {
        console.error('Failed to load countries:', error);
        toast({
          title: "Error",
          description: "Failed to load countries",
          variant: "destructive",
        });
      } finally {
        setLoadingCountries(false);
      }
    };

    if (open) {
      const timeoutId = setTimeout(() => {
        loadCountries();
      }, 300); // Debounce for 300ms

      return () => clearTimeout(timeoutId);
    }
  }, [open, countrySearchTerm, toast]);

  // Load staff roles when dialog opens
  useEffect(() => {
    const loadRoles = async () => {
      try {
        setLoadingRoles(true);
        const rolesData = await staffService.listStaffRoles();
        setRoles(rolesData);
      } catch (error) {
        console.error('Failed to load staff roles:', error);
        toast({
          title: "Error",
          description: "Failed to load staff roles",
          variant: "destructive",
        });
      } finally {
        setLoadingRoles(false);
      }
    };

    if (open) {
      loadRoles();
    }
  }, [open, toast]);

  // Load/search locations when country changes or search term changes
  useEffect(() => {
    const loadLocations = async () => {
      if (!selectedCountryId) {
        setLocations([]);
        return;
      }

      const regionService = new RegionService();
      try {
        setLoadingLocations(true);
        const response = locationSearchTerm
          ? await regionService.searchLocations(selectedCountryId, locationSearchTerm, 1)
          : await regionService.listLocations(selectedCountryId, 1);
        setLocations(response.data || []);
      } catch (error) {
        console.error('Failed to load locations:', error);
        toast({
          title: "Error",
          description: "Failed to load locations",
          variant: "destructive",
        });
      } finally {
        setLoadingLocations(false);
      }
    };

    if (selectedCountryId) {
      const timeoutId = setTimeout(() => {
        loadLocations();
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      // Clear locations and dependent fields when no country selected
      setLocations([]);
      setValue("location_name", "");
      setValue("sub_location_name", "");
    }
  }, [selectedCountryId, locationSearchTerm, setValue, toast]);

  // Load/search sub-locations when location changes or search term changes
  useEffect(() => {
    const loadSubLocations = async () => {
      if (!selectedLocationId) {
        setSubLocations([]);
        return;
      }

      const regionService = new RegionService();
      try {
        setLoadingSubLocations(true);
        const response = subLocationSearchTerm
          ? await regionService.searchSubLocations(selectedLocationId, subLocationSearchTerm, 1)
          : await regionService.listSubLocations(selectedLocationId, 1);
        setSubLocations(response.data || []);
      } catch (error) {
        console.error('Failed to load sub-locations:', error);
        toast({
          title: "Error",
          description: "Failed to load sub-locations",
          variant: "destructive",
        });
      } finally {
        setLoadingSubLocations(false);
      }
    };

    if (selectedLocationId) {
      const timeoutId = setTimeout(() => {
        loadSubLocations();
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      // Clear sub-locations when no location selected
      setSubLocations([]);
      setValue("sub_location_name", "");
    }
  }, [selectedLocationId, subLocationSearchTerm, setValue, toast]);

  const createMutation = useMutation({
    mutationFn: (data: FormData) => {
      // Convert names to IDs for submission
      const country = countries.find(c => c.name === data.country_name);
      const location = locations.find(l => l.name === data.location_name);
      const subLocation = subLocations.find(s => s.name === data.sub_location_name);

      if (!country || !location || !subLocation) {
        throw new Error("Invalid location data");
      }

      const staffData = {
        full_name: data.full_name,
        username: data.username,
        email: data.email || undefined,
        password: data.password,
        password_confirmation: data.password_confirmation,
        phone: data.phone || undefined,
        address: data.address || undefined,
        gender: data.gender,
        country_id: country.id,
        location_id: location.id,
        sub_location_id: subLocation.id,
        role_id: data.role_id,
      };
      return staffService.createStaff(staffData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast({
        title: "Success",
        description: "Staff member created successfully",
      });
      setOpen(false);
      reset();
      setSelectedCountryId("");
      setSelectedLocationId("");
      onStaffAdded?.();
    },
    onError: (error: any) => {
      // Display the actual API error message
      const errorMessage = error?.response?.data?.message || error?.message || "An unexpected error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-visible">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5 text-primary" />
            Add New Staff Member
          </DialogTitle>
          <DialogDescription>
            Enter staff details to create a new team member account
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-10rem)] pr-6 overflow-visible">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-1 pb-2">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <User className="h-4 w-4" />
                Basic Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    placeholder="Enter full name"
                    {...register("full_name")}
                  />
                  {errors.full_name && (
                    <p className="text-sm text-destructive">{errors.full_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">
                    Username <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    maxLength={20}
                    {...register("username")}
                  />
                  {errors.username && (
                    <p className="text-sm text-destructive">{errors.username.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="inline h-3.5 w-3.5 mr-1" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="inline h-3.5 w-3.5 mr-1" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    maxLength={15}
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Security
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 6 characters"
                      {...register("password")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirmation">
                    Confirm Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password_confirmation"
                      type={showPasswordConfirm ? "text" : "password"}
                      placeholder="Re-enter password"
                      {...register("password_confirmation")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    >
                      {showPasswordConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password_confirmation && (
                    <p className="text-sm text-destructive">{errors.password_confirmation.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location & Role
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={watch("gender")}
                    onValueChange={(value) => setValue("gender", value as "male" | "female" | "other")}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-sm text-destructive">{errors.gender.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role_id">
                    <Users className="inline h-3.5 w-3.5 mr-1" />
                    Role <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={watch("role_id")}
                    onValueChange={(value) => setValue("role_id", value)}
                  >
                    <SelectTrigger id="role_id">
                      <SelectValue placeholder="Select staff role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role_id && (
                    <p className="text-sm text-destructive">{errors.role_id.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  <MapPin className="inline h-3.5 w-3.5 mr-1" />
                  Address
                </Label>
                <Input
                  id="address"
                  placeholder="Enter physical address"
                  maxLength={255}
                  {...register("address")}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country_id">
                    Country <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="country_name"
                    control={control}
                    render={({ field }) => (
                      <ReactSelect
                        {...field}
                        options={countries.map(c => ({
                          value: c.name,
                          label: c.name,
                        }))}
                        value={
                          field.value
                            ? { value: field.value, label: field.value }
                            : null
                        }
                        onChange={(option) => {
                          field.onChange(option?.value || "");
                        }}
                        onInputChange={(value) => {
                          setCountrySearchTerm(value);
                        }}
                        isLoading={loadingCountries}
                        placeholder="Search or select country"
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
                          menu: (base) => ({
                            ...base,
                            zIndex: 9999,
                            position: 'absolute'
                          }),
                        }}
                      />
                    )}
                  />
                  {errors.country_name && (
                    <p className="text-sm text-destructive">{errors.country_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location_id">
                    Location <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="location_name"
                    control={control}
                    render={({ field }) => (
                      <ReactSelect
                        {...field}
                        options={locations.map(loc => ({ value: loc.name, label: loc.name }))}
                        value={
                          field.value
                            ? { value: field.value, label: field.value }
                            : null
                        }
                        onChange={(option) => field.onChange(option?.value || "")}
                        onInputChange={(value) => {
                          setLocationSearchTerm(value);
                        }}
                        isLoading={loadingLocations}
                        placeholder={selectedCountryId ? "Search or select location" : "Select country first"}
                        isClearable
                        isDisabled={!selectedCountryId}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{
                          control: (base) => ({
                            ...base,
                            minHeight: '40px',
                            borderColor: 'hsl(var(--input))',
                            '&:hover': { borderColor: 'hsl(var(--input))' }
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 9999,
                            position: 'absolute'
                          }),
                        }}
                      />
                    )}
                  />
                  {errors.location_name && (
                    <p className="text-sm text-destructive">{errors.location_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sub_location_id">
                    Sub-Location <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="sub_location_name"
                    control={control}
                    render={({ field }) => (
                      <ReactSelect
                        {...field}
                        options={subLocations.map(sub => ({ value: sub.name, label: sub.name }))}
                        value={
                          field.value
                            ? { value: field.value, label: field.value }
                            : null
                        }
                        onChange={(option) => field.onChange(option?.value || "")}
                        onInputChange={(value) => {
                          setSubLocationSearchTerm(value);
                        }}
                        isLoading={loadingSubLocations}
                        placeholder={selectedLocationId ? "Search or select sub-location" : "Select location first"}
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
                          menu: (base) => ({
                            ...base,
                            zIndex: 9999,
                            position: 'absolute'
                          }),
                        }}
                      />
                    )}
                  />
                  {errors.sub_location_name && (
                    <p className="text-sm text-destructive">{errors.sub_location_name.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Staff Member"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
