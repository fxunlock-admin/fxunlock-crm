import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Broker } from '@/types';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Check } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const DEAL_TYPES = ['CPA', 'REBATES', 'HYBRID', 'PNL'];

const Brokers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBroker, setEditingBroker] = useState<Broker | null>(null);
  const [selectedDealTypes, setSelectedDealTypes] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: brokers, isLoading } = useQuery<Broker[]>({
    queryKey: ['brokers', searchTerm],
    queryFn: async () => {
      const response = await api.get('/brokers', {
        params: { search: searchTerm },
      });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/brokers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokers'] });
      setIsDialogOpen(false);
      setEditingBroker(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => {
      console.log('Updating broker:', { id, data });
      return api.put(`/brokers/${id}`, data);
    },
    onSuccess: (response) => {
      console.log('Broker updated successfully:', response);
      queryClient.invalidateQueries({ queryKey: ['brokers'] });
      setIsDialogOpen(false);
      setEditingBroker(null);
      setSelectedDealTypes([]);
    },
    onError: (error: any) => {
      console.error('Update broker error:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.details || error.response?.data?.error || error.message;
      alert('Failed to update broker: ' + errorMsg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/brokers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokers'] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = {
      name: formData.get('name'),
      accountManager: formData.get('accountManager') || null,
      contactEmail: formData.get('contactEmail') || null,
      contactPhone: formData.get('contactPhone') || null,
      agreementDate: formData.get('agreementDate') || null,
      dealTypes: selectedDealTypes.length > 0 ? selectedDealTypes.join(',') : null,
      masterDealTerms: formData.get('masterDealTerms') || null,
      notes: formData.get('notes') || null,
    };

    // Only add isActive for new brokers
    if (!editingBroker) {
      data.isActive = true;
    }

    console.log('Form submit data:', data);

    if (editingBroker) {
      updateMutation.mutate({ id: editingBroker.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (broker: Broker) => {
    setEditingBroker(broker);
    setSelectedDealTypes(broker.dealTypes ? broker.dealTypes.split(',') : []);
    setIsDialogOpen(true);
  };

  const toggleDealType = (dealType: string) => {
    setSelectedDealTypes((prev) =>
      prev.includes(dealType)
        ? prev.filter((t) => t !== dealType)
        : [...prev, dealType]
    );
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Reset state when dialog closes
      setEditingBroker(null);
      setSelectedDealTypes([]);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this broker?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Brokers</h2>
          <p className="text-muted-foreground">Manage your broker partnerships</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Button onClick={() => { setEditingBroker(null); setIsDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Broker
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search brokers..."
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
                  <TableHead>Account Manager</TableHead>
                  <TableHead>Contact Email</TableHead>
                  <TableHead>Deal Types</TableHead>
                  <TableHead>Affiliates</TableHead>
                  <TableHead>Agreement Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brokers?.map((broker) => (
                  <TableRow key={broker.id}>
                    <TableCell className="font-medium">{broker.name}</TableCell>
                    <TableCell>{broker.accountManager || '-'}</TableCell>
                    <TableCell>{broker.contactEmail || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {broker.dealTypes ? (
                          broker.dealTypes.split(',').map((type: string) => (
                            <Badge key={type} variant="outline">
                              {type}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {broker._count?.affiliates || 0} affiliates
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {broker.agreementDate ? formatDate(broker.agreementDate) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={broker.isActive ? 'success' : 'destructive'}>
                        {broker.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {user?.role === 'ADMIN' && (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(broker)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(broker.id)}
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

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingBroker ? 'Edit Broker' : 'Add New Broker'}
            </DialogTitle>
            <DialogDescription>
              {editingBroker ? 'Update broker information' : 'Create a new broker partnership'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Broker Name *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingBroker?.name}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountManager">Account Manager</Label>
                  <Input
                    id="accountManager"
                    name="accountManager"
                    defaultValue={editingBroker?.accountManager}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    defaultValue={editingBroker?.contactEmail}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  defaultValue={editingBroker?.contactPhone}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agreementDate">Agreement Date</Label>
                <Input
                  id="agreementDate"
                  name="agreementDate"
                  type="date"
                  defaultValue={editingBroker?.agreementDate?.split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label>Deal Types</Label>
                <div className="flex flex-wrap gap-2">
                  {DEAL_TYPES.map((dealType) => (
                    <button
                      key={dealType}
                      type="button"
                      onClick={() => toggleDealType(dealType)}
                      className={`px-4 py-2 rounded-md border-2 transition-all flex items-center gap-2 ${
                        selectedDealTypes.includes(dealType)
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                    >
                      {selectedDealTypes.includes(dealType) && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                      {dealType}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="masterDealTerms">Master Deal Terms</Label>
                <Textarea
                  id="masterDealTerms"
                  name="masterDealTerms"
                  defaultValue={editingBroker?.masterDealTerms}
                  placeholder="e.g., CPA: $500 per FTD, IB: $8 per lot"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={editingBroker?.notes}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingBroker ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Brokers;
