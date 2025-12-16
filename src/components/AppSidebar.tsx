import {
    LayoutDashboard,
    Users,
    Package,
    MapPin,
    Calculator,
    Shield,
    Smartphone,
    CheckSquare,
    FileSpreadsheet,
    Briefcase,
    GraduationCap,
    FileCheck,
    Award,
    Settings,
    HelpCircle,
    Phone,
    MessageCircle,
    CalendarDays,
    CreditCard
} from "lucide-react";
import {NavLink, useLocation} from "react-router-dom";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
    useSidebar,
} from "@/components/ui/sidebar";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {useAuth} from "@/hooks/useAuth";
import afriLogo from "/images/afrithrive-logo.png";

const generalItems = [
    {title: "Dashboard", url: "/dashboard", icon: LayoutDashboard},
    {title: "Jobs", url: "/jobs", icon: Briefcase},
    {title: "Job Applications", url: "/job-applications", icon: FileCheck},
    {title: "Scholarships", url: "/scholarships", icon: GraduationCap},
    {title: "Scholarship Applications", url: "/scholarship-applications", icon: Award},
    {title: "Language Courses", url: "/language-courses", icon: GraduationCap},
    {title: "Course Timetables", url: "/course-timetables", icon: CalendarDays},
    {title: "Course Fees", url: "/course-fees", icon: CreditCard},
    {title: "Enrollments", url: "/enrollments", icon: Users},
    {title: "Partners", url: "/partners", icon: Users},
    {title: "Payments", url: "/payments", icon: Calculator},
    {title: "Opportunity Requests", url: "/opportunity-requests", icon: FileCheck},
];

const administrationItems = [
    {title: "System Users", url: "/system-users", icon: Users},
    {title: "Roles & Permissions", url: "/roles-permissions", icon: Shield},
    {title: "Settings", url: "/settings", icon: Settings},
];

export function AppSidebar() {
    const {state} = useSidebar();
    const location = useLocation();
    const {user} = useAuth();
    const isCollapsed = state === "collapsed";

    const getLinkClassName = (path: string) => {
        const isActive = location.pathname.startsWith(path);
        return isActive
            ? "bg-[#2f318f] text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
            : "text-gray-700 hover:bg-[#ff8b19] hover:text-white transition-all duration-300 hover:shadow-sm";
    }

    return (
        <Sidebar
            collapsible="icon"
            className="border-r border-gray-200/30 data-[state=open]:w-64 data-[state=collapsed]:w-16 backdrop-blur-sm shadow-lg"
        >
            <SidebarContent className="flex flex-col h-full bg-gradient-to-b from-white to-gray-50">
                {/* Fixed Header with Logo */}
                <SidebarHeader className="px-6 py-6 flex-shrink-0 sticky top-0 bg-white z-10 border-b border-gray-200">
                    <div className="flex items-center justify-center">
                        <img src={afriLogo} alt="Afrithrive"
                             className="w-full h-full object-contain"/>
                    </div>
                </SidebarHeader>

                {/* Scrollable Menu Content */}
                <div
                    className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-blue-200">
                    {/* General Section */}
                    <SidebarGroup className="px-3 mt-3">
                        <SidebarGroupLabel
                            className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 mb-3">
                            General
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="space-y-1">
                                {generalItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild className="h-9 rounded-lg">
                                            <NavLink to={item.url} className={getLinkClassName(item.url)}>
                                                <div className="flex items-center gap-3">
                                                    <item.icon className="h-4 w-4 flex-shrink-0"/>
                                                    {!isCollapsed && <span
                                                        className="text-sm font-medium opacity-100 transition-opacity duration-200">{item.title}</span>}
                                                </div>
                                            </NavLink>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    {/* Administration Section */}
                    <SidebarGroup className="px-3 mt-6">
                        <SidebarGroupLabel
                            className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 mb-3">
                            Administration
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="space-y-1">
                                {administrationItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild className="h-9 rounded-lg">
                                            <NavLink to={item.url} className={getLinkClassName(item.url)}>
                                                <div className="flex items-center gap-3">
                                                    <item.icon className="h-4 w-4 flex-shrink-0"/>
                                                    {!isCollapsed && <span
                                                        className="text-sm font-medium opacity-100 transition-opacity duration-200">{item.title}</span>}
                                                </div>
                                            </NavLink>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </div>

                {/* Fixed Footer */}
                <SidebarFooter className="border-t border-gray-100/50 p-4 flex-shrink-0 bg-gradient-to-br from-gray-50 to-blue-50/30 backdrop-blur-md">
                    {!isCollapsed ? (
                        <div className="bg-gradient-to-br from-[#2f318f] to-[#2f318f]/90 rounded-xl p-3 shadow-lg border border-[#ff8b19]/20">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-8 w-8 rounded-lg bg-[#ff8b19] flex items-center justify-center">
                                    <HelpCircle className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Need Help?</p>
                                    <p className="text-xs text-blue-100">We're here for you</p>
                                </div>
                            </div>

                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full p-3 rounded-lg bg-[#ff8b19] hover:bg-[#ff8b19]/90 transition-all duration-300 group text-center shadow-md hover:shadow-lg"
                            >
                                <p className="text-sm font-bold text-white">Visit Support Center</p>
                                <p className="text-xs text-white/90 mt-0.5">Get help & resources</p>
                            </a>

                            <p className="text-xs text-center text-blue-200 mt-3 italic">
                                Available 24/7 for support
                            </p>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#2f318f] to-[#ff8b19] flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                                title="Need Help? Visit Support Center"
                            >
                                <HelpCircle className="h-5 w-5 text-white" />
                            </a>
                        </div>
                    )}
                </SidebarFooter>
            </SidebarContent>
        </Sidebar>
    );
}
