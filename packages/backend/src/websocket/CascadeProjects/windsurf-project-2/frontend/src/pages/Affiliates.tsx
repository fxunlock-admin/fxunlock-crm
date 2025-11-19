 import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Affiliate, Broker, User } from '@/types';
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
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import DealSpecificFields from '@/components/DealSpecificFields';

const Affiliates: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null);
  const [selectedBrokerId, setSelectedBrokerId] = useState('');
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [selectedDealType, setSelectedDealType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ACTIVE');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedTrafficRegion, setSelectedTrafficRegion] = useState('');
  const [dealDetails, setDealDetails] = useState<any>({});
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: affiliates, isLoading } = useQuery<Affiliate[]>({
    queryKey: ['affiliates', searchTerm],
    queryFn: async () => {
      const response = await api.get('/affiliates', {
        params: { search: searchTerm },
      });
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
    mutationFn: (data: any) => api.post('/affiliates', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliates'] });
      setIsDialogOpen(false);
      setEditingAffiliate(null);
    },
    onError: (error: any) => {
      alert(`Error creating affiliate: ${error.response?.data?.error || error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/affiliates/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliates'] });
      setIsDialogOpen(false);
      setEditingAffiliate(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/affiliates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliates'] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      region: selectedRegion,
      country: selectedCountry,
      trafficRegion: selectedTrafficRegion,
      trafficTypes: formData.get('trafficTypes') as string,
      dealType: selectedDealType,
      dealTerms: formData.get('dealTerms'),
      dealDetails: JSON.stringify(dealDetails),
      status: selectedStatus,
      startDate: formData.get('startDate'),
      renewalDate: formData.get('renewalDate') || null,
      source: formData.get('source'),
      website: formData.get('website'),
      instagram: formData.get('instagram'),
      telegram: formData.get('telegram'),
      x: formData.get('x'),
      notes: formData.get('notes'),
      brokerId: selectedBrokerId,
      managerId: selectedManagerId,
    };

    if (editingAffiliate) {
      updateMutation.mutate({ id: editingAffiliate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleStatusChange = (affiliateId: string, newStatus: string) => {
    updateMutation.mutate({
      id: affiliateId,
      data: { status: newStatus },
    });
  };

  const handleEdit = (affiliate: Affiliate) => {
    setEditingAffiliate(affiliate);
    setSelectedBrokerId(affiliate.brokerId);
    setSelectedManagerId(affiliate.managerId);
    setSelectedDealType(affiliate.dealType);
    setSelectedStatus(affiliate.status);
    setSelectedRegion(affiliate.region || '');
    setSelectedCountry(affiliate.country || '');
    setSelectedTrafficRegion(affiliate.trafficRegion || '');
    setDealDetails(affiliate.dealDetails ? JSON.parse(affiliate.dealDetails) : {});
    setIsDialogOpen(true);
  };

  const handleOpenDialog = () => {
    setEditingAffiliate(null);
    setSelectedBrokerId('');
    setSelectedManagerId('');
    setSelectedDealType('');
    setSelectedStatus('ACTIVE');
    setSelectedRegion('');
    setSelectedCountry('');
    setSelectedTrafficRegion('');
    setDealDetails({});
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this affiliate?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'success' | 'warning' | 'destructive' | 'secondary' | 'default'; label: string }> = {
      LEAD: { variant: 'secondary', label: 'Lead' },
      ONBOARDING: { variant: 'warning', label: 'Onboarding' },
      ACTIVE: { variant: 'success', label: 'Active' },
      INACTIVE: { variant: 'destructive', label: 'Inactive' },
      // Legacy statuses for backward compatibility
      PAUSED: { variant: 'warning', label: 'Paused' },
      TERMINATED: { variant: 'destructive', label: 'Terminated' },
    };
    const config = statusConfig[status] || { variant: 'default', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getDealTypeBadge = (dealType: string) => {
    const colors: Record<string, string> = {
      CPA: 'bg-green-100 text-green-800 border-green-300',
      IB: 'bg-blue-100 text-blue-800 border-blue-300',
      PNL: 'bg-purple-100 text-purple-800 border-purple-300',
      HYBRID: 'bg-orange-100 text-orange-800 border-orange-300',
    };
    return (
      <Badge className={`${colors[dealType] || 'bg-gray-100 text-gray-800'} border`}>
        {dealType}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Affiliates</h2>
          <p className="text-muted-foreground">Manage your affiliate partners</p>
        </div>
        <Button onClick={handleOpenDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Affiliate
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search affiliates..."
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
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Broker</TableHead>
                  <TableHead>Deal Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affiliates?.map((affiliate) => (
                  <TableRow key={affiliate.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/affiliates/${affiliate.id}`)}>
                    <TableCell className="font-medium">{affiliate.name}</TableCell>
                    <TableCell>{affiliate.email}</TableCell>
                    <TableCell>{affiliate.phone || '-'}</TableCell>
                    <TableCell>{affiliate.broker?.name}</TableCell>
                    <TableCell>
                      {getDealTypeBadge(affiliate.dealType)}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Select value={affiliate.status} onValueChange={(newStatus) => handleStatusChange(affiliate.id, newStatus)}>
                        <SelectTrigger className={cn(
                          'w-32 border-2',
                          affiliate.status === 'ACTIVE' && 'border-green-500',
                          affiliate.status === 'ONBOARDING' && 'border-amber-500',
                          affiliate.status === 'LEAD' && 'border-purple-500',
                          affiliate.status === 'INACTIVE' && 'border-gray-500'
                        )}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LEAD">Lead</SelectItem>
                          <SelectItem value="ONBOARDING">Onboarding</SelectItem>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {affiliate.manager?.firstName} {affiliate.manager?.lastName}
                    </TableCell>
                    <TableCell>{formatDate(affiliate.startDate)}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/affiliates/edit/${affiliate.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user?.role === 'ADMIN' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(affiliate.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} key={editingAffiliate?.id || 'new-affiliate'}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
          <div className="px-6 pt-6">
            <DialogHeader>
              <DialogTitle>
                {editingAffiliate ? 'Edit Affiliate' : 'Add New Affiliate'}
              </DialogTitle>
              <DialogDescription>
                {editingAffiliate ? 'Update affiliate information' : 'Create a new affiliate partner'}
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="overflow-y-auto flex-1">
            <form onSubmit={handleSubmit} className="px-6" id="affiliate-form">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={editingAffiliate?.name}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={editingAffiliate?.email}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country Based</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                      <SelectItem value="IT">Italy</SelectItem>
                      <SelectItem value="ES">Spain</SelectItem>
                      <SelectItem value="NL">Netherlands</SelectItem>
                      <SelectItem value="BE">Belgium</SelectItem>
                      <SelectItem value="CH">Switzerland</SelectItem>
                      <SelectItem value="AT">Austria</SelectItem>
                      <SelectItem value="SE">Sweden</SelectItem>
                      <SelectItem value="NO">Norway</SelectItem>
                      <SelectItem value="DK">Denmark</SelectItem>
                      <SelectItem value="FI">Finland</SelectItem>
                      <SelectItem value="PL">Poland</SelectItem>
                      <SelectItem value="CZ">Czech Republic</SelectItem>
                      <SelectItem value="HU">Hungary</SelectItem>
                      <SelectItem value="RO">Romania</SelectItem>
                      <SelectItem value="GR">Greece</SelectItem>
                      <SelectItem value="PT">Portugal</SelectItem>
                      <SelectItem value="IE">Ireland</SelectItem>
                      <SelectItem value="JP">Japan</SelectItem>
                      <SelectItem value="CN">China</SelectItem>
                      <SelectItem value="IN">India</SelectItem>
                      <SelectItem value="BR">Brazil</SelectItem>
                      <SelectItem value="MX">Mexico</SelectItem>
                      <SelectItem value="ZA">South Africa</SelectItem>
                      <SelectItem value="SG">Singapore</SelectItem>
                      <SelectItem value="HK">Hong Kong</SelectItem>
                      <SelectItem value="NZ">New Zealand</SelectItem>
                      <SelectItem value="AE">United Arab Emirates</SelectItem>
                      <SelectItem value="KR">South Korea</SelectItem>
                      <SelectItem value="TH">Thailand</SelectItem>
                      <SelectItem value="MY">Malaysia</SelectItem>
                      <SelectItem value="PH">Philippines</SelectItem>
                      <SelectItem value="ID">Indonesia</SelectItem>
                      <SelectItem value="VN">Vietnam</SelectItem>
                      <SelectItem value="TW">Taiwan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trafficRegion">Traffic Region</Label>
                  <Select value={selectedTrafficRegion} onValueChange={setSelectedTrafficRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select traffic region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia">Asia</SelectItem>
                      <SelectItem value="Europe">Europe</SelectItem>
                      <SelectItem value="North America">North America</SelectItem>
                      <SelectItem value="South America">South America</SelectItem>
                      <SelectItem value="Africa">Africa</SelectItem>
                      <SelectItem value="Oceania">Oceania</SelectItem>
                      <SelectItem value="Middle East">Middle East</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      required
                      defaultValue={editingAffiliate?.phone}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brokerId">Broker *</Label>
                    <Select value={selectedBrokerId} onValueChange={setSelectedBrokerId} required>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="managerId">Manager *</Label>
                    <Select value={selectedManagerId} onValueChange={setSelectedManagerId} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {users
                          ?.filter((user) => user.role === 'ADMIN' || user.role === 'STAFF')
                          .map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.firstName} {user.lastName} ({user.role})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="source">Source</Label>
                    <Input
                      id="source"
                      name="source"
                      placeholder="Who introduced this affiliate? (e.g., John Smith, Referral Partner)"
                      defaultValue={editingAffiliate?.source || ''}
                    />
                  </div>
                </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dealType">Deal Type *</Label>
                  <Select value={selectedDealType} onValueChange={setSelectedDealType} required>
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
                  <Label htmlFor="status">Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LEAD">Lead</SelectItem>
                      <SelectItem value="ONBOARDING">Onboarding</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dynamic Deal-Specific Fields */}
              <DealSpecificFields
                dealType={selectedDealType as any}
                region=""
                onRegionChange={() => {}}
                country=""
                onCountryChange={() => {}}
                dealDetails={dealDetails}
                onDealDetailsChange={setDealDetails}
              />

              <div className="space-y-2">
                <Label htmlFor="dealTerms">Deal Notes</Label>
                <Textarea
                  id="dealTerms"
                  name="dealTerms"
                  defaultValue={editingAffiliate?.dealTerms}
                  placeholder="e.g., $500 per FTD"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  defaultValue={editingAffiliate?.startDate?.split('T')[0]}
                />
              </div>

              {/* Socials Section */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-sm mb-4">Social Media & Web</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      placeholder="https://example.com"
                      defaultValue={editingAffiliate?.website || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      name="instagram"
                      placeholder="@handle"
                      defaultValue={editingAffiliate?.instagram || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telegram">Telegram</Label>
                    <Input
                      id="telegram"
                      name="telegram"
                      placeholder="@handle or username"
                      defaultValue={editingAffiliate?.telegram || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="x">X (Twitter)</Label>
                    <Input
                      id="x"
                      name="x"
                      placeholder="@handle"
                      defaultValue={editingAffiliate?.x || ''}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={editingAffiliate?.notes}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            </form>
          </div>
          <DialogFooter className="px-6 py-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              form="affiliate-form"
              disabled={!selectedBrokerId || !selectedManagerId || !selectedDealType || createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending 
                ? 'Saving...' 
                : editingAffiliate ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Affiliates;
