'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const DEAL_TYPES = ['CPA', 'REBATES', 'HYBRID', 'PNL']
const REGIONS = ['Global', 'Europe', 'Asia', 'North America', 'South America', 'Middle East', 'Africa', 'Australia']
const COMMON_INSTRUMENTS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD',
  'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'AUD/JPY', 'NZD/USD',
  'Gold', 'Silver', 'Oil', 'Natural Gas',
  'BTC/USD', 'ETH/USD', 'XRP/USD',
  'S&P 500', 'NASDAQ', 'DAX', 'FTSE 100', 'Nikkei'
]

export default function NewDealPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dealType: 'REBATES',
    
    // CPA fields
    ftdsPerMonth: '',
    cpaTiers: [{ tierName: 'Tier 1', depositAmount: '', cpaAmount: '' }],
    expectedRoi: '',
    
    // Rebate fields
    netDepositsPerMonth: '',
    expectedVolumeInLots: '',
    rebatePerLot: '',
    
    // PnL fields
    pnlPercentage: '',
    
    // Common fields
    region: 'Global',
    instruments: [] as string[],
    customInstrument: '',
    proofOfStats: null as File | null,
    additionalTerms: '',
    expiresInDays: '30'
  })

  const handleInstrumentToggle = (instrument: string) => {
    if (formData.instruments.includes(instrument)) {
      setFormData({
        ...formData,
        instruments: formData.instruments.filter(i => i !== instrument)
      })
    } else {
      setFormData({
        ...formData,
        instruments: [...formData.instruments, instrument]
      })
    }
  }

  const addCustomInstrument = () => {
    if (formData.customInstrument.trim() && !formData.instruments.includes(formData.customInstrument.trim())) {
      setFormData({
        ...formData,
        instruments: [...formData.instruments, formData.customInstrument.trim()],
        customInstrument: ''
      })
    }
  }

  const removeInstrument = (instrument: string) => {
    setFormData({
      ...formData,
      instruments: formData.instruments.filter(i => i !== instrument)
    })
  }

  const addCpaTier = () => {
    if (formData.cpaTiers.length < 5) {
      setFormData({
        ...formData,
        cpaTiers: [...formData.cpaTiers, { 
          tierName: `Tier ${formData.cpaTiers.length + 1}`, 
          depositAmount: '', 
          cpaAmount: '' 
        }]
      })
    }
  }

  const removeCpaTier = (index: number) => {
    if (formData.cpaTiers.length > 1) {
      setFormData({
        ...formData,
        cpaTiers: formData.cpaTiers.filter((_, i) => i !== index)
      })
    }
  }

  const updateCpaTier = (index: number, field: string, value: string) => {
    const newTiers = [...formData.cpaTiers]
    newTiers[index] = { ...newTiers[index], [field]: value }
    setFormData({ ...formData, cpaTiers: newTiers })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.instruments.length === 0) {
      setError('Please select at least one instrument')
      return
    }

    try {
      setSubmitting(true)
      
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + parseInt(formData.expiresInDays))

      const dealData: any = {
        title: formData.title,
        description: formData.description,
        dealType: formData.dealType,
        region: formData.region,
        instruments: formData.instruments,
        additionalTerms: formData.additionalTerms || undefined,
        expiresAt: expiresAt.toISOString()
      }

      // Add deal-type specific fields
      if (formData.dealType === 'CPA') {
        dealData.ftdsPerMonth = parseInt(formData.ftdsPerMonth)
        dealData.cpaTiers = formData.cpaTiers.map(tier => ({
          tierName: tier.tierName,
          depositAmount: parseFloat(tier.depositAmount),
          cpaAmount: parseFloat(tier.cpaAmount)
        }))
        dealData.expectedRoi = parseFloat(formData.expectedRoi)
      } else if (formData.dealType === 'REBATES') {
        dealData.netDepositsPerMonth = parseFloat(formData.netDepositsPerMonth)
        dealData.expectedVolumeInLots = parseFloat(formData.expectedVolumeInLots)
        dealData.rebatePerLot = parseFloat(formData.rebatePerLot)
      } else if (formData.dealType === 'HYBRID') {
        // Hybrid includes both CPA and Rebate fields
        dealData.ftdsPerMonth = parseInt(formData.ftdsPerMonth)
        dealData.cpaTiers = formData.cpaTiers.map(tier => ({
          tierName: tier.tierName,
          depositAmount: parseFloat(tier.depositAmount),
          cpaAmount: parseFloat(tier.cpaAmount)
        }))
        dealData.netDepositsPerMonth = parseFloat(formData.netDepositsPerMonth)
        dealData.expectedVolumeInLots = parseFloat(formData.expectedVolumeInLots)
        dealData.rebatePerLot = parseFloat(formData.rebatePerLot)
      } else if (formData.dealType === 'PNL') {
        dealData.netDepositsPerMonth = parseFloat(formData.netDepositsPerMonth)
        dealData.pnlPercentage = parseFloat(formData.pnlPercentage)
      }

      // TODO: Handle file upload for proof of stats
      if (formData.proofOfStats) {
        // For now, we'll skip file upload. You can implement S3/Cloudinary later
        // dealData.proofOfStatsUrl = uploadedUrl
      }

      await api.createDeal(dealData)

      router.push('/dashboard/my-deals')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create deal')
    } finally {
      setSubmitting(false)
    }
  }

  const getDealTypeColor = (type: string) => {
    switch (type) {
      case 'CPA': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'REBATES': return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'HYBRID': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'PNL': return 'bg-green-100 text-green-700 border-green-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/my-deals">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create New Deal Request</h1>
          <p className="text-gray-600 mt-2">Post a deal and receive competitive bids from brokers</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Basic Information */}
          <Card className="border-t-4 border-t-purple-600">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Provide the key details about your deal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Deal Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., High-Volume EUR/USD Partnership"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description * ({formData.description.length}/200)</Label>
                <Input
                  id="description"
                  placeholder="Brief description of your network and what you're looking for..."
                  value={formData.description}
                  onChange={(e) => {
                    if (e.target.value.length <= 200) {
                      setFormData({ ...formData, description: e.target.value })
                    }
                  }}
                  maxLength={200}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dealType">Deal Type *</Label>
                  <div className="flex flex-wrap gap-2">
                    {DEAL_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, dealType: type })}
                        className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                          formData.dealType === type
                            ? getDealTypeColor(type) + ' ring-2 ring-offset-2 ring-gray-400'
                            : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Region *</Label>
                  <Select value={formData.region} onValueChange={(value) => setFormData({ ...formData, region: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Terms - CPA */}
          {formData.dealType === 'CPA' && (
            <Card className="border-t-4 border-t-blue-600">
              <CardHeader>
                <CardTitle>CPA Deal Terms</CardTitle>
                <CardDescription>Define your CPA structure and expectations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ftdsPerMonth">FTDs per Month *</Label>
                  <Input
                    id="ftdsPerMonth"
                    type="number"
                    placeholder="e.g., 100"
                    value={formData.ftdsPerMonth}
                    onChange={(e) => setFormData({ ...formData, ftdsPerMonth: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>CPA Tiers (up to 5) *</Label>
                    {formData.cpaTiers.length < 5 && (
                      <Button type="button" onClick={addCpaTier} variant="outline" size="sm">
                        + Add Tier
                      </Button>
                    )}
                  </div>
                  
                  {formData.cpaTiers.map((tier, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{tier.tierName}</span>
                        {formData.cpaTiers.length > 1 && (
                          <Button 
                            type="button" 
                            onClick={() => removeCpaTier(index)} 
                            variant="ghost" 
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor={`depositAmount-${index}`}>Deposit Amount ($)</Label>
                          <Input
                            id={`depositAmount-${index}`}
                            type="number"
                            placeholder="e.g., 250"
                            value={tier.depositAmount}
                            onChange={(e) => updateCpaTier(index, 'depositAmount', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`cpaAmount-${index}`}>CPA Amount ($)</Label>
                          <Input
                            id={`cpaAmount-${index}`}
                            type="number"
                            placeholder="e.g., 500"
                            value={tier.cpaAmount}
                            onChange={(e) => updateCpaTier(index, 'cpaAmount', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedRoi">Expected ROI *</Label>
                  <Input
                    id="expectedRoi"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 1.5"
                    value={formData.expectedRoi}
                    onChange={(e) => setFormData({ ...formData, expectedRoi: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proofOfStats">Proof of Stats (Optional)</Label>
                  <Input
                    id="proofOfStats"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setFormData({ ...formData, proofOfStats: e.target.files?.[0] || null })}
                  />
                  <p className="text-xs text-gray-500">Upload screenshots or documents showing your FTD stats</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Financial Terms - REBATES */}
          {formData.dealType === 'REBATES' && (
            <Card className="border-t-4 border-t-purple-600">
              <CardHeader>
                <CardTitle>Rebate Deal Terms</CardTitle>
                <CardDescription>Define your rebate structure and volume</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="netDepositsPerMonth">Net Deposits per Month ($) *</Label>
                    <Input
                      id="netDepositsPerMonth"
                      type="number"
                      placeholder="e.g., 500000"
                      value={formData.netDepositsPerMonth}
                      onChange={(e) => setFormData({ ...formData, netDepositsPerMonth: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expectedVolumeInLots">Expected Volume per Month (Lots) *</Label>
                    <Input
                      id="expectedVolumeInLots"
                      type="number"
                      placeholder="e.g., 10000"
                      value={formData.expectedVolumeInLots}
                      onChange={(e) => setFormData({ ...formData, expectedVolumeInLots: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rebatePerLot">Rebate $ per Lot Traded *</Label>
                  <Input
                    id="rebatePerLot"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 8.50"
                    value={formData.rebatePerLot}
                    onChange={(e) => setFormData({ ...formData, rebatePerLot: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proofOfStats">Proof of Stats (Optional)</Label>
                  <Input
                    id="proofOfStats"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setFormData({ ...formData, proofOfStats: e.target.files?.[0] || null })}
                  />
                  <p className="text-xs text-gray-500">Upload screenshots or documents showing your trading volume</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Financial Terms - HYBRID */}
          {formData.dealType === 'HYBRID' && (
            <Card className="border-t-4 border-t-orange-600">
              <CardHeader>
                <CardTitle>Hybrid Deal Terms</CardTitle>
                <CardDescription>Combination of CPA and Rebate structures</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* CPA Section */}
                <div className="space-y-4 pb-4 border-b">
                  <h3 className="font-semibold text-sm text-gray-700">CPA Component</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ftdsPerMonth">FTDs per Month *</Label>
                    <Input
                      id="ftdsPerMonth"
                      type="number"
                      placeholder="e.g., 100"
                      value={formData.ftdsPerMonth}
                      onChange={(e) => setFormData({ ...formData, ftdsPerMonth: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>CPA Tiers *</Label>
                      {formData.cpaTiers.length < 5 && (
                        <Button type="button" onClick={addCpaTier} variant="outline" size="sm">
                          + Add Tier
                        </Button>
                      )}
                    </div>
                    
                    {formData.cpaTiers.map((tier, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{tier.tierName}</span>
                          {formData.cpaTiers.length > 1 && (
                            <Button 
                              type="button" 
                              onClick={() => removeCpaTier(index)} 
                              variant="ghost" 
                              size="sm"
                              className="text-red-600"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Deposit Amount ($)</Label>
                            <Input
                              type="number"
                              placeholder="e.g., 250"
                              value={tier.depositAmount}
                              onChange={(e) => updateCpaTier(index, 'depositAmount', e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>CPA Amount ($)</Label>
                            <Input
                              type="number"
                              placeholder="e.g., 500"
                              value={tier.cpaAmount}
                              onChange={(e) => updateCpaTier(index, 'cpaAmount', e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rebate Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-gray-700">Rebate Component</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="netDepositsPerMonth">Net Deposits per Month ($) *</Label>
                      <Input
                        id="netDepositsPerMonth"
                        type="number"
                        placeholder="e.g., 500000"
                        value={formData.netDepositsPerMonth}
                        onChange={(e) => setFormData({ ...formData, netDepositsPerMonth: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expectedVolumeInLots">Expected Volume (Lots) *</Label>
                      <Input
                        id="expectedVolumeInLots"
                        type="number"
                        placeholder="e.g., 10000"
                        value={formData.expectedVolumeInLots}
                        onChange={(e) => setFormData({ ...formData, expectedVolumeInLots: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rebatePerLot">Rebate $ per Lot *</Label>
                    <Input
                      id="rebatePerLot"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 8.50"
                      value={formData.rebatePerLot}
                      onChange={(e) => setFormData({ ...formData, rebatePerLot: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proofOfStats">Proof of Stats (Optional)</Label>
                  <Input
                    id="proofOfStats"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setFormData({ ...formData, proofOfStats: e.target.files?.[0] || null })}
                  />
                  <p className="text-xs text-gray-500">Upload proof of both FTD and volume stats</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Financial Terms - PNL */}
          {formData.dealType === 'PNL' && (
            <Card className="border-t-4 border-t-green-600">
              <CardHeader>
                <CardTitle>PnL Deal Terms</CardTitle>
                <CardDescription>Profit and Loss sharing structure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="netDepositsPerMonth">Net Deposits per Month ($) *</Label>
                    <Input
                      id="netDepositsPerMonth"
                      type="number"
                      placeholder="e.g., 500000"
                      value={formData.netDepositsPerMonth}
                      onChange={(e) => setFormData({ ...formData, netDepositsPerMonth: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pnlPercentage">PnL Deal Needed (%) *</Label>
                    <Input
                      id="pnlPercentage"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 30"
                      value={formData.pnlPercentage}
                      onChange={(e) => setFormData({ ...formData, pnlPercentage: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proofOfStats">Proof of Stats (Optional)</Label>
                  <Input
                    id="proofOfStats"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setFormData({ ...formData, proofOfStats: e.target.files?.[0] || null })}
                  />
                  <p className="text-xs text-gray-500">Upload proof of deposit volumes</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instruments */}
          <Card className="border-t-4 border-t-purple-600">
            <CardHeader>
              <CardTitle>Trading Instruments *</CardTitle>
              <CardDescription>Select the instruments your network trades</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {COMMON_INSTRUMENTS.map((instrument) => (
                  <button
                    key={instrument}
                    type="button"
                    onClick={() => handleInstrumentToggle(instrument)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      formData.instruments.includes(instrument)
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300'
                    }`}
                  >
                    {instrument}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add custom instrument..."
                  value={formData.customInstrument}
                  onChange={(e) => setFormData({ ...formData, customInstrument: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomInstrument())}
                />
                <Button type="button" onClick={addCustomInstrument} variant="outline">
                  Add
                </Button>
              </div>

              {formData.instruments.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Selected Instruments ({formData.instruments.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.instruments.map((instrument) => (
                      <span
                        key={instrument}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2"
                      >
                        {instrument}
                        <button
                          type="button"
                          onClick={() => removeInstrument(instrument)}
                          className="hover:text-purple-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card className="border-t-4 border-t-purple-600">
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
              <CardDescription>Provide any specific requirements or preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="additionalTerms">Requirements & Preferences</Label>
                <Textarea
                  id="additionalTerms"
                  placeholder="e.g., Must have FCA regulation, 24/7 support required, MT5 platform preferred..."
                  rows={4}
                  value={formData.additionalTerms}
                  onChange={(e) => setFormData({ ...formData, additionalTerms: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresInDays">Deal Expires In (days)</Label>
                <Select value={formData.expiresInDays} onValueChange={(value) => setFormData({ ...formData, expiresInDays: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="45">45 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? 'Creating Deal...' : 'Create Deal Request'}
            </Button>
            <Link href="/dashboard/my-deals">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
