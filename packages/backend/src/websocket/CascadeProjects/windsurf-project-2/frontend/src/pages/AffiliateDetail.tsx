import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Affiliate } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Building2, User, Edit, CalendarPlus, ExternalLink, Trash2, CheckCircle, Globe, Instagram, Send, Twitter } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const countryMap: Record<string, string> = {
  US: 'United States',
  CA: 'Canada',
  GB: 'United Kingdom',
  AU: 'Australia',
  DE: 'Germany',
  FR: 'France',
  IT: 'Italy',
  ES: 'Spain',
  NL: 'Netherlands',
  BE: 'Belgium',
  CH: 'Switzerland',
  AT: 'Austria',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  FI: 'Finland',
  PL: 'Poland',
  CZ: 'Czech Republic',
  HU: 'Hungary',
  RO: 'Romania',
  GR: 'Greece',
  PT: 'Portugal',
  IE: 'Ireland',
  JP: 'Japan',
  CN: 'China',
  IN: 'India',
  BR: 'Brazil',
  MX: 'Mexico',
  ZA: 'South Africa',
  SG: 'Singapore',
  HK: 'Hong Kong',
  NZ: 'New Zealand',
  AE: 'United Arab Emirates',
  KR: 'South Korea',
  TH: 'Thailand',
  MY: 'Malaysia',
  PH: 'Philippines',
  ID: 'Indonesia',
  VN: 'Vietnam',
  TW: 'Taiwan',
};
import AffiliateNotes from '@/components/AffiliateNotes';

interface Appointment {
  id: string;
  title: string;
  appointmentType: string;
  scheduledAt: string;
  notes?: string;
  status: string;
  affiliate: {
    id: string;
    name: string;
  };
  user: {
    firstName: string;
    lastName: string;
  };
}

const AffiliateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAppointmentForm, setShowAppointmentForm] = React.useState(false);
  const [appointmentTitle, setAppointmentTitle] = React.useState('');
  const [appointmentType, setAppointmentType] = React.useState<'MEETING' | 'CALL' | 'FOLLOW_UP'>('MEETING');
  const [appointmentDate, setAppointmentDate] = React.useState('');
  const [appointmentNotes, setAppointmentNotes] = React.useState('');

  const { data: affiliate, isLoading } = useQuery<Affiliate>({
    queryKey: ['affiliate', id],
    queryFn: async () => {
      const response = await api.get(`/affiliates/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const { data: appointments } = useQuery<Appointment[]>({
    queryKey: ['appointments', id],
    queryFn: async () => {
      const response = await api.get(`/appointments?affiliateId=${id}&upcoming=true`);
      return response.data;
    },
    enabled: !!id,
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Creating appointment with data:', data);
      const response = await api.post('/appointments', data);
      console.log('Appointment created:', response.data);
      return response.data;
    },
    onSuccess: () => {
      console.log('Appointment created successfully, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['appointments', id] });
      setShowAppointmentForm(false);
      setAppointmentTitle('');
      setAppointmentType('MEETING');
      setAppointmentDate('');
      setAppointmentNotes('');
    },
    onError: (error: any) => {
      console.error('Appointment creation error:', error);
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ appointmentId, status }: { appointmentId: string; status: string }) => {
      const response = await api.put(`/appointments/${appointmentId}`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', id] });
    },
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      await api.delete(`/appointments/${appointmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', id] });
    },
  });

  const handleScheduleAppointment = async () => {
    if (!appointmentTitle || !appointmentDate) {
      alert('Please fill in title and date');
      return;
    }

    if (!id) {
      alert('Affiliate ID is missing');
      return;
    }

    try {
      await createAppointmentMutation.mutateAsync({
        title: appointmentTitle,
        appointmentType,
        scheduledAt: appointmentDate,
        notes: appointmentNotes,
        affiliateId: id,
      });
      alert('Appointment scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      alert('Failed to schedule appointment. Check console for details.');
    }
  };

  const generateGoogleCalendarLink = (appointment: Appointment) => {
    const startDate = new Date(appointment.scheduledAt);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later
    
    const formatDateForGoogle = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: appointment.title,
      dates: `${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}`,
      details: appointment.notes || '',
      location: 'Online',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'success' | 'warning' | 'destructive' | 'secondary' | 'default'; label: string }> = {
      LEAD: { variant: 'secondary', label: 'Lead' },
      ONBOARDING: { variant: 'warning', label: 'Onboarding' },
      ACTIVE: { variant: 'success', label: 'Active' },
      INACTIVE: { variant: 'destructive', label: 'Inactive' },
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/affiliates')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{affiliate.name}</h2>
            <p className="text-muted-foreground">Affiliate Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          {getStatusBadge(affiliate.status)}
          {getDealTypeBadge(affiliate.dealType)}
          <Button variant="outline" onClick={() => navigate(`/affiliates/edit/${affiliate.id}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Contact & Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="text-sm font-medium">Email</div>
                  <a href={`mailto:${affiliate.email}`} className="text-sm text-blue-600 hover:underline">
                    {affiliate.email}
                  </a>
                </div>
              </div>
              {affiliate.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-purple-600" />
                  <div>
                    <div className="text-sm font-medium">Phone</div>
                    <a href={`tel:${affiliate.phone}`} className="text-sm text-blue-600 hover:underline">
                      {affiliate.phone}
                    </a>
                  </div>
                </div>
              )}
              {affiliate.country && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-purple-600" />
                  <div>
                    <div className="text-sm font-medium">Country Based</div>
                    <div className="text-sm">{countryMap[affiliate.country] || affiliate.country}</div>
                  </div>
                </div>
              )}
              {affiliate.source && (
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-sm font-medium">Source</div>
                    <div className="text-sm">{affiliate.source}</div>
                  </div>
                </div>
              )}
              {affiliate.trafficRegion && (
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-sm font-medium">Traffic Region</div>
                    <div className="text-sm">{affiliate.trafficRegion}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Broker */}
          <Card>
            <CardHeader>
              <CardTitle>Broker</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-sm font-medium">Broker</div>
                  <div className="text-sm">{affiliate.broker?.name || 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-sm font-medium">Account Manager</div>
                  <div className="text-sm">
                    {affiliate.manager?.firstName} {affiliate.manager?.lastName}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deal Structure */}
          <Card>
            <CardHeader>
              <CardTitle>Deal Structure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Deal Type</div>
                <div>{getDealTypeBadge(affiliate.dealType)}</div>
              </div>

              {/* Deal-Specific Details */}
              {affiliate.dealDetails && (() => {
                try {
                  const details = JSON.parse(affiliate.dealDetails);
                  return (
                    <div className="space-y-3">
                      <div className="text-sm font-semibold">Deal Details</div>
                      
                      {/* CPA Deal Type */}
                      {affiliate.dealType === 'CPA' && (
                        <>
                          {details.ftdsPerMonth && (
                            <div className="text-sm">
                              <span className="font-medium">FTDs per Month:</span> {details.ftdsPerMonth}
                            </div>
                          )}
                          {details.expectedROI && (
                            <div className="text-sm">
                              <span className="font-medium">Expected ROI:</span> {details.expectedROI}%
                            </div>
                          )}
                          {details.cpaTiers && details.cpaTiers.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-sm font-medium">CPA Tiers:</div>
                              {details.cpaTiers.map((tier: any, idx: number) => (
                                <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                                  <div>{tier.tierName}</div>
                                  <div>Deposit: ${tier.depositAmount} → CPA: ${tier.cpaAmount}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}

                      {/* REBATES Deal Type */}
                      {affiliate.dealType === 'REBATES' && (
                        <>
                          {details.netDepositsPerMonth && (
                            <div className="text-sm">
                              <span className="font-medium">Net Deposits/Month:</span> ${details.netDepositsPerMonth}
                            </div>
                          )}
                          {details.expectedVolumePerMonth && (
                            <div className="text-sm">
                              <span className="font-medium">Expected Volume/Month:</span> {details.expectedVolumePerMonth} lots
                            </div>
                          )}
                          {details.rebatesPerLot && (
                            <div className="text-sm">
                              <span className="font-medium">Rebates per Lot:</span> ${details.rebatesPerLot}
                            </div>
                          )}
                        </>
                      )}

                      {/* PNL Deal Type */}
                      {affiliate.dealType === 'PNL' && (
                        <>
                          {details.netDepositsPerMonth && (
                            <div className="text-sm">
                              <span className="font-medium">Net Deposits/Month:</span> ${details.netDepositsPerMonth}
                            </div>
                          )}
                          {details.pnlDealNeeded && (
                            <div className="text-sm">
                              <span className="font-medium">PnL Deal Needed:</span> {details.pnlDealNeeded}
                            </div>
                          )}
                        </>
                      )}

                      {/* HYBRID Deal Type */}
                      {affiliate.dealType === 'HYBRID' && (
                        <>
                          {details.netDepositsPerMonth && (
                            <div className="text-sm">
                              <span className="font-medium">Net Deposits/Month:</span> ${details.netDepositsPerMonth}
                            </div>
                          )}
                          {details.expectedVolumePerMonth && (
                            <div className="text-sm">
                              <span className="font-medium">Expected Volume/Month:</span> {details.expectedVolumePerMonth} lots
                            </div>
                          )}
                          {details.rebatesPerLot && (
                            <div className="text-sm">
                              <span className="font-medium">Rebates per Lot:</span> ${details.rebatesPerLot}
                            </div>
                          )}
                          {details.cpaTiers && details.cpaTiers.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-sm font-medium">CPA Tiers:</div>
                              {details.cpaTiers.map((tier: any, idx: number) => (
                                <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                                  <div>{tier.tierName}</div>
                                  <div>Deposit: ${tier.depositAmount} → CPA: ${tier.cpaAmount}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                } catch (e) {
                  return null;
                }
              })()}
              
              {affiliate.dealTerms && (
                <div className="border-t pt-4 space-y-2">
                  <div className="text-sm font-medium">Deal Notes</div>
                  <div className="text-sm whitespace-pre-wrap">{affiliate.dealTerms}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Social Media & Web */}
          {(affiliate.website || affiliate.instagram || affiliate.telegram || affiliate.x) && (
            <Card>
              <CardHeader>
                <CardTitle>Social Media & Web</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {affiliate.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="text-sm font-medium">Website</div>
                      <a href={affiliate.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                        {affiliate.website}
                      </a>
                    </div>
                  </div>
                )}
                {affiliate.instagram && (
                  <div className="flex items-center gap-3">
                    <Instagram className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="text-sm font-medium">Instagram</div>
                      <a href={`https://instagram.com/${affiliate.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        {affiliate.instagram}
                      </a>
                    </div>
                  </div>
                )}
                {affiliate.telegram && (
                  <div className="flex items-center gap-3">
                    <Send className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="text-sm font-medium">Telegram</div>
                      <a href={`https://t.me/${affiliate.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        {affiliate.telegram}
                      </a>
                    </div>
                  </div>
                )}
                {affiliate.x && (
                  <div className="flex items-center gap-3">
                    <Twitter className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="text-sm font-medium">X (Twitter)</div>
                      <a href={`https://x.com/${affiliate.x.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        {affiliate.x}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* General Notes */}
          {affiliate.notes && (
            <Card>
              <CardHeader>
                <CardTitle>General Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{affiliate.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Appointments & Activity Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointment Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Appointments</span>
                <Button 
                  size="sm" 
                  onClick={() => setShowAppointmentForm(!showAppointmentForm)}
                >
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  {showAppointmentForm ? 'Cancel' : 'New'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Appointment Form */}
              {showAppointmentForm && (
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <input 
                      type="text"
                      className="w-full p-2 border rounded-md"
                      value={appointmentTitle}
                      onChange={(e) => setAppointmentTitle(e.target.value)}
                      placeholder="e.g., Quarterly Review"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Type</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={appointmentType}
                      onChange={(e) => setAppointmentType(e.target.value as any)}
                    >
                      <option value="MEETING">Meeting</option>
                      <option value="CALL">Call</option>
                      <option value="FOLLOW_UP">Follow Up</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Date</label>
                    <input 
                      type="date" 
                      className="w-full p-2 border rounded-md"
                      value={appointmentDate.split('T')[0] || ''}
                      onChange={(e) => {
                        const time = appointmentDate.split('T')[1] || '09:00';
                        setAppointmentDate(`${e.target.value}T${time}`);
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Hour (05:00 - 00:00)</label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={appointmentDate.split('T')[1]?.split(':')[0] || '09'}
                        onChange={(e) => {
                          const date = appointmentDate.split('T')[0] || new Date().toISOString().split('T')[0];
                          const minute = appointmentDate.split('T')[1]?.split(':')[1] || '00';
                          setAppointmentDate(`${date}T${e.target.value.padStart(2, '0')}:${minute}`);
                        }}
                      >
                        {Array.from({ length: 20 }, (_, i) => {
                          const hour = ((i + 5) % 24).toString().padStart(2, '0');
                          const displayHour = (i + 5) % 24;
                          const label = displayHour === 0 ? '00:00 (Midnight)' : `${hour}:00`;
                          return (
                            <option key={i} value={hour}>
                              {label}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Minutes</label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={appointmentDate.split('T')[1]?.split(':')[1] || '00'}
                        onChange={(e) => {
                          const date = appointmentDate.split('T')[0] || new Date().toISOString().split('T')[0];
                          const hour = appointmentDate.split('T')[1]?.split(':')[0] || '09';
                          setAppointmentDate(`${date}T${hour}:${e.target.value}`);
                        }}
                      >
                        {Array.from({ length: 4 }, (_, i) => {
                          const minutes = (i * 15).toString().padStart(2, '0');
                          return (
                            <option key={i} value={minutes}>
                              :{minutes}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Notes</label>
                    <textarea 
                      className="w-full p-2 border rounded-md" 
                      rows={3}
                      value={appointmentNotes}
                      onChange={(e) => setAppointmentNotes(e.target.value)}
                      placeholder="Add notes about this appointment..."
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleScheduleAppointment}
                    disabled={createAppointmentMutation.isPending}
                  >
                    {createAppointmentMutation.isPending ? 'Scheduling...' : 'Schedule Appointment'}
                  </Button>
                </div>
              )}

              {/* Upcoming Appointments List */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Upcoming Appointments</h4>
                {appointments && appointments.length > 0 ? (
                  appointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{appointment.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(appointment.scheduledAt).toLocaleString()}
                          </div>
                          <Badge variant="outline" className="mt-1">
                            {appointment.appointmentType}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateAppointmentMutation.mutate({ 
                              appointmentId: appointment.id, 
                              status: 'COMPLETED' 
                            })}
                            title="Mark as completed"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm('Delete this appointment?')) {
                                deleteAppointmentMutation.mutate(appointment.id);
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(generateGoogleCalendarLink(appointment), '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Add to Google Calendar
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No upcoming appointments
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Activity Notes */}
          <AffiliateNotes affiliateId={affiliate.id} />
        </div>
      </div>
    </div>
  );
};

export default AffiliateDetail;
