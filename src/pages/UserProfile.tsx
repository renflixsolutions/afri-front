import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReactSelect from 'react-select';
import {
  ArrowLeft, 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Lock, 
  RotateCcw, 
  CheckCircle, 
  XCircle,
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { userService } from '@/services/api/UserService';
import { User, AuditTrail, UserRole } from '@/types/users';
import { useToast } from '@/hooks/use-toast';


export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'resetPassword' | 'lockAccount' | 'deactivate' | null>(null);
  const [auditPage, setAuditPage] = useState(1);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    role_id: 0,
  });
  const [rolesLoaded, setRolesLoaded] = useState(false);
  const { toast } = useToast();

  const resetPasswordMutation = useMutation({
    mutationFn: (userId: string) => userService.resetPassword(userId),
    onSuccess: (response: any) => {
      // Extract message from possible response shapes: { message }, { data: { message } }, or fallback.
      const apiMessage = response?.message || response?.data?.message || "Password reset successfully.";
      toast({
        title: "Success",
        description: apiMessage,
      });
      setIsDialogOpen(false);
    },
    onError: (error: unknown) => {
      let errorMessage = "Failed to reset password";

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

  const updateUserMutation = useMutation({
    mutationFn: (data: { userId: string; userData: Partial<{ full_name: string; username: string; email: string; phone: string; address: string; gender: 'male' | 'female' | 'other'; role_id: number }> }) =>
      userService.updateUser(data.userId, data.userData),
    onSuccess: (updatedUser) => {
      toast({
        title: "Success",
        description: "User details updated successfully",
      });
      // Merge the updated user with the existing user data
      setUser(prevUser => prevUser ? { ...prevUser, ...updatedUser } : updatedUser);
      // Update form data with new values
      setFormData({
        full_name: updatedUser.full_name,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        address: updatedUser.address || '',
        role_id: roles.find(r => r.name === updatedUser.role)?.id || 0,
      });
    },
    onError: (error: unknown) => {
      let errorMessage = "Failed to update user";

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

  const updateUserStatusMutation = useMutation({
    mutationFn: ({ userId, action }: { userId: string; action: 'lock' | 'unlock' | 'activate' | 'deactivate' }) =>
      userService.updateUserStatus(userId, action),
    onSuccess: (updatedUser) => {
      const actionMessages = {
        lock: 'Account has been locked successfully.',
        unlock: 'Account has been unlocked successfully.',
        activate: 'Account has been activated successfully.',
        deactivate: 'Account has been deactivated successfully.',
      };

      const action = dialogType === 'lockAccount'
        ? (updatedUser.account_locked ? 'lock' : 'unlock')
        : (updatedUser.inactive ? 'deactivate' : 'activate');

      toast({
        title: "Success",
        description: actionMessages[action],
      });

      // Merge the updated user with the existing user data to preserve role info
      setUser(prevUser => prevUser ? { ...prevUser, ...updatedUser } : updatedUser);
      setIsDialogOpen(false);
    },
    onError: (error: unknown) => {
      let errorMessage = "Failed to update user status";

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

  const { data: auditTrails, isLoading: isLoadingAudit } = useQuery({
    queryKey: ['auditTrails', id, auditPage],
    queryFn: () => userService.getUserAuditTrails(id!, auditPage),
    enabled: activeTab === 'audit' && !!id,
  });

  useEffect(() => {
    // Check if user data was passed through navigation state
    if (location.state?.user) {
      setUser(location.state.user);
      // Set form data after roles are loaded
      if (rolesLoaded) {
        setFormData({
          full_name: location.state.user.full_name,
          username: location.state.user.username,
          email: location.state.user.email,
          phone: location.state.user.phone || '',
          address: location.state.user.address || '',
          role_id: roles.find(r => r.name === location.state.user.role)?.id || 0,
        });
      }
      setLoading(false);
    } else if (id) {
      loadUserProfile();
    }
  }, [id, location.state, rolesLoaded]);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.listUsers(1);
      const userMember = response.data.find(u => u.id === id);
      if (userMember) {
        setUser(userMember);
        setFormData({
          full_name: userMember.full_name,
          username: userMember.username,
          email: userMember.email,
          phone: userMember.phone || '',
          address: userMember.address || '',
          role_id: roles.find(r => r.name === userMember.role)?.id || 0,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load user profile. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await userService.getRoles();
      setRoles(response as any);
      setRolesLoaded(true);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'default';
      case 'user':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDialogOpen = (type: 'resetPassword' | 'lockAccount' | 'deactivate') => {
    setDialogType(type);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setDialogType(null);
  };

  const handleConfirm = () => {
    if (!user) return;

    if (dialogType === 'resetPassword') {
      resetPasswordMutation.mutate(user.id);
    } else if (dialogType === 'lockAccount') {
      const action = user.account_locked ? 'unlock' : 'lock';
      updateUserStatusMutation.mutate({ userId: user.id, action });
    } else if (dialogType === 'deactivate') {
      const action = user.inactive ? 'activate' : 'deactivate';
      updateUserStatusMutation.mutate({ userId: user.id, action });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="text-center py-12">
          <UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">User not found</h3>
          <p className="text-muted-foreground mb-6">The user you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/system-users')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to System Users
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-6 bg-gradient-to-br from-background via-background to-muted/30 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/system-users')}
            className="hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:shadow-lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to System Users
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              User Profile
            </h1>
            <p className="text-muted-foreground">Manage system user details and permissions</p>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <Card className="overflow-hidden border-0 shadow-elevated animate-scale-in bg-gradient-to-br from-card via-card to-muted/5 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5"></div>
        <CardContent className="relative pt-8 pb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full opacity-30 group-hover:opacity-50 blur transition-all duration-300"></div>
                <Avatar className="relative h-24 w-24 border-2 border-white shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold text-xl">
                    {getInitials(user.full_name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="space-y-3">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">{user.full_name}</h2>
                  <p className="text-muted-foreground font-medium">@{user.username}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge 
                    variant={getRoleBadgeVariant(user.role)}
                    className="px-3 py-1 font-medium shadow-sm"
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {user.role}
                  </Badge>
                  {!user.inactive && !user.account_locked && (
                    <Badge className="bg-success/10 text-success border-success/20 px-3 py-1 font-medium">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                  {user.account_locked ? (
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20 px-3 py-1 font-medium">
                      <Lock className="h-3 w-3 mr-1" />
                      Locked
                    </Badge>
                  ) : null}
                  {user.inactive ? (
                    <Badge className="bg-orange-100 text-orange-700 border-orange-300 px-3 py-1 font-medium">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>
            
            <div className="flex-1"></div>
            
            <div className="flex flex-wrap gap-3 lg:flex-col lg:w-auto">
              <Button 
                variant="outline" 
                size="sm"
                className="group hover:bg-warning hover:text-warning-foreground hover:border-warning transition-all duration-300 hover:shadow-md"
                onClick={() => handleDialogOpen('resetPassword')}
                disabled={resetPasswordMutation.isPending}
              >
                <RotateCcw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-300" />
                Reset Password
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="group hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-300 hover:shadow-md"
                onClick={() => handleDialogOpen('lockAccount')}
                disabled={updateUserStatusMutation.isPending}
              >
                <Lock className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                {user.account_locked ? 'Unlock Account' : 'Lock Account'}
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className="group hover:bg-muted hover:text-muted-foreground transition-all duration-300 hover:shadow-md"
                onClick={() => handleDialogOpen('deactivate')}
                disabled={updateUserStatusMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                {user.inactive ? 'Activate' : 'Deactivate'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-slide-up">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm border shadow-sm h-12">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 font-medium"
          >
            <UserIcon className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="profile" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 font-medium"
          >
            <Shield className="h-4 w-4 mr-2" />
            Update Profile
          </TabsTrigger>
          <TabsTrigger 
            value="audit" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 font-medium"
          >
            <Activity className="h-4 w-4 mr-2" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 animate-fade-in">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="group hover:shadow-elevated transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <UserIcon className="h-5 w-5 text-primary" />
                  </div>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                    <span className="font-medium">{user.email}</span>
                  </div>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200">
                    <div className="p-2 bg-secondary/10 rounded-full">
                      <Phone className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                      <span className="font-medium">{user.phone}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200">
                  <div className="p-2 bg-accent/10 rounded-full">
                    <MapPin className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <span className="font-medium">
                      {user.location && user.sub_location 
                        ? `${user.location}, ${user.sub_location}`
                        : ''
                      }
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200">
                  <div className="p-2 bg-muted/30 rounded-full">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Created Date</p>
                    <span className="font-medium">{formatDate(user.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-elevated transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <Shield className="h-5 w-5 text-secondary" />
                  </div>
                  Role & Permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <div className="p-4 rounded-lg border border-border/50 bg-muted/20">
                  <Label className="text-sm font-semibold text-foreground">Role</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant={getRoleBadgeVariant(user.role)} className="px-3 py-1">
                      {user.role}
                    </Badge>
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-border/50 bg-muted/20">
                  <Label className="text-sm font-semibold text-foreground">Access Level</Label>
                  <p className="text-sm text-muted-foreground mt-2">
                    {user.role.toLowerCase() === 'admin' ? 'Full System Access' : 'Limited Access'}
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-border/50 bg-muted/20">
                  <Label className="text-sm font-semibold text-foreground">Account Status</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-success/10 text-success border-success/20 px-3 py-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active & Verified
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="space-y-8 animate-fade-in">
          <Card className="border-0 shadow-elevated bg-gradient-to-br from-card to-card/90 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <UserIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Update Profile Information</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Modify user details and contact information</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="fullName" className="text-sm font-semibold">Full Name</Label>
                  <Input 
                    id="fullName" 
                    value={formData.full_name}
                    className="bg-muted/30 border-border/50 focus:bg-background transition-colors duration-200"
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="username" className="text-sm font-semibold">
                    Username
                    <span className="text-xs text-muted-foreground ml-2">(Read-only)</span>
                  </Label>
                  <Input
                    id="username" 
                    value={formData.username}
                    className="bg-muted/50 border-border/50 cursor-not-allowed"
                    readOnly
                    disabled
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email}
                    className="bg-muted/30 border-border/50 focus:bg-background transition-colors duration-200"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone}
                    className="bg-muted/30 border-border/50 focus:bg-background transition-colors duration-200"
                    placeholder="Enter phone number"
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="role" className="text-sm font-semibold">Role</Label>
                  <Select
                    value={roles.find(r => r.id === formData.role_id)?.name || ''}
                    onValueChange={(value) => { const role = roles.find(r => r.name === value); setFormData({...formData, role_id: role?.id || 0}) }}
                  >
                    <SelectTrigger className="bg-muted/30 border-border/50 focus:bg-background transition-colors duration-200">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="address" className="text-sm font-semibold">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    className="resize-none bg-muted/30 border-border/50 focus:bg-background transition-colors duration-200"
                    placeholder="Enter address"
                    rows={3}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                <Button
                  variant="outline"
                  className="hover:bg-muted transition-colors duration-200"
                  onClick={() => {
                    // Reset form to original user data
                    if (user) {
                      setFormData({
                        full_name: user.full_name,
                        username: user.username,
                        email: user.email,
                        phone: user.phone || '',
                        address: user.address || '',
                        role_id: user.role_id || 0,
                      });
                    }
                  }}
                >
                  Cancel Changes
                </Button>
                <Button
                  className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300"
                  onClick={() => updateUserMutation.mutate({ userId: user.id, userData: formData })}
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-8 animate-fade-in">
          <Card className="border-0 shadow-elevated bg-gradient-to-br from-card to-card/90 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-6 bg-gradient-to-r from-muted/20 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Activity className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-xl">Activity & Audit Trail</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Track user actions and security events</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-border/50">
                      <TableHead className="font-semibold">Activity Type</TableHead>
                      <TableHead className="font-semibold">Description</TableHead>
                      <TableHead className="font-semibold">Channel</TableHead>
                      <TableHead className="font-semibold">IP Address</TableHead>
                      <TableHead className="font-semibold">Date & Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingAudit ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          <div className="flex items-center justify-center gap-2">
                            <RotateCcw className="h-4 w-4 animate-spin" />
                            Loading audit trails...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : auditTrails?.data.length === 0 || !auditTrails?.data ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No audit trails found for this user.
                        </TableCell>
                      </TableRow>
                    ) : (
                      auditTrails.data.map((trail: AuditTrail) => (
                        <TableRow key={trail.id} className="hover:bg-muted/30 transition-colors duration-200">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                trail.type.toLowerCase().includes('login') ? 'bg-success' : 
                                trail.type.toLowerCase().includes('update') || trail.type.toLowerCase().includes('edit') ? 'bg-primary' : 
                                trail.type.toLowerCase().includes('delete') ? 'bg-destructive' :
                                'bg-warning'
                              }`}></div>
                              <span className="font-medium">{trail.type}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground max-w-md">{trail.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {trail.channel}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{trail.ip_address}</TableCell>
                          <TableCell className="whitespace-nowrap">{formatDate(trail.created_at)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination for audit trails */}
              {auditTrails && auditTrails.total > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAuditPage(prev => Math.max(prev - 1, 1))}
                    disabled={auditPage === 1}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {auditTrails.current_page} of {auditTrails.last_page}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAuditPage(prev => Math.min(prev + 1, auditTrails.last_page))}
                    disabled={auditPage === auditTrails.last_page}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              {dialogType === 'resetPassword' && (
                <div className="p-3 bg-warning/10 rounded-full">
                  <RotateCcw className="h-6 w-6 text-warning" />
                </div>
              )}
              {dialogType === 'lockAccount' && (
                <div className="p-3 bg-destructive/10 rounded-full">
                  <Lock className="h-6 w-6 text-destructive" />
                </div>
              )}
              {dialogType === 'deactivate' && (
                <div className="p-3 bg-muted rounded-full">
                  <XCircle className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div>
                <DialogTitle className="text-xl font-bold">
                  {dialogType === 'resetPassword' && 'Reset Password'}
                  {dialogType === 'lockAccount' && (user?.account_locked ? 'Unlock Account' : 'Lock Account')}
                  {dialogType === 'deactivate' && (user?.inactive ? 'Activate Account' : 'Deactivate Account')}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  {user?.full_name} (@{user?.username})
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-sm text-foreground leading-relaxed">
                {dialogType === 'resetPassword' && (
                  <>
                    Are you sure you want to <strong>reset the password</strong> for this user?
                    <br /><br />
                    A password reset email will be sent to <strong>{user?.email}</strong>,
                    allowing the user to set a new password.
                  </>
                )}
                {dialogType === 'lockAccount' && (
                  user?.account_locked ? (
                    <>
                      Are you sure you want to <strong>unlock this account</strong>?
                      <br /><br />
                      The user will be able to log in again once the account is unlocked.
                    </>
                  ) : (
                    <>
                      Are you sure you want to <strong>lock this account</strong>?
                      <br /><br />
                      The user will not be able to log in until the account is manually unlocked by an administrator.
                    </>
                  )
                )}
                {dialogType === 'deactivate' && (
                  user?.inactive ? (
                    <>
                      Are you sure you want to <strong>activate this account</strong>?
                      <br /><br />
                      The user will regain full access to the system.
                    </>
                  ) : (
                    <>
                      Are you sure you want to <strong>deactivate this account</strong>?
                      <br /><br />
                      The user will immediately lose all access to the system. This action can be reversed by reactivating the account.
                    </>
                  )
                )}
              </p>
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-3">
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={handleDialogClose}
              disabled={resetPasswordMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant={dialogType === 'resetPassword' ? 'default' : 'destructive'}
              className="flex-1 sm:flex-none"
              onClick={handleConfirm}
              disabled={resetPasswordMutation.isPending || updateUserStatusMutation.isPending}
            >
              {(resetPasswordMutation.isPending || updateUserStatusMutation.isPending) && <RotateCcw className="h-4 w-4 mr-2 animate-spin" />}
              {dialogType === 'resetPassword' && 'Confirm Reset'}
              {dialogType === 'lockAccount' && (user?.account_locked ? 'Confirm Unlock' : 'Confirm Lock')}
              {dialogType === 'deactivate' && (user?.inactive ? 'Confirm Activate' : 'Confirm Deactivate')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
