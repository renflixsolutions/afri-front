import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import UserProfile from "./pages/UserProfile";
import Profile from "./pages/Profile";
import DashboardLayout from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";
import RolesPermissions from "./pages/RolesPermissions";
import NoPermission from "./pages/NoPermission";
import Jobs from "./pages/Jobs";
import JobApplications from "./pages/JobApplications";
import Partners from "./pages/Partners";
import LanguageCourses from "./pages/LanguageCourses";
import Scholarships from "./pages/Scholarships";
import ScholarshipApplications from "./pages/ScholarshipApplications";
import Settings from "./pages/Settings";
import PaymentHistory from "./pages/PaymentHistory";
import OpportunityRequests from "./pages/OpportunityRequests";
import Enrollments from "./pages/Enrollments";
import CourseTimetables from "./pages/CourseTimetables";
import CourseFees from "./pages/CourseFees";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="no-permission" element={<NoPermission />} />
          </Route>
          <Route path="/language-courses" element={<DashboardLayout />}>
            <Route index element={<LanguageCourses />} />
          </Route>
          <Route path="/profile" element={<DashboardLayout />}>
            <Route index element={<Profile />} />
          </Route>
          <Route path="/system-users" element={<DashboardLayout />}>
            <Route index element={<Users />} />
            <Route path=":id" element={<UserProfile />} />
          </Route>
          <Route path="/transactions" element={<DashboardLayout />}>
            <Route index element={<div className="p-6"><h1 className="text-2xl font-bold">Transactions</h1><p className="text-muted-foreground">Track all financial transactions</p></div>} />
          </Route>
          <Route path="/settings" element={<DashboardLayout />}>
            <Route index element={<Settings />} />
          </Route>
          <Route path="/help" element={<DashboardLayout />}>
            <Route index element={<div className="p-6"><h1 className="text-2xl font-bold">Help & Support</h1><p className="text-muted-foreground">Get help and support documentation</p></div>} />
          </Route>
          <Route path="/roles-permissions" element={<DashboardLayout />}>
            <Route index element={<RolesPermissions />} />
          </Route>
          <Route path="/jobs" element={<DashboardLayout />}>
            <Route index element={<Jobs />} />
          </Route>
          <Route path="/job-applications" element={<DashboardLayout />}>
            <Route index element={<JobApplications />} />
          </Route>
          <Route path="/scholarships" element={<DashboardLayout />}>
            <Route index element={<Scholarships />} />
          </Route>
          <Route path="/scholarship-applications" element={<DashboardLayout />}>
            <Route index element={<ScholarshipApplications />} />
          </Route>
          <Route path="/partners" element={<DashboardLayout />}>
            <Route index element={<Partners />} />
          </Route>
          <Route path="/payments" element={<DashboardLayout />}>
            <Route index element={<PaymentHistory />} />
          </Route>
          <Route path="/opportunity-requests" element={<DashboardLayout />}>
            <Route index element={<OpportunityRequests />} />
          </Route>
          <Route path="/enrollments" element={<DashboardLayout />}>
            <Route index element={<Enrollments />} />
          </Route>
          <Route path="/course-timetables" element={<DashboardLayout />}>
            <Route index element={<CourseTimetables />} />
          </Route>
          <Route path="/course-fees" element={<DashboardLayout />}>
            <Route index element={<CourseFees />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
