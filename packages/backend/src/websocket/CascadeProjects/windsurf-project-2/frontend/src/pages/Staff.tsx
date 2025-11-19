import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Search, Plus } from 'lucide-react';
import { formatCurrency, formatDate, getMonthName } from '@/lib/utils';

interface StaffMember extends User {
  startDate?: string;
  contractFile?: string;
  salary?: number;
  salaryCurrency?: string;
  monthlyKpis?: string;
}

const Staff: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [selectedStaffForKpi, setSelectedStaffForKpi] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    startDate: '',
    salary: '',
    salaryCurrency: 'GBP',
    monthlyKpis: '',
  });
  const [monthlyKpiInputs, setMonthlyKpiInputs] = useState<Record<number, { targetRevenue: string; targetNewAffiliates: string }>>({});
  const [selectedKpiYear, setSelectedKpiYear] = useState<string>(new Date().getFullYear().toString());
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: staffMembers } = useQuery<StaffMember[]>({
    queryKey: ['staff-members'],
    queryFn: async () => {
      const response = await api.get('/users');
      // Filter to only show STAFF and ADMIN users
      return response.data.filter((u: StaffMember) => u.role === 'STAFF' || u.role === 'ADMIN');
    },
  });

  // Fetch live exchange rates
  const { data: exchangeRates } = useQuery<{ [key: string]: number }>({
    queryKey: ['exchange-rates'],
    queryFn: async () => {
      const response = await api.get('/exchange/rates');
      return response.data;
    },
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/users/${id}`, data),
    onSuccess: () => {
      console.log('Staff member updated successfully');
      queryClient.invalidateQueries({ queryKey: ['staff-members'] });
      setIsDialogOpen(false);
      setEditingStaff(null);
      // Show success message
      alert('✅ Staff member updated successfully!');
    },
    onError: (error: any) => {
      console.error('Error updating staff member:', error);
      alert('❌ Error updating staff member. Please try again.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-members'] });
    },
  });

  const handleEdit = (staff: StaffMember) => {
    setEditingStaff(staff);
    setFormData({
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email,
      startDate: staff.startDate ? staff.startDate.split('T')[0] : '',
      salary: staff.salary?.toString() || '',
      salaryCurrency: staff.salaryCurrency || 'GBP',
      monthlyKpis: staff.monthlyKpis || '',
    });
    
    // Set default year to current year
    const currentYear = new Date().getFullYear().toString();
    setSelectedKpiYear(currentYear);
    
    // Parse monthly KPIs into individual month inputs for the selected year
    const allKpis = parseMonthlyKpis(staff.monthlyKpis);
    const yearKpis = allKpis[currentYear] || {};
    const inputs: Record<number, { targetRevenue: string; targetNewAffiliates: string }> = {};
    for (let month = 1; month <= 12; month++) {
      inputs[month] = {
        targetRevenue: yearKpis[month]?.targetRevenue?.toString() || '',
        targetNewAffiliates: yearKpis[month]?.targetNewAffiliates?.toString() || '',
      };
    }
    setMonthlyKpiInputs(inputs);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    // Convert monthly KPI inputs back to JSON, organized by year
    const allKpis = parseMonthlyKpis(formData.monthlyKpis);
    
    // Convert current month inputs to the selected year
    const monthlyKpisJson: Record<number, { targetRevenue: number; targetNewAffiliates: number }> = {};
    for (let month = 1; month <= 12; month++) {
      const input = monthlyKpiInputs[month];
      if (input?.targetRevenue || input?.targetNewAffiliates) {
        monthlyKpisJson[month] = {
          targetRevenue: input.targetRevenue ? parseFloat(input.targetRevenue) : 0,
          targetNewAffiliates: input.targetNewAffiliates ? parseInt(input.targetNewAffiliates) : 0,
        };
      }
    }
    
    // Update the selected year's KPIs
    allKpis[selectedKpiYear] = monthlyKpisJson;

    const data = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      startDate: formData.startDate ? new Date(formData.startDate) : null,
      salary: formData.salary ? parseFloat(formData.salary) : null,
      salaryCurrency: formData.salaryCurrency,
      quarterlyKpis: Object.keys(allKpis).length > 0 ? JSON.stringify(allKpis) : null,
    };

    updateMutation.mutate({ id: editingStaff.id, data });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredStaff = staffMembers?.filter((staff) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      staff.firstName.toLowerCase().includes(searchLower) ||
      staff.lastName.toLowerCase().includes(searchLower) ||
      staff.email.toLowerCase().includes(searchLower)
    );
  }).sort((a, b) => {
    // Sort admins to the top
    if (a.role === 'ADMIN' && b.role !== 'ADMIN') return -1;
    if (a.role !== 'ADMIN' && b.role === 'ADMIN') return 1;
    return 0;
  });

  // Fallback rates in case API hasn't loaded yet
  const fallbackRates = {
    GBP: 1.31,
    USD: 1.0,
    EUR: 1.16,
    AED: 0.27,
  };

  // Use fetched rates or fallback
  const rates = exchangeRates || fallbackRates;

  // Calculate total salary in USD
  const totalSalaryUSD = (filteredStaff || []).reduce((total, staff) => {
    if (!staff.salary) return total;
    const rate = rates[staff.salaryCurrency || 'GBP'] || 1;
    return total + (staff.salary * rate);
  }, 0);

  // Format salary without decimals
  const formatSalaryNoDecimals = (salary: number, currency: string = 'GBP') => {
    return `${currency} ${Math.round(salary).toLocaleString()}`;
  };

  // Parse monthly KPIs from JSON string
  const parseMonthlyKpis = (kpisJson?: string) => {
    if (!kpisJson) return {};
    try {
      return JSON.parse(kpisJson);
    } catch {
      return {};
    }
  };

  // Get KPI for specific month
  const getMonthKpi = (staff: StaffMember, month: number) => {
    const kpis = parseMonthlyKpis(staff.monthlyKpis);
    return kpis[month] || null;
  };

  // Handle year change in edit form
  const handleYearChange = (year: string) => {
    setSelectedKpiYear(year);
    
    // Load KPIs for the selected year
    const allKpis = parseMonthlyKpis(formData.monthlyKpis);
    const yearKpis = allKpis[year] || {};
    const inputs: Record<number, { targetRevenue: string; targetNewAffiliates: string }> = {};
    for (let month = 1; month <= 12; month++) {
      inputs[month] = {
        targetRevenue: yearKpis[month]?.targetRevenue?.toString() || '',
        targetNewAffiliates: yearKpis[month]?.targetNewAffiliates?.toString() || '',
      };
    }
    setMonthlyKpiInputs(inputs);
  };

  // Calculate quarterly and annual totals
  const calculateTotals = () => {
    const totals = {
      Q1: { revenue: 0, affiliates: 0 },
      Q2: { revenue: 0, affiliates: 0 },
      Q3: { revenue: 0, affiliates: 0 },
      Q4: { revenue: 0, affiliates: 0 },
      annual: { revenue: 0, affiliates: 0 },
    };

    for (let month = 1; month <= 12; month++) {
      const input = monthlyKpiInputs[month];
      const revenue = input?.targetRevenue ? parseFloat(input.targetRevenue) : 0;
      const affiliates = input?.targetNewAffiliates ? parseInt(input.targetNewAffiliates) : 0;

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

    return totals;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
          <p className="text-muted-foreground">Manage staff profiles, contracts, and KPIs</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {!filteredStaff || filteredStaff.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No staff members found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Monthly Salary</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">
                      {staff.firstName} {staff.lastName}
                    </TableCell>
                    <TableCell>{staff.email}</TableCell>
                    <TableCell>
                      {staff.startDate ? formatDate(staff.startDate) : '-'}
                    </TableCell>
                    <TableCell>
                      {staff.salary ? formatSalaryNoDecimals(staff.salary, staff.salaryCurrency || 'GBP') : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={staff.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {staff.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(staff)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user?.role === 'ADMIN' && staff.role !== 'ADMIN' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(staff.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredStaff && filteredStaff.length > 0 && (
                  <TableRow className="bg-muted font-semibold">
                    <TableCell colSpan={3} className="text-right">
                      Total Salary:
                    </TableCell>
                    <TableCell>
                      USD {Math.round(totalSalaryUSD).toLocaleString()}
                    </TableCell>
                    <TableCell colSpan={2}></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Staff Member KPIs */}
      {filteredStaff && filteredStaff.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Staff KPIs</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filteredStaff.map((staff) => (
              <Button
                key={staff.id}
                variant={selectedStaffForKpi?.id === staff.id ? 'default' : 'outline'}
                onClick={() => setSelectedStaffForKpi(staff)}
                className="whitespace-nowrap"
              >
                {staff.firstName} {staff.lastName}
              </Button>
            ))}
          </div>

          {selectedStaffForKpi && (
            <div>
              <h3 className="text-xl font-bold mb-4">
                {selectedStaffForKpi.firstName} {selectedStaffForKpi.lastName} - Monthly KPIs
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => {
                  const monthKpi = getMonthKpi(selectedStaffForKpi, month);
                  
                  return (
                    <Card key={month} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{getMonthName(month)}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Revenue Section */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Revenue Target</p>
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-2xl font-bold">
                              {monthKpi?.targetRevenue ? formatCurrency(monthKpi.targetRevenue) : '-'}
                            </p>
                          </div>
                        </div>

                        {/* New Affiliates Section */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium">New Affiliates Target</p>
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-2xl font-bold">
                              {monthKpi?.targetNewAffiliates ?? '-'}
                            </p>
                          </div>
                        </div>

                        {/* Edit Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => handleEdit(selectedStaffForKpi)}
                        >
                          <Edit className="h-3 w-3 mr-2" />
                          Edit KPIs
                        </Button>
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
                    const kpis = parseMonthlyKpis(selectedStaffForKpi.monthlyKpis);
                    const currentYear = new Date().getFullYear().toString();
                    const yearKpis = kpis[currentYear] || {};
                    
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
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>
              Update staff profile, contract, and monthly KPI targets
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salaryCurrency">Currency</Label>
                  <Select value={formData.salaryCurrency} onValueChange={(value) => setFormData({ ...formData, salaryCurrency: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="AED">AED (د.إ)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="salary">Monthly Salary</Label>
                  <Input
                    id="salary"
                    type="number"
                    step="0.01"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Monthly KPIs Grid */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Monthly KPI Targets</Label>
                  <Select value={selectedKpiYear} onValueChange={handleYearChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2027">2027</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                    <div key={month} className="border rounded-lg p-3 space-y-2">
                      <p className="text-sm font-medium">{getMonthName(month)}</p>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Revenue Target</label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={monthlyKpiInputs[month]?.targetRevenue || ''}
                          onChange={(e) => setMonthlyKpiInputs({
                            ...monthlyKpiInputs,
                            [month]: { ...monthlyKpiInputs[month], targetRevenue: e.target.value }
                          })}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">New Affiliates Target</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={monthlyKpiInputs[month]?.targetNewAffiliates || ''}
                          onChange={(e) => setMonthlyKpiInputs({
                            ...monthlyKpiInputs,
                            [month]: { ...monthlyKpiInputs[month], targetNewAffiliates: e.target.value }
                          })}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quarterly and Annual Totals */}
                <div className="mt-6 pt-4 border-t space-y-3">
                  <p className="text-sm font-semibold">Targets Summary</p>
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-5 text-sm">
                    {(() => {
                      const totals = calculateTotals();
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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={updateMutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Staff;
