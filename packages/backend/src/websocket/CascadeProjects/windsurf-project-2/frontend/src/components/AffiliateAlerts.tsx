import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import api from '@/lib/api';

interface AffiliateAlert {
  affiliateId: string;
  affiliateName: string;
  managerId: string;
  managerName: string;
  missingItems: string[];
  lastUpdated: string;
}

export const AffiliateAlerts: React.FC = () => {
  const { data: alerts, isLoading, error } = useQuery<AffiliateAlert[], Error>({
    queryKey: ['affiliate-alerts'],
    queryFn: async () => {
      try {
        const response = await api.get('/affiliate-alerts/inactive-alerts');
        return response.data || [];
      } catch (err) {
        console.error('Error fetching alerts:', err);
        return [];
      }
    },
    retry: 1,
  });

  if (isLoading) {
    return null;
  }

  if (error || !alerts || alerts.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <AlertTriangle className="h-5 w-5" />
          Inactive Affiliates Alert
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.affiliateId} className="border border-orange-300 bg-white rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-orange-900">{alert.affiliateName}</p>
                  <p className="text-sm text-orange-800 mt-1">No activity in 6 weeks</p>
                  <p className="text-sm text-orange-700 mt-1">
                    Missing: {alert.missingItems.join(', ')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Manager: {alert.managerName}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AffiliateAlerts;
