import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  User,
  MapPin,
  Shield,
  Lock,
  Bell,
  Globe,
  CheckCircle,
  Calendar,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiService from '../services/ApiService';
import { useAuth } from '@/hooks/useAuth';

export default function Profile() {
  const { toast } = useToast();
  const authState = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    username: '',
    role: '',
    department: '',
    location: '',
    timezone: 'Africa/Nairobi (EAT)',
    language: 'English',
    joinDate: '',
    lastLogin: '',
  });

  // Load user data from auth state
  useEffect(() => {
    if (authState.user) {
      setProfileData({
        fullName: authState.user.name || '',
        email: authState.user.email || '',
        phone: authState.user.phone || '',
        username: authState.user.username || '',
        role: authState.user.role_name || '',
        department: authState.user.role_name || '',
        location: authState.user.countries?.map(c => c.name).join(', ') || '',
        timezone: 'Africa/Nairobi (EAT)',
        language: 'English',
        joinDate: authState.user.created_at ? new Date(authState.user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
        lastLogin: authState.user.last_login ? new Date(authState.user.last_login).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
      });
    }
  }, [authState.user]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Current password is required",
      });
      return;
    }

    if (!passwordData.newPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New password is required",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New passwords don't match",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 6 characters long",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      // Use authenticated API call with proper headers
      const token = localStorage.getItem('access_token') || '';
      const response = await apiService.post('auth/change-password', {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        new_password_confirmation: passwordData.confirmPassword,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status) {
        toast({
          title: "Success",
          description: response.data.message || "Password changed successfully",
        });

        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.data.message || "Failed to change password",
        });
      }
    } catch (error: any) {
      let errorMessage = "Failed to change password";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex-1 space-y-8 p-6 bg-gradient-to-br from-background via-background to-muted/30 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-muted-foreground mt-1">View your account information and manage security settings</p>
        </div>
        <Badge className="bg-success/10 text-success border-success/20 px-4 py-2">
          <CheckCircle className="h-4 w-4 mr-2" />
          Active Account
        </Badge>
      </div>

      {/* Profile Header Card */}
      <Card className="overflow-hidden border-0 shadow-elevated animate-scale-in bg-gradient-to-br from-card via-card to-muted/5 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5"></div>
        <CardContent className="relative pt-8 pb-8">
          <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full opacity-30 group-hover:opacity-50 blur transition-all duration-300"></div>
              <Avatar className="relative h-32 w-32 border-4 border-white shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold text-4xl">
                  {getInitials(profileData.fullName)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-foreground mb-2">{profileData.fullName || 'User'}</h2>
              <p className="text-lg text-muted-foreground mb-1">{profileData.email}</p>
              <p className="text-sm text-muted-foreground mb-4">@{profileData.username}</p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Badge variant="default" className="px-4 py-2">
                  <Shield className="h-4 w-4 mr-2" />
                  {profileData.role || 'User'}
                </Badge>
                {profileData.location && (
                  <Badge variant="outline" className="px-4 py-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    {profileData.location}
                  </Badge>
                )}
                {profileData.joinDate && (
                  <Badge variant="outline" className="px-4 py-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    Joined {profileData.joinDate}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-slide-up">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm border shadow-sm h-12">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 font-medium"
          >
            <User className="h-4 w-4 mr-2" />
            Profile Information
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 font-medium"
          >
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 font-medium"
          >
            <Bell className="h-4 w-4 mr-2" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 animate-fade-in">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card className="border-0 shadow-elevated bg-gradient-to-br from-card to-card/90">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  Personal Information
                </CardTitle>
                <CardDescription>Your personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    disabled
                    className="bg-muted/50 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profileData.username}
                    disabled
                    className="bg-muted/50 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="bg-muted/50 cursor-not-allowed"
                  />
                </div>
                {profileData.phone && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      disabled
                      className="bg-muted/50 cursor-not-allowed"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Work Information */}
            <Card className="border-0 shadow-elevated bg-gradient-to-br from-card to-card/90">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <Shield className="h-5 w-5 text-secondary" />
                  </div>
                  Work Information
                </CardTitle>
                <CardDescription>Your role and department details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={profileData.role}
                    disabled
                    className="bg-muted/50 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">Role is managed by system administrators</p>
                </div>
                {profileData.location && (
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      disabled
                      className="bg-muted/50 cursor-not-allowed"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Activity */}
            <Card className="border-0 shadow-elevated bg-gradient-to-br from-card to-card/90 md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Clock className="h-5 w-5 text-accent" />
                  </div>
                  Account Activity
                </CardTitle>
                <CardDescription>Recent account activity and login information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {profileData.joinDate && (
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                      <div className="p-3 bg-success/10 rounded-full">
                        <Calendar className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Member Since</p>
                        <p className="font-semibold">{profileData.joinDate}</p>
                      </div>
                    </div>
                  )}
                  {profileData.lastLogin && (
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Login</p>
                        <p className="font-semibold">{profileData.lastLogin}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                    <div className="p-3 bg-secondary/10 rounded-full">
                      <CheckCircle className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Account Status</p>
                      <p className="font-semibold text-success">Active</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 animate-fade-in">
          <Card className="border-0 shadow-elevated bg-gradient-to-br from-card to-card/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                Change Password
              </CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-2xl">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="bg-muted/30"
                />
              </div>
              <Button onClick={handleChangePassword} className="gap-2" loading={isChangingPassword}>
                <Lock className="h-4 w-4" />
                Change Password
              </Button>
            </CardContent>
          </Card>

          {/*<Card className="border-0 shadow-elevated bg-gradient-to-br from-card to-card/90">*/}
          {/*  <CardHeader>*/}
          {/*    <CardTitle className="flex items-center gap-3">*/}
          {/*      <div className="p-2 bg-secondary/10 rounded-lg">*/}
          {/*        <Shield className="h-5 w-5 text-secondary" />*/}
          {/*      </div>*/}
          {/*      Two-Factor Authentication*/}
          {/*    </CardTitle>*/}
          {/*    <CardDescription>Add an extra layer of security to your account</CardDescription>*/}
          {/*  </CardHeader>*/}
          {/*  <CardContent>*/}
          {/*    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">*/}
          {/*      <div>*/}
          {/*        <p className="font-semibold">Two-Factor Authentication</p>*/}
          {/*        <p className="text-sm text-muted-foreground">Currently disabled</p>*/}
          {/*      </div>*/}
          {/*      <Button variant="outline">Enable 2FA</Button>*/}
          {/*    </div>*/}
          {/*  </CardContent>*/}
          {/*</Card>*/}
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6 animate-fade-in">
          <Card className="border-0 shadow-elevated bg-gradient-to-br from-card to-card/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                Regional Settings
              </CardTitle>
              <CardDescription>Customize your language and timezone preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-2xl">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={profileData.timezone}
                  onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={profileData.language}
                  onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
                  className="bg-muted/30"
                />
              </div>
            </CardContent>
          </Card>

          {/*<Card className="border-0 shadow-elevated bg-gradient-to-br from-card to-card/90">*/}
          {/*  <CardHeader>*/}
          {/*    <CardTitle className="flex items-center gap-3">*/}
          {/*      <div className="p-2 bg-secondary/10 rounded-lg">*/}
          {/*        <Bell className="h-5 w-5 text-secondary" />*/}
          {/*      </div>*/}
          {/*      Notification Preferences*/}
          {/*    </CardTitle>*/}
          {/*    <CardDescription>Manage how you receive notifications</CardDescription>*/}
          {/*  </CardHeader>*/}
          {/*  <CardContent className="space-y-4">*/}
          {/*    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">*/}
          {/*      <div>*/}
          {/*        <p className="font-semibold">Email Notifications</p>*/}
          {/*        <p className="text-sm text-muted-foreground">Receive updates via email</p>*/}
          {/*      </div>*/}
          {/*      <Button variant="outline" size="sm">Configure</Button>*/}
          {/*    </div>*/}
          {/*    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">*/}
          {/*      <div>*/}
          {/*        <p className="font-semibold">SMS Notifications</p>*/}
          {/*        <p className="text-sm text-muted-foreground">Receive updates via SMS</p>*/}
          {/*      </div>*/}
          {/*      <Button variant="outline" size="sm">Configure</Button>*/}
          {/*    </div>*/}
          {/*    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">*/}
          {/*      <div>*/}
          {/*        <p className="font-semibold">In-App Notifications</p>*/}
          {/*        <p className="text-sm text-muted-foreground">Receive notifications in the app</p>*/}
          {/*      </div>*/}
          {/*      <Button variant="outline" size="sm">Configure</Button>*/}
          {/*    </div>*/}
          {/*  </CardContent>*/}
          {/*</Card>*/}
        </TabsContent>
      </Tabs>
    </div>
  );
}
