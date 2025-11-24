import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// Add missing icon imports from lucide-react
import {
  Search,
  Calendar,
  Plus,
  GraduationCap,
  Languages,
  Bell,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Briefcase,
} from "lucide-react";

const DashboardLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handler = () => {
      navigate("/dashboard/no-permission", { replace: true });
    };
    window.addEventListener("app:navigate-no-permission", handler);
    return () => window.removeEventListener("app:navigate-no-permission", handler);
  }, [navigate]);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/30">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          {/* Enhanced Top Navigation Bar */}
          <header className="border-b border-gray-200/70 bg-white/98 backdrop-blur-xl shadow-md sticky top-0 z-50">
            {/* Main Header Row */}
            <div className="h-16 flex items-center justify-between px-6 gap-6">
              {/* Left Section - Menu Toggle & Search Bar */}
              <div className="flex items-center gap-4 flex-1 max-w-xl">
                <SidebarTrigger className="h-9 w-9 hover:bg-[#2f318f]/10 hover:text-[#2f318f] transition-all duration-300 rounded-lg" />

                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search jobs, scholarships, language courses..."
                    className="pl-10 h-10 bg-gray-50 border-gray-300 focus:bg-white focus:border-[#2f318f] focus:ring-2 focus:ring-[#2f318f]/20 transition-all w-full"
                  />
                </div>
              </div>

              {/* Right Section - Actions & Profile */}
              <div className="flex items-center gap-3 flex-1 justify-end">
                {/* Date & Time */}
                <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#2f318f]/5 to-[#ff8b19]/5 rounded-lg border border-gray-200">
                  <Calendar className="h-4 w-4 text-[#2f318f]" />
                  <span className="text-sm font-medium text-gray-700">
                    {currentTime.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">
                    {currentTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {/* Quick Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      className="h-9 gap-2 bg-gradient-to-r from-[#2f318f] to-[#2f318f]/90 hover:from-[#2f318f]/90 hover:to-[#2f318f]/80 text-white shadow-md hover:shadow-lg transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Quick Add</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="text-[#2f318f] font-semibold">Quick Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/jobs')} className="cursor-pointer">
                      <Briefcase className="h-4 w-4 mr-2 text-[#2f318f]" />
                      Add Job
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/scholarships')} className="cursor-pointer">
                      <GraduationCap className="h-4 w-4 mr-2 text-[#2f318f]" />
                      Add Scholarship
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/language-courses')} className="cursor-pointer">
                      <Languages className="h-4 w-4 mr-2 text-[#2f318f]" />
                      Add Language Course
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0 hover:bg-[#ff8b19]/10 hover:text-[#ff8b19] transition-all">
                      <Bell className="h-5 w-5" />
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-[#ff8b19] hover:bg-[#ff8b19] border-2 border-white">
                        3
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel className="text-[#2f318f] font-semibold">Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="max-h-96 overflow-y-auto">
                      <DropdownMenuItem className="cursor-pointer py-3">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium">New job application</p>
                          <p className="text-xs text-gray-500">Sarah Johnson applied for Software Developer</p>
                          <p className="text-xs text-gray-400">5 minutes ago</p>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer py-3">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium">Scholarship approved</p>
                          <p className="text-xs text-gray-500">Michael Omondi accepted for Study Abroad Program</p>
                          <p className="text-xs text-gray-400">1 hour ago</p>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer py-3">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium">New language course enrolled</p>
                          <p className="text-xs text-gray-500">15 students enrolled in German Language Course</p>
                          <p className="text-xs text-gray-400">2 hours ago</p>
                        </div>
                      </DropdownMenuItem>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer justify-center text-[#2f318f] font-medium">
                      View all notifications
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 gap-2 px-2 hover:bg-gradient-to-r hover:from-[#2f318f]/10 hover:to-[#ff8b19]/10 transition-all rounded-lg">
                      <Avatar className="h-8 w-8 ring-2 ring-[#ff8b19]/30">
                        <AvatarFallback className="bg-gradient-to-br from-[#2f318f] to-[#ff8b19] text-white text-sm font-bold">
                          {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-semibold text-gray-800">{user?.name || 'User'}</span>
                        <span className="text-xs text-gray-500">Admin</span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex items-center gap-3 py-2">
                        <Avatar className="h-12 w-12 ring-2 ring-[#ff8b19]/30">
                          <AvatarFallback className="bg-gradient-to-br from-[#2f318f] to-[#ff8b19] text-white font-bold">
                            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-semibold leading-none">{user?.name || 'User'}</p>
                          <p className="text-xs leading-none text-gray-500">{user?.username || 'username'}</p>
                          <Badge className="w-fit mt-1 bg-[#2f318f]/10 text-[#2f318f] hover:bg-[#2f318f]/20">
                            Admin
                          </Badge>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                      <User className="h-4 w-4 mr-2 text-[#2f318f]" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2 text-[#2f318f]" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open('#', '_blank')} className="cursor-pointer">
                      <HelpCircle className="h-4 w-4 mr-2 text-[#2f318f]" />
                      Help & Support
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content with proper overflow */}
          <main className="flex-1 overflow-auto bg-background">
            <div className="h-full">
              <Outlet />
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-border/40 bg-white/95 backdrop-blur-xl">
            <div className="px-6 py-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} <span className="font-semibold text-foreground">Afrithrive Global Service Ltd</span>. All rights reserved.
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    About Us
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    Support
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
