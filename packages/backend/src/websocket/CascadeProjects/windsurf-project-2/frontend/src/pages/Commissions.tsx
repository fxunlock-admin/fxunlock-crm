import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Commission, Affiliate, Broker, User } from '@/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { Plus, Search, Edit, Trash2, Upload } from 'lucide-react';
import { formatCurrency, formatDate, getMonthName } from '@/lib/utils';

const Revenue: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null);
  const [csvData, setCsvData] = useState('');
  const [selectedStaffMemberId, setSelectedStaffMemberId] = useState('');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: commissions, isLoading } = useQuery<Commission[]>({
    queryKey: ['commissions'],
    queryFn: async () => {
      const response = await api.get('/commissions');
      return response.data;
    },
  });

  const { data: affiliates } = useQuery<Affiliate[]>({
    queryKey: ['affiliates'],
    queryFn: async () => {
      const response = await api.get('/affiliates');
      return response.data;
    },
  });

  const { data: brokers } = useQuery<Broker[]>({
    queryKey: ['brokers'],
    queryFn: async () => {
      const response = await api.get('/brokers');
      return response.data;
    },
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/commissions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['staff-performance'] });
      setIsDialogOpen(false);
      setEditingCommission(null);
      setSelectedStaffMemberId('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/commissions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['staff-performance'] });
      setIsDialogOpen(false);
      setEditingCommission(null);
      setSelectedStaffMemberId('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/commissions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['staff-performance'] });
    },
  });
  const bulkCreateMutation = useMutation({
    mutationFn: (csvData: string) => api.post('/commissions/bulk', { csvData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['staff-performance'] });
      setIsBulkDialogOpen(false);
      setCsvData('');
      alert('Bulk import completed!');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      month: parseInt(formData.get('month') as string),
      year: parseInt(formData.get('year') as string),
      dealType: formData.get('dealType'),
      revenueAmount: parseFloat(formData.get('revenueAmount') as string),
      status: formData.get('status'),
      paidDate: formData.get('paidDate') || null,
      notes: formData.get('notes'),
      affiliateId: formData.get('affiliateId'),
      brokerId: formData.get('brokerId'),
      staffMemberId: selectedStaffMemberId || null,
    };

    if (editingCommission) {
      updateMutation.mutate({ id: editingCommission.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleBulkImport = () => {
    if (!csvData.trim()) {
      alert('Please enter CSV data');
      return;
    }
    bulkCreateMutation.mutate(csvData);
  };

  const handleEdit = (commission: Commission) => {
    setEditingCommission(commission);
    setSelectedStaffMemberId(commission.staffMemberId || '');
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this commission?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredCommissions = commissions?.filter((commission) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      commission.affiliate?.name.toLowerCase().includes(searchLower) ||
      commission.broker?.name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Revenue</h2>
          <p className="text-muted-foreground">Track monthly deals and payments</p>
        </div>
        {user?.role === 'ADMIN' && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsBulkDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Bulk Import
            </Button>
            <Button onClick={() => { setEditingCommission(null); setSelectedStaffMemberId(''); setIsDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Revenue
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search commissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Affiliate</TableHead>
                  <TableHead>Broker</TableHead>
                  <TableHead>Deal Type</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommissions?.map((commission) => (
                  <TableRow key={commission.id}>
                    <TableCell className="font-medium">
                      {getMonthName(commission.month)} {commission.year}
                    </TableCell>
                    <TableCell>{commission.affiliate?.name}</TableCell>
                    <TableCell>{commission.broker?.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{commission.dealType}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(commission.revenueAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={commission.status === 'PAID' ? 'success' : 'warning'}>
                        {commission.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {commission.paidDate ? formatDate(commission.paidDate) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {user?.role === 'ADMIN' && (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(commission)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(commission.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setEditingCommission(null);
          setSelectedStaffMemberId('');
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCommission ? 'Edit Revenue' : 'Add New Revenue'}
            </DialogTitle>
            <DialogDescription>
              {editingCommission ? 'Update revenue information' : 'Create a new revenue record'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="month">Month *</Label>
                  <Select name="month" defaultValue={editingCommission?.month.toString()} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <SelectItem key={month} value={month.toString()}>
                          {getMonthName(month)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    min="2020"
                    max="2100"
                    defaultValue={editingCommission?.year || new Date().getFullYear()}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="affiliateId">Affiliate *</Label>
                  <Select name="affiliateId" defaultValue={editingCommission?.affiliateId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select affiliate" />
                    </SelectTrigger>
                    <SelectContent>
                      {affiliates?.map((affiliate) => (
                        <SelectItem key={affiliate.id} value={affiliate.id}>
                          {affiliate.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brokerId">Broker *</Label>
                  <Select name="brokerId" defaultValue={editingCommission?.brokerId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select broker" />
                    </SelectTrigger>
                    <SelectContent>
                      {brokers?.map((broker) => (
                        <SelectItem key={broker.id} value={broker.id}>
                          {broker.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="staffMemberId">Staff Member</Label>
                <Select value={selectedStaffMemberId} onValueChange={setSelectedStaffMemberId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dealType">Deal Type *</Label>
                  <Select name="dealType" defaultValue={editingCommission?.dealType} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select deal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CPA">CPA</SelectItem>
                      <SelectItem value="REBATES">Rebates</SelectItem>
                      <SelectItem value="PNL">PnL</SelectItem>
                      <SelectItem value="HYBRID">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="revenueAmount">Revenue Amount *</Label>
                  <Input
                    id="revenueAmount"
                    name="revenueAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editingCommission?.revenueAmount}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select name="status" defaultValue={editingCommission?.status || 'PENDING'} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paidDate">Paid Date</Label>
                  <Input
                    id="paidDate"
                    name="paidDate"
                    type="date"
                    defaultValue={editingCommission?.paidDate?.split('T')[0]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={editingCommission?.notes}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCommission ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Bulk Import Revenue</DialogTitle>
            <DialogDescription>
              Import multiple revenue records from CSV data. Required columns: affiliateEmail, brokerName, month, year, revenueAmount
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>CSV Format Example:</Label>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`affiliateEmail,brokerName,month,year,dealType,revenueAmount,status,paidDate,notes
affiliate1@example.com,Global FX Trading,11,2024,CPA,2500,PAID,2024-11-15,Payment processed
affiliate2@example.com,Premium Markets Ltd,11,2024,IB,3200,PENDING,,Awaiting payment`}
              </pre>
            </div>
            <div className="space-y-2">
              <Label htmlFor="csvData">CSV Data</Label>
              <Textarea
                id="csvData"
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder="Paste your CSV data here..."
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkImport} disabled={bulkCreateMutation.isPending}>
              {bulkCreateMutation.isPending ? 'Importing...' : 'Import'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Revenue;
