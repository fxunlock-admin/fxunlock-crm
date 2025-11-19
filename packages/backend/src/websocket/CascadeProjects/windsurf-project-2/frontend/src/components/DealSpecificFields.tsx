import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { DealType, CPATier } from '@/types';

interface DealSpecificFieldsProps {
  dealType: DealType;
  region: string;
  onRegionChange: (region: string) => void;
  country: string;
  onCountryChange: (country: string) => void;
  dealDetails: any;
  onDealDetailsChange: (details: any) => void;
}

const DealSpecificFields: React.FC<DealSpecificFieldsProps> = ({
  dealType,
  dealDetails = {},
  onDealDetailsChange,
}) => {
  // Don't render anything if no deal type selected
  if (!dealType) {
    return null;
  }

  const cpaTiers: CPATier[] = dealDetails?.cpaTiers || [{ tierName: 'Tier 1', depositAmount: 0, cpaAmount: 0 }];

  const addCPATier = () => {
    if (cpaTiers.length < 5) {
      const newTier: CPATier = {
        tierName: `Tier ${cpaTiers.length + 1}`,
        depositAmount: 0,
        cpaAmount: 0,
      };
      onDealDetailsChange({ ...dealDetails, cpaTiers: [...cpaTiers, newTier] });
    }
  };

  const removeCPATier = (index: number) => {
    if (cpaTiers.length > 1) {
      const newTiers = cpaTiers.filter((_, i) => i !== index);
      onDealDetailsChange({ ...dealDetails, cpaTiers: newTiers });
    }
  };

  const updateCPATier = (index: number, field: keyof CPATier, value: string | number) => {
    const newTiers = [...cpaTiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    onDealDetailsChange({ ...dealDetails, cpaTiers: newTiers });
  };

  return (
    <div className="space-y-4 border-t pt-4 mt-4">
      <h3 className="text-lg font-semibold">Deal-Specific Information</h3>
      
      {/* CPA Deal Type */}
      {dealType === 'CPA' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="ftdsPerMonth">FTDs per Month</Label>
            <Input
              id="ftdsPerMonth"
              type="number"
              value={dealDetails?.ftdsPerMonth || ''}
              onChange={(e) => onDealDetailsChange({ ...dealDetails, ftdsPerMonth: Number(e.target.value) })}
              placeholder="Enter FTDs per month"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>CPA Tiers (up to 5)</Label>
              {cpaTiers.length < 5 && (
                <Button type="button" variant="outline" size="sm" onClick={addCPATier}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Tier
                </Button>
              )}
            </div>
            {cpaTiers.map((tier, index) => (
              <div key={index} className="border p-3 rounded-lg space-y-2 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{tier.tierName}</span>
                  {cpaTiers.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCPATier(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Deposit Amount ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={tier.depositAmount}
                      onChange={(e) => updateCPATier(index, 'depositAmount', Number(e.target.value))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">CPA Amount ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={tier.cpaAmount}
                      onChange={(e) => updateCPATier(index, 'cpaAmount', Number(e.target.value))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedROI">Expected ROI (%)</Label>
            <Input
              id="expectedROI"
              type="number"
              step="0.01"
              value={dealDetails?.expectedROI || ''}
              onChange={(e) => onDealDetailsChange({ ...dealDetails, expectedROI: Number(e.target.value) })}
              placeholder="Enter expected ROI"
            />
          </div>
        </>
      )}

      {/* REBATES Deal Type */}
      {dealType === 'REBATES' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="netDepositsPerMonth">Net Deposits per Month ($)</Label>
            <Input
              id="netDepositsPerMonth"
              type="number"
              step="0.01"
              value={dealDetails?.netDepositsPerMonth || ''}
              onChange={(e) => onDealDetailsChange({ ...dealDetails, netDepositsPerMonth: Number(e.target.value) })}
              placeholder="Enter net deposits"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedVolumePerMonth">Expected Volume per Month (Lots)</Label>
            <Input
              id="expectedVolumePerMonth"
              type="number"
              step="0.01"
              value={dealDetails?.expectedVolumePerMonth || ''}
              onChange={(e) => onDealDetailsChange({ ...dealDetails, expectedVolumePerMonth: Number(e.target.value) })}
              placeholder="Enter expected volume"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rebatesPerLot">Rebates $ per Lot</Label>
            <Input
              id="rebatesPerLot"
              type="number"
              step="0.01"
              value={dealDetails?.rebatesPerLot || ''}
              onChange={(e) => onDealDetailsChange({ ...dealDetails, rebatesPerLot: Number(e.target.value) })}
              placeholder="Enter rebates per lot"
            />
          </div>
        </>
      )}

      {/* HYBRID Deal Type */}
      {dealType === 'HYBRID' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="netDepositsPerMonth">Net Deposits per Month ($)</Label>
            <Input
              id="netDepositsPerMonth"
              type="number"
              step="0.01"
              value={dealDetails?.netDepositsPerMonth || ''}
              onChange={(e) => onDealDetailsChange({ ...dealDetails, netDepositsPerMonth: Number(e.target.value) })}
              placeholder="Enter net deposits"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedVolumePerMonth">Expected Volume per Month</Label>
            <Input
              id="expectedVolumePerMonth"
              type="number"
              step="0.01"
              value={dealDetails?.expectedVolumePerMonth || ''}
              onChange={(e) => onDealDetailsChange({ ...dealDetails, expectedVolumePerMonth: Number(e.target.value) })}
              placeholder="Enter expected volume"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>CPA Tiers (up to 5)</Label>
              {cpaTiers.length < 5 && (
                <Button type="button" variant="outline" size="sm" onClick={addCPATier}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Tier
                </Button>
              )}
            </div>
            {cpaTiers.map((tier, index) => (
              <div key={index} className="border p-3 rounded-lg space-y-2 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{tier.tierName}</span>
                  {cpaTiers.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCPATier(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Deposit Amount ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={tier.depositAmount}
                      onChange={(e) => updateCPATier(index, 'depositAmount', Number(e.target.value))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">CPA Amount ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={tier.cpaAmount}
                      onChange={(e) => updateCPATier(index, 'cpaAmount', Number(e.target.value))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rebatesPerLot">Rebates $ per Lot</Label>
            <Input
              id="rebatesPerLot"
              type="number"
              step="0.01"
              value={dealDetails?.rebatesPerLot || ''}
              onChange={(e) => onDealDetailsChange({ ...dealDetails, rebatesPerLot: Number(e.target.value) })}
              placeholder="Enter rebates per lot"
            />
          </div>
        </>
      )}

      {/* PNL Deal Type */}
      {dealType === 'PNL' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="netDepositsPerMonth">Net Deposits per Month ($)</Label>
            <Input
              id="netDepositsPerMonth"
              type="number"
              step="0.01"
              value={dealDetails?.netDepositsPerMonth || ''}
              onChange={(e) => onDealDetailsChange({ ...dealDetails, netDepositsPerMonth: Number(e.target.value) })}
              placeholder="Enter net deposits"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pnlDealNeeded">PnL Deal Needed</Label>
            <Input
              id="pnlDealNeeded"
              value={dealDetails?.pnlDealNeeded || ''}
              onChange={(e) => onDealDetailsChange({ ...dealDetails, pnlDealNeeded: e.target.value })}
              placeholder="Enter PnL deal details"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default DealSpecificFields;
