'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate, formatVolume } from '@/lib/utils'
import { FileText, TrendingUp } from 'lucide-react'

export default function DealsPage() {
  const user = useAuthStore((state) => state.user)
  const [deals, setDeals] = useState<any[]>([])
  const [allDeals, setAllDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDeal, setSelectedDeal] = useState<any>(null)
  const [bidDialogOpen, setBidDialogOpen] = useState(false)
  const [bidForm, setBidForm] = useState({
    // CPA fields
    offeredCpaTiers: [] as any[],
    offeredLotsToQualifyCpa: '',
    
    // Rebate fields
    offeredRebatePerLot: '',
    
    // PnL fields
    offeredPnlPercentage: '',
    
    // Common fields
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [regionFilter, setRegionFilter] = useState<string>('all')

  useEffect(() => {
    loadDeals()
  }, [])

  const loadDeals = async () => {
    try {
      setLoading(true)
      const data = await api.getDeals()
      setAllDeals(data)
      setDeals(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load deals')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...allDeals]
    
    // Apply deal type filter
    if (activeFilter) {
      filtered = filtered.filter(deal => deal.dealType === activeFilter)
    }
    
    // Apply region filter
    if (regionFilter !== 'all') {
      filtered = filtered.filter(deal => deal.region === regionFilter)
    }
    
    setDeals(filtered)
  }

  const filterByDealType = (dealType: string) => {
    if (activeFilter === dealType) {
      // If clicking the same filter, clear it
      setActiveFilter(null)
    } else {
      // Apply new filter
      setActiveFilter(dealType)
    }
  }

  const handleRegionChange = (value: string) => {
    setRegionFilter(value)
  }

  const getUniqueRegions = () => {
    const regions = new Set(allDeals.map(deal => deal.region))
    return Array.from(regions).sort()
  }

  useEffect(() => {
    applyFilters()
  }, [activeFilter, regionFilter, allDeals])

  const getDealTypeStats = () => {
    const stats: Record<string, number> = {}
    allDeals.forEach(deal => {
      stats[deal.dealType] = (stats[deal.dealType] || 0) + 1
    })
    return stats
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'success'
      case 'IN_NEGOTIATION':
        return 'warning'
      case 'CLOSED':
        return 'secondary'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const getDealTypeColor = (dealType: string) => {
    switch (dealType) {
      case 'CPA':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'REBATES':
        return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'HYBRID':
        return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'PNL':
        return 'bg-green-100 text-green-700 border-green-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const handlePlaceBid = (deal: any) => {
    setSelectedDeal(deal)
    
    // Initialize form based on deal type
    if (deal.dealType === 'CPA' || deal.dealType === 'HYBRID') {
      setBidForm({
        offeredCpaTiers: deal.cpaTiers?.map((tier: any) => ({
          tierName: tier.tierName,
          depositAmount: tier.depositAmount,
          cpaAmount: '' // Broker fills this
        })) || [],
        offeredLotsToQualifyCpa: '',
        offeredRebatePerLot: deal.dealType === 'HYBRID' ? '' : '',
        offeredPnlPercentage: '',
        message: ''
      })
    } else if (deal.dealType === 'REBATES') {
      setBidForm({
        offeredCpaTiers: [],
        offeredLotsToQualifyCpa: '',
        offeredRebatePerLot: '',
        offeredPnlPercentage: '',
        message: ''
      })
    } else if (deal.dealType === 'PNL') {
      setBidForm({
        offeredCpaTiers: [],
        offeredLotsToQualifyCpa: '',
        offeredRebatePerLot: '',
        offeredPnlPercentage: '',
        message: ''
      })
    }
    
    setBidDialogOpen(true)
  }

  const updateCpaTierBid = (index: number, cpaAmount: string) => {
    const newTiers = [...bidForm.offeredCpaTiers]
    newTiers[index] = { ...newTiers[index], cpaAmount }
    setBidForm({ ...bidForm, offeredCpaTiers: newTiers })
  }

  const handleSubmitBid = async () => {
    if (!selectedDeal) return

    try {
      setSubmitting(true)
      
      const bidData: any = {
        dealRequestId: selectedDeal.id,
        message: bidForm.message || undefined
      }

      // Add deal-type specific fields
      if (selectedDeal.dealType === 'CPA') {
        bidData.offeredCpaTiers = bidForm.offeredCpaTiers.map(tier => ({
          tierName: tier.tierName,
          depositAmount: parseFloat(tier.depositAmount),
          cpaAmount: parseFloat(tier.cpaAmount)
        }))
        bidData.offeredLotsToQualifyCpa = parseFloat(bidForm.offeredLotsToQualifyCpa)
      } else if (selectedDeal.dealType === 'REBATES') {
        bidData.offeredRebatePerLot = parseFloat(bidForm.offeredRebatePerLot)
      } else if (selectedDeal.dealType === 'HYBRID') {
        bidData.offeredCpaTiers = bidForm.offeredCpaTiers.map(tier => ({
          tierName: tier.tierName,
          depositAmount: parseFloat(tier.depositAmount),
          cpaAmount: parseFloat(tier.cpaAmount)
        }))
        bidData.offeredLotsToQualifyCpa = parseFloat(bidForm.offeredLotsToQualifyCpa)
        bidData.offeredRebatePerLot = parseFloat(bidForm.offeredRebatePerLot)
      } else if (selectedDeal.dealType === 'PNL') {
        bidData.offeredPnlPercentage = parseFloat(bidForm.offeredPnlPercentage)
      }

      await api.createBid(bidData)
      
      setBidDialogOpen(false)
      setSelectedDeal(null)
      setBidForm({ offeredCpaTiers: [], offeredLotsToQualifyCpa: '', offeredRebatePerLot: '', offeredPnlPercentage: '', message: '' })
      
      alert('Bid placed successfully!')
      loadDeals()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to place bid')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading deals...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error}</p>
            <Button onClick={loadDeals} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const dealTypeStats = getDealTypeStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {user?.role === 'BROKER' ? 'Browse Deals' : 'All Deals'}
          </h1>
          <p className="text-gray-600 mt-2">
            {user?.role === 'BROKER' 
              ? 'Find and bid on available deal requests' 
              : 'View all deal requests in the system'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Label className="text-sm font-semibold">Filter by Region:</Label>
          <Select value={regionFilter} onValueChange={handleRegionChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {getUniqueRegions().map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(activeFilter || regionFilter !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveFilter(null)
                setRegionFilter('all')
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Deal Type Filters */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveFilter(null)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeFilter === null
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Types ({allDeals.length})
          </button>
        <button
          onClick={() => filterByDealType('CPA')}
          className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
            activeFilter === 'CPA'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'
          }`}
        >
          CPA ({dealTypeStats['CPA'] || 0})
        </button>
        <button
          onClick={() => filterByDealType('REBATES')}
          className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
            activeFilter === 'REBATES'
              ? 'bg-purple-600 text-white border-purple-600 shadow-md'
              : 'bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100'
          }`}
        >
          REBATES ({dealTypeStats['REBATES'] || 0})
        </button>
        <button
          onClick={() => filterByDealType('HYBRID')}
          className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
            activeFilter === 'HYBRID'
              ? 'bg-orange-600 text-white border-orange-600 shadow-md'
              : 'bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100'
          }`}
        >
          HYBRID ({dealTypeStats['HYBRID'] || 0})
        </button>
        <button
          onClick={() => filterByDealType('PNL')}
          className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
            activeFilter === 'PNL'
              ? 'bg-green-600 text-white border-green-600 shadow-md'
              : 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
          }`}
        >
          PNL ({dealTypeStats['PNL'] || 0})
        </button>
        </div>
      </div>

      {deals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {activeFilter ? `No ${activeFilter} deals found` : 'No deals available'}
            </h3>
            <p className="text-gray-600 text-center">
              {activeFilter 
                ? `There are no ${activeFilter} deals at the moment. Try a different filter.`
                : user?.role === 'BROKER' 
                  ? 'There are no open deals at the moment. Check back later!' 
                  : 'No deals have been created yet.'}
            </p>
            {activeFilter && (
              <Button 
                onClick={() => {
                  setActiveFilter(null)
                  setDeals(allDeals)
                }}
                className="mt-4"
                variant="outline"
              >
                Clear Filter
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {deals.map((deal) => (
            <Card key={deal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{deal.title}</CardTitle>
                      <Badge variant={getStatusColor(deal.status) as any}>
                        {deal.status.replace('_', ' ')}
                      </Badge>
                      <button
                        onClick={() => filterByDealType(deal.dealType)}
                        className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border transition-all hover:scale-105 ${getDealTypeColor(deal.dealType)} ${
                          activeFilter === deal.dealType ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                        }`}
                        title={`Filter by ${deal.dealType} deals`}
                      >
                        {deal.dealType}
                      </button>
                    </div>
                    <CardDescription>{deal.description}</CardDescription>
                  </div>
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* CPA Deal Type */}
                  {deal.dealType === 'CPA' && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">FTDs per Month</p>
                        <p className="font-semibold">{deal.ftdsPerMonth || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">CPA Tiers</p>
                        <p className="font-semibold">{deal.cpaTiers?.length || 0} tiers</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Lots to Qualify</p>
                        <p className="font-semibold">{deal.lotsToQualifyCpa || 'N/A'} lots</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Expected ROI</p>
                        <p className="font-semibold">{deal.expectedRoi || 'N/A'}</p>
                      </div>
                    </>
                  )}

                  {/* REBATES Deal Type */}
                  {deal.dealType === 'REBATES' && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Net Deposits/Month</p>
                        <p className="font-semibold">${(deal.netDepositsPerMonth || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Volume (Lots)</p>
                        <p className="font-semibold">{(deal.expectedVolumeInLots || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Rebate per Lot</p>
                        <p className="font-semibold">${deal.rebatePerLot || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Region</p>
                        <p className="font-semibold">{deal.region || 'Global'}</p>
                      </div>
                    </>
                  )}

                  {/* HYBRID Deal Type */}
                  {deal.dealType === 'HYBRID' && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">FTDs/Month</p>
                        <p className="font-semibold">{deal.ftdsPerMonth || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Lots to Qualify CPA</p>
                        <p className="font-semibold">{deal.lotsToQualifyCpa || 'N/A'} lots</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Volume (Lots)</p>
                        <p className="font-semibold">{(deal.expectedVolumeInLots || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Rebate per Lot</p>
                        <p className="font-semibold">${deal.rebatePerLot || 'N/A'}</p>
                      </div>
                    </>
                  )}

                  {/* PNL Deal Type */}
                  {deal.dealType === 'PNL' && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Net Deposits/Month</p>
                        <p className="font-semibold">${(deal.netDepositsPerMonth || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">PnL Share</p>
                        <p className="font-semibold">{deal.pnlPercentage || 'N/A'}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Region</p>
                        <p className="font-semibold">{deal.region || 'Global'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Posted</p>
                        <p className="font-semibold">{formatDate(deal.createdAt)}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Show CPA Tier Details for CPA and HYBRID */}
                {(deal.dealType === 'CPA' || deal.dealType === 'HYBRID') && deal.cpaTiers && deal.cpaTiers.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-semibold text-blue-900 mb-2">CPA Tier Structure:</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {deal.cpaTiers.map((tier: any, idx: number) => (
                        <div key={idx} className="bg-white p-2 rounded border border-blue-200">
                          <p className="font-semibold text-blue-700">{tier.tierName}</p>
                          <p className="text-gray-600">Deposit: ${tier.depositAmount}</p>
                          <p className="text-gray-600">CPA: ${tier.cpaAmount}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {deal.instruments && deal.instruments.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Instruments</p>
                    <div className="flex flex-wrap gap-2">
                      {deal.instruments.map((instrument: string, idx: number) => (
                        <Badge key={idx} variant="outline">
                          {instrument}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {deal.requirements && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Requirements</p>
                    <p className="text-sm text-gray-700">{deal.requirements}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Posted on {formatDate(deal.createdAt)}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-500">
                      {deal._count?.bids || 0} bid(s)
                    </div>
                    {user?.role === 'BROKER' && deal.status === 'OPEN' && (
                      <Button onClick={() => handlePlaceBid(deal)}>Place Bid</Button>
                    )}
                    {user?.role === 'ADMIN' && (
                      <Button variant="outline">View Details</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Bid Placement Dialog */}
      <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Place Your Bid - {selectedDeal?.dealType} Deal</DialogTitle>
            <DialogDescription>
              {selectedDeal?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* CPA Deal Type */}
            {selectedDeal?.dealType === 'CPA' && (
              <>
                <div className="bg-blue-50 p-3 rounded-lg text-sm mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">FTDs per Month:</span>
                    <span className="font-semibold">{selectedDeal?.ftdsPerMonth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lots to Qualify CPA:</span>
                    <span className="font-semibold">{selectedDeal?.lotsToQualifyCpa} lots</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Your CPA Offer *</Label>
                  <p className="text-sm text-gray-600">Provide your CPA rates for each tier</p>
                  {bidForm.offeredCpaTiers.map((tier, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-blue-900">{tier.tierName}</span>
                        <span className="text-sm text-gray-600">Deposit: ${tier.depositAmount}</span>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`cpa-${index}`}>Your CPA Amount ($) *</Label>
                        <Input
                          id={`cpa-${index}`}
                          type="number"
                          step="0.01"
                          placeholder="e.g., 450"
                          value={tier.cpaAmount}
                          onChange={(e) => updateCpaTierBid(index, e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-3 border-t">
                  <Label htmlFor="offeredLotsToQualifyCpa">
                    Your Lots to Qualify Requirement *
                    <span className="text-sm text-gray-500 ml-2">
                      (Requested: {selectedDeal?.lotsToQualifyCpa} lots)
                    </span>
                  </Label>
                  <Input
                    id="offeredLotsToQualifyCpa"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 5.0"
                    value={bidForm.offeredLotsToQualifyCpa}
                    onChange={(e) => setBidForm({ ...bidForm, offeredLotsToQualifyCpa: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500">Minimum lots a trader must trade to qualify for your CPA offer</p>
                </div>
              </>
            )}

            {/* REBATES Deal Type */}
            {selectedDeal?.dealType === 'REBATES' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="offeredRebatePerLot">
                    Your Rebate per Lot ($) *
                    <span className="text-sm text-gray-500 ml-2">
                      (Requested: ${selectedDeal?.rebatePerLot}/lot)
                    </span>
                  </Label>
                  <Input
                    id="offeredRebatePerLot"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 8.00"
                    value={bidForm.offeredRebatePerLot}
                    onChange={(e) => setBidForm({ ...bidForm, offeredRebatePerLot: e.target.value })}
                    required
                  />
                </div>
                <div className="bg-purple-50 p-3 rounded-lg text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Expected Volume:</span>
                    <span className="font-semibold">{selectedDeal?.expectedVolumeInLots?.toLocaleString()} lots</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Net Deposits/Month:</span>
                    <span className="font-semibold">${selectedDeal?.netDepositsPerMonth?.toLocaleString()}</span>
                  </div>
                </div>
              </>
            )}

            {/* HYBRID Deal Type */}
            {selectedDeal?.dealType === 'HYBRID' && (
              <>
                <div className="bg-orange-50 p-3 rounded-lg text-sm mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">FTDs per Month:</span>
                    <span className="font-semibold">{selectedDeal?.ftdsPerMonth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lots to Qualify CPA:</span>
                    <span className="font-semibold">{selectedDeal?.lotsToQualifyCpa} lots</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-semibold">CPA Component *</Label>
                  {bidForm.offeredCpaTiers.map((tier, index) => (
                    <div key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-orange-900">{tier.tierName}</span>
                        <span className="text-sm text-gray-600">Deposit: ${tier.depositAmount}</span>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`cpa-${index}`}>Your CPA Amount ($) *</Label>
                        <Input
                          id={`cpa-${index}`}
                          type="number"
                          step="0.01"
                          placeholder="e.g., 450"
                          value={tier.cpaAmount}
                          onChange={(e) => updateCpaTierBid(index, e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-3 border-t">
                  <Label htmlFor="offeredLotsToQualifyCpa">
                    Your Lots to Qualify Requirement *
                    <span className="text-sm text-gray-500 ml-2">
                      (Requested: {selectedDeal?.lotsToQualifyCpa} lots)
                    </span>
                  </Label>
                  <Input
                    id="offeredLotsToQualifyCpa"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 5.0"
                    value={bidForm.offeredLotsToQualifyCpa}
                    onChange={(e) => setBidForm({ ...bidForm, offeredLotsToQualifyCpa: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500">Minimum lots a trader must trade to qualify for your CPA offer</p>
                </div>
                
                <div className="space-y-2 pt-3 border-t">
                  <Label className="text-base font-semibold">Rebate Component *</Label>
                  <Label htmlFor="offeredRebatePerLot">
                    Your Rebate per Lot ($) *
                    <span className="text-sm text-gray-500 ml-2">
                      (Requested: ${selectedDeal?.rebatePerLot}/lot)
                    </span>
                  </Label>
                  <Input
                    id="offeredRebatePerLot"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 7.00"
                    value={bidForm.offeredRebatePerLot}
                    onChange={(e) => setBidForm({ ...bidForm, offeredRebatePerLot: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

            {/* PNL Deal Type */}
            {selectedDeal?.dealType === 'PNL' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="offeredPnlPercentage">
                    Your PnL Share (%) *
                    <span className="text-sm text-gray-500 ml-2">
                      (Requested: {selectedDeal?.pnlPercentage}%)
                    </span>
                  </Label>
                  <Input
                    id="offeredPnlPercentage"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 35"
                    value={bidForm.offeredPnlPercentage}
                    onChange={(e) => setBidForm({ ...bidForm, offeredPnlPercentage: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500">The percentage of profits you'll share with the affiliate</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Net Deposits/Month:</span>
                    <span className="font-semibold">${selectedDeal?.netDepositsPerMonth?.toLocaleString()}</span>
                  </div>
                </div>
              </>
            )}

            {/* Common Message Field */}
            <div className="space-y-2 pt-3 border-t">
              <Label htmlFor="message">Additional Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add any additional details about your offer..."
                rows={3}
                value={bidForm.message}
                onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
              />
            </div>

            {/* Deal Summary */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Region:</span>
                <span className="font-semibold">{selectedDeal?.region}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Instruments:</span>
                <span className="font-semibold">{selectedDeal?.instruments?.length || 0} selected</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBidDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitBid}
              disabled={
                submitting || 
                (selectedDeal?.dealType === 'CPA' && (bidForm.offeredCpaTiers.some(t => !t.cpaAmount) || !bidForm.offeredLotsToQualifyCpa)) ||
                (selectedDeal?.dealType === 'REBATES' && !bidForm.offeredRebatePerLot) ||
                (selectedDeal?.dealType === 'HYBRID' && (bidForm.offeredCpaTiers.some(t => !t.cpaAmount) || !bidForm.offeredLotsToQualifyCpa || !bidForm.offeredRebatePerLot)) ||
                (selectedDeal?.dealType === 'PNL' && !bidForm.offeredPnlPercentage)
              }
            >
              {submitting ? 'Submitting...' : 'Submit Bid'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
