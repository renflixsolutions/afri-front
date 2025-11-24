import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { userService } from "@/services/api/UserService";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, User, Mail, Phone, MapPin, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z.object({
  full_name: z.string().min(1, "Full name is required").max(255),
  username: z.string().min(1, "Username is required").max(20),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(15).optional().or(z.literal("")),
  address: z.string().max(255).optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).optional(),
  role_id: z.string().min(1, "Role is required"), // Changed to string to match API
});

type FormData = z.infer<typeof formSchema>;

interface AddUserDialogProps {
  children?: React.ReactNode;
}

interface Role {
  id: string;
  name: string;
}

export default function AddUserDialog({ children }: AddUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      username: "",
      email: "",
      phone: "",
      address: "",
      gender: undefined,
      role_id: undefined,
    },
  });

  // Load roles when dialog opens
  useEffect(() => {
    const loadRoles = async () => {
      try {
        setLoadingRoles(true);
        console.log('Loading roles...');
        const response = await userService.getRoles();
        console.log('Roles response:', response);
        setRoles(response || []);
      } catch (error) {
        console.error('Failed to load roles:', error);
        toast({
          title: "Error",
          description: "Failed to load roles",
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

  const createMutation = useMutation({
    mutationFn: (data: FormData) => {
      const userData = {
        full_name: data.full_name,
        username: data.username,
        role_id: data.role_id,
        ...(data.email && { email: data.email }),
        ...(data.phone && { phone: data.phone }),
        ...(data.address && { address: data.address }),
        ...(data.gender && { gender: data.gender }),
      };
      return userService.createUser(userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Success",
        description: "User created successfully",
      });
      setOpen(false);
      reset();
    },
    onError: (error: unknown) => {
      // Extract API error message
      let errorMessage = "Failed to create user";

      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response?: { data?: { message?: string } } }).response;
        errorMessage = response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

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
            Add User
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5 text-primary" />
            Add New System User
          </DialogTitle>
          <DialogDescription>
            Enter user details to create a new system account
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-10rem)] pr-6">
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

            {/* Additional Details Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Additional Details
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
                      <SelectValue placeholder="Select user role" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingRoles ? (
                        <SelectItem value="loading" disabled>
                          Loading roles...
                        </SelectItem>
                      ) : roles.length > 0 ? (
                        roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No roles available
                        </SelectItem>
                      )}
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
                {createMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
