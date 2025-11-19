import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, getMonthName } from '@/lib/utils';
import { TrendingUp, Target, Users, DollarSign, Calendar } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from 'recharts';

interface StaffProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  salary?: number;
  annualKpis?: string;
  quarterlyKpis?: string;
}

interface StaffPerformance {
  totalRevenue: number;
  commissionCount: number;
  affiliateCount: number;
  activeAffiliateCount: number;
}

interface MonthlyRevenue {
  month: number;
  year: number;
  revenue: number;
}

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

const isMonthInQuarter = (month: number, quarter: string): boolean => {
  const monthNum = parseInt(month.toString());
  switch (quarter) {
    case 'Q1': return monthNum >= 1 && monthNum <= 3;
    case 'Q2': return monthNum >= 4 && monthNum <= 6;
    case 'Q3': return monthNum >= 7 && monthNum <= 9;
    case 'Q4': return monthNum >= 10 && monthNum <= 12;
    default: return false;
  }
};

const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState<string>(CURRENT_YEAR.toString());
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Fetch staff profile
  const { data: staffProfile } = useQuery<StaffProfile>({
    queryKey: ['staff-profile', user?.id],
    queryFn: async () => {
      const response = await api.get(`/users/${user?.id}`);
      return response.data;
    },
    enabled: !!user?.id,
  });

  // Fetch staff performance
  const { data: staffPerformance } = useQuery<StaffPerformance>({
    queryKey: ['staff-performance-detail', user?.id, selectedYear],
    queryFn: async () => {
      const response = await api.get(`/dashboard/staff-performance-detail`, {
        params: { year: selectedYear }
      });
      return response.data;
    },
    enabled: !!user?.id,
  });

  // Fetch monthly revenue
  const { data: monthlyRevenue } = useQuery<MonthlyRevenue[]>({
    queryKey: ['staff-monthly-revenue', user?.id, selectedYear],
    queryFn: async () => {
      const response = await api.get(`/dashboard/staff-monthly-revenue`, {
        params: { year: selectedYear }
      });
      return response.data;
    },
    enabled: !!user?.id,
  });

  // Parse KPIs
  let annualKpis: any = {};
  let quarterlyKpis: any = {};
  let monthlyKpis: any = {};
  
  if (staffProfile?.annualKpis) {
    try {
      annualKpis = JSON.parse(staffProfile.annualKpis);
    } catch (e) {
      console.error('Failed to parse annual KPIs');
    }
  }

  if (staffProfile?.quarterlyKpis) {
    try {
      quarterlyKpis = JSON.parse(staffProfile.quarterlyKpis);
    } catch (e) {
      console.error('Failed to parse quarterly KPIs');
    }
  }

  // Parse monthly KPIs - check all KPI fields
  const parseMonthlyKpis = (kpisString: string | undefined) => {
    if (!kpisString) return {};
    try {
      const parsed = JSON.parse(kpisString);
      console.log('Parsed monthly KPIs:', parsed);
      return parsed;
    } catch (e) {
      console.error('Failed to parse monthly KPIs:', e);
      return {};
    }
  };

  // Try to get monthly KPIs from any available field
  if (staffProfile?.annualKpis) {
    monthlyKpis = parseMonthlyKpis(staffProfile.annualKpis);
  }
  
  if (Object.keys(monthlyKpis).length === 0 && staffProfile?.quarterlyKpis) {
    monthlyKpis = parseMonthlyKpis(staffProfile.quarterlyKpis);
  }

  // Calculate KPI achievement
  const annualTargetRevenue = annualKpis.targetRevenue || 0;
  const annualActualRevenue = staffPerformance?.totalRevenue || 0;
  const annualAchievement = annualTargetRevenue > 0 
    ? Math.round((annualActualRevenue / annualTargetRevenue) * 100) 
    : 0;

  const annualTargetAffiliates = annualKpis.targetAffiliates || 0;
  const annualActualAffiliates = staffPerformance?.activeAffiliateCount || 0;
  const affiliateAchievement = annualTargetAffiliates > 0 
    ? Math.round((annualActualAffiliates / annualTargetAffiliates) * 100) 
    : 0;

  // Filter chart data based on selected month/quarter
  const filteredChartData = (monthlyRevenue || []).filter(item => {
    if (selectedMonth === 'all') return true;
    if (selectedMonth.startsWith('Q')) {
      return isMonthInQuarter(item.month, selectedMonth);
    }
    return item.month === parseInt(selectedMonth);
  });

  // Chart data
  const chartData = filteredChartData.map(item => ({
    name: `${getMonthName(item.month)} ${item.year}`,
    revenue: item.revenue,
  }));

  const kpiComparisonData = [
    {
      name: 'Revenue',
      target: annualTargetRevenue,
      actual: annualActualRevenue,
    },
    {
      name: 'Affiliates',
      target: annualTargetAffiliates,
      actual: annualActualAffiliates,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Dashboard</h2>
          <p className="text-muted-foreground">Track your KPIs and performance</p>
        </div>
        <div className="flex gap-2">
          <div className="w-40">
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
          <div className="w-32">
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
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(annualActualRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Target: {formatCurrency(annualTargetRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Achievement</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{annualAchievement}%</div>
            <p className="text-xs text-muted-foreground">
              {annualAchievement >= 100 ? '✓ Target achieved' : 'In progress'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Affiliates</CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{annualActualAffiliates}</div>
            <p className="text-xs text-muted-foreground">
              Target: {annualTargetAffiliates}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Affiliate Achievement</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{affiliateAchievement}%</div>
            <p className="text-xs text-muted-foreground">
              {affiliateAchievement >= 100 ? '✓ Target achieved' : 'In progress'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly KPI Cards */}
      <div>
        <h3 className="text-xl font-bold tracking-tight mb-4">Monthly KPIs ({selectedYear})</h3>
        {Object.keys(monthlyKpis).length === 0 && (
          <div className="text-sm text-muted-foreground mb-4">No monthly KPI data available</div>
        )}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            const currentYear = selectedYear;
            const yearKpis = monthlyKpis[currentYear] || {};
            const kpi = yearKpis[month];
            
            return (
              <Card key={month}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{getMonthName(month)}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue Target</p>
                    <p className="font-semibold text-sm">{kpi?.targetRevenue ? formatCurrency(kpi.targetRevenue) : '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Affiliates Target</p>
                    <p className="font-semibold text-sm">{kpi?.targetNewAffiliates || '-'}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quarterly and Annual Totals */}
        <div className="mt-6 pt-4 border-t space-y-3">
          <p className="text-sm font-semibold">Targets Summary</p>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-5 text-sm">
            {(() => {
              const currentYear = selectedYear;
              const yearKpis = monthlyKpis[currentYear] || {};
              
              const totals = {
                Q1: { revenue: 0, affiliates: 0 },
                Q2: { revenue: 0, affiliates: 0 },
                Q3: { revenue: 0, affiliates: 0 },
                Q4: { revenue: 0, affiliates: 0 },
                annual: { revenue: 0, affiliates: 0 },
              };

              for (let month = 1; month <= 12; month++) {
                const kpi = yearKpis[month];
                const revenue = kpi?.targetRevenue || 0;
                const affiliates = kpi?.targetNewAffiliates || 0;

                if (month <= 3) {
                  totals.Q1.revenue += revenue;
                  totals.Q1.affiliates += affiliates;
                } else if (month <= 6) {
                  totals.Q2.revenue += revenue;
                  totals.Q2.affiliates += affiliates;
                } else if (month <= 9) {
                  totals.Q3.revenue += revenue;
                  totals.Q3.affiliates += affiliates;
                } else {
                  totals.Q4.revenue += revenue;
                  totals.Q4.affiliates += affiliates;
                }

                totals.annual.revenue += revenue;
                totals.annual.affiliates += affiliates;
              }

              return (
                <>
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-xs text-muted-foreground">Q1 Revenue</p>
                    <p className="font-semibold">{formatCurrency(totals.Q1.revenue)}</p>
                    <p className="text-xs text-muted-foreground">Affiliates: {totals.Q1.affiliates}</p>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-xs text-muted-foreground">Q2 Revenue</p>
                    <p className="font-semibold">{formatCurrency(totals.Q2.revenue)}</p>
                    <p className="text-xs text-muted-foreground">Affiliates: {totals.Q2.affiliates}</p>
                  </div>
                  <div className="bg-yellow-50 p-2 rounded">
                    <p className="text-xs text-muted-foreground">Q3 Revenue</p>
                    <p className="font-semibold">{formatCurrency(totals.Q3.revenue)}</p>
                    <p className="text-xs text-muted-foreground">Affiliates: {totals.Q3.affiliates}</p>
                  </div>
                  <div className="bg-purple-50 p-2 rounded">
                    <p className="text-xs text-muted-foreground">Q4 Revenue</p>
                    <p className="font-semibold">{formatCurrency(totals.Q4.revenue)}</p>
                    <p className="text-xs text-muted-foreground">Affiliates: {totals.Q4.affiliates}</p>
                  </div>
                  <div className="bg-gray-100 p-2 rounded border-2 border-gray-300">
                    <p className="text-xs text-muted-foreground font-semibold">Annual Total</p>
                    <p className="font-bold text-base">{formatCurrency(totals.annual.revenue)}</p>
                    <p className="text-xs text-muted-foreground">Affiliates: {totals.annual.affiliates}</p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Monthly Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trend ({selectedYear})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* KPI vs Actual */}
        <Card>
          <CardHeader>
            <CardTitle>KPI vs Actual ({selectedYear})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kpiComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(value) => {
                  const numValue = Number(value);
                  return kpiComparisonData[0].name === 'Revenue' 
                    ? formatCurrency(numValue)
                    : numValue;
                }} />
                <Legend />
                <Bar dataKey="target" fill="#cbd5e1" name="Target" />
                <Bar dataKey="actual" fill="#8b5cf6" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Profile Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg font-semibold">
                {staffProfile?.firstName} {staffProfile?.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg font-semibold">{staffProfile?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Annual Salary</p>
              <p className="text-lg font-semibold">
                {staffProfile?.salary ? formatCurrency(staffProfile.salary) : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Commissions</p>
              <p className="text-lg font-semibold">{staffPerformance?.commissionCount || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffDashboard;
