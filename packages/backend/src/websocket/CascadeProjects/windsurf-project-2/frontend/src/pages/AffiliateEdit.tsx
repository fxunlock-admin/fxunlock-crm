import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Affiliate, Broker, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import DealSpecificFields from '@/components/DealSpecificFields';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const AffiliateEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState<Partial<Affiliate>>({
    name: '',
    email: '',
    phone: '',
    country: '',
    trafficRegion: '',
    source: '',
    website: '',
    instagram: '',
    telegram: '',
    x: '',
    dealType: 'CPA',
    dealTerms: '',
    notes: '',
  });
  const [dealDetails, setDealDetails] = useState<any>({});
  const [selectedBrokerId, setSelectedBrokerId] = useState('');
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ACTIVE');

  const { data: affiliate, isLoading } = useQuery<Affiliate>({
    queryKey: ['affiliate', id],
    queryFn: async () => {
      const response = await api.get(`/affiliates/${id}`);
      return response.data;
    },
    enabled: !!id,
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

  // Pre-populate manager field when creating a new affiliate
  useEffect(() => {
    if (!id && user?.id) {
      setSelectedManagerId(user.id);
    }
  }, [id, user?.id]);

  // Load affiliate data into form when it arrives
  useEffect(() => {
    if (affiliate) {
      setFormData({
        name: affiliate.name,
        email: affiliate.email,
        phone: affiliate.phone,
        address: affiliate.address,
        region: affiliate.region,
        country: affiliate.country,
        trafficRegion: affiliate.trafficRegion,
        trafficTypes: affiliate.trafficTypes,
        dealType: affiliate.dealType,
        dealTerms: affiliate.dealTerms,
        source: affiliate.source,
        website: affiliate.website,
        instagram: affiliate.instagram,
        telegram: affiliate.telegram,
        x: affiliate.x,
        notes: affiliate.notes,
      });
      setSelectedBrokerId(affiliate.brokerId);
      setSelectedManagerId(affiliate.managerId);
      setSelectedStatus(affiliate.status);
      
      // Parse deal details if it exists
      if (affiliate.dealDetails) {
        try {
          setDealDetails(JSON.parse(affiliate.dealDetails));
        } catch (e) {
          setDealDetails({});
        }
      }
    }
  }, [affiliate]);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Affiliate>) => {
      console.log('Sending update data:', data);
      const response = await api.put(`/affiliates/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      alert('Affiliate updated successfully!');
      navigate(`/affiliates/${id}`);
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      const errorMsg = error.response?.data?.details || error.response?.data?.error || error.message;
      alert('Failed to update affiliate: ' + errorMsg);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      ...formData,
      status: selectedStatus as any,
      brokerId: selectedBrokerId,
      managerId: selectedManagerId,
      dealDetails: JSON.stringify(dealDetails),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading affiliate details...</div>
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-lg">Affiliate not found</div>
        <Button onClick={() => navigate('/affiliates')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Affiliates
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(`/affiliates/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Affiliate</h2>
          <p className="text-muted-foreground">{formData.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country Based</Label>
                <Select value={formData.country || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}>
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
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  name="source"
                  value={formData.source || ''}
                  onChange={handleChange}
                  placeholder="Who introduced this affiliate?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trafficRegion">Traffic Region</Label>
                <Select value={formData.trafficRegion || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, trafficRegion: value }))}>
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
            </div>
          </CardContent>
        </Card>

        {/* Broker & Manager */}
        <Card>
          <CardHeader>
            <CardTitle>Broker & Manager</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="managerId">Manager *</Label>
                <Select value={selectedManagerId} onValueChange={setSelectedManagerId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select manager" />
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
            </div>
          </CardContent>
        </Card>

        {/* Deal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Deal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dealType">Deal Type *</Label>
                <Select 
                  value={formData.dealType || 'CPA'} 
                  onValueChange={(value) => setFormData({ ...formData, dealType: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select deal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CPA">CPA</SelectItem>
                    <SelectItem value="REBATES">REBATES</SelectItem>
                    <SelectItem value="PNL">PNL</SelectItem>
                    <SelectItem value="HYBRID">HYBRID</SelectItem>
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
            <div className="space-y-2">
              <Label htmlFor="dealTerms">Deal Terms</Label>
              <Textarea
                id="dealTerms"
                name="dealTerms"
                value={formData.dealTerms || ''}
                onChange={handleChange}
                rows={3}
                placeholder="Enter deal terms..."
              />
            </div>

            {/* Deal-Specific Fields */}
            <DealSpecificFields
              dealType={formData.dealType as any}
              region={formData.region || ''}
              onRegionChange={(region) => setFormData({ ...formData, region })}
              country={formData.country || ''}
              onCountryChange={(country) => setFormData({ ...formData, country })}
              dealDetails={dealDetails}
              onDealDetailsChange={setDealDetails}
            />
          </CardContent>
        </Card>

        {/* Social Media & Web */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media & Web</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website || ''}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  name="instagram"
                  value={formData.instagram || ''}
                  onChange={handleChange}
                  placeholder="@handle"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telegram">Telegram</Label>
                <Input
                  id="telegram"
                  name="telegram"
                  value={formData.telegram || ''}
                  onChange={handleChange}
                  placeholder="@handle or username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="x">X (Twitter)</Label>
                <Input
                  id="x"
                  name="x"
                  value={formData.x || ''}
                  onChange={handleChange}
                  placeholder="@handle"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows={5}
              placeholder="Add any additional notes about this affiliate..."
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/affiliates/${id}`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AffiliateEdit;
