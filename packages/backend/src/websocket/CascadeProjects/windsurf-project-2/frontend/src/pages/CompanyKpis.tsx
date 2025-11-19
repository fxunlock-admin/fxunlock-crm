import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { formatCurrency, getMonthName } from '@/lib/utils';
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
  TooltipProps,
} from 'recharts';

interface CompanyKpi {
  id: string;
  year: number;
  month: number;
  quarter?: number;
  targetRevenue: number;
  actualRevenue: number;
  targetAffiliates: number;
  actualAffiliates: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface KpiSummary {
  monthly: CompanyKpi[];
  quarterly: Array<{
    quarter: number;
    targetRevenue: number;
    actualRevenue: number;
    targetAffiliates: number;
    actualAffiliates: number;
  }>;
  annual: {
    year: number;
    targetRevenue: number;
    actualRevenue: number;
    targetAffiliates: number;
    actualAffiliates: number;
  };
}

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [
  CURRENT_YEAR + 2,
  CURRENT_YEAR + 1,
  CURRENT_YEAR,
  CURRENT_YEAR - 1,
  CURRENT_YEAR - 2,
].map(y => y.toString());

// Custom tooltip with no background
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        backgroundColor: 'transparent', 
        border: 'none',
        padding: '4px 8px',
        margin: '0',
        boxShadow: 'none',
        outline: 'none',
        pointerEvents: 'none',
        position: 'relative',
        zIndex: 1000,
        transform: 'translateY(-40px)'
      }}>
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{ 
            color: entry.color,
            fontSize: '12px',
            padding: '2px 0',
            margin: '0',
            fontWeight: 500
          }}>
            {entry.name}: {formatCurrency(entry.value)}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CompanyKpis: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<string>(CURRENT_YEAR.toString());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<CompanyKpi | null>(null);
  const [formData, setFormData] = useState({
    month: '1',
    targetRevenue: '',
    targetNewAffiliates: '',
    notes: '',
  });
  const queryClient = useQueryClient();

  const { data: kpiSummary } = useQuery<KpiSummary>({
    queryKey: ['company-kpi-summary', selectedYear],
    queryFn: async () => {
      const response = await api.get('/company-kpis/summary', {
        params: { year: selectedYear },
      });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/company-kpis', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-kpi-summary'] });
      setIsDialogOpen(false);
      resetForm();
      alert('✅ KPI created successfully!');
    },
    onError: (error: any) => {
      console.error('Error creating KPI:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Unknown error';
      alert(`❌ Error creating KPI: ${errorMsg}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/company-kpis/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-kpi-summary'] });
      setIsDialogOpen(false);
      setEditingKpi(null);
      resetForm();
      alert('✅ KPI updated successfully!');
    },
    onError: (error: any) => {
      console.error('Error updating KPI:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Unknown error';
      alert(`❌ Error updating KPI: ${errorMsg}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/company-kpis/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-kpi-summary'] });
    },
  });

  const resetForm = () => {
    setFormData({
      month: '1',
      targetRevenue: '',
      targetNewAffiliates: '',
      notes: '',
    });
  };

  const handleEdit = (kpi: CompanyKpi) => {
    setEditingKpi(kpi);
    setFormData({
      month: kpi.month.toString(),
      targetRevenue: kpi.targetRevenue.toString(),
      targetNewAffiliates: kpi.targetNewAffiliates.toString(),
      notes: kpi.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.targetRevenue || !formData.targetNewAffiliates) {
      alert('Please fill in all required fields');
      return;
    }

    const data = {
      year: parseInt(selectedYear),
      month: parseInt(formData.month),
      targetRevenue: parseFloat(formData.targetRevenue),
      targetAffiliates: parseInt(formData.targetNewAffiliates),
      notes: formData.notes || null,
    };

    console.log('Submitting KPI data:', data);

    if (editingKpi) {
      updateMutation.mutate({ id: editingKpi.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this KPI?')) {
      deleteMutation.mutate(id);
    }
  };

  const getAchievementPercentage = (actual: number, target: number) => {
    return target > 0 ? Math.round((actual / target) * 100) : 0;
  };

  const getAchievementColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const monthlyChartData = (kpiSummary?.monthly || []).map(kpi => ({
    name: getMonthName(kpi.month),
    target: kpi.targetRevenue,
    actual: kpi.actualRevenue,
  }));

  const quarterlyChartData = (kpiSummary?.quarterly || []).map(q => ({
    name: `Q${q.quarter}`,
    target: q.targetRevenue,
    actual: q.actualRevenue,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Company KPIs</h2>
          <p className="text-muted-foreground">Track monthly KPI targets for revenue and new affiliates</p>
        </div>
        <div className="flex gap-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
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
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Year
          </Button>
        </div>
      </div>

      {/* Annual Summary */}
      {kpiSummary?.annual && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Annual Revenue Target</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(kpiSummary.annual.targetRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Actual: {formatCurrency(kpiSummary.annual.actualRevenue)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Revenue Achievement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getAchievementColor(getAchievementPercentage(kpiSummary.annual.actualRevenue, kpiSummary.annual.targetRevenue))}`}>
                {getAchievementPercentage(kpiSummary.annual.actualRevenue, kpiSummary.annual.targetRevenue)}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">New Affiliates Target</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiSummary.annual.targetAffiliates}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Actual: {kpiSummary.annual.actualAffiliates}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Affiliate Achievement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getAchievementColor(getAchievementPercentage(kpiSummary.annual.actualAffiliates, kpiSummary.annual.targetAffiliates))}`}>
                {getAchievementPercentage(kpiSummary.annual.actualAffiliates, kpiSummary.annual.targetAffiliates)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monthly KPIs Grid */}
      <div>
        <h3 className="text-xl font-bold mb-4">{selectedYear}</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => {
            const monthKpi = kpiSummary?.monthly?.find(k => k.month === month);
            const revenueAchievement = monthKpi ? getAchievementPercentage(monthKpi.actualRevenue, monthKpi.targetRevenue) : 0;
            const affiliateAchievement = monthKpi ? getAchievementPercentage(monthKpi.actualNewAffiliates, monthKpi.targetNewAffiliates) : 0;
            
            return (
              <Card key={month} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{getMonthName(month)}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (monthKpi) {
                          handleEdit(monthKpi);
                        } else {
                          setEditingKpi(null);
                          setFormData({
                            month: month.toString(),
                            targetRevenue: '',
                            targetNewAffiliates: '',
                            notes: '',
                          });
                          setIsDialogOpen(true);
                        }
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Revenue Section */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Revenue Target</p>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-2xl font-bold">{monthKpi ? formatCurrency(monthKpi.targetRevenue) : '-'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Actual: {monthKpi ? formatCurrency(monthKpi.actualRevenue) : '-'}
                      </p>
                      {monthKpi && (
                        <Badge className={`mt-2 ${getAchievementColor(revenueAchievement)}`}>
                          {revenueAchievement}%
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* New Affiliates Section */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">New Affiliates Target</p>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-2xl font-bold">{monthKpi ? monthKpi.targetAffiliates : '-'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Actual: {monthKpi ? monthKpi.actualAffiliates : '-'}
                      </p>
                      {monthKpi && (
                        <Badge className={`mt-2 ${getAchievementColor(affiliateAchievement)}`}>
                          {affiliateAchievement}%
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  {monthKpi && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(monthKpi.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingKpi ? 'Edit KPI' : 'Add New KPI'}</DialogTitle>
            <DialogDescription>
              {editingKpi ? 'Update KPI targets' : 'Create a new monthly KPI'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Select value={formData.month} onValueChange={(value) => setFormData({ ...formData, month: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        {getMonthName(month)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetRevenue">Target Revenue</Label>
                <Input
                  id="targetRevenue"
                  type="number"
                  step="0.01"
                  value={formData.targetRevenue}
                  onChange={(e) => setFormData({ ...formData, targetRevenue: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetNewAffiliates">Target New Affiliates</Label>
                <Input
                  id="targetNewAffiliates"
                  type="number"
                  value={formData.targetNewAffiliates}
                  onChange={(e) => setFormData({ ...formData, targetNewAffiliates: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any notes..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={createMutation.isPending || updateMutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingKpi ? 'Update' : 'Create')} KPI
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyKpis;
