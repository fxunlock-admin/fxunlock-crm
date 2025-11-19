import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DashboardStats, RevenueData, TopAffiliate, Affiliate } from '@/types';
import { formatCurrency, getMonthName, formatDate } from '@/lib/utils';
import { Users, Building2, DollarSign, TrendingUp, Clock, CheckCircle, LayoutDashboard, FileDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AffiliateAlerts from '@/components/AffiliateAlerts';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

// Constants
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2].map(y => y.toString());
const MONTH_OPTIONS = [
  { value: 'all', label: 'All Months' },
  { value: 'Q1', label: 'Q1 (Jan-Mar)' },
  { value: 'Q2', label: 'Q2 (Apr-Jun)' },
  { value: 'Q3', label: 'Q3 (Jul-Sep)' },
  { value: 'Q4', label: 'Q4 (Oct-Dec)' },
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const Dashboard: React.FC = () => {
  const [selectedDashboard, setSelectedDashboard] = useState<'affiliates' | 'performance'>('affiliates');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>(CURRENT_YEAR.toString());
  const [selectedBroker, setSelectedBroker] = useState<string>('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Export to PDF function
  const handleExportPDF = () => {
    window.print();
  };

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats');
      return response.data;
    },
  });

  const { data: revenueData } = useQuery<RevenueData[]>({
    queryKey: ['revenue-analytics'],
    queryFn: async () => {
      const response = await api.get('/dashboard/revenue');
      return response.data;
    },
  });

  const { data: topAffiliates } = useQuery<TopAffiliate[]>({
    queryKey: ['top-affiliates'],
    queryFn: async () => {
      const response = await api.get('/dashboard/top-affiliates?limit=5');
      return response.data;
    },
  });

  const { data: staffPerformance } = useQuery<any[]>({
    queryKey: ['staff-performance', selectedYear, selectedMonth],
    queryFn: async () => {
      const params: any = { year: selectedYear };
      if (selectedMonth !== 'all' && !selectedMonth.startsWith('Q')) {
        params.month = selectedMonth;
      }
      const response = await api.get('/dashboard/staff-performance', { params });
      // Sort to put admins at the top
      return response.data.sort((a: any, b: any) => {
        if (a.staff?.role === 'ADMIN' && b.staff?.role !== 'ADMIN') return -1;
        if (a.staff?.role !== 'ADMIN' && b.staff?.role === 'ADMIN') return 1;
        return 0;
      });
    },
  });

  const { data: affiliates, isLoading: affiliatesLoading } = useQuery<Affiliate[]>({
    queryKey: ['affiliates'],
    queryFn: async () => {
      const response = await api.get('/affiliates');
      return response.data;
    },
  });

  // Filter affiliates based on user role
  const filteredAffiliates = affiliates?.filter(affiliate => {
    if (user?.role === 'ADMIN') return true;
    return affiliate.managerId === user?.id;
  });

  console.log('Dashboard Debug:', {
    affiliates: affiliates?.length,
    filteredAffiliates: filteredAffiliates?.length,
    user: user?.role,
    userId: user?.userId,
    userObject: user,
    firstAffiliate: affiliates?.[0],
    selectedDashboard,
    affiliatesLoading,
  });

  // Get onboarding affiliates (status = ONBOARDING)
  const onboardingAffiliates = filteredAffiliates?.filter(affiliate => affiliate.status === 'ONBOARDING');

  // Get new affiliates this calendar month
  const newAffiliatesThisMonth = filteredAffiliates?.filter(affiliate => {
    const createdDate = new Date(affiliate.createdAt);
    const today = new Date();
    return createdDate.getMonth() === today.getMonth() && createdDate.getFullYear() === today.getFullYear();
  });

  // Get current month name
  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });

  // Get active affiliates only
  const activeAffiliates = filteredAffiliates?.filter(affiliate => affiliate.status === 'ACTIVE');

  // Get latest 5 affiliates (sorted by creation date)
  const latestAffiliates = filteredAffiliates
    ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Count affiliates per broker
  const affiliatesPerBroker = filteredAffiliates?.reduce((acc, affiliate) => {
    const brokerName = affiliate.broker?.name || 'Unknown';
    acc[brokerName] = (acc[brokerName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Color palette for brokers - Pastel shades
  const brokerColors = [
    '#a8d5ff', // pastel blue
    '#ffb3b3', // pastel red
    '#b3e5b3', // pastel green
    '#ffe6b3', // pastel orange
    '#d9b3ff', // pastel purple
    '#ffb3d9', // pastel pink
    '#b3e5e5', // pastel cyan
    '#b3d9d9', // pastel teal
    '#ffd9b3', // pastel peach
    '#d9c9ff', // pastel lavender
  ];

  const brokerData = Object.entries(affiliatesPerBroker || {}).map(([name, count], index) => ({
    name,
    count,
    fill: brokerColors[index % brokerColors.length],
  }));

  // Get unique broker names for filter dropdown
  const uniqueBrokers = Array.from(new Set(filteredAffiliates?.map(a => a.broker?.name).filter(Boolean))) as string[];

  // Filter affiliates by selected broker
  const affiliatesByBroker = selectedBroker === 'all' 
    ? filteredAffiliates 
    : filteredAffiliates?.filter(a => a.broker?.name === selectedBroker);

  // Helper function to check if month is in quarter
  const isMonthInQuarter = (month: string, quarter: string): boolean => {
    const monthNum = parseInt(month);
    switch (quarter) {
      case 'Q1': return monthNum >= 1 && monthNum <= 3;
      case 'Q2': return monthNum >= 4 && monthNum <= 6;
      case 'Q3': return monthNum >= 7 && monthNum <= 9;
      case 'Q4': return monthNum >= 10 && monthNum <= 12;
      default: return false;
    }
  };

  // Filter revenue data based on selected month and year
  const filteredRevenueData = revenueData?.filter((item) => {
    if (!item?.period) return false;
    const [year, month] = item.period.split('-');
    const yearMatch = year === selectedYear;
    
    let monthMatch = false;
    if (selectedMonth === 'all') {
      monthMatch = true;
    } else if (selectedMonth.startsWith('Q')) {
      monthMatch = isMonthInQuarter(month, selectedMonth);
    } else {
      monthMatch = month === selectedMonth;
    }
    
    return yearMatch && monthMatch;
  }) || [];

  // Calculate filtered stats
  const filteredStats = {
    totalRevenue: filteredRevenueData.reduce((sum, item) => sum + (item.total || 0), 0),
    paidRevenue: filteredRevenueData.reduce((sum, item) => sum + (item.paid || 0), 0),
    pendingRevenue: filteredRevenueData.reduce((sum, item) => sum + (item.pending || 0), 0),
    totalCommissions: filteredRevenueData.length,
  };

  // Get period label for stats subtitle
  const getPeriodLabel = () => {
    if (selectedMonth === 'all') return selectedYear;
    if (selectedMonth.startsWith('Q')) return `${selectedMonth} ${selectedYear}`;
    return `${MONTH_OPTIONS.find(m => m.value === selectedMonth)?.label} ${selectedYear}`;
  };

  const statCards = [
    {
      title: 'Total Affiliates',
      value: stats?.totalAffiliates || 0,
      subtitle: `${stats?.activeAffiliates || 0} active`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Brokers',
      value: stats?.totalBrokers || 0,
      subtitle: 'Active partnerships',
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(filteredStats.totalRevenue),
      subtitle: getPeriodLabel(),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Paid Revenue',
      value: formatCurrency(filteredStats.paidRevenue),
      subtitle: getPeriodLabel(),
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Pending Revenue',
      value: formatCurrency(filteredStats.pendingRevenue),
      subtitle: getPeriodLabel(),
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Total Commissions',
      value: filteredStats.totalCommissions,
      subtitle: getPeriodLabel(),
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
  ];

  const dealTypeColors = {
    CPA: '#3b82f6',
    REBATES: '#10b981',
    PNL: '#f59e0b',
    HYBRID: '#8b5cf6',
  };

  // Get data for current month or quarter (for pie chart)
  const currentMonthData = selectedMonth === 'all'
    ? (revenueData && revenueData.length > 0 ? revenueData[revenueData.length - 1] : undefined)
    : selectedMonth.startsWith('Q')
    ? undefined // Will be aggregated below
    : revenueData?.find((item) => {
        if (!item?.period) return false;
        const [year, month] = item.period.split('-');
        return year === selectedYear && month === selectedMonth;
      });

  // Aggregate deal type data for quarters
  const dealTypeData = selectedMonth.startsWith('Q')
    ? (() => {
        const aggregated: Record<string, number> = {};
        filteredRevenueData.forEach((item) => {
          if (item?.byDealType) {
            Object.entries(item.byDealType).forEach(([dealType, value]) => {
              aggregated[dealType] = (aggregated[dealType] || 0) + Number(value);
            });
          }
        });
        return Object.entries(aggregated)
          .map(([name, value]) => ({ name, value }))
          .filter((item) => item.value > 0);
      })()
    : currentMonthData?.byDealType
    ? Object.entries(currentMonthData.byDealType)
        .map(([name, value]) => ({ name, value: Number(value) || 0 }))
        .filter((item) => item.value > 0)
    : [];

  const monthlyChartData = (selectedMonth === 'all' 
    ? filteredRevenueData.slice(-6) 
    : filteredRevenueData
  ).map((item) => {
    if (!item?.period) return { name: '', Total: 0, Paid: 0, Pending: 0 };
    const [year, month] = item.period.split('-');
    return {
      name: `${getMonthName(parseInt(month))} ${year}`,
      Total: item.total || 0,
      Paid: item.paid || 0,
      Pending: item.pending || 0,
    };
  }).filter(item => item.name !== '');

  return (
    <div className="space-y-6">
      {/* Dashboard Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-6 w-6" />
          <Select value={selectedDashboard} onValueChange={(value: any) => setSelectedDashboard(value)}>
            <SelectTrigger className="w-[250px] text-base font-bold">
              <SelectValue placeholder="Select dashboard" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="affiliates">Affiliate Dashboard</SelectItem>
              {user?.role === 'ADMIN' && (
                <SelectItem value="revenue">Earnings / Revenue</SelectItem>
              )}
              {user?.role === 'STAFF' && (
                <SelectItem value="performance">My Performance</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleExportPDF} variant="outline" className="print:hidden">
          <FileDown className="h-4 w-4 mr-2" />
          Export Report (PDF)
        </Button>
      </div>

      {/* Affiliate Alerts - Disabled for now */}
      {/* <AffiliateAlerts /> */}

      {/* Revenue Dashboard */}
      {selectedDashboard === 'revenue' && (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Year</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEAR_OPTIONS.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Month</label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTH_OPTIONS.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {statCards.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Revenue Trend ({getPeriodLabel()})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line type="monotone" dataKey="Total" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="Paid" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="Pending" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Deal Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Revenue by Deal Type ({selectedMonth === 'all' ? 'Latest Month' : getPeriodLabel()})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dealTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dealTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={dealTypeColors[entry.name as keyof typeof dealTypeColors] || '#999'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Affiliates */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Affiliates by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topAffiliates?.map((item) => ({
                  name: item.affiliate?.name || 'Unknown',
                  revenue: item.totalRevenue,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue by Staff Member */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Staff Member ({getPeriodLabel()})</CardTitle>
            </CardHeader>
            <CardContent>
              {!staffPerformance || staffPerformance.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No staff performance data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={(() => {
                    if (selectedMonth.startsWith('Q')) {
                      // Aggregate staff performance for quarter
                      const aggregated: Record<string, any> = {};
                      staffPerformance.forEach((item) => {
                        const staffId = item.staff?.id;
                        if (!aggregated[staffId]) {
                          aggregated[staffId] = {
                            staff: item.staff,
                            totalRevenue: 0,
                          };
                        }
                        aggregated[staffId].totalRevenue += Number(item.totalRevenue) || 0;
                      });
                      return Object.values(aggregated)
                        .filter((item) => (item.totalRevenue || 0) > 0)
                        .map((item) => ({
                          name: `${item.staff?.firstName || ''} ${item.staff?.lastName || ''}`.trim(),
                          revenue: item.totalRevenue,
                        }));
                    } else {
                      return staffPerformance
                        .filter((item) => (item.totalRevenue || 0) > 0)
                        .map((item) => ({
                          name: `${item.staff?.firstName || ''} ${item.staff?.lastName || ''}`.trim(),
                          revenue: Number(item.totalRevenue) || 0,
                        }));
                    }
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="revenue" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Performance Dashboard */}
      {selectedDashboard === 'performance' && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Redirecting to My Performance dashboard...</p>
          {typeof window !== 'undefined' && window.location.pathname !== '/staff-dashboard' && (
            (() => {
              window.location.href = '/staff-dashboard';
              return null;
            })()
          )}
        </div>
      )}

      {/* Affiliate Dashboard */}
      {selectedDashboard === 'affiliates' && (
        <>
          {affiliatesLoading ? (
            <div className="text-center py-8">Loading affiliates...</div>
          ) : !filteredAffiliates || filteredAffiliates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg font-semibold">No affiliates found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Total affiliates: {affiliates?.length || 0} | 
                Filtered: {filteredAffiliates?.length || 0} | 
                Role: {user?.role}
              </p>
            </div>
          ) : (
            <>
              {/* Affiliate Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Active Affiliates</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeAffiliates?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {user?.role === 'ADMIN' ? 'All active affiliates' : 'Your active affiliates'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Onboarding</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{onboardingAffiliates?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Affiliates This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{newAffiliatesThisMonth?.length || 0}</div>
                <p className="text-xs text-muted-foreground">{currentMonthName}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Brokers</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{brokerData.length}</div>
                <p className="text-xs text-muted-foreground">With affiliates</p>
              </CardContent>
            </Card>
          </div>

          {/* Onboarding Affiliates */}
          <Card>
            <CardHeader>
              <CardTitle>Affiliates in Onboarding Stage</CardTitle>
            </CardHeader>
            <CardContent>
              {onboardingAffiliates && onboardingAffiliates.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Broker</TableHead>
                      <TableHead>Deal Type</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {onboardingAffiliates.map((affiliate) => (
                      <TableRow key={affiliate.id} className="cursor-pointer hover:bg-muted" onClick={() => navigate(`/affiliates/${affiliate.id}`)}>
                        <TableCell className="font-medium text-gray-700 hover:underline">{affiliate.name}</TableCell>
                        <TableCell>{affiliate.email}</TableCell>
                        <TableCell>{affiliate.broker?.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{affiliate.dealType}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(affiliate.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No affiliates in onboarding</p>
              )}
            </CardContent>
          </Card>

          {/* Latest Affiliates */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Latest Affiliates by Date Created</CardTitle>
            </CardHeader>
            <CardContent>
              {latestAffiliates && latestAffiliates.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Broker</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {latestAffiliates.map((affiliate) => (
                      <TableRow key={affiliate.id} className="cursor-pointer hover:bg-muted" onClick={() => navigate(`/affiliates/${affiliate.id}`)}>
                        <TableCell className="font-medium text-gray-700 hover:underline">{affiliate.name}</TableCell>
                        <TableCell>{affiliate.email}</TableCell>
                        <TableCell>{affiliate.phone || '-'}</TableCell>
                        <TableCell>{affiliate.broker?.name}</TableCell>
                        <TableCell>
                          <Badge variant={affiliate.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {affiliate.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(affiliate.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No affiliates found</p>
              )}
            </CardContent>
          </Card>

          {/* Affiliates per Broker */}
          <Card>
            <CardHeader>
              <CardTitle>Number of Affiliates per Broker</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={brokerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {brokerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* List of Affiliates per Broker */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>List of Affiliates per Broker</CardTitle>
              <Select value={selectedBroker} onValueChange={setSelectedBroker}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select broker" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brokers</SelectItem>
                  {uniqueBrokers.map((broker) => (
                    <SelectItem key={broker} value={broker}>
                      {broker}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {affiliatesByBroker && affiliatesByBroker.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Broker</TableHead>
                      <TableHead>Deal Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {affiliatesByBroker.slice(0, 10).map((affiliate) => (
                      <TableRow key={affiliate.id} className="cursor-pointer hover:bg-muted" onClick={() => navigate(`/affiliates/${affiliate.id}`)}>
                        <TableCell className="font-medium text-gray-700 hover:underline">{affiliate.name}</TableCell>
                        <TableCell>{affiliate.email}</TableCell>
                        <TableCell>{affiliate.phone || '-'}</TableCell>
                        <TableCell>{affiliate.broker?.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{affiliate.dealType}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={affiliate.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {affiliate.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No affiliates found</p>
              )}
            </CardContent>
          </Card>
              </>
            )}
        </>
      )}
    </div>
  );
};

export default Dashboard;

