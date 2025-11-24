import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Briefcase,
  GraduationCap,
  FileText,
  DollarSign,
  TrendingUp,
  MapPin,
  RefreshCw
} from "lucide-react";
import DashboardService from "@/services/api/DashboardService";
import { DashboardStats } from "@/types/dashboard";

const Dashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch user dashboard data
  const { data: dashboardData, isLoading, error, refetch } = useQuery({
    queryKey: ['user-dashboard', refreshKey],
    queryFn: async () => {
      console.log('Fetching user dashboard data...');
      const result = await DashboardService.getDashboardStats();
      console.log('User dashboard data received:', result);
      return result;
    },
    retry: 1,
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  // Color palettes for charts
  const pieColors = [
    'hsl(211 79% 41%)',    // Primary blue
    'hsl(345 82% 57%)',    // Secondary red
    'hsl(142 71% 45%)',    // Success green
    'hsl(38 100% 60%)',    // Warning orange
    'hsl(264 70% 60%)',    // Purple
    'hsl(173 58% 39%)',    // Teal
  ];

  const statusColors = {
    new: 'hsl(211 79% 41%)',
    pending: 'hsl(38 100% 60%)',
    under_review: 'hsl(264 70% 60%)',
    shortlisted: 'hsl(173 58% 39%)',
    approved: 'hsl(142 71% 45%)',
    accepted: 'hsl(142 71% 45%)',
    rejected: 'hsl(345 82% 57%)',
    submitted_to_partner: 'hsl(38 100% 60%)',
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              Failed to load dashboard data. Please try again.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = dashboardData as DashboardStats;

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-500 border-none bg-white/90 backdrop-blur-sm group">
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="job-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#3B82F6', stopOpacity: 0.3}} />
                  <stop offset="100%" style={{stopColor: '#1D4ED8', stopOpacity: 0.2}} />
                </linearGradient>
                <pattern id="job-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="3" fill="#3B82F6" opacity="0.4" />
                  <circle cx="0" cy="0" r="2" fill="#1D4ED8" opacity="0.3" />
                  <circle cx="40" cy="0" r="2" fill="#1D4ED8" opacity="0.3" />
                  <circle cx="0" cy="40" r="2" fill="#1D4ED8" opacity="0.3" />
                  <circle cx="40" cy="40" r="2" fill="#1D4ED8" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#job-grad)" />
              <rect width="100%" height="100%" fill="url(#job-pattern)" />
            </svg>
          </div>
          <CardContent className="pt-4 pb-4 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Job Applications</p>
                <p className="text-2xl font-bold mt-1 text-blue-700">{data.summary?.total_job_applications || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">+{data.summary?.monthly_job_applications || 0} this month</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-500 border-none bg-white/90 backdrop-blur-sm group">
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="scholarship-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#8B5CF6', stopOpacity: 0.3}} />
                  <stop offset="100%" style={{stopColor: '#7C3AED', stopOpacity: 0.2}} />
                </linearGradient>
                <pattern id="scholarship-pattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M0 25 L25 0 L50 25 L25 50 Z" fill="none" stroke="#8B5CF6" strokeWidth="1.5" opacity="0.4" />
                  <circle cx="25" cy="25" r="4" fill="#7C3AED" opacity="0.3" />
                  <circle cx="10" cy="10" r="2" fill="#8B5CF6" opacity="0.3" />
                  <circle cx="40" cy="10" r="2" fill="#8B5CF6" opacity="0.3" />
                  <circle cx="10" cy="40" r="2" fill="#8B5CF6" opacity="0.3" />
                  <circle cx="40" cy="40" r="2" fill="#8B5CF6" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#scholarship-grad)" />
              <rect width="100%" height="100%" fill="url(#scholarship-pattern)" />
            </svg>
          </div>
          <CardContent className="pt-4 pb-4 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scholarships</p>
                <p className="text-2xl font-bold mt-1 text-purple-700">{data.summary?.total_scholarships || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Available scholarships</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-500 border-none bg-white/90 backdrop-blur-sm group">
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="scholarship-app-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#10B981', stopOpacity: 0.3}} />
                  <stop offset="100%" style={{stopColor: '#059669', stopOpacity: 0.2}} />
                </linearGradient>
                <pattern id="scholarship-app-pattern" x="0" y="0" width="45" height="45" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="45" height="45" fill="none" stroke="#10B981" strokeWidth="1.5" opacity="0.4" />
                  <circle cx="22.5" cy="22.5" r="4" fill="#059669" opacity="0.3" />
                  <circle cx="9" cy="9" r="2" fill="#10B981" opacity="0.3" />
                  <circle cx="36" cy="9" r="2" fill="#10B981" opacity="0.3" />
                  <circle cx="9" cy="36" r="2" fill="#10B981" opacity="0.3" />
                  <circle cx="36" cy="36" r="2" fill="#10B981" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#scholarship-app-grad)" />
              <rect width="100%" height="100%" fill="url(#scholarship-app-pattern)" />
            </svg>
          </div>
          <CardContent className="pt-4 pb-4 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scholarship Applications</p>
                <p className="text-2xl font-bold mt-1 text-emerald-700">{data.summary?.total_scholarship_applications || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Total applications submitted</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-500 border-none bg-white/90 backdrop-blur-sm group">
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="payment-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#F59E0B', stopOpacity: 0.3}} />
                  <stop offset="100%" style={{stopColor: '#D97706', stopOpacity: 0.2}} />
                </linearGradient>
                <pattern id="payment-pattern" x="0" y="0" width="55" height="55" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="55" height="55" fill="none" stroke="#F59E0B" strokeWidth="1.5" opacity="0.4" />
                  <circle cx="27.5" cy="27.5" r="4" fill="#D97706" opacity="0.3" />
                  <circle cx="11" cy="11" r="2" fill="#F59E0B" opacity="0.3" />
                  <circle cx="44" cy="11" r="2" fill="#F59E0B" opacity="0.3" />
                  <circle cx="11" cy="44" r="2" fill="#F59E0B" opacity="0.3" />
                  <circle cx="44" cy="44" r="2" fill="#F59E0B" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#payment-grad)" />
              <rect width="100%" height="100%" fill="url(#payment-pattern)" />
            </svg>
          </div>
          <CardContent className="pt-4 pb-4 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payments</p>
                <p className="text-2xl font-bold mt-1 text-orange-700">{data.summary?.total_payments || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Total amount received</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="space-y-8">
        {/* First Row - Main Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Monthly Job Applications Trend */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-lg bg-blue-100">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                Monthly Job Applications Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={data.charts?.monthly_job_applications_trend || []} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2, fill: 'white' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Payment by Gateway */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-lg bg-green-100">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                Payment Amounts by Gateway
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data.charts?.payment_by_gateway || []} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="gateway"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [`$${value}`, 'Amount']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar
                    dataKey="total_amount"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Second Row - Job and Country Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Top Jobs */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-lg bg-orange-100">
                  <Briefcase className="h-5 w-5 text-orange-600" />
                </div>
                Top 5 Jobs by Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={data.charts?.top_jobs || []}
                  layout="horizontal"
                  margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey="job_title"
                    type="category"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={70}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar
                    dataKey="application_count"
                    fill="#F59E0B"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Applications by Country */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-lg bg-purple-100">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                Applications by Country
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data.charts?.applications_by_country || []} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="country"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#8B5CF6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Third Row - Status Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Scholarship Status Pie */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <GraduationCap className="h-5 w-5 text-emerald-600" />
                </div>
                Scholarship Application Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={data.charts?.scholarship_status_pie || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {(data.charts?.scholarship_status_pie || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={statusColors[entry.status as keyof typeof statusColors] || pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Job Status Bar */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-lg bg-teal-100">
                  <Briefcase className="h-5 w-5 text-teal-600" />
                </div>
                Job Application Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data.charts?.job_status_bar || []} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="status"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#14B8A6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Job Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Recent Job Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(data.recent_data?.job_applications || []).slice(0, 5).map((app) => (
                <div key={app.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{app.job_title}</p>
                    <p className="text-sm text-muted-foreground">{app.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{app.status}</p>
                    <p className="text-xs text-muted-foreground">{app.applied_date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Scholarship Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Recent Scholarship Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(data.recent_data?.scholarship_applications || []).slice(0, 5).map((app) => (
                <div key={app.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{app.scholarship_title}</p>
                    <p className="text-sm text-muted-foreground">{app.organization}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{app.status}</p>
                    <p className="text-xs text-muted-foreground">{app.applied_date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Recent Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(data.recent_data?.payments || []).slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">${payment.amount}</p>
                    <p className="text-sm text-muted-foreground">{payment.gateway}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{payment.status}</p>
                    <p className="text-xs text-muted-foreground">{payment.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
